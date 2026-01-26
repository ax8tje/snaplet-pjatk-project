# Snaplet PJATK

React Native photo sharing application built with TypeScript.

## Technology Stack

- **React Native**: 0.74.0
- **TypeScript**: 5.3+
- **State Management**: Zustand
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Backend Services**: Firebase (Auth, Firestore, Storage)
- **Camera**: React Native Vision Camera

## Project Structure

```
snaplet-pjatk/
├── src/
│   ├── screens/       # Screen components
│   ├── components/    # Reusable UI components
│   ├── services/      # Business logic & API services
│   ├── navigation/    # Navigation configuration
│   ├── store/         # Zustand state management
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions & helpers
├── App.tsx            # Application entry point
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

## Setup Instructions

### Prerequisites

- Node.js >= 18
- npm >= 9
- React Native development environment configured

### Platform-Specific Setup Guides

- **Windows 11**: See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows 11 setup instructions
- **macOS/Linux**: Follow the instructions below
- **Java Configuration**: The project requires Java 17+. See [STARTUP_TROUBLESHOOTING.md](STARTUP_TROUBLESHOOTING.md#platform-specific-notes) for platform-specific Java configuration

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

### Configuration

#### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add Android and iOS apps to your Firebase project
3. Download and add configuration files:
   - Android: `google-services.json` → `android/app/`
   - iOS: `GoogleService-Info.plist` → `ios/`

#### Camera Permissions

Add camera permissions to your app:

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

**iOS** (`ios/SnapletPjatk/Info.plist`):
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos</string>
```

## Development

### Run the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run ios:clean` - Clean iOS Pods and reinstall (fixes build issues)
- `npm run ios:pod-install` - Reinstall iOS Pods
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests

## Troubleshooting

### Startup Issues - "Unable to load script" Error

If you see a red error screen when starting the app, see **[STARTUP_TROUBLESHOOTING.md](STARTUP_TROUBLESHOOTING.md)** for detailed solutions.

**Quick fix:**
1. Start Metro bundler first: `npm start`
2. Wait for Metro to load
3. In a new terminal, run: `npm run android`

### Java Version Error - "Requires Java 17"

If you see `Android Gradle plugin requires Java 17 to run. You are currently using Java 11`:

**Windows:**
- The project is pre-configured for Java 19 at `C:\Program Files\Java\jdk-19`
- If your Java is elsewhere, update `android/gradle.properties` line 13

**Linux/macOS:**
- Comment out line 13 in `android/gradle.properties`
- Ensure your system Java is version 17+

See **[STARTUP_TROUBLESHOOTING.md](STARTUP_TROUBLESHOOTING.md#platform-specific-notes)** for detailed instructions.

### Android Vision Camera Build Issues

If you encounter compilation errors related to `react-native-vision-camera`:

```
This API is provided only for React Native frameworks and not intended for general users
```

**Solution:** The project includes a `patch-package` patch that automatically fixes these issues. The patch will be applied when you run `npm install`.

**What the patch does:**
- Adds file-level suppression for internal framework API usage
- Configures kotlinOptions with proper JVM target and opt-in flags
- Forces React Native 0.74.0 version to prevent version mismatches

If build still fails after `npm install`:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Issues

If you encounter Hermes build script errors like:
```
PhaseScriptExecution [CP-User] [Hermes] Replace Hermes for the right configuration
```

**Solution:**
1. Clean and reinstall pods:
```bash
npm run ios:clean
```

2. If the issue persists, manually clean Xcode build cache:
```bash
cd ios
rm -rf ~/Library/Developer/Xcode/DerivedData
pod deintegrate
pod install
cd ..
```

**Note:** Hermes engine is currently disabled in this project to prevent build errors. The app uses JavaScriptCore instead.

### App Registration Error

If you see:
```
"SnapletTemp" has not been registered
```

**Solution:** This was fixed by updating `MainActivity.kt` to use the correct app name `"SnapletPjatk"` matching `app.json`.

## Features (Planned)

- User authentication (Firebase Auth)
- Photo capture with camera
- Photo upload to cloud storage
- Photo feed with real-time updates
- User profiles
- Like and comment on photos

====================================================

# Snaplet PJATK – Firebase Setup

Projekt wykorzystuje **Firebase** jako backend do:
- uwierzytelniania użytkowników (Firebase Authentication),
- przechowywania danych (Cloud Firestore).

Konfiguracja Firebase została wykonana zgodnie z dobrymi praktykami bezpieczeństwa – dane konfiguracyjne nie są przechowywane bezpośrednio w kodzie ani w repozytorium.

---

## 🔥 Firebase Configuration

Aplikacja korzysta z **Firebase Web SDK**. Dane dostępowe ładowane są z pliku `.env`, który jest wstrzykiwany do aplikacji przez Webpack (`dotenv-webpack`).

### Używane usługi Firebase:
- ✅ Firebase Authentication (Email / Password)
- ✅ Cloud Firestore
- ✅ Firebase Web App

---

## ⚙️ Konfiguracja lokalna

### 1️⃣ Przygotowanie pliku `.env`
1. Skopiuj plik:
.env.example
i zmień jego nazwę na:
.env
2. Uzupełnij wartości na podstawie:
Firebase Console → Project settings (⚙️) → Your apps → Web → SDK setup and configuration

Przykład:
```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

⚠️ Plik .env jest prywatny i nie jest commitowany do repozytorium.

Instalacja zależności:
npm install

Uruchomienie wersji web (development)

npm run web
``
Aplikacja uruchomi się lokalnie przy użyciu webpack-dev-server (localhost).

Bezpieczeństwo

Dane konfiguracyjne Firebase nie są przechowywane w repozytorium.
Plik .env jest ignorowany przez .gitignore.
Bezpieczeństwo dostępu do danych zapewniają reguły Firebase Authentication oraz Cloud Firestore.
====================================================

## Authentication Service

Projekt posiada warstwę serwisową do obsługi autoryzacji użytkowników,
opartą o Firebase Authentication.

Plik: `src/services/authService.js`

Obsługiwane funkcje:
- Rejestracja użytkownika
- Logowanie / wylogowanie
- Reset hasła
- Aktualizacja profilu
- Nasłuchiwanie zmian stanu autoryzacji

====================================================
## License

Private - PJATK Project
