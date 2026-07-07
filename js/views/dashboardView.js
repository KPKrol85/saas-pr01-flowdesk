import { store } from '../core/store.js';
import { selectDashboardMetrics, selectHighPriorityOpenProjects, selectNextActions, selectUpcomingEvents } from '../core/selectors.js';
import { emptyState } from '../components/emptyState.js';
import { pageHeader } from '../components/pageHeader.js';
import { formatDate, formatNumber } from '../utils/format.js';
import { escapeHTML } from '../utils/sanitize.js';

const priorityLabels = {
  High: 'Wysoki priorytet',
  Medium: 'Średni priorytet',
  Low: 'Niski priorytet'
};

const formatPriorityLabel = (priority) => priorityLabels[priority] || priority;

const isPastDue = (value, referenceDate = new Date()) => {
  const dueDate = new Date(value);
  return !Number.isNaN(dueDate.getTime()) && dueDate.getTime() < referenceDate.getTime();
};

const overdueBadge = (item, referenceDate) => (isPastDue(item.dueDate, referenceDate) ? '<span class="badge badge--danger">Po terminie</span>' : '');

export const renderDashboardView = (container) => {
  const state = store.getState();
  const metrics = selectDashboardMetrics(state);
  const nextActions = selectNextActions(state);
  const highPriorityProjects = selectHighPriorityOpenProjects(state);
  const upcomingEvents = selectUpcomingEvents(state);
  const referenceDate = new Date();

  container.innerHTML = `
    <main id="main" class="container">
      ${pageHeader({ title: 'Dashboard', description: 'Przegląd klientów, zleceń, terminów i działań wymagających uwagi.' })}

      <section class="dashboard-grid">
        <div class="dashboard-kpi">
          <div class="card kpi dashboard-kpi__card dashboard-kpi__card--attention">
            <span class="kpi__value">${formatNumber(metrics.overdueProjectsCount)}</span>
            <span class="kpi__label">Zaległe zlecenia</span>
            <span class="dashboard-kpi__hint">Po terminie</span>
          </div>
          <div class="card kpi dashboard-kpi__card dashboard-kpi__card--success">
            <span class="kpi__value">${formatNumber(metrics.completedProjectsCount)}</span>
            <span class="kpi__label">Ukończone zlecenia</span>
            <span class="dashboard-kpi__hint">Łącznie</span>
          </div>
          <div class="card kpi dashboard-kpi__card dashboard-kpi__card--info">
            <span class="kpi__value">${formatNumber(metrics.throughputProjectsCount)}</span>
            <span class="kpi__label">Zamknięte w 30 dni</span>
            <span class="dashboard-kpi__hint">Ostatni okres</span>
          </div>
          <div class="card kpi dashboard-kpi__card dashboard-kpi__card--attention">
            <span class="kpi__value">${formatNumber(metrics.highPriorityOpenProjectsCount)}</span>
            <span class="kpi__label">Wysoki priorytet</span>
            <span class="dashboard-kpi__hint">Otwarte</span>
          </div>
        </div>

        <div class="dashboard-columns">
          <section class="card dashboard-card dashboard-card--quick-actions" aria-labelledby="dashboard-next-actions-title">
            <h2 class="card__title" id="dashboard-next-actions-title">Najbliższe działania</h2>
            <div class="list dashboard-list">
              ${
                nextActions.length
                  ? nextActions
                      .map(
                        (item) => `
                    <div class="list__item dashboard-list__item">
                      <div class="dashboard-list__main">
                        <a class="dashboard-list__link" href="#/projects/${encodeURIComponent(item.id)}"><strong>${escapeHTML(item.name)}</strong></a>
                        <div class="input__helper dashboard-list__meta">Termin: ${escapeHTML(formatDate(item.dueDate))}</div>
                      </div>
                      <div class="dashboard-list__badges">
                        ${overdueBadge(item, referenceDate)}
                        <span class="badge badge--info">${escapeHTML(item.status)}</span>
                      </div>
                    </div>
                  `
                      )
                      .join('')
                  : emptyState({ title: 'Brak zaplanowanych działań', description: 'Najbliższe zadania pojawią się tutaj automatycznie.', iconName: 'projects' })
              }
            </div>
          </section>

          <section class="card dashboard-card dashboard-card--priority" aria-labelledby="dashboard-priority-title">
            <h2 class="card__title" id="dashboard-priority-title">Zlecenia wysokiego priorytetu</h2>
            <div class="list dashboard-list">
              ${
                highPriorityProjects.length
                  ? highPriorityProjects
                      .map(
                        (item) => `
                    <div class="list__item dashboard-list__item">
                      <div class="dashboard-list__main">
                        <a class="dashboard-list__link" href="#/projects/${encodeURIComponent(item.id)}"><strong>${escapeHTML(item.name)}</strong></a>
                        <div class="input__helper dashboard-list__meta">Termin: ${escapeHTML(formatDate(item.dueDate))}</div>
                      </div>
                      <div class="dashboard-list__badges">
                        ${overdueBadge(item, referenceDate)}
                        <span class="badge badge--warning">${escapeHTML(formatPriorityLabel(item.priority))}</span>
                      </div>
                    </div>
                  `
                      )
                      .join('')
                  : emptyState({ title: 'Brak pilnych zleceń', description: 'Nie ma otwartych zleceń wysokiego priorytetu.', iconName: 'projects' })
              }
            </div>
          </section>
        </div>

        <section class="card dashboard-card dashboard-card--events" aria-labelledby="dashboard-events-title">
          <h2 class="card__title" id="dashboard-events-title">Nadchodzące wydarzenia</h2>
          <div class="list dashboard-list">
            ${
              upcomingEvents.length
                ? upcomingEvents
                    .map(
                      (event) => `
                    <div class="list__item dashboard-list__item">
                      <div class="dashboard-list__main">
                        <strong>${escapeHTML(event.title)}</strong>
                        <div class="input__helper dashboard-list__meta">${escapeHTML(formatDate(event.date))}</div>
                      </div>
                      <div class="dashboard-list__badges">
                        <span class="badge badge--info">Nadchodzące</span>
                      </div>
                    </div>
                  `
                    )
                    .join('')
                : emptyState({ title: 'Brak wydarzeń', description: 'Nie ma wydarzeń w najbliższych dniach.', iconName: 'calendar' })
            }
          </div>
        </section>
      </section>
    </main>
  `;
};
