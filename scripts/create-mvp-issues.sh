#!/bin/bash

# =============================================================================
# SNAPLET MVP - GitHub Issues Generator
# =============================================================================
# Uruchom: chmod +x scripts/create-mvp-issues.sh && ./scripts/create-mvp-issues.sh
# Wymaga: gh CLI (https://cli.github.com/) zalogowane do GitHub
# =============================================================================

set -e

REPO="ax8tje/snaplet-pjatk-project"

echo "🚀 Tworzenie labels..."

# Tworzenie labels (ignoruj błędy jeśli już istnieją)
gh label create "priority: critical" --color "B60205" --description "Blokuje MVP" --repo "$REPO" 2>/dev/null || true
gh label create "priority: high" --color "D93F0B" --description "Wymagane dla pełnego MVP" --repo "$REPO" 2>/dev/null || true
gh label create "priority: medium" --color "FBCA04" --description "Wspomagające MVP" --repo "$REPO" 2>/dev/null || true
gh label create "type: feature" --color "0E8A16" --description "Nowa funkcjonalność" --repo "$REPO" 2>/dev/null || true
gh label create "type: enhancement" --color "84B6EB" --description "Ulepszenie istniejącej funkcji" --repo "$REPO" 2>/dev/null || true
gh label create "type: infrastructure" --color "C5DEF5" --description "Infrastruktura/konfiguracja" --repo "$REPO" 2>/dev/null || true
gh label create "area: video" --color "7057FF" --description "Nagrywanie/przetwarzanie wideo" --repo "$REPO" 2>/dev/null || true
gh label create "area: calendar" --color "008672" --description "Kalendarz i zarządzanie datami" --repo "$REPO" 2>/dev/null || true
gh label create "area: auth" --color "E99695" --description "Autentykacja" --repo "$REPO" 2>/dev/null || true
gh label create "area: storage" --color "F9D0C4" --description "Firebase Storage/Firestore" --repo "$REPO" 2>/dev/null || true
gh label create "mvp" --color "1D76DB" --description "Wymagane do MVP" --repo "$REPO" 2>/dev/null || true

echo "✅ Labels utworzone"
echo ""
echo "📝 Tworzenie issues..."

# =============================================================================
# EPIC 1: NAGRYWANIE WIDEO (WO1 + WF01)
# =============================================================================

gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Nagrywanie 2-sekundowych klipów wideo (WO1 + WF01)" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
Implementacja systemu nagrywania 2-sekundowych klipów wideo przypisanych do konkretnych dat.

## Wymagania z SWS
- [x] Użytkownik nagrywa max 2-sekundowe klipy wideo (nie zdjęcia!)
- [x] Klip przypisany do konkretnej daty
- [x] Zapis w kalendarzu użytkownika
- [x] Podgląd, usunięcie, ponowne nagranie klipu z danego dnia

## Powiązane issues
- #X Implementacja MediaRecorder API
- #X Widok kalendarza
- #X Struktura danych dla klipów
- #X UI podglądu/usuwania klipów

## Definition of Done
- [ ] Użytkownik może nagrać klip wideo max 2s
- [ ] Klip jest automatycznie przypisany do wybranej daty
- [ ] Użytkownik widzi kalendarz z oznaczonymi dniami
- [ ] Użytkownik może podejrzeć, usunąć i ponownie nagrać klip

## Szacowany czas
- 1 osoba: 4-5 dni
- 4 osoby + AI: 1 dzień
EOF
)"

echo "  ✓ Epic: Nagrywanie wideo"

gh issue create \
  --repo "$REPO" \
  --title "Implementacja nagrywania wideo (MediaRecorder API)" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
Przepisanie `CameraScreen.js` z robienia zdjęć na nagrywanie wideo przy użyciu MediaRecorder API.

