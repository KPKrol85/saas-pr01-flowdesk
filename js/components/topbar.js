import { auth } from '../core/auth.js';
import { escapeHTML } from '../utils/sanitize.js';
import { icon } from './icon.js';

export const renderTopbar = () => {
  const session = auth.getSession();
  return `
    <header class="topbar">
      <div class="topbar__inner">
        <div class="topbar__left">
          <button class="btn btn--icon topbar__drawer-toggle" id="drawerToggle" aria-label="Otwórz menu" aria-controls="mobileNavigationDrawer" aria-haspopup="dialog" aria-expanded="false">${icon('menu')}</button>
        </div>
        <div class="search" role="search">
          <label class="visually-hidden" for="searchInput">Szukaj</label>
          <input class="search__input" id="searchInput" type="search" placeholder="Szukaj klientów, zleceń..." autocomplete="off" aria-controls="searchResults" />
          <div class="search__results" id="searchResults" hidden></div>
        </div>
        <div class="topbar__actions">
          <button class="btn btn--secondary" id="quickAdd">${icon('plus')}<span>Nowy</span></button>
          <button class="btn btn--icon" id="themeToggle" aria-label="Zmień motyw">${icon('theme')}</button>
          <div class="user-menu">
            <button class="btn btn--icon" id="userMenuBtn" aria-label="Otwórz menu użytkownika" aria-haspopup="true" aria-expanded="false">
              <span class="avatar" aria-hidden="true">${icon('user', { size: 18 })}</span>
            </button>
            <div class="user-menu__panel" id="userMenuPanel" role="menu">
              <p role="none">${escapeHTML(session?.name || 'Użytkownik')} · ${escapeHTML(session?.role || 'Demo')}</p>
              <button class="btn btn--ghost" id="logoutBtn" role="menuitem">Wyloguj</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
};
