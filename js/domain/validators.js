import {
  CLIENT_SEGMENTS,
  CLIENT_STATUSES,
  DEFAULT_CLIENT_SEGMENT,
  DEFAULT_CLIENT_STATUS,
  DEFAULT_EVENT_TYPE,
  DEFAULT_PROJECT_PRIORITY,
  DEFAULT_PROJECT_SERVICE_LEVEL,
  DEFAULT_PROJECT_STATUS,
  DEFAULT_UI_THEME,
  EVENT_TYPES,
  PROJECT_PRIORITIES,
  PROJECT_SERVICE_LEVELS,
  PROJECT_STATUSES,
  PROJECT_TERMINAL_STATUSES,
  UI_THEMES
} from './constants.js';
import { createClientModel, createEventModel, createProjectModel, createUiPreferencesModel, createUserSessionModel } from './models.js';
import { createDemoUserContext, normalizeMembership, normalizeOrganization, normalizeUser } from './identity.js';
import { normalizeRole } from './rbac.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeBoolean = (value) => value === true;

const normalizeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const normalizeAllowedValue = (value, allowedValues, fallback) => {
  const normalized = normalizeString(value);
  return allowedValues.includes(normalized) ? normalized : fallback;
};

export const isValidDateValue = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) return false;
  return !Number.isNaN(new Date(normalized).getTime());
};

const normalizeDateValue = (value) => {
  const normalized = normalizeString(value);
  return isValidDateValue(normalized) ? normalized : '';
};

const normalizeStringArray = (value) => {
  const source = Array.isArray(value) ? value : normalizeString(value).split(',');
  return [...new Set(source.map((item) => normalizeString(item)).filter(Boolean))];
};

const normalizeEntry = (entry = {}, fallbackId) => {
  const source = isPlainObject(entry) ? entry : {};
  return {
    id: normalizeString(source.id) || fallbackId,
    text: normalizeString(source.text || source.title || source.body),
    date: normalizeDateValue(source.date) || new Date(0).toISOString()
  };
};

const normalizeContact = (contact = {}, fallbackId = 'primary') => {
  const source = isPlainObject(contact) ? contact : {};
  return {
    id: normalizeString(source.id) || fallbackId,
    name: normalizeString(source.name),
    role: normalizeString(source.role) || 'Kontakt główny',
    email: normalizeString(source.email).toLowerCase(),
    phone: normalizeString(source.phone)
  };
};

const createPrimaryContact = (source = {}) => {
  const contact = normalizeContact(
    {
      id: 'primary',
      name: source.contactName || source.name,
      role: source.contactRole || 'Kontakt główny',
      email: source.contactEmail || source.email,
      phone: source.contactPhone || source.phone
    },
    'primary'
  );

  return contact.name || contact.email || contact.phone ? [contact] : [];
};

const normalizeContacts = (contacts, source) => {
  const normalized = Array.isArray(contacts)
    ? contacts.map((contact, index) => normalizeContact(contact, `contact-${index + 1}`)).filter((contact) => contact.name || contact.email || contact.phone)
    : [];

  return normalized.length ? normalized : createPrimaryContact(source);
};

const normalizeActivity = (activity) =>
  Array.isArray(activity) ? activity.map((entry, index) => normalizeEntry(entry, `activity-${index + 1}`)).filter((entry) => entry.text) : [];

const normalizeTask = (task = {}, index = 0) => {
  const source = isPlainObject(task) ? task : {};
  return {
    id: normalizeString(source.id) || `task-${index + 1}`,
    title: normalizeString(source.title),
    done: normalizeBoolean(source.done)
  };
};

const normalizeTasks = (tasks) => (Array.isArray(tasks) ? tasks.map(normalizeTask).filter((task) => task.title) : []);

const normalizeSla = (sla = {}) => {
  const source = isPlainObject(sla) ? sla : {};
  return {
    serviceLevel: normalizeAllowedValue(source.serviceLevel, PROJECT_SERVICE_LEVELS, DEFAULT_PROJECT_SERVICE_LEVEL),
    responseDueDate: normalizeDateValue(source.responseDueDate)
  };
};

