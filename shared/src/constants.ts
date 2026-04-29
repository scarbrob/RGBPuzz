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
 * Configuration for each difficulty level
 */
export const DIFFICULTY_CONFIG = {
  easy: {
    colorCount: 3,
    maxAttempts: 10,
    description: '3 colors, widely spaced',
    emoji: '🟢',
  },
  medium: {
    colorCount: 5,
    maxAttempts: 10,
    description: '5 colors, moderate spacing',
    emoji: '🟡',
  },
  hard: {
    colorCount: 7,
    maxAttempts: 15,
    description: '7 colors, close spacing',
    emoji: '🟠',
  },
  insane: {
    colorCount: 10,
    maxAttempts: 20,
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

// ==================== SPECTRUM MODE ====================

/**
 * Spectrum mode sorts by HSL hue (0-360°) instead of RGB value.
 * Same difficulty tiers as RGB levels.
 */
export const SPECTRUM_LEVELS_PER_DIFFICULTY = 100;

export const SPECTRUM_DIFFICULTY_CONFIG = {
  easy: {
    colorCount: 3,
    maxAttempts: 10,
    description: '3 colors, wide hue gaps',
    emoji: '🟢',
  },
  medium: {
    colorCount: 5,
    maxAttempts: 10,
    description: '5 colors, moderate hue gaps',
    emoji: '🟡',
  },
  hard: {
    colorCount: 7,
    maxAttempts: 15,
    description: '7 colors, close hues',
    emoji: '🟠',
  },
  insane: {
    colorCount: 10,
    maxAttempts: 20,
    description: '10 colors, very close hues',
    emoji: '🔴',
  },
} as const;

/**
 * Spectrum daily challenge config.
 * 5 colors within a ~60° hue arc — tight enough to be challenging,
 * wide enough that colors are visually distinct.
 */
export const SPECTRUM_DAILY_CONFIG = {
  colorCount: 5,
  maxAttempts: 5,
  hueArc: 60, // degrees of hue range
} as const;
