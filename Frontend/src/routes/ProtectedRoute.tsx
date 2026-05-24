import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isReady, user } = useAuth()

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="rounded-lg border border-border bg-white px-5 py-4 text-sm text-muted shadow-soft">
          Checking your session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location }} />
  }

  if (user?.role === 'Customer') {
    return <Navigate to={ROUTES.public.home} replace />
  }

  return <Outlet />
}
