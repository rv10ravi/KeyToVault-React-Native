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
} from "react-native";
import * as FileSystem from 'expo-file-system';

const fileUri = FileSystem.documentDirectory + 'idCards.json';

const IdentitiesScreen = () => {
  const [idCards, setIdCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [issueDate, setIssueDate] = useState("");

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
      console.log('Error loading data:', error);
    }
  };

  const saveData = async (data) => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const handleAddCard = () => {
    if (cardType.trim() !== "" && cardNumber.trim() !== "" && expiryDate.trim() !== "" && issueDate.trim() !== "") {
      const newCard = {
        id: Date.now(),
        type: cardType,
        number: cardNumber,
        expiry: expiryDate,
        issueDate: issueDate,
      };
      const updatedCards = [...idCards, newCard];
      setIdCards(updatedCards);
      saveData(updatedCards);
      setCardType("");
      setCardNumber("");
      setExpiryDate("");
      setIssueDate("");
      setShowModal(false);
    } else {
      alert("Please enter all details.");
    }
  };

  const handleDeleteCard = (id) => {
    const updatedCards = idCards.filter((card) => card.id !== id);
    setIdCards(updatedCards);
    saveData(updatedCards);
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
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCard(card.id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>Add Identity Card</Text>
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
          <View style={styles.buttonContainer}>
            <Button title="Add Identity Card" onPress={handleAddCard} />
            <Button title="Cancel" onPress={() => setShowModal(false)} color="#ff6347" />
          </View>
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
    marginTop: 30,
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
    color: "#4682b4",
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 16,
    color: "#696969",
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: "#ff6347",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4682b4",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#f0f8ff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4682b4",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});

export default IdentitiesScreen;
