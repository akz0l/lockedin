import { activeFilterCount, DEFAULT_FILTERS, FILTERS, setFilter } from '../filters';

describe('content filters', () => {
  it('ships Instagram Reels, Instagram Explore and YouTube Shorts, all on by default', () => {
    expect(FILTERS.map((f) => f.id)).toEqual(['instagramReels', 'instagramExplore', 'youtubeShorts']);
    expect(DEFAULT_FILTERS).toEqual({ instagramReels: true, instagramExplore: true, youtubeShorts: true });
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(3);
  });

  it('toggles one filter without touching the others', () => {
    const next = setFilter(DEFAULT_FILTERS, 'instagramExplore', false);
    expect(next).toEqual({ instagramReels: true, instagramExplore: false, youtubeShorts: true });
    expect(activeFilterCount(next)).toBe(2);
    expect(DEFAULT_FILTERS.instagramExplore).toBe(true);
  });
});
