# Supabase setup (Phase 2 and Phase 3)

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

> **Already finished Phase 2?** You have done this step. Do **not** re-run this file. Go to
> **Step 4b** below and run the new Phase 3 migration.

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

## 4b. Run the Phase 3 migration (profiles, portfolio, avatars)

The Phase 3 file is `supabase/migrations/20261112000100_profiles_portfolio_storage.sql`. It **adds to** the
Phase 2 tables. It does not replace or delete anything, so existing accounts keep working.
**Run it after the Phase 2 file.**

1. **SQL Editor** -> **New query**.
2. Copy **all** of `20261112000100_profiles_portfolio_storage.sql`, paste it, click **Run**.
3. You should see "Success". It is safe to run twice (it uses "if not exists" and replaces its own policies).

### What the Phase 3 migration adds

| Part | What it does |
|---|---|
| New `profiles` columns | `city`, `country`, `experience_level`, `equipment`, five link columns (Instagram, YouTube, LinkedIn, website, other portfolio) and `is_public` (default **true**). |
| Link checks | Links must be `https://`; the Instagram, YouTube and LinkedIn boxes only accept those sites. Usernames must be 3-30 lowercase letters, numbers or underscores, and a list of reserved names (`admin`, `support`, ...) is blocked. |
| New read rule | A profile can be read when it is **public** or when it is **your own**. Private profiles look exactly like profiles that do not exist. This replaces the Phase 2 "everyone can read everything" rule. |
| `is_username_available()` | A small function the Edit Profile page uses to say "that username is taken". It only returns yes or no, and only to logged-in members. The unique index on usernames is the real protection. |
| `portfolio_entries` table | Title, description, category, project link, thumbnail link, year. Linked to the member; deleted automatically with the account; **at most 30 per member**. |
| Portfolio rules (RLS) | Anyone can read the entries of a **public** profile. Only the owner can read entries of a private profile, and only the owner can add, edit or delete their own entries. |
| `avatars` storage bucket | Public bucket for profile pictures: **2 MB**, JPEG / PNG / WebP only. Members can upload, replace or delete files **only inside their own folder** (`avatars/<their id>/...`). |

### Check it worked

- **Table Editor** -> `profiles` has the new columns; `portfolio_entries` exists with "RLS enabled".
- **Authentication** -> **Policies**: `profiles` has *Public profiles are readable; owners can read their own* and
  *Users can update their own profile*; `portfolio_entries` has four policies.
- **Storage**: a bucket called `avatars` exists and is marked **Public**.
- If the bucket is missing or not public, the picture upload says "storage is not set up", or pictures do not show on public pages. Re-run the migration.

### Members who signed up in Phase 2

They have no username yet. When they open **Edit Profile** they choose one, and their old single
"location" text is split into City and Country as a starting suggestion (they check it and save).
Until they choose a username they have no public link, and the dashboard shows "Choose a username" in
the completion checklist. Their profile stays **public** by default; they can switch it to private on the
Edit Profile page.

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

### Phase 3 checklist (profiles and portfolio)

- [ ] Log in with an account made in Phase 2. The dashboard still opens. Click **Edit Profile**.
- [ ] Choose a username, add City and Country, a bio, skills and an experience level. Click **Save profile**. Reload: everything is still there.
- [ ] Try a username that another account already uses. You get "already taken".
- [ ] Paste `http://...` or the wrong website into a link box. You get a clear error and nothing is saved.
- [ ] Upload a profile picture (JPG/PNG/WebP). It appears on Edit Profile, the dashboard and your public page. In **Storage** -> `avatars` there is a folder named after your user id.
- [ ] Upload a second picture. The old file in that folder is removed.
- [ ] Add three portfolio entries with different years. Edit one, delete one.
- [ ] Open **My Profile** (`/creators/your_username`) in a **private/incognito window** (not logged in). You see your public page, and no email anywhere.
- [ ] On Edit Profile turn **Public profile** off and save. Reload the incognito window: "This profile is not available". Turn it back on afterwards.
- [ ] With a **second account**, open the first account's public link. There is no Edit button. Then make the first account private and check the second account also gets "not available".
- [ ] The dashboard completion percentage rises as you add a picture, bio, username, location, skills, experience and a portfolio entry (seven items).
- [ ] In **SQL Editor**, as a check: `select count(*) from public.portfolio_entries;` works, and `select * from public.profiles;` still has no email column.

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
| "The database is missing the Phase 3 update" when saving a profile | The Phase 3 migration (step 4b) has not been run. |
| "The portfolio table is missing" | Same: run the Phase 3 migration. |
| "The picture storage is not set up yet" | The `avatars` bucket does not exist. Run the Phase 3 migration. |
| Picture uploads but does not appear | The `avatars` bucket must be **Public** (Storage -> avatars -> make public), or re-run the migration. |
| "You are not allowed to upload that picture" | You are logged out (log in again), or the storage policies are missing (re-run the migration). |
| A public profile says "not available" for a real username | The profile is set to private, or the username is spelled differently. |

## Security summary

- Passwords are handled only by Supabase Auth (hashed there). 0Budget never stores or sees them in its own tables.
- Only the public **publishable** key is used in the browser; the app refuses a secret key.
- Private profiles and their portfolio entries are hidden by Row Level Security, not by the website. Profile pictures can only be written inside the member's own storage folder.
- Links are validated in the browser **and** by database constraints. Links open with `rel="noopener noreferrer"`.
- Thumbnail images are loaded from the web address the member typed, so the owner of that site can see a visitor's IP address (like any image on the web). 0Budget sends no referrer to them.
- All permissions are enforced by the database (Row Level Security), not just by hidden buttons or redirects.
  The `ProtectedRoute` component only decides what the browser shows.
