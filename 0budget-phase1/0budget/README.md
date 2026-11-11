# 0Budget - The Zero-Budget Filmmaking Network

0Budget is a creative networking platform that connects filmmakers, actors, screenwriters, cinematographers,
editors, musicians and production companies so that great films get made, whatever the budget.

> Status: **Phase 1 (Foundation) complete.** Authentication, database and the rest are built in later phases.

## Principles

- Every project must state clearly whether it is unpaid, student, paid, revenue-share or negotiable.
- Creators keep ownership of their own work. 0Budget never claims rights over uploaded content.
- No fake data, fake statistics or fake testimonials. Empty states are shown until real content exists.

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Lucide icons |
| Backend (Phase 2+) | Supabase (Auth, PostgreSQL, Storage, Row Level Security) |
| Hosting | Cloudflare Pages |
| Source control | Git + GitHub |

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

Other commands:

```bash
npm run build     # production build into the dist/ folder
npm run preview   # serve the production build locally
```

## Environment variables

Not needed for Phase 1. From Phase 2 onwards, copy `.env.example` to `.env` and fill in your Supabase
project URL and public anon key. Never commit `.env`, and never put a service-role key in this project.

## Folder structure

```
0budget/
  public/              static files (favicon, _redirects for SPA routing)
  src/
    components/
      ui/              reusable building blocks (Button, Badge, Logo, ...)
      layout/          Navbar and Footer
      home/            landing page sections
    layouts/           page shells (RootLayout)
    pages/             one file per route
    lib/               shared config (navigation links)
    hooks/ context/ services/ utils/    reserved for later phases
    styles/index.css   design tokens and global styles
  supabase/migrations/ SQL files (added in Phase 2+)
  docs/                setup and deployment notes
```

## Design system

Colours and fonts are defined once in `src/styles/index.css` under `@theme` and used as Tailwind classes:
`bg-ink`, `bg-surface`, `bg-card`, `text-accent`, `text-muted`, `border-line`. Headings use Manrope; body
text uses Inter.

## Deploying to Cloudflare Pages

| Setting | Value |
|---|---|
| Framework preset | Vite (or None) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |

`public/_redirects` makes page refreshes work on routes like `/projects`. Full step-by-step deployment
instructions are added in Phase 9.
