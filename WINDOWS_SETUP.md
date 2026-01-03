# Windows 11 Setup Guide

This guide will help you set up and run the Snaplet PJATK React Native application on Windows 11.

> **Quick Start**: If you prefer a checklist format, see [WINDOWS_QUICKSTART.md](WINDOWS_QUICKSTART.md) for a step-by-step checklist.

## Prerequisites

### 1. Install Node.js and npm

1. Download Node.js 18 or higher from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
```bash
node --version  # Should be >= 18
npm --version   # Should be >= 9
```

### 2. Install Git

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Install with default settings
3. Verify installation:
```bash
git --version
```

### 3. Install Java Development Kit (JDK)

React Native requires JDK 17:

1. Download Microsoft Build of OpenJDK 17 from [Microsoft's website](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17)
2. Install the MSI package
3. Verify installation:
```bash
java -version  # Should show version 17.x
```

### 4. Install Android Studio

1. Download Android Studio from [developer.android.com/studio](https://developer.android.com/studio)
2. Run the installer and choose "Custom" installation
3. Make sure the following components are selected:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device
   - Android SDK Build-Tools
   - Android Emulator

#### Configure Android SDK

1. Open Android Studio
2. Click "More Actions" → "SDK Manager"
3. In "SDK Platforms" tab, install:
   - Android 14.0 (API Level 34) - check "Show Package Details" to select:
     - Android SDK Platform 34
     - Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image
4. In "SDK Tools" tab, install:
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools
   - Android SDK Tools
   - Intel x86 Emulator Accelerator (HAXM installer) if using Intel CPU

#### Set Environment Variables

Add these environment variables (search for "Environment Variables" in Windows Start menu):

1. **ANDROID_HOME**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

2. **Add to PATH**:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

3. **Verify** (restart Command Prompt/PowerShell after setting):
```bash
adb --version
```

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd snaplet-pjatk-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or select your project
3. Add an Android app to your Firebase project
4. Download `google-services.json`
5. Place it in: `android/app/google-services.json`

## Running the Application

### 1. Start Metro Bundler

Open a terminal and run:
```bash
npm start
```

Keep this terminal open - Metro bundler needs to run continuously.

### 2. Start Android Emulator

**Option A: Using Android Studio**
1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Create a new device if needed (recommended: Pixel 5, API 34)
4. Click the "Play" button to start the emulator

**Option B: Using Command Line**
```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd Pixel_5_API_34
```

### 3. Run the App

In a new terminal (keep Metro bundler running):
```bash
npm run android
```

The app should build and launch on your emulator.

## Common Issues and Solutions

### Issue: "SDK location not found"

**Solution**: Make sure `ANDROID_HOME` environment variable is set correctly:
```bash
echo %ANDROID_HOME%
# Should output: C:\Users\YourUsername\AppData\Local\Android\Sdk
```

### Issue: "adb: command not found"

**Solution**:
1. Verify PATH includes `%ANDROID_HOME%\platform-tools`
2. Restart your terminal/PowerShell
3. If still not working, use full path:
```bash
C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

### Issue: Emulator won't start

**Solution**:
1. Enable Hyper-V and Windows Hypervisor Platform:
   - Open "Turn Windows features on or off"
   - Enable "Hyper-V" and "Windows Hypervisor Platform"
   - Restart your computer
2. Ensure virtualization is enabled in BIOS
3. Try using Android Studio's Device Manager instead of command line

### Issue: Build fails with "Execution failed for task ':app:mergeDebugAssets'"

**Solution**: Clean and rebuild:
```bash
cd android
gradlew clean
cd ..
npm run android
```

### Issue: Metro bundler connection issues

**Solution**:
1. Make sure Windows Firewall allows Node.js
2. Try resetting Metro cache:
```bash
npm start -- --reset-cache
```

### Issue: "Unable to load script. Make sure you're running a Metro server"

**Solution**:
1. Ensure Metro bundler is running (`npm start`)
2. In emulator, go to Settings → Developer Options → ensure "USB debugging" is enabled
3. Restart Metro bundler and try again

### Issue: Slow build times

**Solution**:
1. Add exclusions to Windows Defender for:
   - Your project directory
   - `node_modules` folder
   - Android SDK directory
2. Enable Gradle daemon by creating/editing `android/gradle.properties`:
```properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

## Development Commands

```bash
# Start Metro bundler
npm start

# Run on Android emulator/device
npm run android

# Run linter
npm run lint

# Format code
npm run format

# Type checking
npm run type-check

# Run tests
npm test
```

## Using Windows Subsystem for Linux (WSL) - Alternative Approach

If you prefer a Linux-like environment:

1. Install WSL2 with Ubuntu:
```bash
wsl --install
```

2. Follow standard Linux setup instructions inside WSL
3. Use Android Studio and emulator from Windows
4. Run development commands from WSL terminal

**Note**: This is an advanced setup and may have additional complexity with file system performance and device access.

## Tips for Windows Development

1. **Use Windows Terminal** (available from Microsoft Store) for better terminal experience
2. **Disable antivirus scanning** for `node_modules` and build folders to improve performance
3. **Use PowerShell or Command Prompt as Administrator** when installing global npm packages
4. **Keep Android Studio updated** for the latest emulator improvements
5. **Use SSD storage** for better build performance

## Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup?platform=android&os=windows)
- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

## Troubleshooting Checklist

If the app won't run, verify:

- [ ] Node.js version >= 18
- [ ] Java version = 17
- [ ] ANDROID_HOME environment variable is set
- [ ] Platform-tools added to PATH
- [ ] Android SDK installed (API Level 34)
- [ ] Emulator is running
- [ ] Metro bundler is running
- [ ] `google-services.json` is in `android/app/`
- [ ] `npm install` completed successfully

## Getting Help

If you encounter issues not covered here:

1. Check the main [README.md](README.md) for general project information
2. Search for similar issues on [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
3. Check [React Native GitHub Issues](https://github.com/facebook/react-native/issues)
