const STATE_STORAGE_KEY = 'flowdesk_state_v1';
const THEMES = Object.freeze({
  light: 'light',
  dark: 'dark'
});

const themeToggleStates = Object.freeze({
  [THEMES.light]: {
    icon: '<svg class="legal-theme-toggle__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>',
    label: 'Włącz ciemny motyw'
  },
  [THEMES.dark]: {
    icon: '<svg class="legal-theme-toggle__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>',
    label: 'Włącz jasny motyw'
  }
});

const isTheme = (value) => value === THEMES.light || value === THEMES.dark;

const getStoredState = () => {
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredTheme = () => {
  const theme = getStoredState()?.ui?.theme;
  return isTheme(theme) ? theme : THEMES.light;
};

const setThemeClass = (element, theme) => {
  if (!element) return;
  element.classList.remove(`theme-${THEMES.light}`, `theme-${THEMES.dark}`);
  element.classList.add(`theme-${theme}`);
};

const syncThemeToggle = (theme) => {
  const button = document.getElementById('legalThemeToggle');
  if (!button) return;

  const state = themeToggleStates[theme];
  button.setAttribute('aria-label', state.label);
  button.innerHTML = state.icon;
};

const applyTheme = (theme) => {
  setThemeClass(document.documentElement, theme);
  setThemeClass(document.body, theme);
  syncThemeToggle(theme);
};

const saveTheme = (theme) => {
  try {
    const storedState = getStoredState();
    const state = storedState && typeof storedState === 'object' && !Array.isArray(storedState) ? storedState : {};
    const ui = state.ui && typeof state.ui === 'object' && !Array.isArray(state.ui) ? state.ui : {};
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify({ ...state, ui: { ...ui, theme } }));
  } catch {
    // Theme changes remain available for the current page when browser storage is unavailable.
  }
};

const initializeThemeToggle = () => {
  let theme = getStoredTheme();
  applyTheme(theme);

  document.getElementById('legalThemeToggle')?.addEventListener('click', () => {
    theme = theme === THEMES.light ? THEMES.dark : THEMES.light;
    saveTheme(theme);
    applyTheme(theme);
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STATE_STORAGE_KEY) applyTheme(getStoredTheme());
  });
};

// Apply the persisted class before the stylesheet is parsed to avoid a light-theme flash.
setThemeClass(document.documentElement, getStoredTheme());

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeToggle, { once: true });
} else {
  initializeThemeToggle();
}
