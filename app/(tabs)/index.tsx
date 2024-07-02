import React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";

const data = [
  {
    key: "Folders",
    icon: require("../../assets/icons/folder-solid.png"),
    color: "#AB87FF",
  },
  {
    key: "Password",
    icon: require("../../assets/icons/key-solid.png"),
    color: "#60D2D3",
  },
  {
    key: "Secure Note",
    icon: require("../../assets/icons/note-sticky-solid.png"),
    color: "#F3A13E",
  },
  {
    key: "Cards",
    icon: require("../../assets/icons/credit-card-solid.png"),
    color: "#6A7DFF",
  },
  {
    key: "Identities",
    icon: require("../../assets/icons/passport-solid.png"),
    color: "#FF6060",
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Browse</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer}>
            <View
              style={[styles.iconContainer, { backgroundColor: item.color }]}
            >
              <Image source={item.icon} style={styles.icon} />
            </View>
            <Text style={styles.itemText}>{item.key}</Text>
          </TouchableOpacity>
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
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    width: 24,
    height: 24,
  },
  itemText: {
    fontSize: 18,
    color: "#1F2937",
  },
});
