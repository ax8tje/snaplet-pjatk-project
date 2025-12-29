# Pull Request Details

## Title
Fix gRPC-Core dependency conflict with Firebase Firestore

## Description

### Summary

Fixes the CocoaPods dependency conflict where Firebase Firestore 10.24.0 requires gRPC-Core ~> 1.62.0, but the Podfile was pinning it to 1.59.2.

### Problem

When running `pod install`, CocoaPods reports:
```
[!] CocoaPods could not find compatible versions for pod "gRPC-Core":
  FirebaseFirestore (10.24.0) requires gRPC-Core (~> 1.62.0)
  Podfile specifies: gRPC-Core (= 1.59.2)
```

### Solution

- Remove explicit gRPC-Core version pin from Podfile
- Keep the existing build settings in `post_install` hook that fix C++ compilation issues
- Allow Firebase to resolve its required gRPC-Core version (1.62.x)

### Changes

- **ios/Podfile**: Remove `pod 'gRPC-Core', '1.59.2', :modular_headers => false` line
- **ios/BUILD_FIX.md**: Update documentation to reflect new approach

### Build Settings (Already Applied)

These settings remain in the Podfile and will fix compilation errors for any gRPC-Core version:
- `$RNFirebaseAsStaticFramework = true` - Build as static framework
- `GRPC_BAZEL_BUILD=1` - Enable Bazel compatibility mode
- `CLANG_CXX_LANGUAGE_STANDARD = c++17` - Use C++17 standard
- `CLANG_WARN_STRICT_PROTOTYPES = NO` - Suppress warnings
- `GCC_WARN_INHIBIT_ALL_WARNINGS = YES` - Suppress gRPC-Core warnings

### Test Plan

- [ ] Run `cd ios && rm -rf Pods Podfile.lock && pod install --repo-update`
- [ ] Verify pods install without version conflicts
- [ ] Run `npm run ios` to build the project
- [ ] Verify gRPC-Core compiles successfully without xds_wrr_locality.cc errors
- [ ] Test Firebase Firestore functionality in the app

### References

Related to previous fix in commit 449311a that added the initial build settings.
