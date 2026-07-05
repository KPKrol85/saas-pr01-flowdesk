import { icon } from './icon.js';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', iconName: 'dashboard' },
  { path: '/clients', label: 'Klienci', iconName: 'clients' },
  { path: '/projects', label: 'Zlecenia', iconName: 'projects' },
  { path: '/calendar', label: 'Kalendarz', iconName: 'calendar' },
  { path: '/settings', label: 'Ustawienia', iconName: 'settings' }
];

export const renderSidebar = (activePath) => {
  return `
    <aside class="sidebar" aria-label="Nawigacja główna">
      <div class="sidebar__logo">FlowDesk</div>
      <nav class="sidebar__nav">
        ${navItems
          .map(
            (item) => `
            <a class="sidebar__link ${activePath === item.path ? 'sidebar__link--active' : ''}" href="#${item.path}">
              ${icon(item.iconName)}
              <span>${item.label}</span>
            </a>
          `
          )
          .join('')}
      </nav>
    </aside>
  `;
};

export const renderNavList = (activePath) => {
  return `
    <div class="sidebar__logo">FlowDesk</div>
    <nav class="sidebar__nav">
      ${navItems
        .map(
          (item) => `
          <a class="sidebar__link ${activePath === item.path ? 'sidebar__link--active' : ''}" href="#${item.path}">
            ${icon(item.iconName)}
            <span>${item.label}</span>
          </a>
        `
        )
        .join('')}
    </nav>
  `;
};