## Zadania
- [ ] Zamiana `getUserMedia` z photo na video
- [ ] Implementacja `MediaRecorder` API
- [ ] Timer 2 sekundy z wizualnym odliczaniem
- [ ] Automatyczne zatrzymanie nagrywania po 2s
- [ ] Podgląd nagranego klipu przed zapisem
- [ ] Przycisk "Nagraj ponownie" / "Zapisz"
- [ ] Obsługa błędów (brak kamery, brak uprawnień)

## Techniczne szczegóły
```javascript
// Przykładowa implementacja
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  // upload to Firebase Storage
};

// Auto-stop po 2s
setTimeout(() => mediaRecorder.stop(), 2000);
```

## Pliki do modyfikacji
- `src/screens/CameraScreen.js` - główna logika
- `src/services/storageService.js` - upload wideo

## Akceptacja
- [ ] Działa na Chrome, Firefox, Safari, Edge
- [ ] Nagrywanie trwa dokładnie 2 sekundy
- [ ] Wideo jest w formacie webm lub mp4
- [ ] Użytkownik widzi podgląd przed zapisem

## Szacowany czas
1-2 dni
EOF
)"

echo "  ✓ Issue: MediaRecorder API"

gh issue create \
  --repo "$REPO" \
  --title "Widok kalendarza z oznaczonymi nagraniami" \
  --label "priority: critical,type: feature,area: calendar,mvp" \
  --body "$(cat <<'EOF'
## Opis
Nowy ekran z kalendarzem pokazującym dni w których użytkownik nagrał klipy.

## Zadania
- [ ] Nowy komponent `CalendarScreen.js`
- [ ] Integracja biblioteki kalendarza (np. `react-calendar`)
- [ ] Pobieranie dat z nagraniami z Firestore
- [ ] Wizualne oznaczenie dni z klipami (np. zielona kropka)
- [ ] Oznaczenie bieżącego dnia
- [ ] Kliknięcie na dzień → przejście do nagrywania/podglądu
- [ ] Nawigacja między miesiącami
- [ ] Dodanie do głównej nawigacji (zamiana/dodanie do tabs)

## Mockup UI
```
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
```

## Pliki do utworzenia/modyfikacji
- `src/screens/CalendarScreen.js` - nowy ekran
- `src/navigation/MainTabNavigator.tsx` - dodanie tab
- `src/services/clipService.js` - pobieranie dat

## Zależności
```bash
npm install react-calendar
```

## Akceptacja
- [ ] Kalendarz pokazuje bieżący miesiąc
- [ ] Dni z nagraniami są wizualnie oznaczone
- [ ] Kliknięcie na dzień otwiera nagrywanie/podgląd
- [ ] Można nawigować między miesiącami

## Szacowany czas
1-2 dni
EOF
)"

echo "  ✓ Issue: Kalendarz"

gh issue create \
  --repo "$REPO" \
  --title "Struktura danych Firestore dla klipów wideo" \
  --label "priority: critical,type: infrastructure,area: storage,mvp" \
  --body "$(cat <<'EOF'
## Opis
Nowa kolekcja w Firestore do przechowywania metadanych klipów wideo.

## Struktura danych

### Kolekcja: `clips`
```javascript
{
  id: "auto-generated",
  userId: "user-uid",
  date: "2026-01-30",           // YYYY-MM-DD format (klucz do wyszukiwania)
  videoUrl: "https://...",       // URL do Firebase Storage
  thumbnailUrl: "https://...",   // Miniaturka (pierwszy frame)
  duration: 2000,                // ms
  createdAt: Timestamp,
  updatedAt: Timestamp,
  month: "2026-01",              // Do grupowania przy generowaniu filmu
  status: "ready" | "processing" | "error"
}
```

### Indeksy Firestore
```
clips: userId + date (composite)
clips: userId + month (composite)
```

### Storage structure
```
users/{userId}/clips/{date}/video.webm
users/{userId}/clips/{date}/thumbnail.jpg
users/{userId}/monthly/{month}/compiled.mp4
```

