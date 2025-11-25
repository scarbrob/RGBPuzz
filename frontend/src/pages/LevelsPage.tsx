import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'

interface DifficultyInfo {
  name: string
  colors: number
  description: string
  emoji: string
}

type ProgressData = {
  [key in Difficulty]: {
    [level: number]: boolean
  }
}

const difficultyConfig: Record<Difficulty, DifficultyInfo> = {
  easy: {
    name: 'Easy',
    colors: 3,
    description: '3 colors, widely spaced',
    emoji: '🟢'
  },
  medium: {
    name: 'Medium',
    colors: 5,
    description: '5 colors, moderate spacing',
    emoji: '🟡'
  },
  hard: {
    name: 'Hard',
    colors: 7,
    description: '7 colors, close spacing',
    emoji: '🟠'
  },
  insane: {
    name: 'Insane',
    colors: 9,
    description: '9 colors, very close spacing',
    emoji: '🔴'
  }
}

// Load progress from localStorage
const loadProgress = (): ProgressData => {
  const saved = localStorage.getItem('levelProgress')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return { easy: {}, medium: {}, hard: {}, insane: {} }
    }
  }
  return { easy: {}, medium: {}, hard: {}, insane: {} }
}

export default function LevelsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const [progress] = useState<ProgressData>(loadProgress())
  const navigate = useNavigate()
  
  // Generate 100 levels for the selected difficulty
  const levels = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1
    const completed = progress[selectedDifficulty][level] || false
    const previousCompleted = level === 1 ? true : progress[selectedDifficulty][level - 1] || false
    
    return {
      level,
      difficulty: selectedDifficulty,
      completed,
      locked: !previousCompleted
    }
  })

  const handleLevelClick = (level: number, locked: boolean) => {
    if (locked) return
    
    // Navigate to level play page (to be implemented)
    navigate(`/level/${selectedDifficulty}/${level}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2 mb-8 mt-8 text-center">
        Level Progression
      </h1>

      {/* Difficulty Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(Object.keys(difficultyConfig) as Difficulty[]).map((difficulty) => {
          const config = difficultyConfig[difficulty]
          const isSelected = selectedDifficulty === difficulty
          
          return (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`p-6 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-light-accent dark:bg-dark-accent text-white scale-105'
                  : 'bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30'
              }`}
            >
              <div className="text-4xl mb-2">{config.emoji}</div>
              <h3 className="text-xl font-bold mb-1">{config.name}</h3>
              <p className="text-sm opacity-90">{config.colors} colors</p>
              <p className="text-xs opacity-75 mt-1">{config.description}</p>
            </button>
          )
        })}
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
        {levels.map((level) => (
          <button
            key={level.level}
            onClick={() => handleLevelClick(level.level, level.locked)}
            disabled={level.locked}
            className={`aspect-square p-2 rounded-xl transition-all flex flex-col items-center justify-center relative ${
              level.locked
                ? 'bg-light-surface/10 dark:bg-dark-surface/10 opacity-40 cursor-not-allowed'
                : level.completed
                ? 'bg-light-accent/20 dark:bg-dark-accent/20 hover:bg-light-accent/30 dark:hover:bg-dark-accent/30 hover:scale-110'
                : 'bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 hover:scale-110'
            }`}
          >
            {level.locked && (
              <svg className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary absolute top-1 right-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
            <div className={`text-lg font-bold ${level.completed ? 'text-light-accent dark:text-dark-accent' : 'text-light-text dark:text-dark-text'}`}>
              {level.level}
            </div>
            {level.completed && (
              <div className="text-xl mt-1 text-green-500">✓</div>
            )}
          </button>
        ))}
      </div>

      {/* Info Text */}
      <div className="mt-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
        <p>Complete all 100 levels in each difficulty to master the game!</p>
        <p className="text-sm mt-2">Colors get progressively closer together as you advance through levels.</p>
      </div>
    </div>
  )
}
