import { seedData } from '../data/seed.js';
import { migrateState } from '../domain/migrations.js';
import { storage } from '../utils/storage.js';
import { repositoryOk } from './repositoryResults.js';

export const STATE_STORAGE_KEY = 'flowdesk_state_v1';

export const createLocalStorageRepositoryAdapter = ({ key = STATE_STORAGE_KEY, seedState = seedData, storageAdapter = storage } = {}) => {
  const normalize = (rawState) => migrateState(rawState, seedState);

  const loadState = () => normalize(storageAdapter.get(key));

  const saveState = (nextState) => {
    const normalizedState = normalize(nextState);
    storageAdapter.set(key, normalizedState);
    return normalizedState;
  };

  const updateState = (updater) => {
    const currentState = loadState();
    const nextState = saveState(updater(currentState));
    return repositoryOk(nextState, nextState);
  };

  return {
    kind: 'localStorage',
    loadState,
    saveState,
    restoreState(rawState) {
      return saveState(rawState);
    },
    resetState() {
      return saveState(seedState);
    },
    removeState() {
      storageAdapter.remove(key);
    },
    updateState
  };
};
