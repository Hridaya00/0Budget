import { Loader2 } from 'lucide-react'

export function Spinner({ size = 18, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />
}

// Full-area loading state used while we check whether someone is logged in.
export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status">
      <Spinner size={32} className="text-accent" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
