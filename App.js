import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppStateHandler from "./path/to/AppStateHandler"; // Adjust the import path as needed
import RootLayout from "./app/_layout";

export default function App() {
  return (
    <AppStateHandler>
      <NavigationContainer>
        <RootLayout />
      </NavigationContainer>
    </AppStateHandler>
  );
}