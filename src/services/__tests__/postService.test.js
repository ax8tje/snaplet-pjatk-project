/**
 * src/services/__tests__/postService.test.js
 * Unit tests for postService
 */

// Mock firebase/firestore
jest.mock('firebase/firestore', () => {
  const addDoc = jest.fn();
  const getDoc = jest.fn();
  const updateDoc = jest.fn();
  const deleteDoc = jest.fn();
  const getDocs = jest.fn();
  const onSnapshot = jest.fn();
  const collection = jest.fn((db, name) => ({ __collection: name }));
  const doc = jest.fn((db, collectionName, id) => ({ __doc: collectionName + '/' + id }));
  const query = jest.fn((colRef, ...clauses) => ({ __queryOf: colRef, clauses }));
  const where = jest.fn((field, op, value) => ({ type: 'where', field, op, value }));
  const orderBy = jest.fn((field, direction) => ({ type: 'orderBy', field, direction }));
  const limit = jest.fn((n) => ({ type: 'limit', n }));
  const startAfter = jest.fn((doc) => ({ type: 'startAfter', doc }));
  const serverTimestamp = jest.fn(() => ({ __serverTimestamp: true }));
  const increment = jest.fn((n) => ({ __increment: n }));

  return {
    collection,
    doc,
    addDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    onSnapshot,
    serverTimestamp,
    increment,
  };
});

// Mock firebase config
jest.mock('../../config/firebase', () => ({
  db: { __mockDb: true },
}));

// Mock storageService
jest.mock('../storageService', () => ({
  uploadPhoto: jest.fn(),
  deletePhoto: jest.fn(),
}));

const firestore = require('firebase/firestore');
const storageService = require('../storageService');

const {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getFeedPosts,
  getUserPosts,
  subscribeToFeed,
  subscribeToPost,
  incrementLikeCount,
  decrementLikeCount,
  incrementCommentCount,
  decrementCommentCount,
} = require('../postService');

