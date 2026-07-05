import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestContainer, getButton, setControlValue } from '../helpers/dom.js';

describe('projects view', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  it('validates and saves a new project', async () => {
    const container = createTestContainer();
    const { renderProjectsView } = await import('../../js/views/projectsView.js');

    renderProjectsView(container);
    getButton('Dodaj zlecenie').click();
    getButton('Zapisz').click();

    expect(document.body.textContent).toContain('Wymagane pole.');

    setControlValue('Nazwa', 'Regression Service Job');
    setControlValue('Termin', '2026-08-12');
    setControlValue('Notatki', 'Project created in integration test');
    getButton('Zapisz').click();

    expect(container.textContent).toContain('Regression Service Job');
    expect(container.textContent).toContain('Nova Studio');
  });
});
