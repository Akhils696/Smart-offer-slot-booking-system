export const ROUTES = {
  public: {
    home: '/',
    offerDetails: '/offers/:offerId',
  },
  auth: {
    login: '/login',
  },
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    businesses: '/admin/businesses',
    offers: '/admin/offers',
    bookings: '/admin/bookings',
  },
} as const
