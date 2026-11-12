import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import Alert from '../ui/Alert'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import {
  AVATAR_INPUT_TYPES,
  avatarPathFromUrl,
  deleteAvatarFile,
  friendlyAvatarError,
  prepareAvatar,
  uploadAvatar,
  validateAvatarFile,
} from '../../services/avatars'
import { friendlyProfileError } from '../../services/profiles'

// Choose, crop, upload and remove the profile picture.
// A picture is saved the moment it uploads (it does not wait for the "Save profile" button).
export default function AvatarUploader({ profile, name }) {
  const { saveProfile } = useAuth()
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState({ tone: '', text: '' })

  async function handleFile(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be chosen again later
    if (!file) return
    setMessage({ tone: '', text: '' })

    const problem = validateAvatarFile(file)
    if (problem) {
      setMessage({ tone: 'error', text: problem })
      return
    }

    setBusy(true)
    try {
      const prepared = await prepareAvatar(file)
      if (prepared.error) {
        setMessage({ tone: 'error', text: prepared.error })
        return
      }
      const uploaded = await uploadAvatar(profile.id, prepared.blob)
      if (uploaded.error) {
        setMessage({ tone: 'error', text: friendlyAvatarError(uploaded.error) })
        return
      }
      const oldPath = avatarPathFromUrl(profile.avatar_url, profile.id)
      const { error } = await saveProfile({ avatar_url: uploaded.url })
      if (error) {
        await deleteAvatarFile(uploaded.path).catch(() => {}) // do not leave an unused file behind
        setMessage({ tone: 'error', text: friendlyProfileError(error) })
        return
      }
      if (oldPath) deleteAvatarFile(oldPath).catch(() => {})
      setMessage({ tone: 'success', text: 'Profile picture updated.' })
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    setMessage({ tone: '', text: '' })
    setBusy(true)
    const oldPath = avatarPathFromUrl(profile.avatar_url, profile.id)
    const { error } = await saveProfile({ avatar_url: null })
    setBusy(false)
    if (error) {
      setMessage({ tone: 'error', text: friendlyProfileError(error) })
      return
    }
    if (oldPath) deleteAvatarFile(oldPath).catch(() => {})
    setMessage({ tone: 'success', text: 'Profile picture removed.' })
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <Avatar src={profile.avatar_url} name={name} size="lg" />
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button type="button" variant="secondary" size="sm" loading={busy} onClick={() => inputRef.current?.click()}>
              {!busy && <ImagePlus size={16} aria-hidden="true" />}
              {busy ? 'Working...' : profile.avatar_url ? 'Replace picture' : 'Upload picture'}
            </Button>
            {profile.avatar_url && (
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={handleRemove}>
                <Trash2 size={16} aria-hidden="true" />
                Remove
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">JPG, PNG or WebP, up to 5 MB. We crop it to a square.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_INPUT_TYPES.join(',')}
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a profile picture"
          data-testid="avatar-input"
        />
      </div>
      {message.text && (
        <Alert tone={message.tone} className="mt-4">
          {message.text}
        </Alert>
      )}
    </div>
  )
}
