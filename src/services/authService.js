
// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../config/firebase";

/**
 * Rejestracja nowego użytkownika
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 */
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user;
  } catch (error) {
    console.error("signUp error:", error);
    throw error;
  }
};

/**
 * Logowanie użytkownika
 * @param {string} email
 * @param {string} password
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("signIn error:", error);
    throw error;
  }
};

/**
 * Wylogowanie użytkownika
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("logout error:", error);
    throw error;
  }
};

/**
 * Reset hasła
 * @param {string} email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("resetPassword error:", error);
    throw error;
  }
};

/**
 * Aktualizacja profilu użytkownika
 * @param {Object} data
 * @param {string} [data.displayName]
 * @param {string} [data.photoURL]
 */
export const updateUserProfile = async (data) => {
  try {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }

    await updateProfile(auth.currentUser, data);
  } catch (error) {
    console.error("updateUserProfile error:", error);
    throw error;
  }
};

/**
 * Pobranie aktualnie zalogowanego użytkownika
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listener zmian stanu autoryzacji
 * @param {(user) => void} callback
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
