import { Navigate } from 'react-router-dom'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { profilePath } from '../utils/profile'

// /profile - sends the signed-in member to their own public page, or to Edit Profile to choose a
// username first (members who signed up in Phase 2 do not have one yet).
export default function MyProfile() {
  const { profile, profileStatus } = useAuth()
  if (profileStatus === 'idle' || profileStatus === 'loading') return <PageLoader label="Loading your profile..." />
  if (profileStatus === 'ready' && profile?.username) return <Navigate to={profilePath(profile.username)} replace />
  return <Navigate to="/profile/edit#basics" replace />
}
