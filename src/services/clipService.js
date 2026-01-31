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