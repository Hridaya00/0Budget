import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageLoader } from '../ui/Spinner'
import { useAuth } from '../../hooks/useAuth'

// Wraps pages that need a logged-in user. Visitors are sent to /login and returned here afterwards.
// This only controls what the browser shows. Real data protection comes from the database's
// Row Level Security rules, which keep working even if someone bypasses the frontend.
export function ProtectedRoute() {
  const { session, loading, signedOutByUser } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader label="Checking your session..." />
  // Someone who just chose "Log out" goes home. Everyone else (visitors, expired sessions) goes to /login.
  if (!session && signedOutByUser) return <Navigate to="/" replace />
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Wraps pages meant for logged-out visitors (login, forgot password).
// A logged-in user is sent on to the dashboard instead.
export function GuestRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (session) return <Navigate to={location.state?.from?.pathname ?? '/dashboard'} replace />
  return <Outlet />
}
