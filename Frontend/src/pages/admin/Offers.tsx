import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'

const offers = ['Lunch hour bundle', 'Weekend wellness pass', 'Early bird table']

export function Offers() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Create and maintain business offers before slot inventory is added."
        actions={
          <Button>
            <Plus size={16} />
            New offer
          </Button>
        }
      />
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {offers.map((offer) => (
          <div key={offer} className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0">
            <div>
              <h2 className="text-sm font-semibold text-ink">{offer}</h2>
              <p className="mt-1 text-sm">Draft configuration</p>
            </div>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">Draft</span>
          </div>
        ))}
      </div>
    </div>
  )
}
