import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilLine, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { createBusiness, getBusinesses, updateBusiness } from '../../services/business-service'
import { getApiErrorMessage } from '../../utils/http'
import type { BusinessSummary } from '../../types/business'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { useDialogA11y } from '../../hooks/useDialogA11y'

const businessSchema = z.object({
  name: z.string().min(2).max(180),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.'),
  description: z.string().max(1200).optional().or(z.literal('')),
  phoneNumber: z.string().max(40).optional().or(z.literal('')),
})

type BusinessForm = z.infer<typeof businessSchema>

export function Businesses() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<BusinessSummary | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const closeForm = () => {
    setEditing(null)
    setIsFormOpen(false)
  }

  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen: isFormOpen, onClose: closeForm })

  const businessesQuery = useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinesses,
  })

  const form = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      phoneNumber: '',
    },
  })

  useEffect(() => {
    if (!editing) {
      form.reset({
        name: '',
        slug: '',
        description: '',
        phoneNumber: '',
      })
      return
    }

    form.reset({
      name: editing.name,
      slug: editing.slug,
      description: editing.description ?? '',
      phoneNumber: editing.phoneNumber ?? '',
    })
  }, [editing, form])

  const businessMutation = useMutation({
    mutationFn: async (values: BusinessForm) => {
      if (editing) {
        return updateBusiness(editing.id, values)
      }

      return createBusiness(values)
    },
    onSuccess: (response) => {
      if (!response.succeeded) {
        toast.error(response.message ?? 'Unable to save business.')
        return
      }

      toast.success(response.message ?? 'Business saved.')
      void queryClient.invalidateQueries({ queryKey: ['businesses'] })
      setEditing(null)
      setIsFormOpen(false)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to save business.'))
    },
  })

  const businesses = businessesQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description="Create and maintain the businesses that own offers and future slot inventory."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
          >
            <Plus size={16} />
            New business
          </Button>
        }
      />

      {businessesQuery.isLoading ? (
        <section className="rounded-lg border border-border bg-white p-6 text-sm text-muted">Loading businesses...</section>
      ) : businessesQuery.isError ? (
        <section className="rounded-lg border border-border bg-white p-6 text-sm text-muted">
          We could not load businesses right now.
        </section>
      ) : businesses.length === 0 ? (
        <section className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-ink">No businesses yet</h2>
          <p className="mt-2 text-sm">Start by creating the business that will own your offers.</p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          {businesses.map((business) => (
            <div key={business.id} className="flex flex-col gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-ink">{business.name}</h2>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">{business.slug}</span>
                </div>
                <p className="text-sm">{business.description ?? 'No business description added yet.'}</p>
                <p className="text-xs text-muted">{business.phoneNumber ?? 'No phone number provided'}</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(business)
                  setIsFormOpen(true)
                }}
              >
                <PencilLine size={16} />
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/20 px-4 py-6 backdrop-blur-sm">
          <div
            ref={dialogRef}
            className="w-full max-w-lg rounded-lg border border-border bg-white p-6 shadow-soft max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">{editing ? 'Edit business' : 'New business'}</h2>
                <p className="mt-1 text-sm text-muted">Keep this lightweight for now. Offers can be attached as soon as the business exists.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
              >
                Close
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => businessMutation.mutate(values))}>
              <label className="block">
                <span className="text-sm font-medium text-ink">Name</span>
                <input className="mt-2 h-11 w-full rounded-md border border-border px-3" {...form.register('name')} />
                {form.formState.errors.name ? <span className="mt-1 block text-sm text-red-600">{form.formState.errors.name.message}</span> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Slug</span>
                <input className="mt-2 h-11 w-full rounded-md border border-border px-3" {...form.register('slug')} />
                {form.formState.errors.slug ? <span className="mt-1 block text-sm text-red-600">{form.formState.errors.slug.message}</span> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Description</span>
                <textarea className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-3" {...form.register('description')} />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ink">Phone number</span>
                <input className="mt-2 h-11 w-full rounded-md border border-border px-3" {...form.register('phoneNumber')} />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={businessMutation.isPending}>
                  {businessMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create business'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
