import { describe, expect, it, vi } from 'vitest';
import { seedData } from '../../js/data/seed.js';
import { createStatePersistence, STATE_STORAGE_KEY } from '../../js/core/persistence.js';

const createMemoryStorage = (initialState = null) => {
  const values = new Map();
  if (initialState) values.set(STATE_STORAGE_KEY, initialState);

  return {
    values,
    adapter: {
      get: vi.fn((key) => (values.has(key) ? values.get(key) : null)),
      set: vi.fn((key, value) => values.set(key, value)),
      remove: vi.fn((key) => values.delete(key))
    }
  };
};

describe('state persistence adapter', () => {
  it('loads localStorage data through migration and recovery rules', () => {
    const { adapter } = createMemoryStorage({
      clients: [{ id: 'c-old', name: 'Legacy Client', email: 'legacy@test.pl' }],
      projects: [{ id: 'p-old', name: 'Legacy job', clientId: 'missing-client', dueDate: 'broken-date' }],
      events: [{ id: 'e-old', title: 'Legacy event', clientId: 'missing-client', projectId: 'missing-project' }],
      ui: { theme: 'unknown', reducedMotion: true }
    });
    const persistence = createStatePersistence({ storageAdapter: adapter, seedState: seedData });

    const state = persistence.load();

    expect(adapter.get).toHaveBeenCalledWith(STATE_STORAGE_KEY);
    expect(state.schemaVersion).toBe(3);
    expect(state.projects[0]).toMatchObject({ clientId: '', dueDate: '' });
    expect(state.events[0]).toMatchObject({ clientId: '', projectId: '' });
    expect(state.ui).toEqual({ theme: 'light', reducedMotion: true });
  });

  it('saves normalized state back to the configured key', () => {
    const { adapter, values } = createMemoryStorage();
    const persistence = createStatePersistence({ storageAdapter: adapter, seedState: seedData });

    const saved = persistence.save({
      clients: [{ id: 'c-save', name: 'Saved Client', email: 'saved@test.pl' }],
      projects: [],
      events: [],
      ui: { theme: 'dark', reducedMotion: true }
    });

    expect(adapter.set).toHaveBeenCalledWith(STATE_STORAGE_KEY, saved);
    expect(values.get(STATE_STORAGE_KEY)).toEqual(saved);
    expect(saved).toMatchObject({ schemaVersion: 3, ui: { theme: 'dark', reducedMotion: true } });
  });

  it('restores imported state through the same migration path', () => {
    const { values, adapter } = createMemoryStorage();
    const persistence = createStatePersistence({ storageAdapter: adapter, seedState: seedData });

    const restored = persistence.restore({
      clients: [{ id: 'c-import', name: 'Imported Client', email: 'import@test.pl' }],
      projects: [],
      events: [],
      ui: { theme: 'dark' }
    });

    expect(restored.schemaVersion).toBe(3);
    expect(values.get(STATE_STORAGE_KEY)).toEqual(restored);
  });

  it('resets and removes persisted state', () => {
    const { values, adapter } = createMemoryStorage({ broken: true });
    const persistence = createStatePersistence({ storageAdapter: adapter, seedState: seedData });

    const resetState = persistence.reset();
    persistence.remove();

    expect(resetState.schemaVersion).toBe(3);
    expect(adapter.remove).toHaveBeenCalledWith(STATE_STORAGE_KEY);
    expect(values.has(STATE_STORAGE_KEY)).toBe(false);
  });
});
