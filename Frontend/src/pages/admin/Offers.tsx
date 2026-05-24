import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarClock, PauseCircle, PencilLine, Plus, Search, Trash2 } from 'lucide-react'
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
                <span className="text-sm font-medium text-ink">Business</span>
                <select className="mt-2 h-11 w-full rounded-md border border-border px-3" {...form.register('businessId')}>
                  {(businessesQuery.data ?? []).map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Title</span>
                <input className="mt-2 h-11 w-full rounded-md border border-border px-3" {...form.register('title')} />
                {form.formState.errors.title ? <span className="mt-1 block text-sm text-red-600">{form.formState.errors.title.message}</span> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Description</span>
                <textarea className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-3" {...form.register('description')} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-ink">Original price</span>
                  <input className="mt-2 h-11 w-full rounded-md border border-border px-3" type="number" step="0.01" {...form.register('originalPrice')} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink">Offer price</span>
                  <input className="mt-2 h-11 w-full rounded-md border border-border px-3" type="number" step="0.01" {...form.register('offerPrice')} />
                  {form.formState.errors.offerPrice ? <span className="mt-1 block text-sm text-red-600">{form.formState.errors.offerPrice.message}</span> : null}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-ink">Starts at</span>
                  <input className="mt-2 h-11 w-full rounded-md border border-border px-3" type="datetime-local" {...form.register('startsAt')} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink">Ends at</span>
                  <input className="mt-2 h-11 w-full rounded-md border border-border px-3" type="datetime-local" {...form.register('endsAt')} />
                  {form.formState.errors.endsAt ? <span className="mt-1 block text-sm text-red-600">{form.formState.errors.endsAt.message}</span> : null}
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
