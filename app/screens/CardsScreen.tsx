import React, { useState } from 'react';
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
} from 'react-native';

const App = () => {
  const [cards, setCards] = useState([
    { id: 1, name: 'Hitesh ', bankName: 'Bank of America', cardType: 'Credit', cardNumber: '1234 5678 9012 3456', expiryDate: '12/25', cvv: '123' },
    { id: 2, name: 'John', bankName: 'Chase', cardType: 'Debit', cardNumber: '2345 6789 0123 4567', expiryDate: '11/24', cvv: '456' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleDelete = (id) => {
    const updatedCards = cards.filter((card) => card.id !== id);
    setCards(updatedCards);
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSave = () => {
    const newCard = {
      id: cards.length + 1,
      name,
      bankName,
      cardType,
      cardNumber,
      expiryDate,
      cvv,
    };
    setCards([...cards, newCard]);
    setShowModal(false);
    setName('');
    setBankName('');
    setCardType('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
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
          <View style={styles.modalActions}>
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  scrollView: {
    padding: 16,
  },
  card: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderColor: '#4682b4',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4682b4',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#696969',
    marginBottom: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#ff6347',
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
    backgroundColor: '#4682b4',
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
    backgroundColor: '#f0f8ff',
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
});

export default App;