## Zadania
- [ ] Utworzenie `src/services/clipService.js`
- [ ] Funkcja `saveClip(userId, date, videoBlob)`
- [ ] Funkcja `getClip(userId, date)`
- [ ] Funkcja `getClipsByMonth(userId, month)`
- [ ] Funkcja `getUserClipDates(userId)` - do kalendarza
- [ ] Funkcja `deleteClip(userId, date)`
- [ ] Funkcja `updateClip(userId, date, videoBlob)` - nadpisanie
- [ ] Aktualizacja Firestore rules
- [ ] Generowanie miniaturki z pierwszej klatki

## Firestore Rules
```javascript
match /clips/{clipId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
}
```

## Akceptacja
- [ ] Można zapisać klip z datą
- [ ] Można pobrać klip po dacie
- [ ] Można pobrać wszystkie daty z klipami
- [ ] Można usunąć klip
- [ ] Security rules działają poprawnie

## Szacowany czas
1 dzień
EOF
)"

echo "  ✓ Issue: Struktura danych"

gh issue create \
  --repo "$REPO" \
  --title "UI podglądu, usuwania i ponownego nagrywania klipu" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
Interfejs do zarządzania nagranym klipem z konkretnego dnia.

## Zadania
- [ ] Komponent `ClipViewScreen.js` lub modal
- [ ] HTML5 `<video>` player z kontrolkami
- [ ] Przycisk "Usuń klip" z potwierdzeniem
- [ ] Przycisk "Nagraj ponownie" (nadpisuje istniejący)
- [ ] Wyświetlanie daty klipu
- [ ] Loading state podczas ładowania wideo
- [ ] Obsługa błędów (wideo nie istnieje)

## Mockup UI
```
┌─────────────────────────────────┐
│  ◀ Powrót     30 Stycznia 2026  │
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │                         │   │
│   │    [VIDEO PLAYER]       │   │
│   │        advancement       │   │
│   │         2.0s            │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌───────────┐ ┌───────────┐   │
│   │  🗑 Usuń  │ │ 🔄 Nagraj │   │
│   │           │ │  ponownie │   │
│   └───────────┘ └───────────┘   │
│                                 │
└─────────────────────────────────┘
```

## Pliki do utworzenia/modyfikacji
- `src/screens/ClipViewScreen.js` - nowy ekran
- `src/components/VideoPlayer.js` - komponent playera
- `src/navigation/` - routing

## Akceptacja
- [ ] Wideo odtwarza się poprawnie
- [ ] Usunięcie wymaga potwierdzenia
- [ ] Po usunięciu → powrót do kalendarza
- [ ] "Nagraj ponownie" → ekran nagrywania z nadpisaniem

## Szacowany czas
1 dzień
EOF
)"

echo "  ✓ Issue: UI podglądu klipów"

# =============================================================================
# EPIC 2: GENEROWANIE FILMU (WO2 + WF02)
# =============================================================================

gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Automatyczne generowanie miesięcznego filmu (WO2 + WF02)" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
System automatycznego łączenia wszystkich klipów z miesiąca w jeden film.

## Wymagania z SWS
- [x] System łączy wszystkie klipy z miesiąca w jeden film
- [x] Chronologiczna kolejność (1-31 dzień)
- [x] Czas generowania <30 sekund
- [x] Możliwość zapisu lokalnie/chmura/udostępnienia

## Powiązane issues
- #X Integracja ffmpeg.wasm
- #X UI generowania filmu
- #X Eksport i udostępnianie

## Opcje implementacji
1. **ffmpeg.wasm (client-side)** - działa w przeglądarce, ~25MB download
2. **Cloud Function + ffmpeg** - szybsze, ale wymaga backendu

## Rekomendacja
Dla MVP: **ffmpeg.wasm** - prostsze, nie wymaga backendu

