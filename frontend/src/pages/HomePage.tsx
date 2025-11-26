import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in px-4">
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-6">
          RGBPuzz
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto px-2">
          Master the art of color sorting
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
        <Link to="/daily" className="p-6 sm:p-8 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 hover:scale-105 transition-all group border-2 border-light-accent/30 dark:border-dark-accent/30">
          <div className="mb-4 sm:mb-6">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-light-accent dark:text-dark-accent group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-light-text-primary dark:text-dark-text-primary">Daily Challenge</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-base sm:text-lg">
            New puzzle every day. Compete with players worldwide!
          </p>
        </Link>

        <Link to="/levels" className="p-6 sm:p-8 rounded-2xl bg-light-surface/30 dark:bg-dark-surface/20 hover:bg-light-surface/50 dark:hover:bg-dark-surface/30 hover:scale-105 transition-all group border-2 border-light-accent/30 dark:border-dark-accent/30">
          <div className="mb-4 sm:mb-6">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-light-accent dark:text-dark-accent group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-light-text-primary dark:text-dark-text-primary">Level Mode</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-base sm:text-lg">
            Progress through increasingly difficult color challenges
          </p>
        </Link>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-light-text-primary dark:text-dark-text-primary">How to Play</h3>
        
        {/* Common Rules */}
        <div className="mb-8 sm:mb-10">
          <h4 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center text-light-accent dark:text-dark-accent">Basic Rules</h4>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 text-base sm:text-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl">🎨</span>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">Drag and drop colors to arrange them in order</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl">📊</span>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">Sort by RGB value from lowest to highest</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl">💡</span>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">No RGB values shown - trust your eyes!</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl sm:text-3xl">🎯</span>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">Daily mode has limited attempts - same as the number of colors</p>
            </div>
          </div>
        </div>

        {/* Mode-Specific Rules */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Daily Challenge */}
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/20 dark:bg-dark-surface/10 border-2 border-light-accent/30 dark:border-dark-accent/30">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <span>📅</span> Daily Challenge
            </h4>
            <ul className="space-y-2 text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>New puzzle every day at midnight</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>Same puzzle for everyone worldwide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>Build your daily streak by playing consecutive days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>Share your results and compete with friends</span>
              </li>
            </ul>
          </div>

          {/* Level Mode */}
          <div className="p-4 sm:p-6 rounded-2xl bg-light-surface/20 dark:bg-dark-surface/10 border-2 border-light-accent/30 dark:border-dark-accent/30">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
              <span>⚡</span> Level Mode
            </h4>
            <ul className="space-y-2 text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>400 levels across 4 difficulties (Easy, Medium, Hard, Insane)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>Unlock levels by completing previous ones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>Race against your fastest time for each difficulty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-light-accent dark:text-dark-accent mt-1">•</span>
                <span>Colors get progressively closer as levels advance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
