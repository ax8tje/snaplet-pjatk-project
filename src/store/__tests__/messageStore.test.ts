import { useMessageStore } from '../messageStore';

// Mock the services
jest.mock('../../services/messageService', () => ({
  sendMessage: jest.fn(),
  getConversations: jest.fn(),
  getConversation: jest.fn(),
  markMessageRead: jest.fn(),
  subscribeToConversation: jest.fn(() => jest.fn()),
  subscribeToConversations: jest.fn(() => jest.fn()),
}));

jest.mock('../../services/userService', () => ({
  getUserProfile: jest.fn(),
}));

import {
  sendMessage,
  getConversations,
  getConversation,
  markMessageRead,
  subscribeToConversation,
  subscribeToConversations,
} from '../../services/messageService';
import { getUserProfile } from '../../services/userService';

const mockSendMessage = sendMessage as jest.MockedFunction<typeof sendMessage>;
const mockGetConversations = getConversations as jest.MockedFunction<typeof getConversations>;
const mockGetConversation = getConversation as jest.MockedFunction<typeof getConversation>;
const mockMarkMessageRead = markMessageRead as jest.MockedFunction<typeof markMessageRead>;
const mockSubscribeToConversation = subscribeToConversation as jest.MockedFunction<typeof subscribeToConversation>;
const mockSubscribeToConversations = subscribeToConversations as jest.MockedFunction<typeof subscribeToConversations>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

