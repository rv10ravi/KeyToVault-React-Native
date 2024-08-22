import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";

const fileUri = FileSystem.documentDirectory + "idCards.json";
const backgroundImage = require("../../assets/images/img2.jpg");

const IdentitiesScreen = () => {
  const [idCards, setIdCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showDecryptionModal, setShowDecryptionModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decryptedCardNumber, setDecryptedCardNumber] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileData = await FileSystem.readAsStringAsync(fileUri);
        setIdCards(JSON.parse(fileData));
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
    const key = CryptoJS.lib.WordArray.random(32).toString();
    setEncryptionKey(key);
    const encryptedCardNumber = CryptoJS.AES.encrypt(
      cardNumber,
      key
    ).toString();
    setCardNumber(encryptedCardNumber);
    setShowEncryptionKey(true);
  };

  const handleDecrypt = () => {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(
        selectedCard.number,
        decryptionKey
      );
      const decryptedCardNumber = decryptedBytes.toString(CryptoJS.enc.Utf8);
      if (decryptedCardNumber) {
        setDecryptedCardNumber(decryptedCardNumber);
        setShowDecryptionModal(true);
      } else {
        Alert.alert("Decryption Error", "Invalid decryption key.");
      }
    } catch (error) {
      Alert.alert("Decryption Error", "Failed to decrypt the card number.");
    }
  };

  const handleAddCard = () => {
    if (!encryptionKey) {
      Alert.alert(
        "Encryption Error",
        "Please encrypt the card number before saving."
      );
      return;
    }
    if (
      cardType.trim() !== "" &&
      cardNumber.trim() !== "" &&
      expiryDate.trim() !== "" &&
      issueDate.trim() !== ""
    ) {
      const newCard = {
        id: Date.now(),
        type: cardType,
        number: cardNumber,
        expiry: expiryDate,
        issueDate: issueDate,
        encryptionKey: encryptionKey,
      };
      const updatedCards = [...idCards, newCard];
      setIdCards(updatedCards);
      saveData(updatedCards);
      setCardType("");
      setCardNumber("");
      setExpiryDate("");
      setIssueDate("");
      setEncryptionKey("");
      setShowEncryptionKey(false);
      setShowModal(false);
    } else {
      Alert.alert("Input Error", "Please enter all details.");
    }
  };

  const handleCopyKey = () => {
    Clipboard.setString(encryptionKey);
    Alert.alert(
      "Copied to Clipboard",
      "The encryption key has been copied to the clipboard."
    );
  };

  const handleDeleteCard = (id) => {
    const updatedCards = idCards.filter((card) => card.id !== id);
    setIdCards(updatedCards);
    saveData(updatedCards);
  };

  const handleView = (card) => {
    setSelectedCard(card);
    setShowDecryptionModal(true);
  };

  const handleCloseDecryptionModal = () => {
    setShowDecryptionModal(false);
    setDecryptionKey("");
    setDecryptedCardNumber("");
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {idCards.map((card) => (
            <View key={card.id} style={styles.card}>
              <Text style={styles.cardTitle}>{card.type}</Text>
              <Text style={styles.cardText}>Number: {card.number}</Text>
              <Text style={styles.cardText}>Expiry: {card.expiry}</Text>
              <Text style={styles.cardText}>Issue Date: {card.issueDate}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleView(card)}
                  style={styles.viewButton}
                >
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteCard(card.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        {/* Add Card Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Add New ID Card</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Card Type"
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
                />
                <TextInput
                  style={styles.input}
                  placeholder="Expiry Date"
                  placeholderTextColor="#ccc"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Issue Date"
                  placeholderTextColor="#ccc"
                  value={issueDate}
                  onChangeText={(text) => setIssueDate(text)}
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
                  onPress={handleAddCard}
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
  },
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  scrollView: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardText: {
    fontSize: 16,
    color: "#555",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007BFF",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  keyContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  keyText: {
    fontSize: 16,
    color: "#333",
  },
  keyValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
    marginVertical: 5,
  },
  copyButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  copyButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  decryptedContainer: {
    marginTop: 20,
  },
  decryptedText: {
    fontSize: 16,
    color: "#333",
  },
});

export default IdentitiesScreen;