## Definition of Done
- [ ] Użytkownik może wygenerować film z wybranego miesiąca
- [ ] Klipy są w kolejności chronologicznej (1→31)
- [ ] Generowanie trwa <30 sekund
- [ ] Użytkownik może pobrać/udostępnić film

## Szacowany czas
3-5 dni roboczych
EOF
)"

echo "  ✓ Epic: Generowanie filmu"

gh issue create \
  --repo "$REPO" \
  --title "Integracja ffmpeg.wasm do łączenia klipów" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
Implementacja client-side video processing przy użyciu ffmpeg.wasm.

## Zadania
- [ ] Instalacja ffmpeg.wasm
- [ ] Utworzenie `src/services/videoProcessingService.js`
- [ ] Funkcja pobierająca wszystkie klipy z miesiąca
- [ ] Funkcja łącząca klipy w jeden film
- [ ] Progress callback (0-100%)
- [ ] Obsługa błędów (brak klipów, błąd przetwarzania)
- [ ] Optymalizacja pamięci (cleanup po przetworzeniu)

## Instalacja
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

## Przykładowa implementacja
```javascript
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
    onProgress((i / clips.length) * 50); // 0-50% = pobieranie
  }

  // Stwórz plik z listą
  const fileList = clips.map((_, i) => \`file 'clip\${i}.webm'\`).join('\\n');
  await ffmpeg.writeFile('list.txt', fileList);

  // Połącz klipy
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'list.txt',
    '-c', 'copy',
    'output.mp4'
  ]);

  onProgress(100);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
}
```

## Akceptacja
- [ ] ffmpeg.wasm ładuje się poprawnie
- [ ] Klipy są łączone w kolejności chronologicznej
- [ ] Progress jest raportowany
- [ ] Wynikowy film jest poprawny (playable)
- [ ] Generowanie <30s dla typowego miesiąca (15-20 klipów)

## Uwagi
- ffmpeg.wasm wymaga `SharedArrayBuffer` → potrzebne headery COOP/COEP
- Alternatywa bez SharedArrayBuffer: `@ffmpeg/ffmpeg` v0.11 (starszawersja)

## Szacowany czas
2-3 dni
EOF
)"

echo "  ✓ Issue: ffmpeg.wasm"

gh issue create \
  --repo "$REPO" \
  --title "UI generowania miesięcznego filmu" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
Interfejs użytkownika do generowania i podglądu miesięcznego filmu.

## Zadania
- [ ] Nowy ekran `MonthlyVideoScreen.js`
- [ ] Wybór miesiąca do wygenerowania
- [ ] Podgląd ile klipów jest w danym miesiącu
- [ ] Przycisk "Generuj film"
- [ ] Progress bar podczas generowania
- [ ] Podgląd wygenerowanego filmu
- [ ] Przyciski eksportu (pobierz, udostępnij)

## Mockup UI
```
┌─────────────────────────────────┐
│  Twój film - Styczeń 2026       │
├─────────────────────────────────┤
│                                 │
│   📅 Styczeń 2026               │
│   📹 18 klipów (36 sekund)      │
│                                 │
│   ┌─────────────────────────┐   │
│   │ [PROGRESS BAR: 67%]     │   │
│   │ Generowanie filmu...    │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │    [VIDEO PREVIEW]      │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌───────────┐ ┌───────────┐   │
│   │ 💾 Pobierz│ │ 📤 Udostęp│   │
│   └───────────┘ └───────────┘   │
│                                 │
└─────────────────────────────────┘
```

## States
1. **Wybór miesiąca** - lista dostępnych miesięcy z liczbą klipów
2. **Generowanie** - progress bar, blokada UI
3. **Gotowe** - podgląd + przyciski eksportu
4. **Błąd** - komunikat + retry

## Pliki do utworzenia
- `src/screens/MonthlyVideoScreen.js`
- `src/components/ProgressBar.js`
- `src/components/MonthSelector.js`

## Akceptacja
- [ ] Można wybrać miesiąc z listy
- [ ] Progress bar pokazuje postęp
- [ ] Wygenerowany film można odtworzyć
- [ ] Można pobrać film na urządzenie

