import { qsa } from '../core/dom.js';
import { icon } from './icon.js';

export const createDrawer = ({ content }) => {
  document.querySelectorAll('.drawer').forEach((existingDrawer) => existingDrawer.remove());
  document.body.classList.remove('scroll-lock');

  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer__overlay" data-drawer-close tabindex="-1"></div>
    <div class="drawer__panel" id="mobileNavigationDrawer" role="dialog" aria-modal="true" aria-label="Menu główne" tabindex="-1">
      <div class="drawer__header">
        <span class="drawer__title">Menu</span>
        <button class="btn btn--icon drawer__close" type="button" data-drawer-close aria-label="Zamknij menu">${icon('close')}</button>
      </div>
      <div class="drawer__content">
        ${content}
      </div>
    </div>
  `;
  const focusableSelectors = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'];
  let invoker = null;

  const isOpen = () => drawer.classList.contains('drawer--open');

  const syncInvokerState = (expanded) => {
    if (!invoker) return;
    invoker.setAttribute('aria-expanded', String(expanded));
    if (invoker.id === 'drawerToggle') {
      invoker.setAttribute('aria-label', expanded ? 'Zamknij menu' : 'Otwórz menu');
    }
  };

  const focusInvoker = () => {
    if (invoker && document.contains(invoker)) invoker.focus();
  };

  const open = ({ trigger } = {}) => {
    invoker = trigger || document.activeElement;
    drawer.classList.add('drawer--open');
    syncInvokerState(true);
    drawer.querySelector('.drawer__panel').focus();
    document.body.classList.add('scroll-lock');
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!isOpen()) return;
    drawer.classList.remove('drawer--open');
    document.body.classList.remove('scroll-lock');
    syncInvokerState(false);
    if (restoreFocus) focusInvoker();
  };

  const toggle = (trigger) => {
    if (isOpen()) {
      close();
      return;
    }
    open({ trigger });
  };

  drawer.addEventListener('click', (event) => {
    if (event.target.closest('[data-drawer-close]')) close();
    if (event.target.closest('.sidebar__brand, .sidebar__link')) close();
  });

  drawer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
    if (event.key !== 'Tab') return;
    const focusables = qsa(focusableSelectors.join(','), drawer);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.body.appendChild(drawer);

  return { drawer, open, close, toggle, isOpen };
};

export const bindDrawerToggle = ({ button, drawer }) => {
  button.addEventListener('click', () => drawer.toggle(button));
};
