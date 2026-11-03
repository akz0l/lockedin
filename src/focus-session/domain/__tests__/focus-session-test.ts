import {
  cancelExitRequest,
  createSession,
  earlyExit,
  endSession,
  isActive,
  remainingFraction,
  remainingMs,
  requestExit,
} from '../focus-session';
import { FocusSessionError } from '../errors';

const MIN = 60_000;
const NOW = Date.UTC(2026, 10, 3, 9, 0, 0);

function session(level: 'soft' | 'firm' | 'strict', durationMinutes = 25) {
  return createSession({ now: NOW, durationMinutes, level, blockedPackages: ['com.zhiliaoapp.musically'] });
}

describe('createSession', () => {
  it('ends after the chosen duration', () => {
    const s = session('firm', 50);
    expect(s.startedAt).toBe(NOW);
    expect(s.endsAt).toBe(NOW + 50 * MIN);
    expect(s.level).toBe('firm');
    expect(s.blockedPackages).toEqual(['com.zhiliaoapp.musically']);
    expect(s.exitRequestedAt).toBeNull();
  });

  it.each([0, 4, 481, 12.5])('rejects a duration of %p minutes', (durationMinutes) => {
    expect(() => session('soft', durationMinutes)).toThrow(new FocusSessionError('INVALID_DURATION'));
  });

  it('accepts the 5 and 480 minute bounds', () => {
    expect(session('soft', 5).endsAt).toBe(NOW + 5 * MIN);
    expect(session('soft', 480).endsAt).toBe(NOW + 480 * MIN);
  });
});

describe('time left', () => {
  it('is active until endsAt and reports the remaining time', () => {
    const s = session('soft', 25);
    expect(isActive(s, NOW + 10 * MIN)).toBe(true);
    expect(remainingMs(s, NOW + 10 * MIN)).toBe(15 * MIN);
    expect(remainingFraction(s, NOW + 10 * MIN)).toBeCloseTo(0.6);
  });

  it('expires exactly at endsAt and never goes negative', () => {
    const s = session('soft', 25);
    expect(isActive(s, s.endsAt)).toBe(false);
    expect(remainingMs(s, s.endsAt + MIN)).toBe(0);
    expect(remainingFraction(s, s.endsAt + MIN)).toBe(0);
  });
});

describe('early exit by block level', () => {
  it('soft: requires a 10 second pause after the request', () => {
    const s = session('soft');
    expect(earlyExit(s, NOW + MIN)).toEqual({ kind: 'request-required', delayMs: 10_000 });

    const requested = requestExit(s, NOW + MIN);
    expect(earlyExit(requested, NOW + MIN + 9_999)).toEqual({ kind: 'wait', availableAt: NOW + MIN + 10_000 });
    expect(earlyExit(requested, NOW + MIN + 10_000)).toEqual({ kind: 'allowed' });
  });

  it('firm: requires a 5 minute wait after the request', () => {
    const requested = requestExit(session('firm'), NOW + MIN);
    expect(earlyExit(requested, NOW + 5 * MIN)).toEqual({ kind: 'wait', availableAt: NOW + 6 * MIN });
    expect(earlyExit(requested, NOW + 6 * MIN)).toEqual({ kind: 'allowed' });
  });

  it('strict: never allows ending early', () => {
    const s = session('strict');
    expect(earlyExit(s, NOW + 24 * MIN)).toEqual({ kind: 'denied' });
    expect(() => requestExit(s, NOW + MIN)).toThrow(new FocusSessionError('EARLY_EXIT_DENIED'));
  });

  it('keeps the first request time when asked again', () => {
    const first = requestExit(session('firm'), NOW + MIN);
    expect(requestExit(first, NOW + 3 * MIN).exitRequestedAt).toBe(NOW + MIN);
  });

  it('cancelling the request restarts the wait', () => {
    const cancelled = cancelExitRequest(requestExit(session('firm'), NOW + MIN));
    expect(cancelled.exitRequestedAt).toBeNull();
    expect(earlyExit(cancelled, NOW + 10 * MIN).kind).toBe('request-required');
  });

  it('allows ending any level once the session expired', () => {
    const s = session('strict', 25);
    expect(earlyExit(s, s.endsAt)).toEqual({ kind: 'allowed' });
  });
});

describe('endSession', () => {
  it('ends when the exit is allowed', () => {
    const requested = requestExit(session('soft'), NOW);
    expect(() => endSession(requested, NOW + 10_000)).not.toThrow();
  });

  it('refuses while the wait is running or the level forbids it', () => {
    const requested = requestExit(session('firm'), NOW);
    expect(() => endSession(requested, NOW + MIN)).toThrow(new FocusSessionError('EARLY_EXIT_NOT_READY'));
    expect(() => endSession(session('strict'), NOW + MIN)).toThrow(new FocusSessionError('EARLY_EXIT_DENIED'));
  });
});