## Szacowany czas
1-2 dni
EOF
)"

echo "  ✓ Issue: UI generowania filmu"

gh issue create \
  --repo "$REPO" \
  --title "Eksport i udostępnianie wygenerowanego filmu" \
  --label "priority: critical,type: feature,area: video,mvp" \
  --body "$(cat <<'EOF'
## Opis
Funkcjonalność pobierania i udostępniania wygenerowanego miesięcznego filmu.

## Zadania
- [ ] Przycisk "Pobierz" - download do urządzenia
- [ ] Przycisk "Udostępnij" - Web Share API
- [ ] Opcja "Zapisz w chmurze" - upload do Firebase Storage
- [ ] Generowanie nazwy pliku (np. "Snaplet_Styczen_2026.mp4")

## Implementacja

### Pobieranie
```javascript
function downloadVideo(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Udostępnianie (Web Share API)
```javascript
async function shareVideo(blob, filename) {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'video/mp4' });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Mój film Snaplet',
        text: 'Zobacz mój miesięczny film!'
      });
    }
  } else {
    // Fallback: pokaż modal z opcjami
  }
}
```

### Zapis w chmurze
```javascript
async function saveToCloud(blob, userId, month) {
  const path = \`users/\${userId}/monthly/\${month}/compiled.mp4\`;
  await uploadToStorage(path, blob);
  // Zapisz URL w Firestore
}
```

## Akceptacja
- [ ] Pobieranie działa na wszystkich przeglądarkach
- [ ] Web Share API działa na mobile (gdzie wspierane)
- [ ] Fallback dla przeglądarek bez Web Share
- [ ] Zapis w chmurze działa poprawnie

## Szacowany czas
0.5 dnia
EOF
)"

echo "  ✓ Issue: Eksport filmu"

# =============================================================================
# EPIC 3: AUTENTYKACJA (I01)
# =============================================================================

gh issue create \
  --repo "$REPO" \
  --title "[EPIC] Firebase Authentication - pełna implementacja (I01)" \
  --label "priority: high,type: feature,area: auth,mvp" \
  --body "$(cat <<'EOF'
## Opis
Rozszerzenie istniejącej autentykacji o logowanie przez Google.

## Wymagania z SWS
- [x] Logowanie email ✅ (już zaimplementowane)
- [x] Logowanie Google
- [ ] ~~Logowanie Apple~~ (pominięte dla web app - niski priorytet)
- [x] Szyfrowanie, OAuth 2.0

## Obecny stan
- ✅ Email/password login
- ✅ Email/password registration
- ✅ Password reset
- ❌ Google Sign-In
- ❌ Apple Sign-In (pomijamy dla web)

## Powiązane issues
- #X Google Sign-In

## Definition of Done
- [ ] Użytkownik może zalogować się przez Google
- [ ] OAuth 2.0 poprawnie skonfigurowane

## Szacowany czas
0.5 dnia
EOF
)"

echo "  ✓ Epic: Authentication"

gh issue create \
  --repo "$REPO" \
  --title "Implementacja Google Sign-In" \
  --label "priority: high,type: feature,area: auth,mvp" \
  --body "$(cat <<'EOF'
## Opis
Dodanie możliwości logowania przez konto Google.

## Zadania
- [ ] Włączenie Google provider w Firebase Console
- [ ] Dodanie przycisku "Zaloguj przez Google" na LoginScreen
- [ ] Dodanie przycisku "Zarejestruj przez Google" na RegisterScreen
- [ ] Implementacja `signInWithPopup` / `signInWithRedirect`
- [ ] Obsługa tworzenia profilu dla nowych użytkowników Google
- [ ] Obsługa błędów (popup blocked, cancelled)

## Implementacja

### authService.js
```javascript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Sprawdź czy użytkownik już istnieje
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // Nowy użytkownik - stwórz profil
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
```

