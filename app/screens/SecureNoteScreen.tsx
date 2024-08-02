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
    const encryptedDescription = CryptoJS.AES.encrypt(
      description,
      key
    ).toString();
    setDescription(encryptedDescription);
    setShowEncryptionKey(true);
  };

  const handleSave = () => {
    if (!encryptionKey) {
      Alert.alert(
        "Encryption Error",
        "Please encrypt the description before saving."
      );
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
        const bytes = CryptoJS.AES.decrypt(
          selectedItem.description,
          decryptionKey
        );
        const decryptedDescription = bytes.toString(CryptoJS.enc.Utf8);
        Alert.alert("Decrypted Description", decryptedDescription, [
          {
            text: "Close",
            onPress: () => {
              const reEncryptedDescription = CryptoJS.AES.encrypt(
                decryptedDescription,
                selectedItem.encryptionKey
              ).toString();
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
    Alert.alert(
      "Copied to Clipboard",
      "The encryption key has been copied to the clipboard."
    );
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
                style={styles.buttonView}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.buttonDelete}
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
              <Text style={styles.encryptionKeyText}>
                Encryption Key: {encryptionKey}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyKey}
              >
                <Text style={styles.copyButtonText}>Copy Key</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.encryptButton}
              onPress={handleEncrypt}
            >
              <Text style={styles.modalButtonText}>Encrypt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.decryptButton}
            onPress={handleDecrypt}
          >
            <Text style={styles.modalButtonText}>Decrypt</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop:50,
  },
  scrollView: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonView: {
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  buttonDelete: {
    padding: 8,
    backgroundColor: "#dc3545",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  floatingButton: {
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
  floatingButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    backgroundColor: "#f1f1f1",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    width: "100%",
  },
  encryptButton: {
    padding: 12,
    backgroundColor: "#17a2b8",
    borderRadius: 8,
  },
  saveButton: {
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  encryptionKeyContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  encryptionKeyText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  copyButton: {
    padding: 8,
    backgroundColor: "#ffc107",
    borderRadius: 5,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  decryptButton: {
    padding: 12,
    backgroundColor: "#6c757d",
    borderRadius: 8,
    marginTop: 16,
  },
});

export default App;
