import { qs, qsa, createElement } from '../core/dom.js';
import { escapeHTML } from '../utils/sanitize.js';
import { icon } from './icon.js';

const focusableSelectors = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'];

const trapFocus = (container) => {
  const focusables = qsa(focusableSelectors.join(','), container);
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  const handleKey = (event) => {
    if (event.key !== 'Tab') return;
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKey);
  return () => container.removeEventListener('keydown', handleKey);
};

export const openModal = ({ title, content, footer, onClose }) => {
  const backdrop = createElement(`
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title">${escapeHTML(title)}</h2>
          <button class="btn btn--ghost btn--icon" data-modal-close aria-label="Zamknij modal">${icon('close')}</button>
        </div>
        <div class="modal__body">${content}</div>
        ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
      </div>
    </div>
  `);

  const close = () => {
    backdrop.remove();
    if (onClose) onClose();
  };

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });

  qsa('[data-modal-close]', backdrop).forEach((button) => button.addEventListener('click', close));

  document.body.appendChild(backdrop);

  const cleanupTrap = trapFocus(backdrop);
  const handleEsc = (event) => {
    if (event.key === 'Escape') close();
  };

  backdrop.addEventListener('keydown', handleEsc);
  const firstInput = qs('input, select, textarea, button', backdrop);
  if (firstInput) firstInput.focus();

  return () => {
    cleanupTrap();
    backdrop.removeEventListener('keydown', handleEsc);
    close();
  };
};
