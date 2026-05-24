import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PencilLine, Plus, MapPin, Phone as PhoneIcon, Mail, Clock } from 'lucide-react'
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

const BUSINESS_TYPES = ['Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other']

const businessSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(180),
  slug: z
    .string()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.'),
  description: z.string().max(1200).optional().or(z.literal('')),
  phoneNumber: z.string().max(40).optional().or(z.literal('')),
  
  businessType: z.string().min(1, 'Business type is required.'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters.').max(180),
  phone: z.string().min(10, 'Phone must be at least 10 digits.').max(40),
  email: z.string().email('Please enter a valid email address.').max(220),
  address: z.string().min(2, 'Address is required.').max(500),
  city: z.string().min(2, 'City is required.').max(100),
  logoUrl: z.string().max(500).optional().or(z.literal('')),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format.'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format.'),
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
      businessType: 'Other',
      ownerName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      logoUrl: '',
      openingTime: '09:00',
      closingTime: '22:00',
    },
  })

  useEffect(() => {
    if (!editing) {
      form.reset({
        name: '',
        slug: '',
        description: '',
        phoneNumber: '',
        businessType: 'Other',
        ownerName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        logoUrl: '',
        openingTime: '09:00',
        closingTime: '22:00',
      })
      return
    }

    form.reset({
      name: editing.name,
      slug: editing.slug,
      description: editing.description ?? '',
      phoneNumber: editing.phoneNumber ?? '',
      businessType: editing.businessType,
      ownerName: editing.ownerName,
      phone: editing.phone,
      email: editing.email,
      address: editing.address,
      city: editing.city,
      logoUrl: editing.logoUrl ?? '',
      openingTime: editing.openingTime,
      closingTime: editing.closingTime,
    })
  }, [editing, form])

  const businessMutation = useMutation({
    mutationFn: async (values: BusinessForm) => {
      if (editing) {
        return updateBusiness(editing.id, {
          ...values,
          logoUrl: values.logoUrl || null,
          description: values.description || null,
          phoneNumber: values.phoneNumber || null,
        })
      }

      return createBusiness({
        ...values,
        logoUrl: values.logoUrl || null,
        description: values.description || null,
        phoneNumber: values.phoneNumber || null,
      })
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
        <div className="overflow-hidden rounded-lg border border-border bg-white divide-y divide-border shadow-soft">
          {businesses.map((business) => (
            <div key={business.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between hover:bg-slate-50/40 transition">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-ink">{business.name}</h2>
                  <span className="rounded-full bg-primary-50 border border-primary-100 px-2 py-0.5 text-3xs font-semibold uppercase tracking-wider text-primary-700">
                    {business.businessType}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-2xs text-muted font-mono">{business.slug}</span>
                </div>
                
                {business.description && (
                  <p className="text-sm text-ink/90 leading-relaxed max-w-xl">{business.description}</p>
                )}

                <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    <span>{business.address}, {business.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <PhoneIcon size={13} />
                    <span>{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} />
                    <span>{business.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>{business.openingTime} - {business.closingTime}</span>
                  </div>
                </div>

                <div className="text-3xs uppercase tracking-wider font-semibold text-muted/80">
                  Owner: {business.ownerName}
                </div>
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
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">{editing ? 'Edit Business Profile' : 'New Business Profile'}</h2>
                <p className="mt-1 text-xs text-muted">Fill out the profile for your service-based business.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit((values) => businessMutation.mutate(values))}>
              {/* Row 1: Name & Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Business Name</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. Golds Gym Elite"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.name.message}</span> : null}
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Public URL Slug</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. golds-gym-elite"
                    {...form.register('slug')}
                  />
                  {form.formState.errors.slug ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.slug.message}</span> : null}
                </label>
              </div>

              {/* Row 2: Business Type & Owner Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Business Type</span>
                  <select
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...form.register('businessType')}
                  >
                    {BUSINESS_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {form.formState.errors.businessType ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.businessType.message}</span> : null}
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Owner Name</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. Nithin Kumar"
                    {...form.register('ownerName')}
                  />
                  {form.formState.errors.ownerName ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.ownerName.message}</span> : null}
                </label>
              </div>

              {/* Row 3: Phone & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Contact Phone</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. 9876543210"
                    {...form.register('phone')}
                  />
                  {form.formState.errors.phone ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.phone.message}</span> : null}
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Contact Email</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    type="email"
                    placeholder="e.g. info@goldsgym.in"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.email.message}</span> : null}
                </label>
              </div>

              {/* Row 4: Address & City */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. 12th Main Road, Indiranagar"
                    {...form.register('address')}
                  />
                  {form.formState.errors.address ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.address.message}</span> : null}
                </label>

                <label className="block sm:col-span-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">City</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. Bengaluru"
                    {...form.register('city')}
                  />
                  {form.formState.errors.city ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.city.message}</span> : null}
                </label>
              </div>

              {/* Row 5: Opening Time & Closing Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Opening Time (HH:mm)</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. 06:00"
                    {...form.register('openingTime')}
                  />
                  {form.formState.errors.openingTime ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.openingTime.message}</span> : null}
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Closing Time (HH:mm)</span>
                  <input
                    className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. 22:00"
                    {...form.register('closingTime')}
                  />
                  {form.formState.errors.closingTime ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.closingTime.message}</span> : null}
                </label>
              </div>

              {/* Description */}
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Description (Optional)</span>
                <textarea
                  className="mt-1.5 min-h-20 w-full rounded-md border border-border bg-white p-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  placeholder="Tell customers about the business..."
                  {...form.register('description')}
                />
                {form.formState.errors.description ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.description.message}</span> : null}
              </label>

              {/* Logo URL */}
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Logo Image URL (Optional)</span>
                <input
                  className="mt-1.5 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition placeholder:text-muted/65 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. https://acme.logo.png"
                  {...form.register('logoUrl')}
                />
                {form.formState.errors.logoUrl ? <span className="mt-1 block text-xs text-red-600">{form.formState.errors.logoUrl.message}</span> : null}
              </label>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeForm}
                  disabled={businessMutation.isPending}
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
