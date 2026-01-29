// src/services/messageService.js

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs
} from "firebase/firestore";

import { db } from "../config/firebase";

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
 * Get all conversations for user (both sent and received messages)
 */
export async function getConversations(userId) {
  try {
    // Query messages where user is sender
    const sentQuery = query(
      collection(db, "messages"),
      where("senderId", "==", userId)
    );

    // Query messages where user is receiver
    const receivedQuery = query(
      collection(db, "messages"),
      where("receiverId", "==", userId)
    );

    // Execute both queries
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    // Combine results and remove duplicates by messageId
    const messagesMap = new Map();

    sentSnapshot.docs.forEach(d => {
      messagesMap.set(d.id, { messageId: d.id, ...d.data() });
    });

    receivedSnapshot.docs.forEach(d => {
      messagesMap.set(d.id, { messageId: d.id, ...d.data() });
    });

    // Convert to array and sort by createdAt
    const messages = Array.from(messagesMap.values()).sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    });

    return messages;
  } catch (error) {
    console.error("getConversations error:", error);
    throw new Error("Failed to get conversations");
  }
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
 * Realtime subscription for all user conversations (both sent and received)
 */
export function subscribeToConversations(userId, callback) {
  // Query messages where user is sender
  const sentQuery = query(
    collection(db, "messages"),
    where("senderId", "==", userId)
  );

  // Query messages where user is receiver
  const receivedQuery = query(
    collection(db, "messages"),
    where("receiverId", "==", userId)
  );

  // Store messages from both queries
  let sentMessages = [];
  let receivedMessages = [];

  const combineAndCallback = () => {
    // Combine results and remove duplicates by messageId
    const messagesMap = new Map();

    sentMessages.forEach(msg => {
      messagesMap.set(msg.messageId, msg);
    });

    receivedMessages.forEach(msg => {
      messagesMap.set(msg.messageId, msg);
    });

    // Convert to array and sort by createdAt
    const messages = Array.from(messagesMap.values()).sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    });

    callback(messages);
  };

  // Subscribe to sent messages
  const unsubscribeSent = onSnapshot(sentQuery, snapshot => {
    sentMessages = snapshot.docs.map(d => ({
      messageId: d.id,
      ...d.data()
    }));
    combineAndCallback();
  });

  // Subscribe to received messages
  const unsubscribeReceived = onSnapshot(receivedQuery, snapshot => {
    receivedMessages = snapshot.docs.map(d => ({
      messageId: d.id,
      ...d.data()
    }));
    combineAndCallback();
  });

  // Return cleanup function that unsubscribes from both
  return () => {
    unsubscribeSent();
    unsubscribeReceived();
  };
}
