// User statistics types
export interface UserStats {
  // Daily Challenge Stats
  dailyStreak: number
  longestStreak: number
  dailyWinRate: number
  totalDailyPlayed: number
  totalDailyWins: number
  averageDailyAttempts: number
  lastDailyPlayed: string // YYYY-MM-DD
  
  // Level Stats
  totalLevelsAttempted: number
  totalLevelsSolved: number
  levelSolveRate: number
  averageLevelAttempts: number
  totalLevelAttempts: number
  fastestSolveTime?: number // milliseconds
  
  // Per-difficulty stats
  easySolved: number
  easyAttempted: number
  mediumSolved: number
  mediumAttempted: number
  hardSolved: number
  hardAttempted: number
  insaneSolved: number
  insaneAttempted: number
}

export interface DailyAttempt {
  date: string // YYYY-MM-DD
  attempts: number
  solved: boolean
  solveTime?: number // milliseconds
  timestamp: Date
}

export interface LevelProgress {
  difficulty: 'easy' | 'medium' | 'hard' | 'insane'
  level: number
  attempts: number
  solved: boolean
  bestTime?: number // milliseconds
  firstAttemptDate: Date
  lastAttemptDate: Date
  solvedDate?: Date
}
