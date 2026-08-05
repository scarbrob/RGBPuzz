import { useState, useCallback, useEffect, useRef } from 'react'
import { decryptHex } from '../../../shared/src/crypto'
import { API_ENDPOINTS } from '../config/api'
import { ColorItem, AttemptRecord, GameState, GameMode } from '../types/game'

interface SessionState {
  colors: Array<{ id: string; encrypted: string }>
  attempts: number
  maxAttempts?: number
  gameState: GameState
  feedback: string
  attemptHistory: Array<{
    colors: Array<{ id: string; encrypted: string }>
    correctPositions: number[]
    incorrectPositions: number[]
  }>
  challengeDate?: string
  statsUpdated: boolean
}

function decryptColors(tokens: Array<{ id: string; encrypted: string }>): ColorItem[] {
  return tokens.map(token => ({
    id: token.id,
    hex: decryptHex(token.encrypted, token.id),
    encrypted: token.encrypted,
  }))
}

function decryptHistory(history: SessionState['attemptHistory']): AttemptRecord[] {
  return history.map(attempt => ({
    colors: decryptColors(attempt.colors),
    correctPositions: attempt.correctPositions,
    incorrectPositions: attempt.incorrectPositions,
  }))
}

interface UseGameStateOptions {
  mode: GameMode
  sessionKey: string
  maxAttempts: number
  onWin?: (attemptCount: number, solveTimeMs: number) => void
  onLose?: (attemptCount: number, solveTimeMs: number) => void
  /** Extra fields for the validation request body */
  validationBody?: Record<string, unknown>
  /** Message for lost state */
  lostMessage?: string
  /** Message prefix for win feedback */
  winEmoji?: string
}