const normalizeEstimate = (estimate = {}) => {
  const source = isPlainObject(estimate) ? estimate : {};
  return {
    hours: normalizeNumber(source.hours),
    value: normalizeNumber(source.value),
    currency: normalizeString(source.currency) || 'PLN'
  };
};

const normalizeComment = (comment = {}, index = 0) => {
  const source = isPlainObject(comment) ? comment : {};
  return {
    id: normalizeString(source.id) || `comment-${index + 1}`,
    author: normalizeString(source.author) || 'FlowDesk',
    body: normalizeString(source.body),
    date: normalizeDateValue(source.date) || new Date(0).toISOString()
  };
};

const normalizeComments = (comments) => (Array.isArray(comments) ? comments.map(normalizeComment).filter((comment) => comment.body) : []);

const hasInvalidProvidedDate = (rawValue) => {
  const normalized = normalizeString(rawValue);
  return Boolean(normalized) && !isValidDateValue(normalized);
};

const createValidationResult = (value, errors) => ({
  valid: errors.length === 0,
  errors,
  value
});

const hasReference = (id, allowedIds = [], { requireKnown = false } = {}) => {
  const normalized = normalizeString(id);
  if (!normalized) return true;
  return (!requireKnown && allowedIds.length === 0) || allowedIds.includes(normalized);
};

export const getFieldError = (result, field) => result.errors.find((error) => error.field === field)?.message || '';

export const normalizeClient = (input = {}) => {
  const source = isPlainObject(input) ? input : {};

  return createClientModel({
    id: normalizeString(source.id),
    name: normalizeString(source.name),
    email: normalizeString(source.email).toLowerCase(),
    phone: normalizeString(source.phone),
    status: normalizeAllowedValue(source.status, CLIENT_STATUSES, DEFAULT_CLIENT_STATUS),
    notes: normalizeString(source.notes),
    contacts: normalizeContacts(source.contacts, source),
    tags: normalizeStringArray(source.tags),
    segment: normalizeAllowedValue(source.segment, CLIENT_SEGMENTS, DEFAULT_CLIENT_SEGMENT),
    owner: normalizeString(source.owner),
    activity: normalizeActivity(source.activity),
    archivedAt: normalizeDateValue(source.archivedAt)
  });
};

export const validateClient = (input, { requireId = true } = {}) => {
  const value = normalizeClient(input);
  const errors = [];

  if (requireId && !value.id) errors.push({ field: 'id', message: 'Missing client id.' });
  if (!value.name) errors.push({ field: 'name', message: 'Wymagane pole.' });
  if (!value.email) {
    errors.push({ field: 'email', message: 'Wymagane pole.' });
  } else if (!EMAIL_PATTERN.test(value.email)) {
    errors.push({ field: 'email', message: 'Podaj poprawny adres email.' });
  }
  value.contacts.forEach((contact, index) => {
    if (contact.email && !EMAIL_PATTERN.test(contact.email)) {
      errors.push({ field: `contacts.${index}.email`, message: 'Nieprawidłowy email kontaktu.' });
    }
  });

  return createValidationResult(value, errors);
};

export const normalizeProject = (input = {}) => {
  const source = isPlainObject(input) ? input : {};

  return createProjectModel({
    id: normalizeString(source.id),
    name: normalizeString(source.name),
    clientId: normalizeString(source.clientId),
    status: normalizeAllowedValue(source.status, PROJECT_STATUSES, DEFAULT_PROJECT_STATUS),
    priority: normalizeAllowedValue(source.priority, PROJECT_PRIORITIES, DEFAULT_PROJECT_PRIORITY),
    dueDate: normalizeDateValue(source.dueDate),
    notes: normalizeString(source.notes),
    tasks: normalizeTasks(source.tasks),
    sla: normalizeSla(source.sla),
    estimate: normalizeEstimate(source.estimate),
    comments: normalizeComments(source.comments),
    history: normalizeActivity(source.history),
    completedAt: normalizeDateValue(source.completedAt),
    archivedAt: normalizeDateValue(source.archivedAt)
  });
};

