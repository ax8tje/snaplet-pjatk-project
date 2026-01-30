# Snaplet MVP - Lista Issues do GitHub

> Wygenerowano: 2026-01-30
> Projekt: Web App (nie mobile)

---

## Podsumowanie

| Priorytet | Liczba issues | Szacowany czas |
|:----------|:-------------:|:--------------:|
| KRYTYCZNE | 9 | 8-12 dni |
| WYSOKIE | 2 | 0.5 dnia |
| SREDNIE | 4 | 3-4 dni |
| NISKIE | 2 | 1 dzień |
| **RAZEM** | **17** | **12-17 dni** |

---

## EPIC 1: Nagrywanie 2-sekundowych klipów wideo (WO1 + WF01)

### Issue #1: [EPIC] Nagrywanie 2-sekundowych klipów wideo
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

Implementacja systemu nagrywania 2-sekundowych klipów wideo przypisanych do konkretnych dat.

**Wymagania:**
- Użytkownik nagrywa max 2-sekundowe klipy wideo (nie zdjęcia!)
- Klip przypisany do konkretnej daty
- Zapis w kalendarzu użytkownika
- Podgląd, usunięcie, ponowne nagranie klipu z danego dnia

**Szacowany czas:** 4-5 dni

---

### Issue #2: Implementacja nagrywania wideo (MediaRecorder API)
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

Przepisanie `CameraScreen.js` z robienia zdjęć na nagrywanie wideo.

**Zadania:**
- [ ] Zamiana `getUserMedia` z photo na video
- [ ] Implementacja `MediaRecorder` API
- [ ] Timer 2 sekundy z wizualnym odliczaniem
- [ ] Automatyczne zatrzymanie nagrywania po 2s
- [ ] Podgląd nagranego klipu przed zapisem
- [ ] Przycisk "Nagraj ponownie" / "Zapisz"
- [ ] Obsługa błędów (brak kamery, brak uprawnień)

**Pliki:** `src/screens/CameraScreen.js`, `src/services/storageService.js`

**Szacowany czas:** 1-2 dni

---

### Issue #3: Widok kalendarza z oznaczonymi nagraniami
**Labels:** `priority: critical`, `type: feature`, `area: calendar`, `mvp`

Nowy ekran z kalendarzem pokazującym dni w których użytkownik nagrał klipy.

**Zadania:**
- [ ] Nowy komponent `CalendarScreen.js`
- [ ] Integracja biblioteki kalendarza (`react-calendar`)
- [ ] Pobieranie dat z nagraniami z Firestore
- [ ] Wizualne oznaczenie dni z klipami
- [ ] Kliknięcie na dzień → nagrywanie/podgląd
- [ ] Nawigacja między miesiącami

**Mockup:**
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

**Szacowany czas:** 1-2 dni

---

### Issue #4: Struktura danych Firestore dla klipów wideo
**Labels:** `priority: critical`, `type: infrastructure`, `area: storage`, `mvp`

Nowa kolekcja w Firestore do przechowywania metadanych klipów wideo.

**Struktura:**
```javascript
// Kolekcja: clips
{
  id: "auto-generated",
  userId: "user-uid",
  date: "2026-01-30",           // YYYY-MM-DD
  videoUrl: "https://...",
  thumbnailUrl: "https://...",
  duration: 2000,               // ms
  createdAt: Timestamp,
  updatedAt: Timestamp,
  month: "2026-01",             // Do grupowania
  status: "ready" | "processing" | "error"
}
```

**Storage path:**
```
users/{userId}/clips/{date}/video.webm
users/{userId}/clips/{date}/thumbnail.jpg
users/{userId}/monthly/{month}/compiled.mp4
```

**Nowy serwis:** `src/services/clipService.js`

**Szacowany czas:** 1 dzień

---

### Issue #5: UI podglądu, usuwania i ponownego nagrywania klipu
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

Interfejs do zarządzania nagranym klipem z konkretnego dnia.

**Zadania:**
- [ ] Komponent `ClipViewScreen.js`
- [ ] HTML5 `<video>` player
- [ ] Przycisk "Usuń klip" z potwierdzeniem
- [ ] Przycisk "Nagraj ponownie"
- [ ] Wyświetlanie daty klipu

