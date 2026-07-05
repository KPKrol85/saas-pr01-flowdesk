import { router } from './core/router.js';
import { renderSidebar, renderNavList } from './components/sidebar.js';
import { renderTopbar } from './components/topbar.js';
import { bindDrawerToggle, createDrawer } from './components/drawer.js';
import { auth } from './core/auth.js';
import { selectGlobalSearchResults, selectUiPreferences } from './core/selectors.js';
import { store } from './core/store.js';
import { button } from './components/button.js';
import { openModal } from './components/modal.js';
import { qs } from './core/dom.js';
import { initObservability } from './core/observability.js';
import { registerServiceWorker } from './core/serviceWorkerRegistration.js';
import { showToast } from './components/toast.js';
import { escapeAttribute, escapeHTML } from './utils/sanitize.js';
import { storage } from './utils/storage.js';

const app = document.getElementById('app');

initObservability();

const applyTheme = () => {
  const ui = selectUiPreferences(store.getState());
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${ui.theme}`);
  document.documentElement.classList.toggle('motion-reduced', ui.reducedMotion);
};

let userMenuHandler = null;
let searchCloseHandler = null;

const renderSearchResults = (results) => {
  if (!results.length) {
    return '<div class="search__empty">Brak wyników.</div>';
  }

  return results
    .map(
      (result) => `
        <a class="search__result" href="${escapeAttribute(result.href)}" data-search-result>
          <span class="search__type">${escapeHTML(result.label)}</span>
          <strong>${escapeHTML(result.title)}</strong>
          <span>${escapeHTML(result.description)}</span>
        </a>
      `
    )
    .join('');
};

const bindGlobalSearch = () => {
  const input = qs('#searchInput', app);
  const panel = qs('#searchResults', app);
  if (!input || !panel) return;

  const close = () => {
    panel.hidden = true;
    panel.innerHTML = '';
  };

  const open = () => {
    panel.hidden = false;
  };

  const update = () => {
    const term = input.value.trim();
    if (term.length < 2) {
      close();
      return;
    }

    panel.innerHTML = renderSearchResults(selectGlobalSearchResults(store.getState(), term));
    open();
    panel.querySelectorAll('[data-search-result]').forEach((result) => {
      result.addEventListener('click', close);
    });
  };

  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = '';
      close();
    }
    if (event.key === 'ArrowDown') {
      const firstResult = panel.querySelector('[data-search-result]');
      if (firstResult) {
        event.preventDefault();
        firstResult.focus();
      }
    }
  });

  if (searchCloseHandler) document.removeEventListener('click', searchCloseHandler);
  searchCloseHandler = (event) => {
    if (!panel.contains(event.target) && event.target !== input) close();
  };
  document.addEventListener('click', searchCloseHandler);
};

const renderShell = (activePath, view, params = {}) => {
  app.innerHTML = `
    <div class="app__shell">
      ${renderSidebar(activePath)}
      <div class="app__content">
        ${renderTopbar()}
        <section id="view"></section>
      </div>
    </div>
  `;

  const drawer = createDrawer({ content: renderNavList(activePath) });
  const toggleBtn = qs('#drawerToggle', app);
  if (toggleBtn) bindDrawerToggle({ button: toggleBtn, drawer });

  const viewContainer = qs('#view', app);
  view(viewContainer, params);
  bindGlobalSearch();

  const userMenuBtn = qs('#userMenuBtn', app);
  const userMenuPanel = qs('#userMenuPanel', app);
  userMenuBtn?.addEventListener('click', () => {
    const isOpen = userMenuPanel.classList.toggle('user-menu__panel--open');
    userMenuBtn.setAttribute('aria-expanded', String(isOpen));
  });
  if (userMenuHandler) document.removeEventListener('click', userMenuHandler);
  userMenuHandler = (event) => {
    if (!userMenuPanel.contains(event.target) && !userMenuBtn.contains(event.target)) {
      userMenuPanel.classList.remove('user-menu__panel--open');
      userMenuBtn.setAttribute('aria-expanded', 'false');
    }
  };
  document.addEventListener('click', userMenuHandler);

  qs('#logoutBtn', app)?.addEventListener('click', () => {
    auth.logout();
    showToast('Wylogowano.');
    window.location.hash = '#/login';
  });

  qs('#themeToggle', app)?.addEventListener('click', () => {
    const current = selectUiPreferences(store.getState()).theme;
    store.actions.updateUiPreferences({ theme: current === 'light' ? 'dark' : 'light' });
  });

  qs('#quickAdd', app)?.addEventListener('click', () => {
    const close = openModal({
      title: 'Szybkie dodanie',
      content: `
        <div class="list">
          <p>Wybierz typ rekordu do utworzenia. Dane zostaną zapisane w demo store.</p>
          ${button({ label: 'Nowy klient', variant: 'secondary', iconName: 'clients', attributes: { 'data-quick': 'client' } })}
          ${button({ label: 'Nowe zlecenie', variant: 'secondary', iconName: 'projects', attributes: { 'data-quick': 'project' } })}
        </div>
      `,
      footer: '<button class="btn btn--secondary" data-modal-close>Zamknij</button>'
    });

    document.querySelectorAll('[data-quick]').forEach((button) => {
      button.addEventListener('click', () => {
        showToast(`Dodano szkic: ${button.dataset.quick === 'client' ? 'klient' : 'zlecenie'}.`);
        close();
      });
    });
  });
};

const renderLogin = (view) => {
  app.innerHTML = '';
  view(app);
};

store.subscribe(() => {
  applyTheme();
});

applyTheme();

router.init({
  onRoute: ({ path, view, activePath, params }) => {
    if (path === '/login') {
      renderLogin(view);
      return;
    }
    renderShell(activePath || path, view, params);
  }
});

registerServiceWorker();

if (!storage.isAvailable()) {
  showToast('Tryb bez trwałego zapisu. Dane demo mogą zniknąć po odświeżeniu.');
}
