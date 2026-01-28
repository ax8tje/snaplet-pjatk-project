import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../store/feedStore';
import { useUserStore } from '../store/userStore';

const CameraScreen = () => {
  const navigate = useNavigate();
  const { addPost, isCreating, uploadProgress, error, clearError } = useFeedStore();
  const { user, isAuthenticated } = useUserStore();

  // State
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Request camera permission and start stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
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
        setCameraError('Camera access denied. Please enable camera permissions.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Failed to access camera. Please try again.');
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

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isCameraActive && !capturedImage) {
      startCamera();
    }
  }, [facingMode]);

  // Capture photo
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image as blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({ url: imageUrl, blob });
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setCaption('');
    clearError();
    startCamera();
  };

  // Switch camera
  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Upload and create post
  const handlePost = async () => {
    if (!capturedImage?.blob || !user) return;

    try {
      clearError();
      await addPost(user.uid, capturedImage.blob, caption);

      // Clean up
      if (capturedImage?.url) {
        URL.revokeObjectURL(capturedImage.url);
      }

      // Navigate to home
      navigate('/home');
    } catch (err) {
      console.error('Post creation error:', err);
    }
  };

  // Select from gallery (file input)
  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setCapturedImage({ url: imageUrl, blob: file });
        stopCamera();
      }
    };
    input.click();
  };

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          Please log in to create posts
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#FDF5DD',
            color: '#3A2B20',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Review captured image
  if (capturedImage) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#000'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}>
          <button
            onClick={handleRetake}
            disabled={isCreating}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid #fff',
              borderRadius: '20px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.5 : 1
            }}
          >
            Retake
          </button>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
            Review
          </h2>
          <button
            onClick={handlePost}
            disabled={isCreating}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FDF5DD',
              color: '#3A2B20',
              border: 'none',
              borderRadius: '20px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Preview Image */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={capturedImage.url}
            alt="Captured"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Upload Progress */}
        {isCreating && uploadProgress > 0 && (
          <div style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(0,0,0,0.8)'
          }}>
            <div style={{
              height: '4px',
              backgroundColor: '#333',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${uploadProgress}%`,
                backgroundColor: '#FDF5DD',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{
              color: '#fff',
              textAlign: 'center',
              margin: '8px 0 0',
              fontSize: '14px'
            }}>
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {/* Caption Input */}
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}>
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isCreating}
            maxLength={280}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <p style={{
            color: '#666',
            fontSize: '12px',
            textAlign: 'right',
            marginTop: '4px'
          }}>
            {caption.length}/280
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#ff4444',
            color: '#fff',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Camera view
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#000'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Camera</h2>
        <button
          onClick={handleSwitchCamera}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 5H16.8L15 3H9L7.2 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5Z" stroke="#fff" strokeWidth="2"/>
            <circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      {/* Camera Preview */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Video element for camera stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
          }}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Permission/Error overlay */}
        {(hasPermission === false || cameraError) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: '#fff',
            padding: '20px',
            textAlign: 'center'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '16px' }}>
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#666" strokeWidth="2"/>
              <circle cx="12" cy="13" r="4" stroke="#666" strokeWidth="2"/>
              <path d="M2 2L22 22" stroke="#ff4444" strokeWidth="2"/>
            </svg>
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>
              {cameraError || 'Camera access is required to take photos'}
            </p>
            <button
              onClick={startCamera}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FDF5DD',
                color: '#3A2B20',
                border: 'none',
                borderRadius: '24px',
                cursor: 'pointer',
                fontSize: '16px',
                marginBottom: '12px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleGallerySelect}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '24px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Select from Gallery
            </button>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
      }}>
        {/* Gallery Button */}
        <button
          onClick={handleGallerySelect}
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/>
            <path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="2"/>
          </svg>
        </button>

        {/* Capture Button */}
        <button
          onClick={handleCapture}
          disabled={!isCameraActive || hasPermission === false}
          style={{
            width: '72px',
            height: '72px',
            backgroundColor: '#fff',
            border: '4px solid #FDF5DD',
            borderRadius: '50%',
            cursor: isCameraActive ? 'pointer' : 'not-allowed',
            opacity: isCameraActive ? 1 : 0.5,
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        />

        {/* Placeholder for balance */}
        <div style={{ width: '48px', height: '48px' }} />
      </div>
    </div>
  );
};

export default CameraScreen;
