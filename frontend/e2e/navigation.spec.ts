import { test, expect } from '@playwright/test';

/**
 * Navigation and static-page smoke tests.
 * These hit no API, so they stay fast and never flake on network.
 */

test.describe('navigation', () => {
  test('home page renders and exposes the main modes', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RGBPuzz/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /daily/i }).first()).toBeVisible();
  });

  test('routes to levels, spectrum, and stats without a client error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    for (const path of ['/levels', '/spectrum', '/stats', '/privacy', '/terms']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
      // A blank main would mean a render crash rather than a real page.
      await expect(page.locator('main')).not.toBeEmpty();
    }

    expect(errors, `client errors: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('unknown route renders the 404 page, not a blank screen', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.locator('main')).toContainText(/404|not found/i);
  });

  test('deep-linking a level route works (SPA fallback)', async ({ page }) => {
    const res = await page.goto('/level/easy/1');
    expect(res?.status(), 'SPA fallback should serve index.html, not 404').toBeLessThan(400);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('theme', () => {
  test('toggles between light and dark and persists across reload', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initial = (await html.getAttribute('class')) ?? '';
    const startedDark = initial.includes('dark');

    const toggle = page.getByRole('button', { name: /theme|dark|light/i }).first();
    await toggle.click();

    await expect(html).toHaveClass(startedDark ? /light/ : /dark/);

    await page.reload();
    await expect(html).toHaveClass(startedDark ? /light/ : /dark/);
  });
});
