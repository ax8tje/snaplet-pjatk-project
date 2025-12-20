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
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests

## Features (Planned)

- User authentication (Firebase Auth)
- Photo capture with camera
- Photo upload to cloud storage
- Photo feed with real-time updates
- User profiles
- Like and comment on photos

## License

Private - PJATK Project
