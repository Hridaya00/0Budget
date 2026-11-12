import Alert from '../ui/Alert'
import { useAuth } from '../../hooks/useAuth'

// Shown on auth pages when the .env values are missing, so setup mistakes are obvious.
export default function ConfigNotice() {
  const { isConfigured } = useAuth()
  if (isConfigured) return null
  return (
    <Alert tone="warning" title="Supabase is not connected yet" className="mb-6">
      Copy <code className="rounded bg-ink px-1">.env.example</code> to <code className="rounded bg-ink px-1">.env</code>,
      add your Supabase project URL and publishable key, then restart <code className="rounded bg-ink px-1">npm run dev</code>.
      Until then, forms cannot sign anyone in.
    </Alert>
  )
}
