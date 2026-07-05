import { store } from '../core/store.js';
import { selectDashboardMetrics, selectHighPriorityOpenProjects, selectNextActions, selectUpcomingEvents } from '../core/selectors.js';
import { emptyState } from '../components/emptyState.js';
import { pageHeader } from '../components/pageHeader.js';
import { formatDate, formatNumber } from '../utils/format.js';
import { escapeHTML } from '../utils/sanitize.js';

export const renderDashboardView = (container) => {
  const state = store.getState();
  const metrics = selectDashboardMetrics(state);
  const nextActions = selectNextActions(state);
  const highPriorityProjects = selectHighPriorityOpenProjects(state);
  const upcomingEvents = selectUpcomingEvents(state);

  container.innerHTML = `
    <main id="main" class="container">
      ${pageHeader({ title: 'Dashboard', description: 'Szybki podgląd kluczowych działań i stanu operacji.' })}

      <section class="dashboard-grid">
        <div class="dashboard-kpi">
          <div class="card kpi">
            <span class="kpi__value">${formatNumber(metrics.overdueProjectsCount)}</span>
            <span class="kpi__label">Zaległe zlecenia</span>
          </div>
          <div class="card kpi">
            <span class="kpi__value">${formatNumber(metrics.completedProjectsCount)}</span>
            <span class="kpi__label">Ukończone zlecenia</span>
          </div>
          <div class="card kpi">
            <span class="kpi__value">${formatNumber(metrics.throughputProjectsCount)}</span>
            <span class="kpi__label">Throughput 30 dni</span>
          </div>
          <div class="card kpi">
            <span class="kpi__value">${formatNumber(metrics.highPriorityOpenProjectsCount)}</span>
            <span class="kpi__label">High priority open</span>
          </div>
        </div>

        <div class="dashboard-columns">
          <section class="card">
            <h2 class="card__title">Najbliższe działania</h2>
            <div class="list">
              ${
                nextActions.length
                  ? nextActions
                      .map(
                        (item) => `
                    <div class="list__item">
                      <div>
                        <a href="#/projects/${encodeURIComponent(item.id)}"><strong>${escapeHTML(item.name)}</strong></a>
                        <div class="input__helper">Termin: ${escapeHTML(formatDate(item.dueDate))}</div>
                      </div>
                      <span class="badge badge--info">${escapeHTML(item.status)}</span>
                    </div>
                  `
                      )
                      .join('')
                  : emptyState({ description: 'Brak zaplanowanych działań.', iconName: 'projects' })
              }
            </div>
          </section>

          <section class="card">
            <h2 class="card__title">High priority</h2>
            <div class="list">
              ${
                highPriorityProjects.length
                  ? highPriorityProjects
                      .map(
                        (item) => `
                    <div class="list__item">
                      <div>
                        <a href="#/projects/${encodeURIComponent(item.id)}"><strong>${escapeHTML(item.name)}</strong></a>
                        <div class="input__helper">Termin: ${escapeHTML(formatDate(item.dueDate))}</div>
                      </div>
                      <span class="badge badge--warning">${escapeHTML(item.priority)}</span>
                    </div>
                  `
                      )
                      .join('')
                  : emptyState({ description: 'Brak otwartych zleceń high priority.', iconName: 'projects' })
              }
            </div>
          </section>
        </div>

        <section class="card">
          <h2 class="card__title">Nadchodzące wydarzenia</h2>
          <div class="list">
            ${
              upcomingEvents.length
                ? upcomingEvents
                    .map(
                      (event) => `
                    <div class="list__item">
                      <div>
                        <strong>${escapeHTML(event.title)}</strong>
                        <div class="input__helper">${escapeHTML(formatDate(event.date))}</div>
                      </div>
                      <span class="badge badge--info">Upcoming</span>
                    </div>
                  `
                    )
                    .join('')
                : emptyState({ description: 'Brak wydarzeń w najbliższych dniach.', iconName: 'calendar' })
            }
          </div>
        </section>
      </section>
    </main>
  `;
};
