# Startup Troubleshooting Guide

## Common Issue: "Unable to load script" Error

If you see a red error screen with the message:
```
Unable to load script. Make sure you're either running Metro (run 'npx react-native start')
or that your bundle 'index.android.bundle' is packaged correctly for release.
```

This means the app cannot find the JavaScript bundle. Follow these steps to fix it:

## Solution: Proper Startup Sequence

### Step 1: Clean Previous Builds
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Or use the npm script
npm run android:clean
```

### Step 2: Start Metro Bundler First
**IMPORTANT**: You must start Metro bundler BEFORE running the app.

```bash
# Start Metro bundler in one terminal
npm start

# Or with cache reset if you have issues
npm run start:reset
```

Wait until you see:
```
Welcome to Metro v...
```

### Step 3: Run the App (in a new terminal)
**Only after Metro is running**, run the app:

```bash
# In a NEW terminal window/tab
npm run android
```

## Additional Fixes Applied

### 1. Network Security Configuration
Added network security config to allow Metro bundler connection on localhost.
- File: `android/app/src/main/res/xml/network_security_config.xml`
- Allows cleartext traffic to localhost and emulator IPs

### 2. Gradle Configuration
Fixed platform-specific Java path in `gradle.properties`:
- Removed Windows-specific `org.gradle.java.home` setting
- Now uses system default Java installation

## Platform-Specific Notes

### Linux/macOS
The fixes applied should work out of the box.

### Windows
If you're on Windows, you may need to uncomment and set the Java path in `android/gradle.properties`:
```properties
org.gradle.java.home=C\:\\Program Files\\Java\\jdk-19
```
(Adjust the path to match your Java installation)

## Still Having Issues?

### Check Metro Bundler is Running
- Metro should be running on http://localhost:8081
- Open http://localhost:8081/status in your browser
- You should see: `{"packager":"running"}`

### Check Device/Emulator Connection
```bash
# List connected devices
adb devices

# If your device shows "unauthorized", accept the prompt on your device
```

### Reset Everything
```bash
# Kill Metro bundler
# Press Ctrl+C in the Metro terminal

# Clean everything
npm run android:clean
watchman watch-del-all  # If you have watchman installed
rm -rf node_modules
npm install

# Start fresh
npm start
# Then in new terminal:
npm run android
```

## Development Workflow

Always use this sequence:
1. **Terminal 1**: `npm start` (Metro bundler)
2. **Terminal 2**: `npm run android` (Build and run app)
3. Keep Terminal 1 running while developing

## Debugging Tips

- Press `R` twice in Metro terminal to reload the app
- Shake your device or press `Cmd+M` (Mac) / `Ctrl+M` (Windows/Linux) to open dev menu
- Enable "Fast Refresh" in dev menu for automatic reloading on code changes
