import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Tag, Clock, Filter, AlertCircle } from 'lucide-react'
import { Container } from '../../components/common/Container'
import { getOffers } from '../../services/offer-service'
import { queryKeys } from '../../lib/queryKeys'
import { formatCurrency } from '../../utils/format'

const BUSINESS_TYPES = ['Restaurant', 'Gym', 'Salon', 'Clinic', 'Coaching', 'Turf', 'Other']

// Helper Countdown Component for Real-time Expiry Timer
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

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s left`)
      }
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const isCritical = timeLeft.includes('m') || timeLeft.includes('s') && !timeLeft.includes('d') && !timeLeft.includes('h')

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium rounded px-2 py-0.5 border ${
      timeLeft === 'Expired' 
        ? 'bg-red-50 text-red-700 border-red-150' 
        : isCritical 
          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' 
          : 'bg-primary-50 text-primary-700 border-primary-100'
    }`}>
      <Clock size={12} />
      {timeLeft}
    </span>
  )
}

export function Home() {
  const [search, setSearch] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [availableOnly, setAvailableOnly] = useState(false)

  // Trigger state for search/filter submit (avoids rapid querying on every key stroke)
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    businessType: '',
    category: '',
    date: '',
    maxPrice: '' as number | '',
    availableOnly: false
  })

  const handleApplyFilters = (e?: React.FormEvent) => {
    e?.preventDefault()
    setActiveFilters({
      search,
      businessType,
      category,
      date,
      maxPrice,
      availableOnly
    })
  }

  const handleResetFilters = () => {
    setSearch('')
    setBusinessType('')
    setCategory('')
    setDate('')
    setMaxPrice('')
    setAvailableOnly(false)
    setActiveFilters({
      search: '',
      businessType: '',
      category: '',
      date: '',
      maxPrice: '',
      availableOnly: false
    })
  }

  const { data: offersData, isLoading, error } = useQuery({
    queryKey: queryKeys.offers.list({
      ...activeFilters,
      status: 'Active' // Public can only see active offers
    }),
    queryFn: () => getOffers({
      search: activeFilters.search || undefined,
      status: 'Active',
      businessType: activeFilters.businessType || undefined,
      category: activeFilters.category || undefined,
      date: activeFilters.date || undefined,
      maxPrice: activeFilters.maxPrice || undefined,
      availableOnly: activeFilters.availableOnly || undefined,
      page: 1,
      pageSize: 50
    })
  })

  const offers = offersData?.items ?? []

  return (
    <Container className="py-8 sm:py-12">
      {/* Banner */}
      <section className="mb-12 rounded-2xl bg-gradient-to-br from-primary-900 to-primary-850 p-8 text-white sm:p-12 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-200">Limited-Time Local Offers</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4.5xl">
            Book hot local deals. Reserve your slot instantly.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-primary-100 leading-relaxed">
            Skip calling ahead! Service businesses publish surplus slots at highly discounted prices. Select a slot, fill in your details, and book your reservation immediately.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Left Side: Filtering Panel */}
        <aside className="lg:col-span-1 rounded-xl border border-border bg-white p-5 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <Filter size={16} />
              Filter Offers
            </h2>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Search Offer or Business</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="e.g. Happy Hour Deal"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-border pl-8.5 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Business Type Select */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">All Business Types</option>
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Category</label>
              <input
                type="text"
                placeholder="e.g. Trial Class, Lunch hour"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Reservation Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Price Cap Input */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Max Offer Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            {/* Available Slots Only Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="availableOnly"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded border-border text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="availableOnly" className="text-xs font-medium text-muted cursor-pointer select-none">
                Show only available slots
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Right Side: Active Offers Directory */}
        <main className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Active Booking Offers</h2>
            <span className="text-xs text-muted font-medium">{offers.length} offers found</span>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-750 flex gap-3 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Search Failure</h3>
                <p className="text-sm mt-1">Failed to query public offers directory. Please try reloading or adjusting your filters.</p>
              </div>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
              <Tag className="mx-auto text-muted mb-3" size={32} />
              <h3 className="font-medium text-ink text-base">No active offers matched</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                No active slot booking offers fit your current filter settings. Try clearing some filters to broaden your search.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-4 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {offers.map((offer) => (
                <article key={offer.id} className="group rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div>
                    {/* Expiry Header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="inline-flex rounded bg-gray-100 border border-gray-150 px-2 py-0.5 text-2xs font-semibold text-muted tracking-wide uppercase">
                        {offer.category}
                      </span>
                      <ExpiryTimer targetDate={offer.endsAt} />
                    </div>

                    <h3 className="text-base font-semibold text-ink group-hover:text-primary-700 transition duration-150">{offer.title}</h3>
                    <p className="text-xs text-muted font-medium mt-1">{offer.businessName}</p>
                    
                    {offer.description && (
                      <p className="text-xs text-muted mt-2.5 line-clamp-2 leading-relaxed">{offer.description}</p>
                    )}
                  </div>

                  <div className="mt-5 border-t border-border pt-4 flex items-center justify-between">
                    <div>
                      {/* Price Matrix */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-ink">{formatCurrency(offer.offerPrice)}</span>
                        <span className="text-xs text-muted line-through">{formatCurrency(offer.originalPrice)}</span>
                      </div>
                      <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 mt-1 inline-block">
                        {offer.discountPercentage}% OFF
                      </span>
                    </div>

                    <Link
                      to={`/offers/${offer.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
                    >
                      Book Now
                      <ArrowRight size={12} />
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
