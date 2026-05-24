export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface BookingSummary {
  id: string
  customerName: string
  offerTitle: string
  slotStartsAt: string
  status: BookingStatus
}
