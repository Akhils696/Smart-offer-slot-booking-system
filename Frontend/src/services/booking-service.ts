import { apiClient } from '../api/client'
import type { ApiResponse } from '../types/api'
import type { BookingSummary } from '../types/booking'

export interface CreateBookingPayload {
  offerSlotId: string
  customerName: string
  customerEmail?: string | null
  customerPhone: string
  peopleCount: number
  specialNote?: string | null
}

export interface UpdateBookingStatusPayload {
  status: string
}

export async function getBookings() {
  const response = await apiClient.get<ApiResponse<BookingSummary[]>>('/bookings')
  return response.data.data ?? []
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await apiClient.post<ApiResponse<BookingSummary>>('/bookings', payload)
  return response.data
}

export async function getBookingById(bookingId: string) {
  const response = await apiClient.get<ApiResponse<BookingSummary>>(`/bookings/${bookingId}`)
  return response.data.data
}

export async function updateBookingStatus(bookingId: string, payload: UpdateBookingStatusPayload) {
  const response = await apiClient.put<ApiResponse<BookingSummary>>(`/bookings/${bookingId}/status`, payload)
  return response.data
}