**Mockup:**
```
┌─────────────────────────────────┐
│  ◀ Powrót     30 Stycznia 2026  │
├─────────────────────────────────┤
│   ┌─────────────────────────┐   │
│   │    [VIDEO PLAYER]       │   │
│   └─────────────────────────┘   │
│                                 │
│   [🗑 Usuń]    [🔄 Nagraj      │
│                   ponownie]    │
└─────────────────────────────────┘
```

**Szacowany czas:** 1 dzień

---

## EPIC 2: Generowanie miesięcznego filmu (WO2 + WF02)

### Issue #6: [EPIC] Automatyczne generowanie miesięcznego filmu
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

System automatycznego łączenia wszystkich klipów z miesiąca w jeden film.

**Wymagania:**
- System łączy wszystkie klipy z miesiąca w jeden film
- Chronologiczna kolejność (1-31 dzień)
- Czas generowania <30 sekund
- Możliwość zapisu lokalnie/chmura/udostępnienia

**Rekomendacja:** ffmpeg.wasm (client-side)

**Szacowany czas:** 3-5 dni

---

### Issue #7: Integracja ffmpeg.wasm do łączenia klipów
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

Implementacja client-side video processing przy użyciu ffmpeg.wasm.

**Instalacja:**
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

**Zadania:**
- [ ] Utworzenie `src/services/videoProcessingService.js`
- [ ] Funkcja pobierająca wszystkie klipy z miesiąca
- [ ] Funkcja łącząca klipy w jeden film
- [ ] Progress callback (0-100%)
- [ ] Obsługa błędów
- [ ] Optymalizacja pamięci

**Przykład:**
```javascript
import { FFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg();

export async function generateMonthlyVideo(clips, onProgress) {
  await ffmpeg.load();
  // ... pobierz i połącz klipy
  return blob;
}
```

**Szacowany czas:** 2-3 dni

---

### Issue #8: UI generowania miesięcznego filmu
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

Interfejs użytkownika do generowania i podglądu miesięcznego filmu.

**Zadania:**
- [ ] Nowy ekran `MonthlyVideoScreen.js`
- [ ] Wybór miesiąca do wygenerowania
- [ ] Podgląd ile klipów jest w danym miesiącu
- [ ] Progress bar podczas generowania
- [ ] Podgląd wygenerowanego filmu
- [ ] Przyciski eksportu

**Mockup:**
```
┌─────────────────────────────────┐
│  Twój film - Styczeń 2026       │
├─────────────────────────────────┤
│   📅 Styczeń 2026               │
│   📹 18 klipów (36 sekund)      │
│                                 │
│   [PROGRESS BAR: 67%]           │
│   Generowanie filmu...          │
│                                 │
│   [VIDEO PREVIEW]               │
│                                 │
│   [💾 Pobierz]  [📤 Udostępnij] │
└─────────────────────────────────┘
```

**Szacowany czas:** 1-2 dni

---

### Issue #9: Eksport i udostępnianie wygenerowanego filmu
**Labels:** `priority: critical`, `type: feature`, `area: video`, `mvp`

Funkcjonalność pobierania i udostępniania wygenerowanego filmu.

**Zadania:**
- [ ] Przycisk "Pobierz" - download
- [ ] Przycisk "Udostępnij" - Web Share API
- [ ] Opcja "Zapisz w chmurze"
- [ ] Generowanie nazwy pliku

**Szacowany czas:** 0.5 dnia

---

## EPIC 3: Autentykacja (I01)

### Issue #10: [EPIC] Firebase Authentication - pełna implementacja
**Labels:** `priority: high`, `type: feature`, `area: auth`, `mvp`

Rozszerzenie istniejącej autentykacji o logowanie przez Google.

**Obecny stan:**
- ✅ Email/password login
- ✅ Email/password registration
- ✅ Password reset
- ❌ Google Sign-In

**Szacowany czas:** 0.5 dnia

---

### Issue #11: Implementacja Google Sign-In
**Labels:** `priority: high`, `type: feature`, `area: auth`, `mvp`

Dodanie możliwości logowania przez konto Google.

