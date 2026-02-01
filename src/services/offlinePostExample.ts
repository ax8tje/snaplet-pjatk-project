/**
 * Przykład integracji offline synchronizacji z postService
 * 
 * Ten plik pokazuje jak można zintegrować offline support z istniejącymi serwisami
 */

import { addPendingUpload, getPendingUploadsCount } from '../utils/offlineStorage';
import { isOnline, fetchWithOfflineSupport } from '../utils/offlineHelper';

// Przykład 1: Tworzenie posta z offline support
export const createPostOffline = async (postData: any) => {
  try {
    // Użyj fetchWithOfflineSupport zamiast zwykłego fetch
    const response = await fetchWithOfflineSupport(
      'https://your-firebase-project.firebaseio.com/posts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      },
      'post' // typ uploadu
    );

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    // Sprawdź czy to błąd offline
    if (error.message.includes('offline') || error.message.includes('saved for later')) {
      return {
        success: false,
        offline: true,
        message: 'Post zostanie opublikowany gdy wrócisz online',
      };
    }
    throw error;
  }
};

// Przykład 2: Dodawanie komentarza z offline support
export const addCommentOffline = async (postId: string, commentData: any) => {
  try {
    const response = await fetchWithOfflineSupport(
      `https://your-firebase-project.firebaseio.com/comments/${postId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      },
      'comment'
    );

    return await response.json();
  } catch (error: any) {
    if (error.message.includes('offline')) {
      return {
        success: false,
        offline: true,
        message: 'Komentarz zostanie dodany gdy wrócisz online',
      };
    }
    throw error;
  }
};

// Przykład 3: Manualny zapis do pending uploads
export const savePostForLaterManual = async (postData: any) => {
  if (!isOnline()) {
    // Ręcznie zapisz do IndexedDB
    await addPendingUpload({
      type: 'post',
      url: 'https://your-firebase-project.firebaseio.com/posts',
      data: postData,
      headers: {
        'Content-Type': 'application/json',
      },
      timestamp: Date.now(),
      retryCount: 0,
    });

    return {
      success: false,
      offline: true,
      message: 'Post zapisany do synchronizacji',
    };
  }

  // Jeśli online, wyślij normalnie
  const response = await fetch('https://your-firebase-project.firebaseio.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  return await response.json();
};

// Przykład 4: Sprawdzanie statusu pending uploads w komponencie
export const getPendingStatus = async () => {
  const count = await getPendingUploadsCount();
  const online = isOnline();

  return {
    hasPending: count > 0,
    count,
    online,
    message: count > 0 
      ? `Masz ${count} ${count === 1 ? 'oczekującą zmianę' : 'oczekujących zmian'} do synchronizacji`
      : 'Wszystko zsynchronizowane',
  };
};

// Przykład 5: Hook dla komponentu React
import React from 'react';

export const useOfflinePost = () => {
  const [pendingCount, setPendingCount] = React.useState(0);
  const [online, setOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const updateStatus = async () => {
      const count = await getPendingUploadsCount();
      setPendingCount(count);
    };

    updateStatus();

    const handleOnline = () => {
      setOnline(true);
      updateStatus();
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(updateStatus, 30000); // Co 30 sekund

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { pendingCount, online };
};

/* 
PRZYKŁAD UŻYCIA W KOMPONENCIE:

import React from 'react';
import { View, Text, Button } from 'react-native';
import { createPostOffline, useOfflinePost } from './services/offlinePostExample';

const CreatePostScreen = () => {
  const { pendingCount, online } = useOfflinePost();
  const [message, setMessage] = React.useState('');

  const handleCreatePost = async () => {
    const result = await createPostOffline({
      title: 'Mój post',
      content: 'Treść...',
      userId: 'user123',
    });

    if (result.offline) {
      alert(result.message); // "Post zostanie opublikowany gdy wrócisz online"
    } else if (result.success) {
      alert('Post opublikowany!');
    }
  };

  return (
    <View>
      {!online && (
        <Text style={{ color: 'red' }}>
          Jesteś offline. {pendingCount > 0 && `${pendingCount} zmian czeka na synchronizację.`}
        </Text>
      )}
      
      <Button title="Utwórz Post" onPress={handleCreatePost} />
    </View>
  );
};
*/
