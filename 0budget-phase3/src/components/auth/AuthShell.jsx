import Container from '../ui/Container'

// The shared page frame for login, sign up, password reset and onboarding screens.
export default function AuthShell({ title, subtitle, footer, wide = false, children }) {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-28 sm:pt-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(229,162,59,0.20),transparent_70%)]"
      />
      <Container>
        <div className={`mx-auto ${wide ? 'max-w-xl' : 'max-w-md'}`}>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
          </div>
          <div className="mt-8 rounded-2xl border border-line bg-card p-6 shadow-xl shadow-black/30 sm:p-8">
            {children}
          </div>
          {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        </div>
      </Container>
    </section>
  )
}
