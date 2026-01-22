
// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Konfiguracja Firebase wczytywana ze zmiennych środowiskowych (.env),
 * wstrzykiwanych przez webpack (dotenv-webpack).
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Inicjalizacja aplikacji Firebase
const app = initializeApp(firebaseConfig);

// Usługi Firebase
export const storage = getStorage(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// (opcjonalnie)
export default app;
