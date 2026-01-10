# Fix Gradle afterEvaluate timing error and apply Kotlin compiler flags

## Problem
Building the Android app fails with two errors:

1. **Gradle configuration error:**
   ```
   Cannot run Project.afterEvaluate(Closure) when the project is already evaluated
   ```

2. **Kotlin compilation errors in react-native-vision-camera:**
   ```
   This API is provided only for React Native frameworks and not intended for general users.
   ```

## Solution
Changed the Gradle configuration pattern in `android/build.gradle` to:
- Use `allprojects { afterEvaluate { } }` instead of `subprojects { subproject.afterEvaluate { } }`
- Properly apply Kotlin compiler opt-in flags to suppress React Native internal API warnings
- Merge compiler args correctly to avoid conflicts

## Changes
- Modified `android/build.gradle` to configure Kotlin compilation with proper timing
- Added all required compiler flags for react-native-vision-camera:
  - `-opt-in=kotlin.RequiresOptIn`
  - `-opt-in=com.facebook.react.bridge.ReactMarker`
  - `-opt-in=com.facebook.react.uimanager.UIManagerHelper`
  - `-opt-in=com.facebook.react.internal.ReactNativeInternalAPI`
  - `-opt-in=com.facebook.react.bridge.FrameworkAPI`
  - `-Xskip-metadata-version-check`
  - `-Xsuppress-version-warnings`
  - `-Xallow-unstable-dependencies`

## Testing
- ✅ `./gradlew clean` completes successfully
- ✅ `./gradlew assembleDebug` builds without errors
- ✅ No more afterEvaluate timing errors
- ✅ No more Kotlin opt-in warnings for react-native-vision-camera

## Technical Details
The react-native-vision-camera library uses React Native internal APIs (ReactApplicationContext, UIManagerHelper, CallInvokerHolderImpl) that require opt-in annotations. The configuration now properly applies these flags during the Gradle configuration phase using the correct `allprojects` scope and `afterEvaluate` timing.
