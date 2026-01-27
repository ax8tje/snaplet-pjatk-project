// src/services/userService.js

/**
 * User Profile Schema:
 * {
 *   userId: string,
 *   email: string,
 *   displayName: string,
 *   photoUrl: string,
 *   bio: string,
 *   createdAt: timestamp,
 *   points: number
 * }
 */

const { db } = require('../firebase'); // lub Twój import w projekcie

// Funkcja tworzenia użytkownika
async function createUser(userId, data) {
  try {
    await db.collection('users').doc(userId).set({
      ...data,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    console.error('createUser error:', err);
    throw new Error('USER_CREATE_FAILED');
  }
}

// Pobieranie profilu
async function getUserProfile(userId) {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (err) {
    console.error('getUserProfile error:', err);
    throw new Error('USER_FETCH_FAILED');
  }
}

// Aktualizacja
async function updateUserProfile(userId, data) {
  try {
    await db.collection('users').doc(userId).update(data);
    return { success: true };
  } catch (err) {
    console.error('updateUserProfile error:', err);
    throw new Error('USER_UPDATE_FAILED');
  }
}

// Wyszukiwanie (np. po nazwie lub mailu)
async function searchUsers(query) {
  try {
    const snapshot = await db
      .collection('users')
      .where('displayName', '>=', query)
      .where('displayName', '<=', query + '\uf8ff')
      .get();

    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('searchUsers error:', err);
    throw new Error('USER_SEARCH_FAILED');
  }
}

// Subskrypcja (live updates)
function subscribeToUser(userId, callback) {
  try {
    return db.collection('users')
      .doc(userId)
      .onSnapshot(
        (doc) => callback(doc.data()),
        (err) => console.error('subscribeToUser error:', err)
      );
  } catch (err) {
    throw new Error('USER_SUBSCRIBE_FAILED');
  }
}

module.exports = {
  createUser,
  getUserProfile,
  updateUserProfile,
  searchUsers,
  subscribeToUser
};
