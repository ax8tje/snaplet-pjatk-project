/**
 * src/services/__tests__/commentService.test.js
 * Unit tests for commentService
 */

// Mock firebase/firestore
jest.mock('firebase/firestore', () => {
  const addDoc = jest.fn();
  const getDoc = jest.fn();
  const deleteDoc = jest.fn();
  const getDocs = jest.fn();
  const onSnapshot = jest.fn();
  const collection = jest.fn((db, name) => ({ __collection: name }));
  const doc = jest.fn((db, collectionName, id) => ({ __doc: collectionName + '/' + id }));
  const query = jest.fn((colRef, ...clauses) => ({ __queryOf: colRef, clauses }));
  const where = jest.fn((field, op, value) => ({ type: 'where', field, op, value }));
  const orderBy = jest.fn((field, direction) => ({ type: 'orderBy', field, direction }));
  const serverTimestamp = jest.fn(() => ({ __serverTimestamp: true }));

  return {
    collection,
    doc,
    addDoc,
    getDoc,
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
  incrementCommentCount: jest.fn(),
  decrementCommentCount: jest.fn(),
}));

const firestore = require('firebase/firestore');
const postService = require('../postService');

const {
  createComment,
  getComment,
  getPostComments,
  deleteComment,
  subscribeToPostComments,
} = require('../commentService');

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    test('creates comment successfully', async () => {
      firestore.addDoc.mockResolvedValue({ id: 'comment123' });
      postService.incrementCommentCount.mockResolvedValue();

      const result = await createComment('post123', 'user1', 'Great post!');

      expect(firestore.collection).toHaveBeenCalled();
      expect(firestore.addDoc).toHaveBeenCalled();
      expect(postService.incrementCommentCount).toHaveBeenCalledWith('post123');
      expect(result.id).toBe('comment123');
      expect(result.postId).toBe('post123');
      expect(result.userId).toBe('user1');
      expect(result.text).toBe('Great post!');
    });

    test('trims comment text whitespace', async () => {
      firestore.addDoc.mockResolvedValue({ id: 'comment123' });
      postService.incrementCommentCount.mockResolvedValue();

      const result = await createComment('post123', 'user1', '  comment with spaces  ');

      expect(result.text).toBe('comment with spaces');
    });

    test('throws error when postId is missing', async () => {
      await expect(createComment(null, 'user1', 'text'))
        .rejects.toThrow('Post ID is required');
    });

    test('throws error when userId is missing', async () => {
      await expect(createComment('post123', null, 'text'))
        .rejects.toThrow('User ID is required');
    });

    test('throws error when text is missing', async () => {
      await expect(createComment('post123', 'user1', ''))
        .rejects.toThrow('Comment text is required');
    });

    test('throws error when text is only whitespace', async () => {
      await expect(createComment('post123', 'user1', '   '))
        .rejects.toThrow('Comment text is required');
    });

    test('throws error when text is not a string', async () => {
      await expect(createComment('post123', 'user1', 123))
        .rejects.toThrow('Comment text is required');
    });
  });

  describe('getComment', () => {
    test('returns comment when exists', async () => {
      const mockSnap = {
        exists: () => true,
        id: 'comment123',
        data: () => ({
          postId: 'post123',
          userId: 'user1',
          text: 'Great post!',
          createdAt: { toDate: () => new Date() },
        }),
      };

      firestore.getDoc.mockResolvedValue(mockSnap);

      const result = await getComment('comment123');

      expect(firestore.doc).toHaveBeenCalled();
      expect(result.id).toBe('comment123');
      expect(result.postId).toBe('post123');
      expect(result.userId).toBe('user1');
      expect(result.text).toBe('Great post!');
    });

    test('returns null when comment does not exist', async () => {
      firestore.getDoc.mockResolvedValue({ exists: () => false });

      const result = await getComment('nonexistent');

      expect(result).toBeNull();
    });

    test('throws error when commentId is missing', async () => {
      await expect(getComment(null)).rejects.toThrow('Comment ID is required');
    });
  });

  describe('getPostComments', () => {
    test('returns comments for post in chronological order', async () => {
      const mockDocs = [
        { id: 'comment1', data: () => ({ text: 'First', createdAt: 1 }) },
        { id: 'comment2', data: () => ({ text: 'Second', createdAt: 2 }) },
      ];

      firestore.getDocs.mockResolvedValue({
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getPostComments('post123');

      expect(firestore.query).toHaveBeenCalled();
      expect(firestore.where).toHaveBeenCalledWith('postId', '==', 'post123');
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'asc');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('comment1');
      expect(result[1].id).toBe('comment2');
    });

    test('returns empty array when no comments exist', async () => {
      firestore.getDocs.mockResolvedValue({
        forEach: () => {},
      });

      const result = await getPostComments('post123');

      expect(result).toHaveLength(0);
    });

    test('throws error when postId is missing', async () => {
      await expect(getPostComments(null)).rejects.toThrow('Post ID is required');
    });
  });

  describe('deleteComment', () => {
    test('deletes comment and decrements count', async () => {
      firestore.deleteDoc.mockResolvedValue();
      postService.decrementCommentCount.mockResolvedValue();

      await deleteComment('comment123', 'post123');

      expect(firestore.doc).toHaveBeenCalled();
      expect(firestore.deleteDoc).toHaveBeenCalled();
      expect(postService.decrementCommentCount).toHaveBeenCalledWith('post123');
    });

    test('throws error when commentId is missing', async () => {
      await expect(deleteComment(null, 'post123'))
        .rejects.toThrow('Comment ID is required');
    });

    test('throws error when postId is missing', async () => {
      await expect(deleteComment('comment123', null))
        .rejects.toThrow('Post ID is required');
    });
  });

  describe('subscribeToPostComments', () => {
    test('subscribes to post comments and returns unsubscribe function', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((q, onNext, onErr) => {
        const mockDocs = [
          { id: 'comment1', data: () => ({ text: 'Comment 1' }) },
          { id: 'comment2', data: () => ({ text: 'Comment 2' }) },
        ];
        onNext({ forEach: (cb) => mockDocs.forEach(cb) });
        return unsubscribe;
      });

      const callback = jest.fn();
      const unsub = subscribeToPostComments('post123', callback);

      expect(firestore.onSnapshot).toHaveBeenCalled();
      expect(firestore.where).toHaveBeenCalledWith('postId', '==', 'post123');
      expect(firestore.orderBy).toHaveBeenCalledWith('createdAt', 'asc');
      expect(callback).toHaveBeenCalledWith([
        { id: 'comment1', text: 'Comment 1' },
        { id: 'comment2', text: 'Comment 2' },
      ]);
      expect(unsub).toBe(unsubscribe);
    });

    test('handles subscription errors', () => {
      const unsubscribe = jest.fn();
      firestore.onSnapshot.mockImplementation((q, onNext, onErr) => {
        onErr(new Error('Subscription failed'));
        return unsubscribe;
      });

      const callback = jest.fn();
      subscribeToPostComments('post123', callback);

      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });

    test('throws error when postId is missing', () => {
      expect(() => subscribeToPostComments(null, jest.fn()))
        .toThrow('Post ID is required');
    });

    test('throws error when callback is not a function', () => {
      expect(() => subscribeToPostComments('post123', null))
        .toThrow('Callback function is required');
    });
  });
});
