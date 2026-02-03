import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OnlineStatusProps {
  showWhenOnline?: boolean;
}

/**
 * Komponent wyświetlający status połączenia z internetem
 */
export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  showWhenOnline = false 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showWhenOnline) {
        setShowStatus(true);
        // Ukryj po 3 sekundach
        setTimeout(() => setShowStatus(false), 3000);
      } else {
        setShowStatus(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showWhenOnline]);

  if (!showStatus) {
    return null;
  }

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <Text style={styles.text}>
        {isOnline ? '✓ Połączono z internetem' : '⚠ Tryb offline'}
      </Text>
      {!isOnline && (
        <Text style={styles.subtext}>
          Zmiany zostaną zsynchronizowane po przywróceniu połączenia
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: {
    backgroundColor: '#10b981',
  },
  offline: {
    backgroundColor: '#ef4444',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600' as any,
    textAlign: 'center' as any,
  },
  subtext: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center' as any,
    opacity: 0.9,
  },
});

export default OnlineStatus;
