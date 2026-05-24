import { CalendarCheck, LogIn } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { ROUTES } from '../constants/routes'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border bg-white">
        <Container className="flex h-16 items-center justify-between">
          <NavLink to={ROUTES.public.home} className="flex items-center gap-2 font-semibold text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-600 text-white">
              <CalendarCheck size={18} />
            </span>
            Smart Offer Booking
          </NavLink>
          <NavLink
            to={ROUTES.auth.login}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            <LogIn size={16} />
            Sign in
          </NavLink>
        </Container>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
