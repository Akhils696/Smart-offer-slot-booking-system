export const ROUTES = {
  public: {
    home: '/',
    offerDetails: '/offers/:offerId',
    bookingConfirmation: '/booking/confirmation/:bookingId',
  },
  auth: {
    login: '/login',
    register: '/register',
  },
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    businesses: '/admin/businesses',
    offers: '/admin/offers',
    bookings: '/admin/bookings',
  },
} as const
