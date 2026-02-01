// Service Worker dla Snaplet - podstawowa synchronizacja offline
const CACHE_NAME = 'snaplet-v1';
const STATIC_CACHE = 'snaplet-static-v1';
const DYNAMIC_CACHE = 'snaplet-dynamic-v1';

// Zasoby do cache'owania podczas instalacji
const urlsToCache = [
  '/',
  '/index.html',
  '/bundle.js',
  '/figma/styles.css',
];

// Instalacja Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Aktywacja Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia cache: Network First z fallback do Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pomiń cross-origin requesty (Firebase, external APIs)
  if (url.origin !== location.origin) {
    return;
  }

  // Pomiń requesty do Firebase Storage/Firestore
  if (url.pathname.includes('firebasestorage') || url.pathname.includes('firestore')) {
    return;
  }

  event.respondWith(
    // Próbuj najpierw pobrać z sieci
    fetch(request)
      .then((response) => {
        // Jeśli odpowiedź OK, sklonuj i zapisz w cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Jeśli sieć niedostępna, użyj cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fallback dla navigacji - zwróć index.html z cache
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          return new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Synchronizacja w tle - obsługa pending uploads
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-uploads') {
    event.waitUntil(syncPendingUploads());
  }
});

// Funkcja do synchronizacji pending uploads z IndexedDB
async function syncPendingUploads() {
  try {
    // Otwórz IndexedDB i pobierz pending uploads
    const db = await openDatabase();
    const pendingUploads = await getPendingUploads(db);
    
    console.log('[Service Worker] Syncing', pendingUploads.length, 'pending uploads');
    
    // Prześlij każdy pending upload
    for (const upload of pendingUploads) {
      try {
        await uploadToServer(upload);
        await removePendingUpload(db, upload.id);
        console.log('[Service Worker] Successfully synced upload:', upload.id);
      } catch (error) {
        console.error('[Service Worker] Failed to sync upload:', upload.id, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error;
  }
}

// Pomocnicze funkcje dla IndexedDB (będą wykorzystane przez klienta)
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SnapletDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingUploads(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingUploads'], 'readonly');
    const store = transaction.objectStore('pendingUploads');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removePendingUpload(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingUploads'], 'readwrite');
    const store = transaction.objectStore('pendingUploads');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function uploadToServer(upload) {
  // Ta funkcja będzie wywoływana przez sync event
  // Implementacja w zależności od typu uploadu
  const response = await fetch(upload.url, {
    method: 'POST',
    body: upload.data,
    headers: upload.headers || {}
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  
  return response;
}

// Nasłuchiwanie wiadomości od klienta
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
