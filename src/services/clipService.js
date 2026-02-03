/* Przykładowy serwis do zarządzania metadanymi klipów.
   Zakłada, że w projekcie jest już inicjalizacja Firebase w innym module
   i eksportowane są: getFirestore(), getStorage(), Timestamp, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs
*/
import { getFirestore, collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';

const db = getFirestore();
const storage = getStorage();

function storageVideoPath(userId, date) {
    return `users/${userId}/clips/${date}/video.webm`;
}
function storageThumbnailPath(userId, date) {
    return `users/${userId}/clips/${date}/thumbnail.jpg`;
}

// Zapis metadanych i uplad videoBlob (ArrayBuffer / Blob)
export async function saveClip(userId, date, videoBlob, thumbnailBlob = null) {
    // date expected YYYY-MM-DD
    const month = date.slice(0,7); // "YYYY-MM"
    const clipId = `${userId}_${date}`; // prosty id; możesz użyć auto-generated ID
    const clipRef = doc(db, 'clips', clipId);

    // upload video
    const videoRef = ref(storage, storageVideoPath(userId, date));
    await uploadBytes(videoRef, videoBlob);
    const videoUrl = await getDownloadURL(videoRef);

    let thumbnailUrl = '';
    if (thumbnailBlob) {
        const thumbRef = ref(storage, storageThumbnailPath(userId, date));
        await uploadBytes(thumbRef, thumbnailBlob);
        thumbnailUrl = await getDownloadURL(thumbRef);
    }

    const now = Timestamp.now();
    const data = {
        id: clipId,
        userId,
        date,
        videoUrl,
        thumbnailUrl,
        duration: null, // uzupełnij jeśli znasz (ms)
        createdAt: now,
        updatedAt: now,
        month,
        status: 'ready'
    };

    await setDoc(clipRef, data, { merge: true });
    return data;
}

export async function getClip(userId, date) {
    const clipId = `${userId}_${date}`;
    const clipRef = doc(db, 'clips', clipId);
    const snap = await getDoc(clipRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.userId !== userId) return null; // dodatkowe bezpieczeństwo
    return data;
}

export async function getClipsByMonth(userId, month) {
    // month: "YYYY-MM"
    const clipsCol = collection(db, 'clips');
    const q = query(clipsCol, where('userId', '==', userId), where('month', '==', month), orderBy('date', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(d => d.data());
}

export async function getUserClipDates(userId) {
    const clipsCol = collection(db, 'clips');
    const q = query(clipsCol, where('userId', '==', userId), orderBy('date', 'desc'));
    const snaps = await getDocs(q);
    return snaps.docs.map(d => d.data().date);
}

/**
 * Pobiera listę dat (YYYY-MM-DD) w danym roku/miesiącu, w których użytkownik ma klipy.
 * Przyjmuje year (number) i month (number 1-12 lub string "01"-"12").
 * Zwraca posortowaną tablicę unikalnych dat: ['2026-01-06', '2026-01-12']
 */
export async function getClipDatesForMonth(userId, year, month) {
    if (!userId) return [];

    // normalizuj month
    const monthNumber = typeof month === 'string' ? Number(month) : month;
    const monthStr = String(monthNumber).padStart(2, '0'); // '01'
    const monthKey = `${year}-${monthStr}`; // 'YYYY-MM'

    const clipsCol = collection(db, 'clips');

    // Jeżeli w dokumentach istnieje pole 'month' (zgodnie z projektem), zapytanie po equality będzie najszybsze:
    const q = query(clipsCol, where('userId', '==', userId), where('month', '==', monthKey), orderBy('date', 'asc'));

    const snaps = await getDocs(q);

    const dates = snaps.docs
        .map(d => {
            const data = d.data();
            // preferowane pole 'date' jako string YYYY-MM-DD
            if (data?.date) return data.date;
            // fallback na createdAt timestamp
            if (data?.createdAt?.toDate) return data.createdAt.toDate().toISOString().slice(0,10);
            if (data?.createdAt && data.createdAt.seconds) {
                // firestore timestamp-like object
                return new Date(data.createdAt.seconds * 1000).toISOString().slice(0,10);
            }
            return null;
        })
        .filter(Boolean);

    // unikalne i posortowane
    const unique = Array.from(new Set(dates)).sort();
    return unique;
}

export async function deleteClip(userId, date) {
    const clipId = `${userId}_${date}`;
    const clipRef = doc(db, 'clips', clipId);
    const snap = await getDoc(clipRef);
    if (!snap.exists()) return false;
    const data = snap.data();
    if (data.userId !== userId) throw new Error('Not authorized');

    // usuń pliki storage (jeśli istnieją)
    try {
        const videoRef = ref(storage, storageVideoPath(userId, date));
        await deleteObject(videoRef).catch(() => {});
        const thumbRef = ref(storage, storageThumbnailPath(userId, date));
        await deleteObject(thumbRef).catch(() => {});
    } catch (e) {
        // loguj, ale kontynuuj z usuwaniem metadanych
        console.warn('Storage delete error', e);
    }

    await deleteDoc(clipRef);
    return true;
}