import { Handshake, Eye, ShieldCheck } from 'lucide-react'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'

const pillars = [
  {
    icon: Handshake,
    title: 'Skills for skills',
    text: 'Writers, directors, actors, editors and composers exchange talent, time and experience to make work they are proud of.',
  },
  {
    icon: Eye,
    title: 'Honest about pay',
    text: 'Every listing is labelled unpaid, student, paid, revenue-share or negotiable. Nobody is expected to work for free by default.',
  },
  {
    icon: ShieldCheck,
    title: 'You keep your work',
    text: '0Budget never claims ownership of your scripts, footage or ideas. Agree on credits and rights up front, in writing.',
  },
]

export default function Intro() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="What is 0Budget?"
          title="A creative network, not a hunt for free labour"
          description="Great films start with people, not budgets. 0Budget helps talented creators find each other, build portfolios, and make real projects together."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-line bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
