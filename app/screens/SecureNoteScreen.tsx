import "react-native-get-random-values";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Button
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";

const filePath = FileSystem.documentDirectory + "secureNotes.json";

const App = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(filePath);
      if (fileExists.exists) {
        const fileContents = await FileSystem.readAsStringAsync(filePath);
        setItems(fileContents ? JSON.parse(fileContents) : []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.log("Error loading items:", error);
    }
  };

  const saveItems = async (items) => {
    try {
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(items));
    } catch (error) {
      console.log("Error saving items:", error);
    }
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEncrypt = () => {
    const key = CryptoJS.lib.WordArray.random(32).toString();
    setEncryptionKey(key);
    const encryptedDescription = CryptoJS.AES.encrypt(description, key).toString();
    setDescription(encryptedDescription);
    setShowEncryptionKey(true);
  };

  const handleSave = () => {
    if (!encryptionKey) {
      Alert.alert("Encryption Error", "Please encrypt the description before saving.");
      return;
    }
    const newItem = {
      id: Date.now(),
      title,
      description,
      encryptionKey,
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    saveItems(updatedItems);
    setShowModal(false);
    setTitle("");
    setDescription("");
    setEncryptionKey("");
    setShowEncryptionKey(false);
  };

  const handleDelete = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    saveItems(updatedItems);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowDecryptModal(true);
  };

  const handleDecrypt = () => {
    if (selectedItem) {
      try {
        const bytes = CryptoJS.AES.decrypt(selectedItem.description, decryptionKey);
        const decryptedDescription = bytes.toString(CryptoJS.enc.Utf8);
        Alert.alert("Decrypted Description", decryptedDescription, [
          {
            text: "Close",
            onPress: () => {
              const reEncryptedDescription = CryptoJS.AES.encrypt(decryptedDescription, selectedItem.encryptionKey).toString();
              const updatedItem = {
                ...selectedItem,
                description: reEncryptedDescription,
              };
              const updatedItems = items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              );
              setItems(updatedItems);
              saveItems(updatedItems);
              setShowDecryptModal(false);
              setDecryptionKey("");
            },
          },
        ]);
      } catch (error) {
        Alert.alert("Decryption Error", "Invalid decryption key.");
      }
    }
  };

  const handleCopyKey = () => {
    Clipboard.setString(encryptionKey);
    Alert.alert("Copied to Clipboard", "The encryption key has been copied to the clipboard.");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>Description: {item.description}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleView(item)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.button}
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

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={(text) => setTitle(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={(text) => setDescription(text)}
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
          </View>
        </View>
      </Modal>

      <Modal visible={showDecryptModal} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Decryption Key"
            value={decryptionKey}
            onChangeText={(text) => setDecryptionKey(text)}
            secureTextEntry
          />
          <Button title="Decrypt" onPress={handleDecrypt} />
          <Button title="Cancel" onPress={() => setShowDecryptModal(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollView: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  encryptionKeyContainer: {
    marginBottom: 10,
  },
  encryptionKeyText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default App;
