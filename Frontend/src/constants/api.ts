export const API_VERSION = 'v1'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  businesses: '/businesses',
  offers: '/offers',
  bookings: '/bookings',
} as const
