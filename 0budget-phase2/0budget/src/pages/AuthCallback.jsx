import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { readAuthErrorFromUrl } from '../utils/authErrors'

// The landing spot for the link in the "confirm your email" message.
// Supabase's client reads the link, signs the person in, and then we send them onward:
// new members go to onboarding, everyone else to the dashboard.
export default function AuthCallback() {
  const { session, loading, profile, profileStatus } = useAuth()
  const [urlError] = useState(() => readAuthErrorFromUrl())

  if (urlError) {
    return (
      <AuthShell title="Link problem">
        <Alert tone="error">{urlError}</Alert>
        <div className="mt-6">
          <Button to="/login" className="w-full">
            Go to log in
          </Button>
        </div>
      </AuthShell>
    )
  }

  const profilePending = session && (profileStatus === 'idle' || profileStatus === 'loading')
  if (loading || profilePending) return <PageLoader label="Signing you in..." />

  if (!session) {
    return (
      <AuthShell title="Almost there">
        <Alert tone="info">
          We could not sign you in automatically. If you have confirmed your email, you can log in now. Links only work in
          the same browser where you signed up.
        </Alert>
        <div className="mt-6">
          <Button to="/login" className="w-full">
            Go to log in
          </Button>
        </div>
      </AuthShell>
    )
  }

  const needsOnboarding = profileStatus === 'ready' && profile && !profile.onboarding_completed
  return <Navigate to={needsOnboarding ? '/onboarding' : '/dashboard'} replace />
}
