import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import ConfigNotice from '../components/auth/ConfigNotice'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { PasswordField } from '../components/ui/Field'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { readAuthErrorFromUrl } from '../utils/authErrors'
import { validateConfirmPassword, validatePassword } from '../utils/validation'

// The link in the reset email brings the person here. Supabase signs them in with a short-lived
// "recovery" session, which lets us call updatePassword. Without that session the form is hidden.
export default function ResetPassword() {
  const { session, loading, updatePassword } = useAuth()
  const [urlError] = useState(() => readAuthErrorFromUrl())
  const [values, setValues] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const invalidLink = (
    <AuthShell title="Reset link problem">
      <Alert tone="error">
        {urlError || 'This reset link is invalid or has expired.'} Please request a new one.
      </Alert>
      <div className="mt-6">
        <Button to="/forgot-password" className="w-full">
          Request a new link
        </Button>
      </div>
    </AuthShell>
  )

  if (urlError) return invalidLink
  if (loading) return <PageLoader />
  if (!session) return invalidLink

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    const newErrors = {
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
    }
    setErrors(newErrors)
    if (newErrors.password || newErrors.confirmPassword) {
      document.getElementById(newErrors.password ? 'password' : 'confirmPassword')?.focus()
      return
    }

    setSubmitting(true)
    const result = await updatePassword(values.password)
    setSubmitting(false)
    if (result.error) setFormError(result.error)
    else setDone(true)
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <Alert tone="success" title="All set">
          Your password has been changed. You are logged in.
        </Alert>
        <div className="mt-6">
          <Button to="/dashboard" className="w-full">
            Go to your dashboard
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something you have not used before."
      footer={
        <Link to="/login" className="font-medium text-accent-soft hover:underline">
          Back to log in
        </Link>
      }
    >
      <ConfigNotice />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <PasswordField
          id="password"
          label="New password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          value={values.password}
          onChange={(event) => {
            setValues((current) => ({ ...current, password: event.target.value }))
            setErrors((current) => ({ ...current, password: '' }))
          }}
          error={errors.password}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => {
            setValues((current) => ({ ...current, confirmPassword: event.target.value }))
            setErrors((current) => ({ ...current, confirmPassword: '' }))
          }}
          error={errors.confirmPassword}
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Saving...' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  )
}
