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
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Failed to load dashboard metrics. Please try again.
      </div>
    )
  }

  const cards = [
    { label: 'Active Offers', value: `${summary.activeOffers} / ${summary.totalOffers}`, desc: 'Active offers currently listed' },
    { label: 'Total Bookings', value: summary.totalBookings.toString(), desc: `${summary.todayBookings} bookings made today` },
    { label: 'Seats Utilization', value: `${summary.bookedSeats} / ${summary.totalCapacity}`, desc: `${summary.availableSeats} seats still available` },
    { label: 'Conversion Rate', value: `${summary.conversionRate}%`, desc: 'Ratio of booked seats to capacity' },
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
      <PageHeader title="Dashboard" description="A quiet overview for offer activity and slot utilization." />
      
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <section key={card.label} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">{card.label}</p>
            <strong className="mt-2 block text-3xl font-semibold text-ink">{card.value}</strong>
            <span className="mt-1 block text-xs text-muted">{card.desc}</span>
          </section>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Recent Bookings</h2>
          <p className="text-xs text-muted mt-0.5">The most recent reservations made across your offers.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-gray-50/50 text-xs font-semibold text-muted uppercase tracking-wider">
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
                  <td colSpan={6} className="px-5 py-8 text-center text-muted">
                    No bookings recorded yet.
                  </td>
                </tr>
              ) : (
                summary.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-xs text-muted mt-0.5">{booking.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{booking.offerTitle}</td>
                    <td className="px-5 py-3.5 text-muted">{booking.businessName}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted">
                      {formatDateTime(booking.slotStartsAt)}
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium">{booking.peopleCount}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
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
