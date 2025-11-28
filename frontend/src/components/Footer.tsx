export default function Footer() {
  return (
    <footer className="mt-auto border-t border-light-border/30 dark:border-dark-border/30 bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            © {new Date().getFullYear()} RGBPuzz. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm">
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
