#!/usr/bin/env node

/**
 * =============================================================================
 * SNAPLET MVP - GitHub Issues Generator (JavaScript)
 * =============================================================================
 * Uruchom: node scripts/create-mvp-issues.js
 * Wymaga: npm install @octokit/rest
 *         GITHUB_TOKEN w zmiennej środowiskowej
 * =============================================================================
 */

const { Octokit } = require('@octokit/rest');

// Konfiguracja
const REPO_OWNER = 'ax8tje';
const REPO_NAME = 'snaplet-pjatk-project';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ Brak GITHUB_TOKEN. Ustaw zmienną środowiskową:');
  console.error('   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// =============================================================================
// LABELS
// =============================================================================
const labels = [
  { name: 'priority: critical', color: 'B60205', description: 'Blokuje MVP' },
  { name: 'priority: high', color: 'D93F0B', description: 'Wymagane dla pełnego MVP' },
  { name: 'priority: medium', color: 'FBCA04', description: 'Wspomagające MVP' },
  { name: 'type: feature', color: '0E8A16', description: 'Nowa funkcjonalność' },
  { name: 'type: enhancement', color: '84B6EB', description: 'Ulepszenie istniejącej funkcji' },
  { name: 'type: infrastructure', color: 'C5DEF5', description: 'Infrastruktura/konfiguracja' },
  { name: 'area: video', color: '7057FF', description: 'Nagrywanie/przetwarzanie wideo' },
  { name: 'area: calendar', color: '008672', description: 'Kalendarz i zarządzanie datami' },
  { name: 'area: auth', color: 'E99695', description: 'Autentykacja' },
  { name: 'area: storage', color: 'F9D0C4', description: 'Firebase Storage/Firestore' },
  { name: 'mvp', color: '1D76DB', description: 'Wymagane do MVP' },
];

// =============================================================================
// ISSUES
// =============================================================================
const issues = [
  // EPIC 1: Nagrywanie wideo
  {
    title: '[EPIC] Nagrywanie 2-sekundowych klipów wideo (WO1 + WF01)',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    body: `## Opis
Implementacja systemu nagrywania 2-sekundowych klipów wideo przypisanych do konkretnych dat.

## Wymagania z SWS
- [ ] Użytkownik nagrywa max 2-sekundowe klipy wideo (nie zdjęcia!)
- [ ] Klip przypisany do konkretnej daty
- [ ] Zapis w kalendarzu użytkownika
- [ ] Podgląd, usunięcie, ponowne nagranie klipu z danego dnia

## Definition of Done
- [ ] Użytkownik może nagrać klip wideo max 2s
- [ ] Klip jest automatycznie przypisany do wybranej daty
- [ ] Użytkownik widzi kalendarz z oznaczonymi dniami
- [ ] Użytkownik może podejrzeć, usunąć i ponownie nagrać klip

## Szacowany czas
- 1 osoba: 4-5 dni
- 4 osoby + AI: 1 dzień`
  },
  {
    title: 'Implementacja nagrywania wideo (MediaRecorder API)',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    assignee: 'Osoba A',
    body: `## Opis
Przepisanie \`CameraScreen.js\` z robienia zdjęć na nagrywanie wideo przy użyciu MediaRecorder API.

## Zadania
- [ ] Zamiana \`getUserMedia\` z photo na video
- [ ] Implementacja \`MediaRecorder\` API
- [ ] Timer 2 sekundy z wizualnym odliczaniem
- [ ] Automatyczne zatrzymanie nagrywania po 2s
- [ ] Podgląd nagranego klipu przed zapisem
- [ ] Przycisk "Nagraj ponownie" / "Zapisz"
- [ ] Obsługa błędów (brak kamery, brak uprawnień)

## Techniczne szczegóły
\`\`\`javascript
// Przykładowa implementacja
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  // upload to Firebase Storage
};

// Auto-stop po 2s
setTimeout(() => mediaRecorder.stop(), 2000);
\`\`\`

## Pliki do modyfikacji
- \`src/screens/CameraScreen.js\`
- \`src/services/storageService.js\`

## Akceptacja
- [ ] Działa na Chrome, Firefox, Safari, Edge
- [ ] Nagrywanie trwa dokładnie 2 sekundy
- [ ] Wideo jest w formacie webm lub mp4
- [ ] Użytkownik widzi podgląd przed zapisem

## Szacowany czas
- 1 osoba: 1-2 dni
- 4 osoby + AI: 4-6h`
  },
  {
    title: 'Widok kalendarza z oznaczonymi nagraniami',
    labels: ['priority: critical', 'type: feature', 'area: calendar', 'mvp'],
    assignee: 'Osoba C',
    body: `## Opis
Nowy ekran z kalendarzem pokazującym dni w których użytkownik nagrał klipy.

## Zadania
- [ ] Nowy komponent \`CalendarScreen.js\`
- [ ] Integracja biblioteki kalendarza (\`react-calendar\`)
- [ ] Pobieranie dat z nagraniami z Firestore
- [ ] Wizualne oznaczenie dni z klipami (np. zielona kropka)
- [ ] Oznaczenie bieżącego dnia
- [ ] Kliknięcie na dzień → przejście do nagrywania/podglądu
- [ ] Nawigacja między miesiącami
- [ ] Dodanie do głównej nawigacji

## Mockup UI
\`\`\`
┌─────────────────────────────────┐
│  ◀  Styczeń 2026  ▶            │
├─────────────────────────────────┤
│ Pn  Wt  Śr  Cz  Pt  So  Nd     │
│                    1   2   3    │
│  4   5   6●  7   8   9  10     │
│ 11  12● 13  14  15● 16  17     │
│ 18  19  20  21  22  23  24     │
│ 25  26  27  28  29  30  31     │
└─────────────────────────────────┘
● = dzień z nagraniem
\`\`\`

## Zależności
\`\`\`bash
npm install react-calendar
\`\`\`

## Szacowany czas
- 1 osoba: 1-2 dni
- 4 osoby + AI: 4-6h`
  },
  {
    title: 'Struktura danych Firestore dla klipów wideo',
    labels: ['priority: critical', 'type: infrastructure', 'area: storage', 'mvp'],
    assignee: 'Osoba C',
    body: `## Opis
Nowa kolekcja w Firestore do przechowywania metadanych klipów wideo.

**BLOKUJE:** #2, #3, #5

## Struktura danych

### Kolekcja: \`clips\`
\`\`\`javascript
{
  id: "auto-generated",
  userId: "user-uid",
  date: "2026-01-30",           // YYYY-MM-DD format
  videoUrl: "https://...",       // URL do Firebase Storage
  thumbnailUrl: "https://...",   // Miniaturka
  duration: 2000,                // ms
  createdAt: Timestamp,
  updatedAt: Timestamp,
  month: "2026-01",              // Do grupowania
  status: "ready" | "processing" | "error"
}
\`\`\`

### Storage structure
\`\`\`
users/{userId}/clips/{date}/video.webm
users/{userId}/clips/{date}/thumbnail.jpg
users/{userId}/monthly/{month}/compiled.mp4
\`\`\`

## Zadania
- [ ] Utworzenie \`src/services/clipService.js\`
- [ ] Funkcja \`saveClip(userId, date, videoBlob)\`
- [ ] Funkcja \`getClip(userId, date)\`
- [ ] Funkcja \`getClipsByMonth(userId, month)\`
- [ ] Funkcja \`getUserClipDates(userId)\`
- [ ] Funkcja \`deleteClip(userId, date)\`
- [ ] Aktualizacja Firestore rules

## Firestore Rules
\`\`\`javascript
match /clips/{clipId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
}
\`\`\`

## Szacowany czas
- 1 osoba: 1 dzień
- 4 osoby + AI: 3-4h`
  },
  {
    title: 'UI podglądu, usuwania i ponownego nagrywania klipu',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    assignee: 'Osoba A',
    body: `## Opis
Interfejs do zarządzania nagranym klipem z konkretnego dnia.

## Zadania
- [ ] Komponent \`ClipViewScreen.js\`
- [ ] HTML5 \`<video>\` player z kontrolkami
- [ ] Przycisk "Usuń klip" z potwierdzeniem
- [ ] Przycisk "Nagraj ponownie" (nadpisuje istniejący)
- [ ] Wyświetlanie daty klipu
- [ ] Loading state
- [ ] Obsługa błędów

## Mockup UI
\`\`\`
┌─────────────────────────────────┐
│  ◀ Powrót     30 Stycznia 2026  │
├─────────────────────────────────┤
│   ┌─────────────────────────┐   │
│   │    [VIDEO PLAYER]       │   │
│   │         2.0s            │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌───────────┐ ┌───────────┐   │
│   │  🗑 Usuń  │ │ 🔄 Nagraj │   │
│   └───────────┘ └───────────┘   │
└─────────────────────────────────┘
\`\`\`

## Szacowany czas
- 1 osoba: 1 dzień
- 4 osoby + AI: 3-4h`
  },

  // EPIC 2: Generowanie filmu
  {
    title: '[EPIC] Automatyczne generowanie miesięcznego filmu (WO2 + WF02)',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    body: `## Opis
System automatycznego łączenia wszystkich klipów z miesiąca w jeden film.

## Wymagania z SWS
- [ ] System łączy wszystkie klipy z miesiąca w jeden film
- [ ] Chronologiczna kolejność (1-31 dzień)
- [ ] Czas generowania <30 sekund
- [ ] Możliwość zapisu lokalnie/chmura/udostępnienia

## Rekomendacja implementacji
**ffmpeg.wasm (client-side)** - działa w przeglądarce, ~25MB download

## Definition of Done
- [ ] Użytkownik może wygenerować film z wybranego miesiąca
- [ ] Klipy są w kolejności chronologicznej
- [ ] Generowanie trwa <30 sekund
- [ ] Użytkownik może pobrać/udostępnić film

## Szacowany czas
- 1 osoba: 3-5 dni
- 4 osoby + AI: 1.5 dnia`
  },
  {
    title: 'Integracja ffmpeg.wasm do łączenia klipów',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    assignee: 'Osoba B',
    body: `## Opis
Implementacja client-side video processing przy użyciu ffmpeg.wasm.

**ZALEŻY OD:** #12 (COOP/COEP headers)

## Instalacja
\`\`\`bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
\`\`\`

## Zadania
- [ ] Utworzenie \`src/services/videoProcessingService.js\`
- [ ] Funkcja pobierająca wszystkie klipy z miesiąca
- [ ] Funkcja łącząca klipy w jeden film
- [ ] Progress callback (0-100%)
- [ ] Obsługa błędów
- [ ] Optymalizacja pamięci (cleanup)

## Przykładowa implementacja
\`\`\`javascript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export async function generateMonthlyVideo(clips, onProgress) {
  await ffmpeg.load();

  // Zapisz klipy do wirtualnego systemu plików
  for (let i = 0; i < clips.length; i++) {
    const response = await fetch(clips[i].videoUrl);
    const data = await response.arrayBuffer();
    await ffmpeg.writeFile(\`clip\${i}.webm\`, new Uint8Array(data));
    onProgress((i / clips.length) * 50);
  }

  // Stwórz plik z listą
  const fileList = clips.map((_, i) => \`file 'clip\${i}.webm'\`).join('\\n');
  await ffmpeg.writeFile('list.txt', fileList);

  // Połącz klipy
  await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']);

  onProgress(100);
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
}
\`\`\`

## Szacowany czas
- 1 osoba: 2-3 dni
- 4 osoby + AI: 6-8h`
  },
  {
    title: 'UI generowania miesięcznego filmu',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    assignee: 'Osoba B',
    body: `## Opis
Interfejs użytkownika do generowania i podglądu miesięcznego filmu.

## Zadania
- [ ] Nowy ekran \`MonthlyVideoScreen.js\`
- [ ] Wybór miesiąca do wygenerowania
- [ ] Podgląd ile klipów jest w danym miesiącu
- [ ] Progress bar podczas generowania
- [ ] Podgląd wygenerowanego filmu
- [ ] Przyciski eksportu

## Mockup UI
\`\`\`
┌─────────────────────────────────┐
│  Twój film - Styczeń 2026       │
├─────────────────────────────────┤
│   📅 Styczeń 2026               │
│   📹 18 klipów (36 sekund)      │
│                                 │
│   ┌─────────────────────────┐   │
│   │ [PROGRESS BAR: 67%]     │   │
│   │ Generowanie filmu...    │   │
│   └─────────────────────────┘   │
│                                 │
│   [VIDEO PREVIEW]               │
│                                 │
│   [💾 Pobierz]  [📤 Udostępnij] │
└─────────────────────────────────┘
\`\`\`

## States
1. **Wybór miesiąca** - lista z liczbą klipów
2. **Generowanie** - progress bar
3. **Gotowe** - podgląd + eksport
4. **Błąd** - retry

## Szacowany czas
- 1 osoba: 1-2 dni
- 4 osoby + AI: 4-6h`
  },
  {
    title: 'Eksport i udostępnianie wygenerowanego filmu',
    labels: ['priority: critical', 'type: feature', 'area: video', 'mvp'],
    assignee: 'Osoba B',
    body: `## Opis
Funkcjonalność pobierania i udostępniania wygenerowanego filmu.

## Zadania
- [ ] Przycisk "Pobierz" - download do urządzenia
- [ ] Przycisk "Udostępnij" - Web Share API
- [ ] Opcja "Zapisz w chmurze"
- [ ] Generowanie nazwy pliku

## Implementacja

### Pobieranie
\`\`\`javascript
function downloadVideo(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
\`\`\`

### Udostępnianie (Web Share API)
\`\`\`javascript
async function shareVideo(blob, filename) {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'video/mp4' });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Mój film Snaplet',
      });
    }
  }
}
\`\`\`

## Szacowany czas
- 1 osoba: 0.5 dnia
- 4 osoby + AI: 2-3h`
  },

  // EPIC 3: Autentykacja
  {
    title: '[EPIC] Firebase Authentication - pełna implementacja (I01)',
    labels: ['priority: high', 'type: feature', 'area: auth', 'mvp'],
    body: `## Opis
Rozszerzenie istniejącej autentykacji o logowanie przez Google.

## Obecny stan
- ✅ Email/password login
- ✅ Email/password registration
- ✅ Password reset
- ❌ Google Sign-In
- ❌ Apple Sign-In (pomijamy dla web)

## Definition of Done
- [ ] Użytkownik może zalogować się przez Google
- [ ] OAuth 2.0 poprawnie skonfigurowane

## Szacowany czas
- 1 osoba: 0.5 dnia
- 4 osoby + AI: 2-3h`
  },
  {
    title: 'Implementacja Google Sign-In',
    labels: ['priority: high', 'type: feature', 'area: auth', 'mvp'],
    assignee: 'Osoba D',
    body: `## Opis
Dodanie możliwości logowania przez konto Google.

## Zadania
- [ ] Włączenie Google provider w Firebase Console
- [ ] Przycisk "Zaloguj przez Google" na LoginScreen
- [ ] Przycisk "Zarejestruj przez Google" na RegisterScreen
- [ ] Implementacja \`signInWithPopup\`
- [ ] Tworzenie profilu dla nowych użytkowników
- [ ] Obsługa błędów

## Implementacja
\`\`\`javascript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
    }
    return user;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Logowanie anulowane');
    }
    throw error;
  }
}
\`\`\`

## Firebase Console Setup
1. Authentication → Sign-in method → Google → Enable
2. Dodać domenę do Authorized domains

## Szacowany czas
- 1 osoba: 2-4h
- 4 osoby + AI: 2-3h`
  },

  // Infrastruktura
  {
    title: 'Konfiguracja COOP/COEP headers dla ffmpeg.wasm',
    labels: ['priority: critical', 'type: infrastructure', 'mvp'],
    assignee: 'Osoba B',
    body: `## Opis
ffmpeg.wasm wymaga \`SharedArrayBuffer\` który działa tylko z odpowiednimi headerami.

**BLOKUJE:** #7 (ffmpeg.wasm)

## Rozwiązanie

### Firebase Hosting (firebase.json)
\`\`\`json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
          { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
        ]
      }
    ]
  }
}
\`\`\`

### Webpack Dev Server (webpack.config.js)
\`\`\`javascript
devServer: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  }
}
\`\`\`

## Zadania
- [ ] Dodać headery do firebase.json
- [ ] Dodać headery do webpack.config.js
- [ ] Przetestować \`crossOriginIsolated === true\`
- [ ] Przetestować ffmpeg.wasm

## Szacowany czas
- 1 osoba: 2-4h
- 4 osoby + AI: 1-2h`
  },
  {
    title: 'Synchronizacja offline (Service Workers)',
    labels: ['priority: medium', 'type: feature', 'area: storage', 'mvp'],
    assignee: 'Osoba C',
    body: `## Opis
Implementacja podstawowej synchronizacji offline.

## Zadania
- [ ] Konfiguracja Service Worker
- [ ] Cache'owanie statycznych zasobów
- [ ] IndexedDB dla pending uploads
- [ ] UI indicator online/offline

## Implementacja
\`\`\`javascript
// sw.js
const CACHE_NAME = 'snaplet-v1';
const urlsToCache = ['/', '/index.html', '/static/js/main.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
\`\`\`

## Priorytet
ŚREDNI - można uprościć dla MVP (tylko basic cache)

## Szacowany czas
- 1 osoba: 1-2 dni (pełne) lub 2-4h (basic)
- 4 osoby + AI: 4-6h (pełne) lub 1-2h (basic)`
  },

  // Testowanie
  {
    title: 'Testy cross-browser (Chrome, Firefox, Safari, Edge)',
    labels: ['priority: medium', 'type: enhancement', 'mvp'],
    assignee: 'Osoba A',
    body: `## Opis
Weryfikacja działania aplikacji na wszystkich przeglądarkach.

## Przeglądarki do przetestowania
- [ ] Chrome 90+ (desktop & mobile)
- [ ] Firefox 90+ (desktop & mobile)
- [ ] Safari 15+ (desktop & iOS)
- [ ] Edge 90+ (desktop)

## Funkcje do przetestowania
- [ ] Logowanie (email + Google)
- [ ] Nagrywanie wideo (MediaRecorder)
- [ ] Odtwarzanie wideo
- [ ] Generowanie filmu (ffmpeg.wasm)
- [ ] Pobieranie filmu
- [ ] Udostępnianie (Web Share API)
- [ ] Kalendarz
- [ ] Responsywność

## Znane problemy
- Safari: problemy z niektórymi codec'ami
- Firefox: inne flagi dla MediaRecorder
- iOS Safari: ograniczenia autoplay

## Szacowany czas
- 1 osoba: 1 dzień
- 4 osoby + AI: 4h`
  },
  {
    title: 'Responsywność mobile web',
    labels: ['priority: medium', 'type: enhancement', 'mvp'],
    assignee: 'Osoba D',
    body: `## Opis
Optymalizacja UI dla urządzeń mobilnych.

## Zadania
- [ ] Responsywny kalendarz
- [ ] Responsywny video player
- [ ] Touch-friendly przyciski (min 44x44px)
- [ ] Poprawne viewport meta tag
- [ ] Landscape vs Portrait

## Breakpoints
\`\`\`css
@media (max-width: 480px) { /* Mobile */ }
@media (max-width: 768px) { /* Tablet */ }
@media (min-width: 769px) { /* Desktop */ }
\`\`\`

## Urządzenia do przetestowania
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPad (768px)

## Szacowany czas
- 1 osoba: 1 dzień
- 4 osoby + AI: 4h`
  },
  {
    title: 'PWA - instalacja aplikacji na telefon',
    labels: ['priority: medium', 'type: enhancement'],
    assignee: 'Osoba D',
    body: `## Opis
Konfiguracja Progressive Web App.

## Zadania
- [ ] manifest.json
- [ ] Ikony aplikacji (192x192, 512x512)
- [ ] Splash screen
- [ ] Service Worker
- [ ] "Add to Home Screen"

## manifest.json
\`\`\`json
{
  "name": "Snaplet",
  "short_name": "Snaplet",
  "description": "Nagraj swój dzień w 2 sekundy",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5E6D3",
  "theme_color": "#3A2B20",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
\`\`\`

## Priorytet
NISKI - nice to have

## Szacowany czas
- 1 osoba: 0.5 dnia
- 4 osoby + AI: 3-4h`
  },
  {
    title: 'Usunięcie/refaktor kodu do zdjęć',
    labels: ['priority: low', 'type: enhancement'],
    assignee: 'Osoba D',
    body: `## Opis
Cleanup starego kodu związanego ze zdjęciami.

## Zadania
- [ ] Przegląd postService.js
- [ ] Przegląd storageService.js
- [ ] Usunięcie/archiwizacja HomeScreen.js
- [ ] Aktualizacja nawigacji

## Decyzje do podjęcia
- [ ] Czy zachowujemy social features?
- [ ] Czy zachowujemy messaging?
- [ ] Czy zachowujemy feed?

## Priorytet
NISKI - cleanup po MVP

## Szacowany czas
- 1 osoba: 0.5 dnia
- 4 osoby + AI: 2-3h`
  },
];

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

async function createLabel(label) {
  try {
    await octokit.issues.createLabel({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      name: label.name,
      color: label.color,
      description: label.description,
    });
    console.log(`  ✓ Label: ${label.name}`);
  } catch (error) {
    if (error.status === 422) {
      console.log(`  ○ Label już istnieje: ${label.name}`);
    } else {
      throw error;
    }
  }
}

async function createIssue(issue) {
  try {
    const result = await octokit.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
    });
    console.log(`  ✓ Issue #${result.data.number}: ${issue.title}`);
    return result.data.number;
  } catch (error) {
    console.error(`  ✗ Błąd przy tworzeniu: ${issue.title}`);
    throw error;
  }
}

