import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SignInModal from './SignInModal'

export default function Header() {
  const { user, signOut } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)

  return (
    <>
      <header className="bg-game-card shadow-lg">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-3xl font-bold text-game-primary">
              RGBPuzz
            </Link>
            <div className="flex gap-6">
              <Link to="/daily" className="text-white hover:text-game-primary transition-colors">
                Daily
              </Link>
              <Link to="/levels" className="text-white hover:text-game-primary transition-colors">
                Levels
              </Link>
              <Link to="/stats" className="text-white hover:text-game-primary transition-colors">
                Stats
              </Link>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{user.displayName || user.email}</span>
                <button
                  onClick={signOut}
                  className="text-white hover:text-game-primary transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="text-white hover:text-game-primary transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>
      
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  )
}
