// Turns technical Supabase errors into short, friendly messages.
// We never show raw error text to visitors, and we do not reveal whether an email has an account.

const messagesByCode = {
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Please confirm your email address first. Check your inbox for the confirmation link.',
  user_already_exists: 'An account with this email already exists. Try logging in instead.',
  email_exists: 'An account with this email already exists. Try logging in instead.',
  weak_password: 'That password is too weak. Use a longer password with letters and numbers.',
  same_password: 'Your new password must be different from your current one.',
  over_request_rate_limit: 'Too many attempts. Please wait a few minutes and try again.',
  over_email_send_rate_limit: 'Too many emails were requested. Please wait a while before trying again.',
  signup_disabled: 'New sign-ups are currently turned off.',
  validation_failed: 'Please check the details you entered and try again.',
  session_expired: 'Your session has expired. Please log in again.',
  session_not_found: 'Your session has expired. Please log in again.',
  otp_expired: 'That link has expired. Please request a new one.',
  user_banned: 'This account has been suspended.',
}

export function friendlyAuthError(error) {
  if (!error) return ''
  // Keep the technical details in the browser console for debugging, not on screen.
  console.error('Auth error:', error)

  const message = String(error.message ?? '')

  if (error.code && messagesByCode[error.code]) return messagesByCode[error.code]
  if (error.status === 429) return messagesByCode.over_request_rate_limit
  if (error.name === 'AuthRetryableFetchError' || /failed to fetch|networkerror|load failed/i.test(message)) {
    return "We can't reach the server. Check your internet connection and that your Supabase URL in .env is correct."
  }
  // Raised by our own database trigger when profile creation fails.
  if (/database error saving new user/i.test(message)) {
    return "We couldn't set up your profile. Please check your details and try again. If it keeps happening, the database setup may be incomplete."
  }
  return 'Something went wrong. Please try again.'
}

// Email-confirmation and password-reset links come back with "error" details in the URL
// (in the "#" part or the "?" part). This reads them so we can show a clear message.
export function readAuthErrorFromUrl() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const query = new URLSearchParams(window.location.search)
  const description = params.get('error_description') ?? query.get('error_description')
  const code = params.get('error_code') ?? query.get('error_code')
  if (!description && !code) return ''
  if (code === 'otp_expired') return 'That link has expired or was already used. Please request a new one.'
  return 'That link is not valid. Please request a new one.'
}
