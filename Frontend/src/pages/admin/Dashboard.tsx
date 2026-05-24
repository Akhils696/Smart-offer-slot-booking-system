import { PageHeader } from '../../components/ui/PageHeader'

const cards = [
  { label: 'Active offers', value: '12' },
  { label: 'Booked slots', value: '84' },
  { label: 'Businesses', value: '7' },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="A quiet overview for offer activity and slot utilization." />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <section key={card.label} className="rounded-lg border border-border bg-white p-5">
            <p className="text-sm">{card.label}</p>
            <strong className="mt-3 block text-3xl font-semibold text-ink">{card.value}</strong>
          </section>
        ))}
      </div>
    </div>
  )
}
