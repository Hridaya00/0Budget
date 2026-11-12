import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import ConfigNotice from '../components/auth/ConfigNotice'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { PasswordField, SelectField, TextField } from '../components/ui/Field'
import { PageLoader } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { accountTypes } from '../lib/profileOptions'
import {
  focusFirstError,
  hasErrors,
  validateAccountType,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateOrganisationName,
  validatePassword,
} from '../utils/validation'

const FIELD_ORDER = ['fullName', 'email', 'accountType', 'organisationName', 'password', 'confirmPassword']

const EMPTY_VALUES = {
  fullName: '',
  email: '',
  accountType: '',
  organisationName: '',
  password: '',
  confirmPassword: '',
}

function validateField(name, values) {
  switch (name) {
    case 'fullName':
      return validateFullName(values.fullName)
    case 'email':
      return validateEmail(values.email)
    case 'accountType':
      return validateAccountType(values.accountType)
    case 'organisationName':
      return validateOrganisationName(values.organisationName, values.accountType)
    case 'password':
      return validatePassword(values.password)
    case 'confirmPassword':
      return validateConfirmPassword(values.password, values.confirmPassword)
    default:
      return ''
  }
}

export default function Signup() {
  const { session, loading, signUp, resendConfirmation } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [resendMessage, setResendMessage] = useState(null)
  const [resending, setResending] = useState(false)
  // While we are signing someone up, Supabase logs them in the moment the account exists. This flag
  // stops the "already logged in" redirect below from beating our own redirect to onboarding.
  const signingUp = useRef(false)

  if (loading) return <PageLoader />
  if (session && !signingUp.current) return <Navigate to="/dashboard" replace />

  function updateValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({
      ...current,
      [name]: '',
      // changing the account type also resets the organisation message
      ...(name === 'accountType' ? { organisationName: '' } : {}),
    }))
  }

  function handleBlur(name) {
    setErrors((current) => ({ ...current, [name]: validateField(name, values) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const newErrors = Object.fromEntries(FIELD_ORDER.map((name) => [name, validateField(name, values)]))
    setErrors(newErrors)
    if (hasErrors(newErrors)) {
      focusFirstError(newErrors, FIELD_ORDER)
      return
    }

    signingUp.current = true
    setSubmitting(true)
    const result = await signUp(values)
    setSubmitting(false)

    if (result.error) {
      signingUp.current = false
      setFormError(result.error)
      return
    }
    if (result.needsConfirmation) {
      signingUp.current = false
      setConfirmationEmail(values.email.trim())
      return
    }
    // Email confirmation is switched off in Supabase: the user is already logged in.
    navigate('/onboarding', { replace: true })
  }

  async function handleResend() {
    setResendMessage(null)
    setResending(true)
    const { error } = await resendConfirmation(confirmationEmail)
    setResending(false)
    setResendMessage(error ? { tone: 'error', text: error } : { tone: 'success', text: 'We sent another email. It can take a minute to arrive.' })
  }

  if (confirmationEmail) {
    return (
      <AuthShell title="Check your email" subtitle="One more step before you can log in.">
        <Alert tone="success" title="Confirmation email sent">
          If this address can be used for a new account, we have sent a confirmation link to{' '}
          <strong className="text-fg">{confirmationEmail}</strong>. Open the link to activate your account.
        </Alert>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Nothing in your inbox? Check your spam folder. Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-soft hover:underline">
            Log in
          </Link>{' '}
          or{' '}
          <Link to="/forgot-password" className="font-medium text-accent-soft hover:underline">
            reset your password
          </Link>
          .
        </p>
        {resendMessage && (
          <Alert tone={resendMessage.tone} className="mt-5">
            {resendMessage.text}
          </Alert>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" onClick={handleResend} loading={resending} className="flex-1">
            Resend email
          </Button>
          <Button variant="ghost" onClick={() => setConfirmationEmail('')} className="flex-1">
            Use a different email
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      wide
      title="Join 0Budget"
      subtitle="Create your free account and start finding your crew."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-soft hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <ConfigNotice />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          id="fullName"
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={(event) => updateValue('fullName', event.target.value)}
          onBlur={() => handleBlur('fullName')}
          error={errors.fullName}
        />
        <TextField
          id="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateValue('email', event.target.value)}
          onBlur={() => handleBlur('email')}
          error={errors.email}
        />
        <SelectField
          id="accountType"
          label="I am joining as"
          placeholder="Choose your account type"
          options={accountTypes}
          value={values.accountType}
          onChange={(event) => updateValue('accountType', event.target.value)}
          onBlur={() => handleBlur('accountType')}
          error={errors.accountType}
        />
        {values.accountType === 'production_company' && (
          <TextField
            id="organisationName"
            label="Organisation name"
            autoComplete="organization"
            value={values.organisationName}
            onChange={(event) => updateValue('organisationName', event.target.value)}
            onBlur={() => handleBlur('organisationName')}
            error={errors.organisationName}
          />
        )}
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          value={values.password}
          onChange={(event) => updateValue('password', event.target.value)}
          onBlur={() => handleBlur('password')}
          error={errors.password}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => updateValue('confirmPassword', event.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          error={errors.confirmPassword}
        />

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {submitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
