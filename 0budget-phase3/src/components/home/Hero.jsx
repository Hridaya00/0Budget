import { ArrowRight, Clapperboard } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../ui/Container'

export default function Hero() {
  return (
    <section className="film-grain relative isolate overflow-hidden pt-16">
      {/* Cinematic backdrop built from gradients: a warm "projector beam" over a dark frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(229,162,59,0.28),transparent_60%),radial-gradient(ellipse_60%_50%_at_10%_90%,rgba(245,196,106,0.10),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_60%,var(--color-ink))]"
      />
      {/* Letterbox bars */}
      <div aria-hidden="true" className="absolute inset-x-0 top-16 -z-10 h-px bg-line" />

      <Container className="flex min-h-[min(88vh,820px)] flex-col justify-center py-20">
        <div className="animate-fade-up max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">
            <Clapperboard size={14} aria-hidden="true" />
            The Zero-Budget Filmmaking Network
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] text-fg sm:text-6xl lg:text-7xl">
            Your Story Deserves <span className="text-gradient-gold">to Be Made.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Connect with filmmakers, actors, writers, editors, and creative minds. Turn your ideas into films,
            one collaboration at a time.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button to="/creators" size="lg">
              Find Your Crew
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button to="/projects/new" variant="secondary" size="lg">
              Share Your Project
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted">
            Free to join. Every project states clearly whether it is paid, unpaid, revenue-share or negotiable.
          </p>
        </div>
      </Container>
    </section>
  )
}
