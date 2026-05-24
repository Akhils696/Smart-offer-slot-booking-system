import type { BookingSummary } from './booking'

export interface DashboardSummary {
  totalOffers: number
  activeOffers: number
  totalBookings: number
  todayBookings: number
  totalCapacity: number
  bookedSeats: number
  availableSeats: number
  conversionRate: number
  recentBookings: BookingSummary[]
}
