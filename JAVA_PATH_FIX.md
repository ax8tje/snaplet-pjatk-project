# Fixing Java Path Configuration Issues

## Problem
You're seeing an error like:
```
Value 'C:\Program Files\Java\jdk-19' given for org.gradle.java.home Gradle property is invalid (Java home supplied is invalid)
```

This happens when there's a hardcoded Java path (often from Windows) in your Gradle configuration.

## Quick Fix for Mac Users

### Option 1: Remove the hardcoded path (Recommended)

1. Check if you have a global Gradle properties file:
   ```bash
   cat ~/.gradle/gradle.properties
   ```

2. If you see a line with `org.gradle.java.home` pointing to a Windows path, either:
   - Delete the entire file if it only contains that line
   - Or comment out that line by adding `#` at the beginning

3. Let Gradle auto-detect your Java installation (usually works best)

### Option 2: Set the correct Mac Java path

1. Find your Java installation:
   ```bash
   # For Java 17 (recommended for React Native)
   /usr/libexec/java_home -v 17

   # For Java 19
   /usr/libexec/java_home -v 19

   # Or find Homebrew Java
   brew --prefix openjdk@17
   ```

2. Create or edit `android/local.properties` (see `local.properties.example`):
   ```properties
   sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
   # Only add this if auto-detection fails:
   # org.gradle.java.home=/opt/homebrew/opt/openjdk@17
   ```

### Option 3: Fix your global Gradle configuration

Edit `~/.gradle/gradle.properties` and set the correct Mac path:
```properties
# For Homebrew Java 17
org.gradle.java.home=/opt/homebrew/opt/openjdk@17

# Or for system Java
org.gradle.java.home=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

## Recommended Setup for Mac

1. Install Java 17 (React Native officially supports Java 17):
   ```bash
   brew install openjdk@17
   ```

2. Set it as your default Java:
   ```bash
   echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Verify installation:
   ```bash
   java -version
   ```

4. Let Gradle auto-detect Java (don't set `org.gradle.java.home`)

## Common Locations to Check

- `~/.gradle/gradle.properties` (your user-level Gradle config)
- `android/gradle.properties` (project-level config)
- `android/local.properties` (local machine-specific config)

## Why This Happens

This issue typically occurs when:
- You're working on a project that was previously used on Windows
- You have a global Gradle configuration from another project
- Android Studio created a configuration for a different machine

## Still Having Issues?

1. Clean Gradle cache:
   ```bash
   cd android
   ./gradlew clean
   rm -rf ~/.gradle/caches/
   ```

2. Make sure Java is properly installed:
   ```bash
   java -version
   javac -version
   ```

3. Check that JAVA_HOME is set correctly:
   ```bash
   echo $JAVA_HOME
   ```
