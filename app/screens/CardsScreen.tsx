import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import * as FileSystem from "expo-file-system";
import CryptoJS from "crypto-js";
import * as Clipboard from "expo-clipboard";

const fileUri = FileSystem.documentDirectory + "cards.json";

const CardsScreen = () => {
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showDecryptionModal, setShowDecryptionModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decryptedCardNumber, setDecryptedCardNumber] = useState("");
  const [decryptedExpiryDate, setDecryptedExpiryDate] = useState("");
  const [decryptedCvv, setDecryptedCvv] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileData = await FileSystem.readAsStringAsync(fileUri);
        setCards(JSON.parse(fileData));
      }
    } catch (error) {
      console.log("Error loading data:", error);
    }
  };

  const saveData = async (data) => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
    } catch (error) {
      console.log("Error saving data:", error);
    }
  };

  const handleEncrypt = () => {
    if (!cardNumber || !expiryDate || !cvv) {
      Alert.alert(
        "Input Error",
        "Please fill in all card details before encrypting."
      );
      return;
    }

    const key = CryptoJS.lib.WordArray.random(32).toString();
    setEncryptionKey(key);
    const encryptedCardNumber = CryptoJS.AES.encrypt(
      cardNumber,
      key
    ).toString();
    const encryptedExpiryDate = CryptoJS.AES.encrypt(
      expiryDate,
      key
    ).toString();
    const encryptedCvv = CryptoJS.AES.encrypt(cvv, key).toString();

    setCardNumber(encryptedCardNumber);
    setExpiryDate(encryptedExpiryDate);
    setCvv(encryptedCvv);

    setShowEncryptionKey(true);
  };

  const handleDecrypt = () => {
    try {
      const decryptedCardBytes = CryptoJS.AES.decrypt(
        selectedCard.cardNumber,
        decryptionKey
      );
      const decryptedExpiryBytes = CryptoJS.AES.decrypt(
        selectedCard.expiryDate,
        decryptionKey
      );
      const decryptedCvvBytes = CryptoJS.AES.decrypt(
        selectedCard.cvv,
        decryptionKey
      );

      const decryptedCardNumber = decryptedCardBytes.toString(
        CryptoJS.enc.Utf8
      );
      const decryptedExpiryDate = decryptedExpiryBytes.toString(
        CryptoJS.enc.Utf8
      );
      const decryptedCvv = decryptedCvvBytes.toString(CryptoJS.enc.Utf8);

      if (decryptedCardNumber && decryptedExpiryDate && decryptedCvv) {
        setDecryptedCardNumber(decryptedCardNumber);
        setDecryptedExpiryDate(decryptedExpiryDate);
        setDecryptedCvv(decryptedCvv);
      } else {
        Alert.alert("Decryption Error", "Invalid decryption key.");
      }
    } catch (error) {
      Alert.alert("Decryption Error", "Failed to decrypt the card details.");
    }
  };

  const handleSave = () => {
    if (!encryptionKey) {
      Alert.alert(
        "Encryption Error",
        "Please encrypt the card details before saving."
      );
      return;
    }

    const newCard = {
      id: Date.now(),
      name,
      bankName,
      cardType,
      cardNumber,
      expiryDate,
      cvv,
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    saveData(updatedCards);
    setShowModal(false);
    setName("");
    setBankName("");
    setCardType("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setEncryptionKey("");
    setShowEncryptionKey(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this card?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedCards = cards.filter((card) => card.id !== id);
            setCards(updatedCards);
            saveData(updatedCards);
          },
        },
      ]
    );
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleView = (card) => {
    setSelectedCard(card);
    setShowDecryptionModal(true);
  };

  const handleCloseDecryptionModal = () => {
    setShowDecryptionModal(false);
    setDecryptionKey("");
    setDecryptedCardNumber("");
    setDecryptedExpiryDate("");
    setDecryptedCvv("");
  };

  const handleCopyKey = () => {
    Clipboard.setString(encryptionKey);
    Alert.alert("Key Copied", "Encryption key has been copied to clipboard.");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/img2.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {cards.map((card) => (
            <View key={card.id} style={styles.card}>
              <Text style={styles.cardTitle}>{card.name}</Text>
              <Text style={styles.cardText}>Bank: {card.bankName}</Text>
              <Text style={styles.cardText}>Type: {card.cardType}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleView(card)}
                  style={styles.viewButton}
                >
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(card.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.floatingButton} onPress={handleAdd}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        {/* Add Card Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Add New Card</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#ccc"
                  value={name}
                  onChangeText={(text) => setName(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bank Name"
                  placeholderTextColor="#ccc"
                  value={bankName}
                  onChangeText={(text) => setBankName(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Card Type (Credit/Debit)"
                  placeholderTextColor="#ccc"
                  value={cardType}
                  onChangeText={(text) => setCardType(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  placeholderTextColor="#ccc"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(text)}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Expiry Date (MM/YY)"
                  placeholderTextColor="#ccc"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(text)}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  placeholderTextColor="#ccc"
                  value={cvv}
                  onChangeText={(text) => setCvv(text)}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={3}
                />

                <TouchableOpacity
                  onPress={handleEncrypt}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Encrypt</Text>
                </TouchableOpacity>

                {showEncryptionKey && (
                  <View style={styles.keyContainer}>
                    <Text style={styles.keyText}>Encryption Key:</Text>
                    <Text style={styles.keyValue}>{encryptionKey}</Text>
                    <TouchableOpacity
                      onPress={handleCopyKey}
                      style={styles.copyButton}
                    >
                      <Text style={styles.copyButtonText}>Copy Key</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Decrypt Card Modal */}
        <Modal visible={showDecryptionModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Decrypt Card</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Decryption Key"
                  placeholderTextColor="#ccc"
                  value={decryptionKey}
                  onChangeText={(text) => setDecryptionKey(text)}
                  secureTextEntry
                />
                <TouchableOpacity
                  onPress={handleDecrypt}
                  style={styles.modalButton}
                >
                  <Text style={styles.modalButtonText}>Decrypt</Text>
                </TouchableOpacity>

                {decryptedCardNumber !== "" && (
                  <View style={styles.decryptedContainer}>
                    <Text style={styles.decryptedText}>
                      Card Number: {decryptedCardNumber}
                    </Text>
                    <Text style={styles.decryptedText}>
                      Expiry Date: {decryptedExpiryDate}
                    </Text>
                    <Text style={styles.decryptedText}>
                      CVV: {decryptedCvv}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleCloseDecryptionModal}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scrollView: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 5,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  viewButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#FF4500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingButton: {
    backgroundColor: "#00FF00",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    right: 30,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF4500",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  keyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  keyText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  keyValue: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  copyButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  decryptedContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  decryptedText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
});

export default CardsScreen;
