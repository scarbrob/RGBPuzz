/**
 * Input validation and sanitization middleware
 */

import { USER_ID_REGEX, EMAIL_REGEX, LEVELS_PER_DIFFICULTY, DIFFICULTY_LEVELS } from '../constants';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate userId format (alphanumeric, hyphen, underscore, period, max 128 chars)
 */
export function validateUserId(userId: string): ValidationError | null {
  if (!userId || typeof userId !== 'string') {
    return { field: 'userId', message: 'userId is required' };
  }
  
  if (userId.length > 128) {
    return { field: 'userId', message: 'userId too long (max 128 characters)' };
  }
  
  if (!USER_ID_REGEX.test(userId)) {
    return { field: 'userId', message: 'userId contains invalid characters' };
  }
  
  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email || typeof email !== 'string') {
    return { field: 'email', message: 'email is required' };
  }
  
  if (email.length > 254) {
    return { field: 'email', message: 'email too long' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'invalid email format' };
  }
  
  return null;
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
 * Validate attempts count
 */
export function validateAttempts(attempts: number): ValidationError | null {
  if (typeof attempts !== 'number' || isNaN(attempts)) {
    return { field: 'attempts', message: 'attempts must be a number' };
  }
  
  if (attempts < 1 || attempts > 1000) {
    return { field: 'attempts', message: 'attempts must be between 1 and 1000' };
  }
  
  if (!Number.isInteger(attempts)) {
    return { field: 'attempts', message: 'attempts must be an integer' };
  }
  
  return null;
}

/**
 * Validate solve time (milliseconds)
 */
export function validateSolveTime(solveTime: number | undefined): ValidationError | null {
  if (solveTime === undefined) {
    return null; // Optional field
  }
  
  if (typeof solveTime !== 'number' || isNaN(solveTime)) {
    return { field: 'solveTime', message: 'solveTime must be a number' };
  }
  
  if (solveTime < 0 || solveTime > 3600000) {
    return { field: 'solveTime', message: 'solveTime must be between 0 and 3600000 (1 hour)' };
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

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export function sanitizeString(input: string, maxLength: number = 256): string {
  if (!input) return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim to max length
  sanitized = sanitized.substring(0, maxLength);
  
  // Trim whitespace
  return sanitized.trim();
}

/**
 * Validate and sanitize display name
 */
export function validateDisplayName(displayName: string | undefined): string | undefined {
  if (!displayName) return undefined;
  
  const sanitized = sanitizeString(displayName, 100);
  
  if (sanitized.length === 0) return undefined;
  
  return sanitized;
}
