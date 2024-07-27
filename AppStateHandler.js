import React, { useEffect } from "react";
import { AppState } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Adjust the import path as needed

const AppStateHandler = ({ children }) => {
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        signOut(auth).catch((error) => console.error("Error signing out: ", error));
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return <>{children}</>;
};

export default AppStateHandler;
