import { qs, qsa, createElement } from '../core/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';
import { escapeHTML } from '../utils/sanitize.js';
import { icon } from './icon.js';

const focusableSelectors = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'];
const modalExitDuration = 140;
let modalId = 0;

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
  const invoker = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const titleId = `modalTitle${(modalId += 1)}`;
  const backdrop = createElement(`
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
      <div class="modal">
        <div class="modal__header">
          <h2 class="modal__title" id="${titleId}">${escapeHTML(title)}</h2>
          <button class="btn btn--ghost btn--icon" data-modal-close aria-label="Zamknij modal">${icon('close')}</button>
        </div>
        <div class="modal__body">${content}</div>
        ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
      </div>
    </div>
  `);

  let closed = false;
  let cleanupTrap = () => {};

  const remove = () => {
    cleanupTrap();
    backdrop.removeEventListener('keydown', handleEsc);
    backdrop.remove();
    if (onClose) onClose();
    if (invoker && document.contains(invoker) && typeof invoker.focus === 'function') {
      invoker.focus();
    }
  };

  const close = () => {
    if (closed) return;
    closed = true;

    if (prefersReducedMotion()) {
      remove();
      return;
    }

    backdrop.classList.add('modal-backdrop--closing');
    window.setTimeout(remove, modalExitDuration);
  };

  const handleEsc = (event) => {
    if (event.key === 'Escape') close();
  };

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });

  qsa('[data-modal-close]', backdrop).forEach((button) => button.addEventListener('click', close));

  document.body.appendChild(backdrop);

  cleanupTrap = trapFocus(backdrop);
  backdrop.addEventListener('keydown', handleEsc);
  const firstInput = qs(
    '.modal__body input, .modal__body select, .modal__body textarea, .modal__body button, .modal__body [href], .modal__footer button, .modal__footer [href], [data-modal-close]',
    backdrop
  );
  if (firstInput) firstInput.focus();

  return close;
};
