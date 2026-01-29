import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './src/store/userStore';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CameraScreen from './src/screens/CameraScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

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

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return null; // Keep showing the HTML loading screen
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App component with routing
const App = () => {
  const { initialize, isLoading } = useUserStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const unsubscribe = initialize();

    // Mark app as ready after a short delay to ensure state is settled
    const timeout = setTimeout(() => {
      setAppReady(true);
      removeLoadingScreen();
    }, 100);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [initialize]);

  // Keep loading screen visible until app is ready
  useEffect(() => {
    if (appReady && !isLoading) {
      removeLoadingScreen();
    }
  }, [appReady, isLoading]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
        <Route path="/camera" element={<ProtectedRoute><CameraScreen /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetailScreen /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

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
