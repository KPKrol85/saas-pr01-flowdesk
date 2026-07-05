import { expect, test } from '@playwright/test';
import { loginDemoUser, resetBrowserState } from '../helpers/e2e.js';

test.describe('mobile navigation shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await resetBrowserState(page);
    await loginDemoUser(page);
  });

  test('keeps drawer state, aria-expanded, focus, and scroll lock synchronized', async ({ page }) => {
    const toggle = page.locator('#drawerToggle');
    const drawer = page.getByRole('dialog', { name: 'Menu główne' });

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Zamknij menu');
    await expect(drawer.locator('.sidebar__link--active')).toContainText('Dashboard');
    await expect(page.locator('body')).toHaveClass(/scroll-lock/);

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Otwórz menu');
    await expect(toggle).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/scroll-lock/);

    await toggle.click();
    await drawer.getByRole('button', { name: 'Zamknij menu' }).click();
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await page.mouse.click(350, 24);
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/scroll-lock/);
  });

  test('closes the mobile drawer after route navigation', async ({ page }) => {
    const toggle = page.locator('#drawerToggle');

    await toggle.click();
    await page
      .locator('.drawer')
      .getByRole('link', { name: /Klienci/ })
      .click();

    await expect(page).toHaveURL(/#\/clients/);
    await expect(page.getByRole('heading', { name: 'Klienci' })).toBeVisible();
    await expect(page.locator('.drawer--open')).toHaveCount(0);
    await expect(page.locator('#drawerToggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveClass(/scroll-lock/);
  });
});

test('desktop shell keeps sidebar visible and hides mobile menu trigger', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await resetBrowserState(page);
  await loginDemoUser(page);

  await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('#drawerToggle')).toBeHidden();
});

test('protected shell does not create horizontal overflow across shell breakpoints', async ({ page }) => {
  const widths = [360, 390, 480, 760, 1024];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    await resetBrowserState(page);
    await loginDemoUser(page);
    await page.goto('/#/dashboard');

    const closedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(closedOverflow, `closed shell overflow at ${width}px`).toBeLessThanOrEqual(1);

    const toggle = page.locator('#drawerToggle');
    if (await toggle.isVisible()) {
      await toggle.click();
      const openOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(openOverflow, `open drawer overflow at ${width}px`).toBeLessThanOrEqual(1);
      await page.keyboard.press('Escape');
    }
  }
});
