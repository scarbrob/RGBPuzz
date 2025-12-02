import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ColorBoard from '../components/ColorBoard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { decryptHex } from '../../../shared/src/crypto'
import { useAuth } from '../contexts/AuthContext'
import { updateLevelStats, getUserStats } from '../services/statsService'
import { API_ENDPOINTS } from '../config/api'
import { LEVELS_PER_DIFFICULTY } from '../../../shared/src/constants'

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane'

export default function LevelPlayPage() {
  const { difficulty, level } = useParams<{ difficulty: Difficulty; level: string }>()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const [colors, setColors] = useState<Array<{ id: string; hex: string; encrypted: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing')
  const [feedback, setFeedback] = useState<string>('')
  const [correctPositions, setCorrectPositions] = useState<number[]>([])
  const [incorrectPositions, setIncorrectPositions] = useState<number[]>([])
  const [startTime] = useState<number>(Date.now())
  const [statsUpdated, setStatsUpdated] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialFadingOut, setTutorialFadingOut] = useState(false)
  const [fastestTimeForDifficulty, setFastestTimeForDifficulty] = useState<number | undefined>(undefined)
  const [timingActive, setTimingActive] = useState(true)
  const [attemptHistory, setAttemptHistory] = useState<Array<{
    colors: Array<{ id: string; hex: string; encrypted: string }>;
    correctPositions: number[];
    incorrectPositions: number[];
  }>>([])
  const [hasValidated, setHasValidated] = useState(false)

  // Validate level access - runs once per level change
  useEffect(() => {
    if (hasValidated) return; // Only validate once
    
    const validateAccess = async () => {
      if (!difficulty || !level) return;
      
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }
      
      const levelNum = parseInt(level);
      
      // Validate level number
      if (isNaN(levelNum) || levelNum < 1 || levelNum > LEVELS_PER_DIFFICULTY) {
        navigate('/levels');
        return;
      }
      
      // Level 1 is always unlocked
      if (levelNum === 1) {
        setHasValidated(true);
        return;
      }
      
      // Check if previous level is completed
      let isPreviousCompleted = false;
      
      if (user) {
        // Authenticated: check server
        try {
          const response = await fetch(API_ENDPOINTS.getLevelProgress(user.id, difficulty));
          if (response.ok) {
            const progressData = await response.json();
            const prevLevel = progressData.find((p: any) => p.level === levelNum - 1);
            isPreviousCompleted = prevLevel?.solved || false;
          }
        } catch (error) {
          console.error('Failed to check level access:', error);
          setHasValidated(true);
          return; // Allow access on error
        }
      } else {
        // Guest: check localStorage
        const savedProgress = localStorage.getItem('levelProgress');
        if (savedProgress) {
          try {
            const allProgress = JSON.parse(savedProgress);
            isPreviousCompleted = allProgress[difficulty]?.[levelNum - 1] || false;
          } catch (error) {
            console.error('Failed to parse progress:', error);
          }
        }
      }
      
      setHasValidated(true);
      
      // Redirect if locked
      if (!isPreviousCompleted) {
        navigate('/levels');
      }
    };
    
    validateAccess();
    // Only depend on difficulty and level - user is captured in closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, level, hasValidated, authLoading]);

  // Reset all state when difficulty or level changes
  useEffect(() => {
    setColors([]);
    setAttempts(0);
    setGameState('playing');
    setFeedback('');
    setCorrectPositions([]);
    setIncorrectPositions([]);
    setStatsUpdated(false);
    setTimingActive(true);
    setAttemptHistory([]);
    setHasValidated(false); // Reset validation flag
  }, [difficulty, level]);

  // Check tutorial status on mount and listen for changes
  useEffect(() => {
    const checkTutorial = () => {
      const tutorialSeen = localStorage.getItem('rgbpuzz-tutorial-seen');
      setShowTutorial(!tutorialSeen);
      setTutorialFadingOut(false);
    };
    
    checkTutorial();
    
    const handleStorageEvent = () => {
      // Start fade out animation
      setTutorialFadingOut(true);
      setShowTutorial(false);
      // Reset fade state after animation completes
      setTimeout(() => {
        setTutorialFadingOut(false);
      }, 800);
    };
    
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Fetch user's fastest time for this difficulty
  useEffect(() => {
    const fetchFastestTime = async () => {
      if (user && difficulty) {
        try {
          const stats = await getUserStats(user.id, user.email || '')
          const fastestKey = `${difficulty}FastestTime` as keyof typeof stats
          setFastestTimeForDifficulty(stats[fastestKey] as number | undefined)
        } catch (error) {
          console.error('Failed to fetch fastest time:', error)
        }
      }
    }
    fetchFastestTime()
  }, [user, difficulty])

  // Check if current time exceeds fastest and stop timing
  useEffect(() => {
    if (!timingActive || !fastestTimeForDifficulty || gameState !== 'playing') return
    
    const interval = setInterval(() => {
      const currentTime = Date.now() - startTime
      if (currentTime > fastestTimeForDifficulty) {
        setTimingActive(false)
      }
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [timingActive, fastestTimeForDifficulty, startTime, gameState])

  useEffect(() => {
    const fetchLevel = async () => {
      setIsLoading(true);
      if (!difficulty || !level) {
        setIsLoading(false);
        return;
      }

      if (user) {
        // Logged in: check database first
        try {
          const response = await fetch(API_ENDPOINTS.getLevelProgress(user.id, difficulty));
          if (response.ok) {
            const progressData = await response.json();
            // Find this specific level in the progress data
            const dbAttempt = progressData.find((p: any) => p.level === parseInt(level));
            
            // Always restore attempts count if we have a record
            if (dbAttempt) {
              setAttempts(dbAttempt.attempts || 0);
              
              // Restore attempt history if available
              if (dbAttempt.attemptHistory && dbAttempt.attemptHistory.length > 0) {
                const decryptedHistory = dbAttempt.attemptHistory.map((attempt: any) => ({
                  colors: attempt.colors.map((token: any) => ({
                    id: token.id,
                    hex: decryptHex(token.encrypted, token.id),
                    encrypted: token.encrypted
                  })),
                  correctPositions: attempt.correctPositions,
                  incorrectPositions: attempt.incorrectPositions
                }));
                setAttemptHistory(decryptedHistory);
              }
            }
            
            // Only restore if we have boardState with valid encrypted tokens
            if (dbAttempt && dbAttempt.boardState) {
              // Check if we have valid encrypted tokens
              const hasValidEncryption = dbAttempt.boardState.some((token: any) => 
                token.encrypted && token.encrypted.length > 0
              );
              
              if (hasValidEncryption) {
                const decryptedColors = dbAttempt.boardState.map((token: any) => ({
                  id: token.id,
                  hex: decryptHex(token.encrypted, token.id),
                  encrypted: token.encrypted
                }));
                
                setColors(decryptedColors);
                setGameState(dbAttempt.solved ? 'won' : 'playing');
                setStatsUpdated(dbAttempt.solved);
                setTimingActive(false); // Disable timing for restored games
                
                // If the level is complete, show all correct
                if (dbAttempt.solved) {
                  setCorrectPositions(decryptedColors.map((_: any, idx: number) => idx));
                } else if (dbAttempt.attemptHistory && dbAttempt.attemptHistory.length > 0) {
                  // Restore feedback from last attempt if still playing
                  const lastAttempt = dbAttempt.attemptHistory[dbAttempt.attemptHistory.length - 1];
                  setCorrectPositions(lastAttempt.correctPositions || []);
                  setIncorrectPositions(lastAttempt.incorrectPositions || []);
                }
                
                setIsLoading(false);
                return; // Don't fetch fresh level
              }
            }
          }
        } catch (error) {
          // No database progress found, will fetch fresh level
        }
        // Fall through to fetch fresh level
      } else {
        // Not logged in: check sessionStorage
        const sessionKey = `level-local-${difficulty}-${level}`;
        const savedState = sessionStorage.getItem(sessionKey);
        
        if (savedState) {
          const parsed = JSON.parse(savedState);
          
          // Decrypt colors from storage
          const decryptedColors = parsed.colors.map((token: any) => ({
            id: token.id,
            hex: decryptHex(token.encrypted, token.id),
            encrypted: token.encrypted
          }));
          
          setColors(decryptedColors);
          setAttempts(parsed.attempts);
          setGameState(parsed.gameState);
          setFeedback(parsed.feedback);
          setTimingActive(false); // Disable timing for restored games
          
          // Decrypt attempt history colors if present
          if (parsed.attemptHistory) {
            const decryptedHistory = parsed.attemptHistory.map((attempt: any) => ({
              colors: attempt.colors.map((token: any) => ({
                id: token.id,
                hex: decryptHex(token.encrypted, token.id),
                encrypted: token.encrypted
              })),
              correctPositions: attempt.correctPositions,
              incorrectPositions: attempt.incorrectPositions
            }));
            setAttemptHistory(decryptedHistory);
          }
          
          setStatsUpdated(parsed.statsUpdated || false);
          
          // If the level is complete, restore the final state
          if (parsed.gameState !== 'playing') {
            setCorrectPositions(decryptedColors.map((_: any, idx: number) => idx));
          } else if (parsed.attemptHistory && parsed.attemptHistory.length > 0) {
            // Restore the feedback from the last attempt if still playing
            const lastAttempt = parsed.attemptHistory[parsed.attemptHistory.length - 1];
            setCorrectPositions(lastAttempt.correctPositions || []);
            setIncorrectPositions(lastAttempt.incorrectPositions || []);
          }
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(API_ENDPOINTS.getLevel(difficulty, parseInt(level)))
        if (!response.ok) throw new Error('Failed to fetch level')
        const data = await response.json()
        
        // Decrypt the hex values
        const decryptedColors = data.colorTokens.map((token: { id: string; encrypted: string }) => ({
          id: token.id,
          hex: decryptHex(token.encrypted, token.id),
          encrypted: token.encrypted
        }))
        
        setColors(decryptedColors);
      } catch (error) {
        console.error('Error fetching level:', error)
        // Fallback to mock data
        const mockColors = [
          { id: 'color-0', hex: '#ff6b6b', encrypted: '' },
          { id: 'color-1', hex: '#4ecdc4', encrypted: '' },
          { id: 'color-2', hex: '#45b7d1', encrypted: '' },
        ]
        setColors(mockColors)
      }
      
      setIsLoading(false);
    }
    
    fetchLevel()
  }, [difficulty, level, user])

  const handleSubmit = async () => {
    if (gameState !== 'playing') return

    const orderedTokens = colors.map(c => c.id)
    
    try {
      const response = await fetch(API_ENDPOINTS.validateSolution(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'level',
          difficulty,
          level: parseInt(level || '1'),
          orderedTokenIds: orderedTokens,
        }),
      })
      
      if (!response.ok) throw new Error('Validation failed')
      
      const result = await response.json()
      setAttempts(prev => prev + 1)
      
      const correct = result.correctPositions || []
      const incorrect = colors.map((_, idx) => idx).filter(idx => !correct.includes(idx))
      
      setCorrectPositions(correct)
      setIncorrectPositions(incorrect)
      
      // Save to history
      const newHistory = [...attemptHistory, {
        colors: [...colors],
        correctPositions: correct,
        incorrectPositions: incorrect
      }]
      setAttemptHistory(newHistory)
      
      let newGameState: 'playing' | 'won' = gameState
      let newFeedback = ''
      
      if (result.correct) {
        newGameState = 'won'
        newFeedback = `🎉 Level Complete in ${attempts + 1} attempt${attempts + 1 === 1 ? '' : 's'}!`
        setGameState('won')
        setFeedback(newFeedback)
        
        // Update stats for authenticated users
        if (user && difficulty && level && !statsUpdated) {
          const solveTime = timingActive ? Date.now() - startTime : undefined;
          updateLevelStats({
            userId: user.id,
            difficulty,
            level: parseInt(level),
            attempts: 1, // Just increment by 1
            solved: true,
            solveTime,
            boardState: colors.map(c => ({ id: c.id, encrypted: c.encrypted })),
            attemptHistory: newHistory.map(h => ({
              colors: h.colors.map(c => ({ id: c.id, encrypted: c.encrypted })),
              correctPositions: h.correctPositions,
              incorrectPositions: h.incorrectPositions
            })),
          }).catch(err => console.error('Failed to update level stats:', err));
          setStatsUpdated(true);
        } else if (!user) {
          // Save to localStorage only if not logged in
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
        }
      } else {
        setFeedback('')
        
        // Save in-progress attempts for authenticated users
        if (user && difficulty && level) {
          // Only save boardState if we have valid encrypted tokens
          const hasValidEncryption = colors.some(c => c.encrypted && c.encrypted.length > 0);
          
          updateLevelStats({
            userId: user.id,
            difficulty,
            level: parseInt(level),
            attempts: 1, // Just increment by 1
            solved: false,
            boardState: hasValidEncryption ? colors.map(c => ({ id: c.id, encrypted: c.encrypted })) : undefined,
            attemptHistory: newHistory.map(h => ({
              colors: h.colors.map(c => ({ id: c.id, encrypted: c.encrypted })),
              correctPositions: h.correctPositions,
              incorrectPositions: h.incorrectPositions
            })),
          }).catch(err => console.error('Failed to save in-progress level:', err));
        }
      }
      
      // Save session state
      // Save session state (only for non-authenticated users)
      if (!user) {
        const stateToSave = {
          colors: colors.map(c => ({ id: c.id, encrypted: c.encrypted })), // Only save encrypted values
          attempts: attempts + 1,
          gameState: newGameState,
          feedback: newFeedback,
          attemptHistory: newHistory.map(h => ({
            colors: h.colors.map(c => ({ id: c.id, encrypted: c.encrypted })),
            correctPositions: h.correctPositions,
            incorrectPositions: h.incorrectPositions
          })),
          statsUpdated: statsUpdated || (newGameState !== 'playing')
        };
        
        const sessionKey = `level-local-${difficulty}-${level}`;
        sessionStorage.setItem(sessionKey, JSON.stringify(stateToSave));
      }
    } catch (error) {
      console.error('Error validating solution:', error)
      setFeedback('Error validating solution. Please try again.')
    }
  }

  const handleReorder = (newColors: Array<{ id: string; hex: string; encrypted: string }>) => {
    setColors(newColors)
    // Clear both correct and incorrect positions when reordering
    setCorrectPositions([])
    setIncorrectPositions([])
  }

  const handleNextLevel = () => {
    if (!difficulty || !level) return
    const nextLevel = parseInt(level) + 1
    if (nextLevel <= LEVELS_PER_DIFFICULTY) {
      navigate(`/level/${difficulty}/${nextLevel}`)
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
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={handleBackToLevels}
          className="mb-3 sm:mb-4 px-3 sm:px-4 py-2 rounded-xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 transition-all text-sm sm:text-base"
        >
          ← Back to Levels
        </button>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-1 sm:mb-2">
            {difficultyEmoji[difficulty as Difficulty]} {difficulty?.charAt(0).toUpperCase()}{difficulty?.slice(1)} - Level {level}
          </h1>
          <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
            Attempts: {attempts}
          </p>
        </div>
      </div>

      {/* Color Spectrum Hint */}
      <div className="mb-8" style={{ transition: 'all 1s ease-out' }}>
        <button
          onClick={() => setShowHint(!showHint)}
          className="w-full text-center text-sm bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:opacity-80 mb-2 transition-opacity font-bold"
        >
          💡 {showHint ? 'Hide' : 'Show'} Sorting Guide
        </button>
        {showHint && (
          <div className="relative h-7 rounded-xl overflow-hidden shadow-lg animate-fade-in mb-3">
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, #000000, #0000ff, #00ff00, #00ffff, #ff0000, #ff00ff, #ffff00, #ffffff)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-bold text-white" style={{ textShadow: '0 0 4px black, 0 0 8px black' }}>
              <span>Lowest RGB</span>
              <span>Highest RGB</span>
            </div>
          </div>
        )}
        
        {/* Tutorial hint for first-time users */}
        {(showTutorial || tutorialFadingOut) && (
          <div 
            className="mt-3 flex justify-center overflow-hidden"
            style={{
              transition: 'max-height 0.8s ease-in-out, opacity 0.8s ease-in-out, margin 0.8s ease-in-out',
              maxHeight: tutorialFadingOut ? '0px' : '200px',
              opacity: tutorialFadingOut ? 0 : 1,
              marginTop: tutorialFadingOut ? '0px' : '0.75rem'
            }}
          >
            <div 
              className="px-4 py-3 bg-light-accent/10 dark:bg-dark-accent/10 border border-light-accent/30 dark:border-dark-accent/30 rounded-xl"
              style={{
                transition: 'transform 0.8s ease-in-out',
                transform: tutorialFadingOut ? 'scale(0.95)' : 'scale(1)'
              }}
            >
              <p className="text-center text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary font-semibold">
                👆 <span className="text-light-accent dark:text-dark-accent">Drag and drop</span> the tiles below to reorder them!
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : colors.length > 0 ? (
        <div>
          <ColorBoard
            colors={colors}
            onOrderChange={(newOrder) => {
              const reordered = newOrder.map(id => colors.find(c => c.id === id)!)
              handleReorder(reordered)
            }}
            correctPositions={correctPositions}
            incorrectPositions={incorrectPositions}
          />

          <div className="mt-6 text-center">
            {gameState === 'playing' && (
              <button
                onClick={handleSubmit}
                className="game-button text-sm sm:text-base"
              >
                Submit Answer
              </button>
            )}
            {gameState === 'won' && (
              <div className="animate-pulse-thrice text-green-600 dark:text-green-400 font-bold text-lg sm:text-xl">
                ✓ Solved!
              </div>
            )}

            {feedback && (
              <div className="mt-4 text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text">
                {feedback}
              </div>
            )}

            {gameState === 'won' && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {parseInt(level || '0') < LEVELS_PER_DIFFICULTY && (
                  <button
                    onClick={handleNextLevel}
                    className="game-button text-sm sm:text-base"
                  >
                    Next Level →
                  </button>
                )}
                <button
                  onClick={handleBackToLevels}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 transition-all text-sm sm:text-base"
                >
                  Level Select
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
