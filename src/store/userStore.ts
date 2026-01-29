import { create } from "zustand";
import {
  signIn,
  signUp,
  logout as authLogout,
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
} from "../services/authService";
import {
  getUserProfile,
  updateUserProfile as updateProfile,
  createUserProfile,
  subscribeToUser,
} from "../services/userService";

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  createdAt: number;
  postCount: number;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface UserState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  initialize: () => () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await signIn(email, password);
      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      set({ user, isAuthenticated: true });

      await get().fetchProfile(firebaseUser.uid);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";
      set({ error: message, isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await signUp(email, password, displayName);
      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };

      await createUserProfile(firebaseUser.uid, {
        email,
        displayName,
      });

      set({ user, isAuthenticated: true });
      await get().fetchProfile(firebaseUser.uid);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      set({ error: message, isAuthenticated: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authLogout();
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Logout failed";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  sendPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await resetPassword(email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Password reset failed";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const profile = (await getUserProfile(userId)) as UserProfile;
      set({ profile });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch profile";
      set({ error: message });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) {
      set({ error: "No authenticated user" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const updatedProfile = (await updateProfile(
        user.uid,
        data
      )) as UserProfile;
      set({ profile: updatedProfile });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  initialize: () => {
    let authResolved = false;

    const currentUser = getCurrentUser();
    if (currentUser) {
      authResolved = true;
      const user: AuthUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      };
      set({ user, isAuthenticated: true, isLoading: false });
      get().fetchProfile(currentUser.uid);
    }

    const unsubscribeAuth = onAuthStateChange(async (firebaseUser) => {
      authResolved = true;
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        set({ user, isAuthenticated: true, isLoading: false });

        const unsubscribeProfile = subscribeToUser(
          firebaseUser.uid,
          (profile: UserProfile) => {
            set({ profile });
          }
        );

        return () => unsubscribeProfile();
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    // Fallback: if auth state doesn't resolve within 2 seconds, stop loading
    // This handles cases where Firebase isn't properly configured
    setTimeout(() => {
      if (!authResolved) {
        set({ isLoading: false, isAuthenticated: false });
      }
    }, 2000);

    return unsubscribeAuth;
  },
}));
