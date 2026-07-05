import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContainer, getButton, setControlValue } from '../helpers/dom.js';

describe('service management workflows', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('renders client detail data from the expanded domain model', async () => {
    const container = createTestContainer();
    const { renderClientDetailView } = await import('../../js/views/clientDetailView.js');

    renderClientDetailView(container, { id: 'c1' });

    expect(container.textContent).toContain('Nova Studio');
    expect(container.textContent).toContain('Kontakty');
    expect(container.textContent).toContain('Powiązane zlecenia');
    expect(container.querySelector('a[href="#/projects/p1"]')).not.toBeNull();
  });

  it('renders project detail tasks and accepts comments', async () => {
    const container = createTestContainer();
    const { renderProjectDetailView } = await import('../../js/views/projectDetailView.js');

    renderProjectDetailView(container, { id: 'p1' });
    expect(container.textContent).toContain('Checklist');
    expect(container.textContent).toContain('Oczekuje na feedback do makiet.');

    setControlValue('Nowy komentarz', 'Integration comment');
    getButton('Dodaj komentarz').click();

    expect(container.textContent).toContain('Integration comment');
  });

  it('archives clients from the list instead of deleting them permanently', async () => {
    const container = createTestContainer();
    const { renderClientsView } = await import('../../js/views/clientsView.js');

    renderClientsView(container);
    getButton('Archiwizuj').click();
    document.querySelector('.modal__footer button:last-child').click();

    expect(container.textContent).not.toContain('EventLine');

    setControlValue('Zakres', 'archived');

    expect(container.textContent).toContain('EventLine');
    expect(container.textContent).toContain('Archiwum');
  });

  it('rejects malformed JSON import and accepts migrated JSON data', async () => {
    const container = createTestContainer();
    const { renderSettingsView } = await import('../../js/views/settingsView.js');

    renderSettingsView(container);
    setControlValue('Dane JSON', '{broken json');
    getButton('Importuj JSON').click();

    expect(container.textContent).toContain('Nieprawidłowy plik JSON.');

    setControlValue(
      'Dane JSON',
      JSON.stringify({
        clients: [{ id: 'c-import', name: 'Imported Client', email: 'imported@test.pl' }],
        projects: [],
        events: [],
        ui: { theme: 'dark' }
      })
    );
    getButton('Importuj JSON').click();

    const { store } = await import('../../js/core/store.js');
    expect(store.getState().clients).toContainEqual(expect.objectContaining({ id: 'c-import', segment: 'SMB' }));
  });
});
