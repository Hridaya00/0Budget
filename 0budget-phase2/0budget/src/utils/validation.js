import { LIMITS, accountTypeValues } from '../lib/profileOptions'

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

// Cleans a list of tags: trims, collapses spaces, removes blanks and duplicates (ignoring case).
export function normalizeList(items) {
  const seen = new Set()
  const result = []
  for (const raw of items) {
    const item = raw.trim().replace(/\s+/g, ' ').slice(0, LIMITS.listItemLength)
    const key = item.toLowerCase()
    if (item && !seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result.slice(0, LIMITS.listItems)
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}

// Moves keyboard focus to the first field with an error so screen-reader and keyboard users notice it.
export function focusFirstError(errors, fieldOrder) {
  const firstInvalid = fieldOrder.find((field) => errors[field])
  if (firstInvalid) document.getElementById(firstInvalid)?.focus()
}
