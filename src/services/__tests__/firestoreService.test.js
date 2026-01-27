/**
 * src/services/__tests__/firestoreService.test.js
 * Fixed to avoid the template literal parse issue by using string concatenation.
 */

jest.mock('firebase/firestore', () => {
    const addDoc = jest.fn();
    const getDoc = jest.fn();
    const updateDoc = jest.fn();
    const deleteDoc = jest.fn();
    const getDocs = jest.fn();
    const onSnapshot = jest.fn();
    const collection = jest.fn((db, name) => ({ __collection: name }));
    const doc = jest.fn((db, collectionName, id) => ({ __doc: collectionName + '/' + id }));
    const query = jest.fn((colRef, ...whereClauses) => ({ __queryOf: colRef, where: whereClauses }));
    const where = jest.fn((field, op, value) => ({ field, op, value }));
    const getFirestore = jest.fn(() => ({ __db: true }));

    return {
        getFirestore,
        collection,
        doc,
        addDoc,
        getDoc,
        updateDoc,
        deleteDoc,
        query,
        where,
        onSnapshot,
        getDocs,
    };
});

const {
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    subscribeToDocument,
    subscribeToCollection,
} = require('../firestoreService');

const firestore = require('firebase/firestore');

describe('firestoreService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('createDocument success', async () => {
        const fakeRef = { id: 'abc123' };
        firestore.addDoc.mockResolvedValue(fakeRef);

        const result = await createDocument('posts', { title: 'hello' });

        expect(firestore.collection).toHaveBeenCalledWith(expect.any(Object), 'posts');
        expect(firestore.addDoc).toHaveBeenCalled();
        expect(result).toEqual({ id: 'abc123', ref: fakeRef });
    });

    test('createDocument invalid collection', async () => {
        await expect(createDocument('', {})).rejects.toThrow(/createDocument failed/);
    });

    test('getDocument returns data when exists', async () => {
        const snap = { exists: () => true, data: () => ({ title: 'x' }), id: 'doc1' };
        firestore.getDoc.mockResolvedValue(snap);

        const data = await getDocument('posts', 'doc1');
        expect(firestore.doc).toHaveBeenCalledWith(expect.any(Object), 'posts', 'doc1');
        expect(data).toEqual({ id: 'doc1', title: 'x' });
    });

    test('getDocument returns null when not exists', async () => {
        const snap = { exists: () => false };
        firestore.getDoc.mockResolvedValue(snap);

        const data = await getDocument('posts', 'nope');
        expect(data).toBeNull();
    });

    test('updateDocument calls updateDoc', async () => {
        firestore.updateDoc.mockResolvedValue();
        await expect(updateDocument('posts', 'doc2', { title: 'u' })).resolves.toBeUndefined();
        expect(firestore.updateDoc).toHaveBeenCalled();
    });

    test('updateDocument invalid args', async () => {
        await expect(updateDocument('', 'doc', {})).rejects.toThrow(/updateDocument failed/);
    });

    test('deleteDocument calls deleteDoc', async () => {
        firestore.deleteDoc.mockResolvedValue();
        await expect(deleteDocument('posts', 'docx')).resolves.toBeUndefined();
        expect(firestore.deleteDoc).toHaveBeenCalled();
    });

    test('queryDocuments without conditions', async () => {
        const docs = [
            { id: '1', data: () => ({ a: 1 }) },
            { id: '2', data: () => ({ b: 2 }) },
        ];
        firestore.getDocs.mockResolvedValue({
            forEach: (cb) => docs.forEach(cb),
        });

        const res = await queryDocuments('posts', []);
        expect(firestore.getDocs).toHaveBeenCalled();
        expect(res).toEqual([{ id: '1', a: 1 }, { id: '2', b: 2 }]);
    });

    test('queryDocuments with conditions', async () => {
        const docs = [{ id: '1', data: () => ({ a: 1 }) }];
        firestore.getDocs.mockResolvedValue({
            forEach: (cb) => docs.forEach(cb),
        });

        const conditions = [{ field: 'status', operator: '==', value: 'open' }];
        const res = await queryDocuments('posts', conditions);
        expect(firestore.where).toHaveBeenCalledWith('status', '==', 'open');
        expect(firestore.query).toHaveBeenCalled();
        expect(res).toEqual([{ id: '1', a: 1 }]);
    });

    test('subscribeToDocument calls onSnapshot and returns unsubscribe', () => {
        const unsubscribe = jest.fn();
        firestore.onSnapshot.mockImplementation((ref, onNext, onErr) => {
            onNext({ exists: () => true, id: 'doc1', data: () => ({ x: 1 }) });
            return unsubscribe;
        });

        const cb = jest.fn();
        const unsub = subscribeToDocument('posts', 'doc1', cb);
        expect(firestore.onSnapshot).toHaveBeenCalled();
        expect(cb).toHaveBeenCalledWith({ id: 'doc1', x: 1 });
        expect(unsub).toBe(unsubscribe);
    });

    test('subscribeToCollection calls onSnapshot and returns unsubscribe', () => {
        const unsubscribe = jest.fn();
        firestore.onSnapshot.mockImplementation((qOrCol, onNext) => {
            onNext({
                forEach: function (cb) {
                    const docs = [
                        { id: 'a', data: () => ({ v: 1 }) },
                        { id: 'b', data: () => ({ v: 2 }) },
                    ];
                    docs.forEach(cb);
                },
            });
            return unsubscribe;
        });

        const cb = jest.fn();
        const unsub = subscribeToCollection('posts', [], cb);
        expect(firestore.onSnapshot).toHaveBeenCalled();
        expect(cb).toHaveBeenCalledWith([{ id: 'a', v: 1 }, { id: 'b', v: 2 }]);
        expect(unsub).toBe(unsubscribe);
    });
});