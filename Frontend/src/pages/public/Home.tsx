import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ShieldCheck,
  Tag,
  TicketPercent,
} from 'lucide-react'
import { Container } from '../../components/common/Container'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { getOffers } from '../../services/offer-service'
import { queryKeys } from '../../lib/queryKeys'
import { formatCurrency } from '../../utils/format'

const BUSINESS_TYPES = ['Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other']

function ExpiryTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function calculate() {
      const difference = +new Date(targetDate) - +new Date()
      if (difference <= 0) {
        setTimeLeft('Expired')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      if (days > 0) setTimeLeft(`${days}d ${hours}h left`)
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m left`)
      else setTimeLeft(`${minutes}m ${seconds}s left`)
    }

    calculate()
    const timer = window.setInterval(calculate, 1000)
    return () => window.clearInterval(timer)
  }, [targetDate])

  const isCritical = timeLeft !== 'Expired' && !timeLeft.includes('d') && !timeLeft.includes('h')

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
        timeLeft === 'Expired'
          ? 'border-red-100 bg-red-50 text-red-700'
          : isCritical
            ? 'animate-pulse border-amber-200 bg-amber-50 text-amber-700'
            : 'border-primary-100 bg-primary-50 text-primary-700'
      }`}
    >
      <Clock size={12} />
      {timeLeft}
    </span>
  )
}

function OfferCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="skeleton-shimmer h-5 w-28 animate-shimmer rounded-full" />
      <div className="mt-5 skeleton-shimmer h-6 w-3/4 animate-shimmer rounded" />
      <div className="mt-3 skeleton-shimmer h-4 w-1/2 animate-shimmer rounded" />
      <div className="mt-7 flex items-center justify-between">
        <div className="skeleton-shimmer h-9 w-24 animate-shimmer rounded" />
        <div className="skeleton-shimmer h-10 w-28 animate-shimmer rounded-md" />
      </div>
    </div>
  )
}

