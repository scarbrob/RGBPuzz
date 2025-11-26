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
        // Check for existing session
        const accounts = msal.getAllAccounts()
        if (accounts.length > 0) {
          const userData = accountToUser(accounts[0])
          setUser(userData)
          localStorage.setItem('rgbpuzz-user', JSON.stringify(userData))
        } else {
          // Check localStorage as fallback
          const savedUser = localStorage.getItem('rgbpuzz-user')
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser))
            } catch (error) {
              console.error('Failed to parse saved user:', error)
              localStorage.removeItem('rgbpuzz-user')
            }
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
      // Check if we're in mock mode (no real Azure AD B2C configured)
      const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID
      
      if (!clientId || clientId === 'your-client-id' || clientId.startsWith('mock-')) {
        console.log('Using mock authentication for Microsoft')
        const mockUser: User = {
          id: `microsoft-${Date.now()}`,
          email: `user@microsoft.com`,
          displayName: `Microsoft User`,
          provider: 'microsoft',
        }
        setUser(mockUser)
        localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
        // Clear session storage for fresh start
        sessionStorage.clear()
        
        // Initialize user stats and wait for it to complete before reloading
        try {
          await initializeUserStats(mockUser.id, mockUser.email, mockUser.displayName)
        } catch (error) {
          console.error('Failed to initialize user stats during sign in:', error)
          // Continue anyway - stats will be created on first game/stats page visit
        }
        
        // Reload page to refresh all data
        window.location.reload()
        return
      }

      // Real Azure AD B2C authentication
      const msal = await initializeMsal()
      
      // Use domain_hint to specify identity provider
      const loginRequestWithHint = {
        ...loginRequest,
        extraQueryParameters: {
          domain_hint: 'microsoft.com', // This tells Azure AD B2C which IDP to use
        },
      }
      
      console.log('MSAL Config:', msalConfig)
      console.log('Login Request:', loginRequestWithHint)
      
      await msal.loginRedirect(loginRequestWithHint)
    } catch (error) {
      console.error(`Sign in with Microsoft error:`, error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Check if we're in mock mode
      const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID
      
      if (!clientId || clientId === 'your-client-id' || clientId.startsWith('mock-')) {
        console.log('Using mock authentication for Google')
        const mockUser: User = {
          id: `google-${Date.now()}`,
          email: `user@gmail.com`,
          displayName: `Google User`,
          provider: 'google',
        }
        setUser(mockUser)
        localStorage.setItem('rgbpuzz-user', JSON.stringify(mockUser))
        sessionStorage.clear()
        
        try {
          await initializeUserStats(mockUser.id, mockUser.email, mockUser.displayName)
        } catch (error) {
          console.error('Failed to initialize user stats during sign in:', error)
        }
        
        window.location.reload()
        return
      }

      // Real Azure authentication with Google provider
      const msal = await initializeMsal()
      
      const loginRequestWithHint = {
        ...loginRequest,
        extraQueryParameters: {
          domain_hint: 'google.com',
        },
      }
      
      console.log('MSAL Config:', msalConfig)
      console.log('Login Request (Google):', loginRequestWithHint)
      
      await msal.loginRedirect(loginRequestWithHint)
    } catch (error) {
      console.error(`Sign in with Google error:`, error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID
      
      if (!clientId || clientId === 'your-client-id' || clientId.startsWith('mock-')) {
        // Mock mode - just clear local state
        setUser(null)
        localStorage.removeItem('rgbpuzz-user')
        // Clear all session storage to prevent data leakage between users
        sessionStorage.clear()
        // Reload page to refresh all data
        window.location.reload()
        return
      }

      // Real Azure AD B2C sign out
      const msal = await initializeMsal()
      const accounts = msal.getAllAccounts()
      
      if (accounts.length > 0) {
        await msal.logoutRedirect({
          account: accounts[0],
        })
      }
      
      setUser(null)
      localStorage.removeItem('rgbpuzz-user')
      // Clear all session storage to prevent data leakage between users
      sessionStorage.clear()
      // Reload page to refresh all data
      window.location.reload()
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
