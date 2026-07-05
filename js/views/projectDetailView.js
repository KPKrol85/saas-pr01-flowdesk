import { qs } from '../core/dom.js';
import { getActionFieldError } from '../core/actions.js';
import { selectProjectDetail } from '../core/selectors.js';
import { store } from '../core/store.js';
import { button } from '../components/button.js';
import { openConfirmDialog } from '../components/confirmDialog.js';
import { emptyState } from '../components/emptyState.js';
import { textareaField, setFieldError } from '../components/formControls.js';
import { pageHeader } from '../components/pageHeader.js';
import { showToast } from '../components/toast.js';
import { formatDate, formatNumber } from '../utils/format.js';
import { escapeAttribute, escapeHTML } from '../utils/sanitize.js';

const badgeClass = (value) => {
  if (value === 'High' || value === 'Review' || value === 'Critical') return 'badge--warning';
  if (value === 'Done') return 'badge--success';
  return 'badge--info';
};

const renderTasks = (project) =>
  project.tasks.length
    ? project.tasks
        .map(
          (task) => `
            <label class="list__item">
              <span>${escapeHTML(task.title)}</span>
              <input type="checkbox" data-task-id="${escapeAttribute(task.id)}" ${task.done ? 'checked' : ''} />
            </label>
          `
        )
        .join('')
    : emptyState({ description: 'Brak checklisty dla zlecenia.', iconName: 'projects' });

const renderComments = (comments = []) =>
  comments.length
    ? comments
        .map(
          (comment) => `
            <div class="timeline__item">
              <strong>${escapeHTML(comment.author)} · ${escapeHTML(formatDate(comment.date))}</strong>
              <p>${escapeHTML(comment.body)}</p>
            </div>
          `
        )
        .join('')
    : emptyState({ description: 'Brak komentarzy.', iconName: 'edit' });

const renderHistory = (history = []) =>
  history.length
    ? history
        .slice()
        .reverse()
        .map(
          (entry) => `
            <div class="timeline__item">
              <strong>${escapeHTML(formatDate(entry.date))}</strong>
              <p>${escapeHTML(entry.text)}</p>
            </div>
          `
        )
        .join('')
    : emptyState({ description: 'Brak historii zmian.', iconName: 'calendar' });

const renderEvents = (events = []) =>
  events.length
    ? events
        .map(
          (event) => `
            <div class="list__item">
              <div>
                <strong>${escapeHTML(event.title)}</strong>
                <div class="input__helper">${escapeHTML(formatDate(event.date))}</div>
              </div>
            </div>
          `
        )
        .join('')
    : emptyState({ description: 'Brak wydarzeń dla tego zlecenia.', iconName: 'calendar' });

