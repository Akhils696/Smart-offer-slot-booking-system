import { Navigate, createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AdminLayout } from '../layouts/AdminLayout'
import { AppLayout } from '../layouts/AppLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { ROUTES } from '../constants/routes'
import { ProtectedRoute } from './ProtectedRoute'
import { PageSkeleton } from '../components/common/PageSkeleton'

const Dashboard = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.Dashboard })))
const Businesses = lazy(() => import('../pages/admin/Businesses').then(m => ({ default: m.Businesses })))
const Offers = lazy(() => import('../pages/admin/Offers').then(m => ({ default: m.Offers })))
const Bookings = lazy(() => import('../pages/admin/Bookings').then(m => ({ default: m.Bookings })))
const Login = lazy(() => import('../pages/auth/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('../pages/auth/Register').then(m => ({ default: m.Register })))
const Home = lazy(() => import('../pages/public/Home').then(m => ({ default: m.Home })))
const OfferDetails = lazy(() => import('../pages/public/OfferDetails').then(m => ({ default: m.OfferDetails })))
const BookingConfirmation = lazy(() => import('../pages/public/BookingConfirmation').then(m => ({ default: m.BookingConfirmation })))

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: ROUTES.public.home, element: <Suspense fallback={<PageSkeleton />}><Home /></Suspense> },
          { path: ROUTES.public.offerDetails, element: <Suspense fallback={<PageSkeleton />}><OfferDetails /></Suspense> },
          { path: ROUTES.public.bookingConfirmation, element: <Suspense fallback={<PageSkeleton />}><BookingConfirmation /></Suspense> },
        ],
      },
      { path: ROUTES.auth.login, element: <Suspense fallback={<PageSkeleton />}><Login /></Suspense> },
      { path: ROUTES.auth.register, element: <Suspense fallback={<PageSkeleton />}><Register /></Suspense> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.admin.root,
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to={ROUTES.admin.dashboard} replace /> },
              { path: ROUTES.admin.dashboard, element: <Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense> },
              { path: ROUTES.admin.businesses, element: <Suspense fallback={<PageSkeleton />}><Businesses /></Suspense> },
              { path: ROUTES.admin.offers, element: <Suspense fallback={<PageSkeleton />}><Offers /></Suspense> },
              { path: ROUTES.admin.bookings, element: <Suspense fallback={<PageSkeleton />}><Bookings /></Suspense> },
            ],
          },
        ],
      },
    ],
  },
])
