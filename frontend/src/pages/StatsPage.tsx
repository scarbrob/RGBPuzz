import { useState, useEffect } from 'react'
import AnimatedNumber from '../components/AnimatedNumber'
import { LEVELS_PER_DIFFICULTY } from '../../../shared/src/constants'

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

function loadLocalStats(): UserStats {
  const stats: UserStats = {
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
  }

  // Load level progress from localStorage
  const savedProgress = localStorage.getItem('levelProgress')
  if (savedProgress) {
    try {
      const progress = JSON.parse(savedProgress)
      const difficulties = ['easy', 'medium', 'hard', 'insane'] as const

      for (const diff of difficulties) {
        const diffProgress = progress[diff] || {}
        let solved = 0
        let attempted = 0
        let totalAttempts = 0

        for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
          const statsKey = `level-stats-${diff}-${level}`
          const attemptCount = localStorage.getItem(statsKey)

          if (diffProgress[level]) {
            solved++
            attempted++
            totalAttempts += attemptCount ? parseInt(attemptCount) : 1
          } else if (attemptCount) {
            attempted++
            totalAttempts += parseInt(attemptCount)
          }
        }

        switch (diff) {
          case 'easy':
            stats.easySolved = solved; stats.easyAttempted = attempted; stats.easyTotalAttempts = totalAttempts; break
          case 'medium':
            stats.mediumSolved = solved; stats.mediumAttempted = attempted; stats.mediumTotalAttempts = totalAttempts; break
          case 'hard':
            stats.hardSolved = solved; stats.hardAttempted = attempted; stats.hardTotalAttempts = totalAttempts; break
          case 'insane':
            stats.insaneSolved = solved; stats.insaneAttempted = attempted; stats.insaneTotalAttempts = totalAttempts; break
        }

        stats.totalLevelsSolved += solved
        stats.totalLevelsAttempted += attempted
        stats.totalLevelAttempts += totalAttempts
      }

      if (stats.totalLevelsAttempted > 0) {
        stats.levelSolveRate = (stats.totalLevelsSolved / (LEVELS_PER_DIFFICULTY * 4)) * 100
        stats.averageLevelAttempts = stats.totalLevelAttempts / stats.totalLevelsSolved || 0
      }
    } catch {
      // ignore parse errors
    }
  }

  // Load daily stats from localStorage
  const dailyStats = localStorage.getItem('rgbpuzz-daily-stats')
  if (dailyStats) {
    try {
      const parsed = JSON.parse(dailyStats)
      stats.totalDailyPlayed = parsed.totalPlayed || 0
      stats.totalDailyWins = parsed.totalWins || 0
      stats.dailyStreak = parsed.currentStreak || 0
      stats.longestStreak = parsed.longestStreak || 0
      stats.averageDailyAttempts = parsed.totalAttempts && parsed.totalPlayed
        ? parsed.totalAttempts / parsed.totalPlayed
        : 0
      stats.fastestDailyTime = parsed.fastestTime || undefined
      stats.dailyWinRate = stats.totalDailyPlayed > 0
        ? (stats.totalDailyWins / stats.totalDailyPlayed) * 100
        : 0
    } catch {
      // ignore parse errors
    }
  }

  return stats
}

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    setStats(loadLocalStats())
  }, [])

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-2xl text-light-text-secondary dark:text-dark-text-secondary">
          Loading your statistics...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in px-4">
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
              🔥 <AnimatedNumber value={stats.dailyStreak} />
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Current Streak</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 border-2 border-yellow-500/30">
            <div className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2">
              ⭐ <AnimatedNumber value={stats.longestStreak} />
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Longest Streak</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 border-2 border-green-500/30">
            <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-1 sm:mb-2">
              <AnimatedNumber value={stats.dailyWinRate} decimals={1} suffix="%" />
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.totalDailyPlayed} />
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Games Played</div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.totalDailyWins} />
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Games Won</div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.averageDailyAttempts} decimals={1} />
            </div>
            <div className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">Avg Attempts</div>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              {stats.fastestDailyTime ? (
                <>⚡ <AnimatedNumber value={stats.fastestDailyTime} isTime={true} /></>
              ) : '-'}
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
              <AnimatedNumber value={stats.totalLevelsSolved} />
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Levels Solved</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.totalLevelsAttempted} />
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Levels Attempted</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.levelSolveRate} decimals={1} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Percent Complete</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.averageLevelAttempts} decimals={1} />
            </div>
            <div className="text-xs sm:text-sm md:text-base text-light-text-secondary dark:text-dark-text-secondary">Avg Attempts</div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
            <div className="text-2xl sm:text-3xl font-bold text-light-accent dark:text-dark-accent mb-1 sm:mb-2">
              <AnimatedNumber value={stats.totalLevelAttempts} />
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
                  <AnimatedNumber value={stats.easySolved} />/100 (<AnimatedNumber value={stats.easySolved} />%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.easyTotalAttempts} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.easySolved > 0 ? stats.easyTotalAttempts / stats.easySolved : 0} decimals={1} />
                </span>
              </div>
              {stats.easyFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ <AnimatedNumber value={stats.easyFastestTime} isTime={true} />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-yellow-500/10 dark:bg-yellow-500/5 border-2 border-yellow-500/30">
            <div className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2 sm:mb-3">Medium</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.mediumSolved} />/100 (<AnimatedNumber value={stats.mediumSolved} />%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.mediumTotalAttempts} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.mediumSolved > 0 ? stats.mediumTotalAttempts / stats.mediumSolved : 0} decimals={1} />
                </span>
              </div>
              {stats.mediumFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ <AnimatedNumber value={stats.mediumFastestTime} isTime={true} />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-orange-500/10 dark:bg-orange-500/5 border-2 border-orange-500/30">
            <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mb-2 sm:mb-3">Hard</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.hardSolved} />/100 (<AnimatedNumber value={stats.hardSolved} />%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.hardTotalAttempts} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.hardSolved > 0 ? stats.hardTotalAttempts / stats.hardSolved : 0} decimals={1} />
                </span>
              </div>
              {stats.hardFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ <AnimatedNumber value={stats.hardFastestTime} isTime={true} />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border-2 border-red-500/30">
            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-2 sm:mb-3">Insane</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.insaneSolved} />/100 (<AnimatedNumber value={stats.insaneSolved} />%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.insaneTotalAttempts} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  <AnimatedNumber value={stats.insaneSolved > 0 ? stats.insaneTotalAttempts / stats.insaneSolved : 0} decimals={1} />
                </span>
              </div>
              {stats.insaneFastestTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-light-text-secondary dark:text-dark-text-secondary">Fastest:</span>
                  <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                    ⚡ <AnimatedNumber value={stats.insaneFastestTime} isTime={true} />
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
