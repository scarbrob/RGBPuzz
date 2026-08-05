/**
 * Input validation and sanitization middleware
 */

import { LEVELS_PER_DIFFICULTY, SPECTRUM_LEVELS_PER_DIFFICULTY, DIFFICULTY_LEVELS, LAUNCH_DATE } from '../../../shared/src/constants';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate difficulty level
 */
export function validateDifficulty(difficulty: string): ValidationError | null {
  if (!difficulty || typeof difficulty !== 'string') {
    return { field: 'difficulty', message: 'difficulty is required' };
  }

  if (!DIFFICULTY_LEVELS.includes(difficulty as any)) {
    return { field: 'difficulty', message: 'invalid difficulty level' };
  }

  return null;
}

/**
 * Validate level number against an arbitrary upper bound.
 */
function validateLevelInRange(level: number, max: number): ValidationError | null {
  if (typeof level !== 'number' || isNaN(level)) {
    return { field: 'level', message: 'level must be a number' };
  }

  if (level < 1 || level > max) {
    return { field: 'level', message: `level must be between 1 and ${max}` };
  }

  if (!Number.isInteger(level)) {
    return { field: 'level', message: 'level must be an integer' };
  }

  return null;
}

/**
 * Validate an RGB level number.
 */
export function validateLevel(level: number): ValidationError | null {
  return validateLevelInRange(level, LEVELS_PER_DIFFICULTY);
}

/**
 * Validate a spectrum level number. Spectrum has its own level count, so it
 * gets its own bound rather than borrowing the RGB one.
 */
export function validateSpectrumLevel(level: number): ValidationError | null {
  return validateLevelInRange(level, SPECTRUM_LEVELS_PER_DIFFICULTY);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): ValidationError | null {
  if (!date || typeof date !== 'string') {
    return { field: 'date', message: 'date is required' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { field: 'date', message: 'date must be in YYYY-MM-DD format' };
  }

  // Validate it's a real date.
  // Note: `new Date('2026-02-30')` does NOT throw - JS rolls it over to Mar 2.
  // Round-trip through toISOString to reject rolled-over calendar dates.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (isNaN(parsed.getTime())) {
    return { field: 'date', message: 'invalid date' };
  }

  if (parsed.toISOString().slice(0, 10) !== date) {
    return { field: 'date', message: 'invalid date' };
  }

  // Bound the range. Format-only validation let anyone pull an arbitrary
  // future puzzle (`?date=2027-01-01`), which makes a "daily" challenge
  // farmable a year ahead. Compare as strings: YYYY-MM-DD sorts
  // lexicographically, and both ends are already normalized UTC dates.
  if (date < LAUNCH_DATE) {
    return { field: 'date', message: `date must be on or after ${LAUNCH_DATE}` };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (date > today) {
    return { field: 'date', message: 'date must not be in the future' };
  }

  return null;
}

/**
 * Validate token IDs array
 */
export function validateTokenIds(tokenIds: any): ValidationError | null {
  if (!Array.isArray(tokenIds)) {
    return { field: 'orderedTokenIds', message: 'orderedTokenIds must be an array' };
  }

  if (tokenIds.length < 3 || tokenIds.length > 20) {
    return { field: 'orderedTokenIds', message: 'orderedTokenIds must contain 3-20 items' };
  }

  for (const token of tokenIds) {
    if (typeof token !== 'string' || !/^[a-f0-9]{16}$/.test(token)) {
      return { field: 'orderedTokenIds', message: 'invalid token format' };
    }
  }

  // Check for duplicate tokens
  const uniqueTokens = new Set(tokenIds);
  if (uniqueTokens.size !== tokenIds.length) {
    return { field: 'orderedTokenIds', message: 'duplicate tokens not allowed' };
  }

  return null;
}
