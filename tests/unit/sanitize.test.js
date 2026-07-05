import { describe, expect, it } from 'vitest';
import { escapeAttribute, escapeHTML, safeText } from '../../js/utils/sanitize.js';

describe('sanitize utilities', () => {
  it('converts nullish values to safe empty text', () => {
    expect(safeText(null)).toBe('');
    expect(safeText(undefined)).toBe('');
  });

  it('escapes HTML control characters', () => {
    expect(escapeHTML(`<img src=x onerror="alert('xss')">`)).toBe('&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;');
  });

  it('escapes attribute-breaking quotes and angle brackets', () => {
    expect(escapeAttribute(`" autofocus onfocus="alert(1)`)).toBe('&quot; autofocus onfocus=&quot;alert(1)');
  });

  it('stringifies malformed primitive values predictably', () => {
    expect(escapeHTML(42)).toBe('42');
    expect(escapeHTML(false)).toBe('false');
  });
});
