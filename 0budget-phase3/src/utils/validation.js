import { LIMITS, RESERVED_USERNAMES, accountTypeValues, experienceLevelValues, portfolioCategoryValues } from '../lib/profileOptions'
import { normalizeSocial, normalizeUrl } from './urls'

// Every validator returns an error message, or an empty string when the value is fine.
// These checks give quick feedback in the browser. The database enforces the same rules again,
// because frontend checks alone can never be trusted.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Enter your email address.'
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return 'Enter a valid email address, like name@example.com.'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Create a password.'
  if (value.length < 8) return 'Use at least 8 characters.'
  // Passwords are hashed with bcrypt, which only reads the first 72 bytes.
  if (new TextEncoder().encode(value).length > 72) return 'Use 72 characters or fewer.'
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Include at least one letter and one number.'
  return ''
}

export function validateLoginPassword(value) {
  return value ? '' : 'Enter your password.'
}

export function validateConfirmPassword(password, confirmation) {
  if (!confirmation) return 'Re-enter your password.'
  if (password !== confirmation) return 'The passwords do not match.'
  return ''
}

export function validateFullName(value) {
  const name = value.trim()
  if (!name) return 'Enter your full name.'
  if (name.length < LIMITS.nameMin) return `Your name must be at least ${LIMITS.nameMin} characters.`
  if (name.length > LIMITS.nameMax) return `Your name must be ${LIMITS.nameMax} characters or fewer.`
  return ''
}

export function validateAccountType(value) {
  return accountTypeValues.includes(value) ? '' : 'Choose the account type that fits you best.'
}

export function validateOrganisationName(value, accountType) {
  if (accountType !== 'production_company') return ''
  const name = value.trim()
  if (!name) return 'Enter your organisation name.'
  if (name.length < LIMITS.organisationMin) return `The organisation name must be at least ${LIMITS.organisationMin} characters.`
  if (name.length > LIMITS.organisationMax) return `The organisation name must be ${LIMITS.organisationMax} characters or fewer.`
  return ''
}

export function validateLocation(value) {
  return value.trim().length > LIMITS.location ? `Location must be ${LIMITS.location} characters or fewer.` : ''
}

export function validateBio(value) {
  return value.trim().length > LIMITS.bio ? `Your bio must be ${LIMITS.bio} characters or fewer.` : ''
}

// ---- Phase 3: profile fields ----------------------------------------------------------------

// Usernames are lower-case letters, numbers and underscores. The form lower-cases what is typed,
// so this only has to check the rules.
export function validateUsername(value) {
  const name = String(value ?? '').trim()
  if (!name) return 'Choose a username. It becomes your public profile link.'
  if (name.length < LIMITS.usernameMin) return `Your username must be at least ${LIMITS.usernameMin} characters.`
  if (name.length > LIMITS.usernameMax) return `Your username must be ${LIMITS.usernameMax} characters or fewer.`
  if (!/^[a-z0-9_]+$/.test(name)) return 'Use only lowercase letters, numbers and underscores (no spaces).'
  if (RESERVED_USERNAMES.includes(name)) return 'That username is reserved. Please choose another.'
  return ''
}

export function validateCity(value) {
  return String(value ?? '').trim().length > LIMITS.city ? `City must be ${LIMITS.city} characters or fewer.` : ''
}

export function validateCountry(value) {
  return String(value ?? '').trim().length > LIMITS.country ? `Country must be ${LIMITS.country} characters or fewer.` : ''
}

export function validateExperienceLevel(value) {
  return !value || experienceLevelValues.includes(value) ? '' : 'Choose one of the experience levels.'
}

// One of the five social boxes. Returns an error message or ''.
export function validateSocial(key, value) {
  return normalizeSocial(key, value).error
}

// ---- Phase 3: portfolio entries -------------------------------------------------------------

export function currentYear() {
  return new Date().getFullYear()
}

// "values" are the raw form fields: title, category, year (text), description, projectUrl, thumbnailUrl.
// Returns an object with one message per invalid field (empty object = all fine).
export function validatePortfolioEntry(values) {
  const errors = {}

  const title = values.title.trim()
  if (!title) errors.title = 'Enter the project title.'
  else if (title.length < LIMITS.portfolioTitleMin) errors.title = `The title must be at least ${LIMITS.portfolioTitleMin} characters.`
  else if (title.length > LIMITS.portfolioTitleMax) errors.title = `The title must be ${LIMITS.portfolioTitleMax} characters or fewer.`

  if (!portfolioCategoryValues.includes(values.category)) errors.category = 'Choose a category.'

  const year = String(values.year ?? '').trim()
  const maxYear = currentYear() + 1
  if (!year) errors.year = 'Enter the year.'
  else if (!/^\d{4}$/.test(year) || Number(year) < LIMITS.portfolioMinYear || Number(year) > maxYear) {
    errors.year = `Enter a year between ${LIMITS.portfolioMinYear} and ${maxYear}.`
  }

  if (values.description.trim().length > LIMITS.portfolioDescription) {
    errors.description = `The description must be ${LIMITS.portfolioDescription} characters or fewer.`
  }

  const projectLink = normalizeUrl(values.projectUrl, { maxLength: LIMITS.portfolioUrl })
  if (projectLink.error) errors.projectUrl = projectLink.error
  const thumbnailLink = normalizeUrl(values.thumbnailUrl, { maxLength: LIMITS.portfolioUrl })
  if (thumbnailLink.error) errors.thumbnailUrl = thumbnailLink.error

  return errors
}

// ---- Shared helpers --------------------------------------------------------------------------

// Cleans a list of tags: trims, collapses spaces, removes blanks and duplicates (ignoring case).
// By default it keeps up to 20 items of 40 characters (skills, interests). Equipment allows 60 characters.
export function normalizeList(items, { maxItems = LIMITS.listItems, maxLength = LIMITS.listItemLength } = {}) {
  const seen = new Set()
  const result = []
  for (const raw of items) {
    const item = raw.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    const key = item.toLowerCase()
    if (item && !seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result.slice(0, maxItems)
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}

// Moves keyboard focus to the first field with an error so screen-reader and keyboard users notice it.
export function focusFirstError(errors, fieldOrder) {
  const firstInvalid = fieldOrder.find((field) => errors[field])
  if (firstInvalid) document.getElementById(firstInvalid)?.focus()
}
