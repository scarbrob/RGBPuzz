/**
 * Represents an RGB color
 */
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Hashed representation of a color (no RGB values exposed)
 */
export interface ColorToken {
  id: string;
  hash: string; // Cryptographic hash for validation
  displayIndex?: number; // Optional for ordering
}

/**
 * Daily challenge data
 */
export interface DailyChallenge {
  date: string; // ISO date string
  colorTokens: ColorToken[];
  maxAttempts: number;
  seed: string; // Server-side only, not sent to client
}

/**
 * User's attempt to solve
 */
export interface SolutionAttempt {
  challengeId: string;
  orderedTokenIds: string[];
}

/**
 * Result of solution validation
 */
export interface ValidationResult {
  correct: boolean;
  correctPositions?: number[]; // Indices that are correct (like Wordle feedback)
  attemptsRemaining: number;
  solved: boolean;
}

/**
 * User statistics
 */
export interface UserStats {
  userId: string;
  dailyStreak: number;
  longestStreak: number;
  totalSolved: number;
  totalAttempts: number;
  averageAttempts: number;
  lastPlayed?: string;
}

/**
 * Level challenge (progression mode)
 */
export interface LevelChallenge {
  levelId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  colorCount: number;
  theme?: 'reds' | 'greens' | 'blues' | 'mixed';
  colorTokens: ColorToken[];
  maxAttempts: number;
}

/**
 * User progress in level mode
 */
export interface UserProgress {
  userId: string;
  completedLevels: string[];
  currentLevel: string;
  levelStats: Record<string, {
    attempts: number;
    completed: boolean;
    stars?: number; // 1-3 based on performance
  }>;
}

/**
 * Game configuration
 */
export interface GameConfig {
  dailyColorCount: number;
  maxAttempts: number;
  enableHints: boolean;
  difficultyLevels: {
    easy: { colorCount: number; maxAttempts: number };
    medium: { colorCount: number; maxAttempts: number };
    hard: { colorCount: number; maxAttempts: number };
    expert: { colorCount: number; maxAttempts: number };
  };
}
