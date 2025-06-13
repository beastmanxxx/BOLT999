// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKpMkgWDuCJvB0HCZpA6O5yqX3LGqJdk0",
  authDomain: "beast-earn-b4ea3.firebaseapp.com",
  projectId: "beast-earn-b4ea3",
  storageBucket: "beast-earn-b4ea3.firebasestorage.app",
  messagingSenderId: "638180528781",
  appId: "1:638180528781:web:29de48a20106eb470d48c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 