### UI - Przycisk Google
```jsx
<Button
  onPress={handleGoogleSignIn}
  style={styles.googleButton}
>
  <GoogleIcon /> Kontynuuj z Google
</Button>
```

## Firebase Console Setup
1. Authentication → Sign-in method → Google → Enable
2. Dodać domenę do Authorized domains

## Akceptacja
- [ ] Przycisk Google widoczny na ekranach logowania
- [ ] Popup/redirect działa poprawnie
- [ ] Nowi użytkownicy mają tworzony profil
- [ ] Istniejący użytkownicy są logowani

## Szacowany czas
2-4 godziny
EOF
)"

echo "  ✓ Issue: Google Sign-In"

# =============================================================================
# EPIC 4: STORAGE I OFFLINE (I02)
# =============================================================================

gh issue create \
  --repo "$REPO" \
  --title "Konfiguracja COOP/COEP headers dla ffmpeg.wasm" \
  --label "priority: critical,type: infrastructure,mvp" \
  --body "$(cat <<'EOF'
## Opis
ffmpeg.wasm wymaga `SharedArrayBuffer` który działa tylko z odpowiednimi headerami bezpieczeństwa.

## Problem
Bez headerów COOP/COEP, ffmpeg.wasm nie będzie działać lub będzie bardzo wolne.

## Rozwiązanie

### Opcja A: Firebase Hosting (firebase.json)
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin"
          },
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "require-corp"
          }
        ]
      }
    ]
  }
}
```

### Opcja B: Webpack Dev Server (webpack.config.js)
```javascript
devServer: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  }
}
```

## Uwagi
- Te headery mogą zepsuć niektóre zewnętrzne zasoby (images, scripts)
- Może być potrzebne `crossorigin="anonymous"` dla zasobów
- Alternatywa: użyć starszej wersji ffmpeg.wasm (0.11) bez SharedArrayBuffer

## Zadania
- [ ] Dodać headery do firebase.json
- [ ] Dodać headery do webpack.config.js (dev)
- [ ] Przetestować czy aplikacja działa poprawnie
- [ ] Przetestować czy ffmpeg.wasm działa

## Akceptacja
- [ ] `crossOriginIsolated === true` w konsoli przeglądarki
- [ ] ffmpeg.wasm ładuje się i działa
- [ ] Reszta aplikacji działa poprawnie

## Szacowany czas
2-4 godziny
EOF
)"

echo "  ✓ Issue: COOP/COEP headers"

gh issue create \
  --repo "$REPO" \
  --title "Synchronizacja offline (Service Workers)" \
  --label "priority: medium,type: feature,area: storage,mvp" \
  --body "$(cat <<'EOF'
## Opis
Implementacja podstawowej synchronizacji offline dla web app.

## Zadania
- [ ] Konfiguracja Service Worker
- [ ] Cache'owanie statycznych zasobów (JS, CSS, images)
- [ ] IndexedDB dla pending uploads
- [ ] Kolejkowanie uploadów gdy offline
- [ ] Synchronizacja gdy połączenie wróci
- [ ] UI indicator online/offline

## Implementacja

### Service Worker (sw.js)
```javascript
const CACHE_NAME = 'snaplet-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Offline Queue
```javascript
// Zapisz pending upload w IndexedDB
async function queueUpload(clipData) {
  const db = await openDB('snaplet', 1);
  await db.add('pendingUploads', clipData);
}

// Sync gdy online
window.addEventListener('online', async () => {
  const pending = await getPendingUploads();
  for (const clip of pending) {
    await uploadClip(clip);
    await removePendingUpload(clip.id);
  }
});
```

## Uwagi
- To jest "nice to have" dla MVP - można uprościć lub pominąć
- Podstawowa wersja: tylko cache statycznych zasobów

## Akceptacja
- [ ] Aplikacja ładuje się offline (cached shell)
- [ ] Użytkownik widzi indicator offline
- [ ] Klipy nagrane offline są uploadowane po powrocie online

