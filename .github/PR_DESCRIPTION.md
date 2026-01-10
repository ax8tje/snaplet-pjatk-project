## Summary

Fixes the Gradle build error: `Cannot run Project.afterEvaluate(Closure) when the project is already evaluated`

This PR refactors the Kotlin compiler configuration in `android/build.gradle` to eliminate timing-dependent `afterEvaluate` blocks and use the more robust `pluginManager.withPlugin()` approach instead.

## Problem

The `afterEvaluate` block was being called on subprojects that had already completed their evaluation phase, causing the build to fail with:

```
FAILURE: Build failed with an exception.

* Where:
Build file 'android/build.gradle' line: 25

* What went wrong:
A problem occurred evaluating root project 'SnapletPjatk'.
> Cannot run Project.afterEvaluate(Closure) when the project is already evaluated.
```

This timing error occurs because Gradle's project evaluation order is not guaranteed, and some subprojects (particularly react-native-vision-camera) may already be evaluated when the `afterEvaluate` closure tries to execute.

## Solution

Replace the timing-dependent `afterEvaluate` block with `pluginManager.withPlugin()` callbacks:

- **Before**: Used `afterEvaluate` to configure react-native-vision-camera after project evaluation
- **After**: Use `pluginManager.withPlugin()` which triggers when the Kotlin plugin is applied, regardless of evaluation timing

### Key Changes

1. **Removed** the problematic `afterEvaluate` block (lines 25-48)
2. **Integrated** vision-camera specific compiler flags into existing `pluginManager.withPlugin()` blocks using conditional checks
3. **Added** all necessary Kotlin compiler flags for react-native-vision-camera:
   - `-opt-in=kotlin.RequiresOptIn`
   - `-opt-in=com.facebook.react.bridge.ReactMarker`
   - `-opt-in=com.facebook.react.uimanager.UIManagerHelper`
   - `-opt-in=com.facebook.react.internal.ReactNativeInternalAPI`
   - `-opt-in=com.facebook.react.bridge.FrameworkAPI`
   - `-Xskip-metadata-version-check`
   - `-Xsuppress-version-warnings`
   - `-Xallow-unstable-dependencies`

### Why This Works

The `pluginManager.withPlugin()` approach is superior because:

- ✅ **No timing dependency**: Executes when the plugin is applied, not when the project is evaluated
- ✅ **Gradle recommended**: This is the official Gradle pattern for plugin-specific configuration
- ✅ **More maintainable**: Clearer intent and better separation of concerns
- ✅ **Applied consistently**: Works for both `kotlin.android` and `kotlin.jvm` plugins

## Technical Context

The react-native-vision-camera library uses React Native internal APIs (e.g., in `VisionCameraProxy.kt`):

```kotlin
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl
import com.facebook.react.uimanager.UIManagerHelper
```

These APIs require opt-in annotations and special compiler flags to suppress version warnings, which is why the additional configuration is necessary.

## Testing

- ✅ `./gradlew clean` completes without errors
- ✅ `./gradlew build` completes successfully
- ✅ No afterEvaluate timing errors
- ✅ All Kotlin compiler flags properly applied to react-native-vision-camera

## Files Changed

- `android/build.gradle` - Refactored Kotlin compiler configuration
