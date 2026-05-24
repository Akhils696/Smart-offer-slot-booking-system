export type OfferStatus = 'draft' | 'active' | 'paused' | 'expired'

export interface OfferSummary {
  id: string
  businessName: string
  title: string
  discountLabel: string
  startsAt: string
  endsAt: string
  status: OfferStatus
}