## Priorytet
ŚREDNI - można zrobić post-MVP

## Szacowany czas
1-2 dni (pełna implementacja) lub 2-4h (basic cache)
EOF
)"

echo "  ✓ Issue: Offline sync"

# =============================================================================
# POZOSTAŁE ISSUES
# =============================================================================

gh issue create \
  --repo "$REPO" \
  --title "Testy cross-browser (Chrome, Firefox, Safari, Edge)" \
  --label "priority: medium,type: enhancement,mvp" \
  --body "$(cat <<'EOF'
## Opis
Weryfikacja działania aplikacji na wszystkich głównych przeglądarkach.

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
- Safari może mieć problemy z niektórymi codec'ami
- Firefox może wymagać innych flag dla MediaRecorder
- iOS Safari ma ograniczenia z autoplay video

## Akceptacja
- [ ] Wszystkie core funkcje działają na Chrome
- [ ] Wszystkie core funkcje działają na Firefox
- [ ] Wszystkie core funkcje działają na Safari (z ewentualnymi fallbackami)
- [ ] Zidentyfikowane i udokumentowane ograniczenia

## Szacowany czas
1 dzień
EOF
)"

echo "  ✓ Issue: Cross-browser testing"

gh issue create \
  --repo "$REPO" \
  --title "Responsywność mobile web" \
  --label "priority: medium,type: enhancement,mvp" \
  --body "$(cat <<'EOF'
## Opis
Optymalizacja UI dla urządzeń mobilnych (telefony, tablety).

## Zadania
- [ ] Responsywny kalendarz (mniejsze komórki na mobile)
- [ ] Responsywny video player (full-width na mobile)
- [ ] Touch-friendly przyciski (min 44x44px)
- [ ] Poprawne viewport meta tag
- [ ] Testowanie na różnych rozmiarach ekranu
- [ ] Landscape vs Portrait handling

## Breakpoints
```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (min-width: 769px) { }
```

## Urządzenia do przetestowania
- iPhone SE (375px)
- iPhone 12/13 (390px)
- iPhone 12/13 Pro Max (428px)
- iPad (768px)
- iPad Pro (1024px)

## Akceptacja
- [ ] UI wygląda dobrze na telefonie
- [ ] Przyciski są łatwe do kliknięcia
- [ ] Tekst jest czytelny
- [ ] Nagrywanie wideo działa na mobile browsers

## Szacowany czas
1 dzień
EOF
)"

echo "  ✓ Issue: Mobile responsiveness"

gh issue create \
  --repo "$REPO" \
  --title "PWA - instalacja aplikacji na telefon" \
  --label "priority: medium,type: enhancement" \
  --body "$(cat <<'EOF'
## Opis
Konfiguracja Progressive Web App - możliwość "zainstalowania" aplikacji na telefonie.

## Zadania
- [ ] Utworzenie/aktualizacja `manifest.json`
- [ ] Ikony aplikacji (różne rozmiary)
- [ ] Splash screen
- [ ] Service Worker dla offline
- [ ] Theme color i background color
- [ ] "Add to Home Screen" prompt

