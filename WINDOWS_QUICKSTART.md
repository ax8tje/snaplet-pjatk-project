# Windows 11 Quick Start Checklist

Use this checklist to quickly verify your Windows 11 setup before running the app.

## Prerequisites Checklist

### Step 1: Install Required Software

- [ ] **Node.js 18+** installed
  ```bash
  node --version
  # Expected: v18.x.x or higher
  ```

- [ ] **npm 9+** installed (comes with Node.js)
  ```bash
  npm --version
  # Expected: 9.x.x or higher
  ```

- [ ] **Java JDK 17** installed
  ```bash
  java -version
  # Expected: openjdk version "17.x.x"
  ```

- [ ] **Git** installed
  ```bash
  git --version
  ```

- [ ] **Android Studio** installed

### Step 2: Configure Android SDK

- [ ] Android Studio opened at least once
- [ ] Android SDK installed (check in SDK Manager)
- [ ] Android SDK Platform 34 installed
- [ ] Android SDK Build-Tools 34.0.0 installed
- [ ] Android Emulator installed
- [ ] At least one AVD (Android Virtual Device) created

### Step 3: Set Environment Variables

- [ ] `ANDROID_HOME` environment variable set to:
  ```
  C:\Users\YourUsername\AppData\Local\Android\Sdk
  ```

- [ ] Added to PATH:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`
  - `%ANDROID_HOME%\tools`
  - `%ANDROID_HOME%\tools\bin`

- [ ] Verify PATH is working:
  ```bash
  adb --version
  # Should show Android Debug Bridge version
  ```

### Step 4: Enable Virtualization

- [ ] Hyper-V enabled in Windows Features
- [ ] Windows Hypervisor Platform enabled in Windows Features
- [ ] Computer restarted after enabling these features
- [ ] Virtualization enabled in BIOS/UEFI (check your PC manufacturer's documentation)

## Project Setup Checklist

### Step 5: Clone and Install

- [ ] Repository cloned
  ```bash
  git clone <repository-url>
  cd snaplet-pjatk-project
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  ```

- [ ] Installation completed without errors

### Step 6: Firebase Configuration

- [ ] Firebase project created at https://console.firebase.google.com
- [ ] Android app added to Firebase project
- [ ] `google-services.json` downloaded
- [ ] `google-services.json` placed in `android/app/` folder

## Running the App Checklist

### Step 7: Start Development Environment

- [ ] **Terminal 1**: Metro bundler started
  ```bash
  npm start
  ```
  Metro bundler should show "Metro is ready"

- [ ] **Android Emulator**: Started via Android Studio or command line
  ```bash
  # List available emulators
  emulator -list-avds

  # Start your emulator
  emulator -avd Pixel_5_API_34
  ```
  Wait for emulator to fully boot (shows home screen)

- [ ] **Terminal 2**: App running
  ```bash
  npm run android
  ```
  App should build and launch on emulator

### Step 8: Verify App is Running

- [ ] Metro bundler shows "Loading bundle 100%"
- [ ] App appears on emulator screen
- [ ] No errors in terminal
- [ ] App is interactive and responsive

## Troubleshooting Quick Fixes

If something doesn't work, try these in order:

### Fix 1: Clean and Restart
```bash
# Stop Metro bundler (Ctrl+C in Terminal 1)
# Close emulator
# Then run:
npm start -- --reset-cache
```

### Fix 2: Clean Android Build
```bash
npm run android:clean
npm run android
```

### Fix 3: Restart ADB
```bash
adb kill-server
adb start-server
adb devices
```

### Fix 4: Check Firewall
- Make sure Windows Firewall allows Node.js
- Make sure Windows Firewall allows adb.exe

### Fix 5: Full Reset
```bash
# Stop all processes
# Close Android Studio and emulator
cd android
gradlew clean
cd ..
npm start -- --reset-cache
# In new terminal:
npm run android
```

## Performance Optimization Checklist

For better development experience:

- [ ] Added Windows Defender exclusions for:
  - Project folder
  - `node_modules` folder
  - Android SDK folder (`C:\Users\YourUsername\AppData\Local\Android\Sdk`)

- [ ] Gradle daemon enabled (already configured in this project)

- [ ] Using SSD for project storage (not HDD)

- [ ] At least 8GB RAM available for development

## Common Commands Reference

```bash
# Start Metro bundler
npm start

# Start with cache reset
npm start -- --reset-cache

# Run on Android
npm run android

# Clean Android build
npm run android:clean

# Build Android APK
npm run android:build

# Check what devices are connected
adb devices

# View device logs
adb logcat

# Restart Metro bundler
# Press 'R' in Metro terminal or shake device and tap "Reload"

# Open developer menu in emulator
# Press Ctrl+M (Windows) or Cmd+M (Mac)
```

## Need More Help?

- [ ] Read detailed guide: [WINDOWS_SETUP.md](WINDOWS_SETUP.md)
- [ ] Read project README: [README.md](README.md)
- [ ] Check React Native docs: https://reactnative.dev/docs/environment-setup

## Success! 🎉

If all checkboxes are marked and the app is running, you're ready to develop!

---

**Pro Tip**: Keep the Metro bundler terminal open while developing. It needs to run continuously for the app to work.
