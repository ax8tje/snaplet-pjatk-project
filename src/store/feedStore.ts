import { create } from "zustand";
import {
  getFeedPosts,
  getUserPosts,
  createPost,
  deletePost,
  getPost,
  subscribeToFeed,
} from "../services/postService";

export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption: string;
  likes: number;
  commentCount: number;
  createdAt: Date | { seconds: number; nanoseconds: number };
}

interface FeedState {
  posts: Post[];
  userPosts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  isCreating: boolean;
  uploadProgress: number;
  error: string | null;
  lastDoc: unknown | null;
  hasMore: boolean;

  fetchFeed: (limit?: number) => Promise<void>;
  fetchMorePosts: (limit?: number) => Promise<void>;
  fetchUserPosts: (userId: string, limit?: number) => Promise<void>;
  fetchPost: (postId: string) => Promise<void>;
  addPost: (
    userId: string,
    imageFile: File | Blob,
    caption?: string
  ) => Promise<Post>;
  removePost: (postId: string) => Promise<void>;
  clearError: () => void;
  clearFeed: () => void;
  subscribeToFeed: (limit?: number) => () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  userPosts: [],
  currentPost: null,
  isLoading: false,
  isCreating: false,
  uploadProgress: 0,
  error: null,
  lastDoc: null,
  hasMore: true,

  fetchFeed: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getFeedPosts(limit, null);
      set({
        posts: result.posts as Post[],
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch feed";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMorePosts: async (limit = 10) => {
    const { lastDoc, hasMore, isLoading, posts } = get();

    if (!hasMore || isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await getFeedPosts(limit, lastDoc);
      set({
        posts: [...posts, ...(result.posts as Post[])],
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch more posts";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserPosts: async (userId: string, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const posts = await getUserPosts(userId, limit);
      set({ userPosts: posts as Post[] });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user posts";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPost: async (postId: string) => {
    set({ isLoading: true, error: null });
    try {
      const post = await getPost(postId);
      set({ currentPost: post as Post | null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch post";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  addPost: async (userId: string, imageFile: File | Blob, caption = "") => {
    set({ isCreating: true, uploadProgress: 0, error: null });
    try {
      const newPost = await createPost(
        userId,
        imageFile,
        caption,
        (progress: number) => {
          set({ uploadProgress: progress });
        }
      );

      const { posts } = get();
      set({
        posts: [newPost as Post, ...posts],
        uploadProgress: 100,
      });

      return newPost as Post;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create post";
      set({ error: message });
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  removePost: async (postId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePost(postId);

      const { posts, userPosts, currentPost } = get();
      set({
        posts: posts.filter((p) => p.id !== postId),
        userPosts: userPosts.filter((p) => p.id !== postId),
        currentPost: currentPost?.id === postId ? null : currentPost,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete post";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearFeed: () => {
    set({
      posts: [],
      userPosts: [],
      currentPost: null,
      lastDoc: null,
      hasMore: true,
    });
  },

  subscribeToFeed: (limit = 20) => {
    const unsubscribe = subscribeToFeed((postsOrError: Post[] | Error) => {
      if (postsOrError instanceof Error) {
        set({ error: postsOrError.message });
      } else {
        set({ posts: postsOrError });
      }
    }, limit);

    return unsubscribe;
  },
}));
