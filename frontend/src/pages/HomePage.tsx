import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-game-primary mb-4">
          RGBPuzz
        </h1>
        <p className="text-xl text-gray-300">
          Sort colors by their RGB values. Can you master the spectrum?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link to="/daily" className="game-card hover:scale-105 transition-transform">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-game-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Daily Challenge</h2>
          <p className="text-gray-400">
            New puzzle every day. Compete with players worldwide!
          </p>
        </Link>

        <Link to="/levels" className="game-card hover:scale-105 transition-transform">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-game-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Level Mode</h2>
          <p className="text-gray-400">
            Progress through increasingly difficult color challenges
          </p>
        </Link>
      </div>

      <div className="game-card">
        <h3 className="text-2xl font-bold mb-4">How to Play</h3>
        <div className="text-left space-y-3 text-gray-300">
          <p>🎨 Drag and drop colors to arrange them in order</p>
          <p>📊 Sort by RGB value from lowest to highest (left to right)</p>
          <p>🎯 Limited attempts - same as the number of colors</p>
          <p>🏆 Track your stats and build your streak</p>
          <p>💡 No RGB values shown - trust your eyes!</p>
        </div>
      </div>
    </div>
  )
}
