import "react-native-get-random-values";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import CryptoJS from "crypto-js";

const fileUri = FileSystem.documentDirectory + "passwords.json";

const PasswordsScreen = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [socialMediaName, setSocialMediaName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [decryptionKey, setDecryptionKey] = useState("");
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const fileData = await FileSystem.readAsStringAsync(fileUri);
        setData(JSON.parse(fileData));
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

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this password?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedData = data.filter((item) => item.id !== id);
            setData(updatedData);
            saveData(updatedData);
          },
        },
      ]
    );
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowDecryptModal(true);
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEncrypt = () => {
    if (!password) {
      Alert.alert("Input Error", "Please enter a password before encrypting.");
      return;
    }

    const key = CryptoJS.lib.WordArray.random(32).toString();
    setEncryptionKey(key);
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    setPassword(encryptedPassword);
    setShowEncryptionKey(true);
  };

  const handleSave = () => {
    if (!encryptionKey) {
      Alert.alert(
        "Encryption Error",
        "Please encrypt the password before saving."
      );
      return;
    }

    const newItem = {
      id: Date.now(),
      socialMediaName,
      email,
      password,
      encryptionKey,
    };

    const updatedData = [...data, newItem];
    setData(updatedData);
    saveData(updatedData);
    setShowModal(false);
    setSocialMediaName("");
    setEmail("");
    setPassword("");
    setEncryptionKey("");
    setShowEncryptionKey(false);
  };

  const handleDecrypt = () => {
    if (selectedItem) {
      try {
        const bytes = CryptoJS.AES.decrypt(
          selectedItem.password,
          decryptionKey
        );
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        Alert.alert("Decrypted Password", decryptedPassword, [
          {
            text: "Close",
            onPress: () => {
              const reEncryptedPassword = CryptoJS.AES.encrypt(
                decryptedPassword,
                selectedItem.encryptionKey
              ).toString();
              const updatedItem = {
                ...selectedItem,
                password: reEncryptedPassword,
              };
              const updatedData = data.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              );
              setData(updatedData);
              saveData(updatedData);
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
    Alert.alert("Key Copied", "Encryption key has been copied to clipboard.");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/img2.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {data.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.socialMediaName}</Text>
              <Text style={styles.cardText}>Email: {item.email}</Text>
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
        </ScrollView>

        <TouchableOpacity style={styles.floatingButton} onPress={handleAdd}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        {/* Add Password Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Add New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Social Media Name"
                  placeholderTextColor="#ccc"
                  value={socialMediaName}
                  onChangeText={(text) => setSocialMediaName(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#ccc"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#ccc"
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  secureTextEntry
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

        {/* Decrypt Password Modal */}
        <Modal visible={showDecryptModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Decrypt Password</Text>
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
    
  },
  scrollView: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtonText: {
    fontSize: 30,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8f9fa",
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  keyContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
  },
  keyText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  keyValue: {
    fontSize: 14,
    marginVertical: 10,
  },
  copyButton: {
    backgroundColor: "#17a2b8",
    padding: 10,
    borderRadius: 5,
  },
  copyButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PasswordsScreen;
