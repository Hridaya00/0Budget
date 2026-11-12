import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Pencil, User } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'

// Name to show for the signed-in person. Falls back to the email's first part while the profile loads.
export function useDisplayName() {
  const { profile, user } = useAuth()
  if (profile?.account_type === 'production_company' && profile.organisation_name) return profile.organisation_name
  return profile?.full_name ?? user?.email?.split('@')[0] ?? 'Account'
}

// Hook shared by the desktop menu and the mobile menu so both log out the same way.
// After signing out, the route guard (components/auth/ProtectedRoute.jsx) sends the person to the
// home page if they were on a private page such as the dashboard.
export function useLogout() {
  const { signOut } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
  }
  return { logout, loggingOut }
}

// Desktop dropdown shown in the navbar when someone is logged in.
export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const name = useDisplayName()
  const { profile } = useAuth()
  const { logout, loggingOut } = useLogout()

  // Close on outside click and on the Escape key.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-line bg-card/60 py-1.5 pl-1.5 pr-3 text-sm font-medium text-fg transition-colors hover:border-accent"
      >
        <span aria-hidden="true" className="flex">
          <Avatar src={profile?.avatar_url} name={name} size="sm" className="!h-7 !w-7 !rounded-md" />
        </span>
        <span className="max-w-32 truncate">{name}</span>
        <ChevronDown size={16} aria-hidden="true" className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-card p-1.5 shadow-xl shadow-black/40">
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-fg hover:bg-ink"
          >
            <LayoutDashboard size={16} aria-hidden="true" className="text-accent" />
            Dashboard
          </Link>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-fg hover:bg-ink"
          >
            <User size={16} aria-hidden="true" className="text-accent" />
            My Profile
          </Link>
          <Link
            to="/profile/edit"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-fg hover:bg-ink"
          >
            <Pencil size={16} aria-hidden="true" className="text-accent" />
            Edit Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-fg hover:bg-ink disabled:opacity-60"
          >
            <LogOut size={16} aria-hidden="true" className="text-accent" />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  )
}
