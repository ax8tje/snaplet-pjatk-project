/**
 * Firestore service with common CRUD operations, queries and real-time subscriptions.
 *
 * Uses Firebase v9 modular SDK. Requires that Firebase has been initialized
 * in your app before these functions are called (so getFirestore() can use the default app).
 *
 * Each function provides basic error handling and returns resolved data or throws an Error.
 */

import {
    getFirestore,
    collection as collectionFn,
    doc as docFn,
    addDoc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc as deleteDocFn,
    query as queryFn,
    where as whereFn,
    onSnapshot,
    getDocs,
} from 'firebase/firestore';

const db = () => getFirestore();

/**
 * Create a new document in a collection.
 * @param {string} collection - Collection name.
 * @param {Object} data - Data to create.
 * @returns {Promise<{id: string, ref: any}>} Created document id and ref.
 */
export const createDocument = async (collection, data) => {
    try {
        if (!collection || typeof collection !== 'string') {
            throw new Error('Invalid collection name');
        }
        const colRef = collectionFn(db(), collection);
        const docRef = await addDoc(colRef, data);
        return { id: docRef.id, ref: docRef };
    } catch (error) {
        // Wrap error to provide clearer context
        throw new Error(`createDocument failed: ${error.message || error}`);
    }
};

/**
 * Get a single document by id.
 * @param {string} collection - Collection name.
 * @param {string} docId - Document id.
 * @returns {Promise<Object|null>} Document data including id, or null if not found.
 */
export const getDocument = async (collection, docId) => {
    try {
        if (!collection || !docId) {
            throw new Error('Invalid collection or docId');
        }
        const docRef = docFn(db(), collection, docId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    } catch (error) {
        throw new Error(`getDocument failed: ${error.message || error}`);
    }
};

/**
 * Update an existing document.
 * Note: If the document doesn't exist, updateDoc will fail. This function uses updateDoc
 * semantics via updateDoc under the hood (or setDoc with merge could be used if you prefer).
 * @param {string} collection - Collection name.
 * @param {string} docId - Document id.
 * @param {Object} data - Partial data to update.
 * @returns {Promise<void>}
 */
export const updateDocument = async (collection, docId, data) => {
    try {
        if (!collection || !docId) {
            throw new Error('Invalid collection or docId');
        }
        const docRef = docFn(db(), collection, docId);
        // Use updateDoc to only update provided fields. If you prefer create-if-not-exist use setDoc(docRef, data, { merge: true })
        await updateDoc(docRef, data);
        return;
    } catch (error) {
        throw new Error(`updateDocument failed: ${error.message || error}`);
    }
};

/**
 * Delete a document.
 * @param {string} collection - Collection name.
 * @param {string} docId - Document id.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collection, docId) => {
    try {
        if (!collection || !docId) {
            throw new Error('Invalid collection or docId');
        }
        const docRef = docFn(db(), collection, docId);
        await deleteDocFn(docRef);
        return;
    } catch (error) {
        throw new Error(`deleteDocument failed: ${error.message || error}`);
    }
};

/**
 * Query documents in a collection.
 * @param {string} collection - Collection name.
 * @param {Array<{field: string, operator: firebaseOperator, value: any}>} conditions - Array of where conditions.
 *   Example: [{ field: 'status', operator: '==', value: 'open' }]
 * @returns {Promise<Array<Object>>} Array of documents (each has id and fields).
 */
export const queryDocuments = async (collection, conditions = []) => {
    try {
        if (!collection || typeof collection !== 'string') {
            throw new Error('Invalid collection name');
        }
        const colRef = collectionFn(db(), collection);

        let q = colRef;
        if (Array.isArray(conditions) && conditions.length > 0) {
            const whereClauses = conditions.map((c) => {
                if (!c || !c.field || typeof c.operator === 'undefined') {
                    throw new Error('Invalid condition format');
                }
                return whereFn(c.field, c.operator, c.value);
            });
            q = queryFn(colRef, ...whereClauses);
        }

        const snap = await getDocs(q);
        const results = [];
        snap.forEach((docSnap) => {
            results.push({ id: docSnap.id, ...docSnap.data() });
        });
        return results;
    } catch (error) {
        throw new Error(`queryDocuments failed: ${error.message || error}`);
    }
};

/**
 * Subscribe to a single document in real-time.
 * @param {string} collection - Collection name.
 * @param {string} docId - Document id.
 * @param {(doc: Object|null) => void} callback - Callback invoked with document data or null on not found.
 * @returns {() => void} Unsubscribe function.
 */
export const subscribeToDocument = (collection, docId, callback) => {
    try {
        if (!collection || !docId || typeof callback !== 'function') {
            throw new Error('Invalid arguments for subscribeToDocument');
        }
        const docRef = docFn(db(), collection, docId);
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (!snap.exists()) {
                callback(null);
            } else {
                callback({ id: snap.id, ...snap.data() });
            }
        }, (err) => {
            // forward errors to callback as thrown Error object
            callback(new Error(`subscribeToDocument snapshot error: ${err.message || err}`));
        });
        return unsubscribe;
    } catch (error) {
        // synchronous errors (invalid args)
        throw new Error(`subscribeToDocument failed: ${error.message || error}`);
    }
};

/**
 * Subscribe to a collection (optionally filtered) in real-time.
 * @param {string} collection - Collection name.
 * @param {Array<{field: string, operator: firebaseOperator, value: any}>} conditions - Where conditions.
 * @param {(docs: Array<Object>) => void} callback - Callback invoked with array of docs when snapshot updates.
 * @returns {() => void} Unsubscribe function.
 */
export const subscribeToCollection = (collection, conditions = [], callback) => {
    try {
        if (!collection || typeof collection !== 'string' || typeof callback !== 'function') {
            throw new Error('Invalid arguments for subscribeToCollection');
        }
        const colRef = collectionFn(db(), collection);
        let q = colRef;
        if (Array.isArray(conditions) && conditions.length > 0) {
            const whereClauses = conditions.map((c) => {
                if (!c || !c.field || typeof c.operator === 'undefined') {
                    throw new Error('Invalid condition format');
                }
                return whereFn(c.field, c.operator, c.value);
            });
            q = queryFn(colRef, ...whereClauses);
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = [];
            snapshot.forEach((docSnap) => {
                docs.push({ id: docSnap.id, ...docSnap.data() });
            });
            callback(docs);
        }, (err) => {
            callback(new Error(`subscribeToCollection snapshot error: ${err.message || err}`));
        });
        return unsubscribe;
    } catch (error) {
        throw new Error(`subscribeToCollection failed: ${error.message || error}`);
    }
};