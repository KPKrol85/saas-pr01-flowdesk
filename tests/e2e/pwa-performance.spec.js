import { expect, test } from '@playwright/test';
import { loginDemoUser, resetBrowserState } from '../helpers/e2e.js';

test('shows a user-controlled update prompt when a new service worker is waiting', async ({ page }) => {
  await resetBrowserState(page);

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('flowdesk:sw-update-available'));
  });

  await expect(page.getByText('Nowa wersja FlowDesk jest dostępna.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Odśwież' })).toBeVisible();
});

test('renders the dashboard on a mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await resetBrowserState(page);
  await loginDemoUser(page);

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Otwórz menu', exact: true })).toBeVisible();
  await expect(page.locator('.app__shell')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('starts on a slow static asset path without timing-based UI failures', async ({ page }) => {
  await page.route(/\.(css|js|woff2|svg|webmanifest)$/i, async (route) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
    await route.continue();
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Zaloguj się do FlowDesk' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zaloguj' })).toBeVisible();
});

test('does not crash when localStorage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const blockedStorage = {
      getItem() {
        throw new Error('storage blocked');
      },
      setItem() {
        throw new Error('storage blocked');
      },
      removeItem() {
        throw new Error('storage blocked');
      },
      clear() {
        throw new Error('storage blocked');
      }
    };

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: blockedStorage
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Zaloguj się do FlowDesk' })).toBeVisible();
  await expect(page.getByText('Tryb bez trwałego zapisu.')).toBeVisible();
});

test.describe('service worker offline cache', () => {
  test.use({ serviceWorkers: 'allow' });

  test('serves the cached app shell while offline after the first visit', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

    try {
      await context.setOffline(true);
      await page.goto('/#/dashboard');

      await expect(page.getByRole('heading', { name: 'Zaloguj się do FlowDesk' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Zaloguj' })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });
});
