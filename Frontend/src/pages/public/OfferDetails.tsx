import { CalendarClock } from 'lucide-react'
import { Container } from '../../components/common/Container'
import { Button } from '../../components/ui/Button'

export function OfferDetails() {
  return (
    <Container className="py-12">
      <article className="max-w-3xl rounded-lg border border-border bg-white p-6 shadow-soft">
        <span className="text-sm font-semibold text-primary-700">Sample business</span>
        <h1 className="mt-3 text-3xl font-semibold">Weekend wellness pass</h1>
        <p className="mt-4 leading-7">
          Reserve a discounted slot for a limited weekend offer. Full booking behavior will be connected in the next phase.
        </p>
        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted">
            <CalendarClock size={18} />
            Slots available after API integration
          </div>
          <Button type="button">Reserve slot</Button>
        </div>
      </article>
    </Container>
  )
}
