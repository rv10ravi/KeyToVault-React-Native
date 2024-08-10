import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Alert,
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
        setShowDecryptionModal(true);
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
      encryptionKey,
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
    const updatedCards = cards.filter((card) => card.id !== id);
    setCards(updatedCards);
    saveData(updatedCards);
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleView = (card) => {
    setSelectedCard(card);
    setShowDecryptionModal(true);
  };

  const handleCloseDecryptionModal = () => {
    if (decryptionKey === selectedCard.encryptionKey) {
      const encryptedCardNumber = CryptoJS.AES.encrypt(
        decryptedCardNumber,
        decryptionKey
      ).toString();
      const encryptedExpiryDate = CryptoJS.AES.encrypt(
        decryptedExpiryDate,
        decryptionKey
      ).toString();
      const encryptedCvv = CryptoJS.AES.encrypt(
        decryptedCvv,
        decryptionKey
      ).toString();

      const updatedCards = cards.map((card) =>
        card.id === selectedCard.id
          ? {
              ...card,
              cardNumber: encryptedCardNumber,
              expiryDate: encryptedExpiryDate,
              cvv: encryptedCvv,
            }
          : card
      );

      setCards(updatedCards);
      saveData(updatedCards);
    }
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            <Text style={styles.cardTitle}>{card.name}</Text>
            <Text style={styles.cardText}>Bank: {card.bankName}</Text>
            <Text style={styles.cardText}>Type: {card.cardType}</Text>
            <Text style={styles.cardText}>Number: {card.cardNumber}</Text>
            <Text style={styles.cardText}>Expiry: {card.expiryDate}</Text>
            <Text style={styles.cardText}>CVV: {card.cvv}</Text>
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

      <TouchableHighlight style={styles.floatingButton} onPress={handleAdd}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableHighlight>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={bankName}
            onChangeText={(text) => setBankName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Card Type (Credit/Debit)"
            value={cardType}
            onChangeText={(text) => setCardType(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry Date (MM/YY)"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            value={cvv}
            onChangeText={(text) => setCvv(text)}
            keyboardType="numeric"
            secureTextEntry
          />
          {showEncryptionKey && (
            <View style={styles.encryptionKeyContainer}>
              <Text style={styles.encryptionKeyText}>
                Encryption Key: {encryptionKey}
              </Text>
              <Button title="Copy Key" onPress={handleCopyKey} />
            </View>
          )}
          <View style={styles.modalActions}>
            <Button title="Encrypt" onPress={handleEncrypt} />
            <Button title="Save" onPress={handleSave} />
            <Button title="Cancel" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={showDecryptionModal} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Decryption Key"
            value={decryptionKey}
            onChangeText={(text) => setDecryptionKey(text)}
          />
          <Button title="Decrypt" onPress={handleDecrypt} />
          {decryptedCardNumber && (
            <View>
              <Text style={styles.cardText}>
                Card Number: {decryptedCardNumber}
              </Text>
              <Text style={styles.cardText}>
                Expiry Date: {decryptedExpiryDate}
              </Text>
              <Text style={styles.cardText}>CVV: {decryptedCvv}</Text>
            </View>
          )}
          <View style={styles.modalActions}>
            <Button title="Close" onPress={handleCloseDecryptionModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    marginTop: 50,
  },
  scrollView: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  viewButton: {
    backgroundColor: "#4caf50",
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  encryptionKeyContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  encryptionKeyText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default CardsScreen;
