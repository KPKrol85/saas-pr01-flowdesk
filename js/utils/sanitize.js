const HTML_ESCAPE_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
});

export const safeText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const escapeHTML = (value) => safeText(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);

export const escapeAttribute = escapeHTML;
