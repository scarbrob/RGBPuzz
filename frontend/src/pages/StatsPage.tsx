import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SignInModal from '../components/SignInModal'
import { API_ENDPOINTS } from '../config/api'

interface UserStats {
  // Daily Challenge Stats
  dailyStreak: number
  longestStreak: number
  dailyWinRate: number
  totalDailyPlayed: number
  totalDailyWins: number
  averageDailyAttempts: number
  fastestDailyTime?: number
  
  // Level Stats
  totalLevelsAttempted: number
  totalLevelsSolved: number
  levelSolveRate: number
  averageLevelAttempts: number
  totalLevelAttempts: number
  
  // Per-difficulty stats
  easySolved: number
  easyAttempted: number
  easyTotalAttempts: number
  easyFastestTime?: number
  mediumSolved: number
  mediumAttempted: number
  mediumTotalAttempts: number
  mediumFastestTime?: number
  hardSolved: number
  hardAttempted: number
  hardTotalAttempts: number
  hardFastestTime?: number
  insaneSolved: number
  insaneAttempted: number
  insaneTotalAttempts: number
  insaneFastestTime?: number
}

export default function StatsPage() {
  const { user } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch(
        API_ENDPOINTS.getUserStats(user.id, user.email),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
      // Set empty stats on error
      setStats({
        dailyStreak: 0,
        longestStreak: 0,
        dailyWinRate: 0,
        totalDailyPlayed: 0,
        totalDailyWins: 0,
        averageDailyAttempts: 0,
        totalLevelsAttempted: 0,
        totalLevelsSolved: 0,
        levelSolveRate: 0,
        averageLevelAttempts: 0,
        totalLevelAttempts: 0,
        easySolved: 0,
        easyAttempted: 0,
        easyTotalAttempts: 0,
        mediumSolved: 0,
        mediumAttempted: 0,
        mediumTotalAttempts: 0,
        hardSolved: 0,
        hardAttempted: 0,
        hardTotalAttempts: 0,
        insaneSolved: 0,
        insaneAttempted: 0,
        insaneTotalAttempts: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
  }

  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2 mb-4">
              Statistics
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Sign in to track your progress, view your statistics, and compete with friends!
            </p>
            <button
              onClick={() => setShowSignIn(true)}
              className="game-button"
            >
              Sign In to View Stats
            </button>
          </div>
        </div>
        <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
      </>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-2xl text-light-text-secondary dark:text-dark-text-secondary">
          Loading your statistics...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2 mb-6 sm:mb-8 text-center">
        Your Statistics
      </h1>

      {/* Daily Challenge Stats */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-text-primary dark:text-dark-text-primary">
          📅 Daily Challenge
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 border-2 border-orange-500/30">
            <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">
              🔥 {stats.dailyStreak}
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Current Streak</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 border-2 border-yellow-500/30">
            <div className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2">
              ⭐ {stats.longestStreak}
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Longest Streak</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 border-2 border-green-500/30">
            <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-1 sm:mb-2">
              {stats.dailyWinRate.toFixed(1)}%
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.totalDailyPlayed}
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Games Played</div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.totalDailyWins}
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Games Won</div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.averageDailyAttempts.toFixed(1)}
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Avg Attempts</div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.fastestDailyTime ? `⚡ ${formatTime(stats.fastestDailyTime)}` : '-'}
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Fastest Time</div>
          </div>
        </div>
      </div>

      {/* Level Stats */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-text-primary dark:text-dark-text-primary">
          🎮 Level Mode
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.totalLevelsSolved}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Levels Solved</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.totalLevelsAttempted}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Levels Attempted</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.levelSolveRate.toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Percent Complete</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.averageLevelAttempts.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Avg Attempts</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.totalLevelAttempts}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Total Attempts</div>
          </div>
        </div>

        {/* Per-Difficulty Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-green-500/10 dark:bg-green-500/5 border-2 border-green-500/30">
            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mb-2 sm:mb-3">Easy</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.easySolved}/100 ({stats.easySolved}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.easyTotalAttempts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.easySolved > 0 ? (stats.easyTotalAttempts / stats.easySolved).toFixed(1) : '0.0'}
                </span>
              </div>
              {stats.easyFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ {formatTime(stats.easyFastestTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-yellow-500/10 dark:bg-yellow-500/5 border-2 border-yellow-500/30">
            <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">Medium</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.mediumSolved}/100 ({stats.mediumSolved}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.mediumTotalAttempts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.mediumSolved > 0 ? (stats.mediumTotalAttempts / stats.mediumSolved).toFixed(1) : '0.0'}
                </span>
              </div>
              {stats.mediumFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ {formatTime(stats.mediumFastestTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-orange-500/10 dark:bg-orange-500/5 border-2 border-orange-500/30">
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3">Hard</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.hardSolved}/100 ({stats.hardSolved}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.hardTotalAttempts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.hardSolved > 0 ? (stats.hardTotalAttempts / stats.hardSolved).toFixed(1) : '0.0'}
                </span>
              </div>
              {stats.hardFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ {formatTime(stats.hardFastestTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border-2 border-red-500/30">
            <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">Insane</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.insaneSolved}/100 ({stats.insaneSolved}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.insaneTotalAttempts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {stats.insaneSolved > 0 ? (stats.insaneTotalAttempts / stats.insaneSolved).toFixed(1) : '0.0'}
                </span>
              </div>
              {stats.insaneFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ {formatTime(stats.insaneFastestTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