export const renderProjectDetailView = (container, { id } = {}) => {
  const detail = selectProjectDetail(store.getState(), id);

  if (!detail) {
    container.innerHTML = `
      <main id="main" class="container">
        ${pageHeader({
          title: 'Zlecenie nie znalezione',
          description: 'Rekord nie istnieje albo został usunięty z danych demo.',
          actions: '<a class="btn btn--secondary" href="#/projects">Wróć do zleceń</a>'
        })}
        ${emptyState({ title: 'Brak rekordu', description: 'Wybierz zlecenie z listy lub przywróć dane demo.', iconName: 'projects' })}
      </main>
    `;
    return;
  }

  const { project, client, events } = detail;
  const archived = Boolean(project.archivedAt);

  container.innerHTML = `
    <main id="main" class="container">
      ${pageHeader({
        title: project.name,
        description: `${project.status} · ${project.priority} · ${client?.name || 'Bez klienta'}`,
        actions: `
          <a class="btn btn--secondary" href="#/projects">Wróć</a>
          ${archived ? button({ label: 'Przywróć', id: 'restoreProject', variant: 'secondary', iconName: 'reset' }) : button({ label: 'Archiwizuj', id: 'archiveProject', variant: 'danger', iconName: 'delete' })}
        `
      })}

      <section class="detail-grid">
        <div class="card detail-main">
          <h2 class="card__title">Podsumowanie zlecenia</h2>
          <div class="meta-grid">
            <div><span class="input__helper">Klient</span><strong>${client ? `<a href="#/clients/${encodeURIComponent(client.id)}">${escapeHTML(client.name)}</a>` : 'Bez klienta'}</strong></div>
            <div><span class="input__helper">Termin</span><strong>${escapeHTML(formatDate(project.dueDate))}</strong></div>
            <div><span class="input__helper">SLA</span><strong>${escapeHTML(project.sla.serviceLevel)}</strong></div>
            <div><span class="input__helper">Reakcja do</span><strong>${escapeHTML(formatDate(project.sla.responseDueDate))}</strong></div>
          </div>
          <div class="tag-row">
            <span class="badge ${badgeClass(project.status)}">${escapeHTML(project.status)}</span>
            <span class="badge ${badgeClass(project.priority)}">${escapeHTML(project.priority)}</span>
            ${archived ? '<span class="badge badge--danger">Archiwum</span>' : ''}
          </div>
          <p>${escapeHTML(project.notes || 'Brak notatek.')}</p>
        </div>

        <div class="card">
          <h2 class="card__title">Wycena</h2>
          <div class="meta-grid">
            <div><span class="input__helper">Godziny</span><strong>${formatNumber(project.estimate.hours)}</strong></div>
            <div><span class="input__helper">Wartość</span><strong>${formatNumber(project.estimate.value)} ${escapeHTML(project.estimate.currency)}</strong></div>
            <div><span class="input__helper">Ukończono</span><strong>${escapeHTML(formatDate(project.completedAt))}</strong></div>
          </div>
        </div>

        <div class="card">
          <h2 class="card__title">Checklist</h2>
          <div class="list">${renderTasks(project)}</div>
        </div>

        <div class="card">
          <h2 class="card__title">Wydarzenia</h2>
          <div class="list">${renderEvents(events)}</div>
        </div>

        <div class="card">
          <h2 class="card__title">Komentarze</h2>
          <div class="timeline">${renderComments(project.comments)}</div>
          <form id="commentForm" class="form-grid comment-form">
            ${textareaField({ id: 'comment', label: 'Nowy komentarz', rows: 3, placeholder: 'Dodaj notatkę operacyjną' })}
            ${button({ label: 'Dodaj komentarz', type: 'submit', variant: 'secondary', iconName: 'plus' })}
          </form>
        </div>

        <div class="card">
          <h2 class="card__title">Historia zmian</h2>
          <div class="timeline">${renderHistory(project.history)}</div>
        </div>
      </section>
    </main>
  `;

  container.querySelectorAll('[data-task-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const result = store.actions.toggleProjectTask(project.id, checkbox.dataset.taskId);
      showToast(result.ok ? 'Zaktualizowano checklistę.' : 'Nie udało się zaktualizować checklisty.');
      renderProjectDetailView(container, { id: project.id });
    });
  });

  qs('#commentForm', container)?.addEventListener('submit', (event) => {
    event.preventDefault();
    setFieldError('comment', '', container);
    const data = new FormData(event.currentTarget);
    const result = store.actions.addProjectComment(project.id, { body: data.get('comment') });
    if (!result.ok) {
      setFieldError('comment', getActionFieldError(result, 'comment'), container);
      return;
    }
    showToast('Dodano komentarz.');
    renderProjectDetailView(container, { id: project.id });
  });

  document.getElementById('archiveProject')?.addEventListener('click', () => {
    openConfirmDialog({
      title: 'Archiwizuj zlecenie',
      message: `Czy zarchiwizować ${project.name}? Rekord pozostanie dostępny w filtrze archiwum.`,
      confirmLabel: 'Archiwizuj',
      destructive: true,
      onConfirm: () => {
        const result = store.actions.archiveProject(project.id);
        showToast(result.ok ? 'Zlecenie zostało zarchiwizowane.' : 'Nie udało się zarchiwizować zlecenia.');
        renderProjectDetailView(container, { id: project.id });
      }
    });
  });

  document.getElementById('restoreProject')?.addEventListener('click', () => {
    const result = store.actions.restoreArchivedProject(project.id);
    showToast(result.ok ? 'Zlecenie zostało przywrócone.' : 'Nie udało się przywrócić zlecenia.');
    renderProjectDetailView(container, { id: project.id });
  });
};
