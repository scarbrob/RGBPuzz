import { useState, useEffect } from 'react'
import ColorBoard from '../components/ColorBoard'
import { decryptHex } from '../../../shared/src/crypto'

export default function DailyChallengePage() {
  const [colors, setColors] = useState<Array<{ id: string; hex: string }>>([])
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts, setMaxAttempts] = useState(5)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [feedback, setFeedback] = useState<string>('')
  const [correctPositions, setCorrectPositions] = useState<number[]>([])
  const [incorrectPositions, setIncorrectPositions] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)
  const [challengeDate, setChallengeDate] = useState<string>('')
  const [attemptHistory, setAttemptHistory] = useState<Array<{
    colors: Array<{ id: string; hex: string }>;
    correctPositions: number[];
    incorrectPositions: number[];
  }>>([])

  const resetPuzzle = () => {
    const today = new Date().toISOString().split('T')[0];
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
      const today = new Date().toISOString().split('T')[0];
      const savedState = sessionStorage.getItem(`rgbpuzz-${today}`);
      
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setColors(parsed.colors);
        setAttempts(parsed.attempts);
        setMaxAttempts(parsed.maxAttempts);
        setGameState(parsed.gameState);
        setFeedback(parsed.feedback);
        setAttemptHistory(parsed.attemptHistory || []);
        setChallengeDate(parsed.challengeDate || today);
        if (parsed.gameState !== 'playing') {
          setCorrectPositions(parsed.colors.map((_: any, idx: number) => idx));
        }
        return;
      }
      
      try {
        const response = await fetch(`https://rgbpuzz-api-bhfwdff7dbc7f8cf.eastus2-01.azurewebsites.net/api/daily-challenge?date=${today}`);
        if (!response.ok) throw new Error('Failed to fetch challenge');
        const data = await response.json();
        
        // Decrypt the hex values from encrypted tokens
        const decryptedColors = data.colorTokens.map((token: { id: string; encrypted: string }) => ({
          id: token.id,
          hex: decryptHex(token.encrypted, token.id)
        }));
        
        setColors(decryptedColors);
        setMaxAttempts(data.maxAttempts);
        setChallengeDate(data.date);
      } catch (error) {
        console.error('Error fetching daily challenge:', error);
        // Fallback to mock data
        const mockColors = [
          { id: 'color-0', hex: '#ff6b6b' },
          { id: 'color-1', hex: '#4ecdc4' },
          { id: 'color-2', hex: '#45b7d1' },
          { id: 'color-3', hex: '#96ceb4' },
          { id: 'color-4', hex: '#ffeaa7' },
        ];
        setColors(mockColors);
        setMaxAttempts(mockColors.length);
      }
    };
    
    fetchChallenge();
  }, [])

  const handleSubmit = async () => {
    if (gameState !== 'playing') return;

    const currentOrder = colors.map(c => c.id);
    
    try {
      const response = await fetch('https://rgbpuzz-api-bhfwdff7dbc7f8cf.eastus2-01.azurewebsites.net/api/validate-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'daily',
          date: challengeDate,
          orderedTokenIds: currentOrder,
        }),
      });
      
      if (!response.ok) throw new Error('Validation failed');
      
      const result = await response.json();
      setAttempts(prev => prev + 1);
      
      const correct = result.correctPositions || [];
      const incorrect = currentOrder.map((_, idx) => idx).filter(idx => !correct.includes(idx));
      
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
      } else if (attempts + 1 >= maxAttempts) {
        newGameState = 'lost';
        newFeedback = '😔 Out of attempts! Try again tomorrow.';
        setGameState('lost');
        setFeedback(newFeedback);
      } else {
        // No feedback during play - let the icons do the talking
        setFeedback('');
      }
      
      // Save to sessionStorage
      const today = new Date().toISOString().split('T')[0];
      sessionStorage.setItem(`rgbpuzz-${today}`, JSON.stringify({
        colors,
        attempts: attempts + 1,
        maxAttempts,
        gameState: newGameState,
        feedback: newFeedback,
        attemptHistory: newHistory,
        challengeDate
      }));
    } catch (error) {
      console.error('Error validating solution:', error);
      setFeedback('❌ Error checking solution. Please try again.');
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10 mt-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2">
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
        <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg leading-tight">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="mb-8 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg">
            <span className="text-light-text-secondary dark:text-dark-text-secondary">Attempts:</span>
            <span className="font-bold ml-2 text-2xl text-light-accent dark:text-dark-accent">{attempts}</span>
            <span className="text-light-text-secondary dark:text-dark-text-secondary"> / {maxAttempts}</span>
          </div>
          <div className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium">
            Order colors from <span className="text-light-accent dark:text-dark-accent">darkest</span> to <span className="text-light-accent dark:text-dark-accent">lightest</span>.
          </div>
        </div>

        {/* Color Spectrum Hint */}
        <div className="mb-8">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full text-center text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent mb-3 transition-colors font-medium"
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
                <span>Darkest</span>
                <span>Lightest</span>
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

        <div className="mt-8 flex justify-center">
          <button 
            className="game-button w-full max-w-md text-lg py-4"
            onClick={handleSubmit}
            disabled={gameState !== 'playing'}
          >
            {gameState === 'won' ? 'Solved! ✓' : 'Submit Answer'}
          </button>
        </div>
      </div>

      {gameState !== 'playing' && (
        <div className="mt-12 animate-slide-in">
          <h3 className="text-xl font-bold mb-4 text-center text-light-text-primary dark:text-dark-text-primary">Share Your Result</h3>
          <div className="flex justify-center mb-4">
            <button 
              className="game-button"
              onClick={copyResults}
            >
              📋 Copy Result
            </button>
          </div>
          <div className="mt-4 p-4 bg-light-surface/50 dark:bg-dark-surface/30 rounded-xl text-sm font-mono text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-line text-center">
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
        <div className="animate-slide-in mt-12">
          <h3 className="text-2xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">Previous Attempts</h3>
          <div className="space-y-4">
            {[...attemptHistory].reverse().map((attempt, reverseIndex) => {
              const attemptIndex = attemptHistory.length - 1 - reverseIndex;
              return (
                <div key={attemptIndex} className="rounded-xl p-4 bg-light-surface/50 dark:bg-dark-surface/30">
                  <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3 font-medium">Attempt {attemptIndex + 1}</div>
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
