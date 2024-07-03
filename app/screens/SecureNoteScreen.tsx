import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const secureNoteData = [
  { key: "Secure Note 1" },
  { key: "Secure Note 2" },
  { key: "Secure Note 3" },
  // Add more secure notes as needed
];

export default function SecureNoteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Secure Note</Text>
      <FlatList
        data={secureNoteData}
        renderItem={({ item }) => (
          <Text style={styles.itemText}>{item.key}</Text>
        )}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F5",
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemText: {
    fontSize: 18,
    color: "#1F2937",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
