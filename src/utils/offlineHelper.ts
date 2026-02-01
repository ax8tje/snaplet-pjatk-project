/**
 * Helper do obsługi offline uploads
 * Automatycznie zapisuje requesty do IndexedDB gdy użytkownik jest offline
 */

import { addPendingUpload } from './offlineStorage';

/**
 * Sprawdza czy użytkownik jest online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Wrapper dla fetch który automatycznie obsługuje offline mode
 */
export const fetchWithOfflineSupport = async (
  url: string,
  options: RequestInit = {},
  uploadType: 'post' | 'comment' | 'message' | 'clip' = 'post'
): Promise<Response> => {
  // Jeśli online, wykonaj normalny fetch
  if (isOnline()) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error('Fetch failed, might be offline:', error);
      // Jeśli fetch się nie powiódł, możemy być offline
      // Zapisz do pending uploads jeśli to jest POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
        await savePendingUpload(url, options, uploadType);
        throw new Error('Request saved for later sync (offline)');
      }
      throw error;
    }
  } else {
    // Offline - zapisz request jeśli to modyfikacja danych
    if (['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
      await savePendingUpload(url, options, uploadType);
      throw new Error('Offline - request will be synced when online');
    }
    throw new Error('Cannot perform this operation offline');
  }
};

/**
 * Zapisuje pending upload do IndexedDB
 */
const savePendingUpload = async (
  url: string,
  options: RequestInit,
  uploadType: 'post' | 'comment' | 'message' | 'clip'
): Promise<void> => {
  try {
    const headers: Record<string, string> = {};
    
    // Konwertuj Headers na plain object
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    await addPendingUpload({
      type: uploadType,
      url,
      data: options.body ? await serializeBody(options.body) : null,
      headers,
      timestamp: Date.now(),
      retryCount: 0,
    });

    console.log('Saved pending upload for later sync');
  } catch (error) {
    console.error('Failed to save pending upload:', error);
    throw error;
  }
};

/**
 * Serializuje body requestu do formatu który można zapisać w IndexedDB
 */
const serializeBody = async (body: BodyInit): Promise<any> => {
  if (typeof body === 'string') {
    return body;
  }
  
  if (body instanceof Blob) {
    return await blobToBase64(body);
  }
  
  if (body instanceof FormData) {
    const obj: any = {};
    body.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  
  if (body instanceof URLSearchParams) {
    return body.toString();
  }
  
  return body;
};

/**
 * Konwertuje Blob do Base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Hook React do sprawdzania statusu online/offline
 */
export const useOnlineStatus = () => {
  const [online, setOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
};

// Import React dla hooka
import React from 'react';
