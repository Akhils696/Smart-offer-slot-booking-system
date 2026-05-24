export type UserRole = 'Customer' | 'BusinessOwner' | 'Admin'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  user: AuthUser
}

export interface ApiResponse<T> {
  succeeded: boolean
  data: T | null
  message: string | null
  errors: string[]
}
