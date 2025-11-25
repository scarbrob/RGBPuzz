import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import SignInModal from './SignInModal'

export default function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showSignIn, setShowSignIn] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <header className="bg-light-bg dark:bg-dark-bg border-b border-light-border/30 dark:border-dark-border/30">
        <nav className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
              RGBPuzz
            </Link>
            
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex gap-4 lg:gap-6">
                <Link to="/daily" className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors font-medium">
                  Daily
                </Link>
                <Link to="/levels" className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors font-medium">
                  Levels
                </Link>
                <Link to="/stats" className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors font-medium">
                  Stats
                </Link>
                {user ? (
                  <>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary text-sm">{user.displayName || user.email}</span>
                    <button
                      onClick={signOut}
                      className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowSignIn(true)}
                    className="text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors font-medium"
                  >
                    Sign In
                  </button>
                )}
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
              <div className="relative md:hidden">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-light-surface/30 dark:hover:bg-dark-surface/20 transition-colors"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6 text-light-text-primary dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-light-surface dark:bg-dark-surface shadow-lg border border-light-border/30 dark:border-dark-border/30 z-50">
                    <Link
                      to="/daily"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 text-light-text-primary dark:text-dark-text-primary hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors first:rounded-t-lg"
                    >
                      Daily Challenge
                    </Link>
                    <Link
                      to="/levels"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 text-light-text-primary dark:text-dark-text-primary hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
                    >
                      Levels
                    </Link>
                    <Link
                      to="/stats"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 text-light-text-primary dark:text-dark-text-primary hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
                    >
                      Stats
                    </Link>
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary border-t border-light-border/30 dark:border-dark-border/30">
                          {user.displayName || user.email}
                        </div>
                        <button
                          onClick={() => {
                            signOut()
                            setShowMenu(false)
                          }}
                          className="block w-full text-left px-4 py-3 text-light-text-primary dark:text-dark-text-primary hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors last:rounded-b-lg"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowSignIn(true)
                          setShowMenu(false)
                        }}
                        className="block w-full text-left px-4 py-3 text-light-text-primary dark:text-dark-text-primary hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors border-t border-light-border/30 dark:border-dark-border/30 last:rounded-b-lg"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  )
}
