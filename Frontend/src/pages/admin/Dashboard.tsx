import { BarChart3, CalendarCheck, CircleDollarSign, TicketCheck, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '../../components/ui/PageHeader'
import { getDashboardSummary } from '../../services/dashboard-service'
import { queryKeys } from '../../lib/queryKeys'
import { formatDateTime } from '../../utils/format'

export function Dashboard() {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: getDashboardSummary,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className="skeleton-shimmer h-4 w-24 animate-shimmer rounded" />
            <div className="mt-5 skeleton-shimmer h-9 w-28 animate-shimmer rounded" />
            <div className="mt-4 skeleton-shimmer h-3 w-full animate-shimmer rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        Failed to load dashboard metrics. Please try again.
      </div>
    )
  }

  const utilization = summary.totalCapacity > 0 ? Math.min(100, summary.conversionRate) : 0
  const cards = [
    {
      label: 'Active Offers',
      value: `${summary.activeOffers} / ${summary.totalOffers}`,
      desc: 'Currently listed offers',
      icon: CircleDollarSign,
    },
    {
      label: 'Total Bookings',
      value: summary.totalBookings.toString(),
      desc: `${summary.todayBookings} created today`,
      icon: TicketCheck,
    },
    {
      label: 'Seats Utilization',
      value: `${summary.bookedSeats} / ${summary.totalCapacity}`,
      desc: `${summary.availableSeats} seats still available`,
      icon: BarChart3,
    },
    {
      label: 'Conversion Rate',
      value: `${summary.conversionRate}%`,
      desc: 'Booked seats against capacity',
      icon: TrendingUp,
    },
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'NoShow':
        return 'bg-slate-50 text-slate-700 border-slate-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="A focused operating view for offer activity and slot utilization." />

      <section className="animate-fade-up overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Today at a glance</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{summary.todayBookings} bookings created today</h2>
            <p className="mt-2 text-sm text-muted">
              Capacity is {utilization}% booked across all active slots. Keep an eye on high-demand offers before they sell out.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary-600 transition-all duration-700" style={{ width: `${utilization}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <CalendarCheck size={20} className="text-primary-600" />
            <p className="mt-4 text-sm font-semibold text-ink">Operational signal</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {summary.availableSeats > 0
                ? `${summary.availableSeats} seats remain available for public booking.`
                : 'All configured capacity is currently booked.'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <section
            key={card.label}
            className="motion-card animate-fade-up rounded-xl border border-border bg-white p-5 shadow-sm hover:border-primary-100 hover:shadow-lift"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{card.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <card.icon size={18} />
              </span>
            </div>
            <strong className="mt-4 block text-3xl font-semibold text-ink">{card.value}</strong>
            <span className="mt-1 block text-xs text-muted">{card.desc}</span>
          </section>
        ))}
      </div>

      <div className="animate-fade-up rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Recent Bookings</h2>
          <p className="mt-0.5 text-xs text-muted">Latest reservations across your offers.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Offer</th>
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Slot Time</th>
                <th className="px-5 py-3 text-center">People</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-ink">
              {summary.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <TicketCheck className="mx-auto mb-3 text-muted" size={28} />
                    <p className="font-medium text-ink">No bookings recorded yet</p>
                    <p className="mt-1 text-xs text-muted">Reservations will appear here as soon as customers book slots.</p>
                  </td>
                </tr>
              ) : (
                summary.recentBookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="mt-0.5 text-xs text-muted">{booking.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{booking.offerTitle}</td>
                    <td className="px-5 py-3.5 text-muted">{booking.businessName}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted">
                      {formatDateTime(booking.slotStartsAt)}
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium">{booking.peopleCount}</td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status === 'NoShow' ? 'No Show' : booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
