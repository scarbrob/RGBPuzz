import { describe, it, expect } from 'vitest';
import {
  validateDifficulty,
  validateLevel,
  validateSpectrumLevel,
  validateDate,
  validateTokenIds,
} from '../src/middleware/validation';
import { LEVELS_PER_DIFFICULTY, SPECTRUM_LEVELS_PER_DIFFICULTY, DIFFICULTY_LEVELS, LAUNCH_DATE } from '../../shared/src/constants';

const tok = (n: number) => n.toString(16).padStart(16, '0');
const tokens = (n: number) => Array.from({ length: n }, (_, i) => tok(i));

describe('validateDifficulty', () => {
  it('accepts every configured difficulty', () => {
    for (const d of DIFFICULTY_LEVELS) {
      expect(validateDifficulty(d)).toBeNull();
    }
  });

  it('rejects unknown, empty, and non-string values', () => {
    for (const bad of ['', 'EASY', 'expert', null, undefined, 5, {}]) {
      const err = validateDifficulty(bad as never);
      expect(err, String(bad)).not.toBeNull();
      expect(err!.field).toBe('difficulty');
    }
  });

  it('is case-sensitive (does not silently accept "Easy")', () => {
    expect(validateDifficulty('Easy')).not.toBeNull();
  });
});

describe('validateLevel', () => {
  it('accepts the inclusive boundaries and mid-range', () => {
    for (const lvl of [1, 50, LEVELS_PER_DIFFICULTY]) {
      expect(validateLevel(lvl), String(lvl)).toBeNull();
    }
  });

  it('rejects out-of-range values', () => {
    for (const lvl of [0, -1, LEVELS_PER_DIFFICULTY + 1, 1e6]) {
      expect(validateLevel(lvl), String(lvl)).not.toBeNull();
    }
  });

  it('rejects non-integers', () => {
    expect(validateLevel(1.5)).not.toBeNull();
  });

  it('rejects NaN, Infinity, and non-numbers', () => {
    for (const bad of [NaN, Infinity, -Infinity, '5', null, undefined, {}]) {
      expect(validateLevel(bad as never), String(bad)).not.toBeNull();
    }
  });

  it('tags the offending field', () => {
    expect(validateLevel(0)!.field).toBe('level');
  });
});

describe('validateSpectrumLevel', () => {
  it('accepts the inclusive boundaries and mid-range', () => {
    for (const lvl of [1, 50, SPECTRUM_LEVELS_PER_DIFFICULTY]) {
      expect(validateSpectrumLevel(lvl), String(lvl)).toBeNull();
    }
  });

  it('rejects out-of-range values', () => {
    for (const lvl of [0, -1, SPECTRUM_LEVELS_PER_DIFFICULTY + 1, 1e6]) {
      expect(validateSpectrumLevel(lvl), String(lvl)).not.toBeNull();
    }
  });

  it('rejects non-integers, NaN, Infinity, and non-numbers', () => {
    for (const bad of [1.5, NaN, Infinity, -Infinity, '5', null, undefined, {}]) {
      expect(validateSpectrumLevel(bad as never), String(bad)).not.toBeNull();
    }
  });

  it('tags the offending field', () => {
    expect(validateSpectrumLevel(0)!.field).toBe('level');
  });

  it('uses the spectrum bound, not the RGB one', () => {
    // Guards the drift this refactor was meant to prevent: if the two counts
    // ever diverge, spectrum must follow its own constant.
    expect(validateSpectrumLevel(SPECTRUM_LEVELS_PER_DIFFICULTY)).toBeNull();
    expect(validateSpectrumLevel(SPECTRUM_LEVELS_PER_DIFFICULTY + 1)!.message).toContain(
      String(SPECTRUM_LEVELS_PER_DIFFICULTY),
    );
  });
});

describe('validateDate', () => {
  const today = new Date().toISOString().slice(0, 10);

  it('accepts well-formed dates inside the playable range', () => {
    for (const d of [LAUNCH_DATE, '2026-01-01', today]) {
      expect(validateDate(d), d).toBeNull();
    }
  });

  it('treats a real leap day as calendar-valid, rejecting it only on range', () => {
    // 2024-02-29 is a genuine date but predates launch. The message proves the
    // calendar check passed and the range check is what rejected it -- if this
    // ever says 'invalid date', the leap-year handling has regressed.
    expect(validateDate('2024-02-29')!.message).toContain(LAUNCH_DATE);
  });

  it('rejects malformed shapes', () => {
    for (const d of ['2026-1-1', '26-01-01', '2026/01/01', '2026-01-01T00:00:00Z', 'tomorrow', '']) {
      expect(validateDate(d), d).not.toBeNull();
    }
  });

  it('rejects non-strings', () => {
    for (const d of [null, undefined, 20260101, {}]) {
      expect(validateDate(d as never), String(d)).not.toBeNull();
    }
  });

  it('rejects impossible calendar dates', () => {
    // Documents real behaviour: the regex passes but Date parsing must reject these.
    for (const d of ['2026-13-01', '2026-00-10', '2026-02-30']) {
      expect(validateDate(d), d).not.toBeNull();
    }
  });

  it('rejects dates before launch', () => {
    // Without a lower bound the API generates puzzles for dates that never
    // had one, polluting stats and share strings.
    const beforeLaunch = new Date(Date.parse(`${LAUNCH_DATE}T00:00:00Z`) - 86400000)
      .toISOString()
      .slice(0, 10);
    expect(validateDate(beforeLaunch)!.message).toContain(LAUNCH_DATE);
    expect(validateDate('2020-01-01')).not.toBeNull();
  });

  it('rejects future dates', () => {
    // The core anti-farming guard: a *daily* challenge must not be pullable
    // ahead of time.
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(validateDate(tomorrow)!.message).toContain('future');
    expect(validateDate('2099-12-31')).not.toBeNull();
  });
});

describe('validateTokenIds', () => {
  it('accepts 3-20 unique lowercase-hex 16-char tokens', () => {
    for (const n of [3, 5, 10, 20]) {
      expect(validateTokenIds(tokens(n)), String(n)).toBeNull();
    }
  });

  it('rejects non-arrays', () => {
    for (const bad of [null, undefined, 'abc', 42, {}]) {
      expect(validateTokenIds(bad), String(bad)).not.toBeNull();
    }
  });

  it('rejects arrays outside the 3-20 length window', () => {
    for (const n of [0, 1, 2, 21, 50]) {
      expect(validateTokenIds(tokens(n)), String(n)).not.toBeNull();
    }
  });

  it('rejects wrong-length, uppercase, and non-hex tokens', () => {
    const bad = [
      '0'.repeat(15),
      '0'.repeat(17),
      'ABCDEF0123456789',
      'g'.repeat(16),
      '0123456789abcde!',
    ];
    for (const t of bad) {
      expect(validateTokenIds([t, tok(1), tok(2)]), t).not.toBeNull();
    }
  });

  it('rejects non-string entries', () => {
    expect(validateTokenIds([tok(0), 123, tok(2)])).not.toBeNull();
    expect(validateTokenIds([tok(0), null, tok(2)])).not.toBeNull();
  });

  it('rejects duplicates — the anti-cheat guard', () => {
    const err = validateTokenIds([tok(1), tok(1), tok(2)]);
    expect(err).not.toBeNull();
    expect(err!.message).toMatch(/duplicate/i);
  });

  it('tags the offending field', () => {
    expect(validateTokenIds('nope')!.field).toBe('orderedTokenIds');
  });
});
