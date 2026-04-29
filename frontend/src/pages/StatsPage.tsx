import { useState, useEffect } from 'react'
import AnimatedNumber from '../components/AnimatedNumber'
import { LEVELS_PER_DIFFICULTY, SPECTRUM_LEVELS_PER_DIFFICULTY } from '../../../shared/src/constants'

interface DailyStats {
  streak: number
  longestStreak: number
  winRate: number
  played: number
  wins: number
  avgAttempts: number
  fastestTime?: number
}

interface DifficultyStats {
  solved: number
  attempted: number
  totalAttempts: number
}

interface ModeStats {
  totalSolved: number
  totalAttempted: number
  totalAttempts: number
  solveRate: number
  avgAttempts: number
  byDifficulty: Record<string, DifficultyStats>
}

function loadDailyStats(key: string): DailyStats {
  const raw = localStorage.getItem(key)
  if (!raw) return { streak: 0, longestStreak: 0, winRate: 0, played: 0, wins: 0, avgAttempts: 0 }
  try {
    const p = JSON.parse(raw)
    const played = p.totalPlayed || 0
    const wins = p.totalWins || 0
    return {
      streak: p.currentStreak || 0,
      longestStreak: p.longestStreak || 0,
      winRate: played > 0 ? (wins / played) * 100 : 0,
      played,
      wins,
      avgAttempts: played > 0 && p.totalAttempts ? p.totalAttempts / played : 0,
      fastestTime: p.fastestTime || undefined,
    }
  } catch { return { streak: 0, longestStreak: 0, winRate: 0, played: 0, wins: 0, avgAttempts: 0 } }
}

function loadLevelStats(progressKey: string, statsPrefix: string, levelsPerDiff: number): ModeStats {
  const difficulties = ['easy', 'medium', 'hard', 'insane']
  const byDifficulty: Record<string, DifficultyStats> = {}
  let totalSolved = 0, totalAttempted = 0, totalAttempts = 0

  const saved = localStorage.getItem(progressKey)
  const progress = saved ? JSON.parse(saved) : {}

  for (const diff of difficulties) {
    const diffProgress = progress[diff] || {}
    let solved = 0, attempted = 0, attempts = 0

    for (let level = 1; level <= levelsPerDiff; level++) {
      const count = localStorage.getItem(`${statsPrefix}-${diff}-${level}`)
      if (diffProgress[level]) {
        solved++; attempted++
        attempts += count ? parseInt(count) : 1
      } else if (count) {
        attempted++
        attempts += parseInt(count)
      }
    }

    byDifficulty[diff] = { solved, attempted, totalAttempts: attempts }
    totalSolved += solved
    totalAttempted += attempted
    totalAttempts += attempts
  }

  return {
    totalSolved, totalAttempted, totalAttempts,
    solveRate: (totalSolved / (levelsPerDiff * 4)) * 100,
    avgAttempts: totalSolved > 0 ? totalAttempts / totalSolved : 0,
    byDifficulty,
  }
}

const DIFF_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  easy: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/5', border: 'border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400' },
  medium: { bg: 'bg-yellow-500/10 dark:bg-yellow-500/5', border: 'border-yellow-500/30', text: 'text-yellow-600 dark:text-yellow-400' },
  hard: { bg: 'bg-orange-500/10 dark:bg-orange-500/5', border: 'border-orange-500/30', text: 'text-orange-600 dark:text-orange-400' },
  insane: { bg: 'bg-red-500/10 dark:bg-red-500/5', border: 'border-red-500/30', text: 'text-red-600 dark:text-red-400' },
}

function DifficultyCard({ name, stats }: { name: string; stats: DifficultyStats }) {
  const colors = DIFF_COLORS[name]
  return (
    <div className={`p-4 sm:p-5 rounded-2xl ${colors.bg} border-2 ${colors.border}`}>
      <div className={`text-lg font-bold ${colors.text} mb-3 capitalize`}>{name}</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-light-text-secondary dark:text-dark-text-secondary">Complete:</span>
          <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            <AnimatedNumber value={stats.solved} />/100
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
          <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            <AnimatedNumber value={stats.totalAttempts} />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-light-text-secondary dark:text-dark-text-secondary">Avg:</span>
          <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
            <AnimatedNumber value={stats.solved > 0 ? stats.totalAttempts / stats.solved : 0} decimals={1} />
          </span>
        </div>
      </div>
    </div>
  )
}

