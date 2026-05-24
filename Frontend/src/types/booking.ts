export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired'

export interface BookingSummary {
  id: string
  userId: string | null
  offerSlotId: string
  customerName: string
  customerEmail: string
  referenceCode: string
  status: BookingStatus
  slotStartsAt: string
  slotEndsAt: string
  offerTitle: string
  businessName: string
  createdAt: string
}
