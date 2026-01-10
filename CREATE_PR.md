# How to Create the Pull Request

## Quick Start

1. **Open this URL in your browser:**
   ```
   https://github.com/ax8tje/snaplet-pjatk-project/compare/main...claude/gradle-clean-build-MNZIO
   ```

2. **Fill in the PR details:**
   - **Title:** Fix Gradle afterEvaluate timing error for clean/build commands
   - **Description:** Copy from `.github/PR_DESCRIPTION.md` (or see below)

3. **Click "Create Pull Request"**

## Alternative: Using Command Line

If you have GitHub CLI installed and authenticated:

```bash
gh pr create \
  --base main \
  --head claude/gradle-clean-build-MNZIO \
  --title "Fix Gradle afterEvaluate timing error for clean/build commands" \
  --body-file .github/PR_DESCRIPTION.md
```

## What This PR Does

- ✅ Fixes the `Cannot run Project.afterEvaluate(Closure) when the project is already evaluated` error
- ✅ Enables `./gradlew clean` and `./gradlew build` to work properly
- ✅ Properly configures Kotlin compiler for react-native-vision-camera library
- ✅ Uses Gradle best practices (pluginManager.withPlugin instead of afterEvaluate)

## Changes Made

- `android/build.gradle` - Refactored Kotlin compiler configuration (20 insertions, 25 deletions)

## Branch Information

- **Source:** claude/gradle-clean-build-MNZIO
- **Target:** main
- **Status:** Ready to merge ✓

## Commits Included

1. `e4e0ed7` - Fix Gradle afterEvaluate timing error
2. `4168e16` - Resolve merge conflict with additional vision-camera compiler flags

---

**PR Description saved to:** `.github/PR_DESCRIPTION.md`
