import { auth } from './auth.js';
import { renderLoginView } from '../views/loginView.js';
import { renderDashboardView } from '../views/dashboardView.js';
import { renderClientDetailView } from '../views/clientDetailView.js';
import { renderClientsView } from '../views/clientsView.js';
import { renderProjectDetailView } from '../views/projectDetailView.js';
import { renderProjectsView } from '../views/projectsView.js';
import { renderCalendarView } from '../views/calendarView.js';
import { renderSettingsView } from '../views/settingsView.js';
import { renderNotFoundView } from '../views/notFoundView.js';

const routes = {
  '/login': renderLoginView,
  '/dashboard': renderDashboardView,
  '/clients': renderClientsView,
  '/projects': renderProjectsView,
  '/calendar': renderCalendarView,
  '/settings': renderSettingsView
};

const dynamicRoutes = [
  { pattern: /^\/clients\/([^/]+)$/, view: renderClientDetailView, activePath: '/clients', param: 'id' },
  { pattern: /^\/projects\/([^/]+)$/, view: renderProjectDetailView, activePath: '/projects', param: 'id' }
];

const matchRoute = (path) => {
  if (routes[path]) return { view: routes[path], activePath: path, params: {} };

  const dynamicRoute = dynamicRoutes.find((route) => route.pattern.test(path));
  if (!dynamicRoute) return { view: renderNotFoundView, activePath: path, params: {} };

  const [, value] = path.match(dynamicRoute.pattern);
  return {
    view: dynamicRoute.view,
    activePath: dynamicRoute.activePath,
    params: { [dynamicRoute.param]: decodeURIComponent(value || '') }
  };
};

export const parseRoute = () => {
  const hash = window.location.hash.replace('#', '') || '/dashboard';
  return hash.startsWith('/') ? hash : `/${hash}`;
};

export const router = {
  init({ onRoute }) {
    const handleRoute = () => {
      const path = parseRoute();
      const isAuthed = auth.isAuthenticated();
      if (!isAuthed && path !== '/login') {
        window.location.hash = '#/login';
        return;
      }
      if (isAuthed && path === '/login') {
        window.location.hash = '#/dashboard';
        return;
      }
      const matchedRoute = matchRoute(path);
      onRoute({ path, view: matchedRoute.view, activePath: matchedRoute.activePath, params: matchedRoute.params });
    };

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
    handleRoute();

    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('load', handleRoute);
    };
  }
};
