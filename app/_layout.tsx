import * as React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import TabsScreen from "./(tabs)";
import PasswordScreen from "./screens/PasswordScreen";
import CardsScreen from "./screens/CardsScreen";
import FoldersScreen from "./screens/FoldersScreen";
import SecureNoteScreen from "./screens/SecureNoteScreen";
import IdentitiesScreen from "./screens/IdentitiesScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define a type for navigation stack parameters
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tabs: undefined;
  Passwords: undefined;
  Cards: undefined;
  Folders: undefined;
  Notes: undefined;
  Identities: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      independent={true}
    >
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Tabs"
          component={TabsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Passwords"
          component={PasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cards"
          component={CardsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Folders"
          component={FoldersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notes"
          component={SecureNoteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Identities"
          component={IdentitiesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
