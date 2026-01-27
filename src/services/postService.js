/**
 * Post Service - zarządzanie postami w aplikacji
 *
 * Obsługuje tworzenie, pobieranie, aktualizację i usuwanie postów.
 * Integruje się z Firebase Firestore i Storage.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as limitFn,
  startAfter,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { uploadPhoto, deletePhoto } from './storageService';

const POSTS_COLLECTION = 'posts';

/**
 * @typedef {Object} Post
 * @property {string} id - ID posta
 * @property {string} userId - ID autora
 * @property {string} imageUrl - URL głównego zdjęcia
 * @property {string} [thumbnailUrl] - URL miniaturki
 * @property {string} caption - Opis posta
 * @property {number} likes - Liczba polubień
 * @property {number} commentCount - Liczba komentarzy
 * @property {Object} createdAt - Timestamp utworzenia
 */

/**
 * Tworzy nowy post z uploadem zdjęcia
 * @param {string} userId - ID użytkownika tworzącego post
 * @param {File|Blob} imageFile - Plik zdjęcia do uploadu
 * @param {string} [caption=''] - Opis posta
 * @param {function} [onProgress] - Callback z postępem uploadu (0-100)
 * @returns {Promise<Post>} Utworzony post
 * @throws {Error} Gdy tworzenie posta się nie powiedzie
 */
export const createPost = async (userId, imageFile, caption = '', onProgress = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Upload zdjęcia z generowaniem miniaturki
    const uploadTask = uploadPhoto(imageFile, userId, 'posts', onProgress, {
      compress: true,
      generateThumb: true,
    });

    const uploadResult = await uploadTask.promise;

    // Tworzenie dokumentu posta
    const postData = {
      userId,
      imageUrl: uploadResult.downloadURL,
      thumbnailUrl: uploadResult.thumbnailURL || uploadResult.downloadURL,
      imagePath: uploadResult.fullPath,
      thumbnailPath: uploadResult.thumbnailPath || null,
      caption: caption.trim(),
      likes: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
    };

    const postsRef = collection(db, POSTS_COLLECTION);
    const docRef = await addDoc(postsRef, postData);

    return {
      id: docRef.id,
      ...postData,
      createdAt: new Date(), // Zwracamy lokalny czas dla immediate UI update
    };
  } catch (error) {
    console.error('createPost error:', error);
    throw new Error(`Failed to create post: ${error.message}`);
  }
};

/**
 * Pobiera pojedynczy post po ID
 * @param {string} postId - ID posta do pobrania
 * @returns {Promise<Post|null>} Post lub null jeśli nie znaleziono
 * @throws {Error} Gdy pobieranie się nie powiedzie
 */
export const getPost = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return null;
    }

    return {
      id: postSnap.id,
      ...postSnap.data(),
    };
  } catch (error) {
    console.error('getPost error:', error);
    throw new Error(`Failed to get post: ${error.message}`);
  }
};

/**
 * Aktualizuje istniejący post
 * @param {string} postId - ID posta do aktualizacji
 * @param {Object} data - Dane do aktualizacji (np. { caption: 'nowy opis' })
 * @returns {Promise<void>}
 * @throws {Error} Gdy aktualizacja się nie powiedzie
 */
export const updatePost = async (postId, data) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Update data is required');
    }

    // Nie pozwalamy na bezpośrednią zmianę likes i commentCount
    const { likes, commentCount, userId, createdAt, ...safeData } = data;

    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      ...safeData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('updatePost error:', error);
    throw new Error(`Failed to update post: ${error.message}`);
  }
};

/**
 * Usuwa post wraz ze zdjęciami ze storage
 * @param {string} postId - ID posta do usunięcia
 * @returns {Promise<void>}
 * @throws {Error} Gdy usuwanie się nie powiedzie
 */
export const deletePost = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    // Pobierz post żeby uzyskać ścieżki do zdjęć
    const post = await getPost(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Usuń zdjęcia ze storage
    const deletePromises = [];

    if (post.imagePath) {
      deletePromises.push(
        deletePhoto(post.imagePath).catch((err) => {
          console.warn('Failed to delete main image:', err);
        })
      );
    }

    if (post.thumbnailPath) {
      deletePromises.push(
        deletePhoto(post.thumbnailPath).catch((err) => {
          console.warn('Failed to delete thumbnail:', err);
        })
      );
    }

    await Promise.all(deletePromises);

    // Usuń dokument posta
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('deletePost error:', error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

/**
 * Pobiera posty do feedu z paginacją
 * @param {number} [postsLimit=10] - Liczba postów do pobrania
 * @param {Object} [lastDoc=null] - Ostatni dokument z poprzedniej strony (dla paginacji)
 * @returns {Promise<{posts: Post[], lastDoc: Object|null, hasMore: boolean}>}
 * @throws {Error} Gdy pobieranie się nie powiedzie
 */
export const getFeedPosts = async (postsLimit = 10, lastDoc = null) => {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);

    let q;
    if (lastDoc) {
      q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limitFn(postsLimit + 1) // +1 żeby sprawdzić czy jest więcej
      );
    } else {
      q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limitFn(postsLimit + 1)
      );
    }

    const snapshot = await getDocs(q);
    const posts = [];
    let newLastDoc = null;

    snapshot.forEach((docSnap, index) => {
      if (index < postsLimit) {
        posts.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
        newLastDoc = docSnap;
      }
    });

    const hasMore = snapshot.docs.length > postsLimit;

    return {
      posts,
      lastDoc: newLastDoc,
      hasMore,
    };
  } catch (error) {
    console.error('getFeedPosts error:', error);
    throw new Error(`Failed to get feed posts: ${error.message}`);
  }
};

