export interface BusinessSummary {
  id: string
  name: string
  slug: string
  description: string | null
  phoneNumber: string | null
  createdAt: string
  updatedAt: string
}

export interface UpsertBusinessPayload {
  name: string
  slug: string
  description?: string | null
  phoneNumber?: string | null
}
