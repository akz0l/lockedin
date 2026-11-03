import Storage from 'expo-sqlite/kv-store';

import type { KeyValueStorage } from './key-value-storage';

/** On-device storage backed by expo-sqlite's key-value store. */
export const deviceStorage: KeyValueStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => void Storage.removeItemSync(key),
};
