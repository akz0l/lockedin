import { NativeTabs } from 'expo-router/native-tabs';
import { Platform } from 'react-native';

import { useTheme } from '@/shared/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <NativeTabs tintColor={colors.text}>
      <NativeTabs.Trigger name="(focus)">
        <NativeTabs.Trigger.Label>Focus</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'lock', selected: 'lock.fill' }} md="lock" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="filters">
        <NativeTabs.Trigger.Label>Filters</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="line.3.horizontal.decrease" md="filter_alt" />
      </NativeTabs.Trigger>
      {/* Android filters the official app; the clean Instagram tab is for iPhone. */}
      <NativeTabs.Trigger name="instagram" hidden={Platform.OS !== 'ios'}>
        <NativeTabs.Trigger.Label>Instagram</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'camera', selected: 'camera.fill' }} md="photo_camera" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
