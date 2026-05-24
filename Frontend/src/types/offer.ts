export type OfferStatus = 'Draft' | 'Active' | 'Paused' | 'Expired'

export interface OfferSummary {
  id: string
  businessId: string
  businessName: string
  title: string
  description: string | null
  originalPrice: number
  offerPrice: number
  startsAt: string
  endsAt: string
  status: OfferStatus
  updatedAt: string
}

export interface OfferQuery {
  search?: string
  status?: string
  businessId?: string
  page?: number
  pageSize?: number
}

export interface UpsertOfferPayload {
  businessId: string
  title: string
  description?: string | null
  originalPrice: number
  offerPrice: number
  startsAt: string
  endsAt: string
}
