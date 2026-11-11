import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Container from '../ui/Container'
import { footerGroups } from '../../lib/navigation'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The Zero-Budget Filmmaking Network. A place where creative people find each other and turn ideas
              into films.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold text-fg">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted transition-colors hover:text-accent-soft">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} 0Budget. Creators keep the rights to their own work.</p>
          <p>Free to join. Clear about pay, always.</p>
        </div>
      </Container>
    </footer>
  )
}
