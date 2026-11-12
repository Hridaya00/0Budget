import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clapperboard, Lock, MapPin, Pencil, Wrench } from 'lucide-react'
import Alert from '../components/ui/Alert'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import EmptyState from '../components/ui/EmptyState'
import { PageLoader } from '../components/ui/Spinner'
import PortfolioCard from '../components/profile/PortfolioCard'
import ProfileSubNav from '../components/profile/ProfileSubNav'
import SocialLinks from '../components/profile/SocialLinks'
import { useAuth } from '../hooks/useAuth'
import { getAccountTypeLabel, getExperienceLabel } from '../lib/profileOptions'
import { fetchPortfolio } from '../services/portfolio'
import {
  fetchProfileByUsername,
  fetchPrivateProfileIdentity,
} from '../services/profiles'
import { formatLocation, getDisplayName } from '../utils/profile'

// /creators/:username - the public portfolio page. Nothing private is requested or shown here
// (the database has no email column on profiles, and private profiles are hidden by Row Level Security).
export default function PublicProfile() {
  const { username } = useParams()
  const { session, user } = useAuth()
  // 'loading' | 'ready' | 'notfound' | 'error'
  const [state, setState] = useState({ status: 'loading', profile: null, entries: [], portfolioFailed: false })

  useEffect(() => {
    let active = true
    setState({ status: 'loading', profile: null, entries: [], portfolioFailed: false })
    async function load() {
      const { profile, error } = await fetchProfileByUsername(username)
      if (!active) return
      if (error) {
        console.error('Could not load the public profile:', error)
        setState({ status: 'error', profile: null, entries: [], portfolioFailed: false })
        return
      }
      if (!profile) {
  const { identity, error: identityError } = await fetchPrivateProfileIdentity(username)

  if (!active) return

  if (identityError) {
    console.error('Could not load private profile identity:', identityError)
    setState({ status: 'error', profile: null, entries: [], portfolioFailed: false })
    return
  }

  if (identity) {
    setState({
      status: 'private',
      profile: identity,
      entries: [],
      portfolioFailed: false,
    })
    return
  }

  setState({ status: 'notfound', profile: null, entries: [], portfolioFailed: false })
  return
}
      const { entries, error: portfolioError } = await fetchPortfolio(profile.id)
      if (!active) return
      if (portfolioError) console.error('Could not load the portfolio:', portfolioError)
      setState({ status: 'ready', profile, entries, portfolioFailed: Boolean(portfolioError) })
    }
    load()
    return () => {
      active = false
    }
  }, [username])

  const { status, profile, entries, portfolioFailed } = state
  const name = profile ? getDisplayName(profile) : ''

  useEffect(() => {
    document.title = name ? `${name} | 0Budget` : '0Budget'
    return () => {
      document.title = '0Budget'
    }
  }, [name])

  if (status === 'loading') return <PageLoader label="Loading profile..." />
  if (status === 'private') {
  const privateName = getDisplayName(profile)

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-line pb-16 pt-28 sm:pt-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(229,162,59,0.18),transparent_70%)]"
        />

        <Container className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <Avatar
            src={profile.avatar_url}
            name={privateName}
            size="xl"
            className="ring-4 ring-accent/20"
          />

          <h1 className="mt-5 break-words text-3xl font-extrabold sm:text-4xl">
            {privateName}
          </h1>

          <p className="mt-1 text-muted">@{profile.username}</p>

          <span className="mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Lock size={24} aria-hidden="true" />
          </span>

          <h2 className="mt-5 text-2xl font-bold">
            This profile is private
          </h2>

          <p className="mt-3 max-w-md text-muted">
            This creator has chosen to keep their profile private. Their portfolio and profile details aren't publicly available.
          </p>

          <Button to="/" variant="secondary" className="mt-8">
            Back to home
          </Button>
        </Container>
      </section>
    </div>
  )
}

  if (status === 'error') {
    return (
      <Container className="pb-20 pt-28 sm:pt-32">
        <Alert tone="error" title="We could not load this profile">
          Please check your connection and refresh the page.
        </Alert>
      </Container>
    )
  }

  // Private profiles and usernames that do not exist look exactly the same on purpose.
  if (status === 'notfound') {
    return (
      <Container className="flex min-h-[70vh] flex-col items-center justify-center pb-16 pt-32 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Lock size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">This profile is not available</h1>
        <p className="mt-3 max-w-md text-muted">
          It may not exist, the username may have changed, or the creator may have made their profile private.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="secondary">
            Back to home
          </Button>
          {session && <Button to="/dashboard">Back to Dashboard</Button>}
        </div>
      </Container>
    )
  }

  const isOwner = Boolean(user && profile.id === user.id)
  const location = formatLocation(profile)
  const experience = getExperienceLabel(profile.experience_level)
  const hasLinks = ['instagram_url', 'youtube_url', 'linkedin_url', 'website_url', 'portfolio_url'].some((key) => profile[key])

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-line pb-12 pt-28 sm:pt-32">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(229,162,59,0.18),transparent_70%)]"
        />
        <Container>
          {isOwner && (
            <div className="mb-8">
              <ProfileSubNav username={profile.username} current="profile" />
            </div>
          )}
          {isOwner && !profile.is_public && (
            <Alert tone="warning" title="Only you can see this page" className="mb-8">
              Your profile is private. Turn on “Public profile” in Edit profile to let other creators find you.
            </Alert>
          )}

          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
            <Avatar src={profile.avatar_url} name={name} size="xl" className="ring-4 ring-accent/20" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Badge tone="gold">{getAccountTypeLabel(profile.account_type)}</Badge>
                {experience && <Badge>{experience}</Badge>}
              </div>
              <h1 className="mt-3 break-words text-4xl font-extrabold sm:text-5xl">{name}</h1>
              <p className="mt-1 text-muted">@{profile.username}</p>
              {profile.account_type === 'production_company' && profile.organisation_name && (
                <p className="mt-1 text-sm text-muted">Contact: {profile.full_name}</p>
              )}
              {location && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                  <MapPin size={15} aria-hidden="true" className="text-accent" />
                  {location}
                </p>
              )}
            </div>
            {isOwner && (
              <Button to="/profile/edit" variant="secondary" className="shrink-0">
                <Pencil size={16} aria-hidden="true" />
                Edit Profile
              </Button>
            )}
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 pb-24 pt-12 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-8">
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              About
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
              {profile.bio || (isOwner ? 'You have not written a biography yet.' : 'This creator has not written a biography yet.')}
            </p>
          </section>

          {profile.skills.length > 0 && (
            <section aria-labelledby="skills-heading">
              <h2 id="skills-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Skills
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <li key={skill}>
                    <Badge tone="gold">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.interests.length > 0 && (
            <section aria-labelledby="interests-heading">
              <h2 id="interests-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Interests
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <li key={interest}>
                    <Badge>{interest}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.equipment?.length > 0 && (
            <section aria-labelledby="equipment-heading">
              <h2 id="equipment-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <Wrench size={14} aria-hidden="true" />
                Equipment
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.equipment.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasLinks && (
            <section aria-labelledby="links-heading">
              <h2 id="links-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Find them online
              </h2>
              <div className="mt-3">
                <SocialLinks profile={profile} />
              </div>
            </section>
          )}
        </aside>

        <section aria-labelledby="portfolio-heading">
          <h2 id="portfolio-heading" className="text-2xl font-extrabold">
            Portfolio
          </h2>
          {portfolioFailed ? (
            <Alert tone="error" className="mt-6">
              We could not load the portfolio. Please refresh the page.
            </Alert>
          ) : entries.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Clapperboard}
                title="No portfolio entries yet"
                description={isOwner ? 'Add your first project so visitors can see your work.' : 'This creator has not added any work yet.'}
                action={
                  isOwner ? (
                    <Button to="/profile/edit#portfolio" size="sm">
                      Add a portfolio entry
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <PortfolioCard entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </Container>

      {!isOwner && (
        <Container className="pb-16 text-center text-sm text-muted">
          <Link to="/" className="hover:text-accent-soft">
            Back to 0Budget
          </Link>
        </Container>
      )}
    </div>
  )
}
