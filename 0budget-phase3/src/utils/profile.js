// Small helpers for showing profile data.

// "Kathmandu, Nepal" from the new city + country fields, falling back to the older single "location" text.
export function buildLocation(city, country) {
  return [city, country]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

export function formatLocation(profile) {
  return buildLocation(profile?.city, profile?.country) || String(profile?.location ?? '').trim()
}

// Phase 2 onboarding saved one text box ("Kathmandu, Nepal"). To pre-fill the new City and Country boxes
// we split it at the LAST comma. This is only a starting suggestion: the member checks it and saves.
export function splitLegacyLocation(location) {
  const parts = String(location ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return { city: '', country: '' }
  if (parts.length === 1) return { city: parts[0], country: '' }
  return { city: parts.slice(0, -1).join(', '), country: parts[parts.length - 1] }
}

// "Maya Rao" -> "MR", "Cher" -> "C"
export function getInitials(name) {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return '?'
  const first = Array.from(words[0])[0]
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : ''
  return `${first}${last}`.toUpperCase()
}

// The name to show for a profile: the organisation for production companies, otherwise the person.
export function getDisplayName(profile) {
  if (profile?.account_type === 'production_company' && profile.organisation_name) return profile.organisation_name
  return profile?.full_name ?? ''
}

// The public address of someone's profile.
export function profilePath(username) {
  return `/creators/${encodeURIComponent(username)}`
}
