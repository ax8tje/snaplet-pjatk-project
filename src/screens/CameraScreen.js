import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { saveClip, getClip } from '../services/clipService';
import { createVideoPost } from '../services/postService';

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
  const { user, isAuthenticated } = useUserStore();

  // State
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null); // null = nie nagrywa, 2/1/0 = odliczanie
  const [recordedVideo, setRecordedVideo] = useState(null); // { url, blob }
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [alsoPostToFeed, setAlsoPostToFeed] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

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
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          // AbortError happens when play() is interrupted by StrictMode remount - ignore it
          if (playErr.name !== 'AbortError') {
            throw playErr;
          }
          console.log('[Camera] Play interrupted (StrictMode), ignoring');
        }
      }

      setHasPermission(true);
      setIsCameraActive(true);
    } catch (err) {
      console.error('[Camera] Access error:', err.name, err.message, err);
      setHasPermission(false);

      if (err.name === 'NotAllowedError') {
        setCameraError('Odmowa dostępu do kamery. Proszę włączyć uprawnienia kamery i mikrofonu.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Nie znaleziono kamery na tym urządzeniu.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Kamera jest używana przez inną aplikację.');
      } else if (err.message.includes('MediaRecorder')) {
        setCameraError('Twoja przeglądarka nie obsługuje nagrywania wideo.');
      } else if (err.name === 'AbortError') {
        // Ignore AbortError - it's caused by StrictMode
        console.log('[Camera] AbortError ignored');
        setHasPermission(true);
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
        const recordedMimeType = getSupportedMimeType();
        console.log('[Camera] Recording stopped, chunks:', chunksRef.current.length);
        console.log('[Camera] MimeType:', recordedMimeType);

        const blob = new Blob(chunksRef.current, { type: recordedMimeType });
        console.log('[Camera] Blob size:', blob.size, 'type:', blob.type);

        const videoUrl = URL.createObjectURL(blob);
        console.log('[Camera] Video URL:', videoUrl);

        setRecordedVideo({
          url: videoUrl,
          blob,
          mimeType: recordedMimeType,
          extension: getFileExtension(recordedMimeType),
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
    setCountdown(null);
    setSaveError(null);
    setAlsoPostToFeed(false);
    setShowOverwriteConfirm(false);
    startCamera();
  }, [recordedVideo, startCamera]);

  // Switch camera
  const handleSwitchCamera = useCallback(() => {
    if (!isRecording) {
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    }
  }, [isRecording]);

  // Generate thumbnail from the preview video element
  const generateThumbnail = () => {
    return new Promise((resolve) => {
      console.log('[Camera] Generating thumbnail from preview video');

      const video = previewVideoRef.current;
      if (!video || video.videoWidth === 0) {
        console.warn('[Camera] Preview video not ready');
        resolve(null);
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        // Square thumbnail, crop to center
        const size = Math.min(video.videoWidth, video.videoHeight);
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Calculate crop offset to center
        const offsetX = (video.videoWidth - size) / 2;
        const offsetY = (video.videoHeight - size) / 2;

        console.log('[Camera] Video dimensions:', video.videoWidth, 'x', video.videoHeight, 'cropping from:', offsetX, offsetY);

        ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, 200, 200);

        canvas.toBlob((blob) => {
          console.log('[Camera] Thumbnail blob created:', blob ? blob.size + ' bytes' : 'null');
          resolve(blob);
        }, 'image/jpeg', 0.8);
      } catch (err) {
        console.error('[Camera] Canvas error:', err);
        resolve(null);
      }
    });
  };

  // Check if clip exists and save
  const handleSaveClip = async () => {
    if (!recordedVideo?.blob || !user) return;

    try {
      setSaveError(null);

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Check if clip already exists for today
      const existingClip = await getClip(user.uid, dateStr);
      if (existingClip) {
        // Show confirmation modal
        setShowOverwriteConfirm(true);
        return;
      }

      // No existing clip, save directly
      await doSaveClip();
    } catch (err) {
      console.error('Clip check error:', err);
      // If check fails, try to save anyway
      await doSaveClip();
    }
  };

  // Actual save logic
  const doSaveClip = async () => {
    if (!recordedVideo?.blob || !user) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setShowOverwriteConfirm(false);

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      console.log('[Camera] Generating thumbnail...');
      // Generate thumbnail from the preview video element
      const thumbnailBlob = await generateThumbnail();
      console.log('[Camera] Thumbnail result:', thumbnailBlob ? `${thumbnailBlob.size} bytes` : 'null');

      console.log('[Camera] Saving clip to:', dateStr);
      await saveClip(user.uid, dateStr, recordedVideo.blob, thumbnailBlob);
      console.log('[Camera] Clip saved successfully');

      // Also create a post if toggle is enabled
      if (alsoPostToFeed) {
        console.log('[Camera] Creating video post...');
        await createVideoPost(user.uid, recordedVideo.blob, '', null, {
          mimeType: recordedVideo.mimeType,
          extension: recordedVideo.extension,
        });
        console.log('[Camera] Video post created successfully');
      }

      // Clean up
      if (recordedVideo?.url) {
        URL.revokeObjectURL(recordedVideo.url);
      }

      // Navigate to calendar after saving clip
      navigate('/calendar');
    } catch (err) {
      console.error('Clip save error:', err);
      setSaveError('Nie udało się zapisać klipu. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  // Post only (without saving to calendar)
  const handlePostOnly = async () => {
    if (!recordedVideo?.blob || !user) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      console.log('[Camera] Creating video post only...');
      await createVideoPost(user.uid, recordedVideo.blob, '', null, {
        mimeType: recordedVideo.mimeType,
        extension: recordedVideo.extension,
      });
      console.log('[Camera] Video post created successfully');

      // Clean up
      if (recordedVideo?.url) {
        URL.revokeObjectURL(recordedVideo.url);
      }

      // Navigate to home/feed after posting
      navigate('/');
    } catch (err) {
      console.error('Post creation error:', err);
      setSaveError('Nie udało się dodać posta. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
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
    console.log('[Camera] Rendering preview, URL:', recordedVideo.url);
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.reviewHeader}>
          <button
            onClick={handleRetake}
            disabled={isSaving}
            style={{
              ...styles.headerButton,
              opacity: isSaving ? 0.5 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            Nagraj ponownie
          </button>
          <h2 style={styles.headerTitle}>Podgląd</h2>
          <div style={{ width: '100px' }} /> {/* Spacer for centering */}
        </div>

        {/* Preview Video */}
        <div style={styles.previewContainer}>
          <video
            key={recordedVideo.url}
            ref={previewVideoRef}
            src={recordedVideo.url}
            controls
            loop
            playsInline
            preload="auto"
            style={styles.previewVideo}
            onError={(e) => console.error('[Camera] Preview video error:', e.target.error)}
            onLoadedMetadata={(e) => {
              console.log('[Camera] Preview metadata loaded, duration:', e.target.duration);
            }}
            onLoadedData={() => {
              console.log('[Camera] Preview video loaded');
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={styles.actionButtonsContainer}>
          {/* Save to calendar option */}
          <div style={styles.actionOption}>
            <button
              onClick={handleSaveClip}
              disabled={isSaving}
              style={{
                ...styles.actionButton,
                ...styles.calendarButton,
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3A2B20" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#3A2B20" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {isSaving ? 'Zapisywanie...' : 'Zapisz do kalendarza'}
            </button>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={alsoPostToFeed}
                onChange={(e) => setAlsoPostToFeed(e.target.checked)}
                disabled={isSaving}
                style={styles.toggleCheckbox}
              />
              <span style={{
                ...styles.toggleSwitch,
                backgroundColor: alsoPostToFeed ? '#4CAF50' : '#444',
              }}>
                <span style={{
                  ...styles.toggleKnob,
                  transform: alsoPostToFeed ? 'translateX(16px)' : 'translateX(0)',
                }} />
              </span>
              <span style={styles.toggleText}>+ dodaj jako post</span>
            </label>
          </div>

          <div style={styles.orDivider}>
            <span style={styles.orText}>lub</span>
          </div>

          {/* Post only option */}
          <button
            onClick={handlePostOnly}
            disabled={isSaving}
            style={{
              ...styles.actionButton,
              ...styles.postOnlyButton,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/>
              <path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="2"/>
            </svg>
            Dodaj tylko jako post
          </button>
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div style={styles.progressContainer}>
            <p style={styles.progressText}>
              Zapisywanie...
            </p>
          </div>
        )}

        {/* Error Display */}
        {saveError && (
          <div style={styles.errorBanner}>
            {saveError}
          </div>
        )}

        {/* Overwrite Confirmation Modal */}
        {showOverwriteConfirm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Nadpisać istniejący klip?</h3>
              <p style={styles.modalText}>
                Masz już nagrany klip na dzisiaj. Czy chcesz go zastąpić nowym?
              </p>
              <div style={styles.modalButtons}>
                <button
                  onClick={() => setShowOverwriteConfirm(false)}
                  style={styles.modalCancelButton}
                >
                  Anuluj
                </button>
                <button
                  onClick={doSaveClip}
                  style={styles.modalConfirmButton}
                >
                  Nadpisz
                </button>
              </div>
            </div>
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
          onClick={() => navigate(-1)}
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
    backgroundColor: '#000',
    aspectRatio: '1/1',
    maxWidth: '100vw',
    margin: '0 auto',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
    maxHeight: '70vh',
    objectFit: 'cover',
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
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '8px',
    marginTop: '8px',
  },
  toggleCheckbox: {
    display: 'none',
  },
  toggleSwitch: {
    width: '36px',
    height: '20px',
    backgroundColor: '#444',
    borderRadius: '10px',
    position: 'relative',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    width: '16px',
    height: '16px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'transform 0.2s ease',
  },
  toggleText: {
    color: '#aaa',
    fontSize: '12px',
  },
  actionButtonsContainer: {
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  actionOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 24px',
    borderRadius: '24px',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    maxWidth: '300px',
  },
  calendarButton: {
    backgroundColor: '#FDF5DD',
    color: '#3A2B20',
  },
  postOnlyButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '2px solid #fff',
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 0',
  },
  orText: {
    color: '#666',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '320px',
    width: '100%',
    textAlign: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  modalText: {
    color: '#aaa',
    fontSize: '14px',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  modalCancelButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modalConfirmButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default CameraScreen;
