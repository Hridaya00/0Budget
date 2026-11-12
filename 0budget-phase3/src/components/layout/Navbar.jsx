import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Container from '../ui/Container'
import UserMenu, { useDisplayName, useLogout } from './UserMenu'
import { useAuth } from '../../hooks/useAuth'
import { mainNav } from '../../lib/navigation'

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-accent-soft' : 'text-muted hover:text-fg'}`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { session, loading } = useAuth()
  const displayName = useDisplayName()
  const { logout, loggingOut } = useLogout()

  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [pathname])

  // Add a solid background once the user scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-line bg-ink/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {mainNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            // Keeps the layout steady while we check for a saved session (avoids a flash of "Log in").
            <div className="h-9 w-40" aria-hidden="true" />
          ) : session ? (
            <UserMenu />
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button to="/signup" size="sm">
                Join 0Budget
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-fg hover:bg-card md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-ink md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-base font-medium ${
                    isActive ? 'bg-card text-accent-soft' : 'text-fg hover:bg-card'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {loading ? null : session ? (
              <div className="mt-3 border-t border-line pt-4">
                <p className="px-3 pb-2 text-xs text-muted">
                  Signed in as <span className="font-medium text-fg">{displayName}</span>
                </p>
                <NavLink to="/dashboard" className="block rounded-lg px-3 py-3 text-base font-medium text-fg hover:bg-card">
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className="block rounded-lg px-3 py-3 text-base font-medium text-fg hover:bg-card">
                  My Profile
                </NavLink>
                <NavLink to="/profile/edit" className="block rounded-lg px-3 py-3 text-base font-medium text-fg hover:bg-card">
                  Edit Profile
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  disabled={loggingOut}
                  className="block w-full rounded-lg px-3 py-3 text-left text-base font-medium text-fg hover:bg-card disabled:opacity-60"
                >
                  {loggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-3">
                <Button to="/login" variant="secondary" className="flex-1">
                  Log in
                </Button>
                <Button to="/signup" className="flex-1">
                  Join
                </Button>
              </div>
            )}
          </Container>
        </div>
      )}
    </header>
  )
}
