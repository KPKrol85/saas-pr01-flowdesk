import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storage } from '../../js/utils/storage.js';

describe('storage helper', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns fallback when a key is missing', () => {
    expect(storage.get('missing', { ok: true })).toEqual({ ok: true });
  });

  it('stores, reads, and removes JSON values', () => {
    expect(storage.isAvailable()).toBe(true);
    expect(storage.set('flowdesk:test', { name: 'Nova Studio' })).toBe(true);

    expect(storage.get('flowdesk:test')).toEqual({ name: 'Nova Studio' });

    expect(storage.remove('flowdesk:test')).toBe(true);
    expect(storage.get('flowdesk:test')).toBeNull();
  });

  it('returns fallback when stored JSON is invalid', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem('broken', '{');

    expect(storage.get('broken', 'fallback')).toBe('fallback');
    expect(warn).toHaveBeenCalledWith('Storage read failed', expect.any(SyntaxError));
  });

  it('returns safe fallbacks when localStorage is unavailable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    const storageError = new Error('storage blocked');

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => {
          throw storageError;
        }),
        setItem: vi.fn(() => {
          throw storageError;
        }),
        removeItem: vi.fn(() => {
          throw storageError;
        }),
        clear: vi.fn()
      }
    });

    expect(storage.isAvailable()).toBe(false);
    expect(storage.get('flowdesk:test', 'fallback')).toBe('fallback');
    expect(storage.set('flowdesk:test', { ok: true })).toBe(false);
    expect(storage.remove('flowdesk:test')).toBe(false);

    Object.defineProperty(window, 'localStorage', originalDescriptor);
    warn.mockRestore();
  });
});
