// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMWVQPco4rX-4lD8OI-oCsMbROsUhBZ5k",
  authDomain: "mudralaya-auth.firebaseapp.com",
  projectId: "mudralaya-auth",
  storageBucket: "mudralaya-auth.firebasestorage.app",
  messagingSenderId: "860603341728",
  appId: "1:860603341728:web:cedc3c13a53a9b1abbe2c5",
  measurementId: "G-7P6X6CEB45",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Auth for use in components
export const auth = getAuth(app);
