/**
 * Shared constants for RGBPuzz game configuration
 * Centralized to avoid duplication and make changes easier
 */

// ==================== DIFFICULTY LEVELS ====================

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'insane'] as const;
export type Difficulty = typeof DIFFICULTY_LEVELS[number];

// ==================== GAME CONFIGURATION ====================

/**
 * Number of levels available per difficulty
 */
export const LEVELS_PER_DIFFICULTY = 100;

/**
 * Total number of levels across all difficulties
 */
export const TOTAL_LEVELS = LEVELS_PER_DIFFICULTY * DIFFICULTY_LEVELS.length;

/**
 * Configuration for each difficulty level
 */
export const DIFFICULTY_CONFIG = {
  easy: {
    colorCount: 3,
    description: '3 colors, widely spaced',
    emoji: '🟢',
  },
  medium: {
    colorCount: 5,
    description: '5 colors, moderate spacing',
    emoji: '🟡',
  },
  hard: {
    colorCount: 7,
    description: '7 colors, close spacing',
    emoji: '🟠',
  },
  insane: {
    colorCount: 10,
    description: '10 colors, very close spacing',
    emoji: '🔴',
  },
} as const;

// ==================== DAILY CHALLENGE ====================

/**
 * Configuration for daily challenges
 */
export const DAILY_CHALLENGE_CONFIG = {
  colorCount: 5,
  maxAttempts: 5,
} as const;

// ==================== VALIDATION ====================

/**
 * User ID validation regex
 * Allows alphanumeric, periods, underscores, and hyphens
 */
export const USER_ID_REGEX = /^[a-zA-Z0-9._-]{1,128}$/;

/**
 * Email validation regex (basic)
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
