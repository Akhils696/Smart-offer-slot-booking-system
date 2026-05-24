import { AlertCircle, Sparkles, Users } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Container } from '../../components/common/Container'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { getOfferById } from '../../services/offer-service'
import { getSlots } from '../../services/slot-service'
import { createBooking } from '../../services/booking-service'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { getApiErrorMessage } from '../../utils/http'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { PageSkeleton } from '../../components/common/PageSkeleton'

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name is required (at least 2 characters).').max(180),
  customerEmail: z.string().email('Please enter a valid email address.').max(220),
})

type BookingForm = z.infer<typeof bookingSchema>

export function OfferDetails() {
  const { offerId } = useParams<{ offerId: string }>()
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const offerQuery = useQuery({
    queryKey: ['offer', offerId],
    queryFn: () => getOfferById(offerId!),
    enabled: Boolean(offerId),
  })

  const slotsQuery = useQuery({
    queryKey: ['slots', offerId],
    queryFn: () => getSlots(offerId!),
    enabled: Boolean(offerId),
  })

  if (offerQuery.isLoading) {
    return (
      <Container className="py-12">
        <PageSkeleton />
      </Container>
    )
  }

  if (offerQuery.isError || !offerQuery.data) {
    return (
      <Container className="py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={24} />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-ink">Unable to load offer</h1>
        <p className="mt-2 text-sm text-muted">This offer may have been deleted or the link is expired.</p>
        <Link to="/" className="mt-6 inline-flex text-sm font-medium text-primary-700">
          Back to homepage
        </Link>
      </Container>
    )
  }

  const offer = offerQuery.data
  const slots = slotsQuery.data ?? []

  const activeSlot = slots.find((s) => s.id === selectedSlot)

  return (
    <Container className="py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Details Panel */}
        <article className="space-y-6 lg:col-span-2">
          <header className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">
              {offer.businessName}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{offer.title}</h1>
          </header>

          <section className="rounded-lg border border-border bg-white p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Offer description</h2>
            <p className="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">
              {offer.description ?? 'No detailed description provided for this offer.'}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Choose your reservation slot</h2>
            <SlotList
              slots={slots}
              isLoading={slotsQuery.isLoading}
              isError={slotsQuery.isError}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />
          </section>
        </article>

        {/* Sticky Checkout Reservation Card */}
        <aside className="h-fit rounded-lg border border-border bg-white p-6 shadow-soft space-y-6 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between border-b border-border pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Special Offer</span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-ink">{formatCurrency(offer.offerPrice)}</span>
              <span className="text-xs text-muted line-through">{formatCurrency(offer.originalPrice)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-md bg-surface p-3 text-xs text-muted flex items-start gap-2.5">
              <Sparkles className="shrink-0 text-primary-600" size={15} />
              <span>Book instantly. No booking fees. Concurrency-safe seat reservations mapped live.</span>
            </div>

            {offer.status !== 'Active' ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  Offer is currently paused
                </p>
                <p className="text-xs">This offer is not accepting reservations right now. Try again later.</p>
              </div>
            ) : (
              <Button
                type="button"
                className="w-full text-sm font-semibold shadow-soft"
                disabled={!selectedSlot || activeSlot?.status === 'Full' || activeSlot?.status === 'Expired'}
                onClick={() => setIsModalOpen(true)}
              >
                {activeSlot?.status === 'Full'
                  ? 'Slot Fully Booked'
                  : activeSlot?.status === 'Expired'
                  ? 'Slot Expired'
                  : selectedSlot
                  ? 'Reserve Slot'
                  : 'Select a Slot to Reserve'}
              </Button>
            )}

            {selectedSlot && activeSlot && (
              <div className="text-center">
                <p className="text-xs text-muted">
                  Selected: <span className="font-medium text-ink">{formatDateTime(activeSlot.startsAt)}</span>
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {isModalOpen && offerId && selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          offerId={offerId}
          slotId={selectedSlot}
          slot={activeSlot!}
        />
      )}
    </Container>
  )
}

/* ==========================================
   SUB-COMPONENT: SlotList
   ========================================== */
interface SlotListProps {
  slots: any[]
  isLoading: boolean
  isError: boolean
  selectedSlot: string | null
  onSelect: (id: string) => void
}

function SlotList({ slots, isLoading, isError, selectedSlot, onSelect }: SlotListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-16 animate-pulse rounded-lg bg-border/40" />
        <div className="h-16 animate-pulse rounded-lg bg-border/40" />
      </div>
    )
  }

  if (isError) {
    return <div className="rounded-lg border border-border bg-white p-6 text-sm text-muted">Unable to load timeslots.</div>
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-muted">
        No booking slots are scheduled for this offer yet.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((slot) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          isSelected={selectedSlot === slot.id}
          onSelect={() => onSelect(slot.id)}
        />
      ))}
    </div>
  )
}

