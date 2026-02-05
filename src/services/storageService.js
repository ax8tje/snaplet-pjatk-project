import {
  ref,
  uploadBytesResumable,
  getDownloadURL as firebaseGetDownloadURL,
  deleteObject,
} from "firebase/storage";

import { storage } from "../firebase";

/**
 * @typedef {Object} UploadResult
 * @property {string} downloadURL - URL do pobrania pliku
 * @property {string} fullPath - Pełna ścieżka w storage
 * @property {string} name - Nazwa pliku
 * @property {string} [thumbnailURL] - URL miniaturki (opcjonalnie)
 * @property {string} [thumbnailPath] - Ścieżka miniaturki (opcjonalnie)
 */

/**
 * @typedef {Object} UploadTask
 * @property {Promise<UploadResult>} promise - Promise z wynikiem uploadu
 * @property {function} cancel - Funkcja do anulowania uploadu
 * @property {function} pause - Funkcja do pauzowania uploadu
 * @property {function} resume - Funkcja do wznawiania uploadu
 */

/**
 * Kompresuje obraz do określonych wymiarów
 * @param {File|Blob} file - Plik obrazu do kompresji
 * @param {number} [maxWidth=1080] - Maksymalna szerokość
 * @param {number} [maxHeight=1080] - Maksymalna wysokość
 * @param {number} [quality=0.8] - Jakość kompresji (0-1)
 * @returns {Promise<Blob>} Skompresowany obraz jako Blob
 * @throws {Error} Gdy plik nie jest obrazem lub kompresja się nie powiedzie
 */
export const compressImage = async (
  file,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.8
) => {
  try {
    if (!file) {
      throw new Error("File is required");
    }

    if (quality < 0 || quality > 1) {
      throw new Error("Quality must be between 0 and 1");
    }

    if (maxWidth <= 0 || maxHeight <= 0) {
      throw new Error("Dimensions must be positive numbers");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/jpeg",
            quality
          );
        } catch (error) {
          reject(new Error(`Image processing failed: ${error.message}`));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };

      if (file instanceof Blob) {
        img.src = URL.createObjectURL(file);
      } else {
        reject(new Error("Invalid file type"));
      }
    });
  } catch (error) {
    console.error("compressImage error:", error);
    throw error;
  }
};

/**
 * Generuje miniaturkę obrazu
 * @param {File|Blob} file - Plik obrazu
 * @param {number} [maxDimension=300] - Maksymalny wymiar (szerokość lub wysokość)
 * @param {number} [quality=0.7] - Jakość kompresji miniaturki
 * @returns {Promise<Blob>} Miniaturka jako Blob
 * @throws {Error} Gdy generowanie miniaturki się nie powiedzie
 */
export const generateThumbnail = async (
  file,
  maxDimension = 300,
  quality = 0.7
) => {
  try {
    if (!file) {
      throw new Error("File is required");
    }

    return await compressImage(file, maxDimension, maxDimension, quality);
  } catch (error) {
    console.error("generateThumbnail error:", error);
    throw error;
  }
};

/**
 * Generuje miniaturkę z wideo
 * @param {File|Blob} videoFile - Plik wideo
 * @param {number} [seekTime=0] - Czas w sekundach, z którego wziąć klatkę
 * @param {number} [maxDimension=300] - Maksymalny wymiar miniaturki
 * @param {number} [quality=0.7] - Jakość kompresji
 * @returns {Promise<Blob>} Miniaturka jako Blob
 * @throws {Error} Gdy generowanie miniaturki się nie powiedzie
 */
export const generateVideoThumbnail = async (
  videoFile,
  seekTime = 0,
  maxDimension = 300,
  quality = 0.7
) => {
  try {
    if (!videoFile) {
      throw new Error("Video file is required");
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Seek to specified time or middle of video
        const targetTime = Math.min(seekTime, video.duration / 2);
        video.currentTime = targetTime;
      };

      video.onseeked = () => {
        try {
          let { videoWidth: width, videoHeight: height } = video;

          // Scale down if needed
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(video, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              // Cleanup
              URL.revokeObjectURL(video.src);

              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to generate video thumbnail"));
              }
            },
            "image/jpeg",
            quality
          );
        } catch (error) {
          URL.revokeObjectURL(video.src);
          reject(new Error(`Video thumbnail generation failed: ${error.message}`));
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to load video for thumbnail generation"));
      };

      if (videoFile instanceof Blob) {
        video.src = URL.createObjectURL(videoFile);
      } else {
        reject(new Error("Invalid video file type"));
      }
    });
  } catch (error) {
    console.error("generateVideoThumbnail error:", error);
    throw error;
  }
};

