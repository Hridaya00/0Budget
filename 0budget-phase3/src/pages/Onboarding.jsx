import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import ChipInput from '../components/ui/ChipInput'
import { SelectField, TextAreaField, TextField } from '../components/ui/Field'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { LIMITS, accountTypes, interestSuggestions, skillSuggestions } from '../lib/profileOptions'
import { friendlyProfileError } from '../services/profiles'
import { buildLocation, splitLegacyLocation } from '../utils/profile'
import {
  focusFirstError,
  hasErrors,
  normalizeList,
  validateAccountType,
  validateBio,
  validateFullName,
  validateCity,
  validateCountry,
  validateOrganisationName,
} from '../utils/validation'

const FIELD_ORDER = ['fullName', 'accountType', 'organisationName', 'city', 'country', 'bio']

// Shown once, right after sign-up. Only name and account type are required (they were already
// collected at sign-up). Everything else is optional, and "Skip for now" is always available.
export default function Onboarding() {
  const { profile, profileStatus, saveProfile } = useAuth()

  if (profileStatus === 'idle' || profileStatus === 'loading') return <PageLoader label="Loading your profile..." />

  if (profileStatus !== 'ready' || !profile) {
    return (
      <AuthShell title="We could not load your profile">
        <Alert tone="error">
          {profileStatus === 'missing'
            ? 'Your profile was not created. The database setup may be incomplete (see docs/supabase-setup.md).'
            : 'Something went wrong while loading your profile. Please refresh the page and try again.'}
        </Alert>
        <div className="mt-6">
          <Button to="/dashboard" variant="secondary" className="w-full">
            Continue to dashboard
          </Button>
        </div>
      </AuthShell>
    )
  }

  // Someone who has already finished onboarding has nothing to do here.
  if (profile.onboarding_completed) return <Navigate to="/dashboard" replace />

  return <OnboardingForm profile={profile} saveProfile={saveProfile} />
}

function OnboardingForm({ profile, saveProfile }) {
  const navigate = useNavigate()
  const legacyLocation = splitLegacyLocation(profile.location)
  const [values, setValues] = useState({
    fullName: profile.full_name ?? '',
    accountType: profile.account_type ?? 'filmmaker',
    organisationName: profile.organisation_name ?? '',
    city: profile.city ?? legacyLocation.city,
    country: profile.country ?? legacyLocation.country,
    bio: profile.bio ?? '',
  })
  const [skills, setSkills] = useState(profile.skills ?? [])
  const [interests, setInterests] = useState(profile.interests ?? [])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [skipping, setSkipping] = useState(false)

  function updateValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '', ...(name === 'accountType' ? { organisationName: '' } : {}) }))
  }

  function validateAll() {
    return {
      fullName: validateFullName(values.fullName),
      accountType: validateAccountType(values.accountType),
      organisationName: validateOrganisationName(values.organisationName, values.accountType),
      city: validateCity(values.city),
      country: validateCountry(values.country),
      bio: validateBio(values.bio),
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const newErrors = validateAll()
    setErrors(newErrors)
    if (hasErrors(newErrors)) {
      focusFirstError(newErrors, FIELD_ORDER)
      return
    }

    setSaving(true)
    const isCompany = values.accountType === 'production_company'
    const city = values.city.trim().replace(/\s+/g, ' ')
    const country = values.country.trim().replace(/\s+/g, ' ')
    const { error } = await saveProfile({
      full_name: values.fullName.trim(),
      account_type: values.accountType,
      organisation_name: isCompany ? values.organisationName.trim() : null,
      city: city || null,
      country: country || null,
      // The older single "location" column is kept in step (it holds at most 100 characters).
      location: buildLocation(city, country).slice(0, LIMITS.location) || null,
      bio: values.bio.trim() || null,
      skills: normalizeList(skills),
      interests: normalizeList(interests),
      onboarding_completed: true,
    })
    setSaving(false)

    if (error) {
      setFormError(friendlyProfileError(error))
      return
    }
    navigate('/dashboard', { replace: true })
  }

  // "Skip" saves nothing except the fact that onboarding is done, so the person is not asked again.
  // They can fill in the rest later from their profile.
  async function handleSkip() {
    setFormError('')
    setSkipping(true)
    const { error } = await saveProfile({ onboarding_completed: true })
    setSkipping(false)
    if (error) {
      setFormError(friendlyProfileError(error))
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthShell
      wide
      title="Tell us about yourself"
      subtitle="Help other creators find you. Everything here is optional and you can change it later."
      footer={
        <>
          Prefer to do this later?{' '}
          <button
            type="button"
            onClick={handleSkip}
            disabled={skipping || saving}
            className="font-medium text-accent-soft hover:underline disabled:opacity-60"
          >
            {skipping ? 'Skipping...' : 'Skip for now'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={(event) => updateValue('fullName', event.target.value)}
          error={errors.fullName}
        />
        <SelectField
          id="accountType"
          label="Account type"
          options={accountTypes}
          value={values.accountType}
          onChange={(event) => updateValue('accountType', event.target.value)}
          error={errors.accountType}
        />
        {values.accountType === 'production_company' && (
          <TextField
            id="organisationName"
            label="Organisation name"
            autoComplete="organization"
            value={values.organisationName}
            onChange={(event) => updateValue('organisationName', event.target.value)}
            error={errors.organisationName}
          />
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="city"
            label="City"
            optional
            autoComplete="address-level2"
            placeholder="e.g. Kathmandu"
            maxLength={LIMITS.city}
            value={values.city}
            onChange={(event) => updateValue('city', event.target.value)}
            error={errors.city}
          />
          <TextField
            id="country"
            label="Country"
            optional
            autoComplete="country-name"
            placeholder="e.g. Nepal"
            maxLength={LIMITS.country}
            value={values.country}
            onChange={(event) => updateValue('country', event.target.value)}
            error={errors.country}
          />
        </div>
        <TextAreaField
          id="bio"
          label="Short biography"
          optional
          placeholder="What do you make, and what are you looking for?"
          maxLength={LIMITS.bio}
          value={values.bio}
          onChange={(event) => updateValue('bio', event.target.value)}
          error={errors.bio}
        />
        <ChipInput
          id="skills"
          label="Skills"
          optional
          hint="Add the skills you bring to a project."
          items={skills}
          onChange={setSkills}
          suggestions={skillSuggestions}
          max={LIMITS.listItems}
          maxLength={LIMITS.listItemLength}
        />
        <ChipInput
          id="interests"
          label="Interests"
          optional
          hint="The kinds of projects you would like to work on."
          items={interests}
          onChange={setInterests}
          suggestions={interestSuggestions}
          max={LIMITS.listItems}
          maxLength={LIMITS.listItemLength}
        />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row-reverse">
          <Button type="submit" size="lg" loading={saving} disabled={skipping} className="sm:flex-1">
            {saving ? 'Saving...' : 'Save and continue'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={handleSkip} loading={skipping} disabled={saving} className="sm:flex-1">
            Skip for now
          </Button>
        </div>
        <p className="text-center text-xs text-muted">
          By continuing you agree to follow our{' '}
          <Link to="/guidelines" className="underline hover:text-fg">
            community guidelines
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  )
}
