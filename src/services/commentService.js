/**
 * Comment Service - zarządzanie komentarzami w aplikacji
 *
 * Obsługuje tworzenie, pobieranie i usuwanie komentarzy.
 * Integruje się z Firebase Firestore i postService dla aktualizacji liczników.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { incrementCommentCount, decrementCommentCount } from './postService';

const COMMENTS_COLLECTION = 'comments';

/**
 * @typedef {Object} Comment
 * @property {string} id - ID komentarza
 * @property {string} postId - ID posta, do którego należy komentarz
 * @property {string} userId - ID autora komentarza
 * @property {string} text - Treść komentarza
 * @property {Object} createdAt - Timestamp utworzenia
 */

/**
 * Tworzy nowy komentarz do posta
 * @param {string} postId - ID posta do skomentowania
 * @param {string} userId - ID użytkownika tworzącego komentarz
 * @param {string} text - Treść komentarza
 * @returns {Promise<Comment>} Utworzony komentarz
 * @throws {Error} Gdy tworzenie komentarza się nie powiedzie
 */
export const createComment = async (postId, userId, text) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Comment text is required');
    }

    const commentData = {
      postId,
      userId,
      text: text.trim(),
      createdAt: serverTimestamp(),
    };

    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const docRef = await addDoc(commentsRef, commentData);

    // Zwiększ licznik komentarzy w poście
    await incrementCommentCount(postId);

    return {
      id: docRef.id,
      ...commentData,
      createdAt: new Date(), // Zwracamy lokalny czas dla immediate UI update
    };
  } catch (error) {
    console.error('createComment error:', error);
    throw new Error(`Failed to create comment: ${error.message}`);
  }
};

/**
 * Pobiera pojedynczy komentarz po ID
 * @param {string} commentId - ID komentarza do pobrania
 * @returns {Promise<Comment|null>} Komentarz lub null jeśli nie znaleziono
 * @throws {Error} Gdy pobieranie się nie powiedzie
 */
export const getComment = async (commentId) => {
  try {
    if (!commentId) {
      throw new Error('Comment ID is required');
    }

    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      return null;
    }

    return {
      id: commentSnap.id,
      ...commentSnap.data(),
    };
  } catch (error) {
    console.error('getComment error:', error);
    throw new Error(`Failed to get comment: ${error.message}`);
  }
};

/**
 * Pobiera wszystkie komentarze do posta w kolejności chronologicznej
 * @param {string} postId - ID posta
 * @returns {Promise<Comment[]>} Lista komentarzy posortowana chronologicznie
 * @throws {Error} Gdy pobieranie się nie powiedzie
 */
export const getPostComments = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    const comments = [];

    snapshot.forEach((docSnap) => {
      comments.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return comments;
  } catch (error) {
    console.error('getPostComments error:', error);
    throw new Error(`Failed to get post comments: ${error.message}`);
  }
};

/**
 * Usuwa komentarz
 * @param {string} commentId - ID komentarza do usunięcia
 * @param {string} postId - ID posta, do którego należy komentarz
 * @returns {Promise<void>}
 * @throws {Error} Gdy usuwanie się nie powiedzie
 */
export const deleteComment = async (commentId, postId) => {
  try {
    if (!commentId) {
      throw new Error('Comment ID is required');
    }

    if (!postId) {
      throw new Error('Post ID is required');
    }

    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);

    // Zmniejsz licznik komentarzy w poście
    await decrementCommentCount(postId);
  } catch (error) {
    console.error('deleteComment error:', error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};

/**
 * Subskrybuje do komentarzy posta w czasie rzeczywistym
 * @param {string} postId - ID posta
 * @param {function} callback - Funkcja wywoływana przy aktualizacji (otrzymuje tablicę komentarzy)
 * @returns {function} Funkcja do anulowania subskrypcji
 * @throws {Error} Gdy subskrypcja się nie powiedzie
 */
export const subscribeToPostComments = (postId, callback) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }

    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comments = [];
        snapshot.forEach((docSnap) => {
          comments.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        callback(comments);
      },
      (error) => {
        console.error('subscribeToPostComments error:', error);
        callback(new Error(`Comments subscription error: ${error.message}`));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('subscribeToPostComments setup error:', error);
    throw new Error(`Failed to subscribe to post comments: ${error.message}`);
  }
};
