import { supabase } from '../lib/supabase'

const COLUMNS = 'id, profile_id, title, description, category, project_url, thumbnail_url, project_year, created_at, updated_at'

// The only fields the browser may send. profile_id is added by createPortfolioEntry and can never be
// changed afterwards (the database blocks that too).
const FIELDS = ['title', 'description', 'category', 'project_url', 'thumbnail_url', 'project_year']

const pick = (values) => Object.fromEntries(Object.entries(values).filter(([key]) => FIELDS.includes(key)))

// All entries of one profile, newest year first. Row Level Security decides whether the caller may
// see them (public profile, or their own).
export async function fetchPortfolio(profileId) {
  const { data, error } = await supabase
    .from('portfolio_entries')
    .select(COLUMNS)
    .eq('profile_id', profileId)
    .order('project_year', { ascending: false })
    .order('created_at', { ascending: false })
  return { entries: data ?? [], error }
}

// How many entries a profile has (used by the profile-completion bar).
export async function countPortfolio(profileId) {
  const { count, error } = await supabase
    .from('portfolio_entries')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
  return { count: count ?? 0, error }
}

export async function createPortfolioEntry(profileId, values) {
  const { data, error } = await supabase
    .from('portfolio_entries')
    .insert({ ...pick(values), profile_id: profileId })
    .select(COLUMNS)
    .single()
  return { entry: data ?? null, error }
}

export async function updatePortfolioEntry(entryId, values) {
  const { data, error } = await supabase
    .from('portfolio_entries')
    .update(pick(values))
    .eq('id', entryId)
    .select(COLUMNS)
    .maybeSingle()
  if (error) return { entry: null, error }
  if (!data) return { entry: null, error: { code: 'entry_not_found', message: 'Portfolio entry not found.' } }
  return { entry: data, error: null }
}

export async function deletePortfolioEntry(entryId) {
  const { data, error } = await supabase.from('portfolio_entries').delete().eq('id', entryId).select('id')
  if (error) return { error }
  // Row Level Security hides other people's rows, so "nothing deleted" means it was not ours (or is already gone).
  if (!data || data.length === 0) return { error: { code: 'entry_not_found', message: 'Portfolio entry not found.' } }
  return { error: null }
}

export function friendlyPortfolioError(error) {
  if (!error) return ''
  console.error('Portfolio error:', error)
  const message = String(error.message ?? '')

  if (error.code === 'entry_not_found') return 'That entry could not be found. It may have been deleted already.'
  if (error.code === '23514' && /at most 30 entries/i.test(message)) {
    return 'You have reached the limit of 30 portfolio entries. Delete one to add another.'
  }
  if (error.code === '23514') return 'One of the values is not allowed. Please check the entry and try again.'
  if (error.code === '42501') return 'You are not allowed to make that change.'
  if (error.code === '42P01' || error.code === 'PGRST205' || (/portfolio_entries/.test(message) && /not find|does not exist/i.test(message))) {
    return 'The portfolio table is missing. Run the Phase 3 SQL migration (see docs/supabase-setup.md).'
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "We can't reach the server. Check your internet connection and try again."
  }
  return 'Something went wrong. Please try again.'
}
