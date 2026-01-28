import { create } from "zustand";
import {
  sendMessage as sendMessageService,
  getConversations as getConversationsService,
  getConversation as getConversationService,
  markMessageRead as markMessageReadService,
  subscribeToConversation,
  subscribeToConversations,
} from "../services/messageService";
import { getUserProfile } from "../services/userService";

export interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: Date | { seconds: number; nanoseconds: number };
}

export interface Conversation {
  odUsers: string;
  odUserId: string;
  odDisplayName: string;
  odPhotoURL: string;
  lastMessage: string;
  lastMessageTime: Date | { seconds: number; nanoseconds: number };
  unreadCount: number;
}

interface MessageState {
  conversations: Conversation[];
  currentConversation: Message[];
  currentConversationUserId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (messages: Message[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // Async actions
  fetchConversations: (userId: string) => Promise<void>;
  fetchConversation: (userId1: string, userId2: string) => Promise<void>;
  sendMessage: (senderId: string, receiverId: string, text: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;

  // Subscriptions
  subscribeToUserConversations: (userId: string) => () => void;
  subscribeToChat: (userId1: string, userId2: string) => () => void;

  // Utility
  clearError: () => void;
  clearCurrentConversation: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: [],
  currentConversationUserId: null,
  messages: [],
  isLoading: false,
  error: null,

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  setCurrentConversation: (messages: Message[]) => {
    set({ currentConversation: messages });
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  addMessage: (message: Message) => {
    const { currentConversation } = get();
    set({ currentConversation: [...currentConversation, message] });
  },

  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await getConversationsService(userId) as Message[];

      // Group messages by conversation partner
      const conversationMap = new Map<string, { messages: Message[], partnerId: string }>();

      for (const msg of messages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, { messages: [], partnerId });
        }
        conversationMap.get(partnerId)!.messages.push(msg);
      }

      // Build conversation list with user info
      const conversations: Conversation[] = [];

      for (const [partnerId, data] of conversationMap) {
        const lastMsg = data.messages[data.messages.length - 1];
        const unreadCount = data.messages.filter(m => !m.read && m.receiverId === userId).length;

        let displayName = partnerId;
        let photoURL = "";

        try {
          const profile = await getUserProfile(partnerId);
          displayName = profile.displayName || partnerId;
          photoURL = profile.photoURL || "";
        } catch {
          // Use partnerId as fallback
        }

        conversations.push({
          odUsers: `${userId}_${partnerId}`,
          odUserId: partnerId,
          odDisplayName: displayName,
          odPhotoURL: photoURL,
          lastMessage: lastMsg.text,
          lastMessageTime: lastMsg.createdAt,
          unreadCount,
        });
      }

      // Sort by last message time (newest first)
      conversations.sort((a, b) => {
        const timeA = a.lastMessageTime instanceof Date
          ? a.lastMessageTime.getTime()
          : (a.lastMessageTime as { seconds: number }).seconds * 1000;
        const timeB = b.lastMessageTime instanceof Date
          ? b.lastMessageTime.getTime()
          : (b.lastMessageTime as { seconds: number }).seconds * 1000;
        return timeB - timeA;
      });

      set({ conversations, messages });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch conversations";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConversation: async (userId1: string, userId2: string) => {
    set({ isLoading: true, error: null, currentConversationUserId: userId2 });
    try {
      const messages = await getConversationService(userId1, userId2) as Message[];
      set({ currentConversation: messages });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch conversation";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (senderId: string, receiverId: string, text: string) => {
    set({ error: null });
    try {
      await sendMessageService(senderId, receiverId, text);

      // Optimistically add the message to the current conversation
      const newMessage: Message = {
        messageId: `temp_${Date.now()}`,
        senderId,
        receiverId,
        text,
        read: false,
        createdAt: new Date(),
      };

      const { currentConversation, currentConversationUserId } = get();
      if (currentConversationUserId === receiverId) {
        set({ currentConversation: [...currentConversation, newMessage] });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message";
      set({ error: message });
      throw error;
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      await markMessageReadService(messageId);

      // Update local state
      const { currentConversation } = get();
      set({
        currentConversation: currentConversation.map(msg =>
          msg.messageId === messageId ? { ...msg, read: true } : msg
        ),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mark message as read";
      set({ error: message });
    }
  },

  subscribeToUserConversations: (userId: string) => {
    const unsubscribe = subscribeToConversations(userId, async (messages: Message[]) => {
      // Rebuild conversations from received messages
      const { fetchConversations } = get();
      await fetchConversations(userId);
    });

    return unsubscribe;
  },

  subscribeToChat: (userId1: string, userId2: string) => {
    set({ currentConversationUserId: userId2 });

    const unsubscribe = subscribeToConversation(userId1, userId2, (messages: Message[]) => {
      set({ currentConversation: messages });
    });

    return unsubscribe;
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentConversation: () => {
    set({ currentConversation: [], currentConversationUserId: null });
  },
}));
