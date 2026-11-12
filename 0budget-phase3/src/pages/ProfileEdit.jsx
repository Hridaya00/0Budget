import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Circle, Eye } from 'lucide-react'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import ChipInput from '../components/ui/ChipInput'
import Container from '../components/ui/Container'
import { SelectField, TextAreaField, TextField, ToggleField } from '../components/ui/Field'
import { PageLoader } from '../components/ui/Spinner'
import AvatarUploader from '../components/profile/AvatarUploader'
import PortfolioManager from '../components/profile/PortfolioManager'
import ProfileSubNav from '../components/profile/ProfileSubNav'
import { useAuth } from '../hooks/useAuth'
import { countries } from '../lib/countries'
import {
  LIMITS,
  accountTypes,
  equipmentSuggestions,
  experienceLevels,
  interestSuggestions,
  skillSuggestions,
  socialPlatforms,
} from '../lib/profileOptions'
import { fetchPortfolio } from '../services/portfolio'
import { friendlyProfileError, isUsernameAvailable } from '../services/profiles'
import { buildLocation, getDisplayName, profilePath, splitLegacyLocation } from '../utils/profile'
import { calculateProfileCompletion } from '../utils/profileCompletion'
import { normalizeSocial } from '../utils/urls'
import {
  focusFirstError,
  hasErrors,
  normalizeList,
  validateAccountType,
  validateBio,
  validateCity,
  validateCountry,
  validateExperienceLevel,
  validateFullName,
  validateOrganisationName,
  validateSocial,
  validateUsername,
} from '../utils/validation'

const FIELD_ORDER = [
  'fullName',
  'username',
  'accountType',
  'organisationName',
  'city',
  'country',
  'bio',
  'experience',
  ...socialPlatforms.map((platform) => platform.field),
]

const experienceOptions = [{ value: '', label: 'Not specified' }, ...experienceLevels.map(({ value, label }) => ({ value, label }))]

