export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  businesses: {
    list: ['businesses'] as const,
    detail: (id: string) => ['businesses', id] as const,
  },
  offers: {
    list: (filters: Record<string, any>) => ['offers', filters] as const,
    detail: (id: string) => ['offers', id] as const,
  },
  slots: {
    list: (offerId: string) => ['slots', 'offer', offerId] as const,
  },
  bookings: {
    list: ['bookings'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
  },
} as const
