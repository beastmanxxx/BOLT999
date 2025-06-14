// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCgh6ML89ORBDOR7r4x8s79JvPjhLBTI8",
  authDomain: "bolt999-30e86.firebaseapp.com",
  projectId: "bolt999-30e86",
  storageBucket: "bolt999-30e86.firebasestorage.app",
  messagingSenderId: "627494404028",
  appId: "1:627494404028:web:af21c8bb1907093c7735b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 
