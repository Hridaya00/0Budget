import { useState } from 'react'
import { Clapperboard, Pencil, Plus, Trash2 } from 'lucide-react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { Spinner } from '../ui/Spinner'
import PortfolioCard from './PortfolioCard'
import PortfolioForm from './PortfolioForm'
import { LIMITS } from '../../lib/profileOptions'
import {
  createPortfolioEntry,
  deletePortfolioEntry,
  friendlyPortfolioError,
  updatePortfolioEntry,
} from '../../services/portfolio'
import { entryToFormValues } from '../../utils/portfolio'

// Newest year first, then newest entry first (same order the public page uses).
const sortEntries = (list) =>
  [...list].sort((a, b) => b.project_year - a.project_year || String(b.created_at).localeCompare(String(a.created_at)))

// The owner's portfolio list with add / edit / delete.
//   entries   the loaded entries      status  'loading' | 'ready' | 'error'
//   onChange  called with the new list after every successful change
export default function PortfolioManager({ profileId, entries, status, onChange, onRetry }) {
  const [mode, setMode] = useState(null) // null | 'new' | an entry id (editing)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [notice, setNotice] = useState({ tone: '', text: '' })

  const atLimit = entries.length >= LIMITS.portfolioMaxEntries

  function openForm(next) {
    setMode(next)
    setFormError('')
    setNotice({ tone: '', text: '' })
    setConfirmingId(null)
  }

  async function handleCreate(values) {
    setSaving(true)
    setFormError('')
    const { entry, error } = await createPortfolioEntry(profileId, values)
    setSaving(false)
    if (error) {
      setFormError(friendlyPortfolioError(error))
      return
    }
    onChange(sortEntries([...entries, entry]))
    setMode(null)
    setNotice({ tone: 'success', text: `"${entry.title}" was added to your portfolio.` })
  }

  async function handleUpdate(entryId, values) {
    setSaving(true)
    setFormError('')
    const { entry, error } = await updatePortfolioEntry(entryId, values)
    setSaving(false)
    if (error) {
      setFormError(friendlyPortfolioError(error))
      return
    }
    onChange(sortEntries(entries.map((item) => (item.id === entryId ? entry : item))))
    setMode(null)
    setNotice({ tone: 'success', text: `"${entry.title}" was updated.` })
  }

  async function handleDelete(entry) {
    setDeletingId(entry.id)
    setNotice({ tone: '', text: '' })
    const { error } = await deletePortfolioEntry(entry.id)
    setDeletingId(null)
    setConfirmingId(null)
    if (error) {
      setNotice({ tone: 'error', text: friendlyPortfolioError(error) })
      // "Not found" means it is already gone, so drop it from the list too.
      if (error.code === 'entry_not_found') onChange(entries.filter((item) => item.id !== entry.id))
      return
    }
    onChange(entries.filter((item) => item.id !== entry.id))
    setNotice({ tone: 'success', text: `"${entry.title}" was deleted.` })
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 text-sm text-muted" role="status">
        <Spinner className="text-accent" />
        Loading your portfolio...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert tone="error" title="We could not load your portfolio">
        <p>Please check your connection and try again.</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      </Alert>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {entries.length} of {LIMITS.portfolioMaxEntries} entries
        </p>
        {mode !== 'new' && (
          <Button type="button" size="sm" onClick={() => openForm('new')} disabled={atLimit}>
            <Plus size={16} aria-hidden="true" />
            Add portfolio entry
          </Button>
        )}
      </div>

      {atLimit && mode !== 'new' && (
        <Alert tone="info" className="mt-4">
          You have reached the limit of {LIMITS.portfolioMaxEntries} entries. Delete one to add another.
        </Alert>
      )}
      {notice.text && (
        <Alert tone={notice.tone} className="mt-4">
          {notice.text}
        </Alert>
      )}

      {mode === 'new' && (
        <div className="mt-5">
          <PortfolioForm
            idPrefix="pf-new"
            submitLabel="Add entry"
            saving={saving}
            error={formError}
            onSubmit={handleCreate}
            onCancel={() => openForm(null)}
          />
        </div>
      )}

      {entries.length === 0 && mode !== 'new' ? (
        <div className="mt-5">
          <EmptyState
            icon={Clapperboard}
            title="No portfolio entries yet"
            description="Add the films, videos or photo projects you are proud of. Use links to where they already live (YouTube, Vimeo, your website)."
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-5 md:grid-cols-2">
          {entries.map((entry) => (
            <li key={entry.id} className={mode === entry.id ? 'md:col-span-2' : ''}>
              {mode === entry.id ? (
                <PortfolioForm
                  idPrefix={`pf-${entry.id}`}
                  initial={entryToFormValues(entry)}
                  submitLabel="Save changes"
                  saving={saving}
                  error={formError}
                  onSubmit={(values) => handleUpdate(entry.id, values)}
                  onCancel={() => openForm(null)}
                />
              ) : (
                <PortfolioCard
                  entry={entry}
                  actions={
                    confirmingId === entry.id ? (
                      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Confirm deleting ${entry.title}`}>
                        <span className="text-sm text-muted">Delete this entry?</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="border-danger/60 text-red-200 hover:border-danger hover:text-red-100"
                          loading={deletingId === entry.id}
                          onClick={() => handleDelete(entry)}
                        >
                          Yes, delete
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingId(null)} disabled={deletingId === entry.id}>
                          Keep
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => openForm(entry.id)} aria-label={`Edit ${entry.title}`}>
                          <Pencil size={15} aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNotice({ tone: '', text: '' })
                            setConfirmingId(entry.id)
                          }}
                          aria-label={`Delete ${entry.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    )
                  }
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
