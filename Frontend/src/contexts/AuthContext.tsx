import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, LoginRequest } from '../types/auth'
import { clearSession, getStoredUser, setSession } from '../services/auth-storage'
import { login as loginRequest } from '../services/auth-service'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setIsReady(true)
  }, [])

  async function login(payload: LoginRequest) {
    const response = await loginRequest(payload)
    setSession(response.accessToken, response.user)
    setUser(response.user)
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
