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
    offers: '/admin/offers',
    bookings: '/admin/bookings',
  },
} as const