export function Home() {
  const [search, setSearch] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    businessType: '',
    category: '',
    date: '',
    maxPrice: '' as number | '',
    availableOnly: false,
  })

  const handleApplyFilters = (event?: React.FormEvent) => {
    event?.preventDefault()
    setActiveFilters({ search, businessType, category, date, maxPrice, availableOnly })
  }

  const handleResetFilters = () => {
    setSearch('')
    setBusinessType('')
    setCategory('')
    setDate('')
    setMaxPrice('')
    setAvailableOnly(false)
    setActiveFilters({ search: '', businessType: '', category: '', date: '', maxPrice: '', availableOnly: false })
  }

  const { data: offersData, isLoading, error } = useQuery({
    queryKey: queryKeys.offers.list({ ...activeFilters, status: 'Active' }),
    queryFn: () =>
      getOffers({
        search: activeFilters.search || undefined,
        status: 'Active',
        businessType: activeFilters.businessType || undefined,
        category: activeFilters.category || undefined,
        date: activeFilters.date || undefined,
        maxPrice: activeFilters.maxPrice || undefined,
        availableOnly: activeFilters.availableOnly || undefined,
        page: 1,
        pageSize: 50,
      }),
  })

  const offers = useMemo(() => offersData?.items ?? [], [offersData?.items])
  const bestDiscount = useMemo(() => Math.max(0, ...offers.map((offer) => offer.discountPercentage)), [offers])
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <Container className="py-8 sm:py-12">
      <section className="mb-8 overflow-hidden rounded-2xl border border-primary-900 bg-primary-900 text-white shadow-lift">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="animate-fade-up">
            <Badge tone="default">Limited-time local offers</Badge>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4.5xl">
              Reserve discounted slots from trusted local businesses.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-100 sm:text-base">
              Browse live offers, compare availability, and book the exact slot you want without waiting for a callback.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <span className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-primary-800 shadow-sm">
                <TicketPercent size={17} />
                Live marketplace
              </span>
              <a
                href="#offers"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Explore offers
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="grid animate-fade-up gap-3 self-end sm:grid-cols-3 lg:grid-cols-1" style={{ animationDelay: '120ms' }}>
            {[
              { label: 'Active deals', value: offers.length || '-', icon: Tag },
              { label: 'Best discount', value: bestDiscount ? `${bestDiscount}%` : '-', icon: TicketPercent },
              { label: 'Instant booking', value: '24/7', icon: ShieldCheck },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                <metric.icon size={18} className="text-primary-100" />
                <strong className="mt-3 block text-2xl text-white">{metric.value}</strong>
                <span className="text-xs font-medium text-primary-100">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: CheckCircle2, title: 'Verified businesses', text: 'Offers are linked to managed business profiles.' },
          { icon: CalendarDays, title: 'Slot-first booking', text: 'Every reservation is tied to a time and capacity.' },
          { icon: ShieldCheck, title: 'Capacity guarded', text: 'The booking engine protects against overbooking.' },
        ].map((item, index) => (
          <div
            key={item.title}
            className="animate-fade-up rounded-xl border border-border bg-white p-4 shadow-sm"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <item.icon size={18} className="text-primary-600" />
            <h2 className="mt-3 text-sm font-semibold text-ink">{item.title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div id="offers" className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Filter size={16} />
              Filters
            </h2>
            <button type="button" onClick={handleResetFilters} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Search</span>
              <span className="relative block">
                <Search size={14} className="absolute left-3 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="Offer or business"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 w-full rounded-md border border-border bg-white pl-8.5 pr-3 text-sm text-ink transition hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Business type</span>
              <select
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All types</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Category</span>
              <input
                type="text"
                placeholder="Lunch, trial class, spa"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Reservation date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Max offer price</span>
              <input
                type="number"
                placeholder="500"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value === '' ? '' : Number(event.target.value))}
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-ink transition hover:border-slate-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border bg-surface/70 p-3">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => setAvailableOnly(event.target.checked)}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-medium text-muted">Only show offers with open seats</span>
            </label>

            <Button type="submit" className="w-full">
              Apply filters
            </Button>
          </form>
        </aside>

        <main className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-semibold text-ink">Active booking offers</h2>
              <p className="mt-1 text-sm text-muted">
                {isLoading ? 'Finding the best live slots...' : `${offers.length} offers found`}
              </p>
            </div>
            {activeFilterCount > 0 ? <Badge tone="muted">{activeFilterCount} filters active</Badge> : null}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <OfferCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold">Unable to load offers</h3>
                <p className="mt-1 text-sm">Refresh the page or relax the filters and try again.</p>
              </div>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center shadow-sm">
              <Tag className="mx-auto mb-3 text-muted" size={32} />
              <h3 className="text-base font-semibold text-ink">No active offers matched</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Try clearing a few filters. The marketplace only shows active offers with valid booking windows.
              </p>
              <Button type="button" variant="secondary" onClick={handleResetFilters} className="mt-5">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer, index) => (
                <article
                  key={offer.id}
                  className="motion-card animate-fade-up rounded-xl border border-border bg-white p-5 shadow-sm hover:border-primary-100 hover:shadow-lift"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone="muted">{offer.category}</Badge>
                    <ExpiryTimer targetDate={offer.endsAt} />
                  </div>

                  <h3 className="mt-5 line-clamp-2 text-base font-semibold leading-6 text-ink transition group-hover:text-primary-700">
                    {offer.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-muted">{offer.businessName}</p>

                  {offer.description ? (
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted">{offer.description}</p>
                  ) : (
                    <p className="mt-3 min-h-10 text-sm leading-5 text-muted">A limited-time booking offer from this business.</p>
                  )}

                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-ink">{formatCurrency(offer.offerPrice)}</span>
                        <span className="text-xs text-muted line-through">{formatCurrency(offer.originalPrice)}</span>
                      </div>
                      <span className="mt-1 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-2xs font-bold uppercase text-emerald-700">
                        {offer.discountPercentage}% off
                      </span>
                    </div>

                    <Link
                      to={`/offers/${offer.id}`}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary-600 px-3.5 text-xs font-semibold text-white transition hover:bg-primary-700 hover:shadow-md active:translate-y-px"
                    >
                      Book
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </Container>
  )
}
