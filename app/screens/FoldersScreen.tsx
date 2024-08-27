import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TextInput,
  Alert,
  Modal,
  TouchableOpacity,
  Clipboard,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import CryptoJS from "crypto-js";
import ImageViewer from "react-native-image-viewing";
import * as IntentLauncher from "expo-intent-launcher";

const App = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");
  const [isEncryptModalVisible, setEncryptModalVisible] = useState(false);
  const [isDecryptModalVisible, setDecryptModalVisible] = useState(false);
  const [isKeyModalVisible, setKeyModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [imageUri, setImageUri] = useState("");
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredFiles();
  }, []);

  const loadStoredFiles = async () => {
    try {
      const storedFiles = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory
      );
      const encryptedFiles = storedFiles
        .filter((file) => file.endsWith(".enc"))
        .map((file) => ({
          name: file.replace(".enc", ""),
          path: `${FileSystem.documentDirectory}${file}`,
        }));
      setFiles(encryptedFiles);
    } catch (error) {
      console.error("Error loading stored files:", error);
    }
  };

  const generateKey = (password, salt) => {
    return CryptoJS.PBKDF2(password, salt).toString();
  };

  const encryptFile = (fileContent, key) => {
    return CryptoJS.AES.encrypt(fileContent, key).toString();
  };

  const decryptFile = (encryptedContent, key) => {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const saveEncryptedFile = async (encryptedContent, fileName) => {
    const path = `${FileSystem.documentDirectory}${fileName}.enc`;
    await FileSystem.writeAsStringAsync(path, encryptedContent);
    console.log(`Encrypted file saved at ${path}`);
    return path;
  };

  const loadEncryptedFile = async (filePath) => {
    const content = await FileSystem.readAsStringAsync(filePath);
    console.log(`Loaded encrypted file content from ${filePath}`);
    return content;
  };

  const storeEncryptionDetails = async (fileName, key) => {
    await SecureStore.setItemAsync(`${fileName}_key`, key);
  };

  const retrieveEncryptionDetails = async (fileName) => {
    const key = await SecureStore.getItemAsync(`${fileName}_key`);
    console.log(`Retrieved key for ${fileName}`);
    return { key };
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type === "cancel") {
        console.log("File selection cancelled");
        return;
      }

      const file = result.assets ? result.assets[0] : result;
      console.log("File selected:", file);

      if (file.uri) {
        setSelectedFile(file);
        setEncryptModalVisible(true);
      } else {
        console.error("No file information found in result:", result);
      }
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };

  const handleEncryptFile = async () => {
    if (!selectedFile) return;

    setIsLoading(true); // Show loading indicator

    try {
      const password = "yourstrongpassword";
      const salt = "yoursalt";
      const key = generateKey(password, salt);

      const fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("File content read successfully");

      const encrypted = encryptFile(fileContent, key);
      const encryptedFilePath = await saveEncryptedFile(
        encrypted,
        selectedFile.name
      );

      await storeEncryptionDetails(selectedFile.name, key);

      setFiles((prevFiles) => [
        ...prevFiles,
        { name: selectedFile.name, path: encryptedFilePath },
      ]);
      setEncryptionKey(key);

      setEncryptModalVisible(false);
      setSelectedFile(null);
      setKeyModalVisible(true); // Show key modal after encryption
    } catch (error) {
      console.error("Error encrypting file:", error);
      Alert.alert("Error", "Failed to encrypt file.");
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  const copyDecryptedFile = async (sourceUri, destinationUri) => {
    try {
      await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });
      console.log(`File copied to ${destinationUri}`);
      return destinationUri;
    } catch (error) {
      console.error("Error copying file:", error);
    }
  };

  const openFileWithViewer = async (fileUri) => {
    try {
      if (fileUri.endsWith(".pdf")) {
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      } else {
        await FileViewer.open(fileUri);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Error", "Failed to open file.");
    }
  };

  const decryptAndViewFile = async (file) => {
    try {
      const { key } = await retrieveEncryptionDetails(file.name);
      if (key !== decryptionKey) {
        Alert.alert("Invalid Key", "The decryption key is incorrect.");
        return;
      }

      const encryptedContent = await loadEncryptedFile(file.path);
      const decryptedContent = decryptFile(encryptedContent, key);

      const decryptedFilePath = `${FileSystem.documentDirectory}${file.name}`;
      await FileSystem.writeAsStringAsync(decryptedFilePath, decryptedContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Copy to a more accessible location
      const accessibleFilePath = `${FileSystem.cacheDirectory}${file.name}`;
      const copiedFilePath = await copyDecryptedFile(
        decryptedFilePath,
        accessibleFilePath
      );

      if (file.name.endsWith(".pdf")) {
        console.log("PDF file ready for viewing");
        await openFileWithViewer(copiedFilePath);
      } else if (
        file.name.endsWith(".jpg") ||
        file.name.endsWith(".jpeg") ||
        file.name.endsWith(".png")
      ) {
        setImageUri(copiedFilePath);
        setImageViewVisible(true);
      }
    } catch (error) {
      console.error("Error decrypting file:", error);
      Alert.alert("Error", "Failed to decrypt file.");
    }
  };

  const deleteFile = async (file) => {
    try {
      await FileSystem.deleteAsync(file.path, { idempotent: true });
      setFiles((prevFiles) => prevFiles.filter((f) => f.path !== file.path));
    } catch (error) {
      console.error("Error deleting file:", error);
      Alert.alert("Error", "Failed to delete file.");
    }
  };

  const openDecryptModal = (file) => {
    setCurrentFile(file);
    setDecryptModalVisible(true);
  };

  const handleDecrypt = () => {
    if (!currentFile) return;

    decryptAndViewFile(currentFile);
    setDecryptModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.name}</Text>
            <View style={styles.cardButtons}>
              <Button title="Decrypt" onPress={() => openDecryptModal(item)} />
              <Button title="Delete" onPress={() => deleteFile(item)} />
            </View>
          </View>
        )}
      />
      <View style={styles.bottomContainer}>
        <Button title="Select File" onPress={pickFile} />
      </View>
      <Modal
        visible={isEncryptModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEncryptModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Selected File: {selectedFile?.name || "None"}</Text>
            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button title="Encrypt File" onPress={handleEncryptFile} />
            )}
            <Button
              title="Cancel"
              onPress={() => setEncryptModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={isDecryptModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDecryptModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Enter Decryption Key</Text>
            <TextInput
              style={styles.input}
              value={decryptionKey}
              onChangeText={setDecryptionKey}
              placeholder="Decryption Key"
              secureTextEntry
            />
            <Button title="Decrypt" onPress={handleDecrypt} />
            <Button
              title="Cancel"
              onPress={() => setDecryptModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={isKeyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setKeyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Encryption Key: {encryptionKey}</Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(encryptionKey);
                Alert.alert("Copied to Clipboard", "Encryption key copied.");
              }}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>Copy Key</Text>
            </TouchableOpacity>
            <Button title="Close" onPress={() => setKeyModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <ImageViewer
        images={[{ uri: imageUri }]}
        imageIndex={0}
        visible={isImageViewVisible}
        onRequestClose={() => setImageViewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  bottomContainer: {
    marginTop: 20,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    width: "100%",
    marginBottom: 20,
    padding: 10,
  },
  encryptionKeyContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  copyButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  copyButtonText: {
    color: "#fff",
  },
});

export default App;
