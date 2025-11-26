import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser'
import { msalConfig, loginRequest } from '../config/authConfig'
import { initializeUserStats } from '../services/statsService'

interface User {
  id: string
  email: string
  displayName?: string
  provider?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signInWithMicrosoft: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize MSAL instance
export let msalInstance: PublicClientApplication | null = null

const initializeMsal = async () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig)
    await msalInstance.initialize()
  }
  return msalInstance
}

// Convert MSAL account to our User format
const accountToUser = (account: AccountInfo): User => {
  return {
    id: account.homeAccountId,
    email: account.username,
    displayName: account.name || account.username,
    provider: account.idTokenClaims?.['idp'] as string || 'azure',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const msal = await initializeMsal()
      
      // Handle redirect response (after login)
      const response = await msal.handleRedirectPromise()
      
      if (response && response.account) {
        const userData = accountToUser(response.account)
        setUser(userData)
        localStorage.setItem('rgbpuzz-user', JSON.stringify(userData))
        // Clear session storage for fresh start after sign in
        sessionStorage.clear()
        // Initialize user stats in background
        initializeUserStats(userData.id, userData.email, userData.displayName)
      } else {
        // Only restore user if they explicitly logged in before
        // Don't auto-login from MSAL cache
        const savedUser = localStorage.getItem('rgbpuzz-user')
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
          } catch (error) {
            console.error('Failed to parse saved user:', error)
            localStorage.removeItem('rgbpuzz-user')
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      const msal = await initializeMsal()
      
      // Use domain_hint to specify identity provider
      const loginRequestWithHint = {
        ...loginRequest,
        extraQueryParameters: {
          domain_hint: 'microsoft.com',
        },
      }
      
      await msal.loginRedirect(loginRequestWithHint)
    } catch (error) {
      console.error('Sign in with Microsoft error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const msal = await initializeMsal()
      
      const loginRequestWithHint = {
        ...loginRequest,
        extraQueryParameters: {
          domain_hint: 'google.com',
        },
      }
      
      await msal.loginRedirect(loginRequestWithHint)
    } catch (error) {
      console.error('Sign in with Google error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const msal = await initializeMsal()
      
      setUser(null)
      localStorage.removeItem('rgbpuzz-user')
      sessionStorage.clear()
      
      await msal.logoutRedirect()
    } catch (error) {
      console.error('Sign out error:', error)
      // Clear local state even if logout fails
      setUser(null)
      localStorage.removeItem('rgbpuzz-user')
      sessionStorage.clear()
      window.location.reload()
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithMicrosoft, signInWithGoogle, signOut }}>
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
