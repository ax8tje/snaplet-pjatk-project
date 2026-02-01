# Synchronizacja Offline - Dokumentacja

## Przegląd

Implementacja podstawowej synchronizacji offline dla aplikacji Snaplet przy użyciu Service Workers, Cache API i IndexedDB.

## Komponenty

### 1. Service Worker (`public/service-worker.js`)

Service Worker zapewnia:
- **Cache'owanie statycznych zasobów** - pliki HTML, JS, CSS
- **Strategia Network First** - najpierw próbuje pobrać z sieci, potem z cache
- **Background Sync** - synchronizacja pending uploads gdy użytkownik wróci online
- **Obsługa offline** - aplikacja działa nawet bez połączenia

### 2. OnlineStatus Component (`src/components/OnlineStatus.tsx`)

Komponent UI wyświetlający status połączenia:
- ✓ Zielony banner gdy online (opcjonalnie)
- ⚠ Czerwony banner gdy offline (zawsze)
- Informacja o pending synchronizacji

**Użycie:**
```tsx
import { OnlineStatus } from './components/OnlineStatus';

<OnlineStatus showWhenOnline={true} />
```

### 3. IndexedDB Storage (`src/utils/offlineStorage.ts`)

Utility do zarządzania pending uploads:

**API:**
```typescript
// Dodaj pending upload
await addPendingUpload({
  type: 'post',
  url: '/api/posts',
  data: postData,
  headers: { 'Content-Type': 'application/json' },
  timestamp: Date.now()
});

// Pobierz wszystkie pending
const pending = await getPendingUploads();

// Usuń po synchronizacji
await removePendingUpload(uploadId);

// Sprawdź liczbę pending
const count = await getPendingUploadsCount();

// Hook React
const { count, isOnline } = usePendingUploads();
```

### 4. Offline Helper (`src/utils/offlineHelper.ts`)

Helper do automatycznej obsługi offline mode:

**Użycie:**
```typescript
import { fetchWithOfflineSupport, useOnlineStatus } from './utils/offlineHelper';

// W komponencie
const isOnline = useOnlineStatus();

// W serwisie
try {
  const response = await fetchWithOfflineSupport(
    'https://api.example.com/posts',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    },
    'post' // typ: 'post' | 'comment' | 'message' | 'clip'
  );
} catch (error) {
  // Request został zapisany do pending uploads
  console.log('Will sync when online');
}
```

## Przykład integracji w serwisie

### postService.js

```javascript
import { fetchWithOfflineSupport, isOnline } from '../utils/offlineHelper';
import { addPendingUpload } from '../utils/offlineStorage';

export const createPost = async (postData) => {
  try {
    const response = await fetchWithOfflineSupport(
      'https://your-api.com/posts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      },
      'post'
    );
    
    return await response.json();
  } catch (error) {
    if (error.message.includes('offline') || error.message.includes('saved for later')) {
      // Request zapisany do synchronizacji
      return {
        success: false,
        offline: true,
        message: 'Post zostanie wysłany gdy wrócisz online'
      };
    }
    throw error;
  }
};
```

## Workflow

1. **Użytkownik online:**
   - Requesty wykonywane normalnie
   - Zasoby cache'owane w tle
   - Service Worker w trybie czuwania

2. **Użytkownik offline:**
   - Banner informacyjny pojawia się na górze
   - POST/PUT/PATCH requesty zapisywane do IndexedDB
   - GET requesty pobierane z cache
   - Aplikacja nadal działa

3. **Powrót online:**
   - Banner znika po 3 sekundach
   - Service Worker trigger Background Sync
   - Pending uploads wysyłane automatycznie
   - Po sukcesie usuwane z IndexedDB

## Konfiguracja

### Webpack

Service Worker musi być skopiowany do dist:

```javascript
// webpack.config.js
new CopyWebpackPlugin({
  patterns: [
    { from: 'public/service-worker.js', to: 'service-worker.js' },
  ],
}),
```

### Rejestracja

Service Worker rejestrowany w `index.web.js`:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.error('SW registration failed:', error));
  });
}
```

## Testowanie

### Symuluj offline mode

W Chrome DevTools:
1. Otwórz DevTools (F12)
2. Network tab
3. Throttling dropdown → Offline
4. Odśwież stronę

### Sprawdź Service Worker

1. DevTools → Application tab
2. Service Workers section
3. Sprawdź status i cache

### Sprawdź IndexedDB

1. DevTools → Application tab
2. IndexedDB → SnapletDB
3. pendingUploads store

## Ograniczenia MVP

Dla MVP zaimplementowano:
- ✅ Podstawowe cache'owanie
- ✅ Indicator online/offline
- ✅ IndexedDB dla pending uploads
- ✅ Background Sync (jeśli wspierane)

Nie zaimplementowano:
- ❌ Zaawansowane strategie cache (stale-while-revalidate)
- ❌ Optymistyczne aktualizacje UI
- ❌ Konfliktów resolution przy synchronizacji
- ❌ Kompresja danych w IndexedDB
- ❌ Automatyczne retry z exponential backoff

## Browser Support

- ✅ Chrome/Edge (pełne wsparcie)
- ✅ Firefox (pełne wsparcie)
- ⚠️ Safari (częściowe - brak Background Sync)
- ❌ IE11 (brak wsparcia)

## Dalszy rozwój

Możliwe usprawnienia:
1. Optymistyczne UI updates
2. Conflict resolution
3. Automatyczne czyszczenie starych cache'y
4. Precache warunkowy (tylko ważne zasoby)
5. Offline analytics queue
6. Retry logic z exponential backoff
7. Upload progress tracking
