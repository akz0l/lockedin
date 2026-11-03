---
name: LockedIn
description: A focus instrument for the phone. Monochrome, precise, calm at the moment of temptation.
colors:
  ground: "#FAFAFA"
  surface: "#FFFFFF"
  hairline: "#E5E5E5"
  text: "#000000"
  text-secondary: "#5F5F5F"
  text-disabled: "#A3A3A3"
  ink: "#000000"
  on-ink: "#FFFFFF"
  pressed: "#F0F0F0"
  success: "#15803D"
  warning: "#B45309"
  danger: "#DC2626"
  muted: "#A3A3A3"
  ground-dark: "#000000"
  surface-dark: "#0F0F0F"
  hairline-dark: "#262626"
  text-dark: "#EDEDED"
  text-secondary-dark: "#A1A1A1"
  ink-dark: "#EDEDED"
  on-ink-dark: "#000000"
  success-dark: "#4ADE80"
  warning-dark: "#FBBF24"
  danger-dark: "#FF6166"
typography:
  display:
    fontFamily: "Geist SemiBold, system-ui"
    fontSize: "88px"
    fontWeight: 600
    lineHeight: "96px"
    letterSpacing: "-2.6px"
  large-title:
    fontFamily: "Geist SemiBold, system-ui"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: "41px"
    letterSpacing: "-0.7px"
  title:
    fontFamily: "Geist SemiBold, system-ui"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.4px"
  body:
    fontFamily: "SF Pro (iOS), Roboto (Android)"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "22px"
  callout:
    fontFamily: "SF Pro (iOS), Roboto (Android)"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  footnote:
    fontFamily: "SF Pro (iOS), Roboto (Android)"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
rounded:
  control: "10px"
  card: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  xxxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.card}"
    height: "52px"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    height: "52px"
  segmented-track:
    backgroundColor: "{colors.pressed}"
    rounded: "{rounded.control}"
  segmented-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    height: "42px"
  list-group:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
---

# Design System: LockedIn

## Overview

**Creative North Star: "The instrument, not the wellness app"**

LockedIn borrows the discipline of Vercel's dashboard and Uber's rider app, the two references the founder named: ink on paper, one decision per screen, state that is legible in a second. It is an Operate surface. Ambition shows as precision and restraint, and the brand lives in a few exact details: the Geist display numerals, the hairlines, the status dots.

The app refuses the wellness-app category default: no pastel gradients, no mascots, no streaks, no decorative progress rings. When a session runs, the screen is a timer and a rule, nothing else. When the user is tempted, the block screen is calm and final.

**Key Characteristics:**
- Pure black and white grounds; color appears only to state status.
- Giant tabular numerals as the one display moment (duration and countdown).
- Native navigation everywhere: native tabs, native stacks with large titles, native switches, SF Symbols and Material Symbols.
- One solid full-width ink button per screen.
- A 2px lock line drains across the top edge of every screen while a session runs.

## Colors

A monochrome ramp with four status colors that never decorate.

### Primary
- **Ink** (#000000 light / #EDEDED dark): the single primary action (Lock in, Set duration), the switch track when on, and the lock line.

### Neutral
- **Ground** (#FAFAFA / #000000): screen background.
- **Surface** (#FFFFFF / #0F0F0F): grouped list cells, selected segment, secondary buttons.
- **Hairline** (#E5E5E5 / #262626): 1px separators and outlines; elevation is a hairline, never a shadow.
- **Text** (#000000 / #EDEDED) and **Text secondary** (#5F5F5F / #A1A1A1, at least 6.4:1 on surfaces): copy hierarchy.
- **Pressed** (#F0F0F0 / #1A1A1A): pressed rows and the segmented track.

### Status
- **Success** (#15803D / #4ADE80): on, protected, Soft level.
- **Warning** (#B45309 / #FBBF24): needs attention, Firm level.
- **Danger** (#DC2626 / #FF6166): Strict level, enforcement failures.
- **Muted** (#A3A3A3 / #5C5C5C): off.

### Named Rules
**The Status-Only Color Rule.** Color states a fact (on, needs attention, strict, off) and always sits next to text that says the same thing. It is never decoration.

**The Two Appearances Rule.** Light and dark follow the system and are both first-class. The Android block screen is the one exception: it is always dark, because it is the "locked" state.

## Typography

**Display Font:** Geist SemiBold (Vercel, SIL OFL), loaded with `@expo-google-fonts/geist`
**Body Font:** the platform face (SF Pro on iOS, Roboto on Android)

**Character:** Geist carries the instrument voice in display moments only; the system face keeps body, labels and controls native and scalable.

### Hierarchy
- **Display** (88/96, -2.6 tracking, tabular figures): the duration and the countdown. Font scaling capped at 1.2x so the numerals never wrap.
- **Large title** (34/41): native large titles (Focus, Filters).
- **Title** (22/28): sheet values and the lock view.
- **Headline / Body** (17 iOS, 16 Android): rows, buttons, copy.
- **Callout** (15/20) and **Footnote** (13/18): status lines, consequences, list headers and footers.

### Named Rules
**The No-Kicker Rule.** No eyebrow labels above headings or numbers. The big number speaks for itself; context sits below it.

## Layout

Single column, 16px screen padding, capped at 560px wide so tablets get a readable column instead of a stretched phone. Groups are separated by 24-32px; items inside a group by 8-12px. The primary button sits at the bottom of the content, above the tab bar. Every touch target is at least 48px (meets 44pt iOS and 48dp Android).

## Elevation & Depth

Flat. Depth is expressed with hairline borders on grouped lists and secondary buttons and with the surface/ground contrast. No drop shadows anywhere. System materials (native tab bar, sheets) provide the only translucency.

## Shapes

Cards and buttons use a 12px radius; segmented controls 10px (8px for the inner segment). Status dots and the stepper buttons are circles. No pills on large controls.

## Components

### Buttons
- **Primary:** full-width ink fill, on-ink label, 52px tall, 12px radius; pressed lowers opacity to 0.82; disabled uses the hairline fill with disabled text.
- **Secondary:** surface fill with a hairline outline; pressed uses the pressed fill.
- **Plain:** text only, for the quiet alternative ("Keep focusing", "Done").

### Segmented control
A track in the pressed color with the selected segment raised to surface with a hairline outline and a semibold label. Exposed as a radio group. Used for duration presets and block level.

### Lists
Inset grouped lists (iOS settings shape): one rounded surface, hairline separators inset 16px, footnote headers and footers. Rows: toggle row (native switch), nav row (chevron).

### Status row
A dot plus one sentence, with an optional action ("Blocking is off · Turn on").

### Signature: lock line and countdown
While a session runs, a 2px ink line along the top safe-area edge drains from full width to zero on every screen, and the Focus tab shows the countdown in display numerals.

## Do's and Don'ts

- **Do** use the platform's controls and icons (native tabs, switches, SF Symbols / Material Symbols).
- **Do** say what a control does ("Lock in", "End early", "Keep focusing") and what a level costs ("Ending early takes a 5-minute wait.").
- **Do** keep color next to words that state the same status.
- **Don't** add streaks, scores, confetti, mascots or progress rings.
- **Don't** add drop shadows, gradients or glass effects.
- **Don't** promise a block the OS cannot enforce (iPhone: only Clean Instagram is filtered until Screen Time ships).
