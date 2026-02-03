import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../store/feedStore';
import { useUserStore } from '../store/userStore';

/**
 * Określa odpowiedni mimeType dla MediaRecorder w zależności od przeglądarki
 * @returns {string} Obsługiwany mimeType
 */
const getSupportedMimeType = () => {
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return 'video/webm'; // fallback
};

/**
 * Pobiera rozszerzenie pliku na podstawie mimeType
 * @param {string} mimeType 
 * @returns {string} Rozszerzenie pliku
 */
const getFileExtension = (mimeType) => {
  if (mimeType.includes('mp4')) return 'mp4';
  return 'webm';
};

const RECORDING_DURATION_MS = 2000; // 2 sekundy

const CameraScreen = () => {
  const navigate = useNavigate();
  const { addPost, isCreating, uploadProgress, error, clearError } = useFeedStore();
  const { user, isAuthenticated } = useUserStore();

  // State
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null); // null = nie nagrywa, 2/1/0 = odliczanie
  const [recordedVideo, setRecordedVideo] = useState(null); // { url, blob }
  const [caption, setCaption] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const countdownIntervalRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  // Request camera permission and start stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Sprawdź czy MediaRecorder jest dostępny
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder API is not supported in this browser');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: true, // Włączamy audio dla nagrywania wideo
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);

      if (err.name === 'NotAllowedError') {
        setCameraError('Odmowa dostępu do kamery. Proszę włączyć uprawnienia kamery i mikrofonu.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Nie znaleziono kamery na tym urządzeniu.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Kamera jest używana przez inną aplikację.');
      } else if (err.message.includes('MediaRecorder')) {
        setCameraError('Twoja przeglądarka nie obsługuje nagrywania wideo.');
      } else {
        setCameraError('Nie udało się uzyskać dostępu do kamery. Spróbuj ponownie.');
      }
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup timers
  const cleanupTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
      cleanupTimers();
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isCameraActive && !recordedVideo && !isRecording) {
      startCamera();
    }
  }, [facingMode]);

  // Start recording
  const handleStartRecording = useCallback(() => {
    if (!streamRef.current || isRecording) return;

    try {
      chunksRef.current = [];
      const mimeType = getSupportedMimeType();

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = getSupportedMimeType();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);

        setRecordedVideo({
          url: videoUrl,
          blob,
          mimeType,
          extension: getFileExtension(mimeType),
        });

        setIsRecording(false);
        setCountdown(null);
        stopCamera();
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setCameraError('Wystąpił błąd podczas nagrywania. Spróbuj ponownie.');
        setIsRecording(false);
        setCountdown(null);
        cleanupTimers();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setCountdown(2);

      // Visual countdown
      let countdownValue = 2;
      countdownIntervalRef.current = setInterval(() => {
        countdownValue -= 1;
        if (countdownValue >= 0) {
          setCountdown(countdownValue);
        }
      }, 1000);

      // Auto-stop after 2 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        cleanupTimers();
      }, RECORDING_DURATION_MS);

    } catch (err) {
      console.error('Recording start error:', err);
      setCameraError('Nie udało się rozpocząć nagrywania. Sprawdź uprawnienia.');
      setIsRecording(false);
    }
  }, [isRecording, stopCamera, cleanupTimers]);

  // Stop recording manually (jeśli potrzebne)
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cleanupTimers();
  }, [cleanupTimers]);

  // Retake video
  const handleRetake = useCallback(() => {
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
    }
    setRecordedVideo(null);
    setCaption('');
    setCountdown(null);
    clearError();
    startCamera();
  }, [recordedVideo, clearError, startCamera]);

  // Switch camera
  const handleSwitchCamera = useCallback(() => {
    if (!isRecording) {
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    }
  }, [isRecording]);

  // Upload and create post
  const handlePost = async () => {
    if (!recordedVideo?.blob || !user) return;

    try {
      clearError();
      await addPost(user.uid, recordedVideo.blob, caption, {
        isVideo: true,
        mimeType: recordedVideo.mimeType,
        extension: recordedVideo.extension,
      });

      // Clean up
      if (recordedVideo?.url) {
        URL.revokeObjectURL(recordedVideo.url);
      }

      // Navigate to home
      navigate('/home');
    } catch (err) {
      console.error('Post creation error:', err);
    }
  };

  // Select from gallery (file input for video)
  const handleGallerySelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Sprawdź czy plik nie jest za długi (opcjonalne)
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          // Możesz dodać walidację długości tutaj
        };
        
        const videoUrl = URL.createObjectURL(file);
        setRecordedVideo({
          url: videoUrl,
          blob: file,
          mimeType: file.type,
          extension: file.name.split('.').pop() || 'mp4',
        });
        stopCamera();
      }
    };
    input.click();
  }, [stopCamera]);

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div style={styles.authRequired}>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          Zaloguj się, aby tworzyć posty
        </p>
        <button
          onClick={() => navigate('/login')}
          style={styles.loginButton}
        >
          Przejdź do logowania
        </button>
      </div>
    );
  }

  // Review recorded video
  if (recordedVideo) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.reviewHeader}>
          <button
            onClick={handleRetake}
            disabled={isCreating}
            style={{
              ...styles.headerButton,
              opacity: isCreating ? 0.5 : 1,
              cursor: isCreating ? 'not-allowed' : 'pointer',
            }}
          >
            Nagraj ponownie
          </button>
          <h2 style={styles.headerTitle}>Podgląd</h2>
          <button
            onClick={handlePost}
            disabled={isCreating}
            style={{
              ...styles.postButton,
              opacity: isCreating ? 0.7 : 1,
              cursor: isCreating ? 'not-allowed' : 'pointer',
            }}
          >
            {isCreating ? 'Wysyłanie...' : 'Zapisz'}
          </button>
        </div>

        {/* Preview Video */}
        <div style={styles.previewContainer}>
          <video
            ref={previewVideoRef}
            src={recordedVideo.url}
            controls
            loop
            autoPlay
            playsInline
            style={styles.previewVideo}
          />
        </div>

        {/* Upload Progress */}
        {isCreating && uploadProgress > 0 && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${uploadProgress}%`,
              }}></div>
            </div>
            <p style={styles.progressText}>
              Wysyłanie... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {/* Caption Input */}
        <div style={styles.captionContainer}>
          <input
            type="text"
            placeholder="Dodaj opis..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isCreating}
            maxLength={280}
            style={styles.captionInput}
          />
          <p style={styles.captionCounter}>
            {caption.length}/280
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Camera view (recording)
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.cameraHeader}>
        <button
          onClick={() => navigate('/home')}
          style={styles.iconButton}
          disabled={isRecording}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 style={styles.headerTitle}>
          {isRecording ? 'Nagrywanie...' : 'Kamera'}
        </h2>
        <button
          onClick={handleSwitchCamera}
          style={styles.iconButton}
          disabled={isRecording}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 5H16.8L15 3H9L7.2 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5Z" stroke="#fff" strokeWidth="2"/>
            <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* Camera Preview */}
      <div style={styles.cameraPreviewContainer}>
        {/* Video element for camera stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            ...styles.cameraVideo,
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* Recording countdown overlay */}
        {isRecording && countdown !== null && (
          <div style={styles.countdownOverlay}>
            <div style={styles.countdownCircle}>
              <span style={styles.countdownNumber}>{countdown}</span>
            </div>
            <div style={styles.recordingIndicator}>
              <div style={styles.recordingDot}></div>
              <span style={styles.recordingText}>REC</span>
            </div>
          </div>
        )}

        {/* Recording progress bar */}
        {isRecording && (
          <div style={styles.recordingProgressContainer}>
            <div style={styles.recordingProgressBar}>
              <div 
                style={{
                  ...styles.recordingProgressFill,
                  animation: 'fillProgress 2s linear forwards',
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Permission/Error overlay */}
        {(hasPermission === false || cameraError) && (
          <div style={styles.errorOverlay}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#666" strokeWidth="2"/>
              <circle cx="12" cy="13" r="4" stroke="#666" strokeWidth="2"/>
              <path d="M2 2L22 22" stroke="#ff4444" strokeWidth="2"/>
            </svg>
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>
              {cameraError || 'Wymagany dostęp do kamery i mikrofonu'}
            </p>
            <button
              onClick={startCamera}
              style={styles.retryButton}
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={handleGallerySelect}
              style={styles.galleryButtonAlt}
            >
              Wybierz z galerii
            </button>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div style={styles.controlsContainer}>
        {/* Gallery Button */}
        <button
          onClick={handleGallerySelect}
          disabled={isRecording}
          style={{
            ...styles.galleryButton,
            opacity: isRecording ? 0.5 : 1,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/>
            <path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="2"/>
          </svg>
        </button>

        {/* Record Button */}
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!isCameraActive || hasPermission === false}
          style={{
            ...styles.recordButton,
            backgroundColor: isRecording ? '#ff4444' : '#fff',
            cursor: isCameraActive ? 'pointer' : 'not-allowed',
            opacity: isCameraActive ? 1 : 0.5,
          }}
        >
          {isRecording ? (
            <div style={styles.stopIcon}></div>
          ) : (
            <div style={styles.recordIcon}></div>
          )}
        </button>

        {/* Duration hint */}
        <div style={styles.durationHint}>
          <span style={{ color: '#fff', fontSize: '12px' }}>2s</span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#000',
  },
  authRequired: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
  },
  loginButton: {
    padding: '12px 24px',
    backgroundColor: '#FDF5DD',
    color: '#3A2B20',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  // Review screen styles
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  headerButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '20px',
    fontSize: '14px',
  },
  headerTitle: {
    color: '#fff',
    margin: 0,
    fontSize: '18px',
  },
  postButton: {
    padding: '8px 16px',
    backgroundColor: '#FDF5DD',
    color: '#3A2B20',
    border: 'none',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '14px',
  },
  previewContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewVideo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  progressContainer: {
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#333',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FDF5DD',
    transition: 'width 0.3s ease',
  },
  progressText: {
    color: '#fff',
    textAlign: 'center',
    margin: '8px 0 0',
    fontSize: '14px',
  },
  captionContainer: {
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  captionInput: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#222',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  captionCounter: {
    color: '#666',
    fontSize: '12px',
    textAlign: 'right',
    marginTop: '4px',
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: '#ff4444',
    color: '#fff',
    textAlign: 'center',
  },
  // Camera screen styles
  cameraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iconButton: {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPreviewContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cameraVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  countdownOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  countdownCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,68,68,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  countdownNumber: {
    color: '#fff',
    fontSize: '48px',
    fontWeight: 'bold',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '20px',
  },
  recordingDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#ff4444',
    animation: 'blink 1s infinite',
  },
  recordingText: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  recordingProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px 16px',
  },
  recordingProgressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  recordingProgressFill: {
    height: '100%',
    backgroundColor: '#ff4444',
  },
  errorOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#FDF5DD',
    color: '#3A2B20',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '12px',
  },
  galleryButtonAlt: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  controlsContainer: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  galleryButton: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: '72px',
    height: '72px',
    border: '4px solid #FDF5DD',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  recordIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#ff4444',
  },
  stopIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  durationHint: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default CameraScreen;
