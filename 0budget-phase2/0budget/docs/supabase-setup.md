# Supabase setup (Phase 2)

This guide connects your local 0Budget project to a free Supabase project. It takes about 15 minutes.
Do the steps in order.

> **Honest status:** the code and the SQL were tested with a real Postgres engine and with a simulated
> Supabase API, but **not against a live Supabase project**, because that needs your account.
> Step 7 is a short checklist that proves everything works for real on your machine.

---

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in (GitHub login works).
2. Click **New project**. Choose any name (for example `0budget`), a strong database password
   (save it in a password manager, you will rarely need it), and the region nearest your users.
3. Wait until the project finishes setting up.

## 2. Copy your project URL and publishable key

In the Supabase dashboard open **Project Settings**:

- **Project URL**: shown under *API* / *Data API* (looks like `https://abcdxyz.supabase.co`).
- **Publishable key**: under *API Keys* (starts with `sb_publishable_...`). If your dashboard only shows
  the older keys, use the one called **anon** / **public**.

> **Never** use the **secret** key or the **service_role** key anywhere in this project. Everything in a
> Vite app is visible to every visitor. The publishable key is designed to be public; the secret ones are not.
> (The app refuses to start Supabase if it detects a secret key.)

## 3. Create your local `.env` file

In the project's main folder (next to `package.json`):

1. Copy `.env.example` and name the copy exactly `.env` (on Windows PowerShell: `copy .env.example .env`).
2. Open `.env` in VS Code and replace the two placeholder values:

```
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

3. **Restart** `npm run dev` after any change to `.env` (Vite only reads it at startup).

`.env` is listed in `.gitignore`, so Git will never upload it.

## 4. Run the database migration

The migration file is `supabase/migrations/20261111000100_create_profiles.sql`.

1. In Supabase open **SQL Editor** -> **New query**.
2. Open the migration file in VS Code, copy **all** of it, paste it into the editor.
3. Click **Run**. You should see "Success. No rows returned".

Run it **once**. Running it a second time fails with "relation already exists", which is harmless.

### What the migration creates

| Part | What it does |
|---|---|
| `profiles` table | One row per member: name, username, account type, organisation name, location, bio, skills, interests, avatar, timestamps. Linked to Supabase's own `auth.users` table and deleted automatically if the account is deleted. |
| Constraints | Name length, valid account types, bio <= 500 characters, <= 20 skills, `https://` avatar links only, production companies must have an organisation name, unique usernames. The database enforces these even if someone bypasses the website. |
| Sign-up trigger | When Supabase creates a user, a database trigger creates **exactly one** profile from the sign-up form's data. Unknown values are cleaned up (for example an invalid account type becomes `filmmaker`). The browser can never insert profiles itself. |
| Back-fill | Anyone who already signed up before you ran the migration gets a profile too. |
| Row Level Security | Everyone can **read** profiles (they are public creator pages). A logged-in user can **update only their own** row. Nobody can insert or delete profiles from the browser. |
| Column privileges | A second safety net: users cannot change `id`, `created_at` or `updated_at` even on their own row. |

**Privacy:** the `profiles` table is public, so it deliberately stores **no email address**. Emails stay in
Supabase's private `auth.users` table.

### Check it worked

- **Table Editor** -> `profiles` exists and shows a "RLS enabled" badge.
- **Authentication** -> **Policies** shows two policies on `profiles`: *Profiles are publicly readable* and
  *Users can update their own profile*.

## 5. Configure email sign-in and redirect URLs

In the dashboard open **Authentication**.

### Email provider
**Sign In / Providers** -> **Email** must be enabled (it is by default). Keep **Confirm email** switched
**ON** for a real launch. The app works with it on or off:

- **ON:** after sign-up the person sees "Check your email" and must click the link before logging in.
- **OFF:** the person is logged in immediately and goes straight to onboarding (handy for quick local testing).

### Redirect URLs (important)
**Authentication** -> **URL Configuration**:

| Field | Local development | After you deploy |
|---|---|---|
| **Site URL** | `http://localhost:5173` | `https://0budget.pages.dev` (your real address) |
| **Redirect URLs** (add all) | `http://localhost:5173/**` | `https://0budget.pages.dev/**` and `https://*.0budget.pages.dev/**` (preview deployments) |

If a redirect URL is missing here, confirmation and password-reset links will send people to the wrong place
or be rejected. The app uses these two paths: `/auth/callback` (email confirmation) and `/reset-password`.

If your dev server uses a different port (Vite prints it), use that port instead of `5173`.

### Emails and limits
Supabase's built-in email sender is meant for testing: it has a **very small hourly limit** and may only
deliver to addresses of your project's team members. Check Supabase's current documentation for exact
limits. Before a public launch, set up your own email sender under **Authentication** -> **SMTP Settings**
(several providers have free tiers). During early testing you can switch **Confirm email** off.

## 6. Run the app

```
npm install
npm run dev
```

Open http://localhost:5173. If the sign-up or login page shows an orange "Supabase is not connected yet"
box, your `.env` is missing, misspelled, or you did not restart `npm run dev`.

## 7. Real-world test checklist (please do this)

Tick each one on your own machine:

- [ ] Sign up with your real email as a **Filmmaker**. You see "Check your email" (or go straight to onboarding if Confirm email is off).
- [ ] Open the confirmation email link **in the same browser**. You land on **Tell us about yourself**.
- [ ] In Supabase **Table Editor** -> `profiles`: exactly one new row with your name and account type.
- [ ] Fill in location, bio and a few skills, click **Save and continue**. The dashboard shows them, and the row in Supabase updated.
- [ ] Open the user menu (top right) -> **Log out**. You return to the home page.
- [ ] Open `/dashboard` while logged out. You are sent to `/login`.
- [ ] Log in again. Reload the page. You stay logged in.
- [ ] **Forgot your password?** -> enter your email -> open the email link -> choose a new password -> log in with it.
- [ ] Sign up a second account as **Production Company** with an organisation name. The dashboard shows the organisation name.
- [ ] Try signing up with the same email again. You get a clear message (or the neutral "check your email" screen when Confirm email is on, so strangers cannot discover which emails have accounts).
- [ ] Optional database check: in **SQL Editor** run `select * from public.profiles;` and confirm there is no email column.

## Troubleshooting

| Message or symptom | Likely cause and fix |
|---|---|
| "Supabase is not connected yet" box | `.env` missing/misspelled, or dev server not restarted. |
| "We couldn't set up your profile ... database setup may be incomplete" on sign-up | The migration (step 4) has not been run, or failed part-way. Re-check the SQL Editor result. |
| "Your profile was not created" after logging in | Same as above for an account made before the migration. The migration's back-fill step creates it; re-run only if the table is missing. |
| Email link says it is invalid/expired | Links work once and expire. Request a new one. Open it in the **same browser** you signed up in. |
| Link opens the wrong website address | Fix **Site URL** and **Redirect URLs** (step 5). |
| "Too many emails were requested" | Supabase's built-in email limit. Wait, switch Confirm email off for testing, or add custom SMTP. |
| Changes to `.env` have no effect | Stop and restart `npm run dev`. |

## Security summary

- Passwords are handled only by Supabase Auth (hashed there). 0Budget never stores or sees them in its own tables.
- Only the public **publishable** key is used in the browser; the app refuses a secret key.
- All permissions are enforced by the database (Row Level Security), not just by hidden buttons or redirects.
  The `ProtectedRoute` component only decides what the browser shows.
