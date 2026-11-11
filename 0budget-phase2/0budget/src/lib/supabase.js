import { createClient } from '@supabase/supabase-js'

// These two values come from your local ".env" file (see ".env.example").
// Vite only exposes variables that start with VITE_ to the browser, so they must be public values.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

// Safety net for a common beginner mistake: pasting the secret (service role) key into frontend code.
// Anything in a Vite app is visible to every visitor, so we refuse to start with a secret key.
function looksLikeSecretKey(key) {
  if (key.startsWith('sb_secret_')) return true
  try {
    const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role === 'service_role'
  } catch {
    return false
  }
}

const hasValues = Boolean(supabaseUrl && supabaseKey)
const isPlaceholder = hasValues && (supabaseUrl.includes('your-project') || supabaseKey.startsWith('your-'))
const isSecret = hasValues && looksLikeSecretKey(supabaseKey)

if (isSecret) {
  console.error(
    '0Budget: the key in VITE_SUPABASE_PUBLISHABLE_KEY is a SECRET key. Use the publishable (anon) key instead. Supabase is disabled until you fix this.',
  )
}

export const isSupabaseConfigured = hasValues && !isPlaceholder && !isSecret && isValidHttpUrl(supabaseUrl)

// "null" when not configured, so the app can still load and show a helpful setup message
// instead of crashing. Code that uses it must check isSupabaseConfigured first.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true, // keep the user logged in across page reloads
        autoRefreshToken: true,
        detectSessionInUrl: true, // lets email-confirmation and password-reset links sign the user in
      },
    })
  : null
