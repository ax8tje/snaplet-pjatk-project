/**
 * Friend Service - zarządzanie znajomościami
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';

import { db } from '../firebase';

const FRIENDS_COLLECTION = 'friends';
const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const USERS_COLLECTION = 'users';

/**
 * Wysyła zaproszenie do znajomych
 * @param {string} senderId - ID użytkownika wysyłającego
 * @param {string} receiverId - ID użytkownika odbierającego
 */
export const sendFriendRequest = async (senderId, receiverId) => {
  if (!senderId || !receiverId) {
    throw new Error('Sender and receiver IDs are required');
  }

  if (senderId === receiverId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Check if already friends
  const areFriends = await checkFriendship(senderId, receiverId);
  if (areFriends) {
    throw new Error('Already friends');
  }

  // Check if request already exists
  const existingRequest = await getPendingRequest(senderId, receiverId);
  if (existingRequest) {
    throw new Error('Friend request already sent');
  }

  // Check if there's a pending request from the other user
  const reverseRequest = await getPendingRequest(receiverId, senderId);
  if (reverseRequest) {
    // Auto-accept the request
    await acceptFriendRequest(reverseRequest.id, receiverId, senderId);
    return { status: 'accepted' };
  }

  const requestId = `${senderId}_${receiverId}`;
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);

  await setDoc(requestRef, {
    senderId,
    receiverId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return { status: 'pending', id: requestId };
};

/**
 * Akceptuje zaproszenie do znajomych
 */
export const acceptFriendRequest = async (requestId, accepterId, senderId) => {
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error('Friend request not found');
  }

  const request = requestSnap.data();
  if (request.receiverId !== accepterId) {
    throw new Error('Not authorized to accept this request');
  }

  // Create friendship (bidirectional)
  const friendshipId1 = `${senderId}_${accepterId}`;
  const friendshipId2 = `${accepterId}_${senderId}`;

  await setDoc(doc(db, FRIENDS_COLLECTION, friendshipId1), {
    odUserId: senderId,
    userId: accepterId,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, FRIENDS_COLLECTION, friendshipId2), {
    userId: senderId,
    friendId: accepterId,
    createdAt: serverTimestamp(),
  });

  // Update friend counts
  await updateDoc(doc(db, USERS_COLLECTION, senderId), {
    friendCount: increment(1),
  }).catch(() => {});

  await updateDoc(doc(db, USERS_COLLECTION, accepterId), {
    friendCount: increment(1),
  }).catch(() => {});

  // Delete the request
  await deleteDoc(requestRef);

  return { status: 'accepted' };
};

/**
 * Odrzuca zaproszenie do znajomych
 */
export const rejectFriendRequest = async (requestId, rejecterId) => {
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error('Friend request not found');
  }

  const request = requestSnap.data();
  if (request.receiverId !== rejecterId) {
    throw new Error('Not authorized to reject this request');
  }

  await deleteDoc(requestRef);
  return { status: 'rejected' };
};

/**
 * Usuwa znajomość
 */
export const removeFriend = async (userId, friendId) => {
  const friendshipId1 = `${userId}_${friendId}`;
  const friendshipId2 = `${friendId}_${userId}`;

  await deleteDoc(doc(db, FRIENDS_COLLECTION, friendshipId1)).catch(() => {});
  await deleteDoc(doc(db, FRIENDS_COLLECTION, friendshipId2)).catch(() => {});

  // Update friend counts
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    friendCount: increment(-1),
  }).catch(() => {});

  await updateDoc(doc(db, USERS_COLLECTION, friendId), {
    friendCount: increment(-1),
  }).catch(() => {});

  return { status: 'removed' };
};

/**
 * Sprawdza czy użytkownicy są znajomymi
 */
export const checkFriendship = async (userId1, userId2) => {
  const friendshipId = `${userId1}_${userId2}`;
  const friendRef = doc(db, FRIENDS_COLLECTION, friendshipId);
  const friendSnap = await getDoc(friendRef);
  return friendSnap.exists();
};

/**
 * Pobiera oczekujące zaproszenie między użytkownikami
 */
export const getPendingRequest = async (senderId, receiverId) => {
  const requestId = `${senderId}_${receiverId}`;
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  const requestSnap = await getDoc(requestRef);

  if (requestSnap.exists() && requestSnap.data().status === 'pending') {
    return { id: requestId, ...requestSnap.data() };
  }
  return null;
};

/**
 * Pobiera status relacji między użytkownikami
 * @returns {'none' | 'friends' | 'pending_sent' | 'pending_received'}
 */
export const getFriendshipStatus = async (currentUserId, otherUserId) => {
  // Check if friends
  const areFriends = await checkFriendship(currentUserId, otherUserId);
  if (areFriends) return 'friends';

  // Check if current user sent a request
  const sentRequest = await getPendingRequest(currentUserId, otherUserId);
  if (sentRequest) return 'pending_sent';

  // Check if current user received a request
  const receivedRequest = await getPendingRequest(otherUserId, currentUserId);
  if (receivedRequest) return 'pending_received';

  return 'none';
};

/**
 * Pobiera listę znajomych użytkownika
 */
export const getUserFriends = async (userId) => {
  const friendsRef = collection(db, FRIENDS_COLLECTION);
  const q = query(friendsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  const friends = [];
  snapshot.forEach((docSnap) => {
    friends.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  return friends;
};

/**
 * Pobiera oczekujące zaproszenia dla użytkownika
 */
export const getPendingFriendRequests = async (userId) => {
  const requestsRef = collection(db, FRIEND_REQUESTS_COLLECTION);
  const q = query(
    requestsRef,
    where('receiverId', '==', userId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);

  const requests = [];
  snapshot.forEach((docSnap) => {
    requests.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  return requests;
};

/**
 * Anuluje wysłane zaproszenie
 */
export const cancelFriendRequest = async (senderId, receiverId) => {
  const requestId = `${senderId}_${receiverId}`;
  const requestRef = doc(db, FRIEND_REQUESTS_COLLECTION, requestId);
  await deleteDoc(requestRef);
  return { status: 'cancelled' };
};
