import { escapeHTML } from '../utils/sanitize.js';
import { icon } from './icon.js';

export const emptyState = ({ title = '', description = '', action = '', iconName = '' }) => `
  <div class="empty-state" role="status">
    ${iconName ? icon(iconName, { className: 'empty-state__icon', size: 24 }) : ''}
    ${title ? `<strong class="empty-state__title">${escapeHTML(title)}</strong>` : ''}
    ${description ? `<p class="empty-state__desc">${escapeHTML(description)}</p>` : ''}
    ${action ? `<div class="empty-state__action">${action}</div>` : ''}
  </div>
`;
