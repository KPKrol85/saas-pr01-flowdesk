import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContainer, getButton, setControlValue } from '../helpers/dom.js';

describe('calendar view', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('validates and saves a new event', async () => {
    const container = createTestContainer();
    const { renderCalendarView } = await import('../../js/views/calendarView.js');

    renderCalendarView(container);
    getButton('Dodaj wydarzenie').click();
    getButton('Zapisz').click();

    expect(document.body.textContent).toContain('Wymagane pole.');

    setControlValue('Tytuł', 'Service Review Call');
    setControlValue('Data', '2026-08-15');
    getButton('Zapisz').click();

    expect(container.textContent).toContain('Service Review Call');
    expect(container.textContent).toContain('Nova Studio');
  });
});
