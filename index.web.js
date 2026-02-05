import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from './src/store/userStore';
import { OnlineStatus } from './src/components/OnlineStatus';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CameraScreen from './src/screens/CameraScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import CalendarScreen from './src/screens/CalendarScreen'; // calendar route
import MonthlyVideoScreen from './src/screens/MonthlyVideoScreen'; // monthly video generation
import BottomNav from './src/components/BottomNav'; // bottom navigation (web)

// Remove loading screen helper
const removeLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
};

// Protected Route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  console.log('[ProtectedRoute] isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    return null; // Keep showing the HTML loading screen
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Wrapper for BottomNav - hides on camera screen
const BottomNavWrapper = ({ isAuthenticated }) => {
  const location = useLocation();
  const hiddenRoutes = ['/camera', '/monthly-video'];

  if (!isAuthenticated || hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return <BottomNav />;
};

// Auth Route component - redirects to home if already authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Main App component with routing
const App = () => {
  const { initialize, isLoading, isAuthenticated } = useUserStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('[APP] useEffect running, calling initialize()');
    // Initialize auth state
    const unsubscribe = initialize();

    // Mark app as ready after a short delay to ensure state is settled
    const timeout = setTimeout(() => {
      console.log('[APP] Setting appReady=true');
      setAppReady(true);
      removeLoadingScreen();
    }, 250);

    // Don't unsubscribe on StrictMode remount - only on actual unmount
    // The initialize function handles its own cleanup internally
    return () => {
      console.log('[APP] useEffect cleanup');
      clearTimeout(timeout);
    };
  }, []);

  if (!appReady) return null;

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<AuthRoute><LoginScreen /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterScreen /></AuthRoute>} />

          <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/camera" element={<ProtectedRoute><CameraScreen /></ProtectedRoute>} />
          <Route path="/post/:postId" element={<ProtectedRoute><PostDetailScreen /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />

          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarScreen /></ProtectedRoute>} /> {/* calendar route */}
          <Route path="/monthly-video" element={<ProtectedRoute><MonthlyVideoScreen /></ProtectedRoute>} />
        </Routes>

        {/* Bottom navigation shown when authenticated, hidden on camera */}
        <BottomNavWrapper isAuthenticated={isAuthenticated} />
      </Router>
  );
};

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Nasłuchuj aktualizacji
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker available. Refresh to update.');
              // Możesz dodać notyfikację dla użytkownika
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Render app with error handling
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
  );
} else {
  console.error('Root element not found');
  removeLoadingScreen();
}