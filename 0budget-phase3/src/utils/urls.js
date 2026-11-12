import { LIMITS } from '../lib/profileOptions'

// Link helpers. Every link a member types is cleaned and checked here before it is saved, and the
// database checks it again (see is_https_url() in the Phase 3 migration). Both must agree: anything this
// file accepts, the database must accept too, otherwise a save would fail for no visible reason.

const HOST_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/
const TLD_PATTERN = /\.(?:[a-z]{2,}|xn--[a-z0-9-]+)$/
const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/
const INSTAGRAM_HANDLE = /^@?[A-Za-z0-9._]{1,30}$/
const YOUTUBE_HANDLE = /^@[A-Za-z0-9._-]{3,30}$/

// Which websites each social box accepts.
export const socialHosts = {
  instagram_url: { siteName: 'Instagram', hosts: ['instagram.com'] },
  youtube_url: { siteName: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
  linkedin_url: { siteName: 'LinkedIn', hosts: ['linkedin.com'] },
}

const fail = (error) => ({ value: null, error })

function hostMatches(hostname, hosts) {
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
}

// Turns what a person typed into a clean https link.
// Returns { value, error }: "value" is the cleaned link (or null when the box is empty),
// "error" is a friendly message (or an empty string).
export function normalizeUrl(raw, { maxLength = LIMITS.socialUrl, hosts = null, siteName = '' } = {}) {
  const text = String(raw ?? '').trim()
  if (!text) return { value: null, error: '' }
  if (/\s/.test(text)) return fail('Links cannot contain spaces.')

  let candidate = text
  if (/^https:\/\//i.test(text)) {
    candidate = text
  } else if (/^http:\/\//i.test(text)) {
    return fail('Use a secure link that starts with https://')
  } else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text) || /^(javascript|data|vbscript|file|mailto|tel|blob|about):/i.test(text)) {
    return fail('Links must start with https://')
  } else {
    candidate = `https://${text}` // "yourname.com" is fine, we add the https:// for you
  }

  let url
  try {
    url = new URL(candidate)
  } catch {
    return fail('That does not look like a valid link.')
  }
  if (url.protocol !== 'https:') return fail('Links must start with https://')
  if (url.username || url.password) return fail('Links cannot contain a username or password.')

  const host = url.hostname // already lower-case, and international names are converted to ASCII
  if (!HOST_PATTERN.test(host) || !TLD_PATTERN.test(host) || IPV4_PATTERN.test(host)) {
    return fail('That does not look like a valid link.')
  }
  if (hosts && !hostMatches(host, hosts)) {
    return fail(`Enter a link to your ${siteName} page (it should start with ${hosts[0]}).`)
  }
  // The database only accepts port-less links for Instagram, YouTube and LinkedIn.
  if (hosts && url.port) return fail(`Enter your ${siteName} link without a port number.`)

  const value = url.href
  if (value.length > maxLength) return fail(`That link is too long (maximum ${maxLength} characters).`)
  return { value, error: '' }
}

// Like normalizeUrl, for one of the five social boxes ("instagram_url", "youtube_url", ...).
// Also accepts "@yourname" for Instagram and "@yourchannel" for YouTube.
export function normalizeSocial(key, raw) {
  const text = String(raw ?? '').trim()
  const rule = socialHosts[key]
  let input = text
  if (key === 'instagram_url' && INSTAGRAM_HANDLE.test(text) && !/instagram\.com/i.test(text)) {
    input = `https://www.instagram.com/${text.replace(/^@/, '')}`
  } else if (key === 'youtube_url' && YOUTUBE_HANDLE.test(text)) {
    input = `https://www.youtube.com/${text}`
  }
  return normalizeUrl(input, { maxLength: LIMITS.socialUrl, hosts: rule?.hosts ?? null, siteName: rule?.siteName ?? '' })
}

// "https://www.instagram.com/alice/" -> "instagram.com/alice" (for showing a link as text)
export function displayUrl(url) {
  return String(url ?? '')
    .replace(/^https:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
}

// A last safety net used when SHOWING saved links: only real https links become clickable.
export function isSafeHttpsUrl(url) {
  return typeof url === 'string' && /^https:\/\/[^\s]+$/i.test(url)
}
