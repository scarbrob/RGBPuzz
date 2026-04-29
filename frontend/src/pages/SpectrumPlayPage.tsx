import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ColorBoard from '../components/ColorBoard'
import Confetti from '../components/Confetti'
import GameStage from '../components/GameStage'
import LoadingSkeleton from '../components/LoadingSkeleton'
import SortingGuide from '../components/SortingGuide'
import FeedbackBanner from '../components/FeedbackBanner'
import AttemptHistory from '../components/AttemptHistory'
import { useGameState } from '../hooks/useGameState'
import { API_ENDPOINTS } from '../config/api'
import { SPECTRUM_LEVELS_PER_DIFFICULTY, SPECTRUM_DIFFICULTY_CONFIG } from '../../../shared/src/constants'

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'

export default function SpectrumPlayPage() {
  const { difficulty, level } = useParams<{ difficulty: Difficulty; level: string }>()
  const navigate = useNavigate()
  const [retryKey, setRetryKey] = useState(0)
  const [hasValidated, setHasValidated] = useState(false)

  const diffConfig = difficulty ? SPECTRUM_DIFFICULTY_CONFIG[difficulty as keyof typeof SPECTRUM_DIFFICULTY_CONFIG] : null

  const game = useGameState({
    mode: 'spectrum',
    sessionKey: `spectrum-local-${difficulty}-${level}`,
    maxAttempts: diffConfig?.maxAttempts ?? 10,
    validationBody: { difficulty, level: parseInt(level || '1') },
    winEmoji: '🌈',
    lostMessage: '😔 Out of attempts! Try again.',
    onWin: (attemptCount) => {
      const savedProgress = localStorage.getItem('spectrumLevelProgress')
      const progress = savedProgress ? JSON.parse(savedProgress) : { easy: {}, medium: {}, hard: {}, insane: {} }
      if (difficulty) progress[difficulty][parseInt(level || '1')] = true
      localStorage.setItem('spectrumLevelProgress', JSON.stringify(progress))
      const statsKey = `spectrum-stats-${difficulty}-${level}`
      const existing = localStorage.getItem(statsKey)
      if (!existing || attemptCount < parseInt(existing)) {
        localStorage.setItem(statsKey, attemptCount.toString())
      }
    },
  })

  // Validate level access
  useEffect(() => {
    if (hasValidated || !difficulty || !level) return
    const levelNum = parseInt(level)
    if (isNaN(levelNum) || levelNum < 1 || levelNum > SPECTRUM_LEVELS_PER_DIFFICULTY) {
      navigate('/spectrum'); return
    }
    if (levelNum > 1) {
      const saved = localStorage.getItem('spectrumLevelProgress')
      const prev = saved ? JSON.parse(saved)[difficulty]?.[levelNum - 1] : false
      if (!prev) { navigate('/spectrum'); return }
    }
    setHasValidated(true)
  }, [difficulty, level, hasValidated, navigate])

  // Reset on level change
  useEffect(() => {
    game.resetForRetry()
    setHasValidated(false)
  }, [difficulty, level]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch level
  useEffect(() => {
    const fetchLevel = async () => {
      if (!difficulty || !level) { game.setLoaded(); return }
      if (game.restoreSession()) {
        if (diffConfig) game.setMaxAttempts(diffConfig.maxAttempts)
        game.setLoaded()
        return
      }
      try {
        const response = await fetch(API_ENDPOINTS.getSpectrumLevel(difficulty, parseInt(level)))
        if (!response.ok) throw new Error('Failed to fetch level')
        const data = await response.json()
        game.loadFromAPI(data)
        if (diffConfig) game.setMaxAttempts(diffConfig.maxAttempts)
      } catch {
        game.setError('⚠️ Could not load this level. Please check your connection and refresh.')
      }
      game.setLoaded()
    }
    fetchLevel()
  }, [difficulty, level, retryKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const difficultyEmoji: Record<string, string> = { easy: '🟢', medium: '🟡', hard: '🟠', insane: '🔴' }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <Confetti active={game.gameState === 'won'} />
      <div className="mb-4 sm:mb-6">
        <button onClick={() => navigate('/spectrum')} className="game-button-secondary text-sm mb-3 sm:mb-4">← Back to Spectrum Levels</button>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
            🌈 {difficultyEmoji[difficulty || 'easy']} {difficulty?.charAt(0).toUpperCase()}{difficulty?.slice(1)} - Level {level}
          </h1>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Attempts: {game.attempts}/{game.maxAttempts} · <span className="text-amber-500">Sort by hue</span>
          </p>
        </div>
      </div>

      <SortingGuide variant="hue" />
      <FeedbackBanner feedback={game.feedback} gameState={game.gameState} />

      {game.isLoading ? (
        <LoadingSkeleton />
      ) : game.colors.length > 0 ? (
        <GameStage variant="spectrum">
          <ColorBoard
            colors={game.colors}
            onOrderChange={game.reorderColors}
            correctPositions={game.correctPositions}
            incorrectPositions={game.incorrectPositions}
            locked={game.gameState !== 'playing'}
          />
          <div className="mt-6 text-center">
            {game.gameState === 'playing' && (
              <button onClick={game.handleSubmit} className="game-button text-sm sm:text-base">{game.isSubmitting ? "Checking..." : "Submit Answer"}</button>
            )}
            {game.gameState === 'won' && (
              <div className="animate-pulse-thrice text-emerald-600 dark:text-emerald-400 font-bold text-lg sm:text-xl">✓ Solved!</div>
            )}
            {game.gameState === 'lost' && (
              <div className="text-red-600 dark:text-red-400 font-bold text-lg sm:text-xl">Out of attempts!</div>
            )}
            {game.gameState === 'won' && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                {parseInt(level || '0') < SPECTRUM_LEVELS_PER_DIFFICULTY && (
                  <button onClick={() => navigate(`/spectrum/${difficulty}/${parseInt(level!) + 1}`)} className="game-button text-sm sm:text-base">Next Level →</button>
                )}
                <button onClick={() => navigate('/spectrum')} className="game-button-secondary text-sm sm:text-base">Level Select</button>
              </div>
            )}
            {game.gameState === 'lost' && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => { game.resetForRetry(); setHasValidated(false); setRetryKey(k => k + 1) }} className="game-button text-sm sm:text-base">🔄 Retry Level</button>
                <button onClick={() => navigate('/spectrum')} className="game-button-secondary text-sm sm:text-base">Level Select</button>
              </div>
            )}
          </div>
        </GameStage>
      ) : game.gameState === 'error' ? (
        <div className="mb-6 p-4 rounded-xl text-center font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/50">{game.feedback}</div>
      ) : null}

      <AttemptHistory history={game.attemptHistory} />
    </div>
  )
}
