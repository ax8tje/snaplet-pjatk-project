# Fix react-native-vision-camera framework API errors and app registration

## Problems Fixed

1. **React Native 0.74.0 framework API compilation errors:**
   ```
   This API is provided only for React Native frameworks and not intended for general users.
   This API can change between minor versions in alignment with React Native frameworks
   and won't be considered a breaking change.
   ```
   - Errors on lines 31, 36, 72 in VisionCameraProxy.kt
   - Caused by vision-camera 3.9.2 using internal React Native APIs for JSI integration

2. **JVM target mismatch:**
   ```
   Inconsistent JVM-target compatibility detected for tasks 'compileDebugJavaWithJavac' (17)
   and 'compileDebugKotlin' (1.8).
   ```
   - App uses Java 17, but vision-camera was compiling with Java 1.8

3. **App registration error:**
   ```
   "SnapletTemp" has not been registered
   ```
   - MainActivity.kt referenced wrong app name (SnapletTemp instead of SnapletPjatk)

## Solution

### Multi-Layered patch-package Fix

Created automated patch for `react-native-vision-camera@3.9.2` that:

1. **Adds file-level suppression** in VisionCameraProxy.kt:
   ```kotlin
   @file:Suppress("INTERNAL_FRAMEWORK_API_USAGE")
   ```

2. **Configures kotlinOptions** in build.gradle:
   - Sets `jvmTarget = "17"` to match project Java version
   - Sets `allWarningsAsErrors = false` to allow framework API usage
   - Adds opt-in compiler flags:
     - `-opt-in=com.facebook.react.bridge.ReactMarker`
     - `-opt-in=com.facebook.react.uimanager.UIManagerHelper`
     - `-opt-in=com.facebook.react.internal.ReactNativeInternalAPI`
     - `-Xsuppress-version-warnings`

3. **Forces React Native version** to prevent mismatches:
   ```gradle
   configurations.all {
     resolutionStrategy {
       force 'com.facebook.react:react-android:0.74.0'
     }
   }
   ```

4. **Fixed app name** in MainActivity.kt (SnapletTemp → SnapletPjatk)

## Changes

### New Files
- `patches/react-native-vision-camera+3.9.2.patch` - Automated fix for vision-camera

### Modified Files
- `package.json`
  - Added `patch-package` and `postinstall-postinstall` to devDependencies
  - Added `"postinstall": "patch-package"` script

- `android/app/src/main/java/com/snaplettemp/MainActivity.kt`
  - Changed app name from "SnapletTemp" to "SnapletPjatk"

- `README.md`
  - Added Android Vision Camera Build Issues troubleshooting section
  - Documented patch-package solution
  - Added App Registration Error solution

- `CREATE_PR.md`
  - Updated with current branch and changes
  - Added technical details about the issue and solution

## Testing

- ✅ `./gradlew clean assembleDebug` builds successfully
- ✅ No framework API errors
- ✅ No JVM target mismatch errors
- ✅ App launches without registration errors
- ✅ Patch automatically applies on `npm install`

## Technical Details

### Why This Happened

React Native 0.74.0 introduced stricter checks for internal framework API usage. The vision-camera library (3.9.2) uses these internal APIs:
- `catalystInstance.jsCallInvokerHolder`
- `javaScriptContextHolder`
- `CallInvokerHolderImpl`

These are necessary for JSI (JavaScript Interface) integration to enable frame processing.

### Why The Patch Works

The multi-layered approach ensures compatibility:

1. **File-level suppression** tells Kotlin to ignore framework API warnings for the entire file
2. **kotlinOptions configuration** properly configures the compiler with:
   - Correct JVM target matching the project
   - Opt-in flags allowing framework API usage
   - Warning suppression to prevent build failures
3. **Version locking** prevents Gradle from pulling newer incompatible React Native versions
4. **allWarningsAsErrors = false** ensures warnings don't block the build

### Automatic Application

The `postinstall` script in package.json automatically applies the patch when running:
- `npm install`
- `npm ci`
- After cloning the repository

This ensures all team members get the fix automatically.

## Commit History

1. Add patch-package to fix react-native-vision-camera framework API errors
2. Fix JVM target mismatch - use Java 17 instead of 1.8
3. Add allWarningsAsErrors=false to suppress framework API errors
4. Use file-level @Suppress for cleaner framework API suppression
5. Force React Native 0.74.0 to fix framework API version mismatch
6. Fix app name mismatch - change SnapletTemp to SnapletPjatk in MainActivity
7. Update documentation with vision-camera fixes and troubleshooting
