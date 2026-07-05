import { test } from '@playwright/test';
import { expectNoA11yViolations } from '../helpers/a11y.js';
import { loginDemoUser, resetBrowserState } from '../helpers/e2e.js';

test('login view has no axe violations', async ({ page }) => {
  await resetBrowserState(page);

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
