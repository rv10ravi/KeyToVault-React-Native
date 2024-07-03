import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const cardsData = [
  { key: "Card 1" },
  { key: "Card 2" },
  { key: "Card 3" },
  // Add more cards as needed
];

export default function CardsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Cards</Text>
      <FlatList
        data={cardsData}
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
