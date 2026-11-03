import { formatCountdown, formatMinutes } from '../format';

describe('formatCountdown', () => {
  it.each([
    [25 * 60_000, '25:00'],
    [59_001, '1:00'],
    [59_000, '0:59'],
    [0, '0:00'],
    [-5_000, '0:00'],
    [90 * 60_000, '1:30:00'],
    [3_600_000 + 5_000, '1:00:05'],
  ])('formats %p ms as %p', (ms, expected) => {
    expect(formatCountdown(ms)).toBe(expected);
  });
});

describe('formatMinutes', () => {
  it.each([
    [25, '25 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
  ])('formats %p minutes as %p', (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected);
  });
});
