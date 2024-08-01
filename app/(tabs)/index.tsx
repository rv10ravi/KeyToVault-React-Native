import React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Settings,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Folders: undefined;
  Passwords: undefined;
  "Secure Note": undefined;
  Cards: undefined;
  Identities: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const data = [
  {
    key: "Folders",
    icon: require("../../assets/icons/folder-solid.png"),
    color: "#AB87FF",
  },
  {
    key: "Passwords",
    icon: require("../../assets/icons/key-solid.png"),
    color: "#60D2D3",
  },
  {
    key: "Notes",
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
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Browse</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() =>
              navigation.navigate(item.key as keyof RootStackParamList)
            }
          >
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
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons name="settings-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F5",
    padding: 20,
    paddingTop: 40,
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
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6200EA",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
