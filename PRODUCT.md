# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One shared custom design language on both iOS and Android, respecting each OS's native affordances (navigation gestures, safe areas, haptics, system text scaling). Inferred from the confirmed requirement "Android y IOS" and the decision to build both platforms in parallel.

## Users

The first user is the founder, using the app personally on their own phones (confirmed: "Uso personal primero"). They want to stop doomscrolling short-video feeds and protect blocks of focused time. Public release to the stores is a later phase.

## Product Purpose

LockedIn activates a personal focus mode on the phone. It does two things:

1. **Always-on anti-doomscroll filters.** Removes the addictive surfaces of social apps (Instagram Reels, Instagram Explore, YouTube Shorts) without removing the useful parts (messages, stories, following feed).
2. **Timed focus sessions.** Blocks whole apps for a chosen duration at a chosen block level (Soft, Firm, Strict).

Success: the user opens Instagram for a DM and leaves without falling into Reels; a focus session cannot be broken on impulse.

## Positioning

Feature-level blocking instead of app-level blocking: the goal is to remove brainrot, not the app. Fully local: no account, no backend, no data leaves the device.

## Operating Context

- Used in short, frequent moments: starting a session before work or study, checking that filters are on, being stopped mid-impulse by a block screen.
- The block screen is seen at the moment of temptation; it must be calm, final, and unambiguous.
- Setup requires granting sensitive OS permissions (Android Accessibility service, notifications, battery optimization exemption), so trust and plain explanations matter.

## Capabilities and Constraints

- Stack: Expo SDK 58 + React Native + TypeScript, development builds (no Expo Go).
- Android: blocking inside official apps via an `AccessibilityService` (detect Reels, Explore, Shorts screens and navigate back); whole-app blocking during sessions; Strict level also guards Settings > Accessibility and the app info page.
- iOS: no public API blocks features inside another app. MVP offers a clean Instagram inside LockedIn (instagram.com in a WebView with Reels and Explore removed). No paid Apple Developer account yet, so no Screen Time; app blocking is hidden on iOS until phase 2.
- Storage: on-device only (key-value store on the JS side, SharedPreferences for the Android service).
- No accounts, no sign-up, no analytics, no backend.
- Out of scope for MVP: statistics, recurring schedules, TikTok/Facebook/X feature filters, store publishing.
- Terminology: "focus session", "block level" (Soft, Firm, Strict), "filters", "block screen", "clean Instagram".

## Brand Commitments

- Name: LockedIn.
- Visual reference explicitly requested by the user: minimalist, modern, intuitive, "inspirado en vercel o uber".

## Evidence on Hand

None. No testimonials, usage data, metrics, or press exist; future work must not fabricate them.

## Product Principles

1. Remove the addictive feature, keep the useful app.
2. Friction is the product: blocking must hold at the moment of impulse, and ending early must cost something proportional to the chosen level.
3. Local and private by default: nothing to sign up for, nothing leaves the phone.
4. Honest about platform limits: never promise a block the OS cannot enforce.
5. Calm over clever: one clear action per screen.

## Accessibility & Inclusion

No product-specific requirement established beyond platform standards (Dynamic Type / font scaling, screen readers, sufficient contrast, 44pt/48dp touch targets).
