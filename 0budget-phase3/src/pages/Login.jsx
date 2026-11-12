import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import ConfigNotice from '../components/auth/ConfigNotice'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { PasswordField, TextField } from '../components/ui/Field'
import { useAuth } from '../hooks/useAuth'
import { focusFirstError, hasErrors, validateEmail, validateLoginPassword } from '../utils/validation'

const FIELD_ORDER = ['email', 'password']

function validateField(name, values) {
  return name === 'email' ? validateEmail(values.email) : validateLoginPassword(values.password)
}

// This page is wrapped in <GuestRoute>, which sends people who are already logged in to the
// dashboard (or back to the page they were trying to open). So after a successful login there is
// nothing more to do here: the redirect happens by itself once Supabase reports the new session.
export default function Login() {
  const { signIn, resendConfirmation } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  const [resending, setResending] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function updateValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    setNeedsConfirmation(false)
    setResendMessage(null)

    const newErrors = Object.fromEntries(FIELD_ORDER.map((name) => [name, validateField(name, values)]))
    setErrors(newErrors)
    if (hasErrors(newErrors)) {
      focusFirstError(newErrors, FIELD_ORDER)
      return
    }

    setSubmitting(true)
    const result = await signIn(values)
    setSubmitting(false)
    if (result.error) {
      setFormError(result.error)
      setNeedsConfirmation(result.code === 'email_not_confirmed')
    }
  }

  async function handleResend() {
    setResendMessage(null)
    setResending(true)
    const { error } = await resendConfirmation(values.email)
    setResending(false)
    setResendMessage(error ? { tone: 'error', text: error } : { tone: 'success', text: 'We sent a new confirmation email.' })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to find your crew and manage your projects."
      footer={
        <>
          New to 0Budget?{' '}
          <Link to="/signup" className="font-medium text-accent-soft hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <ConfigNotice />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        {needsConfirmation && (
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={handleResend} loading={resending}>
              Resend confirmation email
            </Button>
            {resendMessage && (
              <Alert tone={resendMessage.tone} className="mt-3">
                {resendMessage.text}
              </Alert>
            )}
          </div>
        )}

        <TextField
          id="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateValue('email', event.target.value)}
          onBlur={() => setErrors((current) => ({ ...current, email: validateField('email', values) }))}
          error={errors.email}
        />
        <div>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => updateValue('password', event.target.value)}
            error={errors.password}
          />
          <p className="mt-2 text-right text-sm">
            <Link to="/forgot-password" className="text-accent-soft hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  )
}
