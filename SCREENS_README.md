# Snaplet App Screens

This document describes all the screens that have been created for the Snaplet application.

## Overview

All screens have been created based on the provided design mockups. The application includes authentication screens, main app screens, and various settings screens.

## Screen Structure

### Authentication Screens
- **WelcomeScreen** - Initial landing page with social login options
- **LoginScreen** - Email/password login screen
- **RegisterScreen** - User registration screen

### Main Application Screens

#### Bottom Tab Navigation
The main app uses a bottom tab navigator with 5 tabs:
1. **Profile** - User profile and settings
2. **Friends** - Friends list
3. **Camera** - Video recording (center button)
4. **Messages** - Chat and messaging
5. **Home** - Main feed with snaplets grid

#### Home Stack
- **HomeScreen** - Main feed with grid of snaplets and processing videos
- **VideoViewScreen** - Full-screen video playback with "For you"/"Friends" tabs
- **SearchScreen** - Search for users and videos

#### Messages Stack
- **MessagesScreen** - List of conversations with tabs (All chats/Groups/Contacts)
- **ChatScreen** - Individual chat conversation

#### Profile Stack
- **ProfileScreen** - User profile with snaplets organized by month
- **SettingsScreen** - Settings menu with search
- **EditProfileScreen** - Edit user profile information
- **NotificationsScreen** - Notification preferences
- **AppearanceScreen** - Theme selection (Light/Dark/Auto)
- **PrivacyScreen** - Privacy and security settings
- **HelpScreen** - Help center and support
- **AboutScreen** - App information and version

#### Other Screens
- **FriendsScreen** - Browse and search friends
- **CameraScreen** - Camera interface for recording snaplets

## Navigation Structure

```
RootNavigator
├── Auth Stack (if not authenticated)
│   ├── Welcome
│   ├── Login
│   └── Register
│
└── Main Tab Navigator (if authenticated)
    ├── Profile Tab
    │   └── Profile Stack
    │       ├── ProfileMain
    │       ├── Settings
    │       ├── EditProfile
    │       ├── Notifications
    │       ├── Appearance
    │       ├── Privacy
    │       ├── Help
    │       └── About
    │
    ├── Friends Tab
    │   └── FriendsScreen
    │
    ├── Camera Tab
    │   └── CameraScreen
    │
    ├── Messages Tab
    │   └── Messages Stack
    │       ├── MessagesList
    │       └── Chat
    │
    └── Home Tab
        └── Home Stack
            ├── HomeFeed
            ├── VideoView
            └── Search
```

## Design Features

### Color Scheme
- Primary Background: `#F5E6D3` (Beige/Cream)
- Secondary Background: `#D4C4A8` (Darker Beige)
- Dark Accent: `#3E2723` (Dark Brown)
- Light Accent: `#FFFFFF` (White)
- Text: `#000000` (Black)

### Common Components
- **Button** - Reusable button component with variants (primary, outline, social)
- **Input** - Reusable text input component with icon support

## Image Assets

**Important Note:** The screens reference `require('../../assets/placeholder.png')` for images. You need to add actual image assets to the `/assets` folder:

- `placeholder.png` - Used as a placeholder for various images (profile pictures, video thumbnails, etc.)

To add real images, place PNG files in the `/assets` folder and update the require paths in the screens.

## Testing the Screens

To view the main app screens instead of the authentication flow, change the `isAuthenticated` state in `/src/navigation/index.tsx`:

```typescript
const [isAuthenticated] = useState(true); // Change to true to see main app
```

## Implementation Status

✅ All screens created
✅ Navigation structure implemented
✅ Type definitions complete
✅ Basic styling applied based on mockups

## Next Steps

1. Add real image assets to `/assets` folder
2. Implement actual camera functionality using `react-native-vision-camera`
3. Connect to Firebase for authentication and data storage
4. Add video playback functionality
5. Implement actual data models and API integration
6. Add loading states and error handling
7. Implement push notifications
8. Add animations and transitions

## Development Notes

- All screens are TypeScript-based React Native components
- Navigation uses React Navigation v6
- Bottom tabs use `@react-navigation/bottom-tabs`
- Stack navigation uses `@react-navigation/native-stack`
- Components follow React Native best practices
- Styles use StyleSheet.create for optimization