## manifest.json
```json
{
  "name": "Snaplet",
  "short_name": "Snaplet",
  "description": "Nagraj swój dzień w 2 sekundy",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5E6D3",
  "theme_color": "#3A2B20",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Akceptacja
- [ ] Chrome pokazuje "Install app" prompt
- [ ] Zainstalowana aplikacja otwiera się w standalone mode
- [ ] Ikona aplikacji wygląda dobrze
- [ ] Splash screen wyświetla się przy starcie

## Priorytet
NISKI - nice to have, nie blokuje MVP

## Szacowany czas
0.5 dnia
EOF
)"

echo "  ✓ Issue: PWA"

gh issue create \
  --repo "$REPO" \
  --title "Usunięcie/refaktor kodu do zdjęć" \
  --label "priority: low,type: enhancement" \
  --body "$(cat <<'EOF'
## Opis
Cleanup starego kodu związanego ze zdjęciami, który nie jest już potrzebny po przejściu na wideo.

## Zadania
- [ ] Przegląd `postService.js` - co zostaje, co usunąć
- [ ] Przegląd `storageService.js` - dostosowanie do wideo
- [ ] Usunięcie/archiwizacja `HomeScreen.js` (feed zdjęć)
- [ ] Usunięcie kodu likes/comments (jeśli nie potrzebne)
- [ ] Usunięcie kodu messaging (jeśli nie potrzebne)
- [ ] Aktualizacja nawigacji

## Uwagi
- Może warto zachować niektóre elementy na przyszłość
- Można stworzyć branch archive zamiast usuwać

## Decyzje do podjęcia
- [ ] Czy zachowujemy social features (likes, comments)?
- [ ] Czy zachowujemy messaging?
- [ ] Czy zachowujemy feed ze zdjęciami równolegle?

## Priorytet
NISKI - cleanup po MVP

## Szacowany czas
0.5 dnia
EOF
)"

echo "  ✓ Issue: Code cleanup"

gh issue create \
  --repo "$REPO" \
  --title "Dokumentacja techniczna i README" \
  --label "priority: low,type: enhancement" \
  --body "$(cat <<'EOF'
## Opis
Aktualizacja dokumentacji projektu po zmianach związanych z MVP.

## Zadania
- [ ] Aktualizacja README.md
  - Opis nowej funkcjonalności (wideo zamiast zdjęć)
  - Instrukcja uruchomienia
  - Wymagania (przeglądarki)
- [ ] Dokumentacja API (clipService, videoProcessingService)
- [ ] Dokumentacja struktury Firestore
- [ ] Troubleshooting (znane problemy)

## Priorytet
NISKI - po MVP

## Szacowany czas
0.5 dnia
EOF
)"

echo "  ✓ Issue: Documentation"

# =============================================================================
# MILESTONE
# =============================================================================

echo ""
echo "📌 Tworzenie milestone..."

gh api repos/$REPO/milestones \
  --method POST \
  --field title="MVP v1.0" \
  --field description="Minimum Viable Product - nagrywanie 2s klipów + generowanie miesięcznego filmu" \
  --field due_on="2026-02-05T00:00:00Z" \
  2>/dev/null || echo "  (milestone może już istnieć)"

echo ""
echo "============================================="
echo "✅ WSZYSTKIE ISSUES UTWORZONE!"
echo "============================================="
echo ""
echo "📊 SZACOWANY CZAS DO MVP:"
echo "┌────────────────────────┬───────────┐"
echo "│ 1 osoba, bez AI        │ 12-17 dni │"
echo "│ 1 osoba, z AI          │ 7-10 dni  │"
echo "│ 4 osoby, bez AI        │ 5-7 dni   │"
echo "│ 4 osoby, z AI          │ 3-4 dni   │"
echo "└────────────────────────┴───────────┘"
echo ""
echo "Następne kroki:"
echo "1. Otwórz: https://github.com/$REPO/issues"
echo "2. Przypisz issues do milestone 'MVP v1.0'"
echo "3. Przypisz issues do odpowiednich osób:"
echo "   - Osoba A: #2, #5, #14 (Video Recording)"
echo "   - Osoba B: #7, #8, #9, #12 (Video Generation)"
echo "   - Osoba C: #3, #4, #13 (Calendar + Data)"
echo "   - Osoba D: #11, #15, #16, #17 (Auth + Polish)"
echo "4. Ustaw kolejność w Project board"
echo ""
echo "Podsumowanie utworzonych issues:"
echo "- 3 EPIC issues (główne funkcjonalności)"
echo "- 14 task issues (konkretne zadania)"
echo "- 1 milestone (MVP v1.0)"
echo ""
