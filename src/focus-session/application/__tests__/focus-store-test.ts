import type { BlockerPort, BlockingPolicy } from '@/app-blocking/domain';
import { FocusSessionError } from '@/focus-session/domain';
import { createMemoryStorage, type KeyValueStorage } from '@/shared/storage/key-value-storage';

import { createFocusStore, STORAGE_KEY } from '../focus-store';
import type { SessionNotifier } from '../ports';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 3, 9, 0, 0);

function setup(storage: KeyValueStorage = createMemoryStorage()) {
  let now = T0;
  const applied: BlockingPolicy[] = [];
  const blocker: BlockerPort = {
    capabilities: { appBlocking: true, inAppFilters: true },
    getStatus: async () => ({ serviceEnabled: true }),
    openServiceSettings: async () => {},
    listLaunchableApps: async () => [],
    applyPolicy: async (policy) => void applied.push(policy),
  };
  const notifier: SessionNotifier = { scheduleSessionEnd: jest.fn(async () => {}), cancelSessionEnd: jest.fn(async () => {}) };
  const store = createFocusStore({ storage, blocker, notifier, clock: () => now });
  return {
    store,
    storage,
    applied,
    notifier,
    advance: (ms: number) => void (now += ms),
    lastPolicy: () => applied[applied.length - 1],
  };
}

describe('focus store', () => {
  it('starts with all filters on, 25 minutes, soft level and no session', () => {
    const { store } = setup();
    const state = store.getState();
    expect(state.filters).toEqual({ instagramReels: true, instagramExplore: true, youtubeShorts: true });
    expect(state.preferences).toEqual({ durationMinutes: 25, level: 'soft', blockedPackages: [] });
    expect(state.session).toBeNull();
  });

  it('starting a session enforces it, schedules the end notice and persists it', () => {
    const { store, storage, lastPolicy, notifier } = setup();
    store.getState().setLevel('strict');
    store.getState().setDuration(50);
    store.getState().setBlockedPackages(['com.zhiliaoapp.musically']);

    store.getState().startSession();

    const session = store.getState().session;
    expect(session).toMatchObject({ startedAt: T0, endsAt: T0 + 50 * MIN, level: 'strict' });
    expect(lastPolicy().session).toEqual({
      endsAt: T0 + 50 * MIN,
      level: 'strict',
      blockedPackages: ['com.zhiliaoapp.musically'],
      exitRequestedAt: null,
    });
    expect(notifier.scheduleSessionEnd).toHaveBeenCalledWith(T0 + 50 * MIN);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).session.endsAt).toBe(T0 + 50 * MIN);
  });

  it('toggling a filter is enforced immediately', () => {
    const { store, lastPolicy } = setup();
    store.getState().setFilter('youtubeShorts', false);
    expect(lastPolicy().filters).toEqual({ instagramReels: true, instagramExplore: true, youtubeShorts: false });
    expect(lastPolicy().session).toBeNull();
  });

  it('restores filters, preferences and the session after a restart', () => {
    const first = setup();
    first.store.getState().setFilter('instagramExplore', false);
    first.store.getState().setLevel('firm');
    first.store.getState().startSession();

    const second = setup(first.storage);
    expect(second.store.getState().filters.instagramExplore).toBe(false);
    expect(second.store.getState().preferences.level).toBe('firm');
    expect(second.store.getState().session?.endsAt).toBe(T0 + 25 * MIN);
  });

  it('ending early follows the level rules', () => {
    const { store, advance, lastPolicy, notifier } = setup();
    store.getState().setLevel('firm');
    store.getState().startSession();

    store.getState().requestExit();
    expect(lastPolicy().session?.exitRequestedAt).toBe(T0);
    expect(() => store.getState().endSession()).toThrow(new FocusSessionError('EARLY_EXIT_NOT_READY'));

    advance(5 * MIN);
    store.getState().endSession();

    expect(store.getState().session).toBeNull();
    expect(lastPolicy().session).toBeNull();
    expect(notifier.cancelSessionEnd).toHaveBeenCalled();
  });

  it('a strict session cannot be ended early', () => {
    const { store } = setup();
    store.getState().setLevel('strict');
    store.getState().startSession();
    expect(() => store.getState().requestExit()).toThrow(new FocusSessionError('EARLY_EXIT_DENIED'));
    expect(() => store.getState().endSession()).toThrow(new FocusSessionError('EARLY_EXIT_DENIED'));
    expect(store.getState().session).not.toBeNull();
  });

  it('clears an expired session and lifts the block', () => {
    const { store, advance, lastPolicy } = setup();
    store.getState().startSession();
    advance(25 * MIN);

    store.getState().syncClock();

    expect(store.getState().session).toBeNull();
    expect(lastPolicy().session).toBeNull();
  });

  it('settings cannot change while a session runs', () => {
    const { store } = setup();
    store.getState().startSession();
    store.getState().setLevel('soft');
    store.getState().setDuration(90);
    expect(store.getState().preferences.durationMinutes).toBe(25);
    expect(store.getState().session?.level).toBe('soft');
  });

  it('ignores a corrupted saved state and starts from defaults', () => {
    const { store } = setup(createMemoryStorage({ [STORAGE_KEY]: '{not json' }));
    expect(store.getState().session).toBeNull();
    expect(store.getState().filters.instagramReels).toBe(true);
  });
});
