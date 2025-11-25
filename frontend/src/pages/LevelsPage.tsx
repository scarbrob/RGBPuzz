export default function LevelsPage() {
  const levels = [
    { id: 1, difficulty: 'Easy', colors: 3, theme: 'Reds', stars: 3, completed: true },
    { id: 2, difficulty: 'Easy', colors: 3, theme: 'Blues', stars: 2, completed: true },
    { id: 3, difficulty: 'Easy', colors: 3, theme: 'Greens', stars: 0, completed: false },
    { id: 4, difficulty: 'Medium', colors: 5, theme: 'Mixed', stars: 0, completed: false, locked: true },
    { id: 5, difficulty: 'Hard', colors: 7, theme: 'Mixed', stars: 0, completed: false, locked: true },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-game-primary mb-8 text-center">
        Level Progression
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`game-card ${level.locked ? 'opacity-50' : 'hover:scale-105 cursor-pointer'} transition-transform`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold">Level {level.id}</h3>
                <p className="text-sm text-gray-400">{level.difficulty}</p>
              </div>
              {level.locked && (
                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-400">Theme: {level.theme}</p>
              <p className="text-sm text-gray-400">{level.colors} colors</p>
            </div>

            {level.completed && (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 ${i < level.stars ? 'text-yellow-400' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}

            {!level.locked && !level.completed && (
              <button className="game-button w-full mt-2">
                Play
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
