import { migrateState } from '../domain/migrations.js';
import { isPlainObject, isTerminalProjectStatus, normalizeString, validateClient, validateEvent, validateProject, validateUiPreferences } from '../domain/validators.js';

export const ACTION_ERRORS = Object.freeze({
  VALIDATION: 'validation_failed',
  NOT_FOUND: 'not_found',
  INVALID_JSON: 'invalid_json',
  INVALID_SCHEMA: 'invalid_schema'
});

export const actionOk = (data, nextState) => ({
  ok: true,
  data,
  nextState
});

export const actionFail = (error, issues = []) => ({
  ok: false,
  error,
  issues
});

export const getActionFieldError = (result, field) => result?.issues?.find((issue) => issue.field === field)?.message || '';

const collectIds = (items) => items.map((item) => item.id).filter(Boolean);

const importSchemaMessage = 'Import musi zawierać pełny eksport FlowDesk JSON z tablicami clients, projects i events.';
const importRecordMessage = 'Import zawiera rekordy, których nie można zweryfikować. Sprawdź wymagane pola i format email.';
const importDuplicateIdMessage = 'Import zawiera zduplikowane identyfikatory rekordów. Usuń duplikaty klientów, zleceń lub wydarzeń.';

const validateRecords = (items, validate) => items.map((item) => validate(item));

const hasDuplicateRecordIds = (results) => {
  const seen = new Set();
  return results.some((result) => {
    const id = result.value?.id;
    if (!id) return false;
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  });
};

const validateImportSchema = (rawState) => {
  if (!isPlainObject(rawState)) {
    return actionFail(ACTION_ERRORS.INVALID_SCHEMA, [{ field: 'json', message: importSchemaMessage }]);
  }

  if (!Array.isArray(rawState.clients) || !Array.isArray(rawState.projects) || !Array.isArray(rawState.events)) {
    return actionFail(ACTION_ERRORS.INVALID_SCHEMA, [{ field: 'json', message: importSchemaMessage }]);
  }

  const clientResults = validateRecords(rawState.clients, validateClient);
  const projectResults = validateRecords(rawState.projects, (project) => validateProject(project, { strictDate: false }));
  const eventResults = validateRecords(rawState.events, (event) => validateEvent(event, { requireDate: false, strictDate: false }));

  const invalidClient = clientResults.find((result) => !result.valid);
  const invalidProject = projectResults.find((result) => !result.valid);
  const invalidEvent = eventResults.find((result) => !result.valid);

  if (invalidClient || invalidProject || invalidEvent) {
    return actionFail(ACTION_ERRORS.INVALID_SCHEMA, [{ field: 'json', message: importRecordMessage }]);
  }

  if (hasDuplicateRecordIds(clientResults) || hasDuplicateRecordIds(projectResults) || hasDuplicateRecordIds(eventResults)) {
    return actionFail(ACTION_ERRORS.INVALID_SCHEMA, [{ field: 'json', message: importDuplicateIdMessage }]);
  }

  return null;
};

const requireCreateId = (createId) => {
  if (typeof createId !== 'function') throw new TypeError('createId action dependency is required.');
};

const createTimestamp = ({ createNow } = {}) => (typeof createNow === 'function' ? createNow() : new Date().toISOString());

const createEntryId = ({ createId } = {}, prefix) => (typeof createId === 'function' ? createId(prefix) : `${prefix}-${Date.now().toString(36)}`);

const appendEntry = (entries = [], text, context = {}, prefix = 'entry') => [
  ...entries,
  {
    id: createEntryId(context, prefix),
    text,
    date: createTimestamp(context)
  }
];

export const createClientAction = (state, payload, { createId } = {}) => {
  requireCreateId(createId);
  const result = validateClient({ ...payload, id: createId('client') });
  if (!result.valid) return actionFail(ACTION_ERRORS.VALIDATION, result.errors);

  const client = result.value;
  return actionOk(client, { ...state, clients: [...state.clients, client] });
};

export const updateClientAction = (state, id, payload) => {
  const existingClient = state.clients.find((client) => client.id === id);
  if (!existingClient) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const result = validateClient({ ...existingClient, ...payload, id });
  if (!result.valid) return actionFail(ACTION_ERRORS.VALIDATION, result.errors);

  return actionOk(result.value, {
    ...state,
    clients: state.clients.map((client) => (client.id === id ? result.value : client))
  });
};

