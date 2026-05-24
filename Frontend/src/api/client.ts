import axios from 'axios'
import { getAccessToken } from '../services/auth-storage'

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
