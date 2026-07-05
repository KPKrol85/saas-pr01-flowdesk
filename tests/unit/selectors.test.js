import { describe, expect, it } from 'vitest';
import {
  selectActiveClients,
  selectActiveProjects,
  selectArchivedClients,
  selectClientDetail,
  selectDashboardMetrics,
  selectEventsWithRelations,
  selectFilteredClients,
  selectFilteredProjects,
  selectGlobalSearchResults,
  selectHighPriorityOpenProjects,
  selectOverdueProjects,
  selectProjectDetail,
  selectProjectsByClient,
  selectProjectsByStatus,
  selectProjectsWithClients,
  selectThroughputProjects,
  selectWeeklyEvents
} from '../../js/core/selectors.js';
import { migrateState } from '../../js/domain/migrations.js';

const referenceDate = new Date('2026-07-04T12:00:00.000Z');

const state = migrateState(
  {
    clients: [
      { id: 'c1', name: 'Nova Studio', email: 'nova@test.pl', status: 'Aktywny', tags: ['web'], owner: 'Alicja' },
      { id: 'c2', name: 'Aurora Clinic', email: 'aurora@test.pl', status: 'Potencjalny', segment: 'Healthcare' },
      { id: 'c3', name: 'Archived Client', email: 'archive@test.pl', status: 'Aktywny', archivedAt: '2026-07-01T10:00:00.000Z' }
    ],
    projects: [
      {
        id: 'p1',
        name: 'Past active',
        clientId: 'c1',
        status: 'In progress',
        priority: 'High',
        dueDate: '2026-07-03T10:00:00.000Z',
        tasks: [{ id: 't1', title: 'Task', done: false }],
        history: [{ id: 'h1', text: 'Started', date: '2026-07-02T10:00:00.000Z' }]
      },
      {
        id: 'p2',
        name: 'Past done',
        clientId: 'c1',
        status: 'Done',
        priority: 'Low',
        dueDate: '2026-07-02T10:00:00.000Z',
        completedAt: '2026-07-03T10:00:00.000Z'
      },
      { id: 'p3', name: 'Future review', clientId: 'c2', status: 'Review', priority: 'Medium', dueDate: '2026-07-08T10:00:00.000Z' },
      { id: 'p4', name: 'Archived job', clientId: 'c3', status: 'Draft', priority: 'High', dueDate: '2026-07-08T10:00:00.000Z', archivedAt: '2026-07-02T10:00:00.000Z' }
    ],
    events: [
      { id: 'e1', title: 'Today call', date: '2026-07-04T10:00:00.000Z', clientId: 'c1', projectId: 'p1' },
      { id: 'e2', title: 'Weekly review', date: '2026-07-10T10:00:00.000Z', clientId: 'c2', projectId: 'p3' },
      { id: 'e3', title: 'Later event', date: '2026-07-12T10:00:00.000Z', clientId: 'c2', projectId: 'p3' }
    ],
    ui: { theme: 'light', reducedMotion: false }
  },
  {}
);

describe('state selectors', () => {
  it('selects active, archived, overdue, throughput, and weekly records', () => {
    expect(selectActiveClients(state).map((client) => client.id)).toEqual(['c1', 'c2']);
    expect(selectArchivedClients(state).map((client) => client.id)).toEqual(['c3']);
    expect(selectActiveProjects(state).map((project) => project.id)).toEqual(['p1', 'p3']);
    expect(selectOverdueProjects(state, referenceDate).map((project) => project.id)).toEqual(['p1']);
    expect(selectThroughputProjects(state, referenceDate).map((project) => project.id)).toEqual(['p2']);
    expect(selectWeeklyEvents(state, referenceDate).map((event) => event.id)).toEqual(['e1', 'e2']);
    expect(selectHighPriorityOpenProjects(state).map((project) => project.id)).toEqual(['p1']);
  });

  it('builds operational dashboard metrics from derived data', () => {
    expect(selectDashboardMetrics(state, referenceDate)).toMatchObject({
      activeProjectsCount: 2,
      upcomingEventsCount: 2,
      clientsCount: 2,
      overdueProjectsCount: 1,
      completedProjectsCount: 1,
      throughputProjectsCount: 1,
      highPriorityOpenProjectsCount: 1
    });
  });

  it('selects projects by client and status', () => {
    const clientProjects = selectProjectsByClient(state, 'c1');

    expect(clientProjects.map((project) => project.id)).toEqual(['p1', 'p2']);
    expect(selectProjectsByStatus(state, 'Done', clientProjects).map((project) => project.id)).toEqual(['p2']);
  });

  it('filters clients and projects for view-level controls', () => {
    expect(selectFilteredClients(state, { term: 'web' }).map((client) => client.id)).toEqual(['c1']);
    expect(selectFilteredClients(state, { archive: 'archived' }).map((client) => client.id)).toEqual(['c3']);
    expect(selectFilteredProjects(state, { status: 'Review', priority: 'Medium' }).map((project) => project.id)).toEqual(['p3']);
    expect(selectFilteredProjects(state, { archive: 'archived' }).map((project) => project.id)).toEqual(['p4']);
  });

  it('adds client and project display relations without mutating source data', () => {
    const projects = selectProjectsWithClients(state);
    const events = selectEventsWithRelations(state);

    expect(projects[0].client).toMatchObject({ id: 'c1', name: 'Nova Studio' });
    expect(events[1].client).toMatchObject({ id: 'c2', name: 'Aurora Clinic' });
    expect(events[1].project).toMatchObject({ id: 'p3', name: 'Future review' });
    expect(state.projects[0]).not.toHaveProperty('client');
  });

  it('builds detail selector payloads', () => {
    expect(selectClientDetail(state, 'c1')).toMatchObject({ client: { id: 'c1' } });
    expect(selectClientDetail(state, 'c1').projects.map((project) => project.id)).toEqual(['p1', 'p2']);
    expect(selectProjectDetail(state, 'p1')).toMatchObject({ project: { id: 'p1' }, client: { id: 'c1' } });
  });

  it('returns safe global search targets', () => {
    const results = selectGlobalSearchResults(state, 'nova');

    expect(results).toContainEqual(expect.objectContaining({ type: 'client', href: '#/clients/c1' }));
    expect(selectGlobalSearchResults(state, 'future')).toContainEqual(expect.objectContaining({ type: 'project', href: '#/projects/p3' }));
    expect(selectGlobalSearchResults(state, 'zz')).toEqual([]);
  });
});
