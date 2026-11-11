# 0Budget - The Zero-Budget Filmmaking Network

0Budget is a creative networking platform that connects filmmakers, actors, screenwriters, cinematographers,
editors, musicians and production companies so that great films get made, whatever the budget.

> **Status: Phase 2 (Authentication and onboarding) complete.** Profiles, projects, messaging and the rest
> are built in later phases.

## Principles

- Every project must state clearly whether it is unpaid, student, paid, revenue-share or negotiable.
- Creators keep ownership of their own work. 0Budget never claims rights over uploaded content.
- No fake data, fake statistics or fake testimonials. Empty states are shown until real content exists.
- Permissions are enforced by the database (Row Level Security), never only by hiding buttons.

## What works now

- Landing page and public pages (Phase 1)
- Sign up with email + password and an account type (10 types, organisation name for production companies)
- Email confirmation, log in, log out, "forgot password" and "reset password"
- Sessions that survive page reloads
- Onboarding (location, bio, skills, interests), all optional and skippable
- A dashboard placeholder showing your real saved profile
- Protected routes and a logged-in user menu with Log out
- `profiles` database table with automatic profile creation and Row Level Security

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Lucide icons |
| Backend | Supabase (Auth, PostgreSQL, Row Level Security) |
| Hosting (planned) | Cloudflare Pages |
| Source control | Git + GitHub |

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
copy .env.example .env      # Windows (macOS/Linux: cp .env.example .env)
# open .env and paste your Supabase URL + publishable key (see docs/supabase-setup.md)
npm run dev
```

Open the address Vite prints (usually http://localhost:5173). The site also runs **without** a `.env`: the
public pages work and the sign-up/login pages show a "Supabase is not connected yet" notice.

Other commands:

```bash
npm run build     # production build into the dist/ folder
npm run preview   # serve the production build locally
```

## Set up Supabase

Follow **[docs/supabase-setup.md](docs/supabase-setup.md)**. In short:

1. Create a free Supabase project.
2. Put the Project URL and **publishable** key in `.env`.
3. Run `supabase/migrations/20261111000100_create_profiles.sql` in the Supabase SQL Editor.
4. Add the redirect URLs under Authentication -> URL Configuration.

## Environment variables

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your **publishable** (anon) key |

Never put a `secret` or `service_role` key in this project. Never commit `.env`.

## Routes

| Path | Who can open it |
|---|---|
| `/`, `/projects`, `/creators`, `/opportunities`, `/companies`, `/guidelines`, `/terms`, `/privacy` | Everyone (most are "Coming soon" placeholders) |
| `/signup` | Everyone (logged-in users are sent to the dashboard) |
| `/login`, `/forgot-password` | Logged-out visitors only |
| `/auth/callback`, `/reset-password` | Opened from emails |
| `/onboarding`, `/dashboard` | Logged-in users only (others are sent to `/login`) |

## Folder structure

```
0budget/
  public/                 favicon, _redirects (makes page refreshes work on Cloudflare Pages)
  src/
    components/
      auth/               AuthShell, ConfigNotice, ProtectedRoute + GuestRoute
      ui/                 Button, Field (inputs), ChipInput, Alert, Spinner, Badge, ...
      layout/             Navbar, UserMenu, Footer
      home/               landing page sections
    context/AuthContext.jsx   who is logged in + sign up / in / out / password reset
    hooks/useAuth.js          use this in any component: const { user } = useAuth()
    layouts/RootLayout.jsx
    lib/                supabase.js (client), profileOptions.js, navigation.js
    pages/              one file per page
    services/profiles.js     reads and updates the signed-in user's profile
    utils/              validation.js, authErrors.js
    styles/index.css    design tokens (colours, fonts) and global styles
  supabase/migrations/  SQL files
  docs/                 setup guides
```

## Security notes

- Passwords are handled only by Supabase Auth. They are never stored in 0Budget's own tables.
- The browser uses only the public publishable key. The app refuses to start Supabase if it detects a secret key.
- The `profiles` table is publicly readable, so it holds **no email addresses**.
- Users can update only their own profile, and cannot insert or delete profiles or change `id`/timestamps.
- Frontend checks (forms, `ProtectedRoute`) are for convenience. The database repeats every important rule.

## Deploying to Cloudflare Pages

| Setting | Value |
|---|---|
| Framework preset | Vite (or None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |

After deploying, add your live address to Supabase under Authentication -> URL Configuration.
Full deployment instructions arrive in Phase 9.
