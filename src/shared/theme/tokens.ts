import { Platform } from 'react-native';

/**
 * Monochrome ink-and-paper palette. Status colors only carry state:
 * on (success), needs attention (warning), strict or blocked (danger), off (muted).
 */
const light = {
  ground: '#FAFAFA',
  surface: '#FFFFFF',
  hairline: '#E5E5E5',
  text: '#000000',
  textSecondary: '#5F5F5F',
  textDisabled: '#A3A3A3',
  ink: '#000000',
  onInk: '#FFFFFF',
  pressed: '#F0F0F0',
  success: '#15803D',
  warning: '#B45309',
  danger: '#DC2626',
  muted: '#A3A3A3',
} as const;

const dark: Record<keyof typeof light, string> = {
  ground: '#000000',
  surface: '#0F0F0F',
  hairline: '#262626',
  text: '#EDEDED',
  textSecondary: '#A1A1A1',
  textDisabled: '#5C5C5C',
  ink: '#EDEDED',
  onInk: '#000000',
  pressed: '#1A1A1A',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#FF6166',
  muted: '#5C5C5C',
};

export type ColorRole = keyof typeof light;
export type Palette = Record<ColorRole, string>;

export const palettes: Record<'light' | 'dark', Palette> = { light, dark };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { control: 10, card: 12 } as const;

/** 44pt (iOS) and 48dp (Android) minimum; 48 satisfies both. */
export const minTouchTarget = 48;

export const fonts = {
  displayMedium: 'Geist_500Medium',
  displaySemiBold: 'Geist_600SemiBold',
} as const;

const bodySize = Platform.select({ ios: 17, default: 16 });

export const type = {
  display: { fontFamily: fonts.displaySemiBold, fontSize: 88, lineHeight: 96, letterSpacing: -2.6 },
  largeTitle: { fontFamily: fonts.displaySemiBold, fontSize: 34, lineHeight: 41, letterSpacing: -0.7 },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  headline: { fontSize: bodySize, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: bodySize, lineHeight: 22 },
  callout: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
} as const;

export type TypeVariant = keyof typeof type;
