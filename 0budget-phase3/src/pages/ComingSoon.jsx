import { Hammer } from 'lucide-react'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import Badge from '../components/ui/Badge'

// Clearly marked placeholder for pages that arrive in later phases,
// so no link on the site silently does nothing.
export default function ComingSoon({ title, description, phase }) {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center pb-16 pt-32 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Hammer size={26} aria-hidden="true" />
      </span>
      <div className="mt-5">
        <Badge tone="gold">Coming soon{phase ? ` - Phase ${phase}` : ''}</Badge>
      </div>
      <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-lg text-muted">{description}</p>
      <div className="mt-8">
        <Button to="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </Container>
  )
}
