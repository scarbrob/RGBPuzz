import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SignInModal from '../components/SignInModal'

export default function StatsPage() {
  const { user } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)

  // Mock data - will be fetched from API
  const stats = {
    dailyStreak: 7,
    longestStreak: 15,
    totalSolved: 42,
    totalAttempts: 126,
    averageAttempts: 3.0,
    winRate: 85,
  }

  const recentGames = [
    { date: '2025-11-24', solved: true, attempts: 3 },
    { date: '2025-11-23', solved: true, attempts: 2 },
    { date: '2025-11-22', solved: true, attempts: 4 },
    { date: '2025-11-21', solved: false, attempts: 5 },
    { date: '2025-11-20', solved: true, attempts: 3 },
  ]

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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2 mb-8 text-center">
        Your Statistics
      </h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
          <div className="text-4xl font-bold text-light-accent dark:text-dark-accent mb-2">
            🔥 {stats.dailyStreak}
          </div>
          <div className="text-light-text-secondary dark:text-dark-text-secondary">Current Streak</div>
        </div>

        <div className="p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
          <div className="text-4xl font-bold text-light-accent dark:text-dark-accent mb-2">
            ⭐ {stats.longestStreak}
          </div>
          <div className="text-light-text-secondary dark:text-dark-text-secondary">Longest Streak</div>
        </div>

        <div className="p-6 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20">
          <div className="text-4xl font-bold text-light-accent dark:text-dark-accent mb-2">
            {stats.winRate}%
          </div>
          <div className="text-light-text-secondary dark:text-dark-text-secondary">Win Rate</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">Overall Stats</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
              {stats.totalSolved}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Games Won</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
              {stats.totalAttempts}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Attempts</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-1">
              {stats.averageAttempts.toFixed(1)}
            </div>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Avg Attempts</div>
          </div>
        </div>
      </div>

      <div className="game-card">
        <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
        <div className="space-y-2">
          {recentGames.map((game, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 bg-game-accent rounded-lg"
            >
              <span className="text-gray-300">
                {new Date(game.date).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-light-text-secondary dark:text-dark-text-secondary">
                  {game.attempts} attempts
                </span>
                <span className={game.solved ? 'text-green-400' : 'text-red-400'}>
                  {game.solved ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
