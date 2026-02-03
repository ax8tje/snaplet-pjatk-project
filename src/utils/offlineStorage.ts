/**
 * IndexedDB utility dla zarządzania pending uploads w trybie offline
 */

const DB_NAME = 'SnapletDB';
const DB_VERSION = 1;
const STORE_NAME = 'pendingUploads';

export interface PendingUpload {
  id?: number;
  type: 'post' | 'comment' | 'message' | 'clip';
  data: any;
  url: string;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount?: number;
}

/**
 * Otwiera połączenie z IndexedDB
 */
export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Utwórz object store jeśli nie istnieje
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        
        // Indeksy dla szybszego wyszukiwania
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Dodaje nowy pending upload do IndexedDB
 */
export const addPendingUpload = async (upload: Omit<PendingUpload, 'id'>): Promise<number> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const uploadWithDefaults = {
      ...upload,
      timestamp: upload.timestamp || Date.now(),
      retryCount: upload.retryCount || 0,
    };
    
    const request = store.add(uploadWithDefaults);
    
    request.onsuccess = () => {
      console.log('Added pending upload:', request.result);
      resolve(request.result as number);
      
      // Zarejestruj synchronizację w tle jeśli dostępna
      if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
        navigator.serviceWorker.ready.then((registration: any) => {
          return registration.sync.register('sync-uploads');
        }).catch((err: Error) => {
          console.error('Background sync registration failed:', err);
        });
      }
    };
    
    request.onerror = () => {
      console.error('Failed to add pending upload:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Pobiera wszystkie pending uploads z IndexedDB
 */
export const getPendingUploads = async (): Promise<PendingUpload[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Failed to get pending uploads:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Pobiera liczbę pending uploads
 */
export const getPendingUploadsCount = async (): Promise<number> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Usuwa pending upload po pomyślnej synchronizacji
 */
export const removePendingUpload = async (id: number): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log('Removed pending upload:', id);
      resolve();
    };
    
    request.onerror = () => {
      console.error('Failed to remove pending upload:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Usuwa wszystkie pending uploads
 */
export const clearPendingUploads = async (): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onsuccess = () => {
      console.log('Cleared all pending uploads');
      resolve();
    };
    
    request.onerror = () => {
      console.error('Failed to clear pending uploads:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Aktualizuje retry count dla pending upload
 */
export const updateRetryCount = async (id: number, retryCount: number): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const upload = getRequest.result;
      if (upload) {
        upload.retryCount = retryCount;
        const updateRequest = store.put(upload);
        
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Upload not found'));
      }
    };
    
    getRequest.onerror = () => {
      reject(getRequest.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

/**
 * Hook React do monitorowania pending uploads
 */
export const usePendingUploads = () => {
  const [count, setCount] = React.useState(0);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const updateCount = async () => {
      try {
        const pendingCount = await getPendingUploadsCount();
        setCount(pendingCount);
      } catch (error) {
        console.error('Failed to get pending uploads count:', error);
      }
    };

    updateCount();

    const handleOnline = () => {
      setIsOnline(true);
      updateCount();
      
      // Trigger sync gdy wrócimy online
      if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
        navigator.serviceWorker.ready.then((registration: any) => {
          return registration.sync.register('sync-uploads');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Aktualizuj co minutę
    const interval = setInterval(updateCount, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { count, isOnline };
};

// Dodaj React import dla hooka
import React from 'react';
