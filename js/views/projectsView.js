import { qs } from '../core/dom.js';
import { getActionFieldError } from '../core/actions.js';
import { selectActiveClients, selectFilteredProjects, selectProjectById, selectProjectsByStatus, selectProjectsWithClients } from '../core/selectors.js';
import { store } from '../core/store.js';
import { PROJECT_PRIORITIES, PROJECT_SERVICE_LEVELS, PROJECT_STATUSES } from '../domain/constants.js';
import { button } from '../components/button.js';
import { openConfirmDialog } from '../components/confirmDialog.js';
import { inputField, selectField, setFieldError, textareaField } from '../components/formControls.js';
import { openModal } from '../components/modal.js';
import { pageHeader } from '../components/pageHeader.js';
import { showToast } from '../components/toast.js';
import { formatDate } from '../utils/format.js';
import { escapeAttribute, escapeHTML } from '../utils/sanitize.js';

const statusColumns = PROJECT_STATUSES;
const priorityOptions = PROJECT_PRIORITIES;

const projectModalContent = (project = {}, clients = []) => `
  <form id="projectForm" class="form-grid">
    ${inputField({ id: 'name', label: 'Nazwa', value: project.name || '', required: true })}
    <div class="form-grid form-grid--two">
      ${selectField({
        id: 'client',
        label: 'Klient',
        value: project.clientId,
        required: true,
        options: clients.map((client) => ({ value: client.id, label: client.name }))
      })}
      ${selectField({
        id: 'status',
        label: 'Status',
        value: project.status,
        options: statusColumns.map((status) => ({ value: status, label: status }))
      })}
    </div>
    <div class="form-grid form-grid--two">
      ${selectField({
        id: 'priority',
        label: 'Priorytet',
        value: project.priority,
        options: priorityOptions.map((priority) => ({ value: priority, label: priority }))
      })}
      ${inputField({ id: 'dueDate', label: 'Termin', type: 'date', value: project.dueDate ? project.dueDate.split('T')[0] : '' })}
    </div>
    <div class="form-grid form-grid--two">
      ${selectField({
        id: 'serviceLevel',
        label: 'SLA',
        value: project.sla?.serviceLevel,
        options: PROJECT_SERVICE_LEVELS.map((level) => ({ value: level, label: level }))
      })}
      ${inputField({ id: 'responseDueDate', label: 'Reakcja SLA', type: 'date', value: project.sla?.responseDueDate ? project.sla.responseDueDate.split('T')[0] : '' })}
    </div>
    <div class="form-grid form-grid--two">
      ${inputField({ id: 'estimateHours', label: 'Estymacja godzin', type: 'number', value: project.estimate?.hours || '', placeholder: '24' })}
      ${inputField({ id: 'estimateValue', label: 'Wartość PLN', type: 'number', value: project.estimate?.value || '', placeholder: '9600' })}
    </div>
    ${textareaField({ id: 'notes', label: 'Notatki', value: project.notes || '', rows: 3 })}
  </form>
`;

const badgeClass = (value) => {
  if (value === 'High' || value === 'Review') return 'badge--warning';
  if (value === 'Done') return 'badge--success';
  return 'badge--info';
};

const showProjectErrors = (result) => {
  setFieldError('name', getActionFieldError(result, 'name'));
  setFieldError('dueDate', getActionFieldError(result, 'dueDate'));
};