describe('postService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    test('creates post with image upload successfully', async () => {
      const mockUploadResult = {
        downloadURL: 'https://storage.com/image.jpg',
        thumbnailURL: 'https://storage.com/thumb.jpg',
        fullPath: 'posts/user1/image.jpg',
        thumbnailPath: 'posts/user1/thumbnails/image.jpg',
      };

      storageService.uploadPhoto.mockReturnValue({
        promise: Promise.resolve(mockUploadResult),
      });

      firestore.addDoc.mockResolvedValue({ id: 'post123' });

      const result = await createPost('user1', new Blob(['test']), 'Test caption');

      expect(storageService.uploadPhoto).toHaveBeenCalledWith(
        expect.any(Blob),
        'user1',
        'posts',
        null,
        { compress: true, generateThumb: true }
      );
      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result.id).toBe('post123');
      expect(result.userId).toBe('user1');
      expect(result.caption).toBe('Test caption');
      expect(result.likes).toBe(0);
      expect(result.commentCount).toBe(0);
    });

    test('throws error when userId is missing', async () => {
      await expect(createPost(null, new Blob(['test']), 'caption'))
        .rejects.toThrow('User ID is required');
    });

    test('throws error when imageFile is missing', async () => {
      await expect(createPost('user1', null, 'caption'))
        .rejects.toThrow('Image file is required');
    });

    test('trims caption whitespace', async () => {
      const mockUploadResult = {
        downloadURL: 'https://storage.com/image.jpg',
        fullPath: 'posts/user1/image.jpg',
      };

      storageService.uploadPhoto.mockReturnValue({
        promise: Promise.resolve(mockUploadResult),
      });

      firestore.addDoc.mockResolvedValue({ id: 'post123' });

      const result = await createPost('user1', new Blob(['test']), '  caption with spaces  ');

      expect(result.caption).toBe('caption with spaces');
    });
  });

  describe('getPost', () => {
    test('returns post when exists', async () => {
      const mockSnap = {
        exists: () => true,
        id: 'post123',
        data: () => ({
          userId: 'user1',
          imageUrl: 'https://storage.com/image.jpg',
          caption: 'Test',
          likes: 5,
          commentCount: 2,
        }),
      };

      firestore.getDoc.mockResolvedValue(mockSnap);

      const result = await getPost('post123');

      expect(firestore.doc).toHaveBeenCalled();
      expect(result.id).toBe('post123');
      expect(result.userId).toBe('user1');
      expect(result.likes).toBe(5);
    });

    test('returns null when post does not exist', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });

      const result = await getPost('nonexistent');

      expect(result).toBeNull();
    });

    test('throws error when postId is missing', async () => {
      await expect(getPost(null)).rejects.toThrow('Post ID is required');
    });
  });

  describe('updatePost', () => {
    test('updates post caption successfully', async () => {
      firestore.updateDoc.mockResolvedValue();

      await updatePost('post123', { caption: 'Updated caption' });

      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.updateDoc).toHaveBeenCalled();
    });

    test('filters out protected fields', async () => {
      firestore.updateDoc.mockResolvedValue();

      await updatePost('post123', {
        caption: 'New caption',
        likes: 100,
        commentCount: 50,
        userId: 'hacker',
        createdAt: 'fake',
      });

      const updateCall = firestore.updateDoc.mock.calls[0][1];
      expect(updateCall.caption).toBe('New caption');
      expect(updateCall.likes).toBeUndefined();
      expect(updateCall.commentCount).toBeUndefined();
      expect(updateCall.userId).toBeUndefined();
      expect(updateCall.createdAt).toBeUndefined();
    });

    test('throws error when postId is missing', async () => {
      await expect(updatePost(null, { caption: 'test' }))
        .rejects.toThrow('Post ID is required');
    });

    test('throws error when data is invalid', async () => {
      await expect(updatePost('post123', null))
        .rejects.toThrow('Update data is required');
    });
  });

  describe('deletePost', () => {
    test('deletes post and associated images', async () => {
      const mockSnap = {
        exists: () => true,
        id: 'post123',
        data: () => ({
          imagePath: 'posts/user1/image.jpg',
          thumbnailPath: 'posts/user1/thumbnails/image.jpg',
        }),
      };

      firestore.getDoc.mockResolvedValue(mockSnap);
      storageService.deletePhoto.mockResolvedValue();
      firestore.deleteDoc.mockResolvedValue();

      await deletePost('post123');

      expect(storageService.deletePhoto).toHaveBeenCalledWith('posts/user1/image.jpg');
      expect(storageService.deletePhoto).toHaveBeenCalledWith('posts/user1/thumbnails/image.jpg');
      expect(firestore.deleteDoc).toHaveBeenCalled();
    });

    test('throws error when post not found', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });

      await expect(deletePost('nonexistent')).rejects.toThrow('Post not found');
    });

    test('continues deletion even if image deletion fails', async () => {
      const mockSnap = {
        exists: () => true,
        id: 'post123',
        data: () => ({
          imagePath: 'posts/user1/image.jpg',
        }),
      };

      firestore.getDoc.mockResolvedValue(mockSnap);
      storageService.deletePhoto.mockRejectedValue(new Error('Storage error'));
      firestore.deleteDoc.mockResolvedValue();

      await deletePost('post123');

      expect(firestore.deleteDoc).toHaveBeenCalled();
    });
  });

  describe('getFeedPosts', () => {
    test('returns paginated posts', async () => {
      const mockDocs = [
        { id: 'post1', data: () => ({ caption: 'First' }) },
        { id: 'post2', data: () => ({ caption: 'Second' }) },
      ];

      firestore.getDocs.mockResolvedValue({
        docs: mockDocs,
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getFeedPosts(10);

      expect(firestore.query).toHaveBeenCalled();
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0].id).toBe('post1');
      expect(result.hasMore).toBe(false);
    });

    test('handles pagination with lastDoc', async () => {
      const mockDocs = [
        { id: 'post3', data: () => ({ caption: 'Third' }) },
      ];

      firestore.getDocs.mockResolvedValue({
        docs: mockDocs,
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const lastDoc = { id: 'post2' };
      await getFeedPosts(10, lastDoc);

      expect(firestore.startAfter).toHaveBeenCalledWith(lastDoc);
    });

    test('detects hasMore correctly', async () => {
      const mockDocs = Array(11).fill(null).map((_, i) => ({
        id: 'post' + i,
        data: () => ({ caption: 'Post ' + i }),
      }));

      firestore.getDocs.mockResolvedValue({
        docs: mockDocs,
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getFeedPosts(10);

      expect(result.posts).toHaveLength(10);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('getUserPosts', () => {
    test('returns posts for specific user', async () => {
      const mockDocs = [
        { id: 'post1', data: () => ({ userId: 'user1', caption: 'My post' }) },
      ];

      firestore.getDocs.mockResolvedValue({
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getUserPosts('user1');

      expect(firestore.where).toHaveBeenCalledWith('userId', '==', 'user1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('post1');
    });

    test('throws error when userId is missing', async () => {
      await expect(getUserPosts(null)).rejects.toThrow('User ID is required');
    });
  });

  describe('subscribeToFeed', () => {
    test('subscribes to feed and returns unsubscribe function', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((q, onNext, onErr) => {
        const mockDocs = [
          { id: 'post1', data: () => ({ caption: 'Test' }) },
        ];
        onNext({ forEach: (cb) => mockDocs.forEach(cb) });
        return unsubscribe;
      });

      const callback = jest.fn();
      const unsub = subscribeToFeed(callback, 20);

      expect(firestore.onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith([{ id: 'post1', caption: 'Test' }]);
      expect(unsub).toBe(unsubscribe);
    });

    test('throws error when callback is not a function', () => {
      expect(() => subscribeToFeed(null)).toThrow('Callback function is required');
    });
  });

  describe('subscribeToPost', () => {
    test('subscribes to single post', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((ref, onNext, onErr) => {
        onNext({
          exists: () => true,
          id: 'post123',
          data: () => ({ caption: 'Test' }),
        });
        return unsubscribe;
      });

      const callback = jest.fn();
      const unsub = subscribeToPost('post123', callback);

      expect(callback).toHaveBeenCalledWith({ id: 'post123', caption: 'Test' });
      expect(unsub).toBe(unsubscribe);
    });

    test('calls callback with null when post does not exist', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((ref, onNext, onErr) => {
        onNext({ exists: () => false });
        return unsubscribe;
      });

      const callback = jest.fn();
      subscribeToPost('post123', callback);

      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('incrementLikeCount', () => {
    test('increments like count', async () => {
      firestore.updateDoc.mockResolvedValue();

      await incrementLikeCount('post123');

      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.increment).toHaveBeenCalledWith(1);
      expect(firestore.updateDoc).toHaveBeenCalled();
    });

    test('throws error when postId is missing', async () => {
      await expect(incrementLikeCount(null)).rejects.toThrow('Post ID is required');
    });
  });

  describe('decrementLikeCount', () => {
    test('decrements like count', async () => {
      firestore.updateDoc.mockResolvedValue();

      await decrementLikeCount('post123');

      expect(firestore.increment).toHaveBeenCalledWith(-1);
    });
  });

  describe('incrementCommentCount', () => {
    test('increments comment count', async () => {
      firestore.updateDoc.mockResolvedValue();

      await incrementCommentCount('post123');

      expect(firestore.increment).toHaveBeenCalledWith(1);
    });
  });

  describe('decrementCommentCount', () => {
    test('decrements comment count', async () => {
      firestore.updateDoc.mockResolvedValue();

      await decrementCommentCount('post123');

      expect(firestore.increment).toHaveBeenCalledWith(-1);
    });
  });
});
