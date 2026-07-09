import { expect, test } from '@playwright/test';
import { loginDemoUser, resetBrowserState } from '../helpers/e2e.js';

test.beforeEach(async ({ page }) => {
  await resetBrowserState(page);
});

test('user can log in with valid demo input', async ({ page }) => {
  await loginDemoUser(page);

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page).toHaveURL(/#\/dashboard/);
});

test('user can add a client', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  await page.getByRole('button', { name: 'Dodaj klienta' }).click();
  await page.getByLabel('Nazwa').fill('Acme Service E2E');
  await page.getByLabel('Email').fill('e2e-client@flowdesk.test');
  await page.getByLabel('Telefon').fill('+48 500 100 300');
  await page.getByLabel('Notatki').fill('Created by Playwright');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  const clientRow = page.locator('tbody tr', { hasText: 'Acme Service E2E' });
  await expect(clientRow).toBeVisible();
  await expect(clientRow.getByText('e2e-client@flowdesk.test')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Acme Service E2E' })).toBeVisible();
});

test('user-entered client HTML is rendered as text', async ({ page }) => {
  const dialogs = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  const payload = '<img src=x onerror=alert(1)> "client"';

  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  await page.getByRole('button', { name: 'Dodaj klienta' }).click();
  await page.getByLabel('Nazwa').fill(payload);
  await page.getByLabel('Email').fill('safe-client@flowdesk.test');
  await page.getByLabel('Telefon').fill('+48 500 100 300');
  await page.getByLabel('Notatki').fill('<script>alert(1)</script>');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  await expect(page.locator('tbody tr', { hasText: payload })).toBeVisible();
  await expect(page.getByRole('heading', { name: payload })).toBeVisible();
  await expect(page.locator('tbody img')).toHaveCount(0);
  await expect(page.locator('tbody script')).toHaveCount(0);
  expect(dialogs).toEqual([]);
});

test('user can add a project', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Zlecenia/ }).click();
  await page.getByRole('button', { name: 'Dodaj zlecenie' }).click();
  await page.getByLabel('Nazwa').fill('E2E Service Job');
  await page.getByLabel('Termin').fill('2026-08-12');
  await page.getByLabel('Notatki').fill('Created by Playwright');
  await page.getByRole('button', { name: 'Zapisz' }).click();

  await expect(page.getByText('E2E Service Job')).toBeVisible();
});

test('topbar quick add opens the client and project creation flows', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog', { name: 'Szybkie dodanie' }).getByRole('button', { name: 'Nowy klient' }).click();

  await expect(page).toHaveURL(/#\/clients/);
  await expect(page.getByRole('dialog', { name: 'Nowy klient' })).toBeVisible();
  await page.getByRole('dialog', { name: 'Nowy klient' }).getByRole('button', { name: 'Anuluj' }).click();

  await page.getByRole('button', { name: 'Nowy' }).click();
  await page.getByRole('dialog', { name: 'Szybkie dodanie' }).getByRole('button', { name: 'Nowe zlecenie' }).click();

  await expect(page).toHaveURL(/#\/projects/);
  await expect(page.getByRole('dialog', { name: 'Nowe zlecenie' })).toBeVisible();
});

test('user can export JSON data', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Eksportuj lokalny JSON' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('flowdesk-data.json');
});

test('user can switch theme', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  await page.getByLabel('Motyw ciemny').check();

  await expect(page.locator('body')).toHaveClass(/theme-dark/);
});

