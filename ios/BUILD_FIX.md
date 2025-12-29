# gRPC-Core Build Fix

## Problem
The build was failing with this error:
```
CompileC ... gRPC-Core ... xds_wrr_locality.o ... xds_wrr_locality.cc
```

## Solution Applied

### Changes to `ios/Podfile`:

1. **Static Framework Flag**: Added `$RNFirebaseAsStaticFramework = true` to build Firebase as static framework

2. **Version Pinning**: Pinned gRPC-Core to version 1.59.2 with modular headers disabled:
   ```ruby
   pod 'gRPC-Core', '1.59.2', :modular_headers => false
   ```

3. **Build Settings**: Added specific compiler flags for gRPC-Core:
   - `GRPC_BAZEL_BUILD=1` preprocessor definition
   - `CLANG_WARN_STRICT_PROTOTYPES = NO`
   - `CLANG_CXX_LANGUAGE_STANDARD = c++17`
   - `GCC_WARN_INHIBIT_ALL_WARNINGS = YES`

## Steps to Rebuild

Run these commands from the project root:

```bash
# Clean iOS build artifacts
cd ios
rm -rf Pods Podfile.lock DerivedData
cd ..

# Reinstall pods
cd ios && pod install --repo-update && cd ..

# Build the project
npm run ios
```

Or use the convenience script:
```bash
npm run ios:clean
npm run ios
```

## Why This Fix Works

- **Static Framework**: Reduces linking complexity and avoids dynamic framework issues
- **Version Pinning**: Ensures we use a tested, compatible version of gRPC-Core
- **Build Settings**: Suppresses warnings and configures the compiler to properly handle gRPC-Core's C++ code
- **C++17 Standard**: Ensures compatibility with modern C++ features used in gRPC-Core

## If Issues Persist

If you still encounter build errors:

1. Clean Xcode derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```

2. Clean React Native cache:
   ```bash
   npx react-native start --reset-cache
   ```

3. Ensure you're using Xcode 14+ with CocoaPods 1.12+
