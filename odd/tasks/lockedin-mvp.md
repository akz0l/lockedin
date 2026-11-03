# LockedIn MVP

Objective: Expo + React Native focus app (Android + iOS) that blocks apps during timed focus sessions and removes addictive short-video features (Reels, Explore, Shorts). No accounts, no backend.
Branch: `feat/mvp` · Delivery strategy: `ask-on-risk` · Test runner: `jest-expo` (JS/TS), JUnit (Kotlin module, needs JDK + Android SDK).
Plan: `~/.claude/plans/eres-mi-ingeniero-desarrollador-eventual-sunrise.md`

## Specs

- **S1 — Main screen.** "La app tendrá una pantalla principal en la cual el usuario podrá realizar sus configuracioens de preferencia, establecer qué apps bloquear, el tiempo de duración, nivel de bloqueo y etc"
  - Acceptance: Home shows session status and starts a session; configure screen sets blocked apps (Android only), duration (presets 25/50/90 min + custom) and block level.
- **S2 — Anti-doomscroll.** "La app deberá permitir bloquear reels de ig y todo comportamiento adictivo de las plataformas de redes sociales"
  - Decision (L3): always-on filters, independent of sessions. MVP filters: Instagram Reels, Instagram Explore, YouTube Shorts.
  - Android: blocked inside the official apps via `AccessibilityService` (detect screen → back).
  - iOS: "IG limpio en WebView" (L2): instagram.com inside LockedIn with Reels/Explore hidden and redirected; DMs, stories and following feed keep working.
- **S3 — Design.** "La app tendrá un diseño minimalista, moderno e intuitivo inspirando en vercel o uber"
  - Use the `impeccable` skill (native platform guidance). Monochrome, Geist font (OFL), high contrast, haptics.
  - Appearance (L15): light and dark follow the system appearance ("Seguir al sistema"); both palettes are first-class.
- **S4 — No accounts.** "El alcance del MVP no contempla registro en la app ni necesidad de crear alguna cuenta."
- **S5 — Local storage only.** "no contemplo necesidad de alguna base de datos, cualqiuer cosa que se use la memoria del telefono o algo así."
  - MMKV on JS side; native Android service reads policy from SharedPreferences.
- **S6 — Stack.** "Expo con react native" — Android and iOS in parallel (L2). No Expo Go: development builds.
- **S7 — Block levels (assumption, proposed by the parent and approved with the plan).**
  - Soft: block screen with a 10 s pause; session can be ended.
  - Firm: ending early requires waiting 5 minutes.
  - Strict: session cannot be ended early; Android also bounces Settings > Accessibility and the app info page during the session.
- **S8 — Session end.** Local notification when the session ends; apps unblock automatically when `endsAt` passes.
- **S9 — iOS constraints (L2).** No paid Apple Developer account yet → no Screen Time. App-blocking UI hidden on iOS. Phase 2 plugs Screen Time behind the `BlockerPort`.

## Tasks

| ID | Specs | Task | Route | Status | Evidence |
|----|-------|------|-------|--------|----------|
| T1 | S4, S5, S6 | Scaffold Expo SDK 58 (TS, expo-router in `src/app`, jest-expo + RNTL 14) | inline | done | jest 1/1, tsc clean; README moved to T7 · `b071d04` |
| T2 | S3 | Design system: impeccable context, PRODUCT.md, surface brief, tokens, Geist, atoms (DESIGN.md at finish, T7) | inline | done | jest 6/6 atoms; tsc clean · `b0e6a4b` |
| T3 | S1, S2, S5, S7, S8 | Domain + persistence: FocusSession, levels, early-end rules, filters, focus store over kv-store | inline | done | RED (modules missing) → GREEN 33/33 jest; tsc clean · `ff256ce` |
| T4 | S2, S7 | Android native module `focus-guard`: service, PolicyStore, BlockActivity, detectors, SettingsGuard, app list | inline | done (unverified native) | JS contract test 2/2; JUnit written, NOT run (no JDK); Kotlin not compiled · `3fae31c` (reviewed, approved), `1a37731` |
| T5 | S1, S2, S7, S9 | Screens: Focus (setup + active), custom duration, Filters, Blocked apps, Permissions onboarding | inline | done | jest 64/64 (RED: reapply, battery status, stale countdown 0:11, switch a11y disabled); tsc clean · `1c603b8` |
| T6 | S2, S9 | iOS clean Instagram WebView with injection | inline | done | RED (module missing) → GREEN; jest 92/92; tsc clean; on-device check pending (no Xcode) · `375aa66` |
| T7 | S3, S8 | Session-end notification, haptics, polish, impeccable native audit, README, DESIGN.md | inline | done | jest 93/93, tsc, eslint, expo-doctor 20/20; native audit 14/20 (static, no simulator) · `eddbed8`, `6c12147` |

