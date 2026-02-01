import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyALLpYLOAzQMYCj52PeRjVqKD_AsFPnDkI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "snaplet-byt.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "snaplet-byt",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "snaplet-byt.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "965459311029",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:965459311029:web:2eeef2b01aa8d7af47c1fc"
};

console.log("Using Firebase API Key:", firebaseConfig.apiKey);

// Inicjalizacja tylko jeśli nie ma jeszcze instancji Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
