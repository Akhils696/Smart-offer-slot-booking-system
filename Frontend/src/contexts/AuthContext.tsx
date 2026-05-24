import { useState, type ReactNode } from 'react'
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth'
import { clearSession, getStoredUser, setSession } from '../services/auth-storage'
import { login as loginRequest, register as registerRequest } from '../services/auth-service'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  async function login(payload: LoginRequest) {
    const response = await loginRequest(payload)
    setSession(response.accessToken, response.user)
    setUser(response.user)
  }

  async function register(payload: RegisterRequest) {
    const response = await registerRequest(payload)
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
        isReady: true,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
