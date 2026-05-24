import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/common/Container'

export function Home() {
  return (
    <Container className="py-14 sm:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary-700">Smart slot reservations</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Book limited-time local offers without calling ahead.</h1>
        <p className="mt-5 text-base leading-7">
          A foundation for businesses to publish discounted offers with available booking slots, and for customers to reserve
          the time that works for them.
        </p>
        <Link
          to="/offers/sample-offer"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          View sample offer
          <ArrowRight size={16} />
        </Link>
      </section>
    </Container>
  )
}
