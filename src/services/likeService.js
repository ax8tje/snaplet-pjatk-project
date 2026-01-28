/**
 * Like Service - zarządzanie polubieniami postów
 *
 * Obsługuje dodawanie, usuwanie i pobieranie polubień.
 * Integruje się z Firebase Firestore.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { incrementLikeCount, decrementLikeCount } from './postService';

const LIKES_COLLECTION = 'likes';

/**
 * @typedef {Object} Like
 * @property {string} id - ID polubienia (format: postId_userId)
 * @property {string} postId - ID posta
 * @property {string} userId - ID użytkownika
 * @property {Object} createdAt - Timestamp utworzenia
 */

/**
 * Generuje composite key dla like'a
 * @param {string} postId - ID posta
 * @param {string} userId - ID użytkownika
 * @returns {string} Composite key w formacie postId_userId
 */
const generateLikeId = (postId, userId) => `${postId}_${userId}`;

/**
 * Dodaje polubienie do posta
 * @param {string} postId - ID posta do polubienia
 * @param {string} userId - ID użytkownika który lubi post
 * @returns {Promise<Like>} Utworzone polubienie
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const likePost = async (postId, userId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const likeId = generateLikeId(postId, userId);
    const likeRef = doc(db, LIKES_COLLECTION, likeId);

    // Sprawdź czy like już istnieje
    const existingLike = await getDoc(likeRef);
    if (existingLike.exists()) {
      throw new Error('Post already liked by this user');
    }

    const likeData = {
      postId,
      userId,
      createdAt: serverTimestamp(),
    };

    // Użyj setDoc z określonym ID (composite key) żeby zapobiec duplikatom
    await setDoc(likeRef, likeData);

    // Zwiększ licznik polubień na poście
    await incrementLikeCount(postId);

    return {
      id: likeId,
      ...likeData,
      createdAt: new Date(), // Zwróć lokalny czas dla immediate UI update
    };
  } catch (error) {
    console.error('likePost error:', error);
    throw new Error(`Failed to like post: ${error.message}`);
  }
};

/**
 * Usuwa polubienie z posta
 * @param {string} postId - ID posta
 * @param {string} userId - ID użytkownika
 * @returns {Promise<void>}
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const unlikePost = async (postId, userId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const likeId = generateLikeId(postId, userId);
    const likeRef = doc(db, LIKES_COLLECTION, likeId);

    // Sprawdź czy like istnieje
    const existingLike = await getDoc(likeRef);
    if (!existingLike.exists()) {
      throw new Error('Like not found');
    }

    // Usuń like
    await deleteDoc(likeRef);

    // Zmniejsz licznik polubień na poście
    await decrementLikeCount(postId);
  } catch (error) {
    console.error('unlikePost error:', error);
    throw new Error(`Failed to unlike post: ${error.message}`);
  }
};

/**
 * Sprawdza czy użytkownik polubił post
 * @param {string} postId - ID posta
 * @param {string} userId - ID użytkownika
 * @returns {Promise<boolean>} True jeśli użytkownik polubił post
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const isPostLikedByUser = async (postId, userId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const likeId = generateLikeId(postId, userId);
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    const likeSnap = await getDoc(likeRef);

    return likeSnap.exists();
  } catch (error) {
    console.error('isPostLikedByUser error:', error);
    throw new Error(`Failed to check like status: ${error.message}`);
  }
};

/**
 * Pobiera wszystkie polubienia dla posta
 * @param {string} postId - ID posta
 * @returns {Promise<Like[]>} Lista polubień
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const getPostLikes = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const likes = [];

    snapshot.forEach((docSnap) => {
      likes.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return likes;
  } catch (error) {
    console.error('getPostLikes error:', error);
    throw new Error(`Failed to get post likes: ${error.message}`);
  }
};

/**
 * Subskrybuje do polubień posta w czasie rzeczywistym
 * @param {string} postId - ID posta
 * @param {function} callback - Funkcja wywoływana przy aktualizacji (otrzymuje tablicę polubień)
 * @returns {function} Funkcja do anulowania subskrypcji
 * @throws {Error} Gdy subskrypcja się nie powiedzie
 */
export const subscribeToPostLikes = (postId, callback) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }

    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const likes = [];
        snapshot.forEach((docSnap) => {
          likes.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        callback(likes);
      },
      (error) => {
        console.error('subscribeToPostLikes error:', error);
        callback(new Error(`Likes subscription error: ${error.message}`));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('subscribeToPostLikes setup error:', error);
    throw new Error(`Failed to subscribe to post likes: ${error.message}`);
  }
};

/**
 * Pobiera polubienia użytkownika
 * @param {string} userId - ID użytkownika
 * @returns {Promise<Like[]>} Lista polubień użytkownika
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const getUserLikes = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const likes = [];

    snapshot.forEach((docSnap) => {
      likes.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return likes;
  } catch (error) {
    console.error('getUserLikes error:', error);
    throw new Error(`Failed to get user likes: ${error.message}`);
  }
};
