import { Page, expect } from '@playwright/test';

export const tiles = (page: Page) => page.locator('button[aria-label^="Color tile"]');

/** Current board order, as token ids. */
export async function currentOrder(page: Page): Promise<string[]> {
  return tiles(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-e2e-id') ?? ''));
}

/**
 * dnd-kit renders exactly ONE live region (@dnd-kit/accessibility `LiveRegion`,
 * a `role="status" aria-atomic` node) and REPLACES its text on every drag
 * event. Measured, not assumed: `[role="status"],[aria-live]` has length 1
 * throughout a drag.
 *
 * Observed sequence for lift-at-2, ArrowLeft, ArrowLeft, drop:
 *   lift  -> "Draggable item A was moved over droppable area A."  (over itself)
 *   arrow -> "Draggable item A was moved over droppable area B."
 *   arrow -> "Draggable item A was moved over droppable area C."
 *   drop  -> "Draggable item A was dropped over droppable area C"
 *
 * Two consequences that matter for the helpers below:
 *  - On lift the reported target is the dragged item ITSELF, not a neighbour.
 *  - The DOM order does NOT change until drop, so this announcement is the
 *    only usable mid-drag signal.
 */
async function dragTarget(page: Page): Promise<string | null> {
  const text = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="status"],[aria-live]'))
      .map((e) => e.textContent ?? '')
      .join(' '),
  );
  const m = text.match(/moved over droppable area ([a-f0-9]+)\./);
  return m ? m[1] : null;
}

/**
 * Press `key` until the live region reports the drag sitting over `expected`.
 *
 * dnd-kit debounces arrow keys behind its ~250ms sort transition and SILENTLY
 * DROPS any press that lands while a transition is in flight. Pressing once and
 * then polling is therefore unsound: if that single press is swallowed, the
 * awaited state can never arrive, so the poll burns its whole timeout and then
 * fails reporting the PREVIOUS hop's id. That was the flake -- roughly one test
 * per full run, moving between specs.
 *
 * Polling harder cannot recover a lost keypress. Re-pressing can.
 */
async function pressUntilTargetIs(
  page: Page,
  key: 'ArrowLeft' | 'ArrowRight',
  expected: string,
): Promise<void> {
  const deadline = Date.now() + 10_000;
  let presses = 0;

  while (Date.now() < deadline) {
    if ((await dragTarget(page)) === expected) return;

    await page.keyboard.press(key);
    presses++;

    // Short wait: long enough for the sort transition to settle and re-announce,
    // short enough that a swallowed press is retried promptly.
    try {
      await expect.poll(() => dragTarget(page), { timeout: 1_000 }).toBe(expected);
      return;
    } catch {
      // Press was swallowed mid-transition; loop and send another.
    }
  }

  throw new Error(
    `drag never reached ${expected} after ${presses} "${key}" press(es); ` +
      `live region reports ${await dragTarget(page)}`,
  );
}

/**
 * Move the tile at `from` to index `to` using dnd-kit's KeyboardSensor:
 * focus, Space to lift, Arrows to shift, Space to drop.
 * Exercises the real drag pipeline (and the a11y path) instead of poking
 * React state directly.
 */
export async function moveTile(page: Page, from: number, to: number): Promise<void> {
  if (from === to) return;

  const order = await currentOrder(page);
  const id = order[from];

  await tiles(page).nth(from).focus();
  await page.keyboard.press('Space');

  // On lift, dnd-kit reports the item as being over itself.
  await expect.poll(() => dragTarget(page), { timeout: 5_000 }).toBe(id);

  const key = to > from ? 'ArrowRight' : 'ArrowLeft';
  const step = to > from ? 1 : -1;

  // The DOM does not reorder until drop, so each hop target comes from the
  // order captured before the lift.
  for (let pos = from; pos !== to; pos += step) {
    await pressUntilTargetIs(page, key, order[pos + step]);
  }

  await page.keyboard.press('Space');
  await expect
    .poll(async () => (await currentOrder(page)).indexOf(id), { timeout: 5_000 })
    .toBe(to);
}

/**
 * Reorder the board into `targetOrder` (token ids) via keyboard drags.
 * Selection sort: each pass locks one more tile into its final slot.
 */
export async function reorderTo(page: Page, targetOrder: string[]): Promise<void> {
  for (let target = 0; target < targetOrder.length; target++) {
    const order = await currentOrder(page);
    const from = order.indexOf(targetOrder[target]);
    if (from === -1) throw new Error(`tile ${targetOrder[target]} not found on board`);
    if (from !== target) await moveTile(page, from, target);
  }

  await expect.poll(() => currentOrder(page), { timeout: 5_000 }).toEqual(targetOrder);
}

export async function submit(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: /submit answer|checking/i });
  await expect(button).toBeEnabled();
  await button.click();
}