export const archiveClientAction = (state, id, context = {}) => {
  const existingClient = state.clients.find((client) => client.id === id);
  if (!existingClient) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const archivedClient = {
    ...existingClient,
    archivedAt: createTimestamp(context),
    activity: appendEntry(existingClient.activity, 'Zarchiwizowano klienta.', context, 'activity')
  };

  return actionOk(archivedClient, {
    ...state,
    clients: state.clients.map((client) => (client.id === id ? archivedClient : client))
  });
};

export const restoreArchivedClientAction = (state, id, context = {}) => {
  const existingClient = state.clients.find((client) => client.id === id);
  if (!existingClient) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const restoredClient = {
    ...existingClient,
    archivedAt: '',
    activity: appendEntry(existingClient.activity, 'Przywrócono klienta z archiwum.', context, 'activity')
  };

  return actionOk(restoredClient, {
    ...state,
    clients: state.clients.map((client) => (client.id === id ? restoredClient : client))
  });
};

export const deleteClientAction = (state, id) => {
  const existingClient = state.clients.find((client) => client.id === id);
  if (!existingClient) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const removedProjectIds = state.projects.filter((project) => project.clientId === id).map((project) => project.id);

  return actionOk(existingClient, {
    ...state,
    clients: state.clients.filter((client) => client.id !== id),
    projects: state.projects.filter((project) => project.clientId !== id),
    events: state.events.map((event) => ({
      ...event,
      clientId: event.clientId === id ? '' : event.clientId,
      projectId: removedProjectIds.includes(event.projectId) ? '' : event.projectId
    }))
  });
};

export const createProjectAction = (state, payload, context = {}) => {
  const { createId } = context;
  requireCreateId(createId);
  const result = validateProject(
    { ...payload, id: createId('project') },
    {
      clientIds: collectIds(state.clients),
      requireKnownClient: true
    }
  );
  if (!result.valid) return actionFail(ACTION_ERRORS.VALIDATION, result.errors);

  const project = {
    ...result.value,
    history: result.value.history.length ? result.value.history : appendEntry([], 'Utworzono zlecenie.', context, 'history')
  };
  return actionOk(project, { ...state, projects: [...state.projects, project] });
};

export const updateProjectAction = (state, id, payload, context = {}) => {
  const existingProject = state.projects.find((project) => project.id === id);
  if (!existingProject) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const result = validateProject(
    { ...existingProject, ...payload, id },
    {
      clientIds: collectIds(state.clients),
      requireKnownClient: true
    }
  );
  if (!result.valid) return actionFail(ACTION_ERRORS.VALIDATION, result.errors);

  const completedAt = isTerminalProjectStatus(result.value.status) && !result.value.completedAt ? createTimestamp(context) : result.value.completedAt;
  const history =
    existingProject.status !== result.value.status ? appendEntry(result.value.history, `Status zmieniony na ${result.value.status}.`, context, 'history') : result.value.history;
  const project = { ...result.value, completedAt, history };

  return actionOk(project, {
    ...state,
    projects: state.projects.map((item) => (item.id === id ? project : item))
  });
};

export const archiveProjectAction = (state, id, context = {}) => {
  const existingProject = state.projects.find((project) => project.id === id);
  if (!existingProject) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const archivedProject = {
    ...existingProject,
    archivedAt: createTimestamp(context),
    history: appendEntry(existingProject.history, 'Zarchiwizowano zlecenie.', context, 'history')
  };

  return actionOk(archivedProject, {
    ...state,
    projects: state.projects.map((project) => (project.id === id ? archivedProject : project))
  });
};

export const restoreArchivedProjectAction = (state, id, context = {}) => {
  const existingProject = state.projects.find((project) => project.id === id);
  if (!existingProject) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const restoredProject = {
    ...existingProject,
    archivedAt: '',
    history: appendEntry(existingProject.history, 'Przywrócono zlecenie z archiwum.', context, 'history')
  };

  return actionOk(restoredProject, {
    ...state,
    projects: state.projects.map((project) => (project.id === id ? restoredProject : project))
  });
};