describe('messageStore', () => {
  beforeEach(() => {
    // Reset store state
    useMessageStore.setState({
      conversations: [],
      currentConversation: [],
      currentConversationUserId: null,
      messages: [],
      isLoading: false,
      error: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty conversations', () => {
      const state = useMessageStore.getState();
      expect(state.conversations).toEqual([]);
    });

    it('should have empty current conversation', () => {
      const state = useMessageStore.getState();
      expect(state.currentConversation).toEqual([]);
    });

    it('should not be loading', () => {
      const state = useMessageStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have no error', () => {
      const state = useMessageStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setConversations', () => {
    it('should update conversations', () => {
      const conversations = [
        {
          odUsers: 'user1_user2',
          odUserId: 'user2',
          odDisplayName: 'User 2',
          odPhotoURL: '',
          lastMessage: 'Hello',
          lastMessageTime: new Date(),
          unreadCount: 1,
        },
      ];

      useMessageStore.getState().setConversations(conversations);
      expect(useMessageStore.getState().conversations).toEqual(conversations);
    });
  });

  describe('setCurrentConversation', () => {
    it('should update current conversation messages', () => {
      const messages = [
        {
          messageId: 'msg1',
          senderId: 'user1',
          receiverId: 'user2',
          text: 'Hello',
          read: false,
          createdAt: new Date(),
        },
      ];

      useMessageStore.getState().setCurrentConversation(messages);
      expect(useMessageStore.getState().currentConversation).toEqual(messages);
    });
  });

  describe('addMessage', () => {
    it('should add message to current conversation', () => {
      const initialMessage = {
        messageId: 'msg1',
        senderId: 'user1',
        receiverId: 'user2',
        text: 'Hello',
        read: false,
        createdAt: new Date(),
      };

      const newMessage = {
        messageId: 'msg2',
        senderId: 'user2',
        receiverId: 'user1',
        text: 'Hi there',
        read: false,
        createdAt: new Date(),
      };

      useMessageStore.getState().setCurrentConversation([initialMessage]);
      useMessageStore.getState().addMessage(newMessage);

      const state = useMessageStore.getState();
      expect(state.currentConversation).toHaveLength(2);
      expect(state.currentConversation[1]).toEqual(newMessage);
    });
  });

  describe('fetchConversation', () => {
    it('should fetch conversation between two users', async () => {
      const messages = [
        {
          messageId: 'msg1',
          senderId: 'user1',
          receiverId: 'user2',
          text: 'Hello',
          read: false,
          createdAt: new Date(),
        },
      ];

      mockGetConversation.mockResolvedValueOnce(messages);

      await useMessageStore.getState().fetchConversation('user1', 'user2');

      expect(mockGetConversation).toHaveBeenCalledWith('user1', 'user2');
      expect(useMessageStore.getState().currentConversation).toEqual(messages);
      expect(useMessageStore.getState().currentConversationUserId).toBe('user2');
      expect(useMessageStore.getState().isLoading).toBe(false);
    });

    it('should handle fetch error', async () => {
      mockGetConversation.mockRejectedValueOnce(new Error('Network error'));

      await useMessageStore.getState().fetchConversation('user1', 'user2');

      expect(useMessageStore.getState().error).toBe('Network error');
      expect(useMessageStore.getState().isLoading).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should send message and update local state', async () => {
      mockSendMessage.mockResolvedValueOnce(undefined);

      useMessageStore.setState({ currentConversationUserId: 'user2' });

      await useMessageStore.getState().sendMessage('user1', 'user2', 'Hello');

      expect(mockSendMessage).toHaveBeenCalledWith('user1', 'user2', 'Hello');
      expect(useMessageStore.getState().currentConversation).toHaveLength(1);
      expect(useMessageStore.getState().currentConversation[0].text).toBe('Hello');
    });

    it('should handle send error', async () => {
      mockSendMessage.mockRejectedValueOnce(new Error('Failed to send'));

      await expect(
        useMessageStore.getState().sendMessage('user1', 'user2', 'Hello')
      ).rejects.toThrow('Failed to send');

      expect(useMessageStore.getState().error).toBe('Failed to send');
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const messages = [
        {
          messageId: 'msg1',
          senderId: 'user1',
          receiverId: 'user2',
          text: 'Hello',
          read: false,
          createdAt: new Date(),
        },
      ];

      mockMarkMessageRead.mockResolvedValueOnce(undefined);
      useMessageStore.getState().setCurrentConversation(messages);

      await useMessageStore.getState().markAsRead('msg1');

      expect(mockMarkMessageRead).toHaveBeenCalledWith('msg1');
      expect(useMessageStore.getState().currentConversation[0].read).toBe(true);
    });
  });

  describe('subscribeToChat', () => {
    it('should subscribe to conversation updates', () => {
      const unsubscribe = jest.fn();
      mockSubscribeToConversation.mockReturnValueOnce(unsubscribe);

      const result = useMessageStore.getState().subscribeToChat('user1', 'user2');

      expect(mockSubscribeToConversation).toHaveBeenCalledWith(
        'user1',
        'user2',
        expect.any(Function)
      );
      expect(useMessageStore.getState().currentConversationUserId).toBe('user2');
      expect(result).toBe(unsubscribe);
    });
  });

  describe('subscribeToUserConversations', () => {
    it('should subscribe to all user conversations', () => {
      const unsubscribe = jest.fn();
      mockSubscribeToConversations.mockReturnValueOnce(unsubscribe);

      const result = useMessageStore.getState().subscribeToUserConversations('user1');

      expect(mockSubscribeToConversations).toHaveBeenCalledWith(
        'user1',
        expect.any(Function)
      );
      expect(result).toBe(unsubscribe);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useMessageStore.setState({ error: 'Some error' });
      useMessageStore.getState().clearError();

      expect(useMessageStore.getState().error).toBeNull();
    });
  });

  describe('clearCurrentConversation', () => {
    it('should clear current conversation', () => {
      useMessageStore.setState({
        currentConversation: [
          {
            messageId: 'msg1',
            senderId: 'user1',
            receiverId: 'user2',
            text: 'Hello',
            read: false,
            createdAt: new Date(),
          },
        ],
        currentConversationUserId: 'user2',
      });

      useMessageStore.getState().clearCurrentConversation();

      expect(useMessageStore.getState().currentConversation).toEqual([]);
      expect(useMessageStore.getState().currentConversationUserId).toBeNull();
    });
  });
});
