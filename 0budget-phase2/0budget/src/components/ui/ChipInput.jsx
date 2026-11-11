import { useState } from 'react'
import { X } from 'lucide-react'
import { FieldShell } from './Field'

// A tag input: type a word and press Enter or comma to add it, or tap a suggestion.
// Used for skills and interests.
export default function ChipInput({ id, label, hint, optional, error, items, onChange, suggestions = [], max, maxLength }) {
  const [draft, setDraft] = useState('')

  const exists = (value) => items.some((item) => item.toLowerCase() === value.toLowerCase())

  function addItem(raw) {
    const cleaned = raw.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    setDraft('')
    if (!cleaned || exists(cleaned) || items.length >= max) return
    onChange([...items, cleaned])
  }

  function removeItem(value) {
    onChange(items.filter((item) => item !== value))
  }

  function toggleSuggestion(value) {
    if (exists(value)) onChange(items.filter((item) => item.toLowerCase() !== value.toLowerCase()))
    else if (items.length < max) onChange([...items, value])
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault() // Enter must add a tag, not submit the form
      addItem(draft)
    } else if (event.key === 'Backspace' && !draft && items.length > 0) {
      onChange(items.slice(0, -1))
    }
  }

  const atLimit = items.length >= max

  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <div
        className={`rounded-lg border bg-ink p-2.5 transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent ${
          error ? 'border-danger' : 'border-line'
        }`}
      >
        <ul className="flex flex-wrap gap-2" aria-label={`${label} you have added`}>
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 py-1 pl-3 pr-1.5 text-xs font-medium text-accent-soft"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                aria-label={`Remove ${item}`}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-accent/20"
              >
                <X size={12} aria-hidden="true" />
              </button>
            </li>
          ))}
          <li className="min-w-32 flex-1">
            <input
              id={id}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => addItem(draft)}
              disabled={atLimit}
              maxLength={maxLength}
              placeholder={atLimit ? `Limit of ${max} reached` : 'Type and press Enter'}
              aria-invalid={Boolean(error)}
              className="w-full bg-transparent px-1.5 py-1 text-sm text-fg placeholder:text-muted/60 focus:outline-none disabled:cursor-not-allowed"
            />
          </li>
        </ul>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`Suggested ${label.toLowerCase()}`}>
          {suggestions.map((suggestion) => {
            const selected = exists(suggestion)
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => toggleSuggestion(suggestion)}
                aria-pressed={selected}
                disabled={!selected && atLimit}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected
                    ? 'border-accent bg-accent text-ink'
                    : 'border-line text-muted hover:border-accent/60 hover:text-fg'
                }`}
              >
                {suggestion}
              </button>
            )
          })}
        </div>
      )}
    </FieldShell>
  )
}
