import { Link } from 'react-router-dom'

// The "0" in 0Budget doubles as a film reel / slashed zero.
export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label="0Budget home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/60 bg-ink">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <ellipse cx="16" cy="16" rx="6.5" ry="9" fill="none" stroke="#F5C46A" strokeWidth="2.6" />
          <line x1="10.5" y1="21.5" x2="21.5" y2="10.5" stroke="#E5A23B" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-fg">
        0<span className="text-accent">Budget</span>
      </span>
    </Link>
  )
}
