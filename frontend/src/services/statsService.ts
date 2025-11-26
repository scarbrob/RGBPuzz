/**
 * Statistics API service
 * Handles communication with backend for user statistics
 */

import { createAuthHeaders } from '../utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api'

export interface UpdateDailyStatsParams {
  userId: string
  date: string
  attempts: number
  solved: boolean
  solveTime?: number
}

export interface UpdateLevelStatsParams {
  userId: string
  difficulty: 'easy' | 'medium' | 'hard' | 'insane'
  level: number
  attempts: number
  solved: boolean
  solveTime?: number
}

/**
 * Initialize user stats (create user record if doesn't exist)
 */
export async function initializeUserStats(userId: string, email: string, displayName?: string): Promise<void> {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/user/stats?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}&displayName=${encodeURIComponent(displayName || '')}`,
      {
        method: 'GET',
        headers,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to initialize user stats:', response.status, errorText)
      throw new Error(`Failed to initialize user stats: ${response.statusText}`)
    }

    const stats = await response.json()
    console.log('User stats initialized:', stats)
  } catch (error) {
    console.error('Error initializing user stats:', error)
    throw error
  }
}

/**
 * Update daily challenge statistics
 */
export async function updateDailyStats(params: UpdateDailyStatsParams): Promise<void> {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/daily-stats`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Failed to update daily stats: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error updating daily stats:', error)
    throw error
  }
}

/**
 * Update level statistics
 */
export async function updateLevelStats(params: UpdateLevelStatsParams): Promise<void> {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/level-stats`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Failed to update level stats: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error updating level stats:', error)
    throw error
  }
}

export interface LevelProgress {
  [level: number]: {
    solved: boolean
    attempts: number
    bestTime?: number
  }
}

/**
 * Get user's level progress for a difficulty
 */
export async function getLevelProgress(
  userId: string,
  difficulty: 'easy' | 'medium' | 'hard' | 'insane'
): Promise<LevelProgress> {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/user/level-progress?userId=${userId}&difficulty=${difficulty}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to get level progress: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting level progress:', error)
    throw error
  }
}

/**
 * Get user statistics (fastest times, etc.)
 */
export async function getUserStats(userId: string, email: string): Promise<any> {
  try {
    const headers = await createAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/user/stats?userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get user stats: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}
