# EAS Build Failure Analysis - Technical Report

## Executive Summary
The EAS Android build for **pocos** is consistently failing during the `Run gradlew` (native compilation) phase. The root cause is a "bleeding-edge" technical stack that combines **Expo 55 (Future-dated/Experimental)**, **React 19**, and **React Native 0.83**. This combination has introduced severe compatibility issues with native dependencies, specifically the animation and gesture handling layers.

## Technical Stack Overview
- **Expo SDK**: ~55.0.26 (Experimental)
- **React Native**: 0.83.6
- **React**: 19.2.0
- **Native Architecture**: New Architecture (Fabric/TurboModules) enabled by default in RN 0.83.
- **Key Dependencies**: Nativewind v4, Reanimated 4.2.1, Worklets-core 1.6.3.

## Identified Issues & Attempted Fixes

### 1. Dependency Installation (`npm ci`)
- **Problem**: `npm ci` failed due to strict peer dependency conflicts between React 19 and older Expo-related packages.
- **Fix**: Added `.npmrc` with `legacy-peer-deps=true`.
- **Result**: **Resolved.** Dependency installation now passes.

### 2. JavaScript Bundling (`expo export`)
- **Problem**: The Metro bundler crashed with `Cannot find module 'react-native-worklets/plugin'`.
- **Cause**: Reanimated 4.x has a hardcoded internal requirement for the legacy `react-native-worklets` package to satisfy its Babel plugin, even when using the newer `worklets-core`.
- **Fix**: Installed legacy `react-native-worklets` alongside `react-native-worklets-core`.
- **Result**: **Resolved.** Local bundling and EAS export now pass.

### 3. Native Compilation (`Run gradlew`)
- **Problem**: The build fails with an "Unknown Error" during Gradle execution.
- **Hypotheses & Attempted Fixes**:
    - **Architecture Mismatch**: Reanimated 4 requires the New Architecture. We re-enabled `newArchEnabled: true` in `app.json`.
    - **JVM Memory Pressure**: EAS containers have limited memory. We reduced Gradle JVM max heap (`Xmx`) from `8g` to `3g` to prevent OOM kills.
    - **Native Symbol Conflicts**: Added `packagingOptions` to `app.json` to handle duplicate `.so` files (e.g., `libreact_native_reanimated.so`).
    - **Kotlin/Java Compatibility**: Explicitly set Kotlin to `1.9.24` and Java to `17` via `expo-build-properties`.
- **Current Status**: **In Progress (Diagnostic Build).** We have enabled verbose logging (`--info --stacktrace`) and pinned the NDK to version `27.1.12297006` to meet the specific requirements of React Native 0.83.

## Current Blockers
1. **Experimental Stack**: Expo SDK 55 and React Native 0.83 are extremely new. Many "Expo Config Plugins" for libraries like `react-native-reanimated` or `react-native-screens` may not yet be updated to handle the specific native changes in RN 0.83.
2. **New Architecture Complexity**: Debugging New Architecture (Fabric) failures in a CI environment (EAS) is difficult without access to the full raw Gradle stack trace, which is currently obscured by "Unknown Error."

## Recommendations

### Option A: Downgrade (Highly Recommended for Stability)
Revert the project to a stable long-term support (LTS) stack:
- **Expo SDK 52** (Stable)
- **React Native 0.76**
- **React 18**
This would resolve 99% of the current native build hurdles immediately.

### Option B: Local Native Debugging
Perform a `npx expo run:android` on a local machine with a full Android Studio setup. This will provide the exact line number and C++/Java error causing the Gradle failure, which EAS currently hides.

### Option C: Incremental Dependency Removal
Remove `react-native-reanimated` and `nativewind` temporarily to see if a bare Expo 55 project can build. If it can, we can re-add them one by one to find the exact breaking library.

---
*Report generated on 2026-05-24*
