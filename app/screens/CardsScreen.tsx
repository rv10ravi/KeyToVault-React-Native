import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';
import * as Clipboard from 'expo-clipboard'; 

const fileUri = FileSystem.documentDirectory + 'cards.json';

const CardsScreen = () => {
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showDecryptionModal, setShowDecryptionModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [decryptedCardNumber, setDecryptedCardNumber] = useState('');

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

  const handleEncrypt = () => {
    const key = CryptoJS.lib.WordArray.random(32).toString();
    setEncryptionKey(key);
    const encryptedCardNumber = CryptoJS.AES.encrypt(cardNumber, key).toString();
    setCardNumber(encryptedCardNumber);
    setShowEncryptionKey(true);
  };

  const handleDecrypt = () => {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(selectedCard.cardNumber, decryptionKey);
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

  const handleSave = () => {
    if (!encryptionKey) {
      Alert.alert("Encryption Error", "Please encrypt the card number before saving.");
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
    setName('');
    setBankName('');
    setCardType('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setEncryptionKey('');
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
      const encryptedCardNumber = CryptoJS.AES.encrypt(decryptedCardNumber, decryptionKey).toString();
      const updatedCards = cards.map((card) =>
        card.id === selectedCard.id ? { ...card, cardNumber: encryptedCardNumber } : card
      );
      setCards(updatedCards);
      saveData(updatedCards);
    }
    setShowDecryptionModal(false);
    setDecryptionKey('');
    setDecryptedCardNumber('');
  };

  const handleCopyKey = () => {
    Clipboard.setString(encryptionKey);
    Alert.alert('Key Copied', 'Encryption key has been copied to clipboard.');
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
              <TouchableOpacity onPress={() => handleView(card)} style={styles.viewButton}>
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(card.id)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableHighlight
        style={styles.floatingButton}
        onPress={handleAdd}
      >
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
              <Text style={styles.encryptionKeyText}>Encryption Key: {encryptionKey}</Text>
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
            secureTextEntry
          />
          <Button title="Decrypt" onPress={handleDecrypt} />
          <Text style={styles.decryptedCardNumber}>{decryptedCardNumber}</Text>
          <Button title="Close" onPress={handleCloseDecryptionModal} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  scrollView: {
    padding: 16,
  },
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderColor: '#007bff',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
    marginLeft: 10,
  },
  viewButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: '#ced4da',
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  encryptionKeyContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  encryptionKeyText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#007bff',
  },
  decryptedCardNumber: {
    fontSize: 18,
    color: '#007bff',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default CardsScreen;
