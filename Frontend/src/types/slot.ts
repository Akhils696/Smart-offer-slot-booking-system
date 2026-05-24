export interface SlotSummary {
  id: string
  offerId: string
  startsAt: string
  endsAt: string
  capacity: number
  bookedCount: number
  availableCount: number
  status: 'Active' | 'Full' | 'Expired'
}

export interface UpsertSlotPayload {
  offerId: string
  startsAt: string
  endsAt: string
  capacity: number
}