/* ==========================================
   SUB-COMPONENT: SlotCard
   ========================================== */
interface SlotCardProps {
  slot: any
  isSelected: boolean
  onSelect: () => void
}

function SlotCard({ slot, isSelected, onSelect }: SlotCardProps) {
  const isFull = slot.status === 'Full'
  const isExpired = slot.status === 'Expired'

  return (
    <button
      type="button"
      disabled={isFull || isExpired}
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition ${
        isSelected
          ? 'border-primary-600 bg-primary-50/40 ring-1 ring-primary-500'
          : 'border-border bg-white hover:border-slate-400 disabled:opacity-55 disabled:hover:border-border'
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{formatDateTime(slot.startsAt)}</span>
        <Badge
          tone={slot.status === 'Active' ? 'success' : slot.status === 'Full' ? 'warning' : 'muted'}
        >
          {slot.status}
        </Badge>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
        <Users size={13} />
        <span>
          {isFull ? 'Fully Booked' : `${slot.availableCount} of ${slot.capacity} seats left`}
        </span>
      </div>
    </button>
  )
}

/* ==========================================
   SUB-COMPONENT: BookingModal
   ========================================== */
interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  offerId: string
  slotId: string
  slot: any
}

function BookingModal({ isOpen, onClose, offerId, slotId, slot }: BookingModalProps) {
  const queryClient = useQueryClient()
  const [concurrencyError, setConcurrencyError] = useState<string | null>(null)

  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose })

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
    },
  })

  const bookingMutation = useMutation({
    mutationFn: async (values: BookingForm) => {
      return createBooking({
        offerSlotId: slotId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
      })
    },
    onSuccess: (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Booking failed.')
        return
      }

      toast.success('Your slot has been successfully reserved!')
      void queryClient.invalidateQueries({ queryKey: ['slots', offerId] })
      onClose()
    },
    onError: async (error: any) => {
      // 1. Differentiated Concurrency Lock UX
      const status = error.response?.status
      if (status === 409) {
        // Concurrency token collision! Force refetching slots in background to synchronize
        setConcurrencyError('This timeslot was just reserved by another customer. Please select another slot.')
        void queryClient.invalidateQueries({ queryKey: ['slots', offerId] })
      } else {
        toast.error(getApiErrorMessage(error, 'Unable to place booking.'))
      }
    },
  })

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/20 px-4 py-6 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Confirm Reservation</h3>
            <p className="mt-1 text-xs text-muted">Fill contact details to reserve this slot.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </div>

        {concurrencyError ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="shrink-0 text-amber-600 mt-0.5" size={17} />
              <div>
                <p className="font-semibold">Booking Collision</p>
                <p className="text-xs mt-0.5 leading-relaxed">{concurrencyError}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={onClose}>
                Return and Choose Another Slot
              </Button>
            </div>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={form.handleSubmit((values) => bookingMutation.mutate(values))}>
            <div className="rounded-md bg-surface p-3 text-xs text-muted border border-border/50">
              <p className="font-medium text-ink">Selected Schedule:</p>
              <p className="mt-1">{formatDateTime(slot.startsAt)}</p>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Full Name</span>
              <input
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g. Aarav Mehta"
                disabled={bookingMutation.isPending}
                {...form.register('customerName')}
              />
              {form.formState.errors.customerName ? (
                <span className="mt-1 block text-xs text-red-600">
                  {form.formState.errors.customerName.message}
                </span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Email Address</span>
              <input
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                type="email"
                placeholder="e.g. aarav@gmail.com"
                disabled={bookingMutation.isPending}
                {...form.register('customerEmail')}
              />
              {form.formState.errors.customerEmail ? (
                <span className="mt-1 block text-xs text-red-600">
                  {form.formState.errors.customerEmail.message}
                </span>
              ) : null}
            </label>

            {/* 2. Submission Locking & Pending states to block double clicks */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-6">
              <Button type="button" variant="ghost" onClick={onClose} disabled={bookingMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={bookingMutation.isPending}>
                {bookingMutation.isPending ? 'Reserving...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
