import { LIMITS } from '../lib/profileOptions'

// Pure helpers for profile-picture files (no network, no browser APIs), kept apart from
// services/avatars.js so they are easy to test.

export const AVATAR_INPUT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const PUBLIC_PATH_MARKER = '/storage/v1/object/public/avatars/'

// Quick checks on the file the person picked, before we touch it.
export function validateAvatarFile(file) {
  if (!file) return 'Choose an image.'
  if (!AVATAR_INPUT_TYPES.includes(file.type)) return 'Use a JPG, PNG or WebP picture.'
  if (file.size > LIMITS.avatarMaxInputBytes) {
    return `That picture is too large. Choose one under ${Math.round(LIMITS.avatarMaxInputBytes / (1024 * 1024))} MB.`
  }
  return ''
}

// "https://xyz.supabase.co/storage/v1/object/public/avatars/<id>/avatar-1.jpg" -> "<id>/avatar-1.jpg".
// Returns null unless the file is in THIS member's own folder, so we can never try to delete anything else.
export function avatarPathFromUrl(url, userId) {
  const text = String(url ?? '')
  const index = text.indexOf(PUBLIC_PATH_MARKER)
  if (index === -1) return null
  let path = text.slice(index + PUBLIC_PATH_MARKER.length).split(/[?#]/)[0]
  try {
    path = decodeURIComponent(path)
  } catch {
    return null
  }
  return path.startsWith(`${userId}/`) && !path.includes('..') ? path : null
}
