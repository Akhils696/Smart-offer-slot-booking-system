import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarClock, PauseCircle, PencilLine, Plus, Search, Trash2, AlertCircle, Users, Clock } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { ROUTES } from '../../constants/routes'
import { getBusinesses } from '../../services/business-service'
import { activateOffer, createOffer, deleteOffer, getOffers, pauseOffer, updateOffer } from '../../services/offer-service'
import type { OfferSummary } from '../../types/offer'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { getApiErrorMessage } from '../../utils/http'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { getSlots, createSlot, updateSlot, deleteSlot } from '../../services/slot-service'
import type { SlotSummary } from '../../types/slot'

const offerSchema = z
  .object({
    businessId: z.string().uuid(),
    title: z.string().min(2).max(220),
    description: z.string().max(1600).optional().or(z.literal('')),
    originalPrice: z.coerce.number().positive(),
    offerPrice: z.coerce.number().positive(),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
  })
  .refine((values) => values.offerPrice < values.originalPrice, {
    message: 'Offer price must be lower than original price.',
    path: ['offerPrice'],
  })
  .refine((values) => new Date(values.startsAt) < new Date(values.endsAt), {
    message: 'End time must be later than start time.',
    path: ['endsAt'],
  })

type OfferForm = z.output<typeof offerSchema>
type OfferFormInput = z.input<typeof offerSchema>

function toneForStatus(status: OfferSummary['status']) {
  if (status === 'Active') {
    return 'success'
  }

  if (status === 'Paused' || status === 'Expired') {
    return 'warning'
  }

  return 'muted'
}

