import { renderHook } from '@testing-library/react-native';

import { useNow } from '../use-now';

describe('useNow', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('never reads ahead of the real clock, so a rule it unlocks is already true in the store', async () => {
    jest.setSystemTime(new Date('2026-11-03T09:00:00.040Z'));
    const { result } = await renderHook(() => useNow(true));
    expect(result.current).toBeLessThanOrEqual(Date.now());
  });
});
