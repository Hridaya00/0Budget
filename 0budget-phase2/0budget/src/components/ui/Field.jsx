import { useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'

// Reusable form controls. Each one needs a unique "id" so the label, error message and
// keyboard focus can all be connected to it (this is what makes forms accessible).

const controlClasses =
  'w-full rounded-lg border bg-ink px-4 py-3 text-sm text-fg placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60'

function borderFor(error) {
  return error ? 'border-danger' : 'border-line hover:border-muted/60'
}

function describedBy(id, error, hint) {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

export function FieldShell({ id, label, optional, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-fg">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextField({ id, label, optional, hint, error, ...inputProps }) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`${controlClasses} ${borderFor(error)}`}
        {...inputProps}
      />
    </FieldShell>
  )
}

export function PasswordField({ id, label, hint, error, ...inputProps }) {
  const [visible, setVisible] = useState(false)
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClasses} ${borderFor(error)} pr-12`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted transition-colors hover:text-fg"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </FieldShell>
  )
}

export function SelectField({ id, label, optional, hint, error, options, placeholder, ...selectProps }) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={`${controlClasses} ${borderFor(error)} cursor-pointer appearance-none pr-10 [color-scheme:dark]`}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldShell>
  )
}

export function TextAreaField({ id, label, optional, hint, error, maxLength, value, ...textareaProps }) {
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <textarea
        id={id}
        name={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`${controlClasses} ${borderFor(error)} min-h-28 resize-y`}
        {...textareaProps}
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-muted" aria-hidden="true">
          {value.length}/{maxLength}
        </p>
      )}
    </FieldShell>
  )
}
