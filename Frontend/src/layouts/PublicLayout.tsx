import { AlertCircle, CalendarCheck, Clock, LayoutDashboard, LogIn, LogOut, RefreshCw, Ticket, User, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Container } from '../components/common/Container'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { getBookings, updateBookingStatus } from '../services/booking-service'
import { formatDateTime } from '../utils/format'
import { useDialogA11y } from '../hooks/useDialogA11y'

export function PublicLayout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const queryClient = useQueryClient()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dialogRef = useDialogA11y<HTMLDivElement>({
    isOpen: isDrawerOpen,
    onClose: () => setIsDrawerOpen(false),
  })

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
    enabled: isAuthenticated,
  })

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, { status: 'Cancelled' }),
    onSuccess: (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Failed to cancel booking.')
        return
      }
      toast.success('Your reservation has been cancelled successfully.')
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to cancel booking.')
    },
  })

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    setIsDrawerOpen(false)
    toast.success('Signed out successfully.')
    navigate(ROUTES.public.home)
  }

  const userBookings = bookingsQuery.data ?? []

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 shadow-sm backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <NavLink to={ROUTES.public.home} className="flex items-center gap-2 font-bold text-slate-900 transition hover:opacity-90">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-soft">
              <CalendarCheck size={18} />
            </span>
            <span className="text-lg tracking-tight">Smart Offer</span>
          </NavLink>

          <nav className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <User size={12} />
                  </span>
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                </button>

                {isDropdownOpen ? (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-fade-up rounded-lg border border-slate-200 bg-white p-1.5 shadow-lift ring-1 ring-black/5 focus:outline-none">
                      <div className="mb-1 border-b border-slate-100 px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role: {user.role}</p>
                        <p className="truncate text-sm font-semibold text-slate-800">{user.email}</p>
                      </div>

                      {user.role === 'Customer' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDrawerOpen(true)
                            setIsDropdownOpen(false)
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Ticket size={15} className="text-slate-500" />
                          My Reservations
                        </button>
                      ) : (
                        <NavLink
                          to={ROUTES.admin.dashboard}
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <LayoutDashboard size={15} className="text-slate-500" />
                          Admin Workspace
                        </NavLink>
                      )}

                      <hr className="my-1 border-slate-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={ROUTES.auth.register} className="px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
                  Sign up
                </Link>
                <Link
                  to={ROUTES.auth.login}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
              </div>
            )}
          </nav>
        </Container>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <Container className="text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Smart Offer Booking System. Built for reliable slot reservations.</p>
        </Container>
      </footer>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div
              ref={dialogRef}
              className="flex h-full w-screen max-w-md animate-slide-in flex-col border-l border-slate-200 bg-white shadow-lift"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">My Reservations</h3>
                  <p className="text-xs text-slate-400">Track and manage your upcoming offer slots.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {bookingsQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-primary-500" />
                    <span className="text-xs">Syncing your reservations...</span>
                  </div>
                ) : bookingsQuery.isError ? (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                    <span>Failed to retrieve your reservations. Please try again.</span>
                  </div>
                ) : userBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                      <Ticket size={20} />
                    </div>
                    <h4 className="mt-4 text-sm font-semibold text-slate-800">No active bookings found</h4>
                    <p className="mt-1 max-w-[240px] text-xs text-slate-400">
                      Discover active, limited-time offers on the home page and book a slot to get started.
                    </p>
                    <Button type="button" variant="secondary" className="mt-6 text-xs" onClick={() => setIsDrawerOpen(false)}>
                      Browse Offers
                    </Button>
                  </div>
                ) : (
                  userBookings.map((booking) => {
                    const isUpcoming = new Date(booking.slotStartsAt) > new Date()
                    const isConfirmed = booking.status === 'Confirmed'

                    return (
                      <div key={booking.id} className="motion-card space-y-3.5 rounded-lg border border-slate-200 bg-white p-4.5 shadow-sm hover:border-slate-300">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                              {booking.businessName}
                            </span>
                            <h4 className="text-sm font-bold leading-tight text-slate-800">{booking.offerTitle}</h4>
                          </div>
                          <Badge
                            tone={
                              booking.status === 'Confirmed'
                                ? 'success'
                                : booking.status === 'Completed'
                                  ? 'muted'
                                  : booking.status === 'Cancelled'
                                    ? 'warning'
                                    : 'muted'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="space-y-1.5 rounded border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-500">
                          <p className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            <span className="font-medium text-slate-700">{formatDateTime(booking.slotStartsAt)}</span>
                          </p>
                          <p>
                            Guests: <span className="font-semibold text-slate-700">{booking.peopleCount} people</span>
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">Ref: {booking.referenceCode}</p>
                        </div>

                        {isConfirmed && isUpcoming ? (
                          <div className="flex justify-end border-t border-slate-100 pt-3">
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                              disabled={cancelMutation.isPending}
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this reservation slot?')) {
                                  cancelMutation.mutate(booking.id)
                                }
                              }}
                            >
                              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
