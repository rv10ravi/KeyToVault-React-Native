import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { auth, db } from "../../firebaseConfig";
import { getDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Sharing from "expo-sharing";

type RootStackParamList = {
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function ProfileAndSettingsScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // JSON data files
  const jsonFiles = [
    "idCards.json",
    "cards.json",
    "passwords.json",
    "secureNotes.json",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setProfileData({ ...profileData, email: user.email });
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Function to export all JSON data
  const handleExportData = async () => {
    try {
      const dataToExport: any = {};
      for (let fileName of jsonFiles) {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        dataToExport[fileName] = JSON.parse(fileContents);
      }

      // Save the file into the Documents folder
      const exportUri = `${FileSystem.documentDirectory}appDataBackup.json`;
      await FileSystem.writeAsStringAsync(
        exportUri,
        JSON.stringify(dataToExport)
      );

      // Share the file so it can be saved externally on the device
      await Sharing.shareAsync(exportUri, {
        mimeType: "application/json",
        dialogTitle: "Save your backup file",
        UTI: "public.json",
      });

      Alert.alert("Success", "Data exported successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to export data.");
    }
  };

  // Function to import JSON data
  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        const importUri = result.uri;
        const importedData = await FileSystem.readAsStringAsync(importUri);
        const parsedData = JSON.parse(importedData);

        for (let fileName of jsonFiles) {
          if (parsedData[fileName]) {
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(
              fileUri,
              JSON.stringify(parsedData[fileName])
            );
          }
        }

        Alert.alert("Success", "Data imported successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to import data.");
    }
  };

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, profileData, { merge: true });
      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully."
      );
    }
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate("Login");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  const handlePasswordChange = async () => {
    const user = auth.currentUser;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              Alert.alert("Success", "Password updated successfully.");
              setIsModalVisible(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmNewPassword("");
            })
            .catch((error) => {
              Alert.alert("Error", error.message);
            });
        })
        .catch((error) => {
          Alert.alert("Reauthentication Error", error.message);
        });
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email!,
        deletePassword
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          deleteDoc(doc(db, "users", user.uid))
            .then(() => {
              deleteUser(user)
                .then(() => {
                  Alert.alert(
                    "Account Deleted",
                    "Your account has been deleted."
                  );
                  navigation.navigate("Login");
                })
                .catch((error) => {
                  Alert.alert("Error", error.message);
                });
            })
            .catch((error) => {
              Alert.alert("Database Error", error.message);
            });
        })
        .catch((error) => {
          Alert.alert("Reauthentication Error", error.message);
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={require("../../assets/images/user (3).png")}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileEmail}>{profileData.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Name</Text>
          <TextInput
            style={styles.profileInput}
            value={profileData.name}
            onChangeText={(text) =>
              setProfileData({ ...profileData, name: text })
            }
          />
        </View>
        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Phone</Text>
          <TextInput
            style={styles.profileInput}
            value={profileData.phone}
            onChangeText={(text) =>
              setProfileData({ ...profileData, phone: text })
            }
          />
        </View>
        <Button
          title="Update Profile"
          onPress={handleProfileUpdate}
          color="#5bb262"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#FFF" />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.optionText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setIsDeleteModalVisible(true)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.optionText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <Button
          title="Export Data"
          onPress={handleExportData}
          color="#5bb262"
        />
        <Button
          title="Import Data"
          onPress={handleImportData}
          color="#5bb262"
        />
      </View>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <Button title="Update Password" onPress={handlePasswordChange} />
            <Button
              title="Cancel"
              onPress={() => setIsModalVisible(false)}
              color="#ff3b30"
            />
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Enter Password"
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <Button title="Delete Account" onPress={handleDeleteAccount} />
            <Button
              title="Cancel"
              onPress={() => setIsDeleteModalVisible(false)}
              color="#ff3b30"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#1b1b1b",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  profileEmail: {
    fontSize: 16,
    color: "#AAA",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  profileItem: {
    marginBottom: 15,
  },
  profileLabel: {
    fontSize: 14,
    color: "#FFF",
  },
  profileInput: {
    backgroundColor: "#333",
    color: "#FFF",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