export function useGameState(options: UseGameStateOptions) {
  const { mode, sessionKey, maxAttempts: defaultMaxAttempts, onWin, onLose, validationBody = {}, winEmoji = '🎉', lostMessage = '😔 Out of attempts! Try again tomorrow.' } = options

  const [colors, setColors] = useState<ColorItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts, setMaxAttempts] = useState(defaultMaxAttempts)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [feedback, setFeedback] = useState('')
  const [correctPositions, setCorrectPositions] = useState<number[]>([])
  const [incorrectPositions, setIncorrectPositions] = useState<number[]>([])
  const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>([])
  const [statsUpdated, setStatsUpdated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastActiveTime, setLastActiveTime] = useState(Date.now())

  // Track active time - pause when page hidden, resume when visible
  useEffect(() => {
    if (gameState !== 'playing') return
    const handleVisibility = () => {
      if (document.hidden) {
        setElapsedTime(prev => prev + (Date.now() - lastActiveTime))
      } else {
        setLastActiveTime(Date.now())
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [lastActiveTime, gameState])

  const getSolveTime = useCallback(() => {
    if (gameState !== 'playing') return elapsedTime
    return elapsedTime + (Date.now() - lastActiveTime)
  }, [gameState, elapsedTime, lastActiveTime])

  /** Restore state from sessionStorage */
  const restoreSession = useCallback((): boolean => {
    const savedState = sessionStorage.getItem(sessionKey)
    if (!savedState) return false

    let parsed: SessionState
    try {
      parsed = JSON.parse(savedState) as SessionState
    } catch {
      // Corrupted state - clear it and start fresh
      sessionStorage.removeItem(sessionKey)
      return false
    }

    const decryptedColors = decryptColors(parsed.colors)

    setColors(decryptedColors)
    setAttempts(parsed.attempts)
    if (parsed.maxAttempts) setMaxAttempts(parsed.maxAttempts)
    setGameState(parsed.gameState)
    setFeedback(parsed.feedback)
    setStatsUpdated(parsed.statsUpdated || false)

    if (parsed.attemptHistory) {
      setAttemptHistory(decryptHistory(parsed.attemptHistory))
    }

    if (parsed.gameState === 'won') {
      // On win the displayed order IS the correct order
      setCorrectPositions(decryptedColors.map((_, idx) => idx))
    } else if (parsed.attemptHistory?.length > 0) {
      // For 'lost' or 'playing', show feedback from last attempt
      // (don't fake-mark all positions correct on lost state)
      const last = parsed.attemptHistory[parsed.attemptHistory.length - 1]
      setCorrectPositions(last.correctPositions || [])
      setIncorrectPositions(last.incorrectPositions || [])
    }

    return true
  }, [sessionKey])

  /** Load colors from API response data */
  const loadFromAPI = useCallback((data: { colorTokens: Array<{ id: string; encrypted: string }>; maxAttempts?: number; date?: string }) => {
    const decryptedColors = decryptColors(data.colorTokens)
    setColors(decryptedColors)
    if (data.maxAttempts) setMaxAttempts(data.maxAttempts)
  }, [])

  /** Set error state */
  const setError = useCallback((message: string) => {
    setGameState('error')
    setFeedback(message)
  }, [])

  /** Done loading */
  const setLoaded = useCallback(() => setIsLoading(false), [])

  /** Reorder colors (when user drags) */
  const reorderColors = useCallback((newOrder: string[]) => {
    if (gameState !== 'playing') return
    setColors(prev => newOrder.map(id => prev.find(c => c.id === id)!))
    setCorrectPositions([])
    setIncorrectPositions([])
  }, [gameState])

  /** Submit answer for validation */
  const handleSubmit = useCallback(async () => {
    if (gameState !== 'playing' || isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch(API_ENDPOINTS.validateSolution(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          orderedTokenIds: colors.map(c => c.id),
          ...validationBody,
        }),
      })

      if (!response.ok) throw new Error('Validation failed')
      const result = await response.json()

      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      const correct: number[] = result.correctPositions || []
      const incorrect = colors.map((_, idx) => idx).filter(idx => !correct.includes(idx))
      setCorrectPositions(correct)
      setIncorrectPositions(incorrect)

      const newRecord: AttemptRecord = { colors: [...colors], correctPositions: correct, incorrectPositions: incorrect }
      const newHistory = [...attemptHistory, newRecord]
      setAttemptHistory(newHistory)

      let newGameState: GameState = 'playing'
      let newFeedback = ''

      if (result.correct) {
        newGameState = 'won'
        newFeedback = `${winEmoji} Solved in ${newAttempts} ${newAttempts === 1 ? 'attempt' : 'attempts'}!`
        setGameState('won')
        setFeedback(newFeedback)
        if (!statsUpdated) {
          onWin?.(newAttempts, getSolveTime())
          setStatsUpdated(true)
        }
      } else if (newAttempts >= maxAttempts) {
        newGameState = 'lost'
        newFeedback = lostMessage
        setGameState('lost')
        setFeedback(newFeedback)
        if (!statsUpdated) {
          onLose?.(newAttempts, getSolveTime())
          setStatsUpdated(true)
        }
      } else {
        setFeedback('')
      }

      // Save session
      const stateToSave: SessionState = {
        colors: colors.map(c => ({ id: c.id, encrypted: c.encrypted })),
        attempts: newAttempts,
        maxAttempts,
        gameState: newGameState,
        feedback: newFeedback,
        attemptHistory: newHistory.map(h => ({
          colors: h.colors.map(c => ({ id: c.id, encrypted: c.encrypted })),
          correctPositions: h.correctPositions,
          incorrectPositions: h.incorrectPositions,
        })),
        statsUpdated: statsUpdated || (newGameState !== 'playing'),
      }
      sessionStorage.setItem(sessionKey, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Error validating solution:', error)
      setFeedback('❌ Error checking solution. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [gameState, isSubmitting, colors, attempts, maxAttempts, attemptHistory, statsUpdated, mode, sessionKey, validationBody, winEmoji, lostMessage, getSolveTime, onWin, onLose])

  /** Reset for retry (level modes) */
  const resetForRetry = useCallback(() => {
    sessionStorage.removeItem(sessionKey)
    setAttempts(0)
    setGameState('playing')
    setFeedback('')
    setCorrectPositions([])
    setIncorrectPositions([])
    setAttemptHistory([])
    setStatsUpdated(false)
  }, [sessionKey])

  // Enter key to submit
  const handleSubmitRef = useRef(handleSubmit)
  handleSubmitRef.current = handleSubmit
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) handleSubmitRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return {
    colors, isLoading, isSubmitting, attempts, maxAttempts, gameState, feedback,
    correctPositions, incorrectPositions, attemptHistory, statsUpdated,
    setMaxAttempts, setColors, setIsLoading,
    restoreSession, loadFromAPI, setError, setLoaded,
    reorderColors, handleSubmit, resetForRetry, getSolveTime,
  }
}
