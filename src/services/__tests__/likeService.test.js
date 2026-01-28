/**
 * src/services/__tests__/likeService.test.js
 * Unit tests for likeService
 */

// Mock firebase/firestore
jest.mock('firebase/firestore', () => {
  const getDoc = jest.fn();
  const setDoc = jest.fn();
  const deleteDoc = jest.fn();
  const getDocs = jest.fn();
  const onSnapshot = jest.fn();
  const collection = jest.fn((db, name) => ({ __collection: name }));
  const doc = jest.fn((db, collectionName, id) => ({ __doc: collectionName + '/' + id, id }));
  const query = jest.fn((colRef, ...clauses) => ({ __queryOf: colRef, clauses }));
  const where = jest.fn((field, op, value) => ({ type: 'where', field, op, value }));
  const orderBy = jest.fn((field, direction) => ({ type: 'orderBy', field, direction }));
  const serverTimestamp = jest.fn(() => ({ __serverTimestamp: true }));

  return {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    serverTimestamp,
  };
});

// Mock firebase config
jest.mock('../../config/firebase', () => ({
  db: { __mockDb: true },
}));

// Mock postService
jest.mock('../postService', () => ({
  incrementLikeCount: jest.fn(),
  decrementLikeCount: jest.fn(),
}));

const firestore = require('firebase/firestore');
const postService = require('../postService');

const {
  likePost,
  unlikePost,
  isPostLikedByUser,
  getPostLikes,
  subscribeToPostLikes,
  getUserLikes,
} = require('../likeService');

