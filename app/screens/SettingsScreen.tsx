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
        <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={24} color="#FF6060" />
          <Text style={[styles.optionText, { color: "#FF6060" }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsModalVisible(false)}
                color="#808080"
              />
              <Button
                title="Change Password"
                onPress={handlePasswordChange}
                color="#5bb262"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    padding: 20,
    paddingTop: 60,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
  },
  profileEmail: {
    fontSize: 16,
    color: "#808080",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#FFF",
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: "#808080",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 18,
    color: "#FFF",
    marginLeft: 15,
  },
  profileItem: {
    marginBottom: 20,
  },
  profileLabel: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 5,
  },
  profileInput: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    padding: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#FFF",
    color: "#000",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
