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

// "leading" puts a small fixed piece of text inside the box before what the person types (e.g. "@").
export function TextField({ id, label, optional, hint, error, leading, ...inputProps }) {
  const input = (
    <input
      id={id}
      name={id}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy(id, error, hint)}
      className={`${controlClasses} ${borderFor(error)} ${leading ? 'pl-9' : ''}`}
      {...inputProps}
    />
  )
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      {leading ? (
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-muted">
            {leading}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
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

// An on/off switch with a label and an explanation (used for the public / private profile setting).
export function ToggleField({ id, label, description, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-line bg-ink p-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="mt-1 text-xs leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? 'border-accent bg-accent' : 'border-line bg-card'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform ${
            checked ? 'translate-x-5 bg-ink' : 'translate-x-0 bg-muted'
          }`}
        />
      </button>
    </div>
  )
}
