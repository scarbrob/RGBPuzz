import { useState } from 'react'
import { AttemptRecord } from '../types/game'

interface ShareResultProps {
  title: string
  attempts: number
  maxAttempts: number
  attemptHistory: AttemptRecord[]
}

export default function ShareResult({ title, attempts, maxAttempts, attemptHistory }: ShareResultProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyError, setCopyError] = useState('')

  const copyResults = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const resultText = [
      `${title} ${today}`,
      `${attempts}/${maxAttempts}`,
      '',
      ...attemptHistory.map(attempt =>
        attempt.colors.map((_, idx) =>
          attempt.correctPositions.includes(idx) ? '✅' : '❌'
        ).join('')
      )
    ].join('\n')

    navigator.clipboard.writeText(resultText).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }).catch(() => {
      setCopyError('Unable to copy automatically. Please select and copy the result below.')
    })
  }

  return (
    <div className="mt-8 sm:mt-12 animate-slide-in">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-light-text-primary dark:text-dark-text-primary">
        Share Your Result
      </h3>
      <div className="flex justify-center mb-3 sm:mb-4">
        <button className="game-button text-sm sm:text-base" onClick={copyResults}>
          {copySuccess ? '✅ Copied!' : '📋 Copy Result'}
        </button>
      </div>
      {copyError && (
        <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mb-2">{copyError}</p>
      )}
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 glass-card text-xs sm:text-sm font-mono text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-line text-center">
        {title} {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br />
        {attempts}/{maxAttempts}<br />
        <br />
        {attemptHistory.map((attempt, idx) => (
          <div key={idx}>
            {attempt.colors.map((_, colorIdx) =>
              attempt.correctPositions.includes(colorIdx) ? '✅' : '❌'
            ).join('')}
          </div>
        ))}
      </div>
    </div>
  )
}
