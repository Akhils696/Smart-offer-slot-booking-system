export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow' | 'Expired'

export interface BookingSummary {
  id: string
  userId: string | null
  offerSlotId: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  peopleCount: number
  specialNote: string | null
  referenceCode: string
  status: BookingStatus
  slotStartsAt: string
  slotEndsAt: string
  offerTitle: string
  businessName: string
  createdAt: string
}
