import { getClipsByMonth } from './clipService';
import { getStorage, ref, getBytes } from 'firebase/storage';

let ffmpegInstance = null;
let ffmpegLoading = false;
let ffmpegReady = false;
let FFmpegModule = null;

/**
 * Dynamicznie laduje modul @ffmpeg/ffmpeg i @ffmpeg/util
 */
async function loadFFmpegModule() {
    if (FFmpegModule) return FFmpegModule;

    const [ffmpegPkg, utilPkg] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
    ]);

    FFmpegModule = {
        FFmpeg: ffmpegPkg.FFmpeg,
        toBlobURL: utilPkg.toBlobURL,
    };

    return FFmpegModule;
}

/**
 * Zwraca singleton instancji FFmpeg, ladujac ja jesli to konieczne.
 * @param {function} [onLog] - callback do logowania
 * @returns {Promise<FFmpeg>}
 */
async function getFFmpeg(onLog) {
    if (ffmpegReady && ffmpegInstance) return ffmpegInstance;
    if (ffmpegLoading) {
        // czekaj az inna instancja zaladuje
        while (ffmpegLoading) {
            await new Promise(r => setTimeout(r, 100));
        }
        if (ffmpegReady && ffmpegInstance) return ffmpegInstance;
    }

    ffmpegLoading = true;

    try {
        const { FFmpeg, toBlobURL } = await loadFFmpegModule();
        const ffmpeg = new FFmpeg();

        if (onLog) {
            ffmpeg.on('log', ({ message }) => {
                onLog(message);
            });
        }

        // Use single-threaded core (0.12.10) — no SharedArrayBuffer/COOP/COEP needed
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegInstance = ffmpeg;
        ffmpegReady = true;
        return ffmpeg;
    } catch (err) {
        console.error('Blad ladowania FFmpeg:', err);
        throw new Error('Nie udalo sie zaladowac FFmpeg. Sprawdz polaczenie internetowe.');
    } finally {
        ffmpegLoading = false;
    }
}

/**
 * Wyodrebnia sciezke Storage z Firebase Storage URL.
 * @param {string} url - Firebase Storage download URL
 * @returns {string|null} - sciezka w Storage lub null
 */
function extractStoragePath(url) {
    try {
        // Format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?alt=media&token=...
        const match = url.match(/\/o\/([^?]+)/);
        if (match && match[1]) {
            return decodeURIComponent(match[1]);
        }
    } catch (e) {
        console.warn('Nie udalo sie wyodrebnic sciezki z URL:', e);
    }
    return null;
}

/**
 * Pobiera blob z Firebase Storage (obsluguje CORS przez SDK).
 * @param {string} url - Firebase Storage download URL
 * @returns {Promise<Uint8Array>}
 */
