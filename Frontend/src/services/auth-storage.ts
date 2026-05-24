import type { AuthUser } from '../types/auth'

const ACCESS_TOKEN_KEY = 'access_token'
const AUTH_USER_KEY = 'auth_user'

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setSession(accessToken: string, user: AuthUser) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem(AUTH_USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    clearSession()
    return null
  }
}
