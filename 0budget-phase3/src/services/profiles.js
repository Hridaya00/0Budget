import { supabase } from '../lib/supabase'

// Everything the signed-in member's own pages need (never includes an email: profiles has none).
const PROFILE_COLUMNS = [
  'id', 'full_name', 'username', 'account_type', 'organisation_name', 'location', 'city', 'country',
  'bio', 'skills', 'interests', 'equipment', 'experience_level', 'avatar_url',
  'instagram_url', 'youtube_url', 'linkedin_url', 'website_url', 'portfolio_url',
  'is_public', 'onboarding_completed', 'created_at', 'updated_at',
].join(', ')

// What a public profile page needs. Visitors never see onboarding_completed.
const PUBLIC_PROFILE_COLUMNS = [
  'id', 'full_name', 'username', 'account_type', 'organisation_name', 'location', 'city', 'country',
  'bio', 'skills', 'interests', 'equipment', 'experience_level', 'avatar_url',
  'instagram_url', 'youtube_url', 'linkedin_url', 'website_url', 'portfolio_url',
  'is_public', 'created_at',
].join(', ')

// Only these fields can be sent from the browser. The database also restricts them with column
// privileges and Row Level Security, so this list is a convenience, not the security boundary.
const EDITABLE_FIELDS = [
  'full_name',
  'username',
  'account_type',
  'organisation_name',
  'location',
  'city',
  'country',
  'bio',
  'skills',
  'interests',
  'equipment',
  'experience_level',
  'avatar_url',
  'instagram_url',
  'youtube_url',
  'linkedin_url',
  'website_url',
  'portfolio_url',
  'is_public',
  'onboarding_completed',
]

// Loads the signed-in member's own profile. Returns { profile: null } (no error) if the row does not exist.
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle()
  return { profile: data ?? null, error }
}

// Loads a profile by its public username. Row Level Security only returns it when the profile is
// public (or belongs to the person asking), so "private" and "does not exist" look the same from here.
export async function fetchProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq('username', String(username ?? '').trim().toLowerCase())
    .maybeSingle()
  return { profile: data ?? null, error }
}


// Returns only the public identity fields of a private profile.
export async function fetchPrivateProfileIdentity(username) {
  const { data, error } = await supabase.rpc('get_private_profile_identity', {
    p_username: String(username ?? '').trim().toLowerCase(),
  })

  if (error) return { identity: null, error }

  return {
    identity: data?.[0] ?? null,
    error: null,
  }
}

// Asks the database whether a username is free for this member to use. Works for private profiles
// too (the browser cannot see those directly), and only returns yes/no.
export async function isUsernameAvailable(username) {
  const { data, error } = await supabase.rpc('is_username_available', { p_username: username })
  if (error) return { available: null, error }
  return { available: data === true, error: null }
}

// Updates the signed-in user's own profile. Row Level Security makes any other row invisible,
// so a missing row comes back as "no data" rather than touching someone else's profile.
export async function updateProfile(userId, changes) {
  const safeChanges = Object.fromEntries(Object.entries(changes).filter(([key]) => EDITABLE_FIELDS.includes(key)))
  const { data, error } = await supabase
    .from('profiles')
    .update(safeChanges)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle()

  if (error) return { profile: null, error }
  if (!data) return { profile: null, error: { code: 'profile_not_found', message: 'Profile row not found.' } }
  return { profile: data, error: null }
}

function isNetworkError(error) {
  return /failed to fetch|networkerror|load failed/i.test(String(error?.message))
}

export function friendlyProfileError(error) {
  if (!error) return ''
  console.error('Profile error:', error)
  const message = String(error.message ?? '')

  if (error.code === 'profile_not_found') {
    return 'We could not find your profile. The database setup may be incomplete (see docs/supabase-setup.md).'
  }
  if (error.code === '23505') return 'That username is already taken. Please choose another one.'
  if (error.code === '23514') {
    if (/username_not_reserved/.test(message)) return 'That username is reserved. Please choose another one.'
    if (/avatar_url/.test(message)) return 'That profile picture link is not allowed. Please upload the picture again.'
    if (/_url_valid/.test(message)) return 'One of your links is not allowed. Check that each link starts with https://'
    return 'One of the values is not allowed. Please check your details and try again.'
  }
  if (error.code === '42501') return 'You are not allowed to make that change.'
  // A column the app expects is missing: the Phase 3 SQL migration has not been run yet.
  if (error.code === 'PGRST204' || error.code === '42703' || /could not find the .* column/i.test(message)) {
    return 'The database is missing the Phase 3 update. Run the new SQL migration (see docs/supabase-setup.md).'
  }
  if (isNetworkError(error)) return "We can't reach the server. Check your internet connection and try again."
  return 'We could not save your profile. Please try again.'
}
