import { Stack } from 'expo-router';

import { tabStackOptions } from '@/app-composition/tab-stack-options';
import { useTheme } from '@/shared/theme';

export default function FocusStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={tabStackOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Focus' }} />
    </Stack>
  );
}
