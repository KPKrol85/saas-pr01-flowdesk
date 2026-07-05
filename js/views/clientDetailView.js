import { selectClientDetail } from '../core/selectors.js';
import { store } from '../core/store.js';
import { button } from '../components/button.js';
import { openConfirmDialog } from '../components/confirmDialog.js';
import { emptyState } from '../components/emptyState.js';
import { pageHeader } from '../components/pageHeader.js';
import { showToast } from '../components/toast.js';
import { formatDate } from '../utils/format.js';
import { escapeHTML } from '../utils/sanitize.js';

const renderTags = (tags = []) =>
  tags.length ? tags.map((tag) => `<span class="badge badge--info">${escapeHTML(tag)}</span>`).join('') : '<span class="input__helper">Brak tagów.</span>';

const renderContactList = (contacts = []) =>
  contacts.length
    ? contacts
        .map(
          (contact) => `
            <div class="list__item data-list__item">
              <div class="data-list__main">
                <strong>${escapeHTML(contact.name || 'Kontakt')}</strong>
                <div class="input__helper data-list__meta">${escapeHTML(contact.role)} · ${escapeHTML(contact.email || 'bez emaila')} · ${escapeHTML(contact.phone || 'bez telefonu')}</div>
              </div>
            </div>
          `
        )
        .join('')
    : emptyState({ description: 'Brak kontaktów dla klienta.', iconName: 'clients' });

const renderTimeline = (timeline = []) =>
  timeline.length
    ? timeline
        .map(
          (entry) => `
            <div class="timeline__item">
              <strong>${escapeHTML(formatDate(entry.date))}</strong>
              <p>${escapeHTML(entry.text)}</p>
            </div>
          `
        )
        .join('')
    : emptyState({ description: 'Brak aktywności do wyświetlenia.', iconName: 'calendar' });

const renderProjectLinks = (projects = []) =>
  projects.length
    ? projects
        .map(
          (project) => `
            <a class="list__item data-list__item data-list__item--link ${project.archivedAt ? 'data-list__item--archived' : ''}" href="#/projects/${encodeURIComponent(project.id)}">
              <div class="data-list__main">
                <strong>${escapeHTML(project.name)}</strong>
                <div class="input__helper data-list__meta">${escapeHTML(project.status)} · termin: ${escapeHTML(formatDate(project.dueDate))}</div>
              </div>
              <div class="data-list__side">
                <span class="badge ${project.archivedAt ? 'badge--danger' : 'badge--info'}">${project.archivedAt ? 'Archiwum' : escapeHTML(project.priority)}</span>
              </div>
            </a>
          `
        )
        .join('')
    : emptyState({ description: 'Brak powiązanych zleceń.', iconName: 'projects' });

const renderEvents = (events = []) =>
  events.length
    ? events
        .map(
          (event) => `
            <div class="list__item data-list__item">
              <div class="data-list__main">
                <strong>${escapeHTML(event.title)}</strong>
                <div class="input__helper data-list__meta">${escapeHTML(formatDate(event.date))} · ${escapeHTML(event.project?.name || 'Bez projektu')}</div>
              </div>
            </div>
          `
        )
        .join('')
    : emptyState({ description: 'Brak powiązanych wydarzeń.', iconName: 'calendar' });

export const renderClientDetailView = (container, { id } = {}) => {
  const detail = selectClientDetail(store.getState(), id);

  if (!detail) {
    container.innerHTML = `
      <main id="main" class="container">
        ${pageHeader({
          title: 'Klient nie znaleziony',
          description: 'Rekord nie istnieje albo został usunięty z danych demo.',
          actions: '<a class="btn btn--secondary" href="#/clients">Wróć do klientów</a>'
        })}
        ${emptyState({ title: 'Brak rekordu', description: 'Wybierz klienta z listy lub przywróć dane demo.', iconName: 'clients' })}
      </main>
    `;
    return;
  }

  const { client, projects, events, timeline } = detail;
  const archived = Boolean(client.archivedAt);

  container.innerHTML = `
    <main id="main" class="container">
      ${pageHeader({
        title: client.name,
        description: `${client.segment} · owner: ${client.owner || 'nieprzypisany'}`,
        actions: `
          <a class="btn btn--secondary" href="#/clients">Wróć</a>
          ${archived ? button({ label: 'Przywróć', id: 'restoreClient', variant: 'secondary', iconName: 'reset' }) : button({ label: 'Archiwizuj', id: 'archiveClient', variant: 'danger', iconName: 'delete' })}
        `
      })}

      <section class="detail-grid">
        <div class="card detail-main data-panel">
          <h2 class="card__title">Profil klienta</h2>
          <div class="meta-grid">
            <div><span class="input__helper">Email</span><strong>${escapeHTML(client.email)}</strong></div>
            <div><span class="input__helper">Telefon</span><strong>${escapeHTML(client.phone || 'brak')}</strong></div>
            <div><span class="input__helper">Status</span><strong>${escapeHTML(client.status)}</strong></div>
            <div><span class="input__helper">Segment</span><strong>${escapeHTML(client.segment)}</strong></div>
          </div>
          <p>${escapeHTML(client.notes || 'Brak notatek.')}</p>
          <div class="tag-row data-tags">${renderTags(client.tags)}</div>
          ${archived ? `<p class="input__helper data-archive-note">Archiwum od: ${escapeHTML(formatDate(client.archivedAt))}</p>` : ''}
        </div>

        <div class="card data-panel">
          <h2 class="card__title">Kontakty</h2>
          <div class="list data-list">${renderContactList(client.contacts)}</div>
        </div>

        <div class="card data-panel">
          <h2 class="card__title">Powiązane zlecenia</h2>
          <div class="list data-list">${renderProjectLinks(projects)}</div>
        </div>

        <div class="card data-panel">
          <h2 class="card__title">Wydarzenia</h2>
          <div class="list data-list">${renderEvents(events)}</div>
        </div>

        <div class="card detail-wide data-panel">
          <h2 class="card__title">Historia aktywności</h2>
          <div class="timeline">${renderTimeline(timeline)}</div>
        </div>
      </section>
    </main>
  `;

  document.getElementById('archiveClient')?.addEventListener('click', () => {
    openConfirmDialog({
      title: 'Archiwizuj klienta',
      message: `Czy zarchiwizować ${client.name}? Rekord pozostanie dostępny w filtrze archiwum.`,
      confirmLabel: 'Archiwizuj',
      destructive: true,
      onConfirm: () => {
        const result = store.actions.archiveClient(client.id);
        showToast(result.ok ? 'Klient został zarchiwizowany.' : 'Nie udało się zarchiwizować klienta.');
        renderClientDetailView(container, { id: client.id });
      }
    });
  });

  document.getElementById('restoreClient')?.addEventListener('click', () => {
    const result = store.actions.restoreArchivedClient(client.id);
    showToast(result.ok ? 'Klient został przywrócony.' : 'Nie udało się przywrócić klienta.');
    renderClientDetailView(container, { id: client.id });
  });
};
