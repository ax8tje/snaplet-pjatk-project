// Testy jednostkowe clipService z mockami Firebase SDK (Jest)
jest.mock('firebase/firestore', () => {
    const setDoc = jest.fn();
    const getDoc = jest.fn();
    const deleteDoc = jest.fn();
    const getDocs = jest.fn();
    const collection = jest.fn();
    const doc = jest.fn((db, col, id) => ({ _col: col, _id: id }));
    const query = jest.fn();
    const where = jest.fn();
    const orderBy = jest.fn();
    const Timestamp = { now: jest.fn(() => ({ seconds: 1 })) };

    return {
        getFirestore: jest.fn(() => ({})),
        collection,
        doc,
        setDoc,
        getDoc,
        deleteDoc,
        getDocs,
        query,
        where,
        orderBy,
        Timestamp,
    };
});

jest.mock('firebase/storage', () => {
    const uploadBytes = jest.fn();
    const getDownloadURL = jest.fn();
    const ref = jest.fn((storage, path) => ({ _path: path }));
    const deleteObject = jest.fn(() => ({
        catch: jest.fn(),
    }));
    return {
        getStorage: jest.fn(() => ({})),
        uploadBytes,
        getDownloadURL,
        ref,
        deleteObject,
    };
});

const {
    setDoc,
    getDoc,
    deleteDoc,
    getDocs
} = require('firebase/firestore');
const {
    uploadBytes,
    getDownloadURL,
    deleteObject
} = require('firebase/storage');

const clipService = require('../clipService'); // adjust path if needed

describe('clipService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('saveClip upladuje plik i tworzy dokument', async () => {
        // przygotowanie mocków
        uploadBytes.mockResolvedValueOnce({});
        getDownloadURL.mockResolvedValueOnce('https://storage/video.webm');
        // setDoc jest częścią firebase/firestore mock (jest.fn())
        setDoc.mockResolvedValueOnce();

        const userId = 'alice-uid';
        const date = '2026-01-30';
        const fakeBlob = Buffer.from('video');

        const data = await clipService.saveClip(userId, date, fakeBlob);

        expect(uploadBytes).toHaveBeenCalled();
        expect(getDownloadURL).toHaveBeenCalled();
        expect(setDoc).toHaveBeenCalled();
        expect(data.userId).toBe(userId);
        expect(data.date).toBe(date);
        expect(data.videoUrl).toBe('https://storage/video.webm');
        expect(data.month).toBe('2026-01');
        expect(data.status).toBe('ready');
    });

    test('deleteClip usuwa storage i dokument', async () => {
        // getDoc powinien zwrócić snapshot z exists true i data.userId = owner
        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ userId: 'alice-uid' }) });
        deleteObject.mockResolvedValueOnce();
        deleteDoc.mockResolvedValueOnce();

        const result = await clipService.deleteClip('alice-uid', '2026-01-30');

        expect(getDoc).toHaveBeenCalled();
        expect(deleteObject).toHaveBeenCalled();
        expect(deleteDoc).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    test('deleteClip zwraca false jeśli dokument nie istnieje', async () => {
        getDoc.mockResolvedValueOnce({ exists: () => false });
        const result = await clipService.deleteClip('alice-uid', '2026-01-30');
        expect(result).toBe(false);
    });
});