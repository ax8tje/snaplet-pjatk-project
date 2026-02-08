# Cheat Sheet - Struktura repozytorium

## Tech Stack

| Technologia | Wersja | Rola |
|---|---|---|
| React Native | 0.74 | Framework mobilny |
| Expo | 54 | Tooling mobilny |
| React Native Web | 0.21 | Wsparcie web |
| TypeScript | 5.3 | Typowanie |
| Firebase | 12.8 | Backend (Auth, Firestore, Storage) |
| Zustand | 4.4 | State management |
| React Navigation | 6.x | Nawigacja mobilna |
| React Router DOM | 7.x | Nawigacja web |
| Vision Camera | 4.7 | Kamera (foto/wideo) |
| FFmpeg.js | 0.12 | Przetwarzanie wideo |
| Webpack | 5.x | Bundler web |
| Jest / Mocha | 29 / 11 | Testy |

---

## Struktura katalogów

```
snaplet-pjatk-project/
│
├── src/                        # ---- CALY KOD ZRODLOWY ----
│   ├── screens/                # Ekrany / strony aplikacji
│   ├── components/             # Komponenty wielokrotnego uzytku
│   ├── services/               # Logika biznesowa, integracja z Firebase
│   ├── store/                  # Stan globalny (Zustand)
│   ├── navigation/             # Konfiguracja nawigacji
│   ├── types/                  # Definicje typow TypeScript
│   ├── config/                 # Konfiguracja (Firebase web)
│   ├── utils/                  # Funkcje pomocnicze
│   ├── mocks/                  # Mocki do testow
│   └── firebase.ts             # Inicjalizacja Firebase
│
├── android/                    # Kod natywny Android (Gradle)
├── public/                     # Statyczne pliki web (HTML, SW)
├── assets/                     # Grafiki, ikony
├── tests/                      # Testy integracyjne
├── scripts/                    # Skrypty buildowe
└── project-planning/           # Dokumenty planowania
```

---

## Ekrany (`src/screens/`)

| Plik | Co robi |
|---|---|
| `WelcomeScreen.tsx` | Ekran powitalny - przekierowanie do logowania/rejestracji |
| `LoginScreen.tsx` | Logowanie (email/haslo) |
| `RegisterScreen.tsx` | Rejestracja nowego uzytkownika |
| `HomeScreen.js` | Glowny feed - lista postow (zdjecia/filmy) |
| `ProfileScreen.js` | Profil uzytkownika - posty, info, edycja |
| `CameraScreen.js` | Robienie zdjec i nagrywanie wideo |
| `MessagesScreen.js` | Lista konwersacji (DM) |
| `ChatScreen.js` | Pojedynczy czat z uzytkownikiem |
| `PostDetailScreen.js` | Szczegoly posta - komentarze, lajki |
| `CalendarScreen.js` | Kalendarz - klipy wideo po datach |
| `MonthlyVideoScreen.js` | Kompilacja wideo z danego miesiaca |
| `FriendsScreen.js` | Lista znajomych i zaproszenia |
| `SettingsScreen.js` | Ustawienia aplikacji |

---

## Komponenty (`src/components/`)

| Plik | Co robi |
|---|---|
| `Button.tsx` | Uniwersalny przycisk (primary/secondary) |
| `Input.tsx` | Pole tekstowe z walidacja |
| `OnlineStatus.tsx` | Wskaznik statusu online uzytkownika |
| `BottomNav.js` | Dolna nawigacja (tylko web) |

---

## Serwisy (`src/services/`) - logika biznesowa

| Plik | Co robi |
|---|---|
| `authService.js` | Logowanie, rejestracja, wylogowanie, reset hasla (Firebase Auth) |
| `userService.js` | Profile uzytkownikow - tworzenie, pobieranie, aktualizacja, szukanie |
| `postService.js` | CRUD postow, paginacja feedu |
| `commentService.js` | Dodawanie, pobieranie, usuwanie komentarzy |
| `likeService.js` | Lajkowanie/odlubienie postow |
| `messageService.js` | Wysylanie wiadomosci, historia czatu, konwersacje |
| `friendService.js` | Zaproszenia do znajomych, akceptacja, usuwanie |
| `storageService.js` | Upload plikow do Firebase Storage, kompresja obrazow |
| `clipService.js` | Metadane klipow wideo (zapis, pobieranie po dacie/miesiacu) |
| `videoProcessingService.js` | Przetwarzanie wideo FFmpeg (kompresja, miniatury) |
| `firestoreService.js` | Generyczne operacje CRUD na Firestore |
| `googleAuth.ts` | Logowanie przez Google OAuth |
| `offlinePostExample.ts` | Przyklad tworzenia postu offline |

---

## Store (`src/store/`) - stan globalny (Zustand)

