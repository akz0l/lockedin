/// <reference types="node" />
// Node types stay local to this test: the app itself runs on React Native, not Node.
import { readdirSync } from 'fs';
import { join, relative, sep } from 'path';

const APP_DIR = join(__dirname, '..', '..', 'app');

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(path);
    const isScreen = /\.tsx?$/.test(entry.name) && !entry.name.startsWith('_') && !entry.name.startsWith('+');
    return isScreen ? [relative(APP_DIR, path)] : [];
  });
}

/** The URL Expo Router serves a route file at: groups and a trailing index add nothing. */
function urlOf(file: string): string {
  const segments = file
    .replace(/\.tsx?$/, '')
    .split(sep)
    .filter((segment) => !/^\(.+\)$/.test(segment));
  if (segments.at(-1) === 'index') segments.pop();
  return `/${segments.join('/')}`;
}

describe('app routes', () => {
  const urls = routeFiles(APP_DIR).map((file) => ({ file, url: urlOf(file) }));

  it('gives every screen its own URL', () => {
    const files = new Map<string, string[]>();
    for (const { file, url } of urls) files.set(url, [...(files.get(url) ?? []), file]);
    const shared = [...files.entries()].filter(([, owners]) => owners.length > 1);

    expect(shared).toEqual([]);
  });

  it('opens the Focus screen at launch', () => {
    expect(urls.filter(({ url }) => url === '/').map(({ file }) => file)).toEqual([
      join('(tabs)', '(focus)', 'index.tsx'),
    ]);
  });
});
