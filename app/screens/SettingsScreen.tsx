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
} from "react-native";
import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
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

const settingsData = [
  {
    title: "Account",
    items: ["Change Password", "Manage Subscriptions"],
  },
  {
    title: "Privacy",
    items: ["Blocked Users", "Activity Status", "Location Services"],
  },
  {
    title: "Notifications",
    items: ["Push Notifications", "Email Notifications"],
  },
];

export default function ProfileAndSettingsScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleChangePassword = async () => {
    const user = auth.currentUser;
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

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Ionicons size={310} name="settings-sharp" style={styles.headerImage} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile and Settings</ThemedText>
      </ThemedView>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Collapsible title="Profile">
          <View style={styles.profileItem}>
            <ThemedText style={styles.profileTitle}>Name</ThemedText>
            <TextInput
              style={styles.profileInput}
              value={profileData.name}
              onChangeText={(text) =>
                setProfileData({ ...profileData, name: text })
              }
            />
          </View>
          <View style={styles.profileItem}>
            <ThemedText style={styles.profileTitle}>Email</ThemedText>
            <TextInput
              style={styles.profileInput}
              value={profileData.email}
              editable={false}
            />
          </View>
          <View style={styles.profileItem}>
            <ThemedText style={styles.profileTitle}>Phone</ThemedText>
            <TextInput
              style={styles.profileInput}
              value={profileData.phone}
              onChangeText={(text) =>
                setProfileData({ ...profileData, phone: text })
              }
            />
          </View>
          <Button title="Update Profile" onPress={handleProfileUpdate} />
        </Collapsible>
        {settingsData.map((section, index) => (
          <Collapsible key={index} title={section.title}>
            {section.items.map((item, idx) => {
              switch (item) {
                case "Change Password":
                  return (
                    <View key={idx} style={styles.settingItem}>
                      <Text>Current Password:</Text>
                      <TextInput
                        style={styles.profileInput}
                        value={currentPassword}
                        secureTextEntry={true}
                        onChangeText={(text) => setCurrentPassword(text)}
                      />
                      <Text>New Password:</Text>
                      <TextInput
                        style={styles.profileInput}
                        value={newPassword}
                        secureTextEntry={true}
                        onChangeText={(text) => setNewPassword(text)}
                      />
                      <Button
                        title="Change Password"
                        onPress={handleChangePassword}
                      />
                    </View>
                  );
                default:
                  return (
                    <TouchableOpacity key={idx}>
                      <ThemedText style={styles.settingItem}>{item}</ThemedText>
                    </TouchableOpacity>
                  );
              }
            })}
          </Collapsible>
        ))}
        <Button title="Sign Out" onPress={handleSignOut} color="#FF6060" />
        <Collapsible title="Delete Account">
          <View style={styles.settingItem}>
            <Text>Password:</Text>
            <TextInput
              style={styles.profileInput}
              value={deletePassword}
              secureTextEntry={true}
              onChangeText={(text) => setDeletePassword(text)}
            />
            <Button
              title="Delete Account"
              onPress={handleDeleteAccount}
              color="#FF6060"
            />
          </View>
        </Collapsible>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  contentContainer: {
    padding: 20,
  },
  profileItem: {
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileInput: {
    fontSize: 16,
    color: "#666",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 5,
  },
  settingItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
