// src/services/messageService.js

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebase";

/**
 * Send message between users
 */
export async function sendMessage(senderId, receiverId, text) {
  try {
    await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      text,
      read: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    throw new Error("Failed to send message");
  }
}

/**
 * Get conversation between two users (chronological order)
 */
export function getConversation(userId1, userId2) {
  const q = query(
    collection(db, "messages"),
    where("senderId", "in", [userId1, userId2]),
    where("receiverId", "in", [userId1, userId2]),
    orderBy("createdAt", "asc")
  );

  return new Promise((resolve, reject) => {
    onSnapshot(
      q,
      snapshot => {
        const messages = snapshot.docs.map(d => ({
          messageId: d.id,
          ...d.data()
        }));
        resolve(messages);
      },
      error => reject(error)
    );
  });
}

/**
 * Get all conversations for user
 */
export function getConversations(userId) {
  const q = query(
    collection(db, "messages"),
    where("senderId", "==", userId),
    orderBy("createdAt", "asc")
  );

  return new Promise((resolve, reject) => {
    onSnapshot(
      q,
      snapshot => {
        const messages = snapshot.docs.map(d => ({
          messageId: d.id,
          ...d.data()
        }));
        resolve(messages);
      },
      error => reject(error)
    );
  });
}

/**
 * Mark message as read
 */
export async function markMessageRead(messageId) {
  try {
    const ref = doc(db, "messages", messageId);
    await updateDoc(ref, { read: true });
  } catch (error) {
    console.error("markMessageRead error:", error);
    throw new Error("Failed to mark message as read");
  }
}

/**
 * Realtime subscription for conversation
 */
export function subscribeToConversation(userId1, userId2, callback) {
  const q = query(
    collection(db, "messages"),
    where("senderId", "in", [userId1, userId2]),
    where("receiverId", "in", [userId1, userId2]),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(d => ({
      messageId: d.id,
      ...d.data()
    }));
    callback(messages);
  });
}

/**
 * Realtime subscription for all user conversations
 */
export function subscribeToConversations(userId, callback) {
  const q = query(
    collection(db, "messages"),
    where("receiverId", "==", userId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, snapshot => {
    const messages = snapshot.docs.map(d => ({
      messageId: d.id,
      ...d.data()
    }));
    callback(messages);
  });
}
