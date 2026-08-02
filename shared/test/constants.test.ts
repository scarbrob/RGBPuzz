import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_LEVELS,
  DIFFICULTY_CONFIG,
  LEVELS_PER_DIFFICULTY,
  SPECTRUM_LEVELS_PER_DIFFICULTY,
  DAILY_CHALLENGE_CONFIG,
  SPECTRUM_DAILY_CONFIG,
  LAUNCH_DATE,
} from '../src/constants';

describe('difficulty configuration', () => {
  it('configures every declared difficulty', () => {
    // Guards the drift that silently breaks level generation: a difficulty in
    // the list with no config entry throws only at request time.
    for (const d of DIFFICULTY_LEVELS) {
      expect(DIFFICULTY_CONFIG[d], d).toBeDefined();
    }
  });

  it('declares no config for an unknown difficulty', () => {
    expect(Object.keys(DIFFICULTY_CONFIG).sort()).toEqual([...DIFFICULTY_LEVELS].sort());
  });

  it('gives every difficulty a playable colour count and attempt budget', () => {
    for (const d of DIFFICULTY_LEVELS) {
      const cfg = DIFFICULTY_CONFIG[d];
      expect(cfg.colorCount, d).toBeGreaterThanOrEqual(3);
      expect(cfg.maxAttempts, d).toBeGreaterThan(0);
    }
  });

  it('increases difficulty monotonically by colour count', () => {
    const counts = DIFFICULTY_LEVELS.map((d) => DIFFICULTY_CONFIG[d].colorCount);
    const sorted = [...counts].sort((a, b) => a - b);
    expect(counts).toEqual(sorted);
  });

  it('keeps colour counts inside the token-array validation window', () => {
    // The API rejects orderedTokenIds outside 3-20. A difficulty outside that
    // range would be unsubmittable.
    for (const d of DIFFICULTY_LEVELS) {
      expect(DIFFICULTY_CONFIG[d].colorCount, d).toBeGreaterThanOrEqual(3);
      expect(DIFFICULTY_CONFIG[d].colorCount, d).toBeLessThanOrEqual(20);
    }
  });
});

describe('level counts', () => {
  it('are positive integers', () => {
    for (const n of [LEVELS_PER_DIFFICULTY, SPECTRUM_LEVELS_PER_DIFFICULTY]) {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    }
  });
});

describe('daily challenge configuration', () => {
  it('stays inside the token-array validation window', () => {
    for (const cfg of [DAILY_CHALLENGE_CONFIG, SPECTRUM_DAILY_CONFIG]) {
      expect(cfg.colorCount).toBeGreaterThanOrEqual(3);
      expect(cfg.colorCount).toBeLessThanOrEqual(20);
      expect(cfg.maxAttempts).toBeGreaterThan(0);
    }
  });
});

describe('LAUNCH_DATE', () => {
  it('is a well-formed YYYY-MM-DD date', () => {
    expect(LAUNCH_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const parsed = new Date(`${LAUNCH_DATE}T00:00:00Z`);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
    expect(parsed.toISOString().slice(0, 10)).toBe(LAUNCH_DATE);
  });

  it('is in the past', () => {
    // The API rejects everything outside [LAUNCH_DATE, today]. A future launch
    // date would reject every single request, including today's.
    const today = new Date().toISOString().slice(0, 10);
    expect(LAUNCH_DATE <= today).toBe(true);
  });
});