async function createMilestone() {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5); // 5 dni od teraz

    const result = await octokit.issues.createMilestone({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: 'MVP v1.0',
      description: 'Minimum Viable Product - nagrywanie 2s klipów + generowanie miesięcznego filmu',
      due_on: dueDate.toISOString(),
    });
    console.log(`  ✓ Milestone: MVP v1.0 (due: ${dueDate.toLocaleDateString('pl-PL')})`);
    return result.data.number;
  } catch (error) {
    if (error.status === 422) {
      console.log(`  ○ Milestone już istnieje: MVP v1.0`);
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('');
  console.log('='.repeat(50));
  console.log('  SNAPLET MVP - GitHub Issues Generator');
  console.log('='.repeat(50));
  console.log('');

  // Tworzenie labels
  console.log('🏷️  Tworzenie labels...');
  for (const label of labels) {
    await createLabel(label);
  }
  console.log('');

  // Tworzenie issues
  console.log('📝 Tworzenie issues...');
  const createdIssues = [];
  for (const issue of issues) {
    const number = await createIssue(issue);
    createdIssues.push(number);
  }
  console.log('');

  // Tworzenie milestone
  console.log('📌 Tworzenie milestone...');
  await createMilestone();
  console.log('');

  // Podsumowanie
  console.log('='.repeat(50));
  console.log('✅ WSZYSTKIE ISSUES UTWORZONE!');
  console.log('='.repeat(50));
  console.log('');
  console.log('📊 SZACOWANY CZAS DO MVP:');
  console.log('┌────────────────────────┬───────────┐');
  console.log('│ 1 osoba, bez AI        │ 12-17 dni │');
  console.log('│ 1 osoba, z AI          │ 7-10 dni  │');
  console.log('│ 4 osoby, bez AI        │ 5-7 dni   │');
  console.log('│ 4 osoby, z AI          │ 3-4 dni   │');
  console.log('└────────────────────────┴───────────┘');
  console.log('');
  console.log('Podział pracy:');
  console.log('  Osoba A: Video Recording (#2, #5, #14)');
  console.log('  Osoba B: Video Generation (#7, #8, #9, #12)');
  console.log('  Osoba C: Calendar + Data (#3, #4, #13)');
  console.log('  Osoba D: Auth + Polish (#11, #15, #16, #17)');
  console.log('');
  console.log(`Otwórz: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
  console.log('');
}

main().catch((error) => {
  console.error('❌ Błąd:', error.message);
  process.exit(1);
});
