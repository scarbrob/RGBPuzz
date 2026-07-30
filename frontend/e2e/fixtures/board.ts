import { Page, expect } from '@playwright/test';

export const tiles = (page: Page) => page.locator('button[aria-label^="Color tile"]');

/** Current board order, as token ids. */
export async function currentOrder(page: Page): Promise<string[]> {
  return tiles(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-e2e-id') ?? ''));
}

/**
 * dnd-kit announces drag progress into an aria-live region, e.g.
 * "Draggable item <id> was moved over droppable area <id>."
 * That announcement updates on every accepted arrow key, whereas the DOM
 * order only commits on drop - so it's our reliable mid-drag signal.
 *
 * Two subtleties, both of which produced a real flake:
 *
 * 1. dnd-kit renders more than one live region, and a STALE announcement from
 *    an earlier hop can still be sitting in one of them. Joining them all and
 *    taking the FIRST regex match therefore returned a previous target - a
 *    plausible-looking but wrong token id, which is why the failure showed two
 *    real ids rather than a timeout on empty text. Take the LAST match, which
 *    is always the most recent announcement.
 * 2. Scope to dnd-kit's own region (`id^="DndLiveRegion"`) so unrelated app
 *    status text cannot be misread, falling back to the generic selector if
 *    that id scheme ever changes.
 */
async function dragTarget(page: Page): Promise<string | null> {
  const text = await page.evaluate(() => {
    const dnd = Array.from(document.querySelectorAll('[id^="DndLiveRegion"]'));
    const regions = dnd.length
      ? dnd
      : Array.from(document.querySelectorAll('[role="status"],[aria-live]'));
    return regions.map((e) => e.textContent ?? '').join(' ');
  });

  const matches = [...text.matchAll(/moved over droppable area ([a-f0-9]+)\./g)];
  return matches.length ? matches[matches.length - 1][1] : null;
}

/**
 * Move the tile at `from` to index `to` using dnd-kit's KeyboardSensor:
 * focus, Space to lift, Arrows to shift, Space to drop.
 * Exercises the real drag pipeline (and the a11y path) instead of poking
 * React state directly.
 *
 * dnd-kit debounces arrow keys behind its ~250ms sort transition, so we wait
 * for each step to be acknowledged before sending the next one. Blind presses
 * get silently swallowed and the tile lands short of its target.
 */
export async function moveTile(page: Page, from: number, to: number): Promise<void> {
  if (from === to) return;

  const order = await currentOrder(page);
  const id = order[from];

  await tiles(page).nth(from).focus();
  await page.keyboard.press('Space');
  await expect.poll(() => dragTarget(page), { timeout: 5_000 }).toBe(id);

  const key = to > from ? 'ArrowRight' : 'ArrowLeft';
  const step = to > from ? 1 : -1;

  for (let pos = from; pos !== to; pos += step) {
    const expected = order[pos + step];
    await page.keyboard.press(key);
    // Wait until dnd-kit acknowledges the hop before pressing again.
    await expect
      .poll(() => dragTarget(page), { timeout: 5_000 })
      .toBe(expected);
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
