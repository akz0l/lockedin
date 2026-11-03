import { Stack } from 'expo-router';

import { fonts, useTheme } from '@/shared/theme';

export default function FiltersStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerStyle: { backgroundColor: colors.ground },
        headerLargeStyle: { backgroundColor: colors.ground },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.displaySemiBold },
        headerLargeTitleStyle: { fontFamily: fonts.displaySemiBold },
        contentStyle: { backgroundColor: colors.ground },
      }}>
      <Stack.Screen name="index" options={{ title: 'Filters' }} />
    </Stack>
  );
}
