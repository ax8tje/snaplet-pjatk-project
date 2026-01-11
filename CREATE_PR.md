# How to Create the Pull Request

## Quick Start

1. **Open this URL in your browser:**
   ```
   https://github.com/ax8tje/snaplet-pjatk-project/compare/main...claude/setup-frame-processor-uZzGO
   ```

2. **Fill in the PR details:**
   - **Title:** Fix react-native-vision-camera framework API errors and app registration
   - **Description:** Copy from `.github/PR_DESCRIPTION.md` (or see below)

3. **Click "Create Pull Request"**

## Alternative: Using Command Line

If you have GitHub CLI installed and authenticated:

```bash
gh pr create \
  --base main \
  --head claude/setup-frame-processor-uZzGO \
  --title "Fix react-native-vision-camera framework API errors and app registration" \
  --body-file .github/PR_DESCRIPTION.md
```

## What This PR Does

- ✅ Fixes React Native 0.74.0 framework API compilation errors in vision-camera
- ✅ Adds patch-package with automated fixes for vision-camera
- ✅ Configures kotlinOptions with proper JVM target (17) and opt-in flags
- ✅ Forces React Native 0.74.0 version to prevent dependency version mismatches
- ✅ Fixes app registration error (SnapletTemp → SnapletPjatk)

## Changes Made

### Core Fixes
- `patches/react-native-vision-camera+3.9.2.patch` - **NEW** Patch file for vision-camera
  - Adds `@file:Suppress("INTERNAL_FRAMEWORK_API_USAGE")` to VisionCameraProxy.kt
  - Configures kotlinOptions with JVM target 17 and framework API opt-ins
  - Forces react-android:0.74.0 in dependency resolution

- `package.json` - Added patch-package and postinstall script

- `android/app/src/main/java/com/snaplettemp/MainActivity.kt` - Fixed app name (SnapletTemp → SnapletPjatk)

### Documentation
- `README.md` - Added troubleshooting section for vision-camera build issues

## Technical Details

### The Problem
React Native 0.74.0 introduced stricter checks for internal framework API usage. Vision Camera 3.9.2 uses these APIs for JSI integration, causing compilation errors:

```
This API is provided only for React Native frameworks and not intended for general users
```

### The Solution
Multi-layered approach using patch-package:
1. **File-level suppression** - Suppress framework API warnings in VisionCameraProxy.kt
2. **Kotlin compiler flags** - Add opt-in flags for React Native framework APIs
3. **Dependency version locking** - Force exact React Native version to prevent mismatches
4. **JVM target alignment** - Set JVM target to 17 to match project configuration

## Branch Information

- **Source:** claude/setup-frame-processor-uZzGO
- **Target:** main
- **Status:** Ready to merge ✓

## Commits Included

All commits related to fixing vision-camera build errors and app registration issues.

---

**Note:** After merging, anyone who clones the project will automatically get the patches applied via the `postinstall` script.
