import { isTerminalProjectStatus, normalizeString } from '../domain/validators.js';

const toValidDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const isArchived = (record) => Boolean(record?.archivedAt);

const byDateAsc = (a, b) => {
  const first = toValidDate(a.date || a.dueDate || a.completedAt)?.getTime() || Number.MAX_SAFE_INTEGER;
  const second = toValidDate(b.date || b.dueDate || b.completedAt)?.getTime() || Number.MAX_SAFE_INTEGER;
  return first - second;
};

const matchesTerm = (term, values) => {
  const normalizedTerm = normalizeString(term).toLowerCase();
  if (!normalizedTerm) return true;
  return values.some((value) => normalizeString(value).toLowerCase().includes(normalizedTerm));
};

export const selectClients = (state) => state.clients;

export const selectActiveClients = (state) => state.clients.filter((client) => !isArchived(client));

export const selectArchivedClients = (state) => state.clients.filter(isArchived);

export const selectProjects = (state) => state.projects;

export const selectActiveProjectRecords = (state) => state.projects.filter((project) => !isArchived(project));

export const selectArchivedProjects = (state) => state.projects.filter(isArchived);

export const selectEvents = (state) => state.events;

export const selectUiPreferences = (state) => state.ui;

export const selectClientById = (state, id) => state.clients.find((client) => client.id === id) || null;

export const selectProjectById = (state, id) => state.projects.find((project) => project.id === id) || null;

export const selectClientLookup = (state) => new Map(state.clients.map((client) => [client.id, client]));

export const selectProjectLookup = (state) => new Map(state.projects.map((project) => [project.id, project]));

export const selectClientName = (state, id, fallback = 'Bez klienta') => selectClientById(state, id)?.name || fallback;

export const selectProjectName = (state, id, fallback = 'Bez projektu') => selectProjectById(state, id)?.name || fallback;

export const selectActiveProjects = (state) => selectActiveProjectRecords(state).filter((project) => !isTerminalProjectStatus(project.status));

export const selectCompletedProjects = (state) => selectActiveProjectRecords(state).filter((project) => isTerminalProjectStatus(project.status));

export const selectHighPriorityOpenProjects = (state) => selectActiveProjects(state).filter((project) => project.priority === 'High');

export const selectOverdueProjects = (state, referenceDate = new Date()) => {
  const referenceTime = referenceDate.getTime();
  return selectActiveProjects(state).filter((project) => {
    const dueDate = toValidDate(project.dueDate);
    return dueDate ? dueDate.getTime() < referenceTime : false;
  });
};

export const selectThroughputProjects = (state, referenceDate = new Date(), days = 30) => {
  const periodStart = addDays(startOfDay(referenceDate), -days).getTime();
  const referenceTime = referenceDate.getTime();

  return selectCompletedProjects(state).filter((project) => {
    const completedAt = toValidDate(project.completedAt);
    if (!completedAt) return false;
    const completedTime = completedAt.getTime();
    return completedTime >= periodStart && completedTime <= referenceTime;
  });
};

export const selectUpcomingEvents = (state, referenceDate = new Date(), days = 7) => {
  const rangeStart = startOfDay(referenceDate).getTime();
  const rangeEnd = addDays(startOfDay(referenceDate), days).getTime();

  return state.events
    .filter((event) => {
      const eventDate = toValidDate(event.date);
      if (!eventDate) return false;
      const eventTime = eventDate.getTime();
      return eventTime >= rangeStart && eventTime < rangeEnd;
    })
    .sort(byDateAsc);
};

export const selectWeeklyEvents = selectUpcomingEvents;

export const selectProjectsByClient = (state, clientId, { includeArchived = true } = {}) =>
  state.projects.filter((project) => project.clientId === clientId && (includeArchived || !isArchived(project)));

export const selectProjectsByStatus = (state, status, projects = state.projects) => projects.filter((project) => project.status === status);

export const selectDashboardMetrics = (state, referenceDate = new Date()) => {
  const activeProjects = selectActiveProjects(state);
  const upcomingEvents = selectUpcomingEvents(state, referenceDate);
  const overdueProjects = selectOverdueProjects(state, referenceDate);
  const completedProjects = selectCompletedProjects(state);
  const throughputProjects = selectThroughputProjects(state, referenceDate);
  const highPriorityOpenProjects = selectHighPriorityOpenProjects(state);

  return {
    activeProjectsCount: activeProjects.length,
    weeklyEventsCount: upcomingEvents.length,
    upcomingEventsCount: upcomingEvents.length,
    clientsCount: selectActiveClients(state).length,
    overdueProjectsCount: overdueProjects.length,
    completedProjectsCount: completedProjects.length,
    throughputProjectsCount: throughputProjects.length,
    highPriorityOpenProjectsCount: highPriorityOpenProjects.length
  };
};

export const selectNextActions = (state, limit = 5) => selectActiveProjects(state).sort(byDateAsc).slice(0, limit);

