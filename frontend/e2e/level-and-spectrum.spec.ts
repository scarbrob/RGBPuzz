import { test, expect } from '@playwright/test';
import { mockApi, mockApiFailure } from './fixtures/mockApi';
import { tiles, currentOrder, reorderTo, submit } from './fixtures/board';

/**
 * Coverage for the three shipping modes that are not the RGB daily:
 * level play, spectrum level play, and the spectrum daily.
 *
 * Spectrum sorts by HSL hue rather than packed RGB value, so it gets its own
 * fixture whose solution is hue-ordered. A spectrum board that only passes an
 * RGB-value sort would mean the client and server disagree about the answer.
 *
 * Level routes are gated on localStorage progress for level > 1, so these all
 * use level 1, which is always unlocked.
 */

const MEDIUM_LEVEL_1 = '/level/medium/1';
const SPECTRUM_LEVEL_1 = '/spectrum/medium/1';
const SPECTRUM_DAILY = '/spectrum/daily';

test.describe('level play', () => {
  test('loads a level and renders one tile per color', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'level' });
    await page.goto(MEDIUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);
  });

  test('decrypts colors client-side and paints real backgrounds', async ({ page }) => {
    await mockApi(page, { mode: 'level' });
    await page.goto(MEDIUM_LEVEL_1);

    const first = tiles(page).first();
    await expect(first).toBeVisible();

    const bg = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/^rgba?\(/);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('the level payload carries no plaintext answers', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'level' });
    await page.goto(MEDIUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    for (const token of fixture.colorTokens) {
      expect(Object.keys(token).sort()).toEqual(['encrypted', 'id']);
    }
  });

  test('submitting the correct order wins and records level progress', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'level' });
    await page.goto(MEDIUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    await reorderTo(page, fixture.solution);
    await submit(page);

    // Level pages render the win state as text, not a button.
    await expect(page.getByText(/✓ Solved!/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /next level/i })).toBeVisible();

    // The win must unlock the next level, otherwise the whole ladder is stuck.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem('levelProgress') ?? '{}')?.medium?.['1'] ?? null,
          ),
        { timeout: 10_000 },
      )
      .toBe(true);
  });

  test('an incorrect order consumes an attempt and does not win', async ({ page }) => {
    await mockApi(page, { mode: 'level', forceIncorrect: true });
    await page.goto(MEDIUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(5);

    await submit(page);

    await expect(page.locator('main')).toContainText(/1\s*\/\s*10/, { timeout: 10_000 });
    await expect(page.getByText(/✓ Solved!/)).toHaveCount(0);
  });

  test('a locked level redirects back to the level list', async ({ page }) => {
    await mockApi(page, { mode: 'level' });
    // Level 5 with no saved progress must not be playable.
    await page.goto('/level/medium/5');
    await expect(page).toHaveURL(/\/levels$/, { timeout: 10_000 });
  });

  test('surfaces a friendly error when the level API is down', async ({ page }) => {
    await mockApiFailure(page, 'level');
    await page.goto(MEDIUM_LEVEL_1);
    await expect(page.locator('main')).toContainText(/could not load|⚠️|connection|error/i, {
      timeout: 10_000,
    });
  });
});

test.describe('spectrum level play', () => {
  test('loads a spectrum level and renders one tile per color', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum' });
    await page.goto(SPECTRUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);
  });

  test('the spectrum payload carries no plaintext answers', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum' });
    await page.goto(SPECTRUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    for (const token of fixture.colorTokens) {
      expect(Object.keys(token).sort()).toEqual(['encrypted', 'id']);
    }
  });

  test('sorting by hue wins and records spectrum progress', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum' });
    await page.goto(SPECTRUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    await reorderTo(page, fixture.solution);
    await submit(page);

    await expect(page.getByText(/✓ Solved!/)).toBeVisible({ timeout: 10_000 });

    // Spectrum progress is a separate key from RGB levels — they must not share.
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              JSON.parse(localStorage.getItem('spectrumLevelProgress') ?? '{}')?.medium?.['1'] ??
              null,
          ),
        { timeout: 10_000 },
      )
      .toBe(true);
    const rgbProgress = await page.evaluate(() => localStorage.getItem('levelProgress'));
    expect(rgbProgress).toBeNull();
  });

  test('an incorrect order consumes an attempt and does not win', async ({ page }) => {
    await mockApi(page, { mode: 'spectrum', forceIncorrect: true });
    await page.goto(SPECTRUM_LEVEL_1);
    await expect(tiles(page)).toHaveCount(5);

    await submit(page);

    await expect(page.locator('main')).toContainText(/1\s*\/\s*10/, { timeout: 10_000 });
    await expect(page.getByText(/✓ Solved!/)).toHaveCount(0);
  });

  test('a locked spectrum level redirects back to the spectrum list', async ({ page }) => {
    await mockApi(page, { mode: 'spectrum' });
    await page.goto('/spectrum/medium/5');
    await expect(page).toHaveURL(/\/spectrum$/, { timeout: 10_000 });
  });
});

test.describe('spectrum daily', () => {
  test('loads the puzzle and renders one tile per color', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum-daily' });
    await page.goto(SPECTRUM_DAILY);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);
  });

  test('shows an attempt counter starting at zero', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum-daily' });
    await page.goto(SPECTRUM_DAILY);
    await expect(page.locator('main')).toContainText(`/ ${fixture.maxAttempts}`);
  });

  test('sorting by hue wins the game', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum-daily' });
    await page.goto(SPECTRUM_DAILY);
    await expect(tiles(page)).toHaveCount(fixture.colorTokens.length);

    await reorderTo(page, fixture.solution);
    expect(await currentOrder(page)).toEqual(fixture.solution);

    await submit(page);

    await expect(page.getByRole('button', { name: /solved/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('main')).toContainText(/🌈/);
  });

  test('running out of attempts ends the game and locks the board', async ({ page }) => {
    const fixture = await mockApi(page, { mode: 'spectrum-daily', forceIncorrect: true });
    await page.goto(SPECTRUM_DAILY);
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
    await mockApi(page, { mode: 'spectrum-daily', forceIncorrect: true });
    await page.goto(SPECTRUM_DAILY);
    await expect(tiles(page)).toHaveCount(5);

    await submit(page);
    await expect(page.locator('main')).toContainText(/1\s*\/\s*5/, { timeout: 10_000 });

    await page.reload();
    await expect(page.locator('main')).toContainText(/1\s*\/\s*5/, { timeout: 10_000 });
  });

  test('spectrum daily and RGB daily keep separate sessions', async ({ page }) => {
    await mockApi(page, { mode: 'spectrum-daily', forceIncorrect: true });
    await mockApi(page, { mode: 'daily' });

    await page.goto(SPECTRUM_DAILY);
    await expect(tiles(page)).toHaveCount(5);
    await submit(page);
    await expect(page.locator('main')).toContainText(/1\s*\/\s*5/, { timeout: 10_000 });

    // The RGB daily must be untouched by spectrum progress.
    await page.goto('/daily');
    await expect(tiles(page)).toHaveCount(5);
    await expect(page.locator('main')).toContainText(/0\s*\/\s*5/, { timeout: 10_000 });
  });

  test('surfaces a friendly error when the API is down', async ({ page }) => {
    await mockApiFailure(page, 'spectrum-daily');
    await page.goto(SPECTRUM_DAILY);
    await expect(page.locator('main')).toContainText(/could not load|⚠️|connection/i, {
      timeout: 10_000,
    });
  });
});
