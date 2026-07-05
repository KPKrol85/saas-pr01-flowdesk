import { seedData } from '../data/seed.js';
import { storage } from '../utils/storage.js';
import { createLocalStorageRepositoryAdapter, STATE_STORAGE_KEY } from '../repositories/localStorageRepositoryAdapter.js';

export { STATE_STORAGE_KEY };

export const createStatePersistence = ({ key = STATE_STORAGE_KEY, seedState = seedData, storageAdapter = storage, repositoryAdapter = null } = {}) => {
  const adapter = repositoryAdapter || createLocalStorageRepositoryAdapter({ key, seedState, storageAdapter });
  return {
    load() {
      return adapter.loadState();
    },
    save(nextState) {
      return adapter.saveState(nextState);
    },
    restore(rawState) {
      return adapter.restoreState(rawState);
    },
    reset() {
      return adapter.resetState();
    },
    remove() {
      adapter.removeState();
    },
    repositoryAdapter: adapter
  };
};

export const statePersistence = createStatePersistence();
