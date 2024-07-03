import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const foldersData = [
  { key: "Folder 1" },
  { key: "Folder 2" },
  { key: "Folder 3" },
  // Add more folders as needed
];

export default function FoldersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Folders</Text>
      <FlatList
        data={foldersData}
        renderItem={({ item }) => <Text style={styles.itemText}>{item.key}</Text>}
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
