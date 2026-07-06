import { button } from './button.js';
import { openModal } from './modal.js';
import { escapeHTML } from '../utils/sanitize.js';

export const openConfirmDialog = ({ title, message, confirmLabel = 'Potwierdź', cancelLabel = 'Anuluj', destructive = false, onConfirm }) => {
  const close = openModal({
    title,
    content: `<div class="confirm-dialog"><p>${escapeHTML(message)}</p></div>`,
    footer: `
      ${button({ label: cancelLabel, variant: 'secondary', className: 'confirm-dialog__cancel', attributes: { 'data-modal-close': true } })}
      ${button({
        label: confirmLabel,
        id: 'confirmDialogConfirm',
        variant: destructive ? 'danger' : 'primary',
        iconName: destructive ? 'delete' : '',
        className: 'confirm-dialog__confirm'
      })}
    `
  });

  document.getElementById('confirmDialogConfirm')?.addEventListener('click', () => {
    if (onConfirm) onConfirm();
    close();
  });

  return close;
};
