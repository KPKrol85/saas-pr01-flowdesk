import { describe, expect, it } from 'vitest';
import { seedData } from '../../js/data/seed.js';
import { migrateState } from '../../js/domain/migrations.js';
import {
  ACTION_ERRORS,
  addProjectCommentAction,
  archiveClientAction,
  archiveProjectAction,
  createClientAction,
  createEventAction,
  createProjectAction,
  deleteClientAction,
  resetDemoDataAction,
  restoreArchivedProjectAction,
  restoreStateAction,
  restoreStateFromJsonAction,
  toggleProjectTaskAction,
  updateProjectAction,
  updateUiPreferencesAction
} from '../../js/core/actions.js';

const createState = () => migrateState(seedData, seedData);
const createEmptyState = () => migrateState({ clients: [], projects: [], events: [], ui: { theme: 'light' } }, seedData);

const createId = (prefix) => `${prefix}-test`;
const actionContext = { createId, createNow: () => '2026-07-04T12:00:00.000Z' };

describe('domain actions', () => {
  it('creates a client with a predictable success result', () => {
    const state = createState();

    const result = createClientAction(
      state,
      {
        name: 'Acme Service',
        email: 'Ops@Acme.test',
        phone: '+48 500 100 200',
        status: 'Aktywny',
        notes: 'Created from action test'
      },
      { createId }
    );

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ id: 'client-test', name: 'Acme Service', email: 'ops@acme.test' });
    expect(result.nextState.clients).toContainEqual(result.data);
    expect(state.clients).not.toContainEqual(result.data);
  });

  it('returns validation issues instead of throwing for invalid client data', () => {
    const result = createClientAction(createState(), { name: '', email: 'broken' }, { createId });

    expect(result).toMatchObject({
      ok: false,
      error: ACTION_ERRORS.VALIDATION
    });
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'name' }), expect.objectContaining({ field: 'email' })]));
  });

  it('rejects project writes with invalid client references', () => {
    const result = createProjectAction(
      createState(),
      {
        name: 'Broken project',
        clientId: 'missing-client',
        status: 'Draft',
        priority: 'High',
        dueDate: '2026-08-10'
      },
      { createId }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERRORS.VALIDATION);
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'clientId' }));
  });

  it('rejects non-empty references when the related collection has no matching records', () => {
    const projectResult = createProjectAction(
      createEmptyState(),
      {
        name: 'Orphan project',
        clientId: 'missing-client',
        status: 'Draft',
        priority: 'High'
      },
      { createId }
    );
    const eventResult = createEventAction(
      createEmptyState(),
      {
        title: 'Orphan event',
        date: '2026-08-10',
        clientId: 'missing-client',
        projectId: 'missing-project'
      },
      { createId }
    );

    expect(projectResult).toMatchObject({
      ok: false,
      error: ACTION_ERRORS.VALIDATION
    });
    expect(projectResult.issues).toContainEqual(expect.objectContaining({ field: 'clientId' }));
    expect(eventResult).toMatchObject({
      ok: false,
      error: ACTION_ERRORS.VALIDATION
    });
    expect(eventResult.issues).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'clientId' }), expect.objectContaining({ field: 'projectId' })]));
  });

  it('returns not_found for missing updates', () => {
    const result = updateProjectAction(createState(), 'missing-project', { name: 'No-op' });

    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERRORS.NOT_FOUND);
  });

  it('deletes a client and clears dependent project and event references', () => {
    const result = deleteClientAction(createState(), 'c1');

    expect(result.ok).toBe(true);
    expect(result.nextState.clients.some((client) => client.id === 'c1')).toBe(false);
    expect(result.nextState.projects.some((project) => project.clientId === 'c1')).toBe(false);
    expect(result.nextState.events.some((event) => event.clientId === 'c1')).toBe(false);
    expect(result.nextState.events.some((event) => event.projectId === 'p1')).toBe(false);
  });

  it('updates UI preferences through a normalized result', () => {
    const result = updateUiPreferencesAction(createState(), { theme: 'dark', reducedMotion: true });

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ theme: 'dark', reducedMotion: true });
    expect(result.nextState.ui).toEqual(result.data);
  });

  it('restores corrupted imported state through schema migration', () => {
    const result = restoreStateAction(
      {
        clients: [{ id: 'c-import', name: 'Imported', email: 'imported@test.pl' }],
        projects: [{ id: 'p-import', name: 'Imported job', clientId: 'missing-client', dueDate: 'bad-date' }],
        events: [{ id: 'e-import', title: 'Imported event', clientId: 'c-import', projectId: 'missing-project' }],
        ui: { theme: 'unknown', reducedMotion: true }
      },
      seedData
    );

    expect(result.ok).toBe(true);
    expect(result.data.schemaVersion).toBe(3);
    expect(result.data.projects[0]).toMatchObject({ clientId: '', dueDate: '' });
    expect(result.data.events[0]).toMatchObject({ clientId: 'c-import', projectId: '' });
    expect(result.data.ui).toEqual({ theme: 'light', reducedMotion: true });
  });

  it('returns a predictable error for malformed restored JSON', () => {
    const result = restoreStateFromJsonAction('{broken json', seedData);

    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERRORS.INVALID_JSON);
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'json' }));
  });

  it('rejects restored JSON with an invalid FlowDesk export shape', () => {
    const result = restoreStateFromJsonAction(JSON.stringify({ clients: 'broken', projects: [], events: [] }), seedData);

    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERRORS.INVALID_SCHEMA);
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'json' }));
  });

  it('rejects imported records that cannot be verified safely', () => {
    const result = restoreStateFromJsonAction(
      JSON.stringify({
        clients: [{ id: 'c-broken', name: 'Broken Client', email: 'not-an-email' }],
        projects: [],
        events: []
      }),
      seedData
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERRORS.INVALID_SCHEMA);
  });

  it('rejects imported state with duplicate top-level record ids', () => {
    const result = restoreStateFromJsonAction(
      JSON.stringify({
        clients: [
          { id: 'c-duplicate', name: 'First Client', email: 'first@test.pl' },
          { id: 'c-duplicate', name: 'Second Client', email: 'second@test.pl' }
        ],
        projects: [],
        events: []
      }),
      seedData
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe(ACTION_ERRORS.INVALID_SCHEMA);
    expect(result.issues).toContainEqual(expect.objectContaining({ field: 'json', message: expect.stringContaining('zduplikowane identyfikatory') }));
  });

  it('resets demo data through the migrated seed state', () => {
    const result = resetDemoDataAction(seedData);

    expect(result.ok).toBe(true);
    expect(result.data.schemaVersion).toBe(3);
    expect(result.data.clients.length).toBe(seedData.clients.length);
  });

  it('archives important records without permanently deleting them', () => {
    const clientResult = archiveClientAction(createState(), 'c1', actionContext);
    const projectResult = archiveProjectAction(createState(), 'p1', actionContext);

    expect(clientResult.ok).toBe(true);
    expect(clientResult.nextState.clients.find((client) => client.id === 'c1')).toMatchObject({ archivedAt: '2026-07-04T12:00:00.000Z' });
    expect(projectResult.ok).toBe(true);
    expect(projectResult.nextState.projects.find((project) => project.id === 'p1')).toMatchObject({ archivedAt: '2026-07-04T12:00:00.000Z' });
  });

  it('restores archived project records', () => {
    const archived = archiveProjectAction(createState(), 'p1', actionContext).nextState;
    const result = restoreArchivedProjectAction(archived, 'p1', actionContext);

    expect(result.ok).toBe(true);
    expect(result.nextState.projects.find((project) => project.id === 'p1').archivedAt).toBe('');
  });

  it('updates project tasks and comments through predictable action results', () => {
    const toggled = toggleProjectTaskAction(createState(), 'p1', 't2', actionContext);

    expect(toggled.ok).toBe(true);
    expect(toggled.data).toMatchObject({ id: 't2', done: true });

    const commented = addProjectCommentAction(toggled.nextState, 'p1', { body: 'Ready for client review' }, actionContext);

    expect(commented.ok).toBe(true);
    expect(commented.data).toMatchObject({ body: 'Ready for client review', author: 'Alicja Maj' });
    expect(commented.nextState.projects.find((project) => project.id === 'p1').comments).toContainEqual(commented.data);
  });
});
