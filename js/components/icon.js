import { escapeAttribute } from '../utils/sanitize.js';

const icons = Object.freeze({
  dashboard: '<path d="M4 13h6V4H4v9Z"></path><path d="M14 20h6V4h-6v16Z"></path><path d="M4 20h6v-3H4v3Z"></path>',
  clients: '<path d="M16 11a4 4 0 1 0-8 0"></path><path d="M4 20a8 8 0 0 1 16 0"></path><path d="M18 8a3 3 0 0 1 3 3"></path>',
  projects: '<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path><path d="M8 5v14"></path><path d="M16 5v14"></path>',
  calendar: '<path d="M7 3v4"></path><path d="M17 3v4"></path><path d="M4 8h16"></path><rect x="4" y="5" width="16" height="16" rx="2"></rect>',
  settings:
    '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V22a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 18l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"></path>',
  plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
  edit: '<path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z"></path><path d="m13 7 4 4"></path>',
  delete: '<path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M6 7l1 14h10l1-14"></path><path d="M9 7V4h6v3"></path>',
  close: '<path d="M6 6l12 12"></path><path d="M18 6 6 18"></path>',
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m16 16 4 4"></path>',
  export: '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
  reset: '<path d="M4 12a8 8 0 1 0 3-6.2"></path><path d="M4 4v6h6"></path>',
  theme: '<path d="M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8Z"></path>',
  menu: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>',
  user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>'
});

export const iconNames = Object.freeze(Object.keys(icons));

export const icon = (name, { className = '', label = '', size = 20 } = {}) => {
  const body = icons[name];
  if (!body) return '';
  const accessibility = label ? `role="img" aria-label="${escapeAttribute(label)}"` : 'aria-hidden="true" focusable="false"';

  return `<svg class="icon ${escapeAttribute(className)}" width="${escapeAttribute(size)}" height="${escapeAttribute(size)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${accessibility}>${body}</svg>`;
};
