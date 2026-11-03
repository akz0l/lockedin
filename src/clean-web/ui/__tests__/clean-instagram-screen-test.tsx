import { act, fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { createTestServices, IOS, renderWithServices } from '@/test-utils/render-with-services';

import { CleanInstagramScreen } from '../clean-instagram-screen';

type WebViewProps = {
  injectedJavaScriptBeforeContentLoaded: string;
  onMessage: (event: { nativeEvent: { data: string } }) => void;
  onError: () => void;
  onShouldStartLoadWithRequest: (request: { url: string; isTopFrame: boolean }) => boolean;
};

let lastWebView: WebViewProps | null = null;

jest.mock('react-native-webview', () => {
  const { View } = jest.requireActual('react-native');
  return {
    WebView: (props: WebViewProps) => {
      lastWebView = props;
      return <View testID="instagram-webview" />;
    },
  };
});

const webView = () => {
  if (!lastWebView) throw new Error('WebView not rendered');
  return lastWebView;
};

beforeEach(() => {
  lastWebView = null;
});

describe('CleanInstagramScreen', () => {
  it('loads Instagram with the enabled filters injected', async () => {
    const services = createTestServices({ capabilities: IOS });
    services.store.getState().setFilter('instagramExplore', false);
    await renderWithServices(<CleanInstagramScreen />, services);

    expect(screen.getByTestId('instagram-webview')).toBeOnTheScreen();
    expect(webView().injectedJavaScriptBeforeContentLoaded).toContain('"reels"');
    expect(webView().injectedJavaScriptBeforeContentLoaded).not.toContain('"explore"');
  });

  it('tells the user when a blocked feature was closed', async () => {
    await renderWithServices(<CleanInstagramScreen />, createTestServices({ capabilities: IOS }));

    await act(() => {
      webView().onMessage({ nativeEvent: { data: '{"type":"blocked","feature":"reels"}' } });
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Reels are off in LockedIn');
  });

  it('keeps Instagram inside and opens other sites in the browser', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await renderWithServices(<CleanInstagramScreen />, createTestServices({ capabilities: IOS }));

    expect(webView().onShouldStartLoadWithRequest({ url: 'https://www.instagram.com/direct/inbox/', isTopFrame: true })).toBe(true);
    expect(webView().onShouldStartLoadWithRequest({ url: 'https://example.com/article', isTopFrame: true })).toBe(false);
    expect(openURL).toHaveBeenCalledWith('https://example.com/article');
  });

  it('is locked during a focus session', async () => {
    const services = createTestServices({ capabilities: IOS });
    services.store.getState().startSession();
    await renderWithServices(<CleanInstagramScreen />, services);

    expect(screen.getByText('Locked in')).toBeOnTheScreen();
    expect(screen.getByText(/Instagram opens again at/)).toBeOnTheScreen();
    expect(screen.queryByTestId('instagram-webview')).not.toBeOnTheScreen();
  });

  it('offers a retry when Instagram fails to load', async () => {
    await renderWithServices(<CleanInstagramScreen />, createTestServices({ capabilities: IOS }));

    await act(() => {
      webView().onError();
    });
    expect(screen.getByText("Couldn't load Instagram. Check your connection.")).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByTestId('instagram-webview')).toBeOnTheScreen();
  });
});
