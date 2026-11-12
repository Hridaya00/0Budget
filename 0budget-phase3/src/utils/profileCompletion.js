import { formatLocation } from './profile'

// Works out how complete a profile is, from real saved data (nothing is hard-coded).
//
// Seven things count, each worth the same. Name and account type are not counted because every
// account already has them from sign-up.
//
//   portfolioCount = number of portfolio entries, or null while it is still loading.
//   Returns { percent, done, total, items }. "percent" is null while the portfolio count is unknown.
//   "section" says which part of the Edit Profile page fixes the item.
export function calculateProfileCompletion(profile, portfolioCount) {
  const has = (value) => Boolean(String(value ?? '').trim())
  const items = [
    { key: 'avatar', label: 'Add a profile picture', section: 'photo', done: has(profile?.avatar_url) },
    { key: 'bio', label: 'Write a short biography', section: 'basics', done: has(profile?.bio) },
    { key: 'username', label: 'Choose a username', section: 'basics', done: has(profile?.username) },
    { key: 'location', label: 'Add your location', section: 'basics', done: has(formatLocation(profile)) },
    { key: 'skills', label: 'Add your skills', section: 'professional', done: (profile?.skills?.length ?? 0) > 0 },
    { key: 'experience', label: 'Choose your experience level', section: 'professional', done: has(profile?.experience_level) },
    { key: 'portfolio', label: 'Add a portfolio entry', section: 'portfolio', done: (portfolioCount ?? 0) > 0 },
  ]
  const done = items.filter((item) => item.done).length
  const percent = portfolioCount === null || portfolioCount === undefined ? null : Math.round((done / items.length) * 100)
  return { percent, done, total: items.length, items }
}