/**
 * Przesyła zdjęcie do Firebase Storage z obsługą postępu
 * @param {File|Blob} file - Plik do przesłania
 * @param {string} userId - ID użytkownika
 * @param {string} [path="photos"] - Ścieżka w storage (np. "photos", "avatars")
 * @param {function} [onProgress] - Callback z postępem (0-100)
 * @param {Object} [options] - Dodatkowe opcje
 * @param {boolean} [options.compress=true] - Czy kompresować obraz
 * @param {boolean} [options.generateThumb=false] - Czy generować miniaturkę
 * @returns {UploadTask} Obiekt z promise, cancel, pause, resume
 * @throws {Error} Gdy upload się nie powiedzie
 */
export const uploadPhoto = (
  file,
  userId,
  path = "photos",
  onProgress = null,
  options = {}
) => {
  const { compress = true, generateThumb = false } = options;

  let uploadTask = null;
  let isCancelled = false;

  const promise = (async () => {
    try {
      if (!file) {
        throw new Error("File is required");
      }

      if (!userId) {
        throw new Error("User ID is required");
      }

      let fileToUpload = file;
      if (compress && file.type?.startsWith("image/")) {
        fileToUpload = await compressImage(file);
      }

      if (isCancelled) {
        throw new Error("Upload cancelled");
      }

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = file.name?.split(".").pop() || "jpg";
      const fileName = `${timestamp}_${randomStr}.${extension}`;
      const postId = `${timestamp}_${randomStr}`;

      // Path must match storage.rules: users/{userId}/posts/{postId}/{fileName}
      const fullPath = `users/${userId}/${path}/${postId}/${fileName}`;
      const storageRef = ref(storage, fullPath);

      // Must set contentType for Firebase Storage rules validation
      // After compression, blob may not have type set, so always use image/jpeg for compressed images
      const contentType = compress ? 'image/jpeg' : (fileToUpload.type || file.type || 'image/jpeg');
      uploadTask = uploadBytesResumable(storageRef, fileToUpload, { contentType });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );

            if (onProgress && typeof onProgress === "function") {
              onProgress(progress);
            }
          },
          (error) => {
            console.error("Upload error:", error);

            if (error.code === "storage/canceled") {
              reject(new Error("Upload cancelled"));
            } else {
              reject(new Error(`Upload failed: ${error.message}`));
            }
          },
          async () => {
            try {
              const downloadURL = await firebaseGetDownloadURL(
                uploadTask.snapshot.ref
              );

              const result = {
                downloadURL,
                fullPath,
                name: fileName,
              };

              if (generateThumb) {
                try {
                  const thumbnail = await generateThumbnail(file);
                  // Thumbnail path must also match storage rules
                  const thumbPath = `users/${userId}/${path}/${postId}/thumb_${fileName}`;
                  const thumbRef = ref(storage, thumbPath);

                  await uploadBytesResumable(thumbRef, thumbnail, { contentType: 'image/jpeg' });
                  result.thumbnailURL = await firebaseGetDownloadURL(thumbRef);
                  result.thumbnailPath = thumbPath;
                } catch (thumbError) {
                  console.warn("Thumbnail generation failed:", thumbError);
                }
              }

              resolve(result);
            } catch (error) {
              reject(new Error(`Failed to get download URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error) {
      console.error("uploadPhoto error:", error);
      throw error;
    }
  })();

  return {
    promise,
    cancel: () => {
      isCancelled = true;
      if (uploadTask) {
        uploadTask.cancel();
      }
    },
    pause: () => {
      if (uploadTask) {
        uploadTask.pause();
      }
    },
    resume: () => {
      if (uploadTask) {
        uploadTask.resume();
      }
    },
  };
};

/**
 * Przesyła wideo do Firebase Storage z obsługą postępu
 * @param {File|Blob} file - Plik wideo do przesłania
 * @param {string} userId - ID użytkownika
 * @param {string} [path="videos"] - Ścieżka w storage
 * @param {function} [onProgress] - Callback z postępem (0-100)
 * @param {Object} [options] - Dodatkowe opcje
 * @param {boolean} [options.generateThumb=true] - Czy generować miniaturkę
 * @param {string} [options.mimeType] - MIME type wideo
 * @param {string} [options.extension] - Rozszerzenie pliku
 * @returns {UploadTask} Obiekt z promise, cancel, pause, resume
 * @throws {Error} Gdy upload się nie powiedzie
 */
export const uploadVideo = (
  file,
  userId,
  path = "videos",
  onProgress = null,
  options = {}
) => {
  const { generateThumb = true, mimeType, extension } = options;

  let uploadTask = null;
  let isCancelled = false;

  const promise = (async () => {
    try {
      if (!file) {
        throw new Error("File is required");
      }

      if (!userId) {
        throw new Error("User ID is required");
      }

      if (isCancelled) {
        throw new Error("Upload cancelled");
      }

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileExtension = extension || file.name?.split(".").pop() || "webm";
      const fileName = `${timestamp}_${randomStr}.${fileExtension}`;
      const postId = `${timestamp}_${randomStr}`;

      // Path must match storage.rules: users/{userId}/posts/{postId}/{fileName}
      const fullPath = `users/${userId}/${path}/${postId}/${fileName}`;
      const storageRef = ref(storage, fullPath);

      // Determine content type
      const contentType = mimeType || file.type || "video/webm";

      uploadTask = uploadBytesResumable(storageRef, file, {
        contentType,
      });

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );

            if (onProgress && typeof onProgress === "function") {
              onProgress(progress);
            }
          },
          (error) => {
            console.error("Upload error:", error);

            if (error.code === "storage/canceled") {
              reject(new Error("Upload cancelled"));
            } else {
              reject(new Error(`Upload failed: ${error.message}`));
            }
          },
          async () => {
            try {
              const downloadURL = await firebaseGetDownloadURL(
                uploadTask.snapshot.ref
              );

              const result = {
                downloadURL,
                fullPath,
                name: fileName,
                isVideo: true,
                mimeType: contentType,
              };

              // Generate thumbnail from video
              if (generateThumb) {
                try {
                  const thumbnail = await generateVideoThumbnail(file, 0.5);
                  const thumbFileName = `thumb_${timestamp}_${randomStr}.jpg`;
                  const thumbPath = `users/${userId}/${path}/${postId}/${thumbFileName}`;
                  const thumbRef = ref(storage, thumbPath);

                  await uploadBytesResumable(thumbRef, thumbnail, {
                    contentType: "image/jpeg",
                  });

                  result.thumbnailURL = await firebaseGetDownloadURL(thumbRef);
                  result.thumbnailPath = thumbPath;
                } catch (thumbError) {
                  console.warn("Video thumbnail generation failed:", thumbError);
                }
              }

              resolve(result);
            } catch (error) {
              reject(new Error(`Failed to get download URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error) {
      console.error("uploadVideo error:", error);
      throw error;
    }
  })();

  return {
    promise,
    cancel: () => {
      isCancelled = true;
      if (uploadTask) {
        uploadTask.cancel();
      }
    },
    pause: () => {
      if (uploadTask) {
        uploadTask.pause();
      }
    },
    resume: () => {
      if (uploadTask) {
        uploadTask.resume();
      }
    },
  };
};

/**
 * Przesyła media (zdjęcie lub wideo) do Firebase Storage
 * Automatycznie wykrywa typ pliku i używa odpowiedniej metody
 * @param {File|Blob} file - Plik do przesłania
 * @param {string} userId - ID użytkownika
 * @param {string} [path="posts"] - Ścieżka w storage
 * @param {function} [onProgress] - Callback z postępem (0-100)
 * @param {Object} [options] - Dodatkowe opcje
 * @param {boolean} [options.isVideo] - Czy plik jest wideo (auto-detect jeśli nie podano)
 * @param {boolean} [options.compress=true] - Czy kompresować (tylko dla zdjęć)
 * @param {boolean} [options.generateThumb=true] - Czy generować miniaturkę
 * @param {string} [options.mimeType] - MIME type pliku
 * @param {string} [options.extension] - Rozszerzenie pliku
 * @returns {UploadTask} Obiekt z promise, cancel, pause, resume
 */
export const uploadMedia = (
  file,
  userId,
  path = "posts",
  onProgress = null,
  options = {}
) => {
  const { isVideo, mimeType } = options;

  // Auto-detect if file is video
  const fileIsVideo = isVideo !== undefined
    ? isVideo
    : (mimeType?.startsWith("video/") || file.type?.startsWith("video/"));

  if (fileIsVideo) {
    return uploadVideo(file, userId, path, onProgress, {
      generateThumb: options.generateThumb !== false,
      mimeType: options.mimeType,
      extension: options.extension,
    });
  } else {
    return uploadPhoto(file, userId, path, onProgress, {
      compress: options.compress !== false,
      generateThumb: options.generateThumb === true,
    });
  }
};

/**
 * Usuwa zdjęcie/wideo z Firebase Storage
 * @param {string} mediaUrl - URL pliku lub ścieżka w storage
 * @returns {Promise<void>}
 * @throws {Error} Gdy usunięcie się nie powiedzie
 */
export const deletePhoto = async (mediaUrl) => {
  try {
    if (!mediaUrl) {
      throw new Error("Photo URL or path is required");
    }

    let storagePath = mediaUrl;

    if (mediaUrl.includes("firebasestorage.googleapis.com")) {
      const url = new URL(mediaUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);

      if (pathMatch && pathMatch[1]) {
        storagePath = decodeURIComponent(pathMatch[1]);
      } else {
        throw new Error("Invalid Firebase Storage URL");
      }
    }

    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("deletePhoto error:", error);

    if (error.code === "storage/object-not-found") {
      throw new Error("Photo not found");
    }

    throw error;
  }
};

// Alias dla zgodności
export const deleteMedia = deletePhoto;
export const deleteVideo = deletePhoto;

/**
 * Pobiera URL do pobrania pliku ze storage
 * @param {string} path - Ścieżka do pliku w storage
 * @returns {Promise<string>} URL do pobrania
 * @throws {Error} Gdy plik nie istnieje lub wystąpi błąd
 */
export const getDownloadURL = async (path) => {
  try {
    if (!path) {
      throw new Error("Path is required");
    }

    const storageRef = ref(storage, path);
    const url = await firebaseGetDownloadURL(storageRef);

    return url;
  } catch (error) {
    console.error("getDownloadURL error:", error);

    if (error.code === "storage/object-not-found") {
      throw new Error("File not found");
    }

    throw error;
  }
};

/**
 * Przesyła wiele plików jednocześnie
 * @param {Array<File|Blob>} files - Tablica plików do przesłania
 * @param {string} userId - ID użytkownika
 * @param {string} [path="posts"] - Ścieżka w storage
 * @param {function} [onTotalProgress] - Callback z całkowitym postępem (0-100)
 * @param {Object} [options] - Opcje dla każdego pliku
 * @returns {Promise<Array<UploadResult>>} Tablica wyników uploadu
 */
export const uploadMultiplePhotos = async (
  files,
  userId,
  path = "photos",
  onTotalProgress = null,
  options = {}
) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("Files array is required");
    }

    const progressMap = new Map();
    const totalFiles = files.length;

    const updateTotalProgress = () => {
      if (onTotalProgress && typeof onTotalProgress === "function") {
        let total = 0;
        progressMap.forEach((value) => {
          total += value;
        });
        const avgProgress = Math.round(total / totalFiles);
        onTotalProgress(avgProgress);
      }
    };

    const uploadPromises = files.map((file, index) => {
      progressMap.set(index, 0);

      const upload = uploadMedia(file, userId, path, (progress) => {
        progressMap.set(index, progress);
        updateTotalProgress();
      }, options);

      return upload.promise;
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("uploadMultiplePhotos error:", error);
    throw error;
  }
};

// Alias
export const uploadMultipleMedia = uploadMultiplePhotos;

/**
 * Waliduje plik przed uploadem
 * @param {File|Blob} file - Plik do walidacji
 * @param {Object} [options] - Opcje walidacji
 * @param {number} [options.maxSizeMB=10] - Maksymalny rozmiar w MB
 * @param {Array<string>} [options.allowedTypes] - Dozwolone typy MIME
 * @returns {Object} Wynik walidacji { valid: boolean, error?: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/webm",
      "video/mp4",
      "video/quicktime",
    ],
  } = options;

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  if (file.type && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
};

/**
 * Waliduje plik wideo
 * @param {File|Blob} file - Plik wideo do walidacji
 * @param {Object} [options] - Opcje walidacji
 * @param {number} [options.maxSizeMB=50] - Maksymalny rozmiar w MB
 * @param {number} [options.maxDurationSec=60] - Maksymalna długość w sekundach
 * @param {Array<string>} [options.allowedTypes] - Dozwolone typy MIME
 * @returns {Promise<Object>} Wynik walidacji { valid: boolean, error?: string, duration?: number }
 */
export const validateVideo = async (file, options = {}) => {
  const {
    maxSizeMB = 50,
    maxDurationSec = 60,
    allowedTypes = ["video/webm", "video/mp4", "video/quicktime"],
  } = options;

  // Basic validation
  const basicValidation = validateFile(file, { maxSizeMB, allowedTypes });
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Duration validation
  try {
    const duration = await getVideoDuration(file);

    if (duration > maxDurationSec) {
      return {
        valid: false,
        error: `Video duration exceeds ${maxDurationSec} seconds limit`,
        duration,
      };
    }

    return { valid: true, duration };
  } catch (error) {
    console.warn("Could not validate video duration:", error);
    return { valid: true }; // Allow if duration check fails
  }
};

/**
 * Pobiera długość wideo w sekundach
 * @param {File|Blob} file - Plik wideo
 * @returns {Promise<number>} Długość w sekundach
 */
export const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
};