/**
 * Pobiera posty konkretnego użytkownika
 * @param {string} userId - ID użytkownika
 * @param {number} [postsLimit=20] - Maksymalna liczba postów
 * @returns {Promise<Post[]>} Lista postów użytkownika
 * @throws {Error} Gdy pobieranie się nie powiedzie
 */
export const getUserPosts = async (userId, postsLimit = 20) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const postsRef = collection(db, POSTS_COLLECTION);
    const q = query(
      postsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limitFn(postsLimit)
    );

    const snapshot = await getDocs(q);
    const posts = [];

    snapshot.forEach((docSnap) => {
      posts.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return posts;
  } catch (error) {
    console.error('getUserPosts error:', error);
    throw new Error(`Failed to get user posts: ${error.message}`);
  }
};

/**
 * Subskrybuje do feedu w czasie rzeczywistym
 * @param {function} callback - Funkcja wywoływana przy aktualizacji (otrzymuje tablicę postów)
 * @param {number} [postsLimit=20] - Liczba postów do obserwowania
 * @returns {function} Funkcja do anulowania subskrypcji
 * @throws {Error} Gdy subskrypcja się nie powiedzie
 */
export const subscribeToFeed = (callback, postsLimit = 20) => {
  try {
    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }

    const postsRef = collection(db, POSTS_COLLECTION);
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limitFn(postsLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts = [];
        snapshot.forEach((docSnap) => {
          posts.push({
            id: docSnap.id,
            ...docSnap.data(),
          });
        });
        callback(posts);
      },
      (error) => {
        console.error('subscribeToFeed error:', error);
        callback(new Error(`Feed subscription error: ${error.message}`));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('subscribeToFeed setup error:', error);
    throw new Error(`Failed to subscribe to feed: ${error.message}`);
  }
};

/**
 * Subskrybuje do pojedynczego posta w czasie rzeczywistym
 * @param {string} postId - ID posta
 * @param {function} callback - Funkcja wywoływana przy aktualizacji
 * @returns {function} Funkcja do anulowania subskrypcji
 */
export const subscribeToPost = (postId, callback) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);

    const unsubscribe = onSnapshot(
      postRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('subscribeToPost error:', error);
        callback(new Error(`Post subscription error: ${error.message}`));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('subscribeToPost setup error:', error);
    throw new Error(`Failed to subscribe to post: ${error.message}`);
  }
};

/**
 * Zwiększa liczbę polubień posta o 1
 * @param {string} postId - ID posta
 * @returns {Promise<void>}
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const incrementLikeCount = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      likes: increment(1),
    });
  } catch (error) {
    console.error('incrementLikeCount error:', error);
    throw new Error(`Failed to increment like count: ${error.message}`);
  }
};

/**
 * Zmniejsza liczbę polubień posta o 1
 * @param {string} postId - ID posta
 * @returns {Promise<void>}
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const decrementLikeCount = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      likes: increment(-1),
    });
  } catch (error) {
    console.error('decrementLikeCount error:', error);
    throw new Error(`Failed to decrement like count: ${error.message}`);
  }
};

/**
 * Zwiększa liczbę komentarzy posta o 1
 * @param {string} postId - ID posta
 * @returns {Promise<void>}
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const incrementCommentCount = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });
  } catch (error) {
    console.error('incrementCommentCount error:', error);
    throw new Error(`Failed to increment comment count: ${error.message}`);
  }
};

/**
 * Zmniejsza liczbę komentarzy posta o 1
 * @param {string} postId - ID posta
 * @returns {Promise<void>}
 * @throws {Error} Gdy operacja się nie powiedzie
 */
export const decrementCommentCount = async (postId) => {
  try {
    if (!postId) {
      throw new Error('Post ID is required');
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      commentCount: increment(-1),
    });
  } catch (error) {
    console.error('decrementCommentCount error:', error);
    throw new Error(`Failed to decrement comment count: ${error.message}`);
  }
};
