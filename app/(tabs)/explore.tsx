import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const profileData = [
  { title: "Name", value: "John Doe" },
  { title: "Email", value: "john.doe@example.com" },
  { title: "Phone", value: "+1234567890" },
];

const settingsData = [
  {
    title: "Account",
    items: ["Change Email", "Change Password", "Manage Subscriptions"],
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
          {profileData.map((item, index) => (
            <View key={index} style={styles.profileItem}>
              <ThemedText style={styles.profileTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.profileValue}>{item.value}</ThemedText>
            </View>
          ))}
        </Collapsible>
        {settingsData.map((section, index) => (
          <Collapsible key={index} title={section.title}>
            {section.items.map((item, idx) => (
              <ThemedText key={idx} style={styles.settingItem}>
                {item}
              </ThemedText>
            ))}
          </Collapsible>
        ))}
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
  profileValue: {
    fontSize: 16,
    color: "#666",
  },
  settingItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
