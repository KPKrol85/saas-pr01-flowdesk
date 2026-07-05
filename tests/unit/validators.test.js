import { describe, expect, it } from 'vitest';
import { validators } from '../../js/utils/validators.js';

describe('validators', () => {
  it('validates required text', () => {
    expect(validators.required('FlowDesk')).toBe(true);
    expect(validators.required('  ')).toBe(false);
    expect(validators.required('')).toBe('');
  });

  it('validates email format', () => {
    expect(validators.email('demo@flowdesk.pl')).toBe(true);
    expect(validators.email('demo@flowdesk')).toBe(false);
    expect(validators.email('demo.flowdesk.pl')).toBe(false);
  });

  it('validates minimum trimmed length', () => {
    expect(validators.minLength('abcdef', 6)).toBe(true);
    expect(validators.minLength(' abc ', 4)).toBe(false);
  });
});