test('user menu and reduced motion setting stay keyboard accessible', async ({ page }) => {
  await loginDemoUser(page);

  const userMenu = page.getByRole('button', { name: 'Otwórz menu użytkownika' });
  await userMenu.click();
  await expect(userMenu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menu')).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(userMenu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(userMenu).toBeFocused();

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  await page.getByLabel('Ogranicz animacje').check();

  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  await expect(page.getByText('Zaktualizowano preferencje animacji.')).toBeVisible();
});

test('user can search globally and open a client detail route', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByLabel('Szukaj').fill('Nova');
  await page.getByRole('link', { name: /Klient: Nova Studio/ }).click();

  await expect(page).toHaveURL(/#\/clients\/c1/);
  await expect(page.getByRole('heading', { name: 'Nova Studio' })).toBeVisible();
  await expect(page.getByText('Powiązane zlecenia')).toBeVisible();
});

test('global search supports metadata matches, no-match state, and keyboard navigation', async ({ page }) => {
  await loginDemoUser(page);

  const search = page.getByLabel('Szukaj');
  const resultsPanel = page.locator('#searchResults');

  await search.fill('bez-wyniku');
  await expect(page.getByText('Brak wyników dla tej frazy.')).toBeVisible();
  await expect(resultsPanel).toBeVisible();

  await search.fill('Marta Demo');
  await expect(page.getByRole('link', { name: /Klient: Nova Studio/ })).toBeVisible();

  await search.fill('Wizyta');
  const eventResult = page.getByRole('link', { name: /Wydarzenie: Wizyta serwisowa: klimatyzacja/ });
  await expect(eventResult).toBeVisible();

  await search.press('ArrowDown');
  await expect(eventResult).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(resultsPanel).toBeHidden();

  await search.fill('Wizyta');
  await search.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/#\/calendar/);
  await expect(page.getByRole('heading', { name: 'Kalendarz' })).toBeVisible();
});

test('user can open a project detail route and update its checklist', async ({ page }) => {
  await loginDemoUser(page);

  await page.goto('/#/projects/p1');
  await expect(page.getByRole('heading', { name: 'Wdrożenie panelu klienta' })).toBeVisible();
  await page.getByLabel('Zebrać feedback od klienta').check();

  await expect(page.getByText('Zaktualizowano checklistę.')).toBeVisible();
});

test('edge states guide users through filtered empty and missing routes', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  await page.getByLabel('Filtruj').fill('brak-klienta-e2e');

  await expect(page.getByText('Filtry ukrywają klientów')).toBeVisible();
  await expect(page.getByText('Brak klienta w podglądzie')).toBeVisible();

  await page.getByRole('link', { name: /Zlecenia/ }).click();
  await page.getByLabel('Status').selectOption('Done');
  await page.getByLabel('Priorytet').selectOption('High');

  await expect(page.getByText('Filtry ukrywają zlecenia')).toBeVisible();

  await page.goto('/#/clients/missing-client');
  await expect(page.getByRole('heading', { name: 'Klient nie znaleziony' })).toBeVisible();
  await expect(page.getByText('Brak rekordu klienta')).toBeVisible();

  await page.goto('/#/projects/missing-project');
  await expect(page.getByRole('heading', { name: 'Zlecenie nie znalezione' })).toBeVisible();
  await expect(page.getByText('Brak rekordu zlecenia')).toBeVisible();

  await page.goto('/#/unknown-route');
  await expect(page.getByRole('heading', { name: 'Nie znaleziono widoku' })).toBeVisible();
  await expect(page.getByText('Dostępne widoki demo to dashboard, klienci, zlecenia, kalendarz i ustawienia.')).toBeVisible();
});

test('user archives important records instead of deleting them permanently', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  await page
    .getByRole('row', { name: /Nova Studio/ })
    .getByRole('button', { name: 'Archiwizuj' })
    .click();
  await page.locator('.modal__footer').getByRole('button', { name: 'Archiwizuj' }).click();

  await expect(page.getByText('Zarchiwizowano klienta.')).toBeVisible();
  await page.getByLabel('Zakres').selectOption('archived');
  await expect(page.getByRole('row', { name: /Nova Studio/ })).toBeVisible();
  await expect(page.locator('.badge--danger', { hasText: 'Archiwum' }).first()).toBeVisible();
});

test('modal returns focus to its opener after keyboard close', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  const addClient = page.getByRole('button', { name: 'Dodaj klienta' });
  await addClient.click();
  await expect(page.getByRole('dialog', { name: 'Nowy klient' })).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(page.getByRole('dialog', { name: 'Nowy klient' })).toBeHidden();
  await expect(addClient).toBeFocused();
});

test('user confirms or cancels calendar event deletion', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Kalendarz/ }).click();
  const deleteEvent = page.getByRole('button', { name: 'Usuń' }).first();

  await deleteEvent.click();
  let dialog = page.getByRole('dialog', { name: 'Usuń wydarzenie' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Anuluj' }).click();
  await expect(dialog).toBeHidden();
  await expect(deleteEvent).toBeFocused();

  await deleteEvent.click();
  dialog = page.getByRole('dialog', { name: 'Usuń wydarzenie' });
  await dialog.getByRole('button', { name: 'Usuń' }).click();

  await expect(page.getByText('Usunięto wydarzenie.')).toBeVisible();
});

