import { supabase } from '../lib/supabase'

const PROFILE_COLUMNS =
  'id, full_name, username, account_type, organisation_name, location, bio, skills, interests, avatar_url, onboarding_completed, created_at, updated_at'

// Only these fields can be sent from the browser. The database also restricts them with column
// privileges and Row Level Security, so this list is a convenience, not the security boundary.
const EDITABLE_FIELDS = [
  'full_name',
  'account_type',
  'organisation_name',
  'location',
  'bio',
  'skills',
  'interests',
  'onboarding_completed',
]

// Loads one profile. Returns { profile: null } (no error) if the row does not exist.
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle()
  return { profile: data ?? null, error }
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

export function friendlyProfileError(error) {
  if (!error) return ''
  console.error('Profile error:', error)
  if (error.code === 'profile_not_found') {
    return 'We could not find your profile. The database setup may be incomplete (see docs/supabase-setup.md).'
  }
  if (error.code === '23514') return 'One of the values is not allowed. Please check your details and try again.'
  if (error.code === '42501') return 'You are not allowed to make that change.'
  if (/failed to fetch|networkerror|load failed/i.test(String(error.message))) {
    return "We can't reach the server. Check your internet connection and try again."
  }
  return 'We could not save your profile. Please try again.'
}
