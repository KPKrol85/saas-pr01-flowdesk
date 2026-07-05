import { validateUserSession } from '../domain/validators.js';
import { storage } from '../utils/storage.js';

export const SESSION_KEY = 'flowdesk_session_v1';

// Demo-only authentication. It creates a localStorage session and must not be treated as production security.
export const demoAuth = {
  login({ email }) {
    const result = validateUserSession({
      email,
      name: 'Alicja Maj',
      role: 'Owner',
      lastLogin: new Date().toISOString()
    });
    if (!result.valid) return null;
    const session = result.value;
    storage.set(SESSION_KEY, session);
    return session;
  },
  logout() {
    storage.remove(SESSION_KEY);
  },
  getSession() {
    const result = validateUserSession(storage.get(SESSION_KEY));
    if (!result.valid) {
      storage.remove(SESSION_KEY);
      return null;
    }
    return result.value;
  },
  isAuthenticated() {
    return Boolean(this.getSession());
  }
};
