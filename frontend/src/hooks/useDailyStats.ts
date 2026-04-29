import { useCallback } from 'react'
import { getUTCDate, getUTCYesterday } from '../types/game'

interface DailyStatsData {
  totalPlayed: number
  totalWins: number
  totalAttempts: number
  currentStreak: number
  longestStreak: number
  fastestTime: number | null
  lastPlayedDate: string | null
}

const DEFAULT_STATS: DailyStatsData = {
  totalPlayed: 0,
  totalWins: 0,
  totalAttempts: 0,
  currentStreak: 0,
  longestStreak: 0,
  fastestTime: null,
  lastPlayedDate: null,
}

/**
 * Hook for saving daily challenge stats (works for both RGB and Spectrum dailies).
 * @param storageKey - localStorage key (e.g. 'rgbpuzz-daily-stats' or 'rgbpuzz-spectrum-daily-stats')
 */
export function useDailyStats(storageKey: string) {
  const saveStats = useCallback((won: boolean, attemptCount: number, solveTime?: number) => {
    const today = getUTCDate()
    const raw = localStorage.getItem(storageKey)
    const stats: DailyStatsData = raw ? JSON.parse(raw) : { ...DEFAULT_STATS }

    // Prevent double-counting
    if (stats.lastPlayedDate === today) return

    stats.totalPlayed++
    stats.totalAttempts += attemptCount

    if (won) {
      stats.totalWins++
      if (solveTime !== undefined && (stats.fastestTime === null || solveTime < stats.fastestTime)) {
        stats.fastestTime = solveTime
      }
    }

    // Update streak
    const yesterdayStr = getUTCYesterday()
    if (won) {
      if (stats.lastPlayedDate === yesterdayStr || stats.lastPlayedDate === null) {
        stats.currentStreak++
      } else if (stats.lastPlayedDate !== today) {
        stats.currentStreak = 1
      }
    } else {
      stats.currentStreak = 0
    }

    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak
    }

    stats.lastPlayedDate = today
    localStorage.setItem(storageKey, JSON.stringify(stats))
  }, [storageKey])

  return { saveStats }
}
