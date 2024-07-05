import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
  StyleSheet,
  Image,
  TouchableHighlight,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handlePickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (result.type === "success") {
      setSelectedFiles([...selectedFiles, result]);
    }
  };

  const handleEncrypt = () => {
    // Add your encryption logic here
    alert("Files encrypted successfully!");
    setShowModal(false); // Close modal after encryption
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {selectedFiles.length === 0 ? (
          <Text style={styles.noFilesText}>No files selected</Text>
        ) : (
          selectedFiles.map((file, index) => (
            <View key={index} style={styles.fileCard}>
              <Text style={styles.fileName}>{file.name}</Text>
              {file.uri.endsWith(".jpg") || file.uri.endsWith(".png") ? (
                <Image source={{ uri: file.uri }} style={styles.fileImage} />
              ) : (
                <Text style={styles.fileType}>{file.type}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableHighlight style={styles.floatingButton} onPress={handleAdd}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableHighlight>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Files</Text>
          <View style={styles.modalButtonContainer}>
            <Button title="Pick a File" onPress={handlePickFile} />
          </View>
          {selectedFiles.length > 0 && (
            <View style={styles.modalButtonContainer}>
              <Button title="Encrypt Files" onPress={handleEncrypt} />
            </View>
          )}
          <View style={styles.modalButtonContainer}>
            <Button title="Close" onPress={() => setShowModal(false)} />
          </View>
          <ScrollView contentContainerStyle={styles.selectedFilesContainer}>
            {selectedFiles.map((file, index) => (
              <View key={index} style={styles.selectedFileCard}>
                <Text style={styles.selectedFileName}>{file.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  scrollView: {
    padding: 16,
  },
  noFilesText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  fileCard: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderColor: "#4682b4",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4682b4",
    marginBottom: 10,
  },
  fileType: {
    fontSize: 14,
    color: "#696969",
  },
  fileImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4682b4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f8ff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4682b4",
    marginBottom: 10,
  },
  modalButtonContainer: {
    marginBottom: 10,
  },
  selectedFilesContainer: {
    flexGrow: 1,
    marginTop: 10,
  },
  selectedFileCard: {
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#4682b4",
    borderWidth: 1,
  },
  selectedFileName: {
    fontSize: 16,
    color: "#4682b4",
  },
});

export default App;
