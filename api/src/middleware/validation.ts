/**
 * Input validation and sanitization middleware
 */

import { LEVELS_PER_DIFFICULTY, DIFFICULTY_LEVELS } from '../../../shared/src/constants';

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
 * Validate level number
 */
export function validateLevel(level: number): ValidationError | null {
  if (typeof level !== 'number' || isNaN(level)) {
    return { field: 'level', message: 'level must be a number' };
  }

  if (level < 1 || level > LEVELS_PER_DIFFICULTY) {
    return { field: 'level', message: `level must be between 1 and ${LEVELS_PER_DIFFICULTY}` };
  }

  if (!Number.isInteger(level)) {
    return { field: 'level', message: 'level must be an integer' };
  }

  return null;
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

  // Validate it's a real date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { field: 'date', message: 'invalid date' };
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

  return null;
}
