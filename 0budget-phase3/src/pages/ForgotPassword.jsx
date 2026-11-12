import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import ConfigNotice from '../components/auth/ConfigNotice'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../utils/validation'

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const message = validateEmail(email)
    setError(message)
    if (message) {
      document.getElementById('email')?.focus()
      return
    }

    setSubmitting(true)
    const result = await sendPasswordReset(email)
    setSubmitting(false)
    if (result.error) setFormError(result.error)
    else setSentTo(email.trim())
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send you a link to choose a new password."
      footer={
        <Link to="/login" className="font-medium text-accent-soft hover:underline">
          Back to log in
        </Link>
      }
    >
      <ConfigNotice />
      {sentTo ? (
        // The message is the same whether or not an account exists, so nobody can use this form to
        // find out which emails are registered.
        <Alert tone="success" title="Check your email">
          If an account exists for <strong className="text-fg">{sentTo}</strong>, we have sent a link to reset the
          password. It can take a minute to arrive, so check your spam folder too.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {formError && <Alert tone="error">{formError}</Alert>}
          <TextField
            id="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError('')
            }}
            error={error}
          />
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            {submitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
