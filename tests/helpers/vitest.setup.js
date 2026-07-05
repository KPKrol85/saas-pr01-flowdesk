import { afterEach, vi } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.location.hash = '';
  vi.clearAllTimers();
  vi.restoreAllMocks();
});
