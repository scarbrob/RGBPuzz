import { Page, Route } from '@playwright/test';
import {
  buildDailyFixture,
  buildLevelFixture,
  buildSpectrumFixture,
  Fixture,
} from './puzzle';

export interface MockOptions {
  fixture?: Fixture;
  /** Force every validation response to this outcome, ignoring the submitted order. */
  forceIncorrect?: boolean;
  /** Which game mode to serve. Each mode has its own puzzle endpoint. */
  mode?: Mode;
}

export type Mode = 'daily' | 'level' | 'spectrum' | 'spectrum-daily';

const PUZZLE_ROUTE: Record<Mode, string> = {
  daily: '**/api/daily-challenge*',
  level: '**/api/level?*',
  spectrum: '**/api/spectrum-level*',
  'spectrum-daily': '**/api/spectrum-daily*',
};

function defaultFixture(mode: Mode): Fixture {
  switch (mode) {
    case 'level':
      return buildLevelFixture();
    case 'spectrum':
      return buildSpectrumFixture();
    case 'spectrum-daily':
      // Daily modes allow 5 attempts, not the 10 that level modes get.
      return buildSpectrumFixture(5);
    default:
      return buildDailyFixture();
  }
}

function puzzleBody(mode: Mode, fixture: Fixture): Record<string, unknown> {
  switch (mode) {
    case 'level':
      return {
        difficulty: 'medium',
        level: 1,
        colorCount: fixture.colorTokens.length,
        colorTokens: fixture.colorTokens,
      };
    case 'spectrum':
      return {
        difficulty: 'medium',
        level: 1,
        mode: 'spectrum',
        colorCount: fixture.colorTokens.length,
        colorTokens: fixture.colorTokens,
      };
    case 'spectrum-daily':
      return {
        date: '2026-01-01',
        mode: 'spectrum-daily',
        colorTokens: fixture.colorTokens,
        maxAttempts: fixture.maxAttempts,
      };
    default:
      return {
        date: '2026-01-01',
        colorTokens: fixture.colorTokens,
        maxAttempts: fixture.maxAttempts,
      };
  }
}

/**
 * Intercept the RGBPuzz API so E2E runs are deterministic, offline, and
 * never touch production rate limits.
 *
 * Matches any host so it works whether the build points at localhost:7071
 * or api.rgbpuzz.com.
 */
export async function mockApi(page: Page, opts: MockOptions = {}): Promise<Fixture> {
  const mode = opts.mode ?? 'daily';
  const fixture = opts.fixture ?? defaultFixture(mode);

  await page.route(PUZZLE_ROUTE[mode], (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(puzzleBody(mode, fixture)),
    }),
  );

  await page.route('**/api/validate-solution*', async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    }

    const body = route.request().postDataJSON() as { orderedTokenIds?: string[] };
    const submitted = body?.orderedTokenIds ?? [];

    const correct =
      !opts.forceIncorrect &&
      submitted.length === fixture.solution.length &&
      submitted.every((id, i) => id === fixture.solution[i]);

    const correctPositions = submitted
      .map((id, i) => (fixture.solution[i] === id ? i : -1))
      .filter((i) => i !== -1);

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        correct,
        correctPositions: opts.forceIncorrect ? [] : correctPositions,
        solved: correct,
      }),
    });
  });

  return fixture;
}

/** Simulate the API being down, to exercise the error path. */
export async function mockApiFailure(page: Page, mode: Mode = 'daily'): Promise<void> {
  await page.route(PUZZLE_ROUTE[mode], (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }),
  );
}
