import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useShallow } from 'zustand/react/shallow';

import { useFocus } from '@/app-composition';
import { isActive } from '@/focus-session/domain';
import { formatClockTime, formatCountdown } from '@/focus-session/ui/format';
import { useNow } from '@/focus-session/ui/use-now';
import { radius, space, useTheme } from '@/shared/theme';
import { AppText, Button } from '@/shared/ui';

import { buildInstagramInjection, isInstagramUrl } from '../instagram-injection';

const HOME = 'https://www.instagram.com/';
/** Appended to WebKit's user agent so Instagram serves its regular mobile site. */
const SAFARI_SUFFIX = 'Version/18.0 Mobile/15E148 Safari/604.1';
const FEATURE_NAME = { reels: 'Reels are', explore: 'Explore is' } as const;

export function CleanInstagramScreen() {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const { session, reels, explore } = useFocus(
    useShallow(({ session, filters }) => ({
      session,
      reels: filters.instagramReels,
      explore: filters.instagramExplore,
    })),
  );
  const now = useNow(session !== null, 1000, session);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const notice = useNotice();

  const injection = useMemo(() => buildInstagramInjection({ reels, explore }), [reels, explore]);

  if (session && isActive(session, now)) {
    return (
      <View style={[styles.center, { paddingTop: top }]}>
        <AppText variant="title">Locked in</AppText>
        <AppText variant="display" tabular role="timer">
          {formatCountdown(session.endsAt - now)}
        </AppText>
        <AppText color="textSecondary">Instagram opens again at {formatClockTime(session.endsAt)}.</AppText>
      </View>
    );
  }

  if (failed) {
    return (
      <View style={[styles.center, { paddingTop: top }]}>
        <AppText color="textSecondary">Couldn't load Instagram. Check your connection.</AppText>
        <Button
          variant="secondary"
          label="Try again"
          onPress={() => {
            setFailed(false);
            setReloadKey((key) => key + 1);
          }}
        />
      </View>
    );
  }

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; feature?: keyof typeof FEATURE_NAME };
      if (message.type === 'blocked' && message.feature) notice.show(`${FEATURE_NAME[message.feature]} off in LockedIn`);
    } catch {
      // Messages from Instagram's own scripts are not ours to read.
    }
  };

  return (
    <View style={[styles.fill, { paddingTop: top, backgroundColor: colors.ground }]}>
      <WebView
        key={`${reels}-${explore}-${reloadKey}`}
        source={{ uri: HOME }}
        injectedJavaScriptBeforeContentLoaded={injection}
        applicationNameForUserAgent={SAFARI_SUFFIX}
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        allowsInlineMediaPlayback
        onMessage={onMessage}
        onError={() => setFailed(true)}
        onShouldStartLoadWithRequest={(request) => {
          if (!request.isTopFrame || isInstagramUrl(request.url)) return true;
          void Linking.openURL(request.url);
          return false;
        }}
        style={styles.fill}
      />
      {notice.text ? (
        <View
          role="alert"
          accessible
          accessibilityLiveRegion="polite"
          style={[styles.notice, { backgroundColor: colors.ink }]}>
          <AppText variant="callout" color="onInk">
            {notice.text}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function useNotice() {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return {
    text,
    show: (message: string) => {
      setText(message);
      AccessibilityInfo.announceForAccessibility(message);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setText(null), 2500);
    },
  };
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
  notice: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    bottom: space.xl,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.card,
    alignItems: 'center',
  },
});
