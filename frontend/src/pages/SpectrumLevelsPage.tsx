import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SPECTRUM_DIFFICULTY_CONFIG, SPECTRUM_LEVELS_PER_DIFFICULTY, Difficulty } from '../../../shared/src/constants'

interface DifficultyInfo {
  name: string
  colors: number
  description: string
  emoji: string
}

const difficultyConfig: Record<Difficulty, DifficultyInfo> = {
  easy: {
    name: 'Easy',
    colors: SPECTRUM_DIFFICULTY_CONFIG.easy.colorCount,
    description: SPECTRUM_DIFFICULTY_CONFIG.easy.description,
    emoji: SPECTRUM_DIFFICULTY_CONFIG.easy.emoji
  },
  medium: {
    name: 'Medium',
    colors: SPECTRUM_DIFFICULTY_CONFIG.medium.colorCount,
    description: SPECTRUM_DIFFICULTY_CONFIG.medium.description,
    emoji: SPECTRUM_DIFFICULTY_CONFIG.medium.emoji
  },
  hard: {
    name: 'Hard',
    colors: SPECTRUM_DIFFICULTY_CONFIG.hard.colorCount,
    description: SPECTRUM_DIFFICULTY_CONFIG.hard.description,
    emoji: SPECTRUM_DIFFICULTY_CONFIG.hard.emoji
  },
  insane: {
    name: 'Insane',
    colors: SPECTRUM_DIFFICULTY_CONFIG.insane.colorCount,
    description: SPECTRUM_DIFFICULTY_CONFIG.insane.description,
    emoji: SPECTRUM_DIFFICULTY_CONFIG.insane.emoji
  }
}

const loadProgress = (difficulty: Difficulty): { [level: number]: boolean } => {
  const saved = localStorage.getItem('spectrumLevelProgress')
  if (saved) {
    try {
      const allProgress = JSON.parse(saved)
      return allProgress[difficulty] || {}
    } catch {
      return {}
    }
  }
  return {}
}

export default function SpectrumLevelsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const [progress, setProgress] = useState<{ [level: number]: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    const difficultyProgress = loadProgress(selectedDifficulty)
    setProgress(difficultyProgress)
    setLoading(false)
  }, [selectedDifficulty, refreshKey])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) setRefreshKey(prev => prev + 1)
    }
    const handleFocus = () => setRefreshKey(prev => prev + 1)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const levels = Array.from({ length: SPECTRUM_LEVELS_PER_DIFFICULTY }, (_, i) => {
    const level = i + 1
    const completed = progress[level] || false
    const previousCompleted = level === 1 ? true : progress[level - 1] || false
    return { level, difficulty: selectedDifficulty, completed, locked: !previousCompleted }
  })

  const handleLevelClick = (level: number, locked: boolean) => {
    if (locked) return
    navigate(`/spectrum/${selectedDifficulty}/${level}`)
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in px-4">
      <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 dark:from-rose-400 dark:via-amber-400 dark:to-cyan-400 bg-clip-text text-transparent pb-2">
          🌈 Spectrum Mode
        </h1>
        <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary mt-2">
          Sort colors by hue — follow the rainbow!
        </p>
      </div>

      {/* Spectrum Daily Banner */}
      <Link
        to="/spectrum/daily"
        className="block mb-6 sm:mb-8 p-4 sm:p-5 glass-card hover:shadow-glow-md hover:scale-[1.01] transition-all border-amber-400/30 hover:border-amber-400/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
              🌈 Spectrum Daily Challenge
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              5 similar hues, 5 attempts — new puzzle every day!
            </p>
          </div>
          <span className="text-2xl">→</span>
        </div>
      </Link>

      {/* Difficulty Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {(Object.keys(difficultyConfig) as Difficulty[]).map((difficulty) => {
          const config = difficultyConfig[difficulty]
          const isSelected = selectedDifficulty === difficulty

          return (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`p-4 sm:p-6 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-br from-rose-500 via-amber-500 to-cyan-500 text-white scale-105 shadow-lg'
                  : 'glass-card hover:scale-105'
              }`}
            >
              <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{config.emoji}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">{config.name}</h3>
              <p className="text-xs sm:text-sm opacity-90">{config.colors} colors</p>
              <p className="text-xs opacity-75 mt-1 hidden sm:block">{config.description}</p>
            </button>
          )
        })}
      </div>

      {/* Level Grid */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-light-border via-light-accent/10 to-light-border dark:from-dark-border dark:via-dark-accent/10 dark:to-dark-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
          {levels.map((level) => (
            <button
              key={level.level}
              onClick={() => handleLevelClick(level.level, level.locked)}
              disabled={level.locked}
              className={`aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all flex flex-col items-center justify-center relative ${
                level.locked
                  ? 'bg-light-border/30 dark:bg-dark-border/30 opacity-40 cursor-not-allowed'
                  : level.completed
                  ? 'bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-cyan-500/20 hover:scale-110 hover:shadow-glow-sm'
                  : 'stat-card hover:scale-110 hover:-rotate-2 hover:shadow-glow-sm hover:border-amber-400/40'
              }`}
            >
              {level.locked && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-light-text-secondary dark:text-dark-text-secondary absolute top-0.5 right-0.5 sm:top-1 sm:right-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
              <div className={`text-sm sm:text-base md:text-lg font-bold ${level.completed ? 'text-amber-500' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                {level.level}
              </div>
              {level.completed && (
                <div className="text-base sm:text-lg md:text-xl mt-0.5 sm:mt-1 text-emerald-500 animate-bounce-once">✓</div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 sm:mt-8 text-center text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base">
        <p>Sort colors by where they appear on the rainbow — red → orange → yellow → green → blue → purple!</p>
        <p className="text-xs sm:text-sm mt-2">Hue gaps get tighter as you advance through levels.</p>
      </div>
    </div>
  )
}
