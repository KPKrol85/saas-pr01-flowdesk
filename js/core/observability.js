const MAX_BUFFER_SIZE = 25;
const MAX_MESSAGE_LENGTH = 240;
const MAX_CONTEXT_KEYS = 12;
const SENSITIVE_KEY_PATTERN = /token|password|secret|email|phone|name|address|note|body|comment|payload/i;

let events = [];
let adapter = null;
let initialized = false;

const now = () => new Date().toISOString();

const truncate = (value, maxLength = MAX_MESSAGE_LENGTH) => {
  const text = String(value || '').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const normalizeError = (error) => {
  if (error instanceof Error) {
    return {
      name: truncate(error.name || 'Error', 80),
      message: truncate(error.message || 'Unknown error'),
      stack: truncate(error.stack || '', 800)
    };
  }

  return {
    name: 'UnknownError',
    message: truncate(error || 'Unknown error'),
    stack: ''
  };
};

export const sanitizeContext = (context = {}) => {
  if (!context || typeof context !== 'object' || Array.isArray(context)) return {};

  return Object.entries(context)
    .slice(0, MAX_CONTEXT_KEYS)
    .reduce((safeContext, [key, value]) => {
      const safeKey = truncate(key, 80);
      if (SENSITIVE_KEY_PATTERN.test(safeKey)) {
        safeContext[safeKey] = '[redacted]';
        return safeContext;
      }

      if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
        safeContext[safeKey] = truncate(value, 160);
        return safeContext;
      }

      safeContext[safeKey] = `[${Array.isArray(value) ? 'array' : 'object'}]`;
      return safeContext;
    }, {});
};

const emit = (event) => {
  events = [event, ...events].slice(0, MAX_BUFFER_SIZE);

  try {
    adapter?.(event);
  } catch (error) {
    console.warn('Observability adapter failed', error);
  }
};

export const captureError = (error, context = {}) => {
  const event = {
    type: 'error',
    timestamp: now(),
    error: normalizeError(error),
    context: sanitizeContext(context)
  };

  emit(event);
  return event;
};

export const captureMessage = (message, context = {}) => {
  const event = {
    type: 'message',
    timestamp: now(),
    message: truncate(message),
    context: sanitizeContext(context)
  };

  emit(event);
  return event;
};

export const getObservabilityEvents = () => [...events];

export const resetObservability = () => {
  events = [];
  adapter = null;
  initialized = false;
};

export const initObservability = ({ eventTarget = window, reporter = null } = {}) => {
  if (initialized || !eventTarget?.addEventListener) return;
  initialized = true;
  adapter = reporter;

  eventTarget.addEventListener('error', (event) => {
    captureError(event.error || event.message, {
      source: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  eventTarget.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason || 'Unhandled promise rejection', {
      source: 'window.unhandledrejection'
    });
  });
};