export const renderProjectsView = (container) => {
  let filterState = { status: 'all', priority: 'all', archive: 'active' };

  const render = () => {
    const state = store.getState();
    const filtered = selectProjectsWithClients(state, selectFilteredProjects(state, filterState));

    container.innerHTML = `
      <main id="main" class="container">
        ${pageHeader({ title: 'Zlecenia', description: 'Śledź statusy zleceń i priorytety bez przeciążenia narzędziem.' })}
        <section class="card">
          <div class="form-grid form-grid--two">
            <div class="input">
              <label class="input__label" for="statusFilter">Status</label>
              <select class="input__select" id="statusFilter">
                <option value="all">Wszystkie</option>
                ${statusColumns.map((status) => `<option value="${escapeAttribute(status)}" ${filterState.status === status ? 'selected' : ''}>${escapeHTML(status)}</option>`).join('')}
              </select>
            </div>
            <div class="input">
              <label class="input__label" for="priorityFilter">Priorytet</label>
              <select class="input__select" id="priorityFilter">
                <option value="all">Wszystkie</option>
                ${priorityOptions.map((priority) => `<option value="${escapeAttribute(priority)}" ${filterState.priority === priority ? 'selected' : ''}>${escapeHTML(priority)}</option>`).join('')}
              </select>
            </div>
            <div class="input">
              <label class="input__label" for="archiveFilter">Zakres</label>
              <select class="input__select" id="archiveFilter">
                <option value="active" ${filterState.archive === 'active' ? 'selected' : ''}>Aktywne</option>
                <option value="archived" ${filterState.archive === 'archived' ? 'selected' : ''}>Archiwum</option>
                <option value="all" ${filterState.archive === 'all' ? 'selected' : ''}>Wszystkie</option>
              </select>
            </div>
          </div>
          ${button({ label: 'Dodaj zlecenie', id: 'addProject', variant: 'primary', iconName: 'plus' })}
        </section>

        <section class="kanban">
          ${statusColumns
            .map((status) => {
              const columnItems = selectProjectsByStatus(state, status, filtered);
              return `
                <div class="kanban__column">
                  <div class="kanban__title">${escapeHTML(status)} (${columnItems.length})</div>
                  <div class="list">
                    ${
                      columnItems.length
                        ? columnItems
                            .map((project) => {
                              return `
                              <article class="kanban__card">
                                <a href="#/projects/${encodeURIComponent(project.id)}"><strong>${escapeHTML(project.name)}</strong></a>
                                <span class="input__helper">${escapeHTML(project.client?.name || 'Bez klienta')}</span>
                                <div>
                                  <span class="badge ${badgeClass(project.priority)}">${escapeHTML(project.priority)}</span>
                                  <span class="badge ${badgeClass(project.status)}">${escapeHTML(project.status)}</span>
                                  ${project.archivedAt ? '<span class="badge badge--danger">Archiwum</span>' : ''}
                                </div>
                                <span class="input__helper">Termin: ${escapeHTML(formatDate(project.dueDate))}</span>
                                <div class="table__actions">
                                  ${button({ label: 'Edytuj', variant: 'ghost', iconName: 'edit', attributes: { 'data-action': 'edit', 'data-id': project.id } })}
                                  ${
                                    project.archivedAt
                                      ? button({ label: 'Przywróć', variant: 'ghost', iconName: 'reset', attributes: { 'data-action': 'restore', 'data-id': project.id } })
                                      : button({ label: 'Archiwizuj', variant: 'ghost', iconName: 'delete', attributes: { 'data-action': 'archive', 'data-id': project.id } })
                                  }
                                </div>
                              </article>
                            `;
                            })
                            .join('')
                        : '<p class="input__helper">Brak elementów.</p>'
                    }
                  </div>
                </div>
              `;
            })
            .join('')}
        </section>
      </main>
    `;
  };

  render();

  const refresh = () => {
    render();
    bindEvents();
  };

  const bindEvents = () => {
    const statusFilter = qs('#statusFilter', container);
    const priorityFilter = qs('#priorityFilter', container);
    const archiveFilter = qs('#archiveFilter', container);

    statusFilter?.addEventListener('change', () => {
      filterState.status = statusFilter.value;
      refresh();
    });
    priorityFilter?.addEventListener('change', () => {
      filterState.priority = priorityFilter.value;
      refresh();
    });
    archiveFilter?.addEventListener('change', () => {
      filterState.archive = archiveFilter.value;
      refresh();
    });

    qs('#addProject', container)?.addEventListener('click', () => {
      const close = openModal({
        title: 'Nowe zlecenie',
        content: projectModalContent({}, selectActiveClients(store.getState())),
        footer: '<button class="btn btn--secondary" data-modal-close>Anuluj</button><button class="btn btn--primary" id="saveProject">Zapisz</button>'
      });
      qs('#saveProject', document)?.addEventListener('click', () => {
        const form = qs('#projectForm', document);
        const data = new FormData(form);
        const result = store.actions.createProject({
          name: data.get('name'),
          clientId: data.get('client'),
          status: data.get('status'),
          priority: data.get('priority'),
          dueDate: data.get('dueDate'),
          sla: {
            serviceLevel: data.get('serviceLevel'),
            responseDueDate: data.get('responseDueDate')
          },
          estimate: {
            hours: data.get('estimateHours'),
            value: data.get('estimateValue'),
            currency: 'PLN'
          },
          notes: data.get('notes')
        });
        if (!result.ok) {
          showProjectErrors(result);
          return;
        }
        showToast('Dodano zlecenie.');
        close();
        refresh();
      });
    });

    container.querySelectorAll('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => {
        const project = selectProjectById(store.getState(), button.dataset.id);
        if (!project) {
          showToast('Nie znaleziono zlecenia.');
          return;
        }
        const close = openModal({
          title: 'Edytuj zlecenie',
          content: projectModalContent(project, selectActiveClients(store.getState())),
          footer: '<button class="btn btn--secondary" data-modal-close>Anuluj</button><button class="btn btn--primary" id="updateProject">Zapisz</button>'
        });
        qs('#updateProject', document)?.addEventListener('click', () => {
          const form = qs('#projectForm', document);
          const data = new FormData(form);
          const result = store.actions.updateProject(project.id, {
            name: data.get('name'),
            clientId: data.get('client'),
            status: data.get('status'),
            priority: data.get('priority'),
            dueDate: data.get('dueDate'),
            sla: {
              serviceLevel: data.get('serviceLevel'),
              responseDueDate: data.get('responseDueDate')
            },
            estimate: {
              hours: data.get('estimateHours'),
              value: data.get('estimateValue'),
              currency: 'PLN'
            },
            notes: data.get('notes')
          });
          if (!result.ok) {
            showProjectErrors(result);
            return;
          }
          showToast('Zaktualizowano zlecenie.');
          close();
          refresh();
        });
      });
    });

    container.querySelectorAll('[data-action="archive"]').forEach((button) => {
      button.addEventListener('click', () => {
        const project = selectProjectById(store.getState(), button.dataset.id);
        if (!project) {
          showToast('Nie znaleziono zlecenia.');
          return;
        }
        openConfirmDialog({
          title: 'Archiwizuj zlecenie',
          message: `Czy zarchiwizować ${project.name}? Rekord pozostanie dostępny w filtrze archiwum.`,
          confirmLabel: 'Archiwizuj',
          destructive: true,
          onConfirm: () => {
            const result = store.actions.archiveProject(project.id);
            if (!result.ok) {
              showToast('Nie udało się zarchiwizować zlecenia.');
              return;
            }
            showToast('Zarchiwizowano zlecenie.');
            refresh();
          }
        });
      });
    });

    container.querySelectorAll('[data-action="restore"]').forEach((button) => {
      button.addEventListener('click', () => {
        const result = store.actions.restoreArchivedProject(button.dataset.id);
        showToast(result.ok ? 'Przywrócono zlecenie.' : 'Nie udało się przywrócić zlecenia.');
        refresh();
      });
    });
  };

  bindEvents();
};
