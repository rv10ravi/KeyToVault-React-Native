import React, { useState, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
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

  const handleExportData = async () => {
    try {
      const dataToExport: any = {};
      for (let fileName of jsonFiles) {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        dataToExport[fileName] = JSON.parse(fileContents);
      }

      const exportUri = `${FileSystem.documentDirectory}appDataBackup.json`;
      await FileSystem.writeAsStringAsync(
        exportUri,
        JSON.stringify(dataToExport)
      );

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

  const DATA_FILES = [
    "idCards.json",
    "cards.json",
    "passwords.json",
    "secureNotes.json",
  ];
  const FILE_PATH_PREFIX = `${FileSystem.documentDirectory}`;

  const readExistingData = async (fileName) => {
    const fileUri = `${FILE_PATH_PREFIX}${fileName}`;
    try {
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      if (!fileExists.exists) {
        return [];
      }
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error);
      return [];
    }
  };

  const writeDataToFile = async (fileName, data) => {
    const fileUri = `${FILE_PATH_PREFIX}${fileName}`;
    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to ${fileName}:`, error);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || !result.assets.length) {
        alert("No file selected or operation canceled");
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(fileContent);

      if (!parsedData) {
        alert("Failed to parse the JSON file");
        return;
      }

      // Loop through each of the expected JSON files
      for (let fileName of DATA_FILES) {
        if (parsedData[fileName]) {
          console.log(`${fileName} Data:`, parsedData[fileName]);

          // Read the existing data from the file system
          let existingData = await readExistingData(fileName);

          // Merge existing data with imported data
          existingData = [...existingData, ...parsedData[fileName]];

          // Write the merged data back to the file
          await writeDataToFile(fileName, existingData);
        }
      }

      alert("Data imported and merged successfully!");
    } catch (error) {
      console.error("Error during import:", error);
      alert("An error occurred while importing the data");
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
  const handleExportKeys = async () => {
    try {
      const dataToExport: any = {};

      for (let fileName of jsonFiles) {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const fileContents = await FileSystem.readAsStringAsync(fileUri);
        const parsedData = JSON.parse(fileContents);

        // Extract only `id` and `keys` fields from each item
        const filteredData = parsedData.map((item: any) => ({
          id: item.id,
          key: item.encryptionKey,
        }));

        dataToExport[fileName] = filteredData;
      }

      const exportFileName = "keysBackup.json";
      const exportUri = `${FileSystem.documentDirectory}${exportFileName}`;
      const jsonContent = JSON.stringify(dataToExport);

      // Write the JSON content to the document directory
      await FileSystem.writeAsStringAsync(exportUri, jsonContent);

      // Provide a download option
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportUri, {
          mimeType: "application/json",
          dialogTitle: "Save your backup file",
          UTI: "public.json",
        });
      } else {
        Alert.alert("Download", `File saved to: ${exportUri}`);
      }

      Alert.alert("Success", "Keys exported successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to export keys.");
    }
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
              Alert.alert("Error");
            });
        })
        .catch((error) => {
          Alert.alert("Incorrect Password !", error.message);
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
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleProfileUpdate}
        >
          <Text style={styles.actionButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportData}
        >
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleImportData}
        >
          <Text style={styles.actionButtonText}>Import Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportKeys}
        >
          <Text style={styles.actionButtonText}>Export Keys</Text>
        </TouchableOpacity>
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
              placeholderTextColor="#FFFFFF"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="New Password"
              placeholderTextColor="#FFFFFF"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Confirm New Password"
              placeholderTextColor="#FFFFFF"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePasswordChange}
            >
              <Text style={styles.modalButtonText}>Update Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#FFFFFF"
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#ff4444" }]}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.modalButtonText}>Confirm Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsDeleteModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#000",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  profileEmail: {
    fontSize: 16,
    color: "#888",
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
    color: "#888",
    marginBottom: 5,
  },
  profileInput: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 5,
    padding: 10,
    color: "#FFF",
  },
  actionButton: {
    backgroundColor: "#1b8f3a",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
    marginStart: 40,
    marginEnd: 40,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    padding: 10,
    color: "#fff",
    width: "100%",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#5a67d8",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCloseButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  modalCloseButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});
