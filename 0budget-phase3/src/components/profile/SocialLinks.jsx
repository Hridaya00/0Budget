import { Briefcase, Camera, Globe, Link2, Video } from 'lucide-react'
import { socialPlatforms } from '../../lib/profileOptions'
import { displayUrl, isSafeHttpsUrl } from '../../utils/urls'

// The lucide icon set has no brand logos, so each site gets a generic icon plus its name in text.
const icons = {
  instagram_url: Camera,
  youtube_url: Video,
  linkedin_url: Briefcase,
  website_url: Globe,
  portfolio_url: Link2,
}

// A list of the social / website links a profile has filled in. Shows nothing when there are none.
export default function SocialLinks({ profile }) {
  const links = socialPlatforms.filter(({ key }) => isSafeHttpsUrl(profile[key]))
  if (links.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Links">
      {links.map(({ key, label }) => {
        const Icon = icons[key]
        return (
          <li key={key}>
            <a
              href={profile[key]}
              target="_blank"
              rel="noopener noreferrer nofollow me"
              title={displayUrl(profile[key])}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent-soft"
            >
              <Icon size={15} aria-hidden="true" className="text-accent" />
              {label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