export function Offers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<OfferSummary | null>(null)
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null)

  const toggleSlots = (offerId: string) => {
    setExpandedOfferId((curr) => (curr === offerId ? null : offerId))
  }

  const closeForm = () => {
    setEditing(null)
    setIsFormOpen(false)
  }

  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen: isFormOpen, onClose: closeForm })

  const businessesQuery = useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinesses,
  })

  const offersQuery = useQuery({
    queryKey: ['offers', deferredSearch, status, businessId, page],
    queryFn: () =>
      getOffers({
        search: deferredSearch || undefined,
        status: status || undefined,
        businessId: businessId || undefined,
        page,
        pageSize: 8,
      }),
  })

  const form = useForm<OfferFormInput, unknown, OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      businessId: '',
      title: '',
      description: '',
      originalPrice: 0,
      offerPrice: 0,
      startsAt: '',
      endsAt: '',
    },
  })

  useEffect(() => {
    if (!editing) {
      form.reset({
        businessId: businessesQuery.data?.[0]?.id ?? '',
        title: '',
        description: '',
        originalPrice: 0,
        offerPrice: 0,
        startsAt: '',
        endsAt: '',
      })
      return
    }

    form.reset({
      businessId: editing.businessId,
      title: editing.title,
      description: editing.description ?? '',
      originalPrice: editing.originalPrice,
      offerPrice: editing.offerPrice,
      startsAt: editing.startsAt.slice(0, 16),
      endsAt: editing.endsAt.slice(0, 16),
    })
  }, [businessesQuery.data, editing, form])

  const invalidateOffers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['offers'] })
  }

  const offerMutation = useMutation({
    mutationFn: async (values: OfferForm) => {
      if (editing) {
        return updateOffer(editing.id, values)
      }

      return createOffer(values)
    },
    onSuccess: async (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Unable to save offer.')
        return
      }

      await invalidateOffers()
      toast.success(response.message ?? 'Offer saved.')
      setIsFormOpen(false)
      setEditing(null)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save offer.'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({ offerId, action }: { offerId: string; action: 'activate' | 'pause' | 'delete' }) => {
      if (action === 'activate') {
        return activateOffer(offerId)
      }

      if (action === 'pause') {
        return pauseOffer(offerId)
      }

      return deleteOffer(offerId)
    },
    onSuccess: async (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Action failed.')
        return
      }

      await invalidateOffers()
      toast.success(response.message ?? 'Offer updated.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update offer.'))
    },
  })

  const offers = offersQuery.data?.items ?? []
  const hasBusinesses = (businessesQuery.data?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Search, filter, and maintain time-bound offers before slot management is added."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
            disabled={!hasBusinesses}
          >
            <Plus size={16} />
            New offer
          </Button>
        }
      />

      {!hasBusinesses && businessesQuery.isSuccess ? (
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">Create a business before adding offers</h2>
          <p className="mt-2 text-sm">Offers need a business owner. Set that up once, then the offer workflow becomes available.</p>
          <Link className="mt-4 inline-flex text-sm font-medium text-primary-700" to={ROUTES.admin.businesses}>
            Go to businesses
          </Link>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1.6fr_0.8fr_1fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-3.5 text-muted" size={16} />
            <input
              className="h-11 w-full rounded-md border border-border pl-10 pr-3 text-sm"
              placeholder="Search offers or businesses"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </label>

          <select
            className="h-11 rounded-md border border-border px-3 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            className="h-11 rounded-md border border-border px-3 text-sm"
            value={businessId}
            onChange={(event) => {
              setBusinessId(event.target.value)
              setPage(1)
            }}
          >
            <option value="">All businesses</option>
            {(businessesQuery.data ?? []).map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {offersQuery.isLoading ? (
        <section className="rounded-lg border border-border bg-white p-6 text-sm text-muted">Loading offers...</section>
      ) : offersQuery.isError ? (
        <section className="rounded-lg border border-border bg-white p-6 text-sm text-muted">
          We could not load offers right now.
        </section>
      ) : offers.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-ink">No offers match the current filters</h2>
          <p className="mt-2 text-sm">Try a broader search, or create the first offer for one of your businesses.</p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          {offers.map((offer) => (
            <div key={offer.id} className="border-b border-border px-5 py-4 last:border-b-0">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-sm font-semibold text-ink">{offer.title}</h2>
                    <Badge tone={toneForStatus(offer.status)}>{offer.status}</Badge>
                    <span className="text-xs text-muted">{offer.businessName}</span>
                  </div>
                  <p className="text-sm">{offer.description ?? 'No offer description added yet.'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span>{formatCurrency(offer.offerPrice)} / {formatCurrency(offer.originalPrice)}</span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock size={15} />
                      {formatDateTime(offer.startsAt)} to {formatDateTime(offer.endsAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => toggleSlots(offer.id)}
                  >
                    <CalendarClock size={16} />
                    {expandedOfferId === offer.id ? 'Close Slots' : 'Manage Slots'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditing(offer)
                      setIsFormOpen(true)
                    }}
                  >
                    <PencilLine size={16} />
                    Edit
                  </Button>

                  {offer.status === 'Active' ? (
                    <Button type="button" variant="secondary" onClick={() => statusMutation.mutate({ offerId: offer.id, action: 'pause' })}>
                      <PauseCircle size={16} />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => statusMutation.mutate({ offerId: offer.id, action: 'activate' })}
                      disabled={offer.status === 'Expired'}
                    >
                      Activate
                    </Button>
                  )}

                  <Button type="button" variant="ghost" onClick={() => statusMutation.mutate({ offerId: offer.id, action: 'delete' })}>
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>

              {expandedOfferId === offer.id && (
                <div className="mt-4 border-t border-border pt-4 bg-slate-50/50 -mx-5 px-5 -mb-4 pb-4">
                  <SlotManagementPanel offer={offer} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {offersQuery.data ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm">
          <span className="text-muted">
            Page {offersQuery.data.page} of {offersQuery.data.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= offersQuery.data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/20 px-4 py-6 backdrop-blur-sm">
          <div
            ref={dialogRef}
            className="w-full max-w-xl rounded-lg border border-border bg-white p-6 shadow-soft max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">{editing ? 'Edit offer' : 'New offer'}</h2>
                <p className="mt-1 text-sm text-muted">Use a practical setup here. Slots and availability controls will come in the next phase.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
              >
                Close
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => offerMutation.mutate(values))}>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Business</span>
                <select
                  className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...form.register('businessId')}
                >
                  {(businessesQuery.data ?? []).map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Title</span>
                <input
                  className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. Weekend Spa Getaway"
                  {...form.register('title')}
                />
                {form.formState.errors.title ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.title.message}</span> : null}
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Description</span>
                <textarea
                  className="mt-1.5 min-h-24 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Describe your special offer and highlight slot details..."
                  {...form.register('description')}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Original price</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500"
                    {...form.register('originalPrice')}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Offer price</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 750"
                    {...form.register('offerPrice')}
                  />
                  {form.formState.errors.offerPrice ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.offerPrice.message}</span> : null}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Starts at</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    type="datetime-local"
                    {...form.register('startsAt')}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Ends at</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    type="datetime-local"
                    {...form.register('endsAt')}
                  />
                  {form.formState.errors.endsAt ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.endsAt.message}</span> : null}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={offerMutation.isPending}>
                  {offerMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ==========================================
   SUB-COMPONENT: SlotManagementPanel
   ========================================== */
interface SlotManagementPanelProps {
  offer: OfferSummary
}

function SlotManagementPanel({ offer }: SlotManagementPanelProps) {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [editingSlot, setEditingSlot] = useState<SlotSummary | null>(null)

  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const slotsQuery = useQuery({
    queryKey: ['slots', offer.id],
    queryFn: () => getSlots(offer.id),
  })

  const resetForm = () => {
    setStartsAt('')
    setEndsAt('')
    setCapacity(10)
    setErrorMsg(null)
    setIsAdding(false)
    setEditingSlot(null)
  }

  const startEdit = (slot: SlotSummary) => {
    setEditingSlot(slot)
    setStartsAt(slot.startsAt.slice(0, 16))
    setEndsAt(slot.endsAt.slice(0, 16))
    setCapacity(slot.capacity)
    setErrorMsg(null)
    setIsAdding(false)
  }

  const upsertMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null)
      if (!startsAt || !endsAt) {
        throw new Error('Please select both start and end times.')
      }
      if (new Date(startsAt) >= new Date(endsAt)) {
        throw new Error('Slot end time must be later than start time.')
      }
      if (capacity < 1) {
        throw new Error('Slot capacity must be at least 1.')
      }

      const payload = {
        offerId: offer.id,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        capacity: Number(capacity),
      }

      if (editingSlot) {
        return updateSlot(editingSlot.id, payload)
      } else {
        return createSlot(payload)
      }
    },
    onSuccess: (response) => {
      if (!response.succeeded) {
        setErrorMsg(response.message ?? 'Failed to save slot.')
        return
      }
      toast.success(editingSlot ? 'Slot updated successfully!' : 'Slot scheduled successfully!')
      void queryClient.invalidateQueries({ queryKey: ['slots', offer.id] })
      resetForm()
    },
    onError: (error: any) => {
      setErrorMsg(error?.message || getApiErrorMessage(error, 'Unable to save slot.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (slotId: string) => {
      return deleteSlot(slotId)
    },
    onSuccess: (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Unable to delete slot.')
        return
      }
      toast.success('Slot deleted successfully!')
      void queryClient.invalidateQueries({ queryKey: ['slots', offer.id] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete slot.'))
    },
  })

  const slots = slotsQuery.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Clock size={14} className="text-muted" />
          Scheduled Timeslots ({slots.length})
        </h3>
        {!isAdding && !editingSlot && (
          <Button
            type="button"
            variant="secondary"
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              setIsAdding(true)
              setErrorMsg(null)
              const offerStart = new Date(offer.startsAt)
              const now = new Date()
              const seedStart = offerStart > now ? offerStart : now
              const formatForInput = (d: Date) => {
                const pad = (n: number) => n.toString().padStart(2, '0')
                return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
              }
              setStartsAt(formatForInput(seedStart))
              const seedEnd = new Date(seedStart.getTime() + 60 * 60 * 1000)
              setEndsAt(formatForInput(seedEnd))
            }}
          >
            <Plus size={13} className="mr-1" />
            Add Slot
          </Button>
        )}
      </div>

      {(isAdding || editingSlot) && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            upsertMutation.mutate()
          }}
          className="rounded-lg border border-slate-200 bg-white p-4 space-y-3.5 shadow-sm"
        >
          <h4 className="text-xs font-semibold text-ink">
            {editingSlot ? 'Edit Scheduled Slot' : 'Create New Slot'}
          </h4>

          {errorMsg && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-900 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid gap-3.5 sm:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Starts At</span>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-white px-2.5 text-xs text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Ends At</span>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-white px-2.5 text-xs text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Capacity (Seats)</span>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1 h-9 w-full rounded-md border border-border bg-white px-2.5 text-xs text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              className="h-8 text-xs"
              onClick={resetForm}
              disabled={upsertMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-8 text-xs font-semibold"
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending ? 'Saving...' : editingSlot ? 'Save Changes' : 'Schedule Slot'}
            </Button>
          </div>
        </form>
      )}

      {slotsQuery.isLoading ? (
        <p className="text-xs text-muted">Loading timeslots...</p>
      ) : slotsQuery.isError ? (
        <p className="text-xs text-red-600">Failed to load timeslots.</p>
      ) : slots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white/40 py-6 text-center text-xs text-muted">
          No slots scheduled for this offer yet. Click "Add Slot" to schedule one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted sm:grid">
            <div className="col-span-5">Starts At & Ends At</div>
            <div className="col-span-3">Capacity & Bookings</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {slots.map((slot) => {
              return (
                <div
                  key={slot.id}
                  className="grid gap-2 p-3 text-xs sm:grid-cols-12 sm:items-center sm:px-4 sm:py-2.5 hover:bg-slate-50/20"
                >
                  <div className="col-span-5 space-y-0.5">
                    <span className="font-semibold text-ink block sm:inline">
                      {formatDateTime(slot.startsAt)}
                    </span>
                    <span className="hidden sm:inline text-muted/75 mx-1.5">to</span>
                    <span className="text-muted block sm:inline">
                      {formatDateTime(slot.endsAt)}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-1.5 text-muted">
                    <Users size={12} />
                    <span>
                      {slot.bookedCount} / {slot.capacity} booked ({slot.availableCount} left)
                    </span>
                  </div>

                  <div className="col-span-2">
                    <Badge
                      tone={
                        slot.status === 'Active'
                          ? 'success'
                          : slot.status === 'Full'
                          ? 'warning'
                          : 'muted'
                      }
                    >
                      {slot.status}
                    </Badge>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted hover:text-ink"
                      onClick={() => startEdit(slot)}
                    >
                      <PencilLine size={13} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this scheduled timeslot?')) {
                          deleteMutation.mutate(slot.id)
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

