import { escapeHTML } from '../utils/sanitize.js';

export const pageHeader = ({ title, description = '', actions = '', eyebrow = '' }) => `
  <header class="view-header page-header">
    ${eyebrow ? `<p class="page-header__eyebrow">${escapeHTML(eyebrow)}</p>` : ''}
    <div class="page-header__main">
      <div>
        <h1 class="view-header__title">${escapeHTML(title)}</h1>
        ${description ? `<p class="view-header__desc">${escapeHTML(description)}</p>` : ''}
      </div>
      ${actions ? `<div class="page-header__actions">${actions}</div>` : ''}
    </div>
  </header>
`;
