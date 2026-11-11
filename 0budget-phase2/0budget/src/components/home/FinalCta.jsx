import Button from '../ui/Button'
import Container from '../ui/Container'

export default function FinalCta() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <Container className="!px-0">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-card px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(229,162,59,0.22),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-5xl">Roll camera on your next project.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Join a community of creators who believe the best stories do not need a big budget, just the right
              people.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button to="/signup" size="lg">
                Join 0Budget
              </Button>
              <Button to="/projects" variant="secondary" size="lg">
                Browse projects
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
