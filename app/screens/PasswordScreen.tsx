import React, { useState } from "react";
import { TouchableOpacity } from "react-native";

import {
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";

const App = () => {
  const [data, setData] = useState([
    {
      id: 1,
      socialMediaName: "Facebook",
      email: "example@gmail.com",
      password: "password1",
    },
    {
      id: 2,
      socialMediaName: "Twitter",
      email: "example2@gmail.com",
      password: "password2",
    },
    {
      id: 3,
      socialMediaName: "Instagram",
      email: "example3@gmail.com",
      password: "password3",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [socialMediaName, setSocialMediaName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDelete = (id) => {
    const updatedData = data.filter((item) => item.id !== id);
    setData(updatedData);
  };

  const handleView = (item) => {
    console.log(item);
    // Logic to view the item
  };

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEncrypt = () => {
    // Logic to encrypt the password
  };

  const handleSave = () => {
    const newItem = {
      id: data.length + 1,
      socialMediaName,
      email,
      password,
    };
    setData([...data, newItem]);
    setShowModal(false);
    setSocialMediaName("");
    setEmail("");
    setPassword("");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {data.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.socialMediaName}</Text>
            <Text style={styles.cardText}>ID: {item.email}</Text>
            <Text style={styles.cardText}>Password: {item.password}</Text>
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
            placeholder="Social Media Name"
            value={socialMediaName}
            onChangeText={(text) => setSocialMediaName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
          <View style={styles.modalActions}>
            <Button title="Encrypt" onPress={handleEncrypt} />
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
    backgroundColor: "#fff",
  },
  scrollView: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
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
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    padding: 8,
    backgroundColor: "#007bff",
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
    backgroundColor: "blue",
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    borderColor: "#ddd",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    width: "100%",
  },
});

export default App;
