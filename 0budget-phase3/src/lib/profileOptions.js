// Shared lists and limits for profiles and portfolios.
// The values here must match the CHECK constraints in the SQL migrations:
//   supabase/migrations/20261111000100_create_profiles.sql   (Phase 2)
//   supabase/migrations/20261112000100_profiles_portfolio_storage.sql   (Phase 3)

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

export const experienceLevels = [
  { value: 'beginner', label: 'Beginner', hint: 'Just starting out, building first credits.' },
  { value: 'intermediate', label: 'Intermediate', hint: 'Several projects completed.' },
  { value: 'professional', label: 'Professional', hint: 'Established, regular work.' },
]

export const experienceLevelValues = experienceLevels.map((level) => level.value)

export function getExperienceLabel(value) {
  return experienceLevels.find((level) => level.value === value)?.label ?? ''
}

// Same category names the Projects pages will use in Phase 4.
export const portfolioCategories = [
  { value: 'short_film', label: 'Short film' },
  { value: 'feature_film', label: 'Feature film' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'music_video', label: 'Music video' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'web_series', label: 'Web series' },
  { value: 'student_film', label: 'Student film' },
  { value: 'experimental_film', label: 'Experimental film' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
]

export const portfolioCategoryValues = portfolioCategories.map((category) => category.value)

export function getCategoryLabel(value) {
  return portfolioCategories.find((category) => category.value === value)?.label ?? 'Other'
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

export const equipmentSuggestions = [
  'Camera',
  'Lenses',
  'Tripod',
  'Gimbal',
  'Lighting kit',
  'Microphone',
  'Audio recorder',
  'Drone',
  'Editing computer',
  'Green screen',
]

// The five link boxes on the Edit Profile page. "key" is the database column, "field" is the form field
// (its id on the page, so it must differ from the section ids such as "portfolio").
export const socialPlatforms = [
  { key: 'instagram_url', field: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourname  or  @yourname' },
  { key: 'youtube_url', field: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
  { key: 'linkedin_url', field: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
  { key: 'website_url', field: 'website', label: 'Personal website', placeholder: 'https://yourname.com' },
  { key: 'portfolio_url', field: 'portfolioSite', label: 'Other portfolio website', placeholder: 'https://vimeo.com/yourname' },
]

// Usernames that cannot be claimed (kept in sync with profiles_username_not_reserved in the database).
export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'mod', 'moderator', 'staff', 'support', 'help', 'official', 'system',
  'root', 'null', 'undefined', 'me', 'you', 'new', 'edit', 'settings', 'login', 'logout', 'signup',
  'register', 'api', 'www', 'mail', 'about', 'contact', 'terms', 'privacy', 'guidelines', 'creators',
  'projects', 'opportunities', 'companies', 'dashboard', 'profile', 'onboarding', 'team', 'security',
  'billing', '0budget', 'zerobudget',
]

// These limits are also enforced by the database.
export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  organisationMin: 2,
  organisationMax: 100,
  location: 100,
  city: 80,
  country: 80,
  bio: 500,
  usernameMin: 3,
  usernameMax: 30,
  listItems: 20,
  listItemLength: 40,
  equipmentItemLength: 60,
  socialUrl: 300,
  portfolioUrl: 500,
  portfolioTitleMin: 2,
  portfolioTitleMax: 120,
  portfolioDescription: 1000,
  portfolioMaxEntries: 30,
  portfolioMinYear: 1900,
  // Profile pictures (checked in the browser; the bucket enforces its own 2 MB / type limits too).
  avatarMaxInputBytes: 5 * 1024 * 1024,
  avatarMaxDimension: 12000,
  avatarOutputSize: 512,
}
