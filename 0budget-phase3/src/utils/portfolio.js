import { normalizeUrl } from './urls'
import { LIMITS } from '../lib/profileOptions'

// The portfolio form keeps everything as text. These two helpers convert between the form and the
// database row, so the form component stays simple.

export const EMPTY_PORTFOLIO_FORM = {
  title: '',
  category: '',
  year: '',
  description: '',
  projectUrl: '',
  thumbnailUrl: '',
}

// Database row -> form fields (for editing an existing entry).
export function entryToFormValues(entry) {
  return {
    title: entry.title ?? '',
    category: entry.category ?? '',
    year: entry.project_year ? String(entry.project_year) : '',
    description: entry.description ?? '',
    projectUrl: entry.project_url ?? '',
    thumbnailUrl: entry.thumbnail_url ?? '',
  }
}

// Form fields -> database columns. Call this only after validatePortfolioEntry found no errors.
export function formValuesToEntry(values) {
  return {
    title: values.title.trim().replace(/\s+/g, ' '),
    category: values.category,
    project_year: Number(values.year),
    description: values.description.trim() || null,
    project_url: normalizeUrl(values.projectUrl, { maxLength: LIMITS.portfolioUrl }).value,
    thumbnail_url: normalizeUrl(values.thumbnailUrl, { maxLength: LIMITS.portfolioUrl }).value,
  }
}