function Section({ id, title, description, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 rounded-2xl border border-line bg-card p-6 sm:p-8">
      <h2 id={`${id}-heading`} className="text-xl font-bold">
        {title}
      </h2>
      {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

// /profile/edit - the signed-in member edits their own profile and portfolio.
export default function ProfileEdit() {
  const { profile, profileStatus } = useAuth()

  if (profileStatus === 'idle' || profileStatus === 'loading') return <PageLoader label="Loading your profile..." />

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

  return <ProfileEditor profile={profile} />
}

function initialValues(profile) {
  // Members from Phase 2 only have the single "location" text. Offer it as a starting point for the new boxes.
  const hasNewLocation = Boolean(profile.city || profile.country)
  const legacy = hasNewLocation ? { city: '', country: '' } : splitLegacyLocation(profile.location)
  return {
    fullName: profile.full_name ?? '',
    username: profile.username ?? '',
    accountType: profile.account_type ?? 'filmmaker',
    organisationName: profile.organisation_name ?? '',
    city: profile.city ?? legacy.city,
    country: profile.country ?? legacy.country,
    bio: profile.bio ?? '',
    experience: profile.experience_level ?? '',
    isPublic: profile.is_public !== false,
    ...Object.fromEntries(socialPlatforms.map(({ key, field }) => [field, profile[key] ?? ''])),
  }
}

function ProfileEditor({ profile }) {
  const { saveProfile } = useAuth()
  const { hash } = useLocation()

  // The form is filled in once from the saved profile; later changes to the shared profile
  // (for example a new picture) must not wipe what the person is typing.
  const [values, setValues] = useState(() => initialValues(profile))
  const [skills, setSkills] = useState(profile.skills ?? [])
  const [interests, setInterests] = useState(profile.interests ?? [])
  const [equipment, setEquipment] = useState(profile.equipment ?? [])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usernameHint, setUsernameHint] = useState('')

  const [entries, setEntries] = useState([])
  const [portfolioStatus, setPortfolioStatus] = useState('loading')

  const loadPortfolio = useCallback(async () => {
    setPortfolioStatus('loading')
    const { entries: loaded, error } = await fetchPortfolio(profile.id)
    if (error) {
      console.error('Could not load the portfolio:', error)
      setPortfolioStatus('error')
      return
    }
    setEntries(loaded)
    setPortfolioStatus('ready')
  }, [profile.id])

  useEffect(() => {
    loadPortfolio()
  }, [loadPortfolio])

  // Links such as /profile/edit#portfolio (from the dashboard checklist) scroll to that section.
  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const displayName = getDisplayName(profile) || values.fullName
  const completion = calculateProfileCompletion(profile, portfolioStatus === 'ready' ? entries.length : null)

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '', ...(name === 'accountType' ? { organisationName: '' } : {}) }))
    setSaved(false)
    if (name === 'username') setUsernameHint('')
  }

  function updateList(setter) {
    return (next) => {
      setter(next)
      setSaved(false)
    }
  }

  // Asks the database whether the username is free (the real guarantee is the unique index at save time).
  async function checkUsername() {
    const username = values.username.trim()
    if (!username || username === profile.username || validateUsername(username)) return true
    const { available, error } = await isUsernameAvailable(username)
    if (error) return true // cannot tell: let the save decide
    if (!available) {
      setErrors((current) => ({ ...current, username: 'That username is already taken. Please choose another one.' }))
      return false
    }
    setUsernameHint('That username is available.')
    return true
  }

  function validateAll() {
    const found = {
      fullName: validateFullName(values.fullName),
      username: validateUsername(values.username),
      accountType: validateAccountType(values.accountType),
      organisationName: validateOrganisationName(values.organisationName, values.accountType),
      city: validateCity(values.city),
      country: validateCountry(values.country),
      bio: validateBio(values.bio),
      experience: validateExperienceLevel(values.experience),
    }
    for (const { key, field } of socialPlatforms) found[field] = validateSocial(key, values[field])
    return found
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setSaved(false)

    const found = validateAll()
    setErrors(found)
    if (hasErrors(found)) {
      focusFirstError(found, FIELD_ORDER)
      return
    }

    setSaving(true)
    if (!(await checkUsername())) {
      setSaving(false)
      focusFirstError({ username: true }, FIELD_ORDER)
      return
    }

    const city = values.city.trim().replace(/\s+/g, ' ')
    const country = values.country.trim().replace(/\s+/g, ' ')
    const isCompany = values.accountType === 'production_company'
    const social = Object.fromEntries(socialPlatforms.map(({ key, field }) => [key, normalizeSocial(key, values[field]).value]))

    const { profile: updated, error } = await saveProfile({
      full_name: values.fullName.trim().replace(/\s+/g, ' '),
      username: values.username.trim(),
      account_type: values.accountType,
      organisation_name: isCompany ? values.organisationName.trim() : null,
      city: city || null,
      country: country || null,
      // The older single "location" column is kept in step (it holds at most 100 characters).
      location: buildLocation(city, country).slice(0, LIMITS.location) || null,
      bio: values.bio.trim() || null,
      skills: normalizeList(skills),
      interests: normalizeList(interests),
      equipment: normalizeList(equipment, { maxLength: LIMITS.equipmentItemLength }),
      experience_level: values.experience || null,
      is_public: values.isPublic,
      ...social,
    })
    setSaving(false)

    if (error) {
      setFormError(friendlyProfileError(error))
      if (error.code === '23505') setErrors((current) => ({ ...current, username: 'That username is already taken.' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Show exactly what was saved (cleaned-up links, trimmed text).
    setValues(initialValues(updated))
    setSkills(updated.skills ?? [])
    setInterests(updated.interests ?? [])
    setEquipment(updated.equipment ?? [])
    setSaved(true)
    setUsernameHint('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const publicLink = profile.username ? profilePath(profile.username) : null

  return (
    <Container className="pb-24 pt-28 sm:pt-32">
      <ProfileSubNav username={profile.username} current="edit" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your profile</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Edit profile</h1>
      <p className="mt-3 max-w-2xl text-muted">
        This is what other creators see on your public profile. Your email address is never shown.
      </p>

      <div className="mt-6 space-y-3" aria-live="polite">
        {saved && (
          <Alert tone="success" title="Profile saved">
            Your changes are live.{' '}
            {publicLink && values.isPublic && (
              <Link to={publicLink} className="font-medium underline">
                View your public profile
              </Link>
            )}
          </Alert>
        )}
        {formError && <Alert tone="error">{formError}</Alert>}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <Section id="photo" title="Profile picture">
              <AvatarUploader profile={profile} name={displayName} />
            </Section>

            <Section id="basics" title="Basics" description="Your name, public link and where you are based.">
              <div className="space-y-5">
                <TextField
                  id="fullName"
                  label="Full name"
                  autoComplete="name"
                  maxLength={LIMITS.nameMax}
                  value={values.fullName}
                  onChange={(event) => update('fullName', event.target.value)}
                  error={errors.fullName}
                />
                <TextField
                  id="username"
                  label="Username"
                  leading="@"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={LIMITS.usernameMax}
                  hint={usernameHint || `Your public link: /creators/${values.username.trim() || 'username'}. Lowercase letters, numbers and underscores.`}
                  value={values.username}
                  onChange={(event) => update('username', event.target.value.toLowerCase())}
                  onBlur={checkUsername}
                  error={errors.username}
                />
                <SelectField
                  id="accountType"
                  label="Account type"
                  options={accountTypes}
                  value={values.accountType}
                  onChange={(event) => update('accountType', event.target.value)}
                  error={errors.accountType}
                />
                {values.accountType === 'production_company' && (
                  <TextField
                    id="organisationName"
                    label="Organisation name"
                    autoComplete="organization"
                    value={values.organisationName}
                    onChange={(event) => update('organisationName', event.target.value)}
                    error={errors.organisationName}
                  />
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="city"
                    label="City"
                    optional
                    autoComplete="address-level2"
                    maxLength={LIMITS.city}
                    value={values.city}
                    onChange={(event) => update('city', event.target.value)}
                    error={errors.city}
                  />
                  <TextField
                    id="country"
                    label="Country"
                    optional
                    autoComplete="country-name"
                    list="country-options"
                    maxLength={LIMITS.country}
                    value={values.country}
                    onChange={(event) => update('country', event.target.value)}
                    error={errors.country}
                  />
                  <datalist id="country-options">
                    {countries.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </div>
                <TextAreaField
                  id="bio"
                  label="Biography"
                  optional
                  placeholder="What do you make, and what are you looking for?"
                  maxLength={LIMITS.bio}
                  value={values.bio}
                  onChange={(event) => update('bio', event.target.value)}
                  error={errors.bio}
                />
              </div>
            </Section>

            <Section id="professional" title="Professional details" description="Help the right people find you for the right projects.">
              <div className="space-y-5">
                <ChipInput
                  id="skills"
                  label="Skills"
                  optional
                  hint="Add the skills you bring to a project."
                  items={skills}
                  onChange={updateList(setSkills)}
                  suggestions={skillSuggestions}
                  max={LIMITS.listItems}
                  maxLength={LIMITS.listItemLength}
                />
                <SelectField
                  id="experience"
                  label="Experience level"
                  optional
                  options={experienceOptions}
                  value={values.experience}
                  onChange={(event) => update('experience', event.target.value)}
                  error={errors.experience}
                  hint={experienceLevels.find((level) => level.value === values.experience)?.hint}
                />
                <ChipInput
                  id="interests"
                  label="Areas of interest"
                  optional
                  hint="The kinds of projects you would like to work on."
                  items={interests}
                  onChange={updateList(setInterests)}
                  suggestions={interestSuggestions}
                  max={LIMITS.listItems}
                  maxLength={LIMITS.listItemLength}
                />
                <ChipInput
                  id="equipment"
                  label="Equipment you can bring"
                  optional
                  hint="Optional. Gear you own and could use on a project."
                  items={equipment}
                  onChange={updateList(setEquipment)}
                  suggestions={equipmentSuggestions}
                  max={LIMITS.listItems}
                  maxLength={LIMITS.equipmentItemLength}
                />
              </div>
            </Section>

            <Section id="links" title="Links" description="Where people can see more of your work. Links must use https://.">
              <div className="space-y-5">
                {socialPlatforms.map(({ key, field, label, placeholder }) => (
                  <TextField
                    key={key}
                    id={field}
                    label={label}
                    optional
                    inputMode="url"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder={placeholder}
                    value={values[field]}
                    onChange={(event) => update(field, event.target.value)}
                    error={errors[field]}
                  />
                ))}
              </div>
            </Section>

            <Section id="visibility" title="Visibility">
              <ToggleField
                id="isPublic"
                label="Public profile"
                description={
                  values.isPublic
                    ? 'Anyone with your link can see your profile and portfolio, and you can be found by other creators.'
                    : 'Only you can see your profile. Other people get a "not available" page.'
                }
                checked={values.isPublic}
                onChange={(next) => update('isPublic', next)}
              />
            </Section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button to="/dashboard" variant="secondary" size="lg">
                Back to Dashboard
              </Button>
              <Button type="submit" size="lg" loading={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </form>

          <Section
            id="portfolio"
            title="Portfolio"
            description="Showcase your work with links. Each entry saves on its own, so you do not need to press “Save profile”."
          >
            <PortfolioManager
              profileId={profile.id}
              entries={entries}
              status={portfolioStatus}
              onChange={setEntries}
              onRetry={loadPortfolio}
            />
          </Section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-line bg-card p-6" aria-labelledby="edit-completion-heading">
            <h2 id="edit-completion-heading" className="text-sm font-bold">
              Profile completion
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gradient-gold">
              {completion.percent === null ? '...' : `${completion.percent}%`}
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-ink"
              role="progressbar"
              aria-valuenow={completion.percent ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completion.percent ?? 0}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {completion.items.map((item) => (
                <li key={item.key} className={`flex items-center gap-2 ${item.done ? 'text-fg' : 'text-muted'}`}>
                  {item.done ? (
                    <CheckCircle2 size={16} className="shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <Circle size={16} className="shrink-0" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                  <span className="sr-only">{item.done ? '(done)' : '(not done yet)'}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted">Counts what is saved. Press “Save profile” to update it.</p>
          </section>

          {publicLink && (
            <Button to={publicLink} variant="secondary" className="w-full">
              <Eye size={16} aria-hidden="true" />
              View my public profile
            </Button>
          )}
        </aside>
      </div>
    </Container>
  )
}
