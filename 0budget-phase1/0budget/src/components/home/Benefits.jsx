import { Check } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'

const creatorBenefits = [
  'A professional public profile and portfolio',
  'Find collaborators with complementary skills',
  'Browse projects labelled with clear compensation',
  'Build credits and experience on real productions',
  'Private messaging and collaboration requests',
]

const companyBenefits = [
  'An organisation profile that showcases your work',
  'Discover emerging creators by skill and location',
  'Post projects and invite collaborators directly',
  'Reach film students and independent talent',
  'Free to start, with paid options planned for later',
]

function BenefitCard({ eyebrow, title, items, cta }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-8 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-extrabold">{title}</h3>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
            <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  )
}

export default function Benefits() {
  return (
    <section className="border-t border-line bg-surface py-24">
      <Container className="grid gap-6 lg:grid-cols-2">
        <BenefitCard
          eyebrow="For creators"
          title="Build your reel, build your network"
          items={creatorBenefits}
          cta={<Button to="/signup">Create your profile</Button>}
        />
        <BenefitCard
          eyebrow="For production companies"
          title="Find fresh talent for your next production"
          items={companyBenefits}
          cta={
            <Button to="/companies" variant="secondary">
              Learn more
            </Button>
          }
        />
      </Container>
    </section>
  )
}
