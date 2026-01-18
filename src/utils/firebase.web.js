// Web fallback for Firebase React Native modules
// This allows the app to build for web without Firebase native dependencies
// For a real implementation, use Firebase JS SDK (firebase/app, firebase/auth, etc.)

console.warn('Firebase Native modules not available on web. Using mock implementation.');
console.info('To enable Firebase on web, install and configure Firebase JS SDK.');

// Mock Firebase App
export default () => ({
  name: '[DEFAULT]',
});

// Mock Firebase Auth
export const auth = () => ({
  currentUser: null,
  signInWithEmailAndPassword: async () => {
    throw new Error('Firebase Auth not configured for web');
  },
  createUserWithEmailAndPassword: async () => {
    throw new Error('Firebase Auth not configured for web');
  },
  signOut: async () => {
    throw new Error('Firebase Auth not configured for web');
  },
  onAuthStateChanged: () => () => {},
});

// Mock Firebase Firestore
export const firestore = () => ({
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false }),
      set: async () => {},
      update: async () => {},
      delete: async () => {},
    }),
    get: async () => ({ docs: [] }),
    add: async () => {},
    where: () => ({
      get: async () => ({ docs: [] }),
    }),
  }),
});

// Mock Firebase Storage
export const storage = () => ({
  ref: () => ({
    putFile: async () => {},
    getDownloadURL: async () => '',
  }),
});

// Export for different import styles
module.exports = () => ({});
module.exports.default = () => ({});
module.exports.auth = auth;
module.exports.firestore = firestore;
module.exports.storage = storage;
