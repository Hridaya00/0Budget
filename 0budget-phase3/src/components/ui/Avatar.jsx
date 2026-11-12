import { useState } from 'react'
import { getInitials } from '../../utils/profile'
import { isSafeHttpsUrl } from '../../utils/urls'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-24 w-24 text-2xl',
  xl: 'h-32 w-32 text-4xl sm:h-40 sm:w-40 sm:text-5xl',
}

// A round profile picture. This is also the "default avatar": when there is no picture (or it fails
// to load) the person's initials are shown on a dark gold-tinted circle.
export default function Avatar({ src, name, size = 'md', className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = isSafeHttpsUrl(src) && failedSrc !== src

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-gradient-to-br from-surface to-card font-bold text-accent-soft ${sizes[size]} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `Profile picture of ${name}` : 'Profile picture'}
          onError={() => setFailedSrc(src)}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <span role="img" aria-label={name ? `${name} (no profile picture)` : 'No profile picture'}>
          {getInitials(name)}
        </span>
      )}
    </span>
  )
}
