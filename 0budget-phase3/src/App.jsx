import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import { GuestRoute, ProtectedRoute } from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import ProfileEdit from './pages/ProfileEdit'
import MyProfile from './pages/MyProfile'
import PublicProfile from './pages/PublicProfile'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

// Pages that will be built in later phases. Each shows a clear "Coming soon" screen for now.
const upcoming = [
  { path: 'projects', title: 'Explore Projects', phase: 4, description: 'Search and filter film projects looking for collaborators.' },
  { path: 'projects/new', title: 'Share Your Project', phase: 4, description: 'Post your project and the roles you need. Available once accounts are live.' },
  { path: 'creators', title: 'Explore Creators', description: 'Searching and filtering creators is coming soon. Public creator profiles are already live: each one is at /creators/username.' },
  { path: 'opportunities', title: 'Opportunities', phase: 7, description: 'Casting calls, festivals, workshops and competitions, curated by the 0Budget team.' },
  { path: 'companies', title: 'For Production Companies', phase: 6, description: 'Organisation profiles, talent discovery and project publishing for studios and production houses.' },
  { path: 'guidelines', title: 'Community Guidelines', phase: 9, description: 'Our community rules will be published before public launch.' },
  { path: 'terms', title: 'Terms and Conditions', phase: 9, description: 'The terms will be published before public launch.' },
  { path: 'privacy', title: 'Privacy Policy', phase: 9, description: 'The privacy policy will be published before public launch.' },
]

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public: anyone can open these. */}
        <Route index element={<Home />} />
        {upcoming.map(({ path, ...page }) => (
          <Route key={path} path={path} element={<ComingSoon {...page} />} />
        ))}

        {/* Public creator profiles. Private profiles show a "not available" page. */}
        <Route path="creators/:username" element={<PublicProfile />} />

        {/* Sign up handles its own "already logged in" redirect so it can send new members to onboarding. */}
        <Route path="signup" element={<Signup />} />

        {/* Only for logged-out visitors: logged-in users are sent on to the dashboard. */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Opened from links in emails. These must work whether or not a session exists yet. */}
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Only for logged-in users: everyone else is sent to /login. */}
        <Route element={<ProtectedRoute />}>
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="profile/edit" element={<ProfileEdit />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
