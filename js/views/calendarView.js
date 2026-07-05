import { qs } from '../core/dom.js';
import { getActionFieldError } from '../core/actions.js';
import { selectActiveClients, selectActiveProjectRecords, selectEventsWithRelations } from '../core/selectors.js';
import { store } from '../core/store.js';
import { button } from '../components/button.js';
import { emptyState } from '../components/emptyState.js';
import { inputField, selectField, setFieldError } from '../components/formControls.js';
import { openModal } from '../components/modal.js';
import { pageHeader } from '../components/pageHeader.js';
import { showToast } from '../components/toast.js';
import { formatDate } from '../utils/format.js';
import { escapeHTML } from '../utils/sanitize.js';

const eventModalContent = (event = {}, clients = [], projects = []) => `
  <form id="eventForm" class="form-grid">
    ${inputField({ id: 'title', label: 'Tytuł', value: event.title || '', required: true })}
    <div class="form-grid form-grid--two">
      ${inputField({ id: 'date', label: 'Data', type: 'date', value: event.date ? event.date.split('T')[0] : '', required: true })}
      ${selectField({
        id: 'client',
        label: 'Klient',
        value: event.clientId,
        options: clients.map((client) => ({ value: client.id, label: client.name }))
      })}
    </div>
    ${selectField({
      id: 'project',
      label: 'Powiązany projekt',
      value: event.projectId,
      options: projects.map((project) => ({ value: project.id, label: project.name }))
    })}
  </form>
`;

const showEventErrors = (result) => {
  setFieldError('title', getActionFieldError(result, 'title'));
  setFieldError('date', getActionFieldError(result, 'date'));
};

export const renderCalendarView = (container) => {
  const render = () => {
    const state = store.getState();
    const events = selectEventsWithRelations(state);

    container.innerHTML = `
      <main id="main" class="container">
        ${pageHeader({ title: 'Kalendarz', description: 'Prosty widok nadchodzących wydarzeń powiązanych ze zleceniami.' })}

        <section class="card">
          ${button({ label: 'Dodaj wydarzenie', id: 'addEvent', variant: 'primary', iconName: 'plus' })}
        </section>

        <section class="card">
          <h2 class="card__title">Nadchodzące wydarzenia</h2>
          <div class="calendar-list">
            ${
              events.length
                ? events
                    .map((event) => {
                      return `
                      <div class="list__item">
                        <div>
                          <strong>${escapeHTML(event.title)}</strong>
                          <div class="input__helper">${escapeHTML(formatDate(event.date))} · ${escapeHTML(event.client?.name || 'Brak klienta')}</div>
                        </div>
                        <div>
                          <span class="badge badge--info">${escapeHTML(event.project?.name || 'Bez projektu')}</span>
                          ${button({ label: 'Usuń', variant: 'ghost', iconName: 'delete', attributes: { 'data-action': 'delete', 'data-id': event.id } })}
                        </div>
                      </div>
                    `;
                    })
                    .join('')
                : emptyState({ description: 'Brak wydarzeń. Dodaj nowe spotkanie.', iconName: 'calendar' })
            }
          </div>
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
    qs('#addEvent', container)?.addEventListener('click', () => {
      const state = store.getState();
      const close = openModal({
        title: 'Nowe wydarzenie',
        content: eventModalContent({}, selectActiveClients(state), selectActiveProjectRecords(state)),
        footer: '<button class="btn btn--secondary" data-modal-close>Anuluj</button><button class="btn btn--primary" id="saveEvent">Zapisz</button>'
      });

      qs('#saveEvent', document)?.addEventListener('click', () => {
        const form = qs('#eventForm', document);
        const data = new FormData(form);
        const result = store.actions.createEvent({
          title: data.get('title'),
          date: data.get('date'),
          clientId: data.get('client'),
          projectId: data.get('project')
        });
        if (!result.ok) {
          showEventErrors(result);
          return;
        }
        showToast('Dodano wydarzenie.');
        close();
        refresh();
      });
    });

    container.querySelectorAll('[data-action="delete"]').forEach((button) => {
      button.addEventListener('click', () => {
        const result = store.actions.deleteEvent(button.dataset.id);
        if (!result.ok) {
          showToast('Nie udało się usunąć wydarzenia.');
          return;
        }
        showToast('Usunięto wydarzenie.');
        refresh();
      });
    });
  };

  bindEvents();
};
