import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureError, captureMessage, getObservabilityEvents, initObservability, resetObservability, sanitizeContext } from '../../js/core/observability.js';

const createEventTarget = () => {
  const listeners = new Map();

  return {
    addEventListener: vi.fn((type, handler) => {
      listeners.set(type, handler);
    }),
    dispatch(type, event) {
      listeners.get(type)?.(event);
    }
  };
};

describe('observability readiness', () => {
  beforeEach(() => {
    resetObservability();
  });

  it('captures Error objects without throwing', () => {
    const event = captureError(new Error('Broken flow'), { route: '/dashboard' });

    expect(event).toMatchObject({
      type: 'error',
      error: {
        name: 'Error',
        message: 'Broken flow'
      },
      context: {
        route: '/dashboard'
      }
    });
    expect(getObservabilityEvents()).toHaveLength(1);
  });

  it('captures unknown error values and short messages safely', () => {
    const event = captureError({ unexpected: true }, { payload: '<script>alert(1)</script>' });

    expect(event.error).toMatchObject({
      name: 'UnknownError',
      message: '[object Object]'
    });
    expect(event.context.payload).toBe('[redacted]');
  });

  it('captures messages and sanitizes sensitive context', () => {
    const event = captureMessage('Release smoke check completed', {
      email: 'demo@flowdesk.pl',
      status: 'ok',
      details: { nested: true }
    });

    expect(event).toMatchObject({
      type: 'message',
      message: 'Release smoke check completed',
      context: {
        email: '[redacted]',
        status: 'ok',
        details: '[object]'
      }
    });
  });

  it('limits context to safe primitive summaries', () => {
    const context = sanitizeContext({
      route: '/clients',
      count: 4,
      enabled: true,
      list: ['a'],
      data: { id: 1 },
      token: 'secret'
    });

    expect(context).toEqual({
      route: '/clients',
      count: '4',
      enabled: 'true',
      list: '[array]',
      data: '[object]',
      token: '[redacted]'
    });
  });

  it('does not throw when a future adapter fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const target = createEventTarget();

    initObservability({
      eventTarget: target,
      reporter: () => {
        throw new Error('adapter failed');
      }
    });

    expect(() => captureMessage('adapter test')).not.toThrow();
    expect(warn).toHaveBeenCalledWith('Observability adapter failed', expect.any(Error));
  });

  it('registers safe global error and rejection handlers', () => {
    const target = createEventTarget();

    initObservability({ eventTarget: target });
    target.dispatch('error', {
      error: new Error('Window failure'),
      filename: '/js/main.js',
      lineno: 10,
      colno: 2
    });
    target.dispatch('unhandledrejection', {
      reason: 'Promise failed'
    });

    expect(target.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(target.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(getObservabilityEvents()).toHaveLength(2);
    expect(getObservabilityEvents()[0].context.source).toBe('window.unhandledrejection');
  });
});