Route evidence: no Writer trigger reason (units depend on shared domain/design system; parent writes inline following this logbook).

## Log

- **L1 (2026-11-03, user request verbatim):**
  > Eres mi Ingeniero desarrollador con más de 15 años de experiencia en el mundo del desarrollo de software.
  > Quiero desarrollar una app mobile que me permita hacer una cosa muy simple: Activar el modo enfoque en mi telefono. (Android y IOS)
  >
  > features:
  > - La app tendrá una pantalla principal en la cual el usuario podrá realizar sus configuracioens de preferencia, establecer qué apps bloquear, el tiempo de duración, nivel de bloqueo y etc
  > - La app deberá permitir bloquear reels de ig y todo comportamiento adictivo de las plataformas de redes sociales
  > - La app tendrá un diseño minimalista, moderno e intuitivo inspirando en vercel o uber (hay una skill llamada impecable pero creo que es para web, valida si te sirve para desarrollo mobile o si no busca alguna buena para eso)
  > - El alcance del MVP no contempla registro en la app ni necesidad de crear alguna cuenta.
  >
  > Stack tecnológico:
  > - Expo con react native
  > - no contemplo necesidad de alguna base de datos, cualqiuer cosa que se use la memoria del telefono o algo así.
  >
  > Realizame preguntas necesarias en el caso de que tengas alguna duda, sugerencia de algun punto que no consideré. Y puedes mejorar el prompt
