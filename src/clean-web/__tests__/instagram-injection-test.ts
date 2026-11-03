import { blockedPath, buildInstagramInjection, isInstagramUrl } from '../instagram-injection';

const ALL = { reels: true, explore: true };

describe('blockedPath', () => {
  it.each([
    ['/reels/', 'reels', '/'],
    ['/reels/C1abc/', 'reels', '/'],
    ['/reel/C1abc/', 'reels', '/'],
    ['/explore/', 'explore', '/explore/search/'],
    ['/explore/tags/cats/', 'explore', '/explore/search/'],
  ])('blocks %p as %p and redirects to %p', (path, feature, redirect) => {
    expect(blockedPath(path, ALL)).toEqual({ feature, redirect });
  });

  it.each(['/', '/direct/inbox/', '/stories/someone/123/', '/explore/search/', '/someone/', '/p/C1abc/', '/reelsfan/'])(
    'keeps %p usable',
    (path) => {
      expect(blockedPath(path, ALL)).toBeNull();
    },
  );

  it('does nothing for a filter that is off', () => {
    expect(blockedPath('/reels/', { reels: false, explore: true })).toBeNull();
    expect(blockedPath('/explore/', { reels: true, explore: false })).toBeNull();
  });
});

describe('isInstagramUrl', () => {
  it.each([
    ['https://www.instagram.com/direct/inbox/', true],
    ['https://instagram.com/', true],
    ['https://scontent.cdninstagram.com/v/abc.jpg', true],
    ['https://www.facebook.com/login/', true],
    ['https://example.com/article', false],
    ['https://instagram.com.evil.example/', false],
  ])('%p -> %p', (url, expected) => {
    expect(isInstagramUrl(url)).toBe(expected);
  });
});

/** Runs the injected script against a minimal browser-like environment. */
function runInjection(path: string, filters = ALL) {
  const replaced: string[] = [];
  const messages: string[] = [];
  const listeners: Record<string, (() => void)[]> = {};
  const location = {
    pathname: path,
    replace: (to: string) => {
      replaced.push(to);
      location.pathname = to;
    },
  };
  const history = {
    pushState: (_s: unknown, _t: string, url: string) => void (location.pathname = url),
    replaceState: (_s: unknown, _t: string, url: string) => void (location.pathname = url),
  };
  const head = { appendChild: jest.fn() };
  const document = {
    readyState: 'complete',
    head,
    documentElement: head,
    createElement: () => ({ textContent: '' }),
    addEventListener: jest.fn(),
    querySelectorAll: () => [],
  };
  const window = {
    location,
    history,
    addEventListener: (event: string, fn: () => void) => void (listeners[event] = [...(listeners[event] ?? []), fn]),
    ReactNativeWebView: { postMessage: (message: string) => void messages.push(message) },
    MutationObserver: class {
      observe() {}
    },
  };
  new Function('window', 'document', 'history', 'location', buildInstagramInjection(filters))(
    window,
    document,
    history,
    location,
  );
  return { window, history, replaced, messages, head, listeners };
}

describe('buildInstagramInjection', () => {
  it('redirects away from Reels on load and reports it', () => {
    const { replaced, messages } = runInjection('/reels/');
    expect(replaced).toEqual(['/']);
    expect(JSON.parse(messages[0])).toEqual({ type: 'blocked', feature: 'reels' });
  });

  it('catches in-app navigation to Explore and sends it to search', () => {
    const { history, replaced } = runInjection('/');
    expect(replaced).toEqual([]);

    history.pushState({}, '', '/explore/');

    expect(replaced).toEqual(['/explore/search/']);
  });

  it('injects the hiding styles for enabled filters only', () => {
    const { head } = runInjection('/', { reels: true, explore: false });
    const css: string = head.appendChild.mock.calls[0][0].textContent;
    expect(css).toContain('a[href^="/reels/"]');
    expect(css).not.toContain('/explore');
  });

  it('leaves DMs alone', () => {
    const { history, replaced } = runInjection('/direct/inbox/');
    history.pushState({}, '', '/direct/t/123/');
    expect(replaced).toEqual([]);
  });
});
