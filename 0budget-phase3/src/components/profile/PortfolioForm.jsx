import { useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import { SelectField, TextAreaField, TextField } from '../ui/Field'
import { LIMITS, portfolioCategories } from '../../lib/profileOptions'
import { EMPTY_PORTFOLIO_FORM, formValuesToEntry } from '../../utils/portfolio'
import { hasErrors, validatePortfolioEntry } from '../../utils/validation'

const FIELD_ORDER = ['title', 'category', 'year', 'description', 'projectUrl', 'thumbnailUrl']

// Add / edit form for one portfolio entry.
//   idPrefix  makes the field ids unique when several forms could exist
//   initial   starting values (see utils/portfolio.js)
//   onSubmit  gets the cleaned database values; it returns nothing, the parent shows saving/errors
export default function PortfolioForm({ idPrefix, initial = EMPTY_PORTFOLIO_FORM, submitLabel, saving, error, onSubmit, onCancel }) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const id = (name) => `${idPrefix}-${name}`

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = validatePortfolioEntry(values)
    // Errors are stored by field name; the ids on the page carry the prefix, so focus manually.
    setErrors(found)
    if (hasErrors(found)) {
      const first = FIELD_ORDER.find((name) => found[name])
      document.getElementById(id(first))?.focus()
      return
    }
    onSubmit(formValuesToEntry(values))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-2xl border border-accent/40 bg-surface p-5 sm:p-6" aria-label={submitLabel}>
      {error && <Alert tone="error">{error}</Alert>}

      <TextField
        id={id('title')}
        label="Project title"
        maxLength={LIMITS.portfolioTitleMax}
        value={values.title}
        onChange={(event) => update('title', event.target.value)}
        error={errors.title}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id={id('category')}
          label="Category"
          placeholder="Choose a category"
          options={portfolioCategories}
          value={values.category}
          onChange={(event) => update('category', event.target.value)}
          error={errors.category}
        />
        <TextField
          id={id('year')}
          label="Year"
          inputMode="numeric"
          maxLength={4}
          placeholder="e.g. 2026"
          value={values.year}
          onChange={(event) => update('year', event.target.value.replace(/\D/g, ''))}
          error={errors.year}
        />
      </div>
      <TextAreaField
        id={id('description')}
        label="Description"
        optional
        placeholder="What was the project, and what was your role?"
        maxLength={LIMITS.portfolioDescription}
        value={values.description}
        onChange={(event) => update('description', event.target.value)}
        error={errors.description}
      />
      <TextField
        id={id('projectUrl')}
        label="Project link"
        optional
        type="url"
        inputMode="url"
        placeholder="https://youtube.com/watch?v=..."
        hint="A YouTube, Vimeo, Drive or website link. We do not host videos."
        value={values.projectUrl}
        onChange={(event) => update('projectUrl', event.target.value)}
        error={errors.projectUrl}
      />
      <TextField
        id={id('thumbnailUrl')}
        label="Thumbnail image link"
        optional
        type="url"
        inputMode="url"
        placeholder="https://example.com/poster.jpg"
        hint="A direct link to an image. Leave empty to show a film icon."
        value={values.thumbnailUrl}
        onChange={(event) => update('thumbnailUrl', event.target.value)}
        error={errors.thumbnailUrl}
      />

      <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
        <Button type="submit" loading={saving} disabled={saving} className="sm:min-w-40">
          {saving ? 'Saving...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
