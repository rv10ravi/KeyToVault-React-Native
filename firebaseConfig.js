import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDrmNvo0WzG8EwgjDQY2NLqOXaZ4Q59bHQ",
  authDomain: "keytovault.firebaseapp.com",
  projectId: "keytovault",
  storageBucket: "keytovault.appspot.com",
  messagingSenderId: "896094237402",
  appId: "1:896094237402:web:05d39bb90f574e22a12be3",
  measurementId: "G-X90PSXHZ0V",
};
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
