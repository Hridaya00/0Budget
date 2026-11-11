import Button from '../components/ui/Button'
import Container from '../components/ui/Container'

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center pb-16 pt-32 text-center">
      <p className="font-display text-7xl font-extrabold text-gradient-gold">404</p>
      <h1 className="mt-4 text-3xl font-extrabold">That scene was cut.</h1>
      <p className="mt-3 max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8">
        <Button to="/">Back to home</Button>
      </div>
    </Container>
  )
}
