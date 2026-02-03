// src/services/__tests__/storageService.test.js

/**
 * @jest-environment jsdom
 */

// Mock Firebase Storage - musi być przed importami
jest.mock("firebase/storage", () => ({
  ref: jest.fn(() => ({ fullPath: "test/path" })),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Mock Firebase config
jest.mock("../../config/firebase", () => ({
  storage: {},
}));

// Mock URL API
global.URL.createObjectURL = jest.fn(() => "blob:test-url");
global.URL.revokeObjectURL = jest.fn();

// Importy po mockach
import {
  uploadPhoto,
  uploadVideo,
  uploadMedia,
  deletePhoto,
  deleteMedia,
  deleteVideo,
  getDownloadURL,
  uploadMultiplePhotos,
  uploadMultipleMedia,
  validateFile,
  validateVideo,
  getVideoDuration,
  generateVideoThumbnail,
} from "../storageService";

describe("storageService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // validateFile tests
  // ============================================
  describe("validateFile", () => {
    test("returns valid for correct image file", () => {
      const file = { type: "image/jpeg", size: 1024 * 1024 };

      const result = validateFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test("returns valid for correct video file (webm)", () => {
      const file = { type: "video/webm", size: 5 * 1024 * 1024 };

      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    test("returns valid for correct video file (mp4)", () => {
      const file = { type: "video/mp4", size: 5 * 1024 * 1024 };

      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    test("returns valid for correct video file (quicktime)", () => {
      const file = { type: "video/quicktime", size: 5 * 1024 * 1024 };

      const result = validateFile(file);

      expect(result.valid).toBe(true);
    });

    test("returns invalid when no file provided", () => {
      const result = validateFile(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file provided");
    });

    test("returns invalid for file exceeding size limit", () => {
      const file = { type: "image/jpeg", size: 15 * 1024 * 1024 };

      const result = validateFile(file, { maxSizeMB: 10 });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("File size exceeds 10MB limit");
    });

    test("returns invalid for disallowed file type", () => {
      const file = { type: "application/pdf", size: 1024 };

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("File type application/pdf is not allowed");
    });

    test("allows custom file types", () => {
      const file = { type: "image/svg+xml", size: 1024 };

      const result = validateFile(file, {
        allowedTypes: ["image/svg+xml", "image/png"],
      });

      expect(result.valid).toBe(true);
    });

    test("allows custom max size", () => {
      const file = { type: "image/jpeg", size: 3 * 1024 * 1024 };

      const result = validateFile(file, { maxSizeMB: 5 });

      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // validateVideo tests
  // ============================================
  describe("validateVideo", () => {
    test("returns invalid for file exceeding size limit", async () => {
      const file = { type: "video/webm", size: 60 * 1024 * 1024 };

      const result = await validateVideo(file, { maxSizeMB: 50 });

      expect(result.valid).toBe(false);
      expect(result.error).toBe("File size exceeds 50MB limit");
    });

    test("returns invalid for disallowed video type", async () => {
      const file = { type: "video/avi", size: 1024 };

      const result = await validateVideo(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("File type video/avi is not allowed");
    });

    test("returns invalid when no file provided", async () => {
      const result = await validateVideo(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("No file provided");
    });
  });

  // ============================================
  // uploadPhoto tests
  // ============================================
  describe("uploadPhoto", () => {
    const { uploadBytesResumable, getDownloadURL: fbGetDownloadURL } =
      require("firebase/storage");

    beforeEach(() => {
      uploadBytesResumable.mockReturnValue({
        on: jest.fn((event, onProgress, onError, onComplete) => {
          onProgress({ bytesTransferred: 50, totalBytes: 100 });
          onProgress({ bytesTransferred: 100, totalBytes: 100 });
          onComplete();
        }),
        snapshot: { ref: {} },
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
      });

      fbGetDownloadURL.mockResolvedValue("https://example.com/photo.jpg");
    });

    test("returns upload task object with control methods", () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadPhoto(file, "user123", "photos", null, {
        compress: false,
      });

      expect(uploadTask).toHaveProperty("promise");
      expect(uploadTask).toHaveProperty("cancel");
      expect(uploadTask).toHaveProperty("pause");
      expect(uploadTask).toHaveProperty("resume");
      expect(typeof uploadTask.cancel).toBe("function");
      expect(typeof uploadTask.pause).toBe("function");
      expect(typeof uploadTask.resume).toBe("function");
    });

    test("throws error when file is not provided", async () => {
      const uploadTask = uploadPhoto(null, "user123");

      await expect(uploadTask.promise).rejects.toThrow("File is required");
    });

    test("throws error when userId is not provided", async () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadPhoto(file, null);

      await expect(uploadTask.promise).rejects.toThrow("User ID is required");
    });

    test("calls onProgress callback during upload", async () => {
      const file = { name: "test.jpg", type: "image/jpeg" };
      const onProgress = jest.fn();

      const uploadTask = uploadPhoto(file, "user123", "photos", onProgress, {
        compress: false,
      });

      await uploadTask.promise;

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    test("returns download URL after successful upload", async () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadPhoto(file, "user123", "photos", null, {
        compress: false,
      });

      const result = await uploadTask.promise;

      expect(result).toHaveProperty("downloadURL");
      expect(result).toHaveProperty("fullPath");
      expect(result).toHaveProperty("name");
      expect(result.downloadURL).toBe("https://example.com/photo.jpg");
    });

    test("cancel method exists and is callable", () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadPhoto(file, "user123", "photos", null, {
        compress: false,
      });

      expect(() => uploadTask.cancel()).not.toThrow();
    });

    test("pause method exists and is callable", () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadPhoto(file, "user123", "photos", null, {
        compress: false,
      });

      expect(() => uploadTask.pause()).not.toThrow();
    });

    test("resume method exists and is callable", () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadPhoto(file, "user123", "photos", null, {
        compress: false,
      });

      expect(() => uploadTask.resume()).not.toThrow();
    });
  });

  // ============================================
  // uploadVideo tests
  // ============================================
  describe("uploadVideo", () => {
    const { uploadBytesResumable, getDownloadURL: fbGetDownloadURL } =
      require("firebase/storage");

    beforeEach(() => {
      uploadBytesResumable.mockReturnValue({
        on: jest.fn((event, onProgress, onError, onComplete) => {
          onProgress({ bytesTransferred: 50, totalBytes: 100 });
          onProgress({ bytesTransferred: 100, totalBytes: 100 });
          onComplete();
        }),
        snapshot: { ref: {} },
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
      });

      fbGetDownloadURL.mockResolvedValue("https://example.com/video.webm");
    });

    test("returns upload task object with control methods", () => {
      const file = new Blob(["test"], { type: "video/webm" });
      file.name = "test.webm";

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        generateThumb: false,
      });

      expect(uploadTask).toHaveProperty("promise");
      expect(uploadTask).toHaveProperty("cancel");
      expect(uploadTask).toHaveProperty("pause");
      expect(uploadTask).toHaveProperty("resume");
    });

    test("throws error when file is not provided", async () => {
      const uploadTask = uploadVideo(null, "user123");

      await expect(uploadTask.promise).rejects.toThrow("File is required");
    });

    test("throws error when userId is not provided", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, null);

      await expect(uploadTask.promise).rejects.toThrow("User ID is required");
    });

    test("uses correct content type for webm", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        generateThumb: false,
      });

      await uploadTask.promise;

      expect(uploadBytesResumable).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ contentType: "video/webm" })
      );
    });

    test("uses custom mimeType when provided", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        mimeType: "video/mp4",
        generateThumb: false,
      });

      await uploadTask.promise;

      expect(uploadBytesResumable).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ contentType: "video/mp4" })
      );
    });

    test("returns result with isVideo flag", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        generateThumb: false,
      });

      const result = await uploadTask.promise;

      expect(result.isVideo).toBe(true);
      expect(result.mimeType).toBe("video/webm");
    });

    test("calls onProgress callback during upload", async () => {
      const file = new Blob(["test"], { type: "video/webm" });
      const onProgress = jest.fn();

      const uploadTask = uploadVideo(file, "user123", "videos", onProgress, {
        generateThumb: false,
      });

      await uploadTask.promise;

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    test("uses custom extension when provided", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        extension: "mp4",
        generateThumb: false,
      });

      const result = await uploadTask.promise;

      expect(result.name).toContain(".mp4");
    });

    test("defaults to webm extension", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        generateThumb: false,
      });

      const result = await uploadTask.promise;

      expect(result.name).toContain(".webm");
    });

    test("cancel method stops upload", () => {
      const file = new Blob(["test"], { type: "video/webm" });

      const uploadTask = uploadVideo(file, "user123", "videos", null, {
        generateThumb: false,
      });

      expect(() => uploadTask.cancel()).not.toThrow();
    });
  });

  // ============================================
  // uploadMedia tests
  // ============================================
  describe("uploadMedia", () => {
    const { uploadBytesResumable, getDownloadURL: fbGetDownloadURL } =
      require("firebase/storage");

    beforeEach(() => {
      uploadBytesResumable.mockReturnValue({
        on: jest.fn((event, onProgress, onError, onComplete) => {
          onProgress({ bytesTransferred: 100, totalBytes: 100 });
          onComplete();
        }),
        snapshot: { ref: {} },
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
      });

      fbGetDownloadURL.mockResolvedValue("https://example.com/media.jpg");
    });

    test("auto-detects image file and uses uploadPhoto", async () => {
      const file = { name: "test.jpg", type: "image/jpeg" };

      const uploadTask = uploadMedia(file, "user123", "posts", null, {
        compress: false,
      });

      const result = await uploadTask.promise;

      expect(result).toHaveProperty("downloadURL");
      expect(result.isVideo).toBeUndefined();
    });

    test("auto-detects video file and uses uploadVideo", async () => {
      const file = new Blob(["test"], { type: "video/webm" });

      fbGetDownloadURL.mockResolvedValue("https://example.com/video.webm");

      const uploadTask = uploadMedia(file, "user123", "posts", null, {
        generateThumb: false,
      });

      const result = await uploadTask.promise;

      expect(result.isVideo).toBe(true);
    });

    test("uses explicit isVideo flag when provided", async () => {
      const file = { name: "test.dat", type: "application/octet-stream" };

      fbGetDownloadURL.mockResolvedValue("https://example.com/video.webm");

      const uploadTask = uploadMedia(file, "user123", "posts", null, {
        isVideo: true,
        mimeType: "video/webm",
        generateThumb: false,
      });

      const result = await uploadTask.promise;

      expect(result.isVideo).toBe(true);
    });

    test("detects video from mimeType option", async () => {
      const file = { name: "test.dat" };

      fbGetDownloadURL.mockResolvedValue("https://example.com/video.webm");

      const uploadTask = uploadMedia(file, "user123", "posts", null, {
        mimeType: "video/mp4",
        generateThumb: false,
      });

      const result = await uploadTask.promise;

      expect(result.isVideo).toBe(true);
    });
  });

  // ============================================
  // deletePhoto tests
  // ============================================
  describe("deletePhoto", () => {
    const { deleteObject, ref } = require("firebase/storage");

    beforeEach(() => {
      deleteObject.mockResolvedValue();
    });

    test("throws error when photoUrl is not provided", async () => {
      await expect(deletePhoto(null)).rejects.toThrow(
        "Photo URL or path is required"
      );
    });

    test("throws error when photoUrl is empty string", async () => {
      await expect(deletePhoto("")).rejects.toThrow(
        "Photo URL or path is required"
      );
    });

    test("deletes photo by path successfully", async () => {
      await deletePhoto("photos/user123/test.jpg");

      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
    });

    test("deletes video by path successfully", async () => {
      await deletePhoto("videos/user123/test.webm");

      expect(ref).toHaveBeenCalled();
      expect(deleteObject).toHaveBeenCalled();
    });

    test("extracts path from Firebase Storage URL", async () => {
      const url =
        "https://firebasestorage.googleapis.com/v0/b/test.appspot.com/o/photos%2Fuser123%2Ftest.jpg?alt=media";

      await deletePhoto(url);

      expect(deleteObject).toHaveBeenCalled();
    });

    test("throws specific error when photo not found", async () => {
      deleteObject.mockRejectedValue({ code: "storage/object-not-found" });

      await expect(deletePhoto("photos/nonexistent.jpg")).rejects.toThrow(
        "Photo not found"
      );
    });

    test("throws original error for other errors", async () => {
      const error = new Error("Network error");
      deleteObject.mockRejectedValue(error);

      await expect(deletePhoto("photos/test.jpg")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("deleteMedia and deleteVideo aliases", () => {
    test("deleteMedia is same as deletePhoto", () => {
      expect(deleteMedia).toBe(deletePhoto);
    });

    test("deleteVideo is same as deletePhoto", () => {
      expect(deleteVideo).toBe(deletePhoto);
    });
  });

  // ============================================
  // getDownloadURL tests
  // ============================================
  describe("getDownloadURL", () => {
    const { getDownloadURL: fbGetDownloadURL, ref } =
      require("firebase/storage");

    beforeEach(() => {
      fbGetDownloadURL.mockResolvedValue("https://example.com/photo.jpg");
    });

    test("throws error when path is not provided", async () => {
      await expect(getDownloadURL(null)).rejects.toThrow("Path is required");
    });

    test("throws error when path is empty string", async () => {
      await expect(getDownloadURL("")).rejects.toThrow("Path is required");
    });

    test("returns download URL successfully", async () => {
      const url = await getDownloadURL("photos/user123/test.jpg");

      expect(ref).toHaveBeenCalled();
      expect(url).toBe("https://example.com/photo.jpg");
    });

    test("returns download URL for video", async () => {
      fbGetDownloadURL.mockResolvedValue("https://example.com/video.webm");

      const url = await getDownloadURL("videos/user123/test.webm");

      expect(url).toBe("https://example.com/video.webm");
    });

    test("throws specific error when file not found", async () => {
      fbGetDownloadURL.mockRejectedValue({ code: "storage/object-not-found" });

      await expect(getDownloadURL("photos/nonexistent.jpg")).rejects.toThrow(
        "File not found"
      );
    });

    test("throws original error for other errors", async () => {
      const error = new Error("Permission denied");
      fbGetDownloadURL.mockRejectedValue(error);

      await expect(getDownloadURL("photos/test.jpg")).rejects.toThrow(
        "Permission denied"
      );
    });
  });

  // ============================================
  // uploadMultiplePhotos tests
  // ============================================
  describe("uploadMultiplePhotos", () => {
    const { uploadBytesResumable, getDownloadURL: fbGetDownloadURL } =
      require("firebase/storage");

    beforeEach(() => {
      uploadBytesResumable.mockReturnValue({
        on: jest.fn((event, onProgress, onError, onComplete) => {
          onProgress({ bytesTransferred: 100, totalBytes: 100 });
          onComplete();
        }),
        snapshot: { ref: {} },
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
      });

      fbGetDownloadURL.mockResolvedValue("https://example.com/photo.jpg");
    });

    test("throws error when files array is empty", async () => {
      await expect(uploadMultiplePhotos([], "user123")).rejects.toThrow(
        "Files array is required"
      );
    });

    test("throws error when files is null", async () => {
      await expect(uploadMultiplePhotos(null, "user123")).rejects.toThrow(
        "Files array is required"
      );
    });

    test("uploads multiple files successfully", async () => {
      const files = [
        { name: "test1.jpg", type: "text/plain" },
        { name: "test2.jpg", type: "text/plain" },
      ];

      const results = await uploadMultiplePhotos(files, "user123", "photos");

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty("downloadURL");
      expect(results[1]).toHaveProperty("downloadURL");
    });

    test("calls onTotalProgress callback", async () => {
      const files = [
        { name: "test1.jpg", type: "text/plain" },
        { name: "test2.jpg", type: "text/plain" },
      ];

      const onTotalProgress = jest.fn();

      await uploadMultiplePhotos(files, "user123", "photos", onTotalProgress);

      expect(onTotalProgress).toHaveBeenCalled();
    });

    test("uploads single file successfully", async () => {
      const files = [{ name: "test.jpg", type: "text/plain" }];

      const results = await uploadMultiplePhotos(files, "user123", "photos");

      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty("downloadURL");
    });
  });

  describe("uploadMultipleMedia alias", () => {
    test("uploadMultipleMedia is same as uploadMultiplePhotos", () => {
      expect(uploadMultipleMedia).toBe(uploadMultiplePhotos);
    });
  });

  // ============================================
  // generateVideoThumbnail tests
  // ============================================
  describe("generateVideoThumbnail", () => {
    test("throws error when video file is not provided", async () => {
      await expect(generateVideoThumbnail(null)).rejects.toThrow(
        "Video file is required"
      );
    });
  });

  // ============================================
  // getVideoDuration tests
  // ============================================
  describe("getVideoDuration", () => {
    test("function exists and is exported", () => {
      expect(typeof getVideoDuration).toBe("function");
    });
  });
});
