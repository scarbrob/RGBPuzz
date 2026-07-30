import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';
import {
  generateDailySeed,
  generateColorsFromSeed,
  createColorToken,
  encryptHex,
  rgbToValue,
  deterministicShuffle,
  generateLevelColors,
  rgbToHsl,
  hslToRgb,
  hueToValue,
  generateSpectrumLevelColors,
  generateSpectrumDailyColors,
} from '../src/utils/colorGenerator';
import { DIFFICULTY_CONFIG, SPECTRUM_DIFFICULTY_CONFIG, DIFFICULTY_LEVELS } from '../../shared/src/constants';
import type { RGBColor } from '../../shared/src/types';

const SALT = 'test-salt';
const DIFFICULTIES = [...DIFFICULTY_LEVELS];

function inRange(c: RGBColor) {
  return [c.r, c.g, c.b].every((v) => Number.isInteger(v) && v >= 0 && v <= 255);
}
function key(c: RGBColor) {
  return `${c.r},${c.g},${c.b}`;
}

describe('generateDailySeed', () => {
  it('is deterministic for the same date+salt', () => {
    expect(generateDailySeed('2026-01-01', SALT)).toBe(generateDailySeed('2026-01-01', SALT));
  });

  it('differs across dates and across salts', () => {
    expect(generateDailySeed('2026-01-01', SALT)).not.toBe(generateDailySeed('2026-01-02', SALT));
    expect(generateDailySeed('2026-01-01', SALT)).not.toBe(generateDailySeed('2026-01-01', 'other'));
  });

  it('returns a 64-char hex digest', () => {
    expect(generateDailySeed('2026-01-01', SALT)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('cannot be collided by a caller, because date is format-restricted', () => {
    // The concatenation `${date}:${salt}` is ambiguous in principle, but `date`
    // is regex-validated to YYYY-MM-DD (no colons) and `salt` is a fixed server
    // secret, so no caller-reachable collision exists. This test pins that
    // invariant: if date validation ever loosens, this should be revisited.
    const seeds = new Set<string>();
    for (let day = 0; day < 365; day++) {
      const d = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().split('T')[0];
      seeds.add(generateDailySeed(d, SALT));
    }
    expect(seeds.size).toBe(365);
  });
});

describe('generateColorsFromSeed', () => {
  const seed = generateDailySeed('2026-01-01', SALT);

  it('is deterministic', () => {
    expect(generateColorsFromSeed(seed, 5)).toEqual(generateColorsFromSeed(seed, 5));
  });

  it('returns the requested count', () => {
    for (const n of [3, 5, 7, 10]) {
      expect(generateColorsFromSeed(seed, n)).toHaveLength(n);
    }
  });

  it('clamps every channel to the documented 10-245 window', () => {
    for (const date of ['2026-01-01', '2026-06-15', '2026-12-31']) {
      for (const c of generateColorsFromSeed(generateDailySeed(date, SALT), 10)) {
        expect(inRange(c)).toBe(true);
        for (const v of [c.r, c.g, c.b]) {
          expect(v).toBeGreaterThanOrEqual(10);
          expect(v).toBeLessThanOrEqual(245);
        }
      }
    }
  });

  it('produces a prefix-stable sequence (count N is a prefix of count N+k)', () => {
    expect(generateColorsFromSeed(seed, 3)).toEqual(generateColorsFromSeed(seed, 5).slice(0, 3));
  });

  it('yields distinct RGB values across a year of daily seeds', () => {
    // Guards the real gameplay requirement: no duplicate tiles in a daily puzzle.
    for (let day = 0; day < 365; day++) {
      const d = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().split('T')[0];
      const colors = generateColorsFromSeed(generateDailySeed(d, SALT), 5);
      expect(new Set(colors.map(key)).size).toBe(colors.length);
    }
  });

  it('yields a strict total order under rgbToValue (no ambiguous solution)', () => {
    for (let day = 0; day < 365; day++) {
      const d = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().split('T')[0];
      const values = generateColorsFromSeed(generateDailySeed(d, SALT), 5).map(rgbToValue);
      expect(new Set(values).size).toBe(values.length);
    }
  });
});

describe('createColorToken', () => {
  const color: RGBColor = { r: 10, g: 20, b: 30 };

  it('returns a 16-char hex token matching the API validation regex', () => {
    expect(createColorToken(color, 0, SALT)).toMatch(/^[a-f0-9]{16}$/);
  });

  it('is deterministic and index-sensitive', () => {
    expect(createColorToken(color, 0, SALT)).toBe(createColorToken(color, 0, SALT));
    expect(createColorToken(color, 0, SALT)).not.toBe(createColorToken(color, 1, SALT));
  });

  it('is salt-sensitive, so tokens do not transfer across modes', () => {
    expect(createColorToken(color, 0, SALT + 'easy1')).not.toBe(createColorToken(color, 0, SALT + 'spectrumeasy1'));
  });

  it('produces unique tokens across a full puzzle', () => {
    const colors = generateColorsFromSeed(generateDailySeed('2026-03-03', SALT), 10);
    const tokens = colors.map((c, i) => createColorToken(c, i, SALT));
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it('does not leak channel values through the delimiter', () => {
    // {r:1,g:2,b:34} and {r:1,g:23,b:4} must not collide
    expect(createColorToken({ r: 1, g: 2, b: 34 }, 0, SALT)).not.toBe(
      createColorToken({ r: 1, g: 23, b: 4 }, 0, SALT),
    );
  });
});

describe('encryptHex', () => {
  it('round-trips via XOR with the same token', () => {
    const hex = '1a2b3c';
    const token = createColorToken({ r: 26, g: 43, b: 60 }, 0, SALT);
    const enc = Buffer.from(encryptHex(hex, token), 'base64');
    const md5 = createHash('md5').update(token).digest();
    const dec = Buffer.from(enc.map((b, i) => b ^ md5[i % md5.length]));
    expect(dec.toString('hex')).toBe(hex);
  });

  it('tolerates a leading # and emits base64', () => {
    expect(encryptHex('#1a2b3c', 'tok')).toBe(encryptHex('1a2b3c', 'tok'));
    expect(encryptHex('#1a2b3c', 'tok')).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('produces different ciphertext under different tokens', () => {
    expect(encryptHex('1a2b3c', 'tok-a')).not.toBe(encryptHex('1a2b3c', 'tok-b'));
  });
});

describe('rgbToValue', () => {
  it('packs channels big-endian', () => {
    expect(rgbToValue({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(rgbToValue({ r: 255, g: 255, b: 255 })).toBe(16777215);
    expect(rgbToValue({ r: 1, g: 0, b: 0 })).toBe(65536);
  });

  it('orders by red first, then green, then blue', () => {
    expect(rgbToValue({ r: 1, g: 0, b: 0 })).toBeGreaterThan(rgbToValue({ r: 0, g: 255, b: 255 }));
    expect(rgbToValue({ r: 5, g: 1, b: 0 })).toBeGreaterThan(rgbToValue({ r: 5, g: 0, b: 255 }));
  });
});

describe('deterministicShuffle', () => {
  const arr = Array.from({ length: 10 }, (_, i) => i);

  it('is deterministic for a given seed', () => {
    expect(deterministicShuffle(arr, 'seed-1')).toEqual(deterministicShuffle(arr, 'seed-1'));
  });

  it('differs across seeds', () => {
    expect(deterministicShuffle(arr, 'seed-1')).not.toEqual(deterministicShuffle(arr, 'seed-2'));
  });

  it('is a permutation and does not mutate the input', () => {
    const input = [...arr];
    const out = deterministicShuffle(input, 'seed-1');
    expect([...out].sort((a, b) => a - b)).toEqual(arr);
    expect(input).toEqual(arr);
  });

  it('handles empty and single-element arrays', () => {
    expect(deterministicShuffle([], 's')).toEqual([]);
    expect(deterministicShuffle([42], 's')).toEqual([42]);
  });

  it('actually reorders (not an identity shuffle) for most seeds', () => {
    const identical = Array.from({ length: 20 }, (_, i) =>
      deterministicShuffle(arr, `s${i}`).every((v, idx) => v === arr[idx]),
    ).filter(Boolean).length;
    expect(identical).toBeLessThan(3);
  });
});

describe('generateLevelColors', () => {
  it('honours the configured color count per difficulty', () => {
    for (const d of DIFFICULTIES) {
      expect(generateLevelColors(d, 1)).toHaveLength(DIFFICULTY_CONFIG[d].colorCount);
    }
  });

  it('is deterministic per difficulty+level', () => {
    expect(generateLevelColors('hard', 42)).toEqual(generateLevelColors('hard', 42));
  });

  it('keeps every channel in 0-255 across all 400 levels', () => {
    for (const d of DIFFICULTIES) {
      for (let lvl = 1; lvl <= 100; lvl++) {
        for (const c of generateLevelColors(d, lvl)) {
          expect(inRange(c), `${d} ${lvl} -> ${key(c)}`).toBe(true);
        }
      }
    }
  });

  it('never emits duplicate colors across all 400 levels', () => {
    for (const d of DIFFICULTIES) {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const colors = generateLevelColors(d, lvl);
        expect(new Set(colors.map(key)).size, `${d} ${lvl}`).toBe(colors.length);
      }
    }
  });

  it('has a unique sort value per tile across all 400 levels', () => {
    // Two tiles with the same rgbToValue would make the puzzle unsolvable-by-design.
    for (const d of DIFFICULTIES) {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const values = generateLevelColors(d, lvl).map(rgbToValue);
        expect(new Set(values).size, `${d} ${lvl}`).toBe(values.length);
      }
    }
  });

  it('gets harder: level 100 spacing is tighter than level 1', () => {
    for (const d of DIFFICULTIES) {
      const spread = (lvl: number) => {
        const v = generateLevelColors(d, lvl).map(rgbToValue).sort((a, b) => a - b);
        return v[v.length - 1] - v[0];
      };
      expect(spread(100), d).toBeLessThan(spread(1));
    }
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('maps the primaries to canonical hues', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 }).h).toBeCloseTo(0, 5);
    expect(rgbToHsl({ r: 0, g: 255, b: 0 }).h).toBeCloseTo(120, 5);
    expect(rgbToHsl({ r: 0, g: 0, b: 255 }).h).toBeCloseTo(240, 5);
  });

  it('treats greys as zero-saturation', () => {
    for (const v of [0, 128, 255]) {
      const hsl = rgbToHsl({ r: v, g: v, b: v });
      expect(hsl.s).toBe(0);
      expect(hsl.h).toBe(0);
      expect(hsl.l).toBeCloseTo((v / 255) * 100, 5);
    }
  });

  it('round-trips rgb -> hsl -> rgb within 1 unit per channel', () => {
    const samples: RGBColor[] = [
      { r: 255, g: 0, b: 0 },
      { r: 12, g: 200, b: 77 },
      { r: 128, g: 128, b: 200 },
      { r: 10, g: 245, b: 130 },
      { r: 200, g: 30, b: 90 },
    ];
    for (const c of samples) {
      const hsl = rgbToHsl(c);
      const back = hslToRgb(hsl.h, hsl.s, hsl.l);
      expect(Math.abs(back.r - c.r), key(c)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - c.g), key(c)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - c.b), key(c)).toBeLessThanOrEqual(1);
    }
  });

  it('hslToRgb always returns in-range integers, including at hue extremes', () => {
    for (const h of [0, 59.9, 60, 120, 180, 240, 300, 359.9, 360]) {
      for (const s of [0, 50, 100]) {
        for (const l of [0, 30, 50, 70, 100]) {
          expect(inRange(hslToRgb(h, s, l)), `h${h} s${s} l${l}`).toBe(true);
        }
      }
    }
  });
});

describe('hueToValue', () => {
  it('sorts primarily by hue', () => {
    expect(hueToValue({ r: 255, g: 0, b: 0 })).toBeLessThan(hueToValue({ r: 0, g: 255, b: 0 }));
    expect(hueToValue({ r: 0, g: 255, b: 0 })).toBeLessThan(hueToValue({ r: 0, g: 0, b: 255 }));
  });

  it('uses lightness only as a tiebreaker within the same hue', () => {
    const dark = hueToValue({ r: 128, g: 0, b: 0 });
    const light = hueToValue({ r: 255, g: 0, b: 0 });
    expect(dark).toBeLessThan(light);
    // ...but a hue difference always dominates a lightness difference
    expect(light).toBeLessThan(hueToValue({ r: 0, g: 40, b: 0 }));
  });
});

describe('generateSpectrumLevelColors', () => {
  it('honours the configured color count per difficulty', () => {
    for (const d of DIFFICULTIES) {
      expect(generateSpectrumLevelColors(d, 1)).toHaveLength(SPECTRUM_DIFFICULTY_CONFIG[d].colorCount);
    }
  });

  it('is deterministic per difficulty+level', () => {
    expect(generateSpectrumLevelColors('insane', 77)).toEqual(generateSpectrumLevelColors('insane', 77));
  });

  it('keeps channels in range and colors unique across all 400 levels', () => {
    for (const d of DIFFICULTIES) {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const colors = generateSpectrumLevelColors(d, lvl);
        for (const c of colors) expect(inRange(c), `${d} ${lvl}`).toBe(true);
        expect(new Set(colors.map(key)).size, `${d} ${lvl}`).toBe(colors.length);
      }
    }
  });

  it('has a unique hue sort value per tile across all 400 levels', () => {
    for (const d of DIFFICULTIES) {
      for (let lvl = 1; lvl <= 100; lvl++) {
        const values = generateSpectrumLevelColors(d, lvl).map(hueToValue);
        expect(new Set(values).size, `${d} ${lvl}`).toBe(values.length);
      }
    }
  });

  it('differs from the RGB level generator for the same difficulty+level', () => {
    expect(generateSpectrumLevelColors('medium', 5)).not.toEqual(generateLevelColors('medium', 5));
  });
});

describe('generateSpectrumDailyColors', () => {
  const seed = generateDailySeed('2026-01-01', SALT + ':spectrum');

  it('is deterministic and returns the requested count', () => {
    expect(generateSpectrumDailyColors(seed, 5, 60)).toEqual(generateSpectrumDailyColors(seed, 5, 60));
    expect(generateSpectrumDailyColors(seed, 5, 60)).toHaveLength(5);
  });

  it('keeps colors in range, unique, and hue-orderable across a year', () => {
    for (let day = 0; day < 365; day++) {
      const d = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().split('T')[0];
      const s = generateDailySeed(d, SALT + ':spectrum');
      const colors = generateSpectrumDailyColors(s, 5, 60);
      for (const c of colors) expect(inRange(c), d).toBe(true);
      expect(new Set(colors.map(key)).size, d).toBe(colors.length);
      expect(new Set(colors.map(hueToValue)).size, d).toBe(colors.length);
    }
  });

  it('clusters colors within the requested hue arc (wrap-aware)', () => {
    const hues = generateSpectrumDailyColors(seed, 5, 60).map((c) => rgbToHsl(c).h);
    const spread = Math.max(...hues.map((a) => Math.min(...hues.map((b) => {
      const raw = Math.abs(a - b);
      return Math.min(raw, 360 - raw);
    }).map(() => 0))), 0);
    // Pairwise wrap-aware distance must never exceed the arc (plus rounding slack).
    for (const a of hues) {
      for (const b of hues) {
        const raw = Math.abs(a - b);
        expect(Math.min(raw, 360 - raw)).toBeLessThanOrEqual(60 + 2);
      }
    }
    expect(spread).toBe(0);
  });

  it('differs from the RGB daily generator for the same date', () => {
    expect(generateSpectrumDailyColors(seed, 5, 60)).not.toEqual(
      generateColorsFromSeed(generateDailySeed('2026-01-01', SALT), 5),
    );
  });
});
