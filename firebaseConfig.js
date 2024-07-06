// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrmNvo0WzG8EwgjDQY2NLqOXaZ4Q59bHQ",
  authDomain: "keytovault.firebaseapp.com",
  projectId: "keytovault",
  storageBucket: "keytovault.appspot.com",
  messagingSenderId: "896094237402",
  appId: "1:896094237402:web:05d39bb90f574e22a12be3",
  measurementId: "G-X90PSXHZ0V"
};

// Initialize Firebase
const analytics = getAnalytics(app);

export const app = initializeApp(firebaseConfig);