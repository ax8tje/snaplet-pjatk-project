import { Platform } from 'react-native';
import { useCallback } from 'react';

// Route mapping from React Navigation route names to React Router paths
const routeToPath: Record<string, string> = {
  Login: '/login',
  Register: '/register',
  Welcome: '/welcome',
  Home: '/home',
  Profile: '/profile',
  Settings: '/settings',
  Messages: '/messages',
  Camera: '/camera',
};

type NavigateFunction = (route: string, params?: Record<string, unknown>) => void;

interface CrossPlatformNavigation {
  navigate: NavigateFunction;
}

export function useCrossPlatformNavigation(): CrossPlatformNavigation {
  // On web, we use window.location for navigation
  // On native, this hook won't be used (native screens use useNavigation directly)
  const navigate = useCallback((route: string, params?: Record<string, unknown>) => {
    if (Platform.OS === 'web') {
      const path = routeToPath[route] || `/${route.toLowerCase()}`;

      // Build query string if params exist
      let url = path;
      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, String(value));
        });
        url = `${path}?${searchParams.toString()}`;
      }

      window.location.href = url;
    }
  }, []);

  return { navigate };
}

// For web: wrapper that provides navigation context
export function useNavigationCompat() {
  if (Platform.OS === 'web') {
    return useCrossPlatformNavigation();
  }

  // On native, we import dynamically to avoid issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useNavigation } = require('@react-navigation/native');
  return useNavigation();
}
