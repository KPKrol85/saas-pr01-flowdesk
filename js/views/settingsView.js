import { qs } from '../core/dom.js';
import { getActionFieldError } from '../core/actions.js';
import { auth } from '../core/auth.js';
import { selectUiPreferences } from '../core/selectors.js';
import { store } from '../core/store.js';
import { button } from '../components/button.js';
import { setFieldError, textareaField } from '../components/formControls.js';
import { openConfirmDialog } from '../components/confirmDialog.js';
import { pageHeader } from '../components/pageHeader.js';
import { showToast } from '../components/toast.js';
import { escapeHTML } from '../utils/sanitize.js';

export const renderSettingsView = (container) => {
  const ui = selectUiPreferences(store.getState());
  const session = auth.getSession();

  container.innerHTML = `
    <main id="main" class="container">
      ${pageHeader({ title: 'Ustawienia', description: 'Zarządzaj profilem, preferencjami i narzędziami danych.' })}

      <section class="settings-grid">
        <div class="card">
          <h2 class="card__title">Profil</h2>
          <div class="list">
            <div><strong>Imię i nazwisko:</strong> ${escapeHTML(session?.user?.name || 'Alicja Maj')}</div>
            <div><strong>Organizacja:</strong> ${escapeHTML(session?.organization?.name || 'FlowDesk Demo Workspace')}</div>
            <div><strong>Rola:</strong> ${escapeHTML(session?.membership?.role || session?.role || 'Owner')}</div>
            <div><strong>Email:</strong> ${escapeHTML(session?.user?.email || session?.email || 'alicja@flowdesk.pl')}</div>
          </div>
          <p class="input__helper">To jest mock danych profilu (bez backendu).</p>
        </div>

        <div class="card">
          <h2 class="card__title">Preferencje</h2>
          <div class="list">
            <label class="list__item">
              <span>Motyw ciemny</span>
              <input type="checkbox" id="themeSwitch" ${ui.theme === 'dark' ? 'checked' : ''} />
            </label>
            <label class="list__item">
              <span>Ogranicz animacje</span>
              <input type="checkbox" id="motionSwitch" ${ui.reducedMotion ? 'checked' : ''} />
            </label>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">Narzędzia danych</h2>
        <div class="list">
          ${button({ label: 'Eksportuj JSON', id: 'exportData', variant: 'secondary', iconName: 'export' })}
          ${button({ label: 'Reset demo danych', id: 'resetData', variant: 'ghost', iconName: 'reset' })}
        </div>
        <p class="input__helper">Reset przywróci dane demo zapisane w localStorage.</p>
      </section>

      <section class="card">
        <h2 class="card__title">Import JSON</h2>
        <form id="importForm" class="form-grid">
          ${textareaField({
            id: 'jsonImport',
            label: 'Dane JSON',
            rows: 8,
            placeholder: '{ "clients": [], "projects": [], "events": [] }',
            helper: 'Import zastąpi lokalne dane demo po migracji i walidacji domenowej.'
          })}
          ${button({ label: 'Importuj JSON', type: 'submit', variant: 'secondary', iconName: 'export' })}
        </form>
        <p class="input__helper">Nie importuj danych poufnych. To nadal lokalny demo store w przeglądarce.</p>
      </section>
    </main>
  `;

  qs('#themeSwitch', container)?.addEventListener('change', (event) => {
    const result = store.actions.updateUiPreferences({ theme: event.target.checked ? 'dark' : 'light' });
    if (!result.ok) {
      showToast('Nie udało się zaktualizować motywu.');
      return;
    }
    showToast('Zaktualizowano motyw.');
  });

  qs('#motionSwitch', container)?.addEventListener('change', (event) => {
    const result = store.actions.updateUiPreferences({ reducedMotion: event.target.checked });
    if (!result.ok) {
      showToast('Nie udało się zaktualizować preferencji animacji.');
      return;
    }
    showToast('Zaktualizowano preferencje animacji.');
  });

  qs('#exportData', container)?.addEventListener('click', () => {
    const result = store.actions.exportState();
    if (!result.ok) {
      showToast('Nie udało się wyeksportować danych.');
      return;
    }
    const blob = new Blob([result.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowdesk-data.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Eksport danych gotowy.');
  });

  qs('#resetData', container)?.addEventListener('click', () => {
    openConfirmDialog({
      title: 'Reset demo danych',
      message: 'Czy na pewno przywrócić dane demo?',
      confirmLabel: 'Resetuj',
      destructive: true,
      onConfirm: () => {
        const result = store.actions.resetDemoData();
        if (!result.ok) {
          showToast('Nie udało się przywrócić danych demo.');
          return;
        }
        showToast('Dane demo zostały przywrócone.');
        renderSettingsView(container);
      }
    });
  });

  qs('#importForm', container)?.addEventListener('submit', (event) => {
    event.preventDefault();
    setFieldError('jsonImport', '', container);
    const form = new FormData(event.currentTarget);
    const result = store.actions.restoreStateFromJson(form.get('jsonImport'));
    if (!result.ok) {
      setFieldError('jsonImport', getActionFieldError(result, 'json') || 'Nie udało się zaimportować danych.', container);
      showToast('Import JSON odrzucony.');
      return;
    }
    showToast('Import JSON zakończony.');
    renderSettingsView(container);
  });
};
