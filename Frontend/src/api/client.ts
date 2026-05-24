import axios from 'axios'
import { getAccessToken, clearSession } from '../services/auth-storage'
import { ROUTES } from '../constants/routes'

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
      if (status === 401) {
        if (!isLoggingOut) {
          isLoggingOut = true
          clearSession()
          window.location.href = ROUTES.auth.login
        }
      } else if (status === 403) {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)