| Plik | Co robi |
|---|---|
| `userStore.ts` | Stan autentykacji, dane usera, login/logout/register |
| `feedStore.ts` | Lista postow, tworzenie postow, paginacja |
| `messageStore.ts` | Konwersacje, wiadomosci, real-time subskrypcje |

---

## Nawigacja (`src/navigation/`)

| Plik | Co robi |
|---|---|
| `index.tsx` | Root navigator - sprawdza czy user zalogowany |
| `AuthNavigator.tsx` | Stos autentykacji: Welcome → Login → Register |
| `MainTabNavigator.tsx` | 6 zakladek po zalogowaniu (Profile, Friends, Camera, Calendar, Messages, Home) |
| `HomeStackNavigator.tsx` | Stos Home: feed → szczegoly posta → wideo |
| `ProfileStackNavigator.tsx` | Stos profilu: profil → edycja → ustawienia |
| `MessagesStackNavigator.tsx` | Stos wiadomosci: lista → czat |

---

## Pliki konfiguracyjne (root)

| Plik | Co robi |
|---|---|
| `App.tsx` | Entry point React Native - opakowuje app w providery |
| `index.web.js` | Entry point Web - React Router + routing SPA |
| `app.json` | Konfiguracja Expo (nazwa, ikona, splash) |
| `package.json` | Zależności, skrypty npm |
| `tsconfig.json` | Konfiguracja TypeScript + aliasy sciezek (@screens/*, @services/* itd.) |
| `webpack.config.js` | Bundler webowy - aliasy, loadery, output do `dist/` |
| `babel.config.js` | Transpilacja JS (presety Expo, aliasy modulow) |
| `jest.config.js` | Konfiguracja testow jednostkowych |
| `metro.config.js` | Bundler React Native |
| `.eslintrc.js` | Reguly ESLint |
| `firebase.json` | Deployment Firebase Hosting + emulatory |
| `firestore.rules` | Reguly bezpieczenstwa Firestore (kto co moze czytac/pisac) |
| `storage.rules` | Reguly bezpieczenstwa Firebase Storage |
| `.firebaserc` | ID projektu Firebase |
| `cors.json` | Konfiguracja CORS |
| `.gitignore` | Pliki ignorowane przez git |

---

## Pliki webowe (`public/`)

| Plik | Co robi |
|---|---|
| `index.html` | Glowny HTML dla wersji web |
| `service-worker.js` | Service Worker (PWA - offline, cache) |
| `video-processor.html` | Worker do przetwarzania wideo w przegladarce |
| `figma/` | Assety z designu Figma |

---

## Baza danych (Firestore) - kolekcje

| Kolekcja | Klucz dokumentu | Co przechowuje |
|---|---|---|
| `users` | `userId` | Profil: email, displayName, photoURL, bio, postCount |
| `posts` | auto-ID | Post: userId, imageUrl, videoUrl, caption, likes, commentCount |
| `comments` | auto-ID | Komentarz: postId, userId, text |
| `likes` | `postId_userId` | Kto polajkowal jaki post |
| `messages` | auto-ID | Wiadomosc: senderId, receiverId, text, read |
| `friends` | `userId_friendId` | Relacja znajomosci |
| `friendRequests` | `senderId_receiverId` | Zaproszenie: status pending/accepted |
| `clips` | `userId_date` | Klip wideo: videoUrl, thumbnailUrl, duration, status |

---

## Skrypty npm

| Komenda | Co robi |
|---|---|
| `npm start` | Metro bundler (dev mobilny) |
| `npm run android` | Uruchom na Androidzie |
| `npm run ios` | Uruchom na iOS |
| `npm run web` | Dev server webowy (port 8080) |
| `npm run web:build` | Build produkcyjny web → `dist/` |
| `npm run deploy` | Build + deploy na Firebase Hosting |
| `npm run lint` | Sprawdz kod ESLintem |
| `npm run format` | Formatuj kod Prettierem |
| `npm test` | Testy jednostkowe (Jest) |
| `npm run test:rules` | Testy regul Firestore |

---

## Aliasy sciezek (TypeScript / Webpack)

```
@screens/*     → src/screens/*
@components/*  → src/components/*
@services/*    → src/services/*
@navigation/*  → src/navigation/*
@store/*       → src/store/*
@types/*       → src/types/*
@utils/*       → src/utils/*
```

---

## Przeplyw nawigacji

```
App Start
  │
  ├─ Niezalogowany → AuthNavigator
  │     Welcome → Login / Register
  │
  └─ Zalogowany → MainTabNavigator (6 zakladek)
        ├── Profile  → Edycja, Ustawienia, Prywatnosc, Pomoc
        ├── Friends  → Lista znajomych, Zaproszenia
        ├── Camera   → Zdjecie / Wideo
        ├── Calendar → Klipy po dacie, Wideo miesieczne
        ├── Messages → Lista konwersacji → Czat
        └── Home     → Feed → Szczegoly posta → Komentarze
```
