export type FilterId = 'instagramReels' | 'instagramExplore' | 'youtubeShorts';

export type FilterDefinition = {
  id: FilterId;
  app: 'Instagram' | 'YouTube';
  feature: string;
  description: string;
};

export const FILTERS: readonly FilterDefinition[] = [
  {
    id: 'instagramReels',
    app: 'Instagram',
    feature: 'Reels',
    description: 'Closes Reels, including reels shared in chats.',
  },
  {
    id: 'instagramExplore',
    app: 'Instagram',
    feature: 'Explore',
    description: 'Closes the Explore grid of suggested posts. Search still works.',
  },
  {
    id: 'youtubeShorts',
    app: 'YouTube',
    feature: 'Shorts',
    description: 'Closes the Shorts player.',
  },
];

export type FilterSettings = Record<FilterId, boolean>;

export const DEFAULT_FILTERS: FilterSettings = {
  instagramReels: true,
  instagramExplore: true,
  youtubeShorts: true,
};

export function setFilter(settings: FilterSettings, id: FilterId, enabled: boolean): FilterSettings {
  return { ...settings, [id]: enabled };
}

export function activeFilterCount(settings: FilterSettings): number {
  return Object.values(settings).filter(Boolean).length;
}
