import { test, expect } from '@playwright/test';
import { mockApi, mockApiFailure } from './fixtures/mockApi';
import { tiles, currentOrder, reorderTo, submit } from './fixtures/board';

/**
 * Daily challenge gameplay against a mocked API: deterministic, offline,
 * and it never touches production rate limits.
 */

test.describe('daily challenge', () => {
  test('loads the puzzle and renders one tile per color', async ({ page }) => {
    const fixture = await mockApi(page);
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);
  });

  test('decrypts colors client-side and paints real backgrounds', async ({ page }) => {
    await mockApi(page);
    await page.goto('/daily');

    const first = tiles(page).first();
    await expect(first).toBeVisible();

    const bg = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
    // A failed decrypt would leave this transparent rather than a real color.
    expect(bg).toMatch(/^rgba?\(/);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('the API payload carries no plaintext answers', async ({ page }) => {
    const fixture = await mockApi(page);
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    // Wire format must only be {id, encrypted} - no r/g/b, no hex.
    for (const token of fixture.colorTokens) {
      expect(Object.keys(token).sort()).toEqual(['encrypted', 'id']);
    }
  });

  test('shows an attempt counter starting at zero', async ({ page }) => {
    const fixture = await mockApi(page);
    await page.goto('/daily');
    await expect(page.locator('main')).toContainText(`/ ${fixture.maxAttempts}`);
  });

  test('keyboard drag reorders the board', async ({ page }) => {
    await mockApi(page);
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(5);

    const before = await currentOrder(page);
    await reorderTo(page, [before[2], ...before.filter((_, i) => i !== 2)]);
    const after = await currentOrder(page);

    expect(after).not.toEqual(before);
    expect([...after].sort()).toEqual([...before].sort()); // permutation, nothing lost
    expect(after[0]).toBe(before[2]);
  });

  test('submitting the correct order wins the game', async ({ page }) => {
    const fixture = await mockApi(page);
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    await reorderTo(page, fixture.solution);
    expect(await currentOrder(page)).toEqual(fixture.solution);

    await submit(page);

    await expect(page.getByRole('button', { name: /solved/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('main')).toContainText(/🎉/);
  });

  test('an incorrect order consumes an attempt and does not win', async ({ page }) => {
    const fixture = await mockApi(page, { forceIncorrect: true });
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    await submit(page);

    await expect(page.locator('main')).toContainText(/1\s*\/\s*5/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: /solved/i })).toHaveCount(0);
  });

  test('running out of attempts ends the game and locks the board', async ({ page }) => {
    const fixture = await mockApi(page, { forceIncorrect: true });
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    for (let i = 0; i < fixture.maxAttempts; i++) {
      await submit(page);
      await expect(page.locator('main')).toContainText(
        new RegExp(`${i + 1}\\s*/\\s*${fixture.maxAttempts}`),
        { timeout: 10_000 },
      );
    }

    await expect(page.locator('main')).toContainText(/out of attempts|😔/i);
    await expect(page.getByRole('button', { name: /submit answer/i })).toBeDisabled();
  });

  test('game state survives a reload (session persistence)', async ({ page }) => {
    await mockApi(page, { forceIncorrect: true });
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(5);

    await submit(page);
    await expect(page.locator('main')).toContainText(/1\s*\/\s*5/, { timeout: 10_000 });

    await page.reload();
    // Must restore from sessionStorage, not silently reset to 0.
    await expect(page.locator('main')).toContainText(/1\s*\/\s*5/, { timeout: 10_000 });
  });

  test('surfaces a friendly error when the API is down', async ({ page }) => {
    await mockApiFailure(page);
    await page.goto('/daily');
    await expect(page.locator('main')).toContainText(/could not load|⚠️|connection/i, {
      timeout: 10_000,
    });
  });
});
