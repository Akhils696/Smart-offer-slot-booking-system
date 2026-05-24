import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Calendar, User, Phone, Mail, Users, FileText, ArrowLeft, Printer } from 'lucide-react'
import { Container } from '../../components/common/Container'
import { getBookingById } from '../../services/booking-service'
import { queryKeys } from '../../lib/queryKeys'
import { formatDateTime } from '../../utils/format'

export function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>()

  const { data: booking, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId ?? ''),
    queryFn: () => getBookingById(bookingId ?? ''),
    enabled: !!bookingId,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <Container className="py-12 max-w-lg text-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-bold">Booking Not Found</h2>
          <p className="text-sm mt-2">We could not load the details for this booking reference. Please check your link or try booking again.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold">
            <ArrowLeft size={16} /> Return to Offers
          </Link>
        </div>
      </Container>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Container className="py-8 sm:py-12 max-w-2xl print:py-0 print:max-w-full">
      {/* Print styles */}
      <style>{`
        @media print {
          nav, footer, button, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden print-card">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-8 text-center no-print">
          <CheckCircle2 size={48} className="mx-auto text-emerald-100" />
          <h1 className="mt-4 text-2xl font-bold">Booking Confirmed!</h1>
          <p className="text-emerald-100 text-sm mt-1.5">Your offer slot has been successfully reserved.</p>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center border-b border-border pb-6 mb-6">
          <h1 className="text-2xl font-bold text-ink">Smart Offer Booking Confirmation</h1>
          <p className="text-xs text-muted mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Info Columns */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Slot & Code */}
            <div className="sm:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Booking Reference</span>
                <strong className="text-xl font-bold text-primary-700 mt-1 block select-all">{booking.referenceCode}</strong>
              </div>

              <div className="border-t border-border pt-4">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Offer Title</span>
                <span className="text-base font-semibold text-ink mt-0.5 block">{booking.offerTitle}</span>
                <span className="text-xs text-muted block mt-0.5">by {booking.businessName}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center bg-gray-50 border border-border rounded-xl p-4 sm:col-span-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.referenceCode}`}
                alt="Booking Reference QR"
                className="w-28 h-28 mix-blend-multiply"
                loading="lazy"
              />
              <span className="text-4xs text-muted font-medium mt-2 uppercase tracking-widest uppercase">Scan reference</span>
            </div>
          </div>

          {/* Details Section */}
          <section className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-1.5">
              <FileText size={16} className="text-muted" />
              Reservation Details
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="flex items-start gap-2.5">
                <Calendar className="text-muted shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-semibold text-muted block text-2xs uppercase tracking-wide">Reserved Time</span>
                  <span className="text-ink font-medium">{formatDateTime(booking.slotStartsAt)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="text-muted shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-semibold text-muted block text-2xs uppercase tracking-wide">Guests Count</span>
                  <span className="text-ink font-medium">{booking.peopleCount} {booking.peopleCount === 1 ? 'person' : 'people'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-gray-100 sm:border-t-0 pt-3 sm:pt-0">
                <User className="text-muted shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-semibold text-muted block text-2xs uppercase tracking-wide">Customer Name</span>
                  <span className="text-ink font-medium">{booking.customerName}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-gray-100 sm:border-t-0 pt-3 sm:pt-0">
                <Phone className="text-muted shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-semibold text-muted block text-2xs uppercase tracking-wide">Phone Number</span>
                  <span className="text-ink font-medium">{booking.customerPhone}</span>
                </div>
              </div>

              {booking.customerEmail && (
                <div className="flex items-start gap-2.5 border-t border-gray-100 pt-3 sm:col-span-2">
                  <Mail className="text-muted shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="font-semibold text-muted block text-2xs uppercase tracking-wide">Email Address</span>
                    <span className="text-ink font-medium">{booking.customerEmail}</span>
                  </div>
                </div>
              )}

              {booking.specialNote && (
                <div className="flex items-start gap-2.5 border-t border-gray-100 pt-3 sm:col-span-2">
                  <FileText className="text-muted shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="font-semibold text-muted block text-2xs uppercase tracking-wide">Special Note</span>
                    <p className="text-xs text-muted leading-relaxed mt-1 bg-gray-50 border border-border rounded p-2.5 italic">
                      "{booking.specialNote}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Footer */}
          <div className="border-t border-border pt-6 flex items-center justify-between no-print">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition"
            >
              <ArrowLeft size={16} />
              Return Home
            </Link>
            
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white hover:bg-gray-50 text-ink px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
