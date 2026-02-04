import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getClip, deleteClip, saveClip } from '../services/clipService';

const ClipViewScreen = () => {
  const navigate = useNavigate();
  const { date } = useParams(); // oczekiwany format: YYYY-MM-DD
  const { user } = useUserStore();

  const [clip, setClip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  // Formatowanie daty do wyświetlenia (np. "30 Stycznia 2026")
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const months = [
      'Stycznia', 'Lutego', 'Marca', 'Kwietnia', 'Maja', 'Czerwca',
      'Lipca', 'Sierpnia', 'Września', 'Października', 'Listopada', 'Grudnia'
    ];
    const [year, month, day] = dateStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
  };

  // Pobieranie klipu
  useEffect(() => {
    const fetchClip = async () => {
      if (!user?.uid || !date) {
        setError('Brak danych użytkownika lub daty');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const clipData = await getClip(user.uid, date);
        
        if (!clipData) {
          setError('Nie znaleziono klipu dla tej daty');
        } else {
          setClip(clipData);
        }
      } catch (err) {
        console.error('Error fetching clip:', err);
        setError('Wystąpił błąd podczas ładowania klipu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClip();
  }, [user, date]);

  // Cleanup przy odmontowaniu
  useEffect(() => {
    return () => {
      stopRecordingStream();
    };
  }, []);

  const stopRecordingStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Usuwanie klipu
  const handleDelete = async () => {
    if (!user?.uid || !date) return;

    try {
      setIsDeleting(true);
      await deleteClip(user.uid, date);
      navigate(-1); // Powrót do poprzedniego ekranu
    } catch (err) {
      console.error('Error deleting clip:', err);
      setError('Nie udało się usunąć klipu');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Nagrywanie ponowne
  const handleReRecord = async () => {
    try {
      setIsRecording(true);
      setError(null);

      // Uzyskaj dostęp do kamery
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 720 },
        audio: true
      });
      
      streamRef.current = stream;

      // Pokaż podgląd w video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }

      // Rozpocznij nagrywanie
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        stopRecordingStream();

        // Zapisz nowy klip (nadpisuje istniejący)
        try {
          const newClipData = await saveClip(user.uid, date, blob);
          setClip(newClipData);
          
          // Odśwież video element
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.muted = false;
            videoRef.current.src = newClipData.videoUrl;
            videoRef.current.load();
          }
        } catch (err) {
          console.error('Error saving new clip:', err);
          setError('Nie udało się zapisać nowego nagrania');
        }
        
        setIsRecording(false);
      };

      mediaRecorder.start();

      // Automatyczne zatrzymanie po 2 sekundach
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 2000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Nie udało się uruchomić kamery');
      setIsRecording(false);
      stopRecordingStream();
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    stopRecordingStream();
    setIsRecording(false);
    
    // Przywróć oryginalny klip
    if (videoRef.current && clip?.videoUrl) {
      videoRef.current.srcObject = null;
      videoRef.current.muted = false;
      videoRef.current.src = clip.videoUrl;
      videoRef.current.load();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ◀ Powrót
        </button>
        <span style={styles.dateText}>{formatDisplayDate(date)}</span>
        <div style={{ width: '80px' }} /> {/* Spacer dla wyrównania */}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Loading State */}
        {isLoading && (
          <div style={styles.centerContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Ładowanie klipu...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button 
              style={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Video Player */}
        {!isLoading && !error && (clip || isRecording) && (
          <>
            <div style={styles.videoContainer}>
              <video
                ref={videoRef}
                style={styles.video}
                src={!isRecording ? clip?.videoUrl : undefined}
                controls={!isRecording}
                playsInline
                loop
              />
              {clip?.duration && !isRecording && (
                <div style={styles.durationBadge}>
                  {(clip.duration / 1000).toFixed(1)}s
                </div>
              )}
              {isRecording && (
                <div style={styles.recordingIndicator}>
                  <span style={styles.recordingDot}></span>
                  Nagrywanie...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonContainer}>
              {isRecording ? (
                <button
                  style={styles.cancelButton}
                  onClick={handleCancelRecording}
                >
                  ✕ Anuluj
                </button>
              ) : (
                <>
                  <button
                    style={styles.deleteButton}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                  >
                    🗑 Usuń
                  </button>
                  <button
                    style={styles.recordButton}
                    onClick={handleReRecord}
                  >
                    🔄 Nagraj ponownie
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Usunąć klip?</h3>
            <p style={styles.modalText}>
              Czy na pewno chcesz usunąć ten klip? Tej operacji nie można cofnąć.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.modalCancelButton}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Anuluj
              </button>
              <button
                style={styles.modalDeleteButton}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Usuwanie...' : 'Usuń'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#F5E6D3',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#F5E6D3',
    borderBottom: '1px solid #E0D5C7',
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#3A2B20',
    cursor: 'pointer',
    padding: '8px 12px',
    fontWeight: '500',
  },
  dateText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#3A2B20',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 20px',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '300px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #E0D5C7',
    borderTop: '4px solid #3A2B20',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  errorText: {
    fontSize: '16px',
    color: '#cc0000',
    marginBottom: '16px',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3A2B20',
    color: '#FDF5DD',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  videoContainer: {
    width: '100%',
    maxWidth: '400px',
    aspectRatio: '1',
    backgroundColor: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
  },
  recordingIndicator: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(204,0,0,0.9)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  recordingDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    animation: 'pulse 1s ease-in-out infinite',
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    width: '100%',
    maxWidth: '400px',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    padding: '16px 24px',
    backgroundColor: '#fff',
    color: '#cc0000',
    border: '2px solid #cc0000',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  recordButton: {
    flex: 1,
    padding: '16px 24px',
    backgroundColor: '#3A2B20',
    color: '#FDF5DD',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  cancelButton: {
    flex: 1,
    padding: '16px 24px',
    backgroundColor: '#666',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '320px',
    width: '100%',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#3A2B20',
    marginTop: 0,
    marginBottom: '12px',
  },
  modalText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
  },
  modalCancelButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#E0D5C7',
    color: '#3A2B20',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#cc0000',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default ClipViewScreen;
