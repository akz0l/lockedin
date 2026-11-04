import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

import { fonts, type Palette } from '@/shared/theme';

type ScreenOptions = Exclude<NonNullable<ComponentProps<typeof Stack.Screen>['options']>, (...args: never[]) => unknown>;

/**
 * Header for the stack inside each tab: native large title over the screen ground.
 * The header stays transparent: a header background color hides the large title on iOS 26 and later.
 */
export function tabStackOptions(colors: Palette): ScreenOptions {
  return {
    headerLargeTitle: true,
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerTintColor: colors.text,
    headerTitleStyle: { fontFamily: fonts.displaySemiBold },
    headerLargeTitleStyle: { fontFamily: fonts.displaySemiBold },
    contentStyle: { backgroundColor: colors.ground },
  };
}
