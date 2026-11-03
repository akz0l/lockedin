export type CleanInstagramFilters = { reels: boolean; explore: boolean };

type Feature = keyof CleanInstagramFilters;

type PathRule = {
  feature: Feature;
  /** First path segment that identifies the feature. */
  segments: string[];
  /** Second segments that stay usable (Explore search). */
  allowSecond: string[];
  redirect: string;
};

const RULES: PathRule[] = [
  { feature: 'reels', segments: ['reels', 'reel'], allowSecond: [], redirect: '/' },
  { feature: 'explore', segments: ['explore'], allowSecond: ['search'], redirect: '/explore/search/' },
];

const CSS: Record<Feature, string> = {
  // Reels tab, reel links and feed posts that are reels.
  reels: 'a[href^="/reels/"], a[href^="/reel/"], article:has(a[href^="/reel/"]) { display: none !important; }',
  explore: '',
};

/** The Explore button goes straight to search, so search survives the Explore filter. */
const REWRITES: Record<Feature, { from: string; to: string }[]> = {
  reels: [],
  explore: [{ from: '/explore/', to: '/explore/search/' }],
};

const ALLOWED_HOSTS = ['instagram.com', 'cdninstagram.com', 'facebook.com', 'fbcdn.net'];

export function blockedPath(path: string, filters: CleanInstagramFilters): { feature: Feature; redirect: string } | null {
  const [first, second] = path.split('/').filter((part) => part.length > 0);
  const rule = RULES.find(
    (r) => filters[r.feature] && first !== undefined && r.segments.includes(first) && !r.allowSecond.includes(second ?? ''),
  );
  return rule ? { feature: rule.feature, redirect: rule.redirect } : null;
}

export function isInstagramUrl(url: string): boolean {
  const host = /^https?:\/\/([^/:?#]+)/i.exec(url)?.[1]?.toLowerCase();
  return host !== undefined && ALLOWED_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/**
 * Script injected before Instagram's own code runs. Mirrors `blockedPath` (the rules
 * are shared as data) because Hermes cannot serialize functions to source.
 */
export function buildInstagramInjection(filters: CleanInstagramFilters): string {
  const enabled = (Object.keys(filters) as Feature[]).filter((feature) => filters[feature]);
  const config = {
    rules: RULES.filter((rule) => filters[rule.feature]),
    css: enabled.map((feature) => CSS[feature]).filter(Boolean).join('\n'),
    rewrites: enabled.flatMap((feature) => REWRITES[feature]),
  };

  return `(function () {
  var config = ${JSON.stringify(config)};
  function match(path) {
    var parts = path.split('/').filter(function (part) { return part.length > 0; });
    if (parts.length === 0) return null;
    for (var i = 0; i < config.rules.length; i++) {
      var rule = config.rules[i];
      if (rule.segments.indexOf(parts[0]) === -1) continue;
      if (rule.allowSecond.indexOf(parts[1] || '') !== -1) continue;
      return rule;
    }
    return null;
  }
  function guard() {
    var rule = match(window.location.pathname);
    if (!rule) return;
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'blocked', feature: rule.feature }));
    }
    window.location.replace(rule.redirect);
  }
  ['pushState', 'replaceState'].forEach(function (name) {
    var original = window.history[name];
    window.history[name] = function () {
      var result = original.apply(window.history, arguments);
      guard();
      return result;
    };
  });
  window.addEventListener('popstate', guard);
  var pending = false;
  function rewrite() {
    pending = false;
    config.rewrites.forEach(function (r) {
      var links = document.querySelectorAll('a[href="' + r.from + '"]');
      for (var i = 0; i < links.length; i++) links[i].setAttribute('href', r.to);
    });
  }
  function scheduleRewrite() {
    if (pending) return;
    pending = true;
    setTimeout(rewrite, 150);
  }
  function onReady() {
    if (config.css) {
      var style = document.createElement('style');
      style.textContent = config.css;
      (document.head || document.documentElement).appendChild(style);
    }
    rewrite();
    if (config.rewrites.length > 0 && window.MutationObserver) {
      new window.MutationObserver(scheduleRewrite).observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();
  guard();
})();
true;`;
}
