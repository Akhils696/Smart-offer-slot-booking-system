import { apiClient } from '../api/client'
import { API_ENDPOINTS } from '../constants/api'
import type { ApiResponse } from '../types/api'
import type { LoginRequest, LoginResponse } from '../types/auth'

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.auth.login, payload)

  if (!response.data.succeeded || !response.data.data) {
    throw new Error(response.data.message ?? 'Login failed.')
  }

  return response.data.data
}
