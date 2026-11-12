import { Link } from 'react-router-dom'
import {
  Film, Video, Clapperboard, Camera, Mic2, Music, PenLine, Palette, Scissors, Building2,
} from 'lucide-react'
import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'

const categories = [
  { label: 'Directors', icon: Clapperboard },
  { label: 'Actors', icon: Film },
  { label: 'Screenwriters', icon: PenLine },
  { label: 'Cinematographers', icon: Video },
  { label: 'Photographers', icon: Camera },
  { label: 'Editors & VFX', icon: Scissors },
  { label: 'Composers & Musicians', icon: Music },
  { label: 'Sound Engineers', icon: Mic2 },
  { label: 'Production Designers', icon: Palette },
  { label: 'Production Companies', icon: Building2 },
]

export default function Categories() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Creative categories"
          title="Every role a film needs"
          description="From the first draft of a script to the final colour grade, find the people who complete your crew."
        />
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map(({ label, icon: Icon }) => (
            <li key={label}>
              <Link
                to="/creators"
                className="group flex h-full flex-col items-start gap-4 rounded-2xl border border-line bg-card p-5 transition-all duration-200 hover:border-accent/60 hover:bg-card/80"
              >
                <Icon size={24} className="text-accent transition-transform group-hover:scale-110" aria-hidden="true" />
                <span className="text-sm font-semibold text-fg">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
