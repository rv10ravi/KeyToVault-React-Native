import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";

const fileUri = FileSystem.documentDirectory + "idCards.json";

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
    if (decryptionKey === selectedCard.encryptionKey) {
      const encryptedCardNumber = CryptoJS.AES.encrypt(
        decryptedCardNumber,
        decryptionKey
      ).toString();
      const updatedCards = idCards.map((card) =>
        card.id === selectedCard.id
          ? { ...card, number: encryptedCardNumber }
          : card
      );
      setIdCards(updatedCards);
      saveData(updatedCards);
    }
    setShowDecryptionModal(false);
    setDecryptionKey("");
    setDecryptedCardNumber("");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {idCards.map((card) => (
          <View key={card.id} style={styles.card}>
            <Text style={styles.cardType}>{card.type}</Text>
            <Text style={styles.cardInfo}>Card Number: {card.number}</Text>
            <Text style={styles.cardInfo}>Issue Date: {card.issueDate}</Text>
            <Text style={styles.cardInfo}>Expiry Date: {card.expiry}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleView(card)}
              >
                <Text style={styles.actionButtonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCard(card.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Identity Card Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Identity Card Type (e.g., Aadhar, Passport)"
            value={cardType}
            onChangeText={(text) => setCardType(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Identity Card Number"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Issue Date"
            value={issueDate}
            onChangeText={(text) => setIssueDate(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry Date"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(text)}
          />
          {showEncryptionKey && (
            <View style={styles.encryptionKeyContainer}>
              <Text style={styles.encryptionKeyText}>
                Encryption Key: {encryptionKey}
              </Text>
              <Button title="Copy Key" onPress={handleCopyKey} />
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button title="Encrypt" onPress={handleEncrypt} color="#007bff" />
            <Button
              title="Add Identity Card"
              onPress={handleAddCard}
              color="#28a745"
            />
            <Button
              title="Cancel"
              onPress={() => setShowModal(false)}
              color="#dc3545"
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showDecryptionModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter Decryption Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Decryption Key"
            value={decryptionKey}
            onChangeText={(text) => setDecryptionKey(text)}
          />
          <Button title="Decrypt" onPress={handleDecrypt} color="#007bff" />
          <Text style={styles.decryptedCardNumber}>{decryptedCardNumber}</Text>
          <Button
            title="Close"
            onPress={handleCloseDecryptionModal}
            color="#dc3545"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 50,
  },
  scrollView: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: "#ffffff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  encryptionKeyContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  encryptionKeyText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#007bff",
  },
  decryptedCardNumber: {
    fontSize: 18,
    color: "#007bff",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default IdentitiesScreen;
