import { GameState } from '../types/game'

interface FeedbackBannerProps {
  feedback: string
  gameState: GameState
}

export default function FeedbackBanner({ feedback, gameState }: FeedbackBannerProps) {
  if (!feedback || gameState === 'playing') return null

  const colorClass =
    gameState === 'won' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50 animate-pulse-twice' :
    gameState === 'error' ? 'bg-light-accent/10 dark:bg-dark-accent/10 text-light-text-secondary dark:text-dark-text-secondary border-light-accent/30 dark:border-dark-accent/30' :
    'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50'

  return (
    <div className={`mb-6 p-4 rounded-xl text-center font-medium animate-slide-in border ${colorClass}`}>
      {feedback}
    </div>
  )
}
