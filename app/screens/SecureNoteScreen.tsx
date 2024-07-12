import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as FileSystem from 'expo-file-system';

const filePath = FileSystem.documentDirectory + "secureNotes.json";

const App = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(filePath);
      if (fileExists.exists) {
        const fileContents = await FileSystem.readAsStringAsync(filePath);
        setItems(JSON.parse(fileContents));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load items");
      console.error(error);
    }
  };

  const saveItems = async (items) => {
    try {
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(items));
    } catch (error) {
      Alert.alert("Error", "Failed to save items");
      console.error(error);
    }
  };

  const handleAddItem = async () => {
    if (title.trim() !== "" && description.trim() !== "") {
      const newItem = {
        id: Date.now(),
        title: title,
        description: description,
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      setTitle("");
      setDescription("");
      await saveItems(updatedItems);
    } else {
      Alert.alert("Error", "Please enter both title and description.");
    }
  };

  const handleDeleteItem = async (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    await saveItems(updatedItems);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    paddingVertical: 20,
    paddingHorizontal: 16,
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4682b4",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#696969",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
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
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
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
});

export default App;
