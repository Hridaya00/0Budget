import { Link, Navigate } from 'react-router-dom'
import { Building2, MapPin, Sparkles } from 'lucide-react'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Container from '../components/ui/Container'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getAccountTypeLabel } from '../lib/profileOptions'

// Phase 2 placeholder: shows the real signed-in profile. The widgets from the full dashboard
// (recommendations, messages, notifications) arrive in later phases.
export default function Dashboard() {
  const { profile, profileStatus } = useAuth()

  if (profileStatus === 'idle' || profileStatus === 'loading') return <PageLoader label="Loading your dashboard..." />

  // People who signed up but never saw onboarding (for example, they confirmed their email in a
  // different browser) are shown it once. They can skip it straight away.
  if (profileStatus === 'ready' && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  if (profileStatus !== 'ready' || !profile) {
    return (
      <Container className="pb-20 pt-28 sm:pt-32">
        <Alert tone="error" title="We could not load your profile">
          {profileStatus === 'missing'
            ? 'Your profile row does not exist. The database setup may be incomplete (see docs/supabase-setup.md).'
            : 'Something went wrong while loading your profile. Please refresh the page and try again.'}
        </Alert>
      </Container>
    )
  }

  const firstName = profile.full_name.split(' ')[0]
  const fields = [profile.location, profile.bio, profile.skills.length > 0, profile.interests.length > 0]
  const completion = Math.round(((1 + fields.filter(Boolean).length) / (1 + fields.length)) * 100)

  return (
    <Container className="pb-20 pt-28 sm:pt-32">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Dashboard</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Welcome, {firstName}.</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Your account is ready. Project posting, creator discovery, messaging and notifications are coming in the next
        phases.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-line bg-card p-6 sm:p-8" aria-labelledby="profile-heading">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="profile-heading" className="text-xl font-bold">
                {profile.account_type === 'production_company' && profile.organisation_name
                  ? profile.organisation_name
                  : profile.full_name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                <Badge tone="gold">{getAccountTypeLabel(profile.account_type)}</Badge>
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} aria-hidden="true" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.account_type === 'production_company' && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted">
              <Building2 size={16} aria-hidden="true" />
              Contact: {profile.full_name}
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-muted">
            {profile.bio || 'You have not added a biography yet.'}
          </p>

          {profile.skills.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Skills</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <li key={skill}>
                    <Badge tone="gold">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile.interests.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Interests</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <li key={interest}>
                    <Badge>{interest}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-card p-6" aria-labelledby="completion-heading">
            <h2 id="completion-heading" className="text-sm font-bold">
              Profile completion
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gradient-gold">{completion}%</p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-ink"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Profile editing arrives in Phase 3. Until then, your details are shown here as you saved them.
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={16} className="text-accent" aria-hidden="true" />
              Coming next
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Creator profiles and portfolios</li>
              <li>Posting and exploring projects</li>
              <li>Collaboration requests and messaging</li>
            </ul>
            <p className="mt-4 text-xs text-muted">
              Meanwhile, read our{' '}
              <Link to="/guidelines" className="text-accent-soft hover:underline">
                community guidelines
              </Link>
              .
            </p>
          </section>
        </aside>
      </div>
    </Container>
  )
}
