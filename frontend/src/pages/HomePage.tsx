import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6">
          RGBPuzz
        </h1>
        <p className="text-2xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
          Sort colors by their RGB values. Can you master the spectrum?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Link to="/daily" className="p-8 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 hover:scale-105 transition-all group border-2 border-light-accent/30 dark:border-dark-accent/30">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-light-accent dark:text-dark-accent group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-light-text-primary dark:text-dark-text-primary">Daily Challenge</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
            New puzzle every day. Compete with players worldwide!
          </p>
        </Link>

        <Link to="/levels" className="p-8 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 hover:scale-105 transition-all group border-2 border-light-accent/30 dark:border-dark-accent/30">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-light-accent dark:text-dark-accent group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-light-text-primary dark:text-dark-text-primary">Level Mode</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
            Progress through increasingly difficult color challenges
          </p>
        </Link>
      </div>

      <div className="p-8">
        <h3 className="text-3xl font-bold mb-8 text-center text-light-text-primary dark:text-dark-text-primary">How to Play</h3>
        <div className="grid md:grid-cols-2 gap-6 text-lg">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎨</span>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Drag and drop colors to arrange them in order</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl">📊</span>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Sort by RGB value from lowest to highest</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎯</span>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Limited attempts - same as the number of colors</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl">🏆</span>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Track your stats and build your streak</p>
          </div>
          <div className="flex items-start gap-3 md:col-span-2 justify-center">
            <span className="text-3xl">💡</span>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">No RGB values shown - trust your eyes!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