export const selectRecentProjects = (state, limit = 4) => selectActiveProjectRecords(state).slice(-limit).reverse();

export const selectFilteredClients = (state, { term = '', sort = 'name', archive = 'active' } = {}) => {
  const source = archive === 'archived' ? selectArchivedClients(state) : archive === 'all' ? [...state.clients] : selectActiveClients(state);
  const sortedClients = [...source].sort((a, b) => {
    if (sort === 'status') return a.status.localeCompare(b.status);
    if (sort === 'owner') return a.owner.localeCompare(b.owner);
    return a.name.localeCompare(b.name);
  });

  return sortedClients.filter((client) => matchesTerm(term, [client.name, client.email, client.phone, client.status, client.segment, client.owner, ...(client.tags || [])]));
};

export const selectFilteredProjects = (state, { status = 'all', priority = 'all', archive = 'active' } = {}) => {
  const source = archive === 'archived' ? selectArchivedProjects(state) : archive === 'all' ? [...state.projects] : selectActiveProjectRecords(state);

  return source.filter((project) => {
    const statusMatch = status === 'all' || project.status === status;
    const priorityMatch = priority === 'all' || project.priority === priority;
    return statusMatch && priorityMatch;
  });
};

export const selectProjectsWithClients = (state, projects = state.projects) => {
  const clients = selectClientLookup(state);
  return projects.map((project) => ({
    ...project,
    client: clients.get(project.clientId) || null
  }));
};

export const selectEventsWithRelations = (state, events = state.events) => {
  const clients = selectClientLookup(state);
  const projects = selectProjectLookup(state);

  return events.map((event) => ({
    ...event,
    client: clients.get(event.clientId) || null,
    project: projects.get(event.projectId) || null
  }));
};

export const selectClientActivityTimeline = (state, clientId) => {
  const client = selectClientById(state, clientId);
  if (!client) return [];

  const clientActivity = client.activity.map((entry) => ({ ...entry, source: 'client' }));
  const projectHistory = selectProjectsByClient(state, clientId).flatMap((project) =>
    project.history.map((entry) => ({ ...entry, source: 'project', text: `${project.name}: ${entry.text}` }))
  );
  const events = selectEventsWithRelations(
    state,
    state.events.filter((event) => event.clientId === clientId)
  ).map((event) => ({
    id: event.id,
    text: `Wydarzenie: ${event.title}`,
    date: event.date,
    source: 'event'
  }));

  return [...clientActivity, ...projectHistory, ...events]
    .filter((entry) => toValidDate(entry.date))
    .sort(byDateAsc)
    .reverse();
};

export const selectClientDetail = (state, clientId) => {
  const client = selectClientById(state, clientId);
  if (!client) return null;

  return {
    client,
    projects: selectProjectsWithClients(state, selectProjectsByClient(state, clientId)),
    events: selectEventsWithRelations(
      state,
      state.events.filter((event) => event.clientId === clientId)
    ),
    timeline: selectClientActivityTimeline(state, clientId)
  };
};

export const selectProjectDetail = (state, projectId) => {
  const project = selectProjectById(state, projectId);
  if (!project) return null;

  return {
    project,
    client: selectClientById(state, project.clientId),
    events: selectEventsWithRelations(
      state,
      state.events.filter((event) => event.projectId === projectId)
    )
  };
};

export const selectGlobalSearchResults = (state, term, limit = 8) => {
  const normalizedTerm = normalizeString(term);
  if (normalizedTerm.length < 2) return [];

  const clientResults = selectActiveClients(state)
    .filter((client) => matchesTerm(normalizedTerm, [client.name, client.email, client.phone, client.segment, client.owner, ...(client.tags || [])]))
    .map((client) => ({
      type: 'client',
      label: 'Klient',
      id: client.id,
      title: client.name,
      description: `${client.email} · ${client.segment}`,
      href: `#/clients/${encodeURIComponent(client.id)}`
    }));

  const projectResults = selectProjectsWithClients(state, selectActiveProjectRecords(state))
    .filter((project) => matchesTerm(normalizedTerm, [project.name, project.status, project.priority, project.client?.name, project.notes, project.sla?.serviceLevel]))
    .map((project) => ({
      type: 'project',
      label: 'Zlecenie',
      id: project.id,
      title: project.name,
      description: `${project.client?.name || 'Bez klienta'} · ${project.status}`,
      href: `#/projects/${encodeURIComponent(project.id)}`
    }));

  const eventResults = selectEventsWithRelations(state)
    .filter((event) => matchesTerm(normalizedTerm, [event.title, event.client?.name, event.project?.name, event.type]))
    .map((event) => ({
      type: 'event',
      label: 'Wydarzenie',
      id: event.id,
      title: event.title,
      description: `${event.client?.name || 'Bez klienta'} · ${event.project?.name || 'Bez projektu'}`,
      href: '#/calendar'
    }));

  return [...clientResults, ...projectResults, ...eventResults].slice(0, limit);
};
