export interface BusinessSummary {
  id: string
  name: string
  slug: string
  description: string | null
  phoneNumber: string | null
  businessType: string
  ownerName: string
  phone: string
  email: string
  address: string
  city: string
  logoUrl: string | null
  openingTime: string
  closingTime: string
  createdAt: string
  updatedAt: string
}

export interface UpsertBusinessPayload {
  name: string
  slug: string
  description?: string | null
  phoneNumber?: string | null
  businessType: string
  ownerName: string
  phone: string
  email: string
  address: string
  city: string
  logoUrl?: string | null
  openingTime: string
  closingTime: string
}
