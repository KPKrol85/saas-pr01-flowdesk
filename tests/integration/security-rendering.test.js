import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContainer, getButton, setControlValue } from '../helpers/dom.js';

describe('safe rendering', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('renders client HTML payloads as text', async () => {
    const container = createTestContainer();
    const { renderClientsView } = await import('../../js/views/clientsView.js');
    const payload = `<img src=x onerror=alert(1)> "client"`;

    renderClientsView(container);
    getButton('Dodaj klienta').click();
    setControlValue('Nazwa', payload);
    setControlValue('Email', 'safe-client@flowdesk.test');
    setControlValue('Telefon', '+48 500 200 100');
    setControlValue('Notatki', `<script>alert(1)</script>`);
    getButton('Zapisz').click();

    expect(container.textContent).toContain(payload);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
  });

  it('renders project HTML payloads as text', async () => {
    const container = createTestContainer();
    const { renderProjectsView } = await import('../../js/views/projectsView.js');
    const payload = `<script>alert(1)</script>`;

    renderProjectsView(container);
    getButton('Dodaj zlecenie').click();
    setControlValue('Nazwa', payload);
    setControlValue('Termin', '2026-08-12');
    setControlValue('Notatki', `quote " and angle <tag>`);
    getButton('Zapisz').click();

    expect(container.textContent).toContain(payload);
    expect(container.querySelector('script')).toBeNull();
  });

  it('renders calendar event HTML payloads as text', async () => {
    const container = createTestContainer();
    const { renderCalendarView } = await import('../../js/views/calendarView.js');
    const payload = `"><img src=x onerror=alert(1)>`;

    renderCalendarView(container);
    getButton('Dodaj wydarzenie').click();
    setControlValue('Tytuł', payload);
    setControlValue('Data', '2026-08-15');
    getButton('Zapisz').click();

    expect(container.textContent).toContain(payload);
    expect(container.querySelector('img')).toBeNull();
  });
});
