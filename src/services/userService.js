import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * @typedef {Object} UserProfile
 * @property {string} userId
 * @property {string} email
 * @property {string} displayName
 * @property {string} photoURL
 * @property {string} bio
 * @property {number} createdAt
 * @property {number} postCount
 */

const USERS_COLLECTION = "users";

/**
 * Create user profile
 */
export async function createUserProfile(userId, data) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);

  const profile = {
    userId,
    email: data.email || "",
    displayName: data.displayName || "",
    photoURL: data.photoURL || "",
    bio: data.bio || "",
    createdAt: Date.now(),
    postCount: 0,
  };

  await setDoc(userRef, profile);
  return profile;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error("User not found");
  }

  return snap.data();
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, data) {
  const userRef = doc(db, USERS_COLLECTION, userId);

  await updateDoc(userRef, data);

  const updated = await getUserProfile(userId);
  return updated;
}

/**
 * Get user posts (basic implementation)
 */
export async function getUserPosts(userId) {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

/**
 * Search users by displayName
 */
export async function searchUsers(queryText) {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    where("displayName", ">=", queryText),
    where("displayName", "<=", queryText + "\uf8ff")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

/**
 * Subscribe to user profile changes
 */
export function subscribeToUser(userId, callback) {
  const userRef = doc(db, USERS_COLLECTION, userId);

  const unsubscribe = onSnapshot(userRef, snap => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });

  return unsubscribe;
}
