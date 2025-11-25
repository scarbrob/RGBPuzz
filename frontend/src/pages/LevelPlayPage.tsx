import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ColorBoard from '../components/ColorBoard'
import { decryptHex } from '../../../shared/src/crypto'

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'

export default function LevelPlayPage() {
  const { difficulty, level } = useParams<{ difficulty: Difficulty; level: string }>()
  const navigate = useNavigate()
  const [colors, setColors] = useState<Array<{ id: string; hex: string }>>([])
  const [attempts, setAttempts] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing')
  const [feedback, setFeedback] = useState<string>('')
  const [correctPositions, setCorrectPositions] = useState<number[]>([])
  const [incorrectPositions, setIncorrectPositions] = useState<number[]>([])

  useEffect(() => {
    const fetchLevel = async () => {
      if (!difficulty || !level) return

      // Check for saved session state
      const sessionKey = `level-${difficulty}-${level}`
      const savedState = sessionStorage.getItem(sessionKey)
      
      if (savedState) {
        const parsed = JSON.parse(savedState)
        setColors(parsed.colors)
        setAttempts(parsed.attempts)
        setGameState(parsed.gameState)
        setFeedback(parsed.feedback)
        if (parsed.gameState !== 'playing') {
          setCorrectPositions(parsed.colors.map((_: any, idx: number) => idx))
        }
        return
      }

      try {
        const response = await fetch(`https://rgbpuzz-api-bhfwdff7dbc7f8cf.eastus2-01.azurewebsites.net/api/level?difficulty=${difficulty}&level=${level}`)
        if (!response.ok) throw new Error('Failed to fetch level')
        const data = await response.json()
        
        // Decrypt the hex values
        const decryptedColors = data.colorTokens.map((token: { id: string; encrypted: string }) => ({
          id: token.id,
          hex: decryptHex(token.encrypted, token.id)
        }))
        
        setColors(decryptedColors)
      } catch (error) {
        console.error('Error fetching level:', error)
        // Fallback to mock data
        const mockColors = [
          { id: 'color-0', hex: '#ff6b6b' },
          { id: 'color-1', hex: '#4ecdc4' },
          { id: 'color-2', hex: '#45b7d1' },
        ]
        setColors(mockColors)
      }
    }
    
    fetchLevel()
  }, [difficulty, level])

  const handleSubmit = async () => {
    if (gameState !== 'playing') return

    const currentOrder = colors.map(c => c.id)
    
    try {
      const response = await fetch('https://rgbpuzz-api-bhfwdff7dbc7f8cf.eastus2-01.azurewebsites.net/api/validate-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'level',
          difficulty,
          level: parseInt(level || '1'),
          orderedTokenIds: currentOrder,
        }),
      })
      
      if (!response.ok) throw new Error('Validation failed')
      
      const result = await response.json()
      setAttempts(prev => prev + 1)
      
      const correct = result.correctPositions || []
      const incorrect = currentOrder.map((_, idx) => idx).filter(idx => !correct.includes(idx))
      
      setCorrectPositions(correct)
      setIncorrectPositions(incorrect)
      
      let newGameState: 'playing' | 'won' = gameState
      let newFeedback = ''
      
      if (result.correct) {
        newGameState = 'won'
        newFeedback = `🎉 Level Complete in ${attempts + 1} attempt${attempts + 1 === 1 ? '' : 's'}!`
        setGameState('won')
        setFeedback(newFeedback)
        
        // Save completion to localStorage (for unlocking next level)
        const savedProgress = localStorage.getItem('levelProgress')
        const progress = savedProgress ? JSON.parse(savedProgress) : { easy: {}, medium: {}, hard: {}, insane: {} }
        if (difficulty) {
          progress[difficulty][parseInt(level || '1')] = true
        }
        localStorage.setItem('levelProgress', JSON.stringify(progress))
        
        // Save attempt count to localStorage (for stats)
        const statsKey = `level-stats-${difficulty}-${level}`
        const existingStats = localStorage.getItem(statsKey)
        const currentAttemptCount = attempts + 1
        
        // Only save if it's a new best (fewer attempts) or first completion
        if (!existingStats || currentAttemptCount < parseInt(existingStats)) {
          localStorage.setItem(statsKey, currentAttemptCount.toString())
        }
      } else {
        setFeedback('')
      }
      
      // Save session state
      const sessionKey = `level-${difficulty}-${level}`
      sessionStorage.setItem(sessionKey, JSON.stringify({
        colors,
        attempts: attempts + 1,
        gameState: newGameState,
        feedback: newFeedback
      }))
    } catch (error) {
      console.error('Error validating solution:', error)
      setFeedback('Error validating solution. Please try again.')
    }
  }

  const handleReorder = (newColors: Array<{ id: string; hex: string }>) => {
    setColors(newColors)
    // Clear both correct and incorrect positions when reordering
    setCorrectPositions([])
    setIncorrectPositions([])
  }

  const handleNextLevel = () => {
    if (!difficulty || !level) return
    const nextLevel = parseInt(level) + 1
    if (nextLevel <= 100) {
      navigate(`/level/${difficulty}/${nextLevel}`)
      window.location.reload()
    } else {
      navigate('/levels')
    }
  }

  const handleBackToLevels = () => {
    navigate('/levels')
  }

  const difficultyEmoji = {
    easy: '🟢',
    medium: '🟡',
    hard: '🟠',
    insane: '🔴'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleBackToLevels}
          className="px-4 py-2 rounded-xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 transition-all"
        >
          ← Back to Levels
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-light-text dark:text-dark-text mb-2">
            {difficultyEmoji[difficulty as Difficulty]} {difficulty?.charAt(0).toUpperCase()}{difficulty?.slice(1)} - Level {level}
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Attempts: {attempts}
          </p>
        </div>
        <div className="w-32"></div>
      </div>

      {colors.length > 0 && (
        <ColorBoard
          colors={colors}
          onOrderChange={(newOrder) => {
            const reordered = newOrder.map(id => colors.find(c => c.id === id)!)
            handleReorder(reordered)
          }}
          correctPositions={correctPositions}
          incorrectPositions={incorrectPositions}
        />
      )}

      <div className="mt-6 text-center">
        {gameState === 'playing' && (
          <button
            onClick={handleSubmit}
            className="game-button"
          >
            Submit
          </button>
        )}

        {feedback && (
          <div className="mt-4 text-xl font-semibold text-light-text dark:text-dark-text">
            {feedback}
          </div>
        )}

        {gameState === 'won' && (
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={handleNextLevel}
              className="game-button"
            >
              Next Level →
            </button>
            <button
              onClick={handleBackToLevels}
              className="px-6 py-3 rounded-xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 transition-all"
            >
              Level Select
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
