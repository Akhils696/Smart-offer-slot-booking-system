import { PageHeader } from '../../components/ui/PageHeader'

const bookings = ['Aarav Mehta', 'Nisha Rao', 'Kiran Patel']

export function Bookings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Review slot reservations and customer status." />
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {bookings.map((booking) => (
          <div key={booking} className="grid gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:grid-cols-3">
            <span className="text-sm font-medium text-ink">{booking}</span>
            <span className="text-sm text-muted">Sample offer slot</span>
            <span className="text-sm font-medium text-primary-700">Confirmed</span>
          </div>
        ))}
      </div>
    </div>
  )
}
