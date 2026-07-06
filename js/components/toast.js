import { createElement } from '../core/dom.js';
import { prefersReducedMotion } from '../utils/motion.js';

const toastExitDuration = 140;

const ensureStack = () => {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = createElement('<div class="toast-stack" role="status" aria-live="polite"></div>');
    document.body.appendChild(stack);
  }
  return stack;
};

const dismissToast = (toast) => {
  if (!toast.isConnected) return;

  if (prefersReducedMotion()) {
    toast.remove();
    return;
  }

  toast.classList.add('toast--leaving');
  window.setTimeout(() => toast.remove(), toastExitDuration);
};

export const showToast = (message) => {
  const stack = ensureStack();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => dismissToast(toast), 3200);
};

export const showActionToast = ({ message, actionLabel, onAction, timeout = 0 }) => {
  const stack = ensureStack();
  const toast = document.createElement('div');
  toast.className = 'toast toast--action';

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  const action = document.createElement('button');
  action.className = 'toast__action';
  action.type = 'button';
  action.textContent = actionLabel;
  action.addEventListener('click', () => {
    onAction?.();
    dismissToast(toast);
  });
  toast.appendChild(action);
  stack.appendChild(toast);

  if (timeout > 0) {
    setTimeout(() => dismissToast(toast), timeout);
  }

  return toast;
};
