import { expect, test } from '@playwright/test';
import { loginDemoUser, resetBrowserState } from '../helpers/e2e.js';

const protectedViews = [
  { name: 'dashboard', heading: 'Dashboard', open: async () => {} },
  { name: 'clients', heading: 'Klienci', open: async (page) => page.getByRole('link', { name: /Klienci/ }).click() },
  { name: 'client-detail', heading: 'Nova Studio', open: async (page) => page.goto('/#/clients/c1') },
  { name: 'projects', heading: 'Zlecenia', open: async (page) => page.getByRole('link', { name: /Zlecenia/ }).click() },
  { name: 'project-detail', heading: 'Wdrożenie panelu klienta', open: async (page) => page.goto('/#/projects/p1') },
  { name: 'calendar', heading: 'Kalendarz', open: async (page) => page.getByRole('link', { name: /Kalendarz/ }).click() },
  { name: 'settings', heading: 'Ustawienia', open: async (page) => page.getByRole('link', { name: /Ustawienia/ }).click() }
];

test('login layout renders core landmarks', async ({ page }, testInfo) => {
  await resetBrowserState(page);

  await expect(page.getByRole('heading', { name: 'Zaloguj się do FlowDesk' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zaloguj' })).toBeVisible();
  await testInfo.attach('visual-smoke-login', {
    body: await page.screenshot(),
    contentType: 'image/png'
  });
});

for (const view of protectedViews) {
  test(`${view.name} layout renders core landmarks`, async ({ page }, testInfo) => {
    await resetBrowserState(page);
    await loginDemoUser(page);
    await view.open(page);

    await expect(page.getByRole('heading', { name: view.heading })).toBeVisible();
    await expect(page.locator('.app__shell')).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
    await testInfo.attach(`visual-smoke-${view.name}`, {
      body: await page.screenshot(),
      contentType: 'image/png'
    });
  });
}
