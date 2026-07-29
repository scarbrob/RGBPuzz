import { Page, Route } from '@playwright/test';
import { buildDailyFixture, Fixture } from './puzzle';

export interface MockOptions {
  fixture?: Fixture;
  /** Force every validation response to this outcome, ignoring the submitted order. */
  forceIncorrect?: boolean;
}

/**
 * Intercept the RGBPuzz API so E2E runs are deterministic, offline, and
 * never touch production rate limits.
 *
 * Matches any host so it works whether the build points at localhost:7071
 * or api.rgbpuzz.com.
 */
export async function mockApi(page: Page, opts: MockOptions = {}): Promise<Fixture> {
  const fixture = opts.fixture ?? buildDailyFixture();

  await page.route('**/api/daily-challenge*', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        date: '2026-01-01',
        colorTokens: fixture.colorTokens,
        maxAttempts: fixture.maxAttempts,
      }),
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
export async function mockApiFailure(page: Page): Promise<void> {
  await page.route('**/api/daily-challenge*', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }),
  );
}
