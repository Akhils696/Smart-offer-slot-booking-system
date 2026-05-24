import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { AppLayout } from '../layouts/AppLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { Bookings } from '../pages/admin/Bookings'
import { Dashboard } from '../pages/admin/Dashboard'
import { Offers } from '../pages/admin/Offers'
import { Login } from '../pages/auth/Login'
import { Home } from '../pages/public/Home'
import { OfferDetails } from '../pages/public/OfferDetails'
import { ROUTES } from '../constants/routes'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: ROUTES.public.home, element: <Home /> },
          { path: ROUTES.public.offerDetails, element: <OfferDetails /> },
        ],
      },
      { path: ROUTES.auth.login, element: <Login /> },
      {
        path: ROUTES.admin.root,
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.admin.dashboard} replace /> },
          { path: ROUTES.admin.dashboard, element: <Dashboard /> },
          { path: ROUTES.admin.offers, element: <Offers /> },
          { path: ROUTES.admin.bookings, element: <Bookings /> },
        ],
      },
    ],
  },
])
