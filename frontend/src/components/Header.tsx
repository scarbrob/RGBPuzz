import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  // Close menu on route change
  useEffect(() => {
    setShowMenu(false)
  }, [location.pathname])

  const navLinks = [
    { to: '/daily', label: 'Daily' },
    { to: '/levels', label: 'Levels' },
    { to: '/spectrum', label: 'Spectrum' },
    { to: '/stats', label: 'Stats' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40"
      style={{
        background: theme === 'dark'
          ? 'rgba(15, 11, 26, 0.85)'
          : 'rgba(245, 243, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
      }}
    >
      {/* Gradient border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-light-accent/20 dark:via-dark-accent/20 to-transparent" />
      <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
            🎨 RGBPuzz
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-light-accent/10 dark:bg-dark-accent/15 text-light-accent dark:text-dark-accent'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent hover:bg-light-accent/5 dark:hover:bg-dark-accent/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Mobile Menu */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors text-light-text-primary dark:text-dark-text-primary"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden shadow-lg border border-light-border/50 dark:border-dark-border/50 animate-slide-in z-50"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(26, 21, 40, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  }}
                >
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowMenu(false)}
                      className={`block px-4 py-3 text-sm font-medium transition-colors ${
                        isActive(link.to)
                          ? 'bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent'
                          : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-accent/5 dark:hover:bg-dark-accent/5 hover:text-light-accent dark:hover:text-dark-accent'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
