import axios from 'axios'
import { AlertCircle, CheckCircle2, Sparkles, Users, X } from 'lucide-react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
import type { SlotSummary } from '../../types/slot'

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
  const activeSlot = slots.find((slot) => slot.id === selectedSlot)

  return (
    <Container className="py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        <article className="animate-fade-up space-y-6 lg:col-span-2">
          <header className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-700">
              {offer.businessName}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{offer.title}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>{offer.category}</Badge>
              <Badge tone={offer.status === 'Active' ? 'success' : 'warning'}>{offer.status}</Badge>
              <Badge tone="muted">{offer.discountPercentage}% off</Badge>
            </div>
          </header>

          <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Offer description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
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

        <aside className="h-fit animate-fade-up space-y-6 rounded-xl border border-border bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between border-b border-border pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Special Offer</span>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-ink">{formatCurrency(offer.offerPrice)}</span>
              <span className="text-xs text-muted line-through">{formatCurrency(offer.originalPrice)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-md bg-surface p-3 text-xs text-muted">
              <Sparkles className="shrink-0 text-primary-600" size={15} />
              <span>Book instantly. Seat availability is checked again before the reservation is confirmed.</span>
            </div>

            {offer.status !== 'Active' ? (
              <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="flex items-center gap-2 font-semibold">
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

            {selectedSlot && activeSlot ? (
              <div className="rounded-md border border-primary-100 bg-primary-50 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-primary-800">
                  <CheckCircle2 size={14} />
                  Selected: {formatDateTime(activeSlot.startsAt)}
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {isModalOpen && offerId && selectedSlot && activeSlot ? (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          offerId={offerId}
          slotId={selectedSlot}
          slot={activeSlot}
        />
      ) : null}
    </Container>
  )
}

interface SlotListProps {
  slots: SlotSummary[]
  isLoading: boolean
  isError: boolean
  selectedSlot: string | null
  onSelect: (id: string) => void
}

function SlotList({ slots, isLoading, isError, selectedSlot, onSelect }: SlotListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="skeleton-shimmer h-20 animate-shimmer rounded-lg" />
        <div className="skeleton-shimmer h-20 animate-shimmer rounded-lg" />
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
        <SlotCard key={slot.id} slot={slot} isSelected={selectedSlot === slot.id} onSelect={() => onSelect(slot.id)} />
      ))}
    </div>
  )
}

interface SlotCardProps {
  slot: SlotSummary
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
      className={`motion-card flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition ${
        isSelected
          ? 'border-primary-600 bg-primary-50/40 ring-1 ring-primary-500'
          : 'border-border bg-white hover:border-slate-400 disabled:opacity-55 disabled:hover:border-border'
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{formatDateTime(slot.startsAt)}</span>
        <Badge tone={slot.status === 'Active' ? 'success' : slot.status === 'Full' ? 'warning' : 'muted'}>
          {slot.status}
        </Badge>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
        <Users size={13} />
        <span>{isFull ? 'Fully Booked' : `${slot.availableCount} of ${slot.capacity} seats left`}</span>
      </div>
    </button>
  )
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  offerId: string
  slotId: string
  slot: SlotSummary
}

function BookingModal({ isOpen, onClose, offerId, slotId, slot }: BookingModalProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [concurrencyError, setConcurrencyError] = useState<string | null>(null)
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose })

  const bookingSchema = z.object({
    customerName: z.string().min(2, 'Name is required (at least 2 characters).').max(180),
    customerEmail: z.string().email('Please enter a valid email address.').max(220).optional().or(z.literal('')),
    customerPhone: z.string().min(10, 'Phone number must be at least 10 digits.').max(40),
    peopleCount: z.coerce
      .number()
      .int()
      .min(1, 'Must book for at least 1 person.')
      .max(slot.availableCount, `Only ${slot.availableCount} seats left in this slot.`),
    specialNote: z.string().max(1000).optional(),
  })

  type BookingFormInput = z.input<typeof bookingSchema>
  type BookingForm = z.output<typeof bookingSchema>

  const form = useForm<BookingFormInput, unknown, BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      peopleCount: 1,
      specialNote: '',
    },
  })

  const bookingMutation = useMutation({
    mutationFn: async (values: BookingForm) => {
      return createBooking({
        offerSlotId: slotId,
        customerName: values.customerName,
        customerEmail: values.customerEmail || null,
        customerPhone: values.customerPhone,
        peopleCount: values.peopleCount,
        specialNote: values.specialNote || null,
      })
    },
    onSuccess: (response) => {
      if (!response.succeeded || !response.data) {
        toast.error(response.message ?? 'Booking failed.')
        return
      }

      toast.success('Your slot has been successfully reserved!')
      void queryClient.invalidateQueries({ queryKey: ['slots', offerId] })
      onClose()
      navigate(`/booking/confirmation/${response.data.id}`)
    },
    onError: (error: unknown) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      if (status === 409) {
        setConcurrencyError('This timeslot was just reserved by another customer. Please select another slot.')
        void queryClient.invalidateQueries({ queryKey: ['slots', offerId] })
        return
      }

      toast.error(getApiErrorMessage(error, 'Unable to place booking.'))
    },
  })

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/20 px-4 py-6 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="max-h-[90vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-lift"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Confirm Reservation</h3>
            <p className="mt-1 text-xs text-muted">Fill contact details to reserve this slot.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} className="h-8 w-8 p-0" aria-label="Close booking form">
            <X size={16} />
          </Button>
        </div>

        {concurrencyError ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={17} />
              <div>
                <p className="font-semibold">Booking Collision</p>
                <p className="mt-0.5 text-xs leading-relaxed">{concurrencyError}</p>
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
            <div className="rounded-md border border-border/50 bg-surface p-3 text-xs text-muted">
              <p className="font-medium text-ink">Selected Schedule:</p>
              <p className="mt-1">{formatDateTime(slot.startsAt)}</p>
              <p className="mt-0.5 text-2xs font-semibold text-primary-700">{slot.availableCount} seats remaining</p>
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
                <span className="mt-1 block text-xs text-red-600">{form.formState.errors.customerName.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Phone Number</span>
              <input
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g. +91 9876543210"
                disabled={bookingMutation.isPending}
                {...form.register('customerPhone')}
              />
              {form.formState.errors.customerPhone ? (
                <span className="mt-1 block text-xs text-red-600">{form.formState.errors.customerPhone.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Email Address (Optional)</span>
              <input
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                type="email"
                placeholder="e.g. aarav@gmail.com"
                disabled={bookingMutation.isPending}
                {...form.register('customerEmail')}
              />
              {form.formState.errors.customerEmail ? (
                <span className="mt-1 block text-xs text-red-600">{form.formState.errors.customerEmail.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Number of People</span>
              <input
                className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                type="number"
                min="1"
                max={slot.availableCount}
                disabled={bookingMutation.isPending}
                {...form.register('peopleCount')}
              />
              {form.formState.errors.peopleCount ? (
                <span className="mt-1 block text-xs text-red-600">{form.formState.errors.peopleCount.message}</span>
              ) : null}
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Special Note (Optional)</span>
              <textarea
                className="mt-1.5 h-20 w-full resize-none rounded-md border border-border bg-white p-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Any special instructions or preferences..."
                disabled={bookingMutation.isPending}
                {...form.register('specialNote')}
              />
              {form.formState.errors.specialNote ? (
                <span className="mt-1 block text-xs text-red-600">{form.formState.errors.specialNote.message}</span>
              ) : null}
            </label>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-3">
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
