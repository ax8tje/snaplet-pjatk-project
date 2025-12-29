# iOS Build Fixes

## BoringSSL-GRPC Build Fix (Latest)

### Problem
The build was failing with this error when compiling BoringSSL-GRPC for iOS:
```
unsupported option '-G' for target 'arm64-apple-ios13.0'
Compile tls_record.cc (arm64)
```

### Solution Applied
Added comprehensive build settings for BoringSSL-GRPC in `ios/Podfile` to disable assembly optimizations and prevent the `-G` flag from being passed to the compiler:

1. **Assembly Optimization Disabled**:
   - `OPENSSL_NO_ASM=1` - Preprocessor definition to disable all assembly code
   - `OTHER_CFLAGS = '$(inherited) -DOPENSSL_NO_ASM'` - C compiler flag
   - `OTHER_CPPFLAGS = '$(inherited) -DOPENSSL_NO_ASM'` - C++ compiler flag

2. **Module and Header Map Disabled** (same as gRPC-C++):
   - `USE_HEADERMAP = NO` - Prevents header map absolute path issues
   - `CLANG_ENABLE_MODULES = NO` - Disables Clang modules

3. **Bitcode Disabled**:
   - `ENABLE_BITCODE = NO` - Prevents bitcode-related assembly optimizations

4. **Standard Compiler Settings**:
   - `CLANG_CXX_LANGUAGE_STANDARD = gnu++17` - GNU C++17 standard
   - `CLANG_CXX_LIBRARY = libc++` - C++ standard library
   - `IPHONEOS_DEPLOYMENT_TARGET = 13.0` - iOS 13+ compatibility

### Why This Fix Works
The `-G` flag is typically used by BoringSSL's build system for assembly optimizations on ARM architectures. By:
- Setting `OPENSSL_NO_ASM=1` in multiple places (preprocessor, C flags, C++ flags), we ensure all compilation units disable assembly
- Disabling header maps and modules prevents module-related build issues
- Disabling bitcode prevents additional optimization passes that might re-enable assembly code
- Using the same settings as gRPC-C++ ensures consistency across the gRPC stack

---

## gRPC-Core Build Fix

### Problem
The build was failing with this error:
```
CompileC ... gRPC-Core ... xds_wrr_locality.o ... xds_wrr_locality.cc
```

### Solution Applied

### Changes to `ios/Podfile`:

1. **Static Framework Flag**: Added `$RNFirebaseAsStaticFramework = true` to build Firebase as static framework

2. **Build Settings**: Added comprehensive compiler flags for gRPC-Core in post_install hook:
   - `GRPC_BAZEL_BUILD=1` - Enables Bazel compatibility mode
   - `GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS=0` - Fixes protobuf import issues
   - `CLANG_WARN_STRICT_PROTOTYPES = NO` - Disables strict prototype warnings
   - `CLANG_CXX_LANGUAGE_STANDARD = gnu++17` - Uses GNU C++17 with extensions
   - `CLANG_CXX_LIBRARY = libc++` - Explicitly sets C++ standard library
   - `GCC_WARN_INHIBIT_ALL_WARNINGS = YES` - Suppresses all GCC warnings
   - `WARNING_CFLAGS = -Wno-everything` - Suppresses all Clang warnings
   - `IPHONEOS_DEPLOYMENT_TARGET = 13.0` - Ensures iOS 13+ compatibility

3. **gRPC-C++ Module Map Fix**: Added settings to prevent module map path issues:
   - `USE_HEADERMAP = NO` - Disables header maps to avoid absolute path issues
   - `CLANG_ENABLE_MODULES = NO` - Disables Clang modules for gRPC-C++ to prevent modulemap not found errors

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

- **Static Framework**: Reduces linking complexity and avoids dynamic framework issues with Firebase
- **GNU C++17**: The `gnu++17` standard provides necessary GNU extensions for gRPC-Core 1.62.x
- **Explicit C++ Library**: Setting `libc++` ensures compatibility with modern iOS toolchains
- **Protobuf Import Fix**: `GPB_USE_PROTOBUF_FRAMEWORK_IMPORTS=0` resolves header import conflicts
- **Warning Suppression**: Multiple flags ensure warnings don't block compilation of third-party code
- **GRPC_BAZEL_BUILD**: Enables Bazel compatibility mode for proper gRPC-Core compilation
- **Module Map Fix**: Disabling modules for gRPC-C++ prevents absolute path issues with modulemap files that reference paths like `/Users/myco/WebstormProjects/...`
- **No Version Lock**: Allows Firebase to use its required gRPC-Core version (1.62.x) while maintaining build stability

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
