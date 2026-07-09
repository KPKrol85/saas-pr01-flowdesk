import { describe, expect, it, vi } from 'vitest';
import { createStatePersistence, STATE_STORAGE_KEY } from '../../js/core/persistence.js';
import { createFlowDeskStore } from '../../js/core/store.js';
import { seedData } from '../../js/data/seed.js';
import { createLocalStorageRepositoryAdapter } from '../../js/repositories/localStorageRepositoryAdapter.js';
import { createFlowDeskRepositories } from '../../js/repositories/index.js';
import { REPOSITORY_ERRORS, repositoryFail, repositoryOk } from '../../js/repositories/repositoryResults.js';

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

describe('repository layer', () => {
  it('returns predictable repository result shapes', () => {
    expect(repositoryOk({ id: 'record-1' }, { clients: [] })).toEqual({
      ok: true,
      data: { id: 'record-1' },
      state: { clients: [] }
    });
    expect(repositoryFail(REPOSITORY_ERRORS.VALIDATION, [{ field: 'name' }])).toEqual({
      ok: false,
      error: REPOSITORY_ERRORS.VALIDATION,
      issues: [{ field: 'name' }]
    });
  });

  it('loads and saves state through the localStorage repository adapter', () => {
    const { adapter, values } = createMemoryStorage({
      clients: [{ id: 'c-legacy', name: 'Legacy', email: 'legacy@test.pl' }],
      projects: [],
      events: [],
      ui: { theme: 'unknown' }
    });
    const repositoryAdapter = createLocalStorageRepositoryAdapter({ storageAdapter: adapter, seedState: seedData });

    const state = repositoryAdapter.loadState();
    const saved = repositoryAdapter.saveState({ ...state, ui: { theme: 'dark', reducedMotion: true } });

    expect(state.schemaVersion).toBe(3);
    expect(adapter.get).toHaveBeenCalledWith(STATE_STORAGE_KEY);
    expect(values.get(STATE_STORAGE_KEY)).toEqual(saved);
    expect(saved.ui).toEqual({ theme: 'dark', reducedMotion: true });
  });

  it('supports clients repository collection operations with normalized data', () => {
    const { adapter } = createMemoryStorage(seedData);
    const repositoryAdapter = createLocalStorageRepositoryAdapter({ storageAdapter: adapter, seedState: seedData });
    const { clientsRepository } = createFlowDeskRepositories({ adapter: repositoryAdapter });

    const created = clientsRepository.create({ id: 'c-repo', name: 'Repo Client', email: 'Repo@Client.test' });
    const updated = clientsRepository.update('c-repo', { owner: 'Manager' });
    const archived = clientsRepository.archive('c-repo', '2026-07-05T10:00:00.000Z');
    const restored = clientsRepository.restore('c-repo');

    expect(created.ok).toBe(true);
    expect(created.data).toMatchObject({ id: 'c-repo', email: 'repo@client.test', segment: 'SMB' });
    expect(updated.data.owner).toBe('Manager');
    expect(archived.data.archivedAt).toBe('2026-07-05T10:00:00.000Z');
    expect(restored.data.archivedAt).toBe('');
    expect(clientsRepository.getById('missing')).toMatchObject({ ok: false, error: REPOSITORY_ERRORS.NOT_FOUND });
  });

  it('rejects duplicate record ids through predictable repository failures', () => {
    const { adapter } = createMemoryStorage(seedData);
    const repositoryAdapter = createLocalStorageRepositoryAdapter({ storageAdapter: adapter, seedState: seedData });
    const { clientsRepository, projectsRepository } = createFlowDeskRepositories({ adapter: repositoryAdapter });

    const duplicateCreate = clientsRepository.create({ id: 'c1', name: 'Duplicate Client', email: 'duplicate@test.pl' });
    const duplicateReplace = projectsRepository.replaceAll([
      { id: 'p-duplicate', name: 'First Job' },
      { id: 'p-duplicate', name: 'Second Job' }
    ]);

    expect(duplicateCreate).toMatchObject({
      ok: false,
      error: REPOSITORY_ERRORS.VALIDATION,
      issues: [expect.objectContaining({ field: 'id' })]
    });
    expect(duplicateReplace).toMatchObject({
      ok: false,
      error: REPOSITORY_ERRORS.VALIDATION,
      issues: [expect.objectContaining({ field: 'id' })]
    });
  });

  it('exposes project and event repositories on the same adapter boundary', () => {
    const { adapter } = createMemoryStorage(seedData);
    const repositoryAdapter = createLocalStorageRepositoryAdapter({ storageAdapter: adapter, seedState: seedData });
    const { projectsRepository, eventsRepository } = createFlowDeskRepositories({ adapter: repositoryAdapter });

    expect(projectsRepository.list().data.length).toBe(seedData.projects.length);
    expect(eventsRepository.getById('e1').data).toMatchObject({ id: 'e1', type: 'General' });

    projectsRepository.replaceAll([]);

    expect(projectsRepository.list().data).toEqual([]);
  });

  it('allows store actions to persist through an injected repository-backed persistence boundary', () => {
    const { adapter } = createMemoryStorage(seedData);
    const persistence = createStatePersistence({ storageAdapter: adapter, seedState: seedData });
    const store = createFlowDeskStore({ persistence });

    const client = store.addClient({ name: 'Boundary Client', email: 'boundary@test.pl' });
    const repositoryResult = store.repositories.clientsRepository.getById(client.id);

    expect(repositoryResult.ok).toBe(true);
    expect(repositoryResult.data).toMatchObject({ id: client.id, name: 'Boundary Client' });
  });
});
