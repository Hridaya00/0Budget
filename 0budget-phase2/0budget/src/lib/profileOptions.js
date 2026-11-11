// Shared lists and limits for profiles. The values in "accountTypes" must match the
// CHECK constraint in supabase/migrations/20261111000100_create_profiles.sql.

export const accountTypes = [
  { value: 'filmmaker', label: 'Filmmaker' },
  { value: 'director', label: 'Director' },
  { value: 'screenwriter', label: 'Screenwriter' },
  { value: 'actor', label: 'Actor' },
  { value: 'cinematographer', label: 'Cinematographer' },
  { value: 'video_editor', label: 'Video Editor' },
  { value: 'musician', label: 'Musician' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'film_student', label: 'Film Student' },
  { value: 'production_company', label: 'Production Company' },
]

export const accountTypeValues = accountTypes.map((type) => type.value)

export function getAccountTypeLabel(value) {
  return accountTypes.find((type) => type.value === value)?.label ?? 'Member'
}

export const skillSuggestions = [
  'Directing',
  'Screenwriting',
  'Cinematography',
  'Video editing',
  'Sound design',
  'Acting',
  'Colour grading',
  'VFX',
  'Music composition',
  'Production design',
  'Photography',
  'Producing',
]

export const interestSuggestions = [
  'Short films',
  'Documentaries',
  'Music videos',
  'Web series',
  'Student films',
  'Experimental films',
  'Advertisements',
  'Photography projects',
]

// These limits are also enforced by the database.
export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  organisationMin: 2,
  organisationMax: 100,
  location: 100,
  bio: 500,
  listItems: 20,
  listItemLength: 40,
}
