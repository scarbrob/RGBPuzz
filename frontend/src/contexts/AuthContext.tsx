import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  displayName?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('rgbpuzz-user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('rgbpuzz-user')
      }
    }
    setIsLoading(false)
  }, [])

  const signInWithGoogle = async () => {
    // TODO: Implement Google OAuth
    // For now, create a mock user
    const mockUser: User = {
      id: `google-${Date.now()}`,
      email: 'user@gmail.com',
      displayName: 'Google User'
    }
    
    setUser(mockUser)
    localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
  }

  const signInWithApple = async () => {
    // TODO: Implement Apple OAuth
    const mockUser: User = {
      id: `apple-${Date.now()}`,
      email: 'user@icloud.com',
      displayName: 'Apple User'
    }
    
    setUser(mockUser)
    localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
  }

  const signInWithMicrosoft = async () => {
    // TODO: Implement Microsoft OAuth
    const mockUser: User = {
      id: `microsoft-${Date.now()}`,
      email: 'user@outlook.com',
      displayName: 'Microsoft User'
    }
    
    setUser(mockUser)
    localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
  }

  const signInWithDiscord = async () => {
    // TODO: Implement Discord OAuth
    const mockUser: User = {
      id: `discord-${Date.now()}`,
      email: 'user@discord.com',
      displayName: 'Discord User'
    }
    
    setUser(mockUser)
    localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
  }

  const signInWithFacebook = async () => {
    // TODO: Implement Facebook OAuth
    const mockUser: User = {
      id: `facebook-${Date.now()}`,
      email: 'user@facebook.com',
      displayName: 'Facebook User'
    }
    
    setUser(mockUser)
    localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('rgbpuzz-user')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signInWithApple, signInWithMicrosoft, signInWithDiscord, signInWithFacebook, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
