
// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCiNRj0VJE0bVdrFiexA3RzPQaVC1UVR6A",
  authDomain: "snaplet-byt.firebaseapp.com",
  projectId: "snaplet-byt",
  storageBucket: "snaplet-byt.firebasestorage.app",
  messagingSenderId: "965459311029",
  appId: "1:965459311029:web:97b3fd5d4c1c9bdf47c1fc",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