- **L2 (2026-11-03, user decisions):** MVP destination "Uso personal primero"; iOS approach "IG limpio en WebView"; platforms "Ambos a la vez"; Apple Developer paid account "Todavía no".
- **L3 (2026-11-03, user decision):** anti-doomscroll filters "Siempre + sesiones".
- **L4 (2026-11-03, user question verbatim):** "¿Seguro que no se puede bloquear la funcionalidad de reels de instagram en iphone? ¿ qué otras opciones tenemos antes de bloquear toda la app? Lo que quiero es eliminar el brainrot y doomscrolling de las apps". Verified: no public iOS API for in-app feature blocking (one sec docs); market uses WebView wrapper + Screen Time, Safari extensions, or screen recording.
- **L5 (2026-11-03, environment):** Mac has no Xcode, no Android Studio/SDK, no JDK. Native compile and device checks are pending until the user installs them. JS tests and typecheck run locally.
- **L6 (2026-11-03, T1):** Expo SDK 58 / RN 0.88 / React 19.3. Routes live in `src/app/` (SDK 58 convention). Storage switched from MMKV to `expo-sqlite/kv-store` behind a storage port (official Expo module, sync API, SDK-matched). `react-dom` pinned to 19.3.0 to fix a transitive peer conflict; RNTL 14 needs `test-renderer` and async `render`/`fireEvent`.
- **L7 (2026-11-03, T2):** impeccable: PRODUCT.md written (platform `adaptive`) from the planning answers; direction pinned by the user brief ("inspirado en vercel o uber"), so concept-seed was not run and Operate mode rules apply; surface brief holds the direction contract. DESIGN.md is written at finish per the skill.
- **L8 (2026-11-03, T3, interpretation of S7):** every early exit goes through a wait counted from the user's request: Soft 10 s, Firm 5 min, Strict denied. Settings (duration, level, apps) are locked while a session runs; filters stay editable. Persisted state is validated on load; corrupted data falls back to defaults.
- **L9 (2026-11-03, T4):** Verified against official docs: accessibility service needs `android:exported="true"` + `BIND_ACCESSIBILITY_SERVICE`. View ids from current open-source blockers: Instagram `clips_viewer_view_pager` (Reels viewer, IG 451-453), `image_preview` (Explore grid; triggers only on scroll so search keeps working); YouTube `reel_player_page_container`, `reel_watch_fragment_root`, `reel_watch_player` (player, not the home shelf `reel_recycler`). Reels shared in chats are also closed (same viewer). Strict guard sends Home on settings/package-installer screens that mention "LockedIn"; escape hatch is safe-mode boot. Native code is unverified until JDK + Android SDK exist: compile, JUnit and on-device id calibration are pending.
- **L10 (2026-11-03, T4 review):** Native review of 3fae31c approved and acknowledged (lenses risk + reliability). Advisories queued as follow-up: validate package names in `Policy.parse`, recycle the root node pre-API 33, inspect only packages whose filter is on; battery status was unused (fixed in T5). Slice T1-T3 stays assessed medium/under budget, not reviewed (the assess range always ends at HEAD, so it could not be closed before the T4 commit).
- **L11 (2026-11-03, T5):** Native tabs (Focus, Filters, Instagram hidden on Android) with per-tab stacks and large titles. Found and fixed: countdown showed 0:11 right after "End early" (screen clock refreshed on session change); RN Switch did not expose `disabled` to accessibility (`aria-disabled`). On iPhone, sessions lock Clean Instagram and YouTube Shorts is disabled with "Not available on iPhone yet." Permissions screen is the Play-style prominent disclosure with explicit consent.
- **L12 (2026-11-03, T6):** Clean Instagram: rules match the first path segment (`/reels`, `/reel`, `/explore` except `/explore/search`), so usernames like `/reelsfan/` stay reachable. Explore links are rewritten to search. Reels redirect to `/`, Explore to `/explore/search/`. The tab shows a lock view during a session. External links open in the system browser. Notice is an accessible live region. Instagram's web DOM is unverified on device (no Xcode).
- **L13 (2026-11-03, T4 follow-up):** Applied review advisories: `Policy.parse` rejects blocked entries that are not package names; the service recycles the root node before API 33; `needsInspection` only reads apps whose own filter is on. JUnit cases added; still not run (no JDK).
- **L14 (2026-11-03, T7):** Haptics on segment change and session start/end. ESLint (eslint-config-expo) added; fixes: `useNow` moved to `useSyncExternalStore` (clock read fresh on every render, rounded up to 100 ms), no `Date.now()` in render, async app loading. Regression caught and pinned: tapping the selected custom duration must reopen the sheet. Static impeccable native audit 14/20 (a11y 3, performance 3, theming 3, conformance 3, adaptivity 2); fixed P1 Instagram bottom bar hidden under the native tab bar (native SafeAreaView) and P2 stretched layout on tablets (560px column). Open: custom segmented control and stepper instead of platform controls (P2), Android block screen always dark (intentional, P3), portrait-only. `eas.json` preview profile builds an APK in the cloud without Android Studio.
- **Next:** install a toolchain (Android Studio + JDK 17, Xcode) or run the EAS Android build; compile `focus-guard`, run JUnit, calibrate view ids on device, and walk the E2E checklist from the plan.
- **L15 (2026-11-03, independent verifier + user decision):** Verifier (whole document, base d9eb474, scratch clone): jest 93/93, tsc, lint pass; 279 own probes pass (store invariants, early-exit timing, injection vs `blockedPath`, JS-Kotlin contract); Kotlin static review found no compile errors. One blocker: S3 said "dark by default" but the app followed the system. User decision verbatim: "Seguir al sistema". S3 rewritten; `useTheme` behavior pinned by a test. Advisories fixed in `bd15ee0`: screen clock never ahead of the store (End session only when allowed) nor behind session timestamps (25:00, not 25:01); saved sessions longer than 480 min dropped; Android blocks session apps from the event package; `flagIncludeNotImportantViews`. Open advisories (documented, not fixed): moving the system clock forward ends sessions early; end notification may be inexact on Android 12+ without `SCHEDULE_EXACT_ALARM`; a narrow race if a Soft session ends before the notification permission prompt is answered.
