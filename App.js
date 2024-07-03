import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./app/screens/LoginScreen";
import SignupScreen from "./app/screens/SignupScreen";
import HomeScreen from "./app/screens/HomeScreen";
import FoldersScreen from "./app/screens/FoldersScreen";
import PasswordScreen from "./app/screens/PasswordScreen";
import SecureNoteScreen from "./app/screens/SecureNoteScreen";
import CardsScreen from "./app/screens/CardsScreen";
import IdentitiesScreen from "./app/screens/IdentitiesScreen";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
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
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Folders" component={FoldersScreen} />
        <Stack.Screen name="Password" component={PasswordScreen} />
        <Stack.Screen name="Secure Note" component={SecureNoteScreen} />
        <Stack.Screen name="Cards" component={CardsScreen} />
        <Stack.Screen name="Identities" component={IdentitiesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