**Zadania:**
- [ ] Włączenie Google provider w Firebase Console
- [ ] Przycisk "Zaloguj przez Google"
- [ ] Implementacja `signInWithPopup`
- [ ] Tworzenie profilu dla nowych użytkowników

**Kod:**
```javascript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  // ...
}
```

**Szacowany czas:** 2-4 godziny

---

## Infrastruktura

### Issue #12: Konfiguracja COOP/COEP headers dla ffmpeg.wasm
**Labels:** `priority: critical`, `type: infrastructure`, `mvp`

ffmpeg.wasm wymaga `SharedArrayBuffer` który wymaga odpowiednich headerów.

**firebase.json:**
```json
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
```

**Szacowany czas:** 2-4 godziny

---

### Issue #13: Synchronizacja offline (Service Workers)
**Labels:** `priority: medium`, `type: feature`, `area: storage`, `mvp`

Implementacja podstawowej synchronizacji offline.

**Zadania:**
- [ ] Konfiguracja Service Worker
- [ ] Cache'owanie statycznych zasobów
- [ ] IndexedDB dla pending uploads
- [ ] UI indicator online/offline

**Priorytet:** ŚREDNI - można uprościć dla MVP

**Szacowany czas:** 1-2 dni (pełne) lub 2-4h (basic)

---

## Testowanie i Jakość

### Issue #14: Testy cross-browser
**Labels:** `priority: medium`, `type: enhancement`, `mvp`

Weryfikacja działania na wszystkich przeglądarkach.

**Przeglądarki:**
- [ ] Chrome 90+
- [ ] Firefox 90+
- [ ] Safari 15+
- [ ] Edge 90+

**Funkcje do przetestowania:**
- [ ] Logowanie (email + Google)
- [ ] Nagrywanie wideo (MediaRecorder)
- [ ] Odtwarzanie wideo
- [ ] Generowanie filmu (ffmpeg.wasm)
- [ ] Pobieranie filmu

**Szacowany czas:** 1 dzień

---

### Issue #15: Responsywność mobile web
**Labels:** `priority: medium`, `type: enhancement`, `mvp`

Optymalizacja UI dla urządzeń mobilnych.

**Breakpoints:**
```css
@media (max-width: 480px) { /* Mobile */ }
@media (max-width: 768px) { /* Tablet */ }
@media (min-width: 769px) { /* Desktop */ }
```

**Szacowany czas:** 1 dzień

---

### Issue #16: PWA - instalacja aplikacji na telefon
**Labels:** `priority: medium`, `type: enhancement`

Konfiguracja Progressive Web App.

**Zadania:**
- [ ] manifest.json
- [ ] Ikony aplikacji
- [ ] Service Worker
- [ ] "Add to Home Screen"

**Szacowany czas:** 0.5 dnia

---

## Cleanup

### Issue #17: Usunięcie/refaktor kodu do zdjęć
**Labels:** `priority: low`, `type: enhancement`

Cleanup starego kodu związanego ze zdjęciami.

**Decyzje:**
- [ ] Czy zachowujemy social features?
- [ ] Czy zachowujemy messaging?
- [ ] Czy zachowujemy feed?

**Szacowany czas:** 0.5 dnia

---

## Milestone: MVP v1.0

**Due date:** 2026-03-15

**Opis:** Minimum Viable Product - nagrywanie 2s klipów + generowanie miesięcznego filmu

**Issues:** #1-#15 (krytyczne i wysokie)

---

## Rekomendowana kolejność implementacji

```
Tydzień 1:
├── #2 MediaRecorder API (1-2 dni)
├── #4 Struktura danych (1 dzień)
├── #3 Kalendarz (1-2 dni)
└── #5 UI podglądu (1 dzień)

Tydzień 2:
├── #12 COOP/COEP headers (0.5 dnia)
├── #7 ffmpeg.wasm (2-3 dni)
├── #8 UI generowania filmu (1 dzień)
└── #9 Eksport (0.5 dnia)

Tydzień 3:
├── #11 Google Sign-In (0.5 dnia)
├── #14 Testy cross-browser (1 dzień)
├── #15 Responsywność (1 dzień)
└── Buffer na poprawki (2 dni)
```

**Całkowity czas do MVP: ~12-17 dni roboczych (2.5-3.5 tygodnia)**
