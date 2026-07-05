import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION } from '../../js/domain/constants.js';
import { migrateState } from '../../js/domain/migrations.js';
import { seedData } from '../../js/data/seed.js';

describe('state migrations', () => {
  it('adds the current schema version to legacy state', () => {
    const migrated = migrateState(
      {
        clients: seedData.clients,
        projects: seedData.projects,
        events: seedData.events,
        ui: seedData.ui
      },
      seedData
    );

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('normalizes old records while preserving recoverable data', () => {
    const migrated = migrateState(
      {
        clients: [{ id: 'c-old', name: ' Old Client ', email: 'OLD@CLIENT.TEST', status: 'Unexpected' }],
        projects: [{ id: 'p-old', name: ' Legacy Job ', clientId: 'missing-client', status: 'Unexpected', priority: 'Unexpected', dueDate: 'bad-date' }],
        events: [{ id: 'e-old', title: ' Legacy Event ', date: 'bad-date', clientId: 'missing-client', projectId: 'missing-project' }],
        ui: { theme: 'unknown', reducedMotion: 'yes' }
      },
      seedData
    );

    expect(migrated.clients).toContainEqual(expect.objectContaining({ id: 'c-old', name: 'Old Client', email: 'old@client.test', status: 'Aktywny' }));
    expect(migrated.clients[0]).toMatchObject({ segment: 'SMB', archivedAt: '' });
    expect(migrated.projects).toContainEqual(expect.objectContaining({ id: 'p-old', clientId: '', status: 'Draft', priority: 'Medium', dueDate: '', archivedAt: '' }));
    expect(migrated.projects[0]).toMatchObject({
      sla: { serviceLevel: 'Standard', responseDueDate: '' },
      estimate: { hours: 0, value: 0, currency: 'PLN' },
      tasks: []
    });
    expect(migrated.events).toContainEqual(expect.objectContaining({ id: 'e-old', clientId: '', projectId: '', date: '', type: 'General' }));
    expect(migrated.ui).toEqual({ theme: 'light', reducedMotion: false });
  });

  it('falls back to seed data when stored state is not recoverable', () => {
    const migrated = migrateState(null, seedData);

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.clients.length).toBe(seedData.clients.length);
    expect(migrated.projects.length).toBe(seedData.projects.length);
    expect(migrated.events.length).toBe(seedData.events.length);
  });

  it('clears orphan relationships without dropping otherwise valid records', () => {
    const migrated = migrateState(
      {
        clients: [{ id: 'c1', name: 'Client', email: 'client@test.pl' }],
        projects: [{ id: 'p1', name: 'Job', clientId: 'missing-client' }],
        events: [{ id: 'e1', title: 'Event', date: '2026-08-12', clientId: 'missing-client', projectId: 'missing-project' }],
        ui: { theme: 'dark', reducedMotion: true }
      },
      seedData
    );

    expect(migrated.projects[0].clientId).toBe('');
    expect(migrated.events[0].clientId).toBe('');
    expect(migrated.events[0].projectId).toBe('');
  });
});
