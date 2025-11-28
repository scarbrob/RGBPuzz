import { useState, useEffect } from 'react'
import ColorBoard from '../components/ColorBoard'
import { decryptHex } from '../../../shared/src/crypto'
import { useAuth } from '../contexts/AuthContext'
import { updateDailyStats } from '../services/statsService'
import { API_ENDPOINTS } from '../config/api'

export default function DailyChallengePage() {
  const { user } = useAuth()
  const [colors, setColors] = useState<Array<{ id: string; hex: string; encrypted: string }>>([])
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts, setMaxAttempts] = useState(5)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [feedback, setFeedback] = useState<string>('')
  const [correctPositions, setCorrectPositions] = useState<number[]>([])
  const [incorrectPositions, setIncorrectPositions] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [challengeDate, setChallengeDate] = useState<string>(today)
  const [startTime] = useState<number>(Date.now())
  const [attemptHistory, setAttemptHistory] = useState<Array<{
    colors: Array<{ id: string; hex: string; encrypted: string }>;
    correctPositions: number[];
    incorrectPositions: number[];
  }>>([])
  const [statsUpdated, setStatsUpdated] = useState(false)
  const resetPuzzle = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    sessionStorage.removeItem(`rgbpuzz-${today}`);
    window.location.reload();
  };

  const copyResults = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const resultText = [
      `RGBPuzz ${today}`,
      `${attempts}/${maxAttempts}`,
      '',
      ...attemptHistory.map(attempt => 
        attempt.colors.map((_, idx) => 
          attempt.correctPositions.includes(idx) ? '✅' : '❌'
        ).join('')
      )
    ].join('\n');
    
    navigator.clipboard.writeText(resultText).then(() => {
      // Could add a toast notification here
      alert('Results copied to clipboard!');
    });
  };

  useEffect(() => {
    // Fetch daily challenge from API
    const fetchChallenge = async () => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      // Check sessionStorage first (fastest, works for same device)
      const sessionKey = user ? `rgbpuzz-${user.id}-${today}` : `rgbpuzz-local-${today}`;
      const savedState = sessionStorage.getItem(sessionKey);
      
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setColors(parsed.colors);
        setAttempts(parsed.attempts);
        setMaxAttempts(parsed.maxAttempts);
        setGameState(parsed.gameState);
        setFeedback(parsed.feedback);
        setAttemptHistory(parsed.attemptHistory || []);
        setChallengeDate(parsed.challengeDate || today);
        setStatsUpdated(parsed.statsUpdated || false);
        
        // If the challenge is already complete, restore the final state
        if (parsed.gameState !== 'playing') {
          setCorrectPositions(parsed.colors.map((_: any, idx: number) => idx));
        } else if (parsed.attemptHistory && parsed.attemptHistory.length > 0) {
          const lastAttempt = parsed.attemptHistory[parsed.attemptHistory.length - 1];
          setCorrectPositions(lastAttempt.correctPositions || []);
          setIncorrectPositions(lastAttempt.incorrectPositions || []);
        }
        return;
      }
      
      // For authenticated users on a new device, check database
      let dbAttempt = null;
      if (user) {
        try {
          const response = await fetch(API_ENDPOINTS.getDailyAttempt(user.id, today));
          if (response.ok) {
            dbAttempt = await response.json();
            console.log('Found existing daily attempt in database:', dbAttempt);
          }
        } catch (error) {
          console.log('No existing daily attempt found in database');
        }
      }
      
      try {
        const response = await fetch(API_ENDPOINTS.dailyChallenge(today));
        if (!response.ok) throw new Error('Failed to fetch challenge');
        const data = await response.json();
        
        // Decrypt the hex values from encrypted tokens
        const decryptedColors = data.colorTokens.map((token: { id: string; encrypted: string }) => ({
          id: token.id,
          hex: decryptHex(token.encrypted, token.id),
          encrypted: token.encrypted
        }));
        
        setColors(decryptedColors);
        setMaxAttempts(data.maxAttempts);
        setChallengeDate(data.date);
        
        // If user has already completed this challenge (from database), lock it
        if (dbAttempt) {
          setAttempts(dbAttempt.attempts);
          setStatsUpdated(true);
          
          // Restore board state and attempt history if available
          const savedColors = dbAttempt.boardState || decryptedColors;
          const savedHistory = dbAttempt.attemptHistory || [];
          
          setColors(savedColors);
          setAttemptHistory(savedHistory);
          
          if (dbAttempt.solved) {
            setGameState('won');
            setFeedback(`🎉 Solved in ${dbAttempt.attempts}/${data.maxAttempts}!`);
            setCorrectPositions(savedColors.map((_: any, idx: number) => idx));
          } else if (dbAttempt.attempts >= data.maxAttempts) {
            setGameState('lost');
            setFeedback('😔 Out of attempts! Try again tomorrow.');
            // Show last attempt feedback
            if (savedHistory.length > 0) {
              const lastAttempt = savedHistory[savedHistory.length - 1];
              setCorrectPositions(lastAttempt.correctPositions || []);
              setIncorrectPositions(lastAttempt.incorrectPositions || []);
            }
          }
          
          // Save to sessionStorage so we don't need to check database again
          const stateToSave = {
            colors: savedColors,
            attempts: dbAttempt.attempts,
            maxAttempts: data.maxAttempts,
            gameState: dbAttempt.solved ? 'won' : (dbAttempt.attempts >= data.maxAttempts ? 'lost' : 'playing'),
            feedback: dbAttempt.solved ? `🎉 Solved in ${dbAttempt.attempts}/${data.maxAttempts}!` : (dbAttempt.attempts >= data.maxAttempts ? '😔 Out of attempts! Try again tomorrow.' : ''),
            attemptHistory: savedHistory,
            challengeDate: data.date,
            statsUpdated: true
          };
          sessionStorage.setItem(sessionKey, JSON.stringify(stateToSave));
        }
      } catch (error) {
        console.error('Error fetching daily challenge:', error);
        // Fallback to mock data
        const mockColors = [
          { id: 'color-0', hex: '#ff6b6b', encrypted: '' },
          { id: 'color-1', hex: '#4ecdc4', encrypted: '' },
          { id: 'color-2', hex: '#45b7d1', encrypted: '' },
          { id: 'color-3', hex: '#96ceb4', encrypted: '' },
          { id: 'color-4', hex: '#ffeaa7', encrypted: '' },
        ];
        setColors(mockColors);
        setMaxAttempts(mockColors.length);
      }
    };
    
    fetchChallenge();
  }, [user])

  const handleSubmit = async () => {
    if (gameState !== 'playing') return;

    const orderedTokens = colors.map(c => c.id);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const response = await fetch(API_ENDPOINTS.validateSolution(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'daily',
          date: challengeDate,
          orderedTokenIds: orderedTokens,
        }),
      });
      
      if (!response.ok) throw new Error('Validation failed');
      
      const result = await response.json();
      setAttempts(prev => prev + 1);
      
      const correct = result.correctPositions || [];
      const incorrect = colors.map((_, idx) => idx).filter(idx => !correct.includes(idx));
      
      setCorrectPositions(correct);
      setIncorrectPositions(incorrect);
      
      // Save to history
      const newHistory = [...attemptHistory, {
        colors: [...colors],
        correctPositions: correct,
        incorrectPositions: incorrect
      }];
      setAttemptHistory(newHistory);
      
      let newGameState: 'playing' | 'won' | 'lost' = gameState;
      let newFeedback = '';
      
      if (result.correct) {
        newGameState = 'won';
        newFeedback = `🎉 Solved in ${attempts + 1}/${maxAttempts}!`;
        setGameState('won');
        setFeedback(newFeedback);
        
        // Update stats for authenticated users
        if (user && !statsUpdated) {
          const solveTime = Date.now() - startTime;
          updateDailyStats({
            userId: user.id,
            date: today,
            attempts: attempts + 1,
            solved: true,
            solveTime,
            boardState: colors,
            attemptHistory: newHistory,
          }).catch(err => console.error('Failed to update stats:', err));
          setStatsUpdated(true);
        }
      } else if (attempts + 1 >= maxAttempts) {
        newGameState = 'lost';
        newFeedback = '😔 Out of attempts! Try again tomorrow.';
        setGameState('lost');
        setFeedback(newFeedback);
        
        // Update stats for authenticated users (loss)
        if (user && !statsUpdated) {
          updateDailyStats({
            userId: user.id,
            date: today,
            attempts: attempts + 1,
            solved: false,
            boardState: colors,
            attemptHistory: newHistory,
          }).catch(err => console.error('Failed to update stats:', err));
          setStatsUpdated(true);
        }
      } else {
        // No feedback during play - let the icons do the talking
        setFeedback('');
      }
      
      // Save state to sessionStorage
      const stateToSave = {
        colors,
        attempts: attempts + 1,
        maxAttempts,
        gameState: newGameState,
        feedback: newFeedback,
        attemptHistory: newHistory,
        challengeDate,
        statsUpdated: statsUpdated || (newGameState !== 'playing')
      };
      
      const sessionKey = user ? `rgbpuzz-${user.id}-${challengeDate}` : `rgbpuzz-local-${challengeDate}`;
      sessionStorage.setItem(sessionKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error validating solution:', error);
      setFeedback('❌ Error checking solution. Please try again.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4">
      <div className="text-center mb-6 sm:mb-8 md:mb-10 mt-4 sm:mt-6 md:mt-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2">
            Daily Challenge
          </h1>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={resetPuzzle}
              className="text-xs px-3 py-1 bg-light-border dark:bg-dark-border hover:bg-light-accent dark:hover:bg-dark-accent text-light-text-primary dark:text-dark-text-primary rounded-lg transition-all"
              title="Reset puzzle (dev only)"
            >
              🔄 Reset
            </button>
          )}
        </div>
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm sm:text-base md:text-lg leading-tight">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="mb-6 sm:mb-8 animate-slide-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-base sm:text-lg">
            <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
            <span className="font-bold ml-2 text-xl sm:text-2xl text-light-accent dark:text-dark-accent">{attempts}</span>
            <span className="text-light-text-secondary dark:text-dark-text-secondary"> / {maxAttempts}</span>
          </div>
          <div className="text-light-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm font-medium text-center sm:text-right">
            Order colors from <span className="text-light-accent dark:text-dark-accent">lowest</span> to <span className="text-light-accent dark:text-dark-accent">highest</span> RGB value.
          </div>
        </div>

        {/* Color Spectrum Hint */}
        <div className="mb-8">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full text-center text-sm bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:opacity-80 mb-3 transition-opacity font-bold"
          >
            💡 {showHint ? 'Hide' : 'Show'} Sorting Guide
          </button>
          {showHint && (
            <div className="relative h-10 rounded-xl overflow-hidden shadow-lg animate-fade-in">
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
        </div>

        {feedback && gameState !== 'playing' && (
          <div className={`mb-6 p-4 rounded-xl text-center font-medium animate-slide-in ${
            gameState === 'won' ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/50' :
            'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50'
          }`}>
            {feedback}
          </div>
        )}

        <ColorBoard 
          colors={colors}
          correctPositions={correctPositions}
          incorrectPositions={incorrectPositions}
          locked={gameState !== 'playing'}
          onOrderChange={(newOrder) => {
            if (gameState !== 'playing') return;
            const reordered = newOrder.map(id => colors.find(c => c.id === id)!);
            setColors(reordered);
            setCorrectPositions([]); // Clear highlights when user reorders
            setIncorrectPositions([]); // Clear incorrect markers too
          }}
        />

        <div className="mt-6 sm:mt-8 flex justify-center">
          <button 
            className="game-button w-full max-w-md text-base sm:text-lg py-3 sm:py-4"
            onClick={handleSubmit}
            disabled={gameState !== 'playing'}
          >
            {gameState === 'won' ? 'Solved! ✓' : 'Submit Answer'}
          </button>
        </div>
      </div>

      {gameState !== 'playing' && (
        <div className="mt-8 sm:mt-12 animate-slide-in">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-light-text-primary dark:text-dark-text-primary">Share Your Result</h3>
          <div className="flex justify-center mb-3 sm:mb-4">
            <button 
              className="game-button text-sm sm:text-base"
              onClick={copyResults}
            >
              📋 Copy Result
            </button>
          </div>
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-light-surface/50 dark:bg-dark-surface/30 rounded-xl text-xs sm:text-sm font-mono text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-line text-center">
            RGBPuzz {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
            {attempts}/{maxAttempts}<br/>
            <br/>
            {attemptHistory.map((attempt, idx) => (
              <div key={idx}>
                {attempt.colors.map((_, colorIdx) => 
                  attempt.correctPositions.includes(colorIdx) ? '✅' : '❌'
                ).join('')}
              </div>
            ))}
          </div>
        </div>
      )}

      {attemptHistory.length > 0 && (
        <div className="animate-slide-in mt-8 sm:mt-12">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-text-primary dark:text-dark-text-primary">Previous Attempts</h3>
          <div className="space-y-3 sm:space-y-4">
            {[...attemptHistory].reverse().map((attempt, reverseIndex) => {
              const attemptIndex = attemptHistory.length - 1 - reverseIndex;
              return (
                <div key={attemptIndex} className="rounded-xl p-3 sm:p-4 bg-light-surface/50 dark:bg-dark-surface/30">
                  <div className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 sm:mb-3 font-medium">Attempt {attemptIndex + 1}</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {attempt.colors.map((color, colorIndex) => (
                      <div
                        key={color.id}
                        className={`w-12 h-12 rounded-lg relative ${
                          attempt.correctPositions.includes(colorIndex)
                            ? 'ring-2 ring-green-400'
                            : 'ring-2 ring-red-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        <div className="absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                          {attempt.correctPositions.includes(colorIndex) ? (
                            <span className="bg-green-500 text-white rounded-full w-full h-full flex items-center justify-center">✓</span>
                          ) : (
                            <span className="bg-red-500 text-white rounded-full w-full h-full flex items-center justify-center">✗</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
