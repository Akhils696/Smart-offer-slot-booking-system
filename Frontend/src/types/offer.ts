export type OfferStatus = 'Draft' | 'Active' | 'Paused' | 'Expired' | 'Cancelled'

export interface OfferSummary {
  id: string
  businessId: string
  businessName: string
  title: string
  description: string | null
  originalPrice: number
  offerPrice: number
  discountPercentage: number
  category: string
  termsAndConditions: string | null
  maxBookingPerCustomer: number
  startsAt: string
  endsAt: string
  status: OfferStatus
  updatedAt: string
}

export interface OfferQuery {
  search?: string
  status?: string
  businessId?: string
  businessType?: string
  category?: string
  date?: string
  maxPrice?: number
  availableOnly?: boolean
  page?: number
  pageSize?: number
}

export interface UpsertOfferPayload {
  businessId: string
  title: string
  description?: string | null
  originalPrice: number
  offerPrice: number
  category: string
  termsAndConditions?: string | null
  maxBookingPerCustomer: number
  status: string
  startsAt: string
  endsAt: string
}
