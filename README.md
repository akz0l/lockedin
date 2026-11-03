# LockedIn

A personal focus app for Android and iPhone. It removes the addictive parts of social apps (Instagram Reels, Instagram Explore, YouTube Shorts) and blocks whole apps during timed focus sessions. There is no account and no server: everything stays on the phone.

## What works where

| Feature | Android | iPhone |
|---------|---------|--------|
| Reels, Explore and Shorts filters | Inside the official apps (Accessibility service) | Inside **Clean Instagram**, a tab in LockedIn that loads instagram.com without Reels or Explore. YouTube Shorts is not available. |
| Focus sessions (Soft, Firm, Strict) | Block the apps you pick, with a full-screen block screen | Lock the Clean Instagram tab |
| Blocking other apps | Yes | No. It needs Screen Time, which needs a paid Apple Developer account (phase 2) |

> iOS gives apps no way to change what happens inside another app. On iPhone, delete the Instagram app and use Clean Instagram instead.

## Quick path

1. Install dependencies: `npm install`
2. Build and install on your phone (pick one):
   - **Android, cloud build (no Android Studio):** `npx eas-cli@latest build -p android --profile preview`, then open the link on the phone and install the APK.
   - **Android, local:** install Android Studio and JDK 17, plug in the phone with USB debugging on, run `npm run android -- --device`.
   - **iPhone:** install Xcode, open the project once to choose your Apple ID as the signing team, run `npm run ios -- --device`. With a free Apple ID the app stops opening after 7 days; run the command again.
3. Open LockedIn. On Android, tap **Blocking is off · Turn on**, read what the service reads, tap **Agree and open settings**, and turn LockedIn on in Accessibility.
4. Check it works: open Instagram and tap Reels. You should land back on the previous screen with "Reels are off in LockedIn".

Expo Go does not work: the app has native code (the `focus-guard` module).

## Block levels

| Level | Ending a session early |
|-------|------------------------|
| Soft | Tap **End early**, wait 10 seconds |
| Firm | Tap **End early**, wait 5 minutes |
| Strict | Not possible. On Android, Settings screens that could turn LockedIn off also send you home |

**Stuck in a Strict session on Android?** Restart the phone in safe mode: third-party Accessibility services do not run there. Sessions also end on their own (8 hours maximum).

## Troubleshooting (Android)

| Symptom | Fix |
|---------|-----|
| Accessibility toggle is greyed out ("restricted setting") | App info → LockedIn → menu → **Allow restricted settings**, then try again |
| Filters stop working after a while | Battery settings → LockedIn → **Unrestricted**. The permissions screen links there |
| Reels open again after an Instagram update | The view ids changed. See [Detection rules](#detection-rules) |

## Known limitations

| Limitation | Why |
|------------|-----|
| Changing the phone's date or time forward ends a session early | Sessions use the wall clock on both sides |
| The end-of-session notification can arrive a few minutes late on Android 12+ | Exact alarms need the `SCHEDULE_EXACT_ALARM` permission, which the app does not request. Unblocking is not affected |
| View ids, Instagram's web layout and the Kotlin module have not been tested on a device yet | No Android or iOS toolchain was available while building the MVP |

## Detection rules

The Android service recognises screens by view ids. Apps rename them in updates, so they live in one table: `modules/focus-guard/android/src/main/java/com/lockedin/focusguard/detection/DetectionRules.kt`.

To find the current ids, open the screen on a connected phone and run:

```bash
adb shell uiautomator dump && adb pull /sdcard/window_dump.xml
```

Search the file for `resource-id`, update the table, and add the case to `EnforcerTest.kt`.

## Architecture

Feature folders (screaming architecture) with ports and adapters inside each feature. Routes in `src/app` only compose screens.

| Path | Role |
|------|------|
| `src/focus-session/` | Session domain (levels, early-exit rules), the store, the notifier, and the Focus screens |
| `src/content-filters/` | Filter definitions and the Filters screen |
| `src/app-blocking/` | `BlockerPort`, the Android adapter, the iOS stand-in, blocked apps and permissions screens |
| `src/clean-web/` | Clean Instagram: the injected script and the WebView screen |
| `src/shared/` | Theme tokens, UI atoms, storage port and adapters, haptics |
| `src/app-composition/` | Dependency wiring and React context |
| `modules/focus-guard/` | Local Expo module (Kotlin): Accessibility service, policy store, block screen |

Data flow: the JS store owns settings and the session, saves them on the device, and sends the resulting policy to the native module on every change. The Android service reads that saved policy, so it keeps working when the app is closed.

## Checks

```bash
npm test              # Jest (domain, store, screens, injected script)
npm run typecheck     # TypeScript
npm run lint          # ESLint (Expo config)
npx expo-doctor       # dependency and config checks
```

Kotlin unit tests (`EnforcerTest`, `PolicyTest`) need the Android SDK: run `npx expo prebuild -p android`, then `cd android && ./gradlew :lockedin-focus-guard:testDebugUnitTest`. The Gradle project name may differ; list it with `./gradlew projects`.

## Design

See [`PRODUCT.md`](PRODUCT.md) for product context and [`DESIGN.md`](DESIGN.md) for the visual system.
