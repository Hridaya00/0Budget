import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, Pencil, User } from 'lucide-react'

// Small link row shown at the top of the profile pages:
// Back to Dashboard, My Profile (the public page), Edit Profile.
// "current" is 'edit' or 'profile' so the page you are on is not shown as a link.
export default function ProfileSubNav({ username, current }) {
  const linkClass = 'inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent-soft'
  return (
    <nav aria-label="Profile" className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <Link to="/dashboard" className={linkClass}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Dashboard
      </Link>
      {current !== 'profile' && (
        <Link to={username ? `/creators/${encodeURIComponent(username)}` : '/profile'} className={linkClass}>
          <Eye size={16} aria-hidden="true" />
          My Profile
        </Link>
      )}
      {current !== 'edit' && (
        <Link to="/profile/edit" className={linkClass}>
          <Pencil size={16} aria-hidden="true" />
          Edit Profile
        </Link>
      )}
      {current === 'profile' && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-soft" aria-current="page">
          <User size={16} aria-hidden="true" />
          Creator Profile
        </span>
      )}
    </nav>
  )
}
