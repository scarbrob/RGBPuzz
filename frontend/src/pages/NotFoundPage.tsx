import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in px-4 text-center py-16 sm:py-24">
      <div className="text-7xl sm:text-8xl font-extrabold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
        Page not found
      </h1>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
        This color doesn't exist in our palette.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="game-button text-sm sm:text-base">Go Home</Link>
        <Link to="/daily" className="game-button-secondary text-sm sm:text-base">Play Daily</Link>
      </div>
    </div>
  )
}
