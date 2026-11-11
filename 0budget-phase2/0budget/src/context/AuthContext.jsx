import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { fetchProfile, updateProfile } from '../services/profiles'
import { friendlyAuthError } from '../utils/authErrors'

export const AuthContext = createContext(null)

const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured yet. Add your project URL and publishable key to the .env file (see .env.example).'

// Keeps track of who is logged in and shares it with the whole app.
// Every action returns { error } where "error" is a friendly message, or null on success.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // While Supabase is still checking for a saved session we are "loading". If Supabase is not
  // configured there is nothing to wait for.
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [profile, setProfile] = useState(null)
  // 'idle' | 'loading' | 'ready' | 'missing' | 'error'
  const [profileStatus, setProfileStatus] = useState('idle')
  // True after the person clicks "Log out" themselves. Lets the route guard send them to the home
  // page instead of the login page (which is only right for expired sessions and unknown visitors).
  const [signedOutByUser, setSignedOutByUser] = useState(false)

  const user = session?.user ?? null
  const userId = user?.id ?? null

  // 1. Restore the saved session, then listen for sign in / sign out / token refresh.
  useEffect(() => {
    if (!supabase) return undefined
    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session)
      })
      .catch((error) => console.error('Could not read the saved session:', error))
      .finally(() => {
        if (active) setLoading(false)
      })

    // Note: this callback must stay synchronous. Calling Supabase from inside it can deadlock,
    // so the profile is loaded in a separate effect below.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) setSignedOutByUser(false)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // 2. Load the profile whenever a different person signs in.
  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(null)
      setProfileStatus('idle')
      return undefined
    }
    let active = true
    setProfileStatus('loading')
    fetchProfile(userId).then(({ profile: loaded, error }) => {
      if (!active) return
      if (error) {
        console.error('Could not load the profile:', error)
        setProfile(null)
        setProfileStatus('error')
      } else if (!loaded) {
        setProfile(null)
        setProfileStatus('missing')
      } else {
        setProfile(loaded)
        setProfileStatus('ready')
      }
    })
    return () => {
      active = false
    }
  }, [userId])

  const signUp = useCallback(async ({ fullName, email, password, accountType, organisationName }) => {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const metadata = { full_name: fullName.trim(), account_type: accountType }
    if (accountType === 'production_company') metadata.organisation_name = organisationName.trim()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata, // the database trigger turns this into the profile row
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { error: friendlyAuthError(error) }

    // With "Confirm email" turned on, Supabase creates the user but gives no session yet.
    // For an email that is already registered it returns a user with no identities. We treat both
    // the same way ("check your email") so the form never reveals which emails have accounts.
    return { error: null, needsConfirmation: !data.session }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return { error: friendlyAuthError(error), code: error.code }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return { error: null }
    setSignedOutByUser(true)
    // "local" signs out this browser only, not the person's other devices.
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      setSignedOutByUser(false)
      return { error: friendlyAuthError(error) }
    }
    return { error: null }
  }, [])

  const sendPasswordReset = useCallback(async (email) => {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: friendlyAuthError(error) }
    return { error: null }
  }, [])

  const updatePassword = useCallback(async (newPassword) => {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: friendlyAuthError(error) }
    return { error: null }
  }, [])

  const resendConfirmation = useCallback(async (email) => {
    if (!supabase) return { error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) return { error: friendlyAuthError(error) }
    return { error: null }
  }, [])

  // Saves changes to the signed-in user's own profile and keeps the shared copy up to date.
  const saveProfile = useCallback(
    async (changes) => {
      if (!supabase || !userId) return { error: { code: 'not_signed_in', message: 'Not signed in.' } }
      const { profile: updated, error } = await updateProfile(userId, changes)
      if (!error) {
        setProfile(updated)
        setProfileStatus('ready')
      }
      return { profile: updated, error }
    },
    [userId],
  )

  const value = useMemo(
    () => ({
      isConfigured: isSupabaseConfigured,
      session,
      user,
      profile,
      profileStatus,
      loading,
      signedOutByUser,
      signUp,
      signIn,
      signOut,
      sendPasswordReset,
      updatePassword,
      resendConfirmation,
      saveProfile,
    }),
    [session, user, profile, profileStatus, loading, signedOutByUser, signUp, signIn, signOut, sendPasswordReset, updatePassword, resendConfirmation, saveProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
