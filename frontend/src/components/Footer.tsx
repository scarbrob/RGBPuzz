export default function Footer() {
  return (
    <footer className="mt-auto border-t border-light-border/30 dark:border-dark-border/30 bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
        <div className="text-[10px] sm:text-xs text-light-text-secondary dark:text-dark-text-secondary">
          © {new Date().getFullYear()} Benjamin Scarbrough. All rights reserved.
        </div>            <div className="flex gap-4 sm:gap-6 text-[10px] sm:text-xs">
            <a
              href="https://github.com/scarbrob/RGBPuzz/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              Report Issue
            </a>
            <a
              href="/privacy"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
