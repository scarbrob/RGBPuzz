import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="h-px bg-gradient-to-r from-transparent via-light-accent/20 dark:via-dark-accent/20 to-transparent" />
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            © {new Date().getFullYear()} RGBPuzz
          </div>
          <div className="flex gap-5 sm:gap-6 text-xs">
            <a
              href="https://github.com/scarbrob/RGBPuzz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/scarbrob/RGBPuzz/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              Report Issue
            </a>
            <Link
              to="/privacy"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
