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
  ImageBackground,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";

const filePath = FileSystem.documentDirectory + "secureNotes.json";

const PasswordsScreen = () => {
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
    <ImageBackground
    source={require("../../assets/images/img2.jpg")}
    style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>Description: Encrypted</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleView(item)}
                style={styles.viewButton}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.floatingButton} onPress={handleAdd}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        {/* Add Item Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Add New Note</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  placeholderTextColor="#666"
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  placeholderTextColor="#666"
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                  multiline
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

        {/* Decrypt Item Modal */}
        <Modal visible={showDecryptModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Decrypt Note</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Decryption Key"
                  placeholderTextColor="#666"
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
                <TouchableOpacity
                  onPress={() => setShowDecryptModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  scrollView: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    paddingBottom:20,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewButton: {
    backgroundColor: "#2196f3",
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#28a745",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    backgroundColor: "#fff", // White background
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  keyContainer: {
    marginBottom: 15,
  },
  keyText: {
    color: "#333",
    fontSize: 16,
    marginBottom: 5,
  },
  keyValue: {
    color: "#000",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  copyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PasswordsScreen;
