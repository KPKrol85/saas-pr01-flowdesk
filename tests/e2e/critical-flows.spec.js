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

  await expect(page.getByText('Acme Service E2E')).toBeVisible();
  await expect(page.getByText('e2e-client@flowdesk.test')).toBeVisible();
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

  await expect(page.getByText(payload)).toBeVisible();
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

test('user can export JSON data', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Eksportuj JSON' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('flowdesk-data.json');
});

test('user can switch theme', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  await page.getByLabel('Motyw ciemny').check();

  await expect(page.locator('body')).toHaveClass(/theme-dark/);
});

test('user can search globally and open a client detail route', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByLabel('Szukaj').fill('Nova');
  await page.getByRole('link', { name: /Klient Nova Studio/ }).click();

  await expect(page).toHaveURL(/#\/clients\/c1/);
  await expect(page.getByRole('heading', { name: 'Nova Studio' })).toBeVisible();
  await expect(page.getByText('Powiązane zlecenia')).toBeVisible();
});

test('user can open a project detail route and update its checklist', async ({ page }) => {
  await loginDemoUser(page);

  await page.goto('/#/projects/p1');
  await expect(page.getByRole('heading', { name: 'Wdrożenie panelu klienta' })).toBeVisible();
  await page.getByLabel('Zebrać feedback od klienta').check();

  await expect(page.getByText('Zaktualizowano checklistę.')).toBeVisible();
});

test('user archives important records instead of deleting them permanently', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Klienci/ }).click();
  await page.getByRole('button', { name: 'Archiwizuj' }).first().click();
  await page.locator('.modal__footer').getByRole('button', { name: 'Archiwizuj' }).click();

  await expect(page.getByText('Zarchiwizowano klienta.')).toBeVisible();
  await page.getByLabel('Zakres').selectOption('archived');
  await expect(page.getByText('Nova Studio')).toBeVisible();
  await expect(page.locator('.badge--danger', { hasText: 'Archiwum' }).first()).toBeVisible();
});

test('user imports valid JSON and rejects malformed JSON', async ({ page }) => {
  await loginDemoUser(page);

  await page.getByRole('link', { name: /Ustawienia/ }).click();
  await page.getByLabel('Dane JSON').fill('{broken json');
  await page.getByRole('button', { name: 'Importuj JSON' }).click();
  await expect(page.getByText('Nieprawidłowy plik JSON.')).toBeVisible();

  await page.getByLabel('Dane JSON').fill(
    JSON.stringify({
      clients: [{ id: 'c-import', name: 'Imported Client', email: 'imported@flowdesk.test' }],
      projects: [],
      events: [],
      ui: { theme: 'light' }
    })
  );
  await page.getByRole('button', { name: 'Importuj JSON' }).click();
  await page.getByRole('link', { name: /Klienci/ }).click();

  await expect(page.getByRole('cell', { name: 'Imported Client' })).toBeVisible();
});
