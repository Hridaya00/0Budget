import { supabase } from '../lib/supabase'
import { LIMITS } from '../lib/profileOptions'

// Re-exported so pages only need to import from this one file.
export { AVATAR_INPUT_TYPES, avatarPathFromUrl, validateAvatarFile } from '../utils/avatarFiles'

// Profile pictures live in the public "avatars" Storage bucket, in a folder named after the member's id:
//   avatars/<member id>/avatar-<time>.jpg
// The bucket policies (Phase 3 migration) let a member write only inside their own folder.

const BUCKET = 'avatars'

// Opens the picture, crops it to a centred square and shrinks it to 512 x 512 as a JPEG.
// Why: phone photos are huge; a small square keeps pages fast and storage small. It also proves the
// file really is an image (a renamed text file fails to open here).
// Returns { blob } or { error } with a friendly message.
export async function prepareAvatar(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return { error: 'We could not read that picture. Try a different file.' }
  }
  try {
    if (bitmap.width > LIMITS.avatarMaxDimension || bitmap.height > LIMITS.avatarMaxDimension) {
      return { error: 'That picture is too large in pixels. Choose a smaller one.' }
    }
    const side = Math.min(bitmap.width, bitmap.height)
    const sourceX = Math.floor((bitmap.width - side) / 2)
    const sourceY = Math.floor((bitmap.height - side) / 2)
    const size = LIMITS.avatarOutputSize

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    context.fillStyle = '#1C1C25' // transparent PNGs get the card colour instead of black
    context.fillRect(0, 0, size, size)
    context.drawImage(bitmap, sourceX, sourceY, side, side, 0, 0, size, size)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
    if (!blob) return { error: 'We could not process that picture. Try a different file.' }
    return { blob }
  } finally {
    bitmap.close?.()
  }
}

// Uploads a prepared picture into the member's own folder. Returns { url, path } or { error }.
export async function uploadAvatar(userId, blob) {
  // A new file name every time (instead of overwriting) means browsers and CDNs never show an old picture.
  const path = `${userId}/avatar-${Date.now()}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) return { error }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

// Best effort: a leftover old file is harmless, so callers log failures instead of showing them.
export async function deleteAvatarFile(path) {
  if (!path) return { error: null }
  return supabase.storage.from(BUCKET).remove([path])
}

export function friendlyAvatarError(error) {
  if (!error) return ''
  console.error('Avatar error:', error)
  const message = String(error.message ?? '')
  if (/too large|payload|size/i.test(message) || error.statusCode === '413') return 'That picture is too large. Choose a smaller one.'
  if (/mime|type/i.test(message)) return 'That kind of file is not allowed. Use a JPG, PNG or WebP picture.'
  if (/bucket not found/i.test(message)) return 'The picture storage is not set up yet. Run the Phase 3 SQL migration (see docs/supabase-setup.md).'
  if (/row-level security|unauthorized|not authorized|403/i.test(message) || error.statusCode === '403') {
    return 'You are not allowed to upload that picture. Please log in again and try once more.'
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "We can't reach the server. Check your internet connection and try again."
  }
  return 'We could not upload your picture. Please try again.'
}
