import { CURRENT_SCHEMA_VERSION } from './constants.js';
import { createStateModel } from './models.js';
import { isPlainObject, normalizeUiPreferences, validateClient, validateEvent, validateProject } from './validators.js';

const normalizeArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);

const collectIds = (items) => items.map((item) => item.id).filter(Boolean);

export const enforceRelationshipConsistency = (state) => {
  const clientIds = collectIds(state.clients);

  const projects = state.projects.map((project) => ({
    ...project,
    clientId: clientIds.includes(project.clientId) ? project.clientId : ''
  }));
  const projectIds = collectIds(projects);

  const events = state.events.map((event) => ({
    ...event,
    clientId: clientIds.includes(event.clientId) ? event.clientId : '',
    projectId: projectIds.includes(event.projectId) ? event.projectId : ''
  }));

  return { ...state, projects, events };
};

export const migrateState = (rawState, seedState) => {
  const seed = isPlainObject(seedState) ? seedState : {};
  const source = isPlainObject(rawState) ? rawState : seed;

  const sourceClients = normalizeArray(source.clients, normalizeArray(seed.clients));
  const clients = sourceClients
    .map((client) => validateClient(client))
    .filter((result) => result.valid)
    .map((result) => result.value);
  const sourceProjects = normalizeArray(source.projects, normalizeArray(seed.projects));
  const projects = sourceProjects
    .map((project) => validateProject(project, { strictDate: false }))
    .filter((result) => result.valid)
    .map((result) => result.value);

  const sourceEvents = normalizeArray(source.events, normalizeArray(seed.events));
  const events = sourceEvents
    .map((event) => validateEvent(event, { requireDate: false, strictDate: false }))
    .filter((result) => result.valid)
    .map((result) => result.value);

  const migrated = createStateModel({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    clients,
    projects,
    events,
    ui: normalizeUiPreferences(source.ui || seed.ui)
  });

  return enforceRelationshipConsistency(migrated);
};
