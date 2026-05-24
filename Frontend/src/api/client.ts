import axios from 'axios'
import { getAccessToken, clearSession } from '../services/auth-storage'
import { ROUTES } from '../constants/routes'
import { API_ENDPOINTS } from '../constants/api'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7084/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isLoggingOut = false

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const requestUrl = error.config?.url ?? ''

      // Never treat a failed login attempt as a session expiry.
      // The login endpoint returns 422 for bad credentials (see AuthService),
      // but guard against 401 from the login route too just in case.
      const isLoginRequest = requestUrl.includes(API_ENDPOINTS.auth.login)

      if (status === 401 && !isLoginRequest) {
        // Token expired or missing — clear session and redirect to login once.
        if (!isLoggingOut) {
          isLoggingOut = true
          clearSession()
          // Reset flag after navigation so it works again on next session.
          setTimeout(() => { isLoggingOut = false }, 5000)
          window.location.href = ROUTES.auth.login
        }
      } else if (status === 403 && !isLoginRequest) {
        // Forbidden — user is authenticated but lacks permission.
        // Let individual components handle this rather than a silent redirect.
        // A toast or error boundary should surface this.
      }
    }
    return Promise.reject(error)
  }
)
