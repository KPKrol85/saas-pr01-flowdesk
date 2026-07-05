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
});
