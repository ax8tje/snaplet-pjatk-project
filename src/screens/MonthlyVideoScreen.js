import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getClipsByMonth } from '../services/clipService';
import {
    generateMonthlyVideo,
    downloadVideo,
    shareVideo,
    isFFmpegSupported,
} from '../services/videoProcessingService';
import './MonthlyVideoScreen.css';

const MONTH_NAMES = [
    'Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien',
];

export default function MonthlyVideoScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentUser = useUserStore((state) => state.user);
    const userId = currentUser?.uid || null;

    // Odczytaj miesiac z URL params albo uzyj biezacego
    const today = new Date();
    const paramMonth = searchParams.get('month'); // "YYYY-MM"
    const initialYear = paramMonth ? parseInt(paramMonth.slice(0, 4), 10) : today.getFullYear();
    const initialMonth = paramMonth ? parseInt(paramMonth.slice(5, 7), 10) : today.getMonth() + 1;

    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    const [clipCount, setClipCount] = useState(null);
    const [loading, setLoading] = useState(true);

    // Generowanie
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);

    // Wynik
    const [result, setResult] = useState(null); // { blob, filename, clipCount, duration }
    const [videoUrl, setVideoUrl] = useState(null);
    const videoRef = useRef(null);

    // Logi ffmpeg (debug)
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);

    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const monthName = MONTH_NAMES[month - 1];
    const canShare = typeof navigator !== 'undefined' && !!navigator.share;
    const supported = isFFmpegSupported();

    // Laduj ilosc klipow w miesiacu
    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        getClipsByMonth(userId, monthKey)
            .then(clips => {
                const readyClips = clips.filter(c => c.videoUrl && c.status !== 'error');
                setClipCount(readyClips.length);
            })
            .catch(err => {
                console.error('Blad pobierania klipow:', err);
                setClipCount(0);
            })
            .finally(() => setLoading(false));
    }, [userId, monthKey]);

    // Cleanup video URL on unmount
    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [videoUrl]);

    const prevMonth = () => {
        let ny = year, nm = month - 1;
        if (nm < 1) { nm = 12; ny -= 1; }
        setYear(ny); setMonth(nm);
        resetResult();
    };

    const nextMonth = () => {
        let ny = year, nm = month + 1;
        if (nm > 12) { nm = 1; ny += 1; }
        setYear(ny); setMonth(nm);
        resetResult();
    };

    const resetResult = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setResult(null);
        setVideoUrl(null);
        setProgress(0);
        setStatus('');
        setError(null);
        setLogs([]);
    };

    const handleGenerate = useCallback(async () => {
        if (!userId || generating) return;

        resetResult();
        setGenerating(true);
        setError(null);

        try {
            const res = await generateMonthlyVideo(userId, monthKey, {
                onProgress: setProgress,
                onStatus: setStatus,
                onLog: (msg) => setLogs(prev => [...prev.slice(-200), msg]),
            });

            setResult(res);
            const url = URL.createObjectURL(res.blob);
            setVideoUrl(url);
        } catch (err) {
            console.error('Blad generowania:', err);
            setError(err.message || 'Wystapil nieoczekiwany blad.');
        } finally {
            setGenerating(false);
        }
    }, [userId, monthKey, generating]);

    const handleDownload = () => {
        if (result) downloadVideo(result.blob, result.filename);
    };

    const handleShare = async () => {
        if (!result) return;
        const shared = await shareVideo(result.blob, result.filename);
        if (!shared) {
            // Fallback: download
            handleDownload();
        }
    };

    const handleBack = () => {
        navigate('/calendar');
    };

    if (!userId) {
        return (
            <div className="mv-root">
                <div className="mv-inner">
                    <p className="mv-message">Zaloguj sie, aby generowac filmy.</p>
                    <button className="mv-btn mv-btn-primary" onClick={() => navigate('/login')}>
                        Zaloguj sie
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mv-root">
            <div className="mv-inner">
                {/* Header */}
                <div className="mv-header">
                    <button className="mv-back-btn" onClick={handleBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className="mv-title">Film miesieczny</h1>
                    <div style={{ width: 36 }} />
                </div>

                {/* Wybor miesiaca */}
                <div className="mv-month-selector">
                    <button className="mv-month-nav" onClick={prevMonth} disabled={generating}>
                        &#9664;
                    </button>
                    <div className="mv-month-label">
                        {monthName} {year}
                    </div>
                    <button className="mv-month-nav" onClick={nextMonth} disabled={generating}>
                        &#9654;
                    </button>
                </div>

                {/* Info o klipach */}
                <div className="mv-info-card">
                    {loading ? (
                        <p className="mv-info-text">Ladowanie...</p>
                    ) : (
                        <>
                            <p className="mv-info-text">
                                <span className="mv-info-icon">&#127909;</span>
                                {clipCount} {clipCount === 1 ? 'klip' : 'klipow'} ({(clipCount || 0) * 2}s)
                            </p>
                            {clipCount === 0 && (
                                <p className="mv-info-hint">Brak klipow w tym miesiacu.</p>
                            )}
                        </>
                    )}
                </div>

                {/* WebAssembly warning */}
                {!supported && (
                    <div className="mv-warning">
                        <strong>Uwaga:</strong> Twoja przegladarka nie obsluguje WebAssembly.
                        Generowanie filmow wymaga nowoczesnej przegladarki (Chrome, Firefox, Edge, Safari).
                    </div>
                )}

                {/* Przycisk generowania */}
                {!result && (
                    <button
                        className="mv-btn mv-btn-generate"
                        onClick={handleGenerate}
                        disabled={generating || !clipCount || !supported}
                    >
                        {generating ? 'Generowanie...' : 'Wygeneruj film'}
                    </button>
                )}

                {/* Progress */}
                {generating && (
                    <div className="mv-progress-section">
                        <div className="mv-progress-bar">
                            <div
                                className="mv-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mv-progress-text">{progress}%</p>
                        <p className="mv-status-text">{status}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mv-error">
                        <p>{error}</p>
                        <button className="mv-btn mv-btn-retry" onClick={handleGenerate}>
                            Sprobuj ponownie
                        </button>
                    </div>
                )}

                {/* Video Preview */}
                {videoUrl && (
                    <div className="mv-preview-section">
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            className="mv-video-player"
                            playsInline
                        />
                        <div className="mv-result-info">
                            <p>{result.clipCount} klipow | ~{result.duration}s</p>
                        </div>
                        <div className="mv-actions">
                            <button className="mv-btn mv-btn-download" onClick={handleDownload}>
                                Pobierz
                            </button>
                            {canShare && (
                                <button className="mv-btn mv-btn-share" onClick={handleShare}>
                                    Udostepnij
                                </button>
                            )}
                            <button className="mv-btn mv-btn-secondary" onClick={resetResult}>
                                Nowy film
                            </button>
                        </div>
                    </div>
                )}

                {/* Logi (debug) */}
                {logs.length > 0 && (
                    <div className="mv-logs-section">
                        <button
                            className="mv-logs-toggle"
                            onClick={() => setShowLogs(!showLogs)}
                        >
                            {showLogs ? 'Ukryj logi' : 'Pokaz logi'} ({logs.length})
                        </button>
                        {showLogs && (
                            <pre className="mv-logs-content">
                                {logs.join('\n')}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
