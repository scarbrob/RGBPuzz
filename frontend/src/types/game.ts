/**
 * Shared frontend types for game state management
 */

export interface ColorItem {
  id: string
  hex: string
  encrypted: string
}

export interface AttemptRecord {
  colors: ColorItem[]
  correctPositions: number[]
  incorrectPositions: number[]
}

export type GameState = 'playing' | 'won' | 'lost' | 'error'

export type GameMode = 'daily' | 'level' | 'spectrum' | 'spectrum-daily'

/**
 * Get today's date in UTC (YYYY-MM-DD)
 */
export function getUTCDate(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

/**
 * Get UTC yesterday string
 */
export function getUTCYesterday(): string {
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  return `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`
}