describe('likeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('likePost', () => {
    test('creates like successfully', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });
      firestore.setDoc.mockResolvedValue();
      postService.incrementLikeCount.mockResolvedValue();

      const result = await likePost('post123', 'user456');

      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.setDoc).toHaveBeenCalled();
      expect(postService.incrementLikeCount).toHaveBeenCalledWith('post123');
      expect(result.id).toBe('post123_user456');
      expect(result.postId).toBe('post123');
      expect(result.userId).toBe('user456');
    });

    test('throws error when post already liked', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => true });

      await expect(likePost('post123', 'user456'))
        .rejects.toThrow('Post already liked by this user');
    });

    test('throws error when postId is missing', async () => {
      await expect(likePost(null, 'user456'))
        .rejects.toThrow('Post ID is required');
    });

    test('throws error when userId is missing', async () => {
      await expect(likePost('post123', null))
        .rejects.toThrow('User ID is required');
    });

    test('uses composite key format postId_userId', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });
      firestore.setDoc.mockResolvedValue();
      postService.incrementLikeCount.mockResolvedValue();

      await likePost('post123', 'user456');

      expect(firestore.doc).toHaveBeenCalledWith(
        { __mockDb: true },
        'likes',
        'post123_user456'
      );
    });

    test('handles firestore error', async () => {
      firestore.getDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(likePost('post123', 'user456'))
        .rejects.toThrow('Failed to like post: Firestore error');
    });
  });

  describe('unlikePost', () => {
    test('removes like successfully', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => true });
      firestore.deleteDoc.mockResolvedValue();
      postService.decrementLikeCount.mockResolvedValue();

      await unlikePost('post123', 'user456');

      expect(firestore.deleteDoc).toHaveBeenCalled();
      expect(postService.decrementLikeCount).toHaveBeenCalledWith('post123');
    });

    test('throws error when like not found', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });

      await expect(unlikePost('post123', 'user456'))
        .rejects.toThrow('Like not found');
    });

    test('throws error when postId is missing', async () => {
      await expect(unlikePost(null, 'user456'))
        .rejects.toThrow('Post ID is required');
    });

    test('throws error when userId is missing', async () => {
      await expect(unlikePost('post123', null))
        .rejects.toThrow('User ID is required');
    });

    test('uses composite key format', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => true });
      firestore.deleteDoc.mockResolvedValue();
      postService.decrementLikeCount.mockResolvedValue();

      await unlikePost('post123', 'user456');

      expect(firestore.doc).toHaveBeenCalledWith(
        { __mockDb: true },
        'likes',
        'post123_user456'
      );
    });

    test('handles firestore error', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => true });
      firestore.deleteDoc.mockRejectedValue(new Error('Delete failed'));

      await expect(unlikePost('post123', 'user456'))
        .rejects.toThrow('Failed to unlike post: Delete failed');
    });
  });

  describe('isPostLikedByUser', () => {
    test('returns true when like exists', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => true });

      const result = await isPostLikedByUser('post123', 'user456');

      expect(result).toBe(true);
      expect(firestore.doc).toHaveBeenCalledWith(
        { __mockDb: true },
        'likes',
        'post123_user456'
      );
    });

    test('returns false when like does not exist', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });

      const result = await isPostLikedByUser('post123', 'user456');

      expect(result).toBe(false);
    });

    test('throws error when postId is missing', async () => {
      await expect(isPostLikedByUser(null, 'user456'))
        .rejects.toThrow('Post ID is required');
    });

    test('throws error when userId is missing', async () => {
      await expect(isPostLikedByUser('post123', null))
        .rejects.toThrow('User ID is required');
    });

    test('handles firestore error', async () => {
      firestore.getDoc.mockRejectedValue(new Error('Network error'));

      await expect(isPostLikedByUser('post123', 'user456'))
        .rejects.toThrow('Failed to check like status: Network error');
    });
  });

  describe('getPostLikes', () => {
    test('returns all likes for a post', async () => {
      const mockDocs = [
        { id: 'post123_user1', data: () => ({ postId: 'post123', userId: 'user1' }) },
        { id: 'post123_user2', data: () => ({ postId: 'post123', userId: 'user2' }) },
      ];

      firestore.getDocs.mockResolvedValue({
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getPostLikes('post123');

      expect(firestore.query).toHaveBeenCalled();
      expect(firestore.where).toHaveBeenCalledWith('postId', '==', 'post123');
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('post123_user1');
      expect(result[1].userId).toBe('user2');
    });

    test('returns empty array when no likes', async () => {
      firestore.getDocs.mockResolvedValue({
        forEach: () => {},
      });

      const result = await getPostLikes('post123');

      expect(result).toEqual([]);
    });

    test('throws error when postId is missing', async () => {
      await expect(getPostLikes(null))
        .rejects.toThrow('Post ID is required');
    });

    test('handles firestore error', async () => {
      firestore.getDocs.mockRejectedValue(new Error('Query failed'));

      await expect(getPostLikes('post123'))
        .rejects.toThrow('Failed to get post likes: Query failed');
    });
  });

  describe('subscribeToPostLikes', () => {
    test('subscribes to post likes and returns unsubscribe function', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((q, onNext, onErr) => {
        const mockDocs = [
          { id: 'post123_user1', data: () => ({ postId: 'post123', userId: 'user1' }) },
        ];
        onNext({ forEach: (cb) => mockDocs.forEach(cb) });
        return unsubscribe;
      });

      const callback = jest.fn();
      const unsub = subscribeToPostLikes('post123', callback);

      expect(firestore.onSnapshot).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith([
        { id: 'post123_user1', postId: 'post123', userId: 'user1' },
      ]);
      expect(unsub).toBe(unsubscribe);
    });

    test('handles snapshot errors', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((q, onNext, onErr) => {
        onErr(new Error('Snapshot error'));
        return unsubscribe;
      });

      const callback = jest.fn();
      subscribeToPostLikes('post123', callback);

      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    test('throws error when postId is missing', () => {
      expect(() => subscribeToPostLikes(null, jest.fn()))
        .toThrow('Post ID is required');
    });

    test('throws error when callback is not a function', () => {
      expect(() => subscribeToPostLikes('post123', null))
        .toThrow('Callback function is required');
    });

    test('queries with correct filters', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((q, onNext, onErr) => {
        onNext({ forEach: () => {} });
        return unsubscribe;
      });

      subscribeToPostLikes('post123', jest.fn());

      expect(firestore.where).toHaveBeenCalledWith('postId', '==', 'post123');
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });
  });

  describe('getUserLikes', () => {
    test('returns all likes by a user', async () => {
      const mockDocs = [
        { id: 'post1_user123', data: () => ({ postId: 'post1', userId: 'user123' }) },
        { id: 'post2_user123', data: () => ({ postId: 'post2', userId: 'user123' }) },
      ];

      firestore.getDocs.mockResolvedValue({
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getUserLikes('user123');

      expect(firestore.where).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toHaveLength(2);
      expect(result[0].postId).toBe('post1');
    });

    test('returns empty array when user has no likes', async () => {
      firestore.getDocs.mockResolvedValue({
        forEach: () => {},
      });

      const result = await getUserLikes('user123');

      expect(result).toEqual([]);
    });

    test('throws error when userId is missing', async () => {
      await expect(getUserLikes(null))
        .rejects.toThrow('User ID is required');
    });

    test('handles firestore error', async () => {
      firestore.getDocs.mockRejectedValue(new Error('Query failed'));

      await expect(getUserLikes('user123'))
        .rejects.toThrow('Failed to get user likes: Query failed');
    });
  });

  describe('integration scenarios', () => {
    test('like and unlike flow', async () => {
      // Like
      firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
      firestore.setDoc.mockResolvedValue();
      postService.incrementLikeCount.mockResolvedValue();

      const like = await likePost('post123', 'user456');
      expect(like.id).toBe('post123_user456');

      // Check liked
      firestore.getDoc.mockResolvedValueOnce({ exists: () => true });
      const isLiked = await isPostLikedByUser('post123', 'user456');
      expect(isLiked).toBe(true);

      // Unlike
      firestore.getDoc.mockResolvedValueOnce({ exists: () => true });
      firestore.deleteDoc.mockResolvedValue();
      postService.decrementLikeCount.mockResolvedValue();

      await unlikePost('post123', 'user456');
      expect(postService.decrementLikeCount).toHaveBeenCalledWith('post123');
    });

    test('prevents duplicate likes', async () => {
      // First like - success
      firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
      firestore.setDoc.mockResolvedValue();
      postService.incrementLikeCount.mockResolvedValue();

      await likePost('post123', 'user456');

      // Second like - should fail
      firestore.getDoc.mockResolvedValueOnce({ exists: () => true });

      await expect(likePost('post123', 'user456'))
        .rejects.toThrow('Post already liked by this user');

      // incrementLikeCount should only be called once
      expect(postService.incrementLikeCount).toHaveBeenCalledTimes(1);
    });
  });
});
