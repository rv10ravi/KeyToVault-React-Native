import React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
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

  const handlePressIn = (animationValue: Animated.Value) => {
    Animated.spring(animationValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (animationValue: Animated.Value) => {
    Animated.spring(animationValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome To KeyToVault</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          const scaleValue = new Animated.Value(1);

          return (
            <Animated.View
              style={[
                styles.animatedContainer,
                { transform: [{ scale: scaleValue }] },
              ]}
            >
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() =>
                  navigation.navigate(item.key as keyof RootStackParamList)
                }
                activeOpacity={0.7}
                onPressIn={() => handlePressIn(scaleValue)}
                onPressOut={() => handlePressOut(scaleValue)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Image source={item.icon} style={styles.icon} />
                </View>
                <Text style={styles.itemText}>{item.key}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
        keyExtractor={(item) => item.key}
      />
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Settings")}
        activeOpacity={0.7}
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
    paddingTop: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  animatedContainer: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontWeight: "bold",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