function DailySection({ title, gradient, accentColor, stats }: {
  title: string; gradient: string; accentColor: string; stats: DailyStats
}) {
  return (
    <div className="mb-10 sm:mb-14">
      <h2 className={`text-xl sm:text-2xl font-bold mb-5 text-light-text-primary dark:text-dark-text-primary bg-gradient-to-r ${gradient} bg-clip-text text-transparent inline-block`}>
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div className="stat-card border-2 border-orange-500/30">
          <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-1">🔥 <AnimatedNumber value={stats.streak} /></div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Current Streak</div>
        </div>
        <div className="stat-card border-2 border-yellow-500/30">
          <div className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-1">⭐ <AnimatedNumber value={stats.longestStreak} /></div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Longest Streak</div>
        </div>
        <div className="stat-card border-2 border-emerald-500/30">
          <div className="text-3xl sm:text-4xl font-bold text-emerald-500 mb-1"><AnimatedNumber value={stats.winRate} decimals={1} suffix="%" /></div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Win Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Played', value: stats.played },
          { label: 'Won', value: stats.wins },
          { label: 'Avg Attempts', value: stats.avgAttempts, decimals: 1 },
          { label: 'Fastest', value: stats.fastestTime, isTime: true },
        ].map((item, i) => (
          <div key={i} className="stat-card">
            <div className={`text-2xl sm:text-3xl font-bold ${accentColor} mb-1`}>
              {item.isTime ? (item.value ? <><AnimatedNumber value={item.value as number} isTime /></> : '-') :
                <AnimatedNumber value={item.value as number} decimals={item.decimals} />}
            </div>
            <div className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LevelSection({ title, gradient, accentColor, stats }: {
  title: string; gradient: string; accentColor: string; stats: ModeStats
}) {
  return (
    <div className="mb-10 sm:mb-14">
      <h2 className={`text-xl sm:text-2xl font-bold mb-5 text-light-text-primary dark:text-dark-text-primary bg-gradient-to-r ${gradient} bg-clip-text text-transparent inline-block`}>
        {title}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Solved', value: stats.totalSolved },
          { label: 'Attempted', value: stats.totalAttempted },
          { label: 'Complete', value: stats.solveRate, decimals: 1, suffix: '%' },
          { label: 'Avg Attempts', value: stats.avgAttempts, decimals: 1 },
          { label: 'Total Attempts', value: stats.totalAttempts },
        ].map((item, i) => (
          <div key={i} className={`stat-card ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
            <div className={`text-2xl sm:text-3xl font-bold ${accentColor} mb-1`}>
              <AnimatedNumber value={item.value} decimals={item.decimals} suffix={item.suffix} />
            </div>
            <div className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {['easy', 'medium', 'hard', 'insane'].map(diff => (
          <DifficultyCard key={diff} name={diff} stats={stats.byDifficulty[diff]} />
        ))}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [loaded, setLoaded] = useState(false)
  const [rgbDaily, setRgbDaily] = useState<DailyStats | null>(null)
  const [spectrumDaily, setSpectrumDaily] = useState<DailyStats | null>(null)
  const [rgbLevels, setRgbLevels] = useState<ModeStats | null>(null)
  const [spectrumLevels, setSpectrumLevels] = useState<ModeStats | null>(null)

  useEffect(() => {
    setRgbDaily(loadDailyStats('rgbpuzz-daily-stats'))
    setSpectrumDaily(loadDailyStats('rgbpuzz-spectrum-daily-stats'))
    setRgbLevels(loadLevelStats('levelProgress', 'level-stats', LEVELS_PER_DIFFICULTY))
    setSpectrumLevels(loadLevelStats('spectrumLevelProgress', 'spectrum-stats', SPECTRUM_LEVELS_PER_DIFFICULTY))
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-xl text-light-text-secondary dark:text-dark-text-secondary">Loading statistics...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent pb-2 mb-8 sm:mb-10 text-center">
        Your Statistics
      </h1>

      {rgbDaily && (
        <DailySection
          title="📅 RGB Daily Challenge"
          gradient="from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400"
          accentColor="text-light-accent dark:text-dark-accent"
          stats={rgbDaily}
        />
      )}

      {spectrumDaily && (
        <DailySection
          title="🌈 Spectrum Daily Challenge"
          gradient="from-rose-500 via-amber-500 to-cyan-500 dark:from-rose-400 dark:via-amber-400 dark:to-cyan-400"
          accentColor="text-amber-500 dark:text-amber-400"
          stats={spectrumDaily}
        />
      )}

      {rgbLevels && (
        <LevelSection
          title="⚡ RGB Levels"
          gradient="from-fuchsia-500 to-pink-500 dark:from-fuchsia-400 dark:to-pink-400"
          accentColor="text-light-accent dark:text-dark-accent"
          stats={rgbLevels}
        />
      )}

      {spectrumLevels && (
        <LevelSection
          title="🌈 Spectrum Levels"
          gradient="from-rose-500 via-amber-500 to-cyan-500 dark:from-rose-400 dark:via-amber-400 dark:to-cyan-400"
          accentColor="text-amber-500 dark:text-amber-400"
          stats={spectrumLevels}
        />
      )}
    </div>
  )
}
