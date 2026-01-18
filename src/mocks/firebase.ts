// Mock Firebase for web deployment
// This allows the app to run without actual Firebase configuration

export default () => ({
  auth: () => ({
    currentUser: null,
    signInWithEmailAndPassword: async () => ({ user: null }),
    createUserWithEmailAndPassword: async () => ({ user: null }),
    signOut: async () => {},
    onAuthStateChanged: () => () => {},
  }),
});

export const firebase = {
  auth: () => ({
    currentUser: null,
    signInWithEmailAndPassword: async () => ({ user: null }),
    createUserWithEmailAndPassword: async () => ({ user: null }),
    signOut: async () => {},
    onAuthStateChanged: () => () => {},
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        set: async () => {},
        get: async () => ({ exists: false, data: () => ({}) }),
        update: async () => {},
        delete: async () => {},
      }),
      add: async () => ({ id: 'mock-id' }),
      where: () => ({
        get: async () => ({ docs: [] }),
      }),
    }),
  }),
  storage: () => ({
    ref: () => ({
      putFile: async () => ({ state: 'success' }),
      getDownloadURL: async () => 'https://via.placeholder.com/150',
    }),
  }),
};