export const validateProject = (input, { requireId = true, strictDate = true, clientIds = [], requireKnownClient = false } = {}) => {
  const source = isPlainObject(input) ? input : {};
  const value = normalizeProject(source);
  const errors = [];

  if (requireId && !value.id) errors.push({ field: 'id', message: 'Missing project id.' });
  if (!value.name) errors.push({ field: 'name', message: 'Wymagane pole.' });
  if (strictDate && hasInvalidProvidedDate(source.dueDate)) errors.push({ field: 'dueDate', message: 'Nieprawidłowa data.' });
  if (strictDate && hasInvalidProvidedDate(source.sla?.responseDueDate)) errors.push({ field: 'responseDueDate', message: 'Nieprawidłowa data SLA.' });
  if (!hasReference(value.clientId, clientIds, { requireKnown: requireKnownClient })) errors.push({ field: 'clientId', message: 'Nieprawidłowy klient.' });

  return createValidationResult(value, errors);
};

export const normalizeEvent = (input = {}) => {
  const source = isPlainObject(input) ? input : {};

  return createEventModel({
    id: normalizeString(source.id),
    title: normalizeString(source.title),
    date: normalizeDateValue(source.date),
    clientId: normalizeString(source.clientId),
    projectId: normalizeString(source.projectId),
    type: normalizeAllowedValue(source.type, EVENT_TYPES, DEFAULT_EVENT_TYPE)
  });
};

export const validateEvent = (input, { requireId = true, requireDate = true, strictDate = true, clientIds = [], projectIds = [], requireKnownReferences = false } = {}) => {
  const source = isPlainObject(input) ? input : {};
  const value = normalizeEvent(source);
  const errors = [];

  if (requireId && !value.id) errors.push({ field: 'id', message: 'Missing event id.' });
  if (!value.title) errors.push({ field: 'title', message: 'Wymagane pole.' });
  if (strictDate && hasInvalidProvidedDate(source.date)) {
    errors.push({ field: 'date', message: 'Nieprawidłowa data.' });
  } else if (requireDate && !value.date) {
    errors.push({ field: 'date', message: 'Wymagane pole.' });
  }
  if (!hasReference(value.clientId, clientIds, { requireKnown: requireKnownReferences })) errors.push({ field: 'clientId', message: 'Nieprawidłowy klient.' });
  if (!hasReference(value.projectId, projectIds, { requireKnown: requireKnownReferences })) errors.push({ field: 'projectId', message: 'Nieprawidłowy projekt.' });

  return createValidationResult(value, errors);
};

export const normalizeUiPreferences = (input = {}) => {
  const source = isPlainObject(input) ? input : {};

  return createUiPreferencesModel({
    theme: normalizeAllowedValue(source.theme, UI_THEMES, DEFAULT_UI_THEME),
    reducedMotion: normalizeBoolean(source.reducedMotion)
  });
};

export const validateUiPreferences = (input) => createValidationResult(normalizeUiPreferences(input), []);

export const normalizeUserSession = (input = {}) => {
  const source = isPlainObject(input) ? input : {};
  const email = normalizeString(source.email) || normalizeString(source.user?.email);
  const name = normalizeString(source.name) || normalizeString(source.user?.name);
  const role = normalizeRole(normalizeString(source.role || source.membership?.role) || 'Owner');
  const context = createDemoUserContext({
    email: email || undefined,
    name: name || undefined,
    role
  });
  const sourceUser = isPlainObject(source.user) ? source.user : {};
  const sourceOrganization = isPlainObject(source.organization) ? source.organization : {};
  const sourceMembership = isPlainObject(source.membership) ? source.membership : {};

  return createUserSessionModel({
    email: email.toLowerCase(),
    name: name || context.user.name,
    role,
    user: normalizeUser({ ...context.user, ...sourceUser, email: sourceUser.email || context.user.email, name: sourceUser.name || context.user.name }),
    organization: normalizeOrganization({ ...context.organization, ...sourceOrganization }),
    membership: normalizeMembership({ ...context.membership, ...sourceMembership, role: sourceMembership.role || role }),
    lastLogin: normalizeDateValue(source.lastLogin) || new Date().toISOString()
  });
};

export const validateUserSession = (input) => {
  const value = normalizeUserSession(input);
  const errors = [];

  if (!value.email || !EMAIL_PATTERN.test(value.email)) errors.push({ field: 'email', message: 'Podaj poprawny adres email.' });

  return createValidationResult(value, errors);
};

export const isTerminalProjectStatus = (status) => PROJECT_TERMINAL_STATUSES.includes(status);
