import { useState } from 'react'
import { ExternalLink, Film } from 'lucide-react'
import Badge from '../ui/Badge'
import { getCategoryLabel } from '../../lib/profileOptions'
import { displayUrl, isSafeHttpsUrl } from '../../utils/urls'

// One portfolio entry, shown as a film-poster style card. "actions" is optional extra content
// (Edit / Delete buttons) that only the owner's page passes in.
export default function PortfolioCard({ entry, actions }) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const showThumb = isSafeHttpsUrl(entry.thumbnail_url) && !thumbFailed
  const hasLink = isSafeHttpsUrl(entry.project_url)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-accent/50">
      <div className="relative aspect-video bg-gradient-to-br from-surface to-ink">
        {showThumb ? (
          <img
            src={entry.thumbnail_url}
            alt={`Thumbnail for ${entry.title}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setThumbFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-accent/40" aria-hidden="true">
            <Film size={40} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="gold">{getCategoryLabel(entry.category)}</Badge>
          <span className="text-xs font-medium text-muted">{entry.project_year}</span>
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-fg">{entry.title}</h3>
        {entry.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{entry.description}</p>
        )}

        {hasLink && (
          <a
            href={entry.project_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-4 inline-flex max-w-full items-center gap-1.5 self-start text-sm font-medium text-accent-soft hover:underline"
          >
            <ExternalLink size={15} aria-hidden="true" className="shrink-0" />
            <span className="truncate">View project: {displayUrl(entry.project_url)}</span>
          </a>
        )}

        {actions && <div className="mt-auto pt-5">{actions}</div>}
      </div>
    </article>
  )
}