test('user completes form, modal, restore, and reset flows', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  await page
    .getByRole('row', { name: /Nova Studio/ })
    .getByRole('button', { name: 'Edytuj' })
    .click();
  let dialog = page.getByRole('dialog', { name: 'Edytuj klienta' });
  await dialog.getByLabel('Telefon').fill('+48 600 600 600');
  await dialog.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByText('Zaktualizowano klienta.')).toBeVisible();

  await page
    .getByRole('row', { name: /Nova Studio/ })
    .getByRole('button', { name: 'Archiwizuj' })
    .click();
  dialog = page.getByRole('dialog', { name: 'Archiwizuj klienta' });
  await dialog.getByRole('button', { name: 'Archiwizuj' }).click();
  await page.getByLabel('Zakres').selectOption('archived');
  await page
    .getByRole('row', { name: /Nova Studio/ })
    .getByRole('button', { name: 'Przywróć' })
    .click();
  await expect(page.getByText('Przywrócono klienta.')).toBeVisible();

  await page.getByRole('link', { name: /Zlecenia/ }).click();
  const projectCard = page.locator('.kanban__card', { hasText: 'Wdrożenie panelu klienta' });
  await projectCard.getByRole('button', { name: 'Edytuj' }).click();
  dialog = page.getByRole('dialog', { name: 'Edytuj zlecenie' });
  await dialog.getByLabel('Nazwa').fill('Wdrożenie panelu klienta E2E');
  await dialog.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByText('Zaktualizowano zlecenie.')).toBeVisible();

  const editedProjectCard = page.locator('.kanban__card', { hasText: 'Wdrożenie panelu klienta E2E' });
  await editedProjectCard.getByRole('button', { name: 'Archiwizuj' }).click();
  dialog = page.getByRole('dialog', { name: 'Archiwizuj zlecenie' });
  await dialog.getByRole('button', { name: 'Archiwizuj' }).click();
  await page.getByLabel('Zakres').selectOption('archived');
  await page.locator('.kanban__card', { hasText: 'Wdrożenie panelu klienta E2E' }).getByRole('button', { name: 'Przywróć' }).click();
  await expect(page.getByText('Przywrócono zlecenie.')).toBeVisible();

  await page.getByRole('link', { name: /Kalendarz/ }).click();
  await page.getByRole('button', { name: 'Dodaj wydarzenie' }).click();
  dialog = page.getByRole('dialog', { name: 'Nowe wydarzenie' });
  await dialog.getByLabel('Tytuł').fill('E2E onboarding call');
  await dialog.getByLabel('Data').fill('2026-08-20');
  await dialog.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByText('Dodano wydarzenie.')).toBeVisible();
  await expect(page.getByText('E2E onboarding call')).toBeVisible();

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  const resetData = page.getByRole('button', { name: 'Resetuj dane demo' });
  await resetData.click();
  dialog = page.getByRole('dialog', { name: 'Reset demo danych' });
  await dialog.getByRole('button', { name: 'Anuluj' }).click();
  await expect(dialog).toBeHidden();
  await expect(resetData).toBeFocused();

  await resetData.click();
  dialog = page.getByRole('dialog', { name: 'Reset demo danych' });
  await dialog.getByRole('button', { name: 'Resetuj' }).click();
  await expect(page.getByText('Przywrócono startowe dane demo.')).toBeVisible();
});

test('user imports confirmed valid JSON and rejects unsafe JSON', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  await page.getByLabel('Dane JSON').fill('{broken json');
  await page.getByRole('button', { name: 'Sprawdź i importuj JSON' }).click();
  await expect(page.getByText('Nieprawidłowy plik JSON.')).toBeVisible();

  await page.getByLabel('Dane JSON').fill(JSON.stringify({ clients: 'broken', projects: [], events: [] }));
  await page.getByRole('button', { name: 'Sprawdź i importuj JSON' }).click();
  await expect(page.getByText(/Import musi zawierać pełny eksport FlowDesk JSON/)).toBeVisible();

  await page.getByLabel('Dane JSON').fill(
    JSON.stringify({
      clients: [
        { id: 'c-duplicate', name: 'First Client', email: 'first@flowdesk.test' },
        { id: 'c-duplicate', name: 'Second Client', email: 'second@flowdesk.test' }
      ],
      projects: [],
      events: []
    })
  );
  await page.getByRole('button', { name: 'Sprawdź i importuj JSON' }).click();
  await expect(page.getByText(/Import zawiera zduplikowane identyfikatory rekordów/)).toBeVisible();

  await page.getByLabel('Dane JSON').fill(
    JSON.stringify({
      clients: [{ id: 'c-import', name: 'Imported Client', email: 'imported@flowdesk.test' }],
      projects: [],
      events: [],
      ui: { theme: 'light' }
    })
  );
  await page.getByRole('button', { name: 'Sprawdź i importuj JSON' }).click();

  const importDialog = page.getByRole('dialog', { name: 'Zastąp lokalne dane demo?' });
  await expect(importDialog).toBeVisible();
  await importDialog.getByRole('button', { name: 'Importuj i zastąp' }).click();
  await page.getByRole('link', { name: /Klienci/ }).click();

  await expect(page.getByRole('cell', { name: 'Imported Client' })).toBeVisible();
});
