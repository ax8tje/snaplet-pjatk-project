# macOS Setup Guide for Android Development

Complete guide to set up and run the Snaplet PJATK Android app on macOS.

## Prerequisites

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js and npm
```bash
# Install Node.js 18+ using Homebrew
brew install node@18

# Verify installation
node --version  # Should be >= 18
npm --version   # Should be >= 9
```

Alternatively, use [nvm](https://github.com/nvm-sh/nvm) for Node version management:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 18
nvm install 18
nvm use 18
```

### 3. Install Java Development Kit (JDK 17+)
Android Gradle Plugin requires Java 17 or higher.

**Option A: Using Homebrew (Recommended)**
```bash
# Install OpenJDK 17
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java -version  # Should show version 17 or higher
```

**Option B: Using Oracle JDK**
Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [Adoptium](https://adoptium.net/)

### 4. Install Android Studio
1. Download [Android Studio](https://developer.android.com/studio)
2. Install Android Studio and follow the setup wizard
3. During setup, ensure you install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### 5. Configure Android SDK

Open Android Studio and install required SDK components:

1. Open Android Studio Settings/Preferences
2. Navigate to **Appearance & Behavior → System Settings → Android SDK**
3. Install the following in **SDK Platforms** tab:
   - Android 13.0 (Tiramisu) - API Level 33
   - Android 14.0 - API Level 34 (if available)

4. In **SDK Tools** tab, ensure these are installed:
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools
   - Intel x86 Emulator Accelerator (HAXM installer) - for Intel Macs
   - Google Play Services

### 6. Set Up Environment Variables

Add these to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Apply changes:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

Verify:
```bash
echo $ANDROID_HOME
# Should output: /Users/YOUR_USERNAME/Library/Android/sdk

adb --version
# Should show Android Debug Bridge version
```

### 7. Install Watchman (Optional but Recommended)
Watchman improves file watching performance:
```bash
brew install watchman
```

### 8. Install CocoaPods (for iOS development)
If you plan to develop for iOS as well:
```bash
sudo gem install cocoapods
```

## Project Setup

### 1. Clone and Install Dependencies
```bash
# Navigate to project directory
cd snaplet-pjatk-project

# Install npm dependencies
npm install
```

### 2. Configure Gradle for macOS

**IMPORTANT**: The project's `android/gradle.properties` file has a Windows Java path configured. You must comment it out:

```bash
# Open gradle.properties
nano android/gradle.properties

# Comment out line 13:
# org.gradle.java.home=C\:\\Program Files\\Java\\jdk-19

# Save and exit (Ctrl+X, Y, Enter)
```

Gradle will automatically use your system Java installation.

### 3. Set Up Firebase Configuration

This app uses Firebase. You need to add your Firebase configuration:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add an Android app to your Firebase project
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### 4. Create or Start Android Emulator

**Option A: Using Android Studio**
1. Open Android Studio
2. Go to **Tools → Device Manager** (or AVD Manager)
3. Click **Create Device**
4. Select a device (e.g., Pixel 5)
5. Download and select a system image (e.g., Android 13 - API 33)
6. Click **Finish**
7. Start the emulator by clicking the play button

**Option B: Using Command Line**
```bash
# List available devices
emulator -list-avds

# Start an emulator
emulator -avd <device_name> &
```

**Option C: Create new AVD via command line**
```bash
# List available system images
sdkmanager --list | grep system-images

# Download Android 13 system image (if not already installed)
sdkmanager "system-images;android-33;google_apis;arm64-v8a"

# Create AVD
avdmanager create avd -n Pixel_5_API_33 -k "system-images;android-33;google_apis;arm64-v8a" -d "pixel_5"

# Start the emulator
emulator -avd Pixel_5_API_33 &
```

### 5. Verify Device Connection
```bash
# List connected devices/emulators
adb devices

# Should show something like:
# List of devices attached
# emulator-5554   device
```

## Running the Android App

### Step 1: Start Metro Bundler
**IMPORTANT**: Always start Metro bundler first in a separate terminal:

```bash
# Start Metro bundler
npm start

# Or with cache reset if you have issues
npm run start:reset
```

Wait until you see:
```
Welcome to Metro v...
```

### Step 2: Run the App
In a **NEW terminal window**, run:

```bash
npm run android
```

The app will build and install on your emulator/device.

## Development Workflow

Keep two terminal windows open:
- **Terminal 1**: Metro bundler (`npm start`) - Keep this running
- **Terminal 2**: Build commands (`npm run android`, `npm run lint`, etc.)

### Hot Reload
- Save any file in `src/` to see changes automatically
- Press `R` twice in Metro terminal to manually reload
- Shake device or press `Cmd+M` to open React Native dev menu

## Troubleshooting

### "Unable to load script" Error
See [STARTUP_TROUBLESHOOTING.md](STARTUP_TROUBLESHOOTING.md) for detailed solutions.

**Quick fix:**
1. Ensure Metro is running first: `npm start`
2. Wait for Metro to fully load
3. In new terminal: `npm run android`

### Java Version Error
If you see: `Android Gradle plugin requires Java 17 to run`

1. Check your Java version:
```bash
java -version
```

2. If it's below 17, install Java 17+ (see Prerequisites above)

3. Ensure line 13 in `android/gradle.properties` is commented out:
```properties
# org.gradle.java.home=C\:\\Program Files\\Java\\jdk-19
```

### Emulator Not Detected
```bash
# Restart adb
adb kill-server
adb start-server

# List devices
adb devices
```

### Build Failures
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm start
# In new terminal:
npm run android
```

### Port 8081 Already in Use
```bash
# Find and kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
npm start -- --port 8082
```

### Gradle Daemon Issues
```bash
cd android
./gradlew --stop
cd ..
npm run android
```

### Camera Permissions Not Working
Ensure permissions are added in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### React Native Vision Camera Build Issues
The project includes automatic patches via `patch-package`. If you still have issues:

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

## Useful Commands

```bash
# Development
npm start                    # Start Metro bundler
npm run android              # Run on Android
npm run start:reset          # Start Metro with cache reset

# Build & Clean
npm run android:clean        # Clean Android build
npm run android:build        # Build APK

# Code Quality
npm run lint                 # Run ESLint
npm run format               # Format code with Prettier
npm run type-check           # TypeScript type checking
npm test                     # Run tests

# Android Specific
cd android && ./gradlew clean        # Clean build
adb devices                          # List connected devices
adb logcat                           # View Android logs
adb reverse tcp:8081 tcp:8081        # Reverse port for device debugging
```

## Performance Tips

### Speed up builds:
1. Enable Gradle daemon (already configured in `gradle.properties`)
2. Increase Gradle memory:
   ```properties
   org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
   ```
3. Use `--no-build-cache` flag if cache causes issues
4. Close Android Studio while running builds from CLI

### Reduce emulator resource usage:
```bash
# Start emulator with less RAM
emulator -avd Pixel_5_API_33 -memory 2048 &
```

## Silicon Mac (M1/M2/M3) Specific Notes

### Rosetta for Intel-based tools:
Some tools may require Rosetta:
```bash
softwareupdate --install-rosetta
```

### Use ARM64 system images:
When creating AVDs, prefer ARM64 images for better performance:
```bash
sdkmanager "system-images;android-33;google_apis;arm64-v8a"
```

### Android Emulator Performance:
ARM-based emulators run natively on Apple Silicon for better performance. Intel-based images require emulation and will be slower.

## Next Steps

1. Configure Firebase (see [README.md](README.md#firebase-setup))
2. Set up camera permissions
3. Start developing!

For iOS development setup, see the main [README.md](README.md).

## Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Download](https://developer.android.com/studio)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Firebase Console](https://console.firebase.google.com)
