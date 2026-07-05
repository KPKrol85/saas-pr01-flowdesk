export const CURRENT_SCHEMA_VERSION = 3;

export const CLIENT_STATUSES = Object.freeze(['Aktywny', 'Potencjalny', 'Zawieszony']);
export const CLIENT_SEGMENTS = Object.freeze(['SMB', 'Healthcare', 'Agency', 'Enterprise', 'Lead']);
export const PROJECT_STATUSES = Object.freeze(['Draft', 'In progress', 'Review', 'Done']);
export const PROJECT_TERMINAL_STATUSES = Object.freeze(['Done']);
export const PROJECT_PRIORITIES = Object.freeze(['Low', 'Medium', 'High']);
export const PROJECT_SERVICE_LEVELS = Object.freeze(['Standard', 'Priority', 'Critical']);
export const EVENT_TYPES = Object.freeze(['General', 'Meeting', 'Deadline']);
export const UI_THEMES = Object.freeze(['light', 'dark']);

export const DEFAULT_CLIENT_STATUS = CLIENT_STATUSES[0];
export const DEFAULT_CLIENT_SEGMENT = CLIENT_SEGMENTS[0];
export const DEFAULT_PROJECT_STATUS = PROJECT_STATUSES[0];
export const DEFAULT_PROJECT_PRIORITY = PROJECT_PRIORITIES[1];
export const DEFAULT_PROJECT_SERVICE_LEVEL = PROJECT_SERVICE_LEVELS[0];
export const DEFAULT_EVENT_TYPE = EVENT_TYPES[0];
export const DEFAULT_UI_THEME = UI_THEMES[0];
