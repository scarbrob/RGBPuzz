import { useEffect, useState } from 'react'
import ColorBoard from '../components/ColorBoard'
import Confetti from '../components/Confetti'
import GameStage from '../components/GameStage'
import LoadingSkeleton from '../components/LoadingSkeleton'
import SortingGuide from '../components/SortingGuide'
import FeedbackBanner from '../components/FeedbackBanner'
import ShareResult from '../components/ShareResult'
import AttemptHistory from '../components/AttemptHistory'
import { useGameState } from '../hooks/useGameState'
import { useDailyStats } from '../hooks/useDailyStats'
import { API_ENDPOINTS } from '../config/api'
import { getUTCDate } from '../types/game'
import { SPECTRUM_DAILY_CONFIG } from '../../../shared/src/constants'

export default function SpectrumDailyPage() {
  const today = getUTCDate()
  const { saveStats } = useDailyStats('rgbpuzz-spectrum-daily-stats')
  const [challengeDate, setChallengeDate] = useState(today)

  const game = useGameState({
    mode: 'spectrum-daily',
    sessionKey: `rgbpuzz-spectrum-daily-${today}`,
    maxAttempts: SPECTRUM_DAILY_CONFIG.maxAttempts,
    validationBody: { date: challengeDate },
    winEmoji: '🌈',
    onWin: (count, solveTime) => saveStats(true, count, solveTime),
    onLose: (count, solveTime) => saveStats(false, count, solveTime),
  })

  useEffect(() => {
    const fetchChallenge = async () => {
      if (game.restoreSession()) {
        game.setLoaded()
        return
      }
      try {
        const response = await fetch(API_ENDPOINTS.spectrumDaily(today))
        if (!response.ok) throw new Error('Failed to fetch spectrum daily')
        const data = await response.json()
        game.loadFromAPI(data)
        setChallengeDate(data.date)
      } catch {
        game.setError('⚠️ Could not load today\'s spectrum puzzle. Please check your connection and refresh.')
      }
      game.setLoaded()
    }
    fetchChallenge()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <Confetti active={game.gameState === 'won'} />
      <div className="text-center mb-6 sm:mb-8 md:mb-10 mt-4 sm:mt-6 md:mt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 dark:from-rose-400 dark:via-amber-400 dark:to-cyan-400 bg-clip-text text-transparent pb-2">
          🌈 Spectrum Daily
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base md:text-lg">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="mb-6 sm:mb-8 animate-slide-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-base sm:text-lg">
            <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
            <span className="font-bold ml-2 text-xl sm:text-2xl text-amber-500">{game.attempts}</span>
            <span className="text-light-text-secondary dark:text-dark-text-secondary"> / {game.maxAttempts}</span>
          </div>
          <div className="text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-medium">
            Sort by <span className="text-amber-500">hue</span> — follow the rainbow!
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
              correctPositions={game.correctPositions}
              incorrectPositions={game.incorrectPositions}
              locked={game.gameState !== 'playing'}
              onOrderChange={game.reorderColors}
            />
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button className={`w-full max-w-md text-base sm:text-lg py-3 sm:py-4 ${game.gameState === 'won' ? 'game-button !bg-none !bg-emerald-500 dark:!bg-emerald-500 !text-white !shadow-[0_2px_12px_rgba(16,185,129,0.4)] cursor-default' : 'game-button'}`} onClick={game.handleSubmit} disabled={game.gameState !== 'playing' || game.isSubmitting}>
                {game.gameState === 'won' ? 'Solved! ✓' : game.isSubmitting ? 'Checking...' : 'Submit Answer'}
              </button>
            </div>
          </GameStage>
        ) : null}
      </div>

      <AttemptHistory history={game.attemptHistory} />

      {(game.gameState === 'won' || game.gameState === 'lost') && (
        <ShareResult title="🌈 RGBPuzz Spectrum" attempts={game.attempts} maxAttempts={game.maxAttempts} attemptHistory={game.attemptHistory} />
      )}
    </div>
  )
}
