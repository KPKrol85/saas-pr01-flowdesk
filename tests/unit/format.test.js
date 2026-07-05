import { describe, expect, it } from 'vitest';
import { capitalize, formatDate, formatNumber } from '../../js/utils/format.js';

describe('format helpers', () => {
  it('formats valid dates and hides empty or invalid values', () => {
    expect(formatDate('')).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDate('2026-02-08T12:00:00.000Z')).toContain('2026');
  });

  it('formats numbers with the Polish locale', () => {
    expect(formatNumber(123456)).toBe(new Intl.NumberFormat('pl-PL').format(123456));
    expect(formatNumber()).toBe('0');
  });

  it('capitalizes the first character only', () => {
    expect(capitalize('flowdesk')).toBe('Flowdesk');
    expect(capitalize('')).toBe('');
  });
});