async function fetchClipData(url) {
    const storagePath = extractStoragePath(url);

    if (storagePath) {
        // Uzyj Firebase SDK - omija problemy z CORS
        try {
            const storage = getStorage();
            const fileRef = ref(storage, storagePath);
            const arrayBuffer = await getBytes(fileRef);
            return new Uint8Array(arrayBuffer);
        } catch (sdkError) {
            console.warn('Firebase SDK fetch failed, trying direct fetch:', sdkError);
        }
    }

    // Fallback do zwyklego fetch
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Blad pobierania klipu: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

/**
 * Generuje miesieczny film z klipow uzytkownika.
 *
 * @param {string} userId - ID uzytkownika
 * @param {string} monthKey - klucz miesiaca "YYYY-MM"
 * @param {object} [options]
 * @param {function} [options.onProgress] - callback (0-100)
 * @param {function} [options.onLog] - callback do logow ffmpeg
 * @param {function} [options.onStatus] - callback statusu tekstowego
 * @returns {Promise<{blob: Blob, filename: string, clipCount: number, duration: number}>}
 */
export async function generateMonthlyVideo(userId, monthKey, options = {}) {
    const { onProgress, onLog, onStatus } = options;

    const reportProgress = (pct) => onProgress && onProgress(Math.min(100, Math.max(0, Math.round(pct))));
    const reportStatus = (msg) => onStatus && onStatus(msg);

    // 1. Pobierz metadane klipow z Firestore
    reportStatus('Pobieranie listy klipow...');
    reportProgress(0);

    const clips = await getClipsByMonth(userId, monthKey);

    if (!clips || clips.length === 0) {
        throw new Error('Brak klipow w wybranym miesiacu.');
    }

    // Sortuj chronologicznie
    const sortedClips = clips
        .filter(c => c.videoUrl && c.status !== 'error')
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    if (sortedClips.length === 0) {
        throw new Error('Brak gotowych klipow do polaczenia.');
    }

    reportStatus(`Znaleziono ${sortedClips.length} klipow. Ladowanie FFmpeg...`);
    reportProgress(5);

    // 2. Zaladuj FFmpeg
    const ffmpeg = await getFFmpeg(onLog);
    reportProgress(10);

    // 3. Pobierz klipy i zapisz w systemie plikow FFmpeg
    const totalClips = sortedClips.length;
    const fileNames = [];

    for (let i = 0; i < totalClips; i++) {
        const clip = sortedClips[i];
        const progressBase = 10 + (i / totalClips) * 50; // 10-60%

        reportStatus(`Pobieranie klipu ${i + 1}/${totalClips} (${clip.date})...`);
        reportProgress(progressBase);

        try {
            const data = await fetchClipData(clip.videoUrl);
            const ext = (clip.videoUrl || '').includes('.mp4') ? 'mp4' : 'webm';
            const inputName = `input_${i}.${ext}`;

            await ffmpeg.writeFile(inputName, data);

            // Konwertuj do ujednoliconego formatu (mp4 h264) dla kompatybilnosci
            const normalizedName = `norm_${i}.mp4`;
            await ffmpeg.exec([
                '-i', inputName,
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-ar', '44100',
                '-ac', '2',
                '-r', '30',
                '-vf', 'scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:black',
                '-y',
                normalizedName,
            ]);

            fileNames.push(normalizedName);

            // Usun plik wejsciowy zeby oszczedzic pamiec
            await ffmpeg.deleteFile(inputName);
        } catch (err) {
            console.warn(`Blad przetwarzania klipu ${clip.date}:`, err);
            // Kontynuuj z nastepnym klipem
        }

        reportProgress(10 + ((i + 1) / totalClips) * 50);
    }

    if (fileNames.length === 0) {
        throw new Error('Zaden klip nie zostal poprawnie przetworzony.');
    }

    // 4. Stworz plik concat
    reportStatus('Laczenie klipow...');
    reportProgress(65);

    const concatContent = fileNames.map(f => `file '${f}'`).join('\n');
    const encoder = new TextEncoder();
    await ffmpeg.writeFile('filelist.txt', encoder.encode(concatContent));

    // 5. Polacz klipy
    reportProgress(70);

    await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        'output.mp4',
    ]);

    reportProgress(90);
    reportStatus('Finalizacja...');

    // 6. Odczytaj wynikowy plik
    const outputData = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([outputData.buffer], { type: 'video/mp4' });

    // 7. Cleanup - usun pliki z pamieci
    for (const f of fileNames) {
        try { await ffmpeg.deleteFile(f); } catch (_) {}
    }
    try { await ffmpeg.deleteFile('filelist.txt'); } catch (_) {}
    try { await ffmpeg.deleteFile('output.mp4'); } catch (_) {}

    reportProgress(100);
    reportStatus('Gotowe!');

    const filename = `snaplet_${monthKey}.mp4`;
    const duration = fileNames.length * 2; // kazdy klip ~2s

    return {
        blob,
        filename,
        clipCount: fileNames.length,
        duration,
    };
}

/**
 * Pobiera film na dysk uzytkownika.
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadVideo(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Udostepnia film przez Web Share API (jesli dostepne).
 * @param {Blob} blob
 * @param {string} filename
 * @returns {Promise<boolean>} true jesli udostepniono
 */
export async function shareVideo(blob, filename) {
    if (!navigator.share || !navigator.canShare) {
        return false;
    }

    const file = new File([blob], filename, { type: 'video/mp4' });

    if (!navigator.canShare({ files: [file] })) {
        return false;
    }

    try {
        await navigator.share({
            files: [file],
            title: `Film miesieczny - ${filename}`,
            text: 'Moj miesieczny film z Snaplet!',
        });
        return true;
    } catch (err) {
        if (err.name === 'AbortError') return false;
        throw err;
    }
}

/**
 * Sprawdza czy przegladarka obsluguje ffmpeg.wasm (single-threaded, wymaga tylko WebAssembly).
 * @returns {boolean}
 */
export function isFFmpegSupported() {
    return typeof WebAssembly !== 'undefined';
}
