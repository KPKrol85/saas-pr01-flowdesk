import { qs, qsa } from '../core/dom.js';

export const createDrawer = ({ content }) => {
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer__overlay" data-drawer-close tabindex="-1"></div>
    <nav class="drawer__panel" role="dialog" aria-modal="true" tabindex="-1">
      ${content}
    </nav>
  `;
  const focusableSelectors = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'];

  const open = () => {
    drawer.classList.add('drawer--open');
    drawer.querySelector('.drawer__panel').focus();
    document.body.classList.add('scroll-lock');
  };

  const close = () => {
    drawer.classList.remove('drawer--open');
    document.body.classList.remove('scroll-lock');
  };

  drawer.addEventListener('click', (event) => {
    if (event.target.matches('[data-drawer-close]')) close();
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

  return { drawer, open, close };
};

export const bindDrawerToggle = ({ button, drawer }) => {
  const toggle = () => {
    const isOpen = drawer.classList.contains('drawer--open');
    if (isOpen) {
      drawer.classList.remove('drawer--open');
      document.body.classList.remove('scroll-lock');
      button.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.add('drawer--open');
      document.body.classList.add('scroll-lock');
      button.setAttribute('aria-expanded', 'true');
      qs('.drawer__panel', drawer).focus();
    }
  };

  button.addEventListener('click', toggle);
};
