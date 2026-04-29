import { AttemptRecord } from '../types/game'

interface AttemptHistoryProps {
  history: AttemptRecord[]
}

export default function AttemptHistory({ history }: AttemptHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="animate-slide-in mt-8 sm:mt-12">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-light-text-primary dark:text-dark-text-primary">
        Previous Attempts
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {[...history].reverse().map((attempt, reverseIndex) => {
          const attemptIndex = history.length - 1 - reverseIndex
          return (
            <div key={attemptIndex} className="glass-card rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 sm:mb-3 font-medium">
                Attempt {attemptIndex + 1}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {attempt.colors.map((color, colorIndex) => (
                  <div
                    key={color.id}
                    className={`w-12 h-12 rounded-lg relative ${
                      attempt.correctPositions.includes(colorIndex) ? 'ring-2 ring-emerald-400' : 'ring-2 ring-red-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                      {attempt.correctPositions.includes(colorIndex) ? (
                        <span className="bg-emerald-500 text-white rounded-full w-full h-full flex items-center justify-center">✓</span>
                      ) : (
                        <span className="bg-red-500 text-white rounded-full w-full h-full flex items-center justify-center">✗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
