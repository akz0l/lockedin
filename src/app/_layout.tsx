import { Geist_500Medium, Geist_600SemiBold, useFonts } from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { FocusProvider } from '@/app-composition';
import { createAppServices } from '@/app-composition/create-app-services';
import { LockLine } from '@/focus-session/ui/lock-line';
import { fonts, useTheme } from '@/shared/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colors } = useTheme();
  const [services] = useState(createAppServices);
  const [fontsLoaded, fontError] = useFonts({ Geist_500Medium, Geist_600SemiBold });
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    const { syncClock, reapply } = services.store.getState();
    syncClock();
    reapply();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      services.store.getState().syncClock();
      services.store.getState().reapply();
    });
    return () => subscription.remove();
  }, [services]);

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <FocusProvider services={services}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.ground },
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.ground },
          headerTitleStyle: { fontFamily: fonts.displaySemiBold },
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="apps" options={{ title: 'Blocked apps' }} />
        <Stack.Screen name="duration" options={{ title: 'Custom duration', presentation: 'formSheet', sheetAllowedDetents: [0.5] }} />
        <Stack.Screen name="permissions" options={{ title: 'Turn on blocking', presentation: 'modal' }} />
      </Stack>
      <LockLine />
    </FocusProvider>
  );
}
