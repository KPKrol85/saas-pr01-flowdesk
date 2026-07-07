import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from '../helpers/a11y.js';
import { loginDemoUser, resetBrowserState } from '../helpers/e2e.js';

test('login view has no axe violations', async ({ page }) => {
  await resetBrowserState(page);

  await expectNoA11yViolations(page);
});

test('mobile navigation drawer has no axe violations when open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetBrowserState(page);
  await loginDemoUser(page);

  await page.locator('#drawerToggle').click();
  await page.getByRole('dialog', { name: 'Menu główne' }).waitFor();

  await expectNoA11yViolations(page);
});

test('global search results panel has no axe violations when open', async ({ page }) => {
  await resetBrowserState(page);
  await loginDemoUser(page);

  await page.getByLabel('Szukaj').fill('Nova');
  await expect(page.getByRole('link', { name: /Klient: Nova Studio/ })).toBeVisible();

  await expectNoA11yViolations(page);
});

const protectedViews = [
  { name: 'dashboard', heading: 'Dashboard', open: async () => {} },
  { name: 'clients', heading: 'Klienci', open: async (page) => page.getByRole('link', { name: /Klienci/ }).click() },
  { name: 'client detail', heading: 'Nova Studio', open: async (page) => page.goto('/#/clients/c1') },
  { name: 'projects', heading: 'Zlecenia', open: async (page) => page.getByRole('link', { name: /Zlecenia/ }).click() },
  { name: 'project detail', heading: 'Wdrożenie panelu klienta', open: async (page) => page.goto('/#/projects/p1') },
  { name: 'calendar', heading: 'Kalendarz', open: async (page) => page.getByRole('link', { name: /Kalendarz/ }).click() },
  { name: 'settings', heading: 'Ustawienia', open: async (page) => page.getByRole('link', { name: /Ustawienia/ }).click() }
];

for (const view of protectedViews) {
  test(`${view.name} view has no axe violations`, async ({ page }) => {
    await resetBrowserState(page);
    await loginDemoUser(page);
    await view.open(page);
    await page.getByRole('heading', { name: view.heading }).waitFor();

    await expectNoA11yViolations(page);
  });
}
