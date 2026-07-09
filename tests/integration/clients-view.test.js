import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContainer, getButton, setControlValue } from '../helpers/dom.js';

describe('clients view', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('validates and saves a new client', async () => {
    const container = createTestContainer();
    const { renderClientsView } = await import('../../js/views/clientsView.js');

    renderClientsView(container);
    getButton('Dodaj klienta').click();
    getButton('Zapisz').click();

    expect(document.body.textContent).toContain('Wymagane pole.');

    setControlValue('Nazwa', 'Acme Service');
    setControlValue('Email', 'ops@acme-service.test');
    setControlValue('Telefon', '+48 500 200 100');
    setControlValue('Notatki', 'Client created in integration test');
    getButton('Zapisz').click();

    expect(container.textContent).toContain('Acme Service');
    expect(container.textContent).toContain('ops@acme-service.test');
  });

  it('renders intentional empty and filtered client states', async () => {
    const container = createTestContainer();
    const { store } = await import('../../js/core/store.js');
    const { renderClientsView } = await import('../../js/views/clientsView.js');

    renderClientsView(container);
    setControlValue('Filtruj', 'brak-klienta');

    expect(container.textContent).toContain('Filtry ukrywają klientów');
    expect(container.textContent).toContain('Brak klienta w podglądzie');

    store.actions.restoreState({ clients: [], projects: [], events: [], ui: { theme: 'light' } });
    renderClientsView(container);

    expect(container.textContent).toContain('Brak klientów w lokalnym demo');
  });
});
