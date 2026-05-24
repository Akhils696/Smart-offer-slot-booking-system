import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Search,
  User,
  Mail,
  Calendar,
  Tag,
  CheckCircle2,
  Inbox,
  Clock,
  Building,
  Printer,
  Phone,
  Users
} from 'lucide-react'
import { getBookings, updateBookingStatus } from '../../services/booking-service'
import { getApiErrorMessage } from '../../utils/http'
import { formatDateTime } from '../../utils/format'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'

export function Bookings() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow' | 'Expired'>('All')

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  })

  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow' }) => {
      return updateBookingStatus(bookingId, { status })
    },
    onSuccess: (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Failed to update booking status.')
        return
      }
      toast.success(response.message ?? 'Booking status updated successfully.')
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update booking status.'))
    },
  })

  const bookings = bookingsQuery.data ?? []

  // Filter bookings based on search term and status tab
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.customerEmail && booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.offerTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = (bookingId: string, status: 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow') => {
    statusMutation.mutate({ bookingId, status })
  }

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      toast.error('No bookings to export.')
      return
    }

    const headers = ['Reference Code', 'Customer Name', 'Phone', 'Email', 'Offer Title', 'Business Name', 'Slot Time', 'Guests', 'Status', 'Booked At']
    
    const rows = filteredBookings.map(b => [
      b.referenceCode,
      b.customerName,
      b.customerPhone,
      b.customerEmail || '',
      b.offerTitle,
      b.businessName,
      b.slotStartsAt,
      b.peopleCount,
      b.status,
      b.createdAt
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Bookings exported successfully.')
  }

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'default'
      case 'Completed':
        return 'success'
      case 'NoShow':
        return 'warning'
      case 'Cancelled':
      case 'Expired':
      default:
        return 'muted'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Monitor system-wide customer slot reservations, track attendance, and manage reservation lifecycles."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Confirmed', 'Cancelled', 'Completed', 'NoShow', 'Expired'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold tracking-wide transition whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-transparent text-muted hover:bg-slate-100'
              }`}
            >
              {tab === 'NoShow' ? 'No Show' : tab}
            </button>
          ))}
        </div>

        {/* Action Controls & Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleExportCSV} 
            className="h-9 px-3 text-xs border border-border bg-white text-muted hover:bg-slate-100 flex items-center gap-1.5 shrink-0"
          >
            <Printer size={14} /> Export CSV
          </Button>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-white pl-10 pr-4 text-xs text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {bookingsQuery.isLoading ? (
        <section className="rounded-lg border border-border bg-white p-6 text-sm text-muted">
          Loading booking reservations...
        </section>
      ) : bookingsQuery.isError ? (
        <section className="rounded-lg border border-border bg-white p-6 text-sm text-muted">
          We could not retrieve slot bookings right now. Please try again.
        </section>
      ) : filteredBookings.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border bg-white p-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted">
            <Inbox size={20} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-ink">No reservations found</h3>
          <p className="mt-1 text-xs text-muted">
            {searchTerm || statusFilter !== 'All'
              ? 'Try modifying your search query or filter options.'
              : 'New customer bookings will appear here as soon as they are made.'}
          </p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
          {/* Table Header (Hidden on Mobile) */}
          <div className="hidden border-b border-border bg-surface/50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted sm:grid sm:grid-cols-12 sm:gap-4">
            <div className="sm:col-span-3">Customer</div>
            <div className="sm:col-span-3">Offer & Business</div>
            <div className="sm:col-span-2">Scheduled Slot</div>
            <div className="sm:col-span-2">Reference & Guests</div>
            <div className="sm:col-span-2 text-right">Actions</div>
          </div>

          {/* Bookings List */}
          <div className="divide-y divide-border">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="grid gap-3 p-5 text-sm sm:grid-cols-12 sm:gap-4 sm:items-center hover:bg-slate-50/50 transition"
              >
                {/* Column 1: Customer Details */}
                <div className="space-y-1 sm:col-span-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <User size={13} className="text-muted" />
                      {booking.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
                    <Phone size={12} className="text-muted" />
                    <span>{booking.customerPhone}</span>
                  </div>
                  {booking.customerEmail && (
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Mail size={12} />
                      <span>{booking.customerEmail}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-muted/80 flex items-center gap-1">
                    <Clock size={11} />
                    <span>Booked {formatDateTime(booking.createdAt)}</span>
                  </div>
                </div>

                {/* Column 2: Offer and Business Details */}
                <div className="space-y-0.5 sm:col-span-3">
                  <span className="font-medium text-ink block truncate">{booking.offerTitle}</span>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Building size={12} className="shrink-0" />
                    {booking.businessName}
                  </span>
                </div>

                {/* Column 3: Scheduled Slot Timing */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-ink/90 font-medium">
                    <Calendar size={13} className="text-muted shrink-0" />
                    <span>{formatDateTime(booking.slotStartsAt)}</span>
                  </div>
                </div>

                {/* Column 4: Reference Code & Status Badge */}
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2 sm:flex-col sm:items-start sm:gap-1.5">
                  <span className="font-mono text-xs font-semibold text-ink bg-surface border border-border px-1.5 py-0.5 rounded flex items-center gap-1 select-all">
                    <Tag size={10} className="text-muted" />
                    {booking.referenceCode}
                  </span>
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <Users size={12} className="text-muted" />
                    {booking.peopleCount} {booking.peopleCount === 1 ? 'Guest' : 'Guests'}
                  </span>
                  <Badge tone={getStatusTone(booking.status)}>
                    {booking.status === 'NoShow' ? 'No Show' : booking.status}
                  </Badge>
                </div>

                {/* Column 5: Inline Action Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50 sm:col-span-2 sm:pt-0 sm:border-t-0">
                  {booking.status === 'Confirmed' ? (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <button
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() => handleUpdateStatus(booking.id, 'Completed')}
                        className="rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 text-2xs font-semibold"
                      >
                        Completed
                      </button>
                      <button
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() => handleUpdateStatus(booking.id, 'NoShow')}
                        className="rounded border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 text-2xs font-semibold"
                      >
                        No Show
                      </button>
                      <button
                        type="button"
                        disabled={statusMutation.isPending}
                        onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                        className="rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 text-2xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : booking.status === 'Cancelled' || booking.status === 'NoShow' ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      disabled={statusMutation.isPending}
                      onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                    >
                      <CheckCircle2 size={14} className="mr-1" />
                      Re-confirm
                    </Button>
                  ) : (
                    <span className="text-xs text-muted italic pr-3">No actions available</span>
                  )}
                </div>

                {/* Optional Special Note row */}
                {booking.specialNote && (
                  <div className="sm:col-span-12 mt-2 bg-gray-50 border border-border/40 rounded p-2 text-xs text-muted italic">
                    Note: "{booking.specialNote}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

