import { CalendarDays, LayoutDashboard, Tag, TicketCheck, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { ROUTES } from '../constants/routes'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/cn'

const navItems = [
  { label: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: 'Businesses', href: ROUTES.admin.businesses, icon: CalendarDays },
  { label: 'Offers', href: ROUTES.admin.offers, icon: Tag },
  { label: 'Bookings', href: ROUTES.admin.bookings, icon: TicketCheck },
]

export function AdminLayout() {
  const { logout, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-white transition-transform duration-200 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6 font-semibold">
          <span className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-600 text-white">
              <CalendarDays size={18} />
            </span>
            Smart Offer
          </span>
          <button
            type="button"
            className="rounded p-1 hover:bg-surface text-ink"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink',
                  isActive && 'bg-primary-50 text-primary-700',
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-600 text-white">
            <CalendarDays size={18} />
          </span>
          Smart Offer
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink',
                  isActive && 'bg-primary-50 text-primary-700',
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
          <Container className="flex h-16 items-center justify-between lg:max-w-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-md border border-border p-2 text-muted hover:bg-surface hover:text-ink lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs font-medium uppercase text-muted">Admin workspace</p>
                <p className="text-sm font-semibold text-ink">Offer operations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-md border border-border bg-white px-3 py-2 text-sm text-muted sm:block">
                {user?.fullName ?? 'Admin'}
              </div>
              <Button type="button" variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </Container>
        </header>
        <main className="py-8">
          <Container className="lg:max-w-none">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}