export const toggleProjectTaskAction = (state, projectId, taskId, context = {}) => {
  const existingProject = state.projects.find((project) => project.id === projectId);
  if (!existingProject) return actionFail(ACTION_ERRORS.NOT_FOUND);
  const existingTask = existingProject.tasks.find((task) => task.id === taskId);
  if (!existingTask) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const nextTask = { ...existingTask, done: !existingTask.done };
  const nextProject = {
    ...existingProject,
    tasks: existingProject.tasks.map((task) => (task.id === taskId ? nextTask : task)),
    history: appendEntry(existingProject.history, `${nextTask.done ? 'Ukończono' : 'Wznowiono'} zadanie: ${nextTask.title}.`, context, 'history')
  };

  return actionOk(nextTask, {
    ...state,
    projects: state.projects.map((project) => (project.id === projectId ? nextProject : project))
  });
};

export const addProjectCommentAction = (state, projectId, payload, context = {}) => {
  const existingProject = state.projects.find((project) => project.id === projectId);
  if (!existingProject) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const body = normalizeString(payload?.body);
  if (!body) return actionFail(ACTION_ERRORS.VALIDATION, [{ field: 'comment', message: 'Wpisz treść komentarza.' }]);

  const comment = {
    id: createEntryId(context, 'comment'),
    author: normalizeString(payload?.author) || 'Alicja Maj',
    body,
    date: createTimestamp(context)
  };
  const nextProject = {
    ...existingProject,
    comments: [...existingProject.comments, comment],
    history: appendEntry(existingProject.history, 'Dodano komentarz do zlecenia.', context, 'history')
  };

  return actionOk(comment, {
    ...state,
    projects: state.projects.map((project) => (project.id === projectId ? nextProject : project))
  });
};

export const deleteProjectAction = (state, id) => {
  const existingProject = state.projects.find((project) => project.id === id);
  if (!existingProject) return actionFail(ACTION_ERRORS.NOT_FOUND);

  return actionOk(existingProject, {
    ...state,
    projects: state.projects.filter((project) => project.id !== id),
    events: state.events.map((event) => ({
      ...event,
      projectId: event.projectId === id ? '' : event.projectId
    }))
  });
};

export const createEventAction = (state, payload, { createId } = {}) => {
  requireCreateId(createId);
  const result = validateEvent(
    { ...payload, id: createId('event') },
    {
      clientIds: collectIds(state.clients),
      projectIds: collectIds(state.projects),
      requireKnownReferences: true
    }
  );
  if (!result.valid) return actionFail(ACTION_ERRORS.VALIDATION, result.errors);

  const event = result.value;
  return actionOk(event, { ...state, events: [...state.events, event] });
};

export const updateEventAction = (state, id, payload) => {
  const existingEvent = state.events.find((event) => event.id === id);
  if (!existingEvent) return actionFail(ACTION_ERRORS.NOT_FOUND);

  const result = validateEvent(
    { ...existingEvent, ...payload, id },
    {
      clientIds: collectIds(state.clients),
      projectIds: collectIds(state.projects),
      requireKnownReferences: true
    }
  );
  if (!result.valid) return actionFail(ACTION_ERRORS.VALIDATION, result.errors);

  return actionOk(result.value, {
    ...state,
    events: state.events.map((event) => (event.id === id ? result.value : event))
  });
};

export const deleteEventAction = (state, id) => {
  const existingEvent = state.events.find((event) => event.id === id);
  if (!existingEvent) return actionFail(ACTION_ERRORS.NOT_FOUND);

  return actionOk(existingEvent, {
    ...state,
    events: state.events.filter((event) => event.id !== id)
  });
};

export const updateUiPreferencesAction = (state, payload) => {
  const result = validateUiPreferences({ ...state.ui, ...payload });
  return actionOk(result.value, { ...state, ui: result.value });
};

export const resetDemoDataAction = (seedState) => {
  const nextState = migrateState(seedState, seedState);
  return actionOk(nextState, nextState);
};

export const restoreStateAction = (rawState, seedState) => {
  const schemaResult = validateImportSchema(rawState);
  if (schemaResult) return schemaResult;

  const nextState = migrateState(rawState, seedState);
  return actionOk(nextState, nextState);
};

export const restoreStateFromJsonAction = (jsonText, seedState) => {
  try {
    return restoreStateAction(JSON.parse(String(jsonText || '')), seedState);
  } catch {
    return actionFail(ACTION_ERRORS.INVALID_JSON, [{ field: 'json', message: 'Nieprawidłowy plik JSON.' }]);
  }
};

export const exportStateAction = (state) => actionOk(JSON.stringify(state, null, 2), state);
