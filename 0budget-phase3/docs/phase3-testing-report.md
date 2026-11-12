# Phase 3 testing report

**Honest scope:** nothing here was run against a live Supabase project (that needs your account).
Two kinds of tests were run instead. Please do the real-world checklist in `docs/supabase-setup.md` (step 7).

## A. Database tests - real PostgreSQL engine (PGlite), 136 checks, 0 failed

The two real migration files were run in order on a real Postgres engine, with stand-ins for Supabase's
`auth` and `storage` schemas. This proves the SQL and the Row Level Security rules; it does not prove
Supabase's own services. Covered: re-running the Phase 3 file is safe; Phase 2 behaviour unchanged;
public profiles readable, private profiles hidden from visitors and other members but visible to the owner;
owners can update only their own row; username rules, reserved names and uniqueness; link checks
(including `https://evil.com/storage/...` tricks on avatar links); portfolio read/add/edit/delete rules,
the 30-entry limit, cascade delete; avatar bucket limits and own-folder-only storage policies.

## B. Browser tests - Chromium + simulated Supabase API, 23 scenarios, 0 failed

These run the real production build in a browser against a **pretend** Supabase that re-implements the
visibility and ownership rules. They prove the screens, forms, validation and request logic.

| # | Spec item | Result |
|---|---|---|
| 1 | Existing user can log in | Passed |
| 2 | Existing user can log out | Passed |
| 3 | Existing user can access the dashboard (Edit Profile button present) | Passed |
| 4 | User can edit their profile (prefill, all fields, validation, duplicate usernames, error handling) | Passed (5 scenarios) |
| 5 | User can upload an avatar (cropped to 512x512 JPEG, replace removes old file, remove, bad files refused, failed upload) | Passed (2 scenarios) |
| 6 | User can add multiple portfolio entries | Passed |
| 7 | User can edit and delete portfolio entries | Passed |
| 8 | User can view their public profile (no email shown, no private columns requested) | Passed (2 scenarios) |
| 9 | Other users cannot edit that profile | Passed (UI + every write targets the user's own id) |
| 10 | Private profiles are not publicly discoverable | Passed |
| 11 | Profile completion updates dynamically (43% -> 71% -> 86% -> 100% -> 86%) | Passed |
| 12 | Phase 1/2 pages and flows still work (public pages, signup, route guards, onboarding, skip) | Passed (4 scenarios) |
| 13 | Production build succeeds (`npm run build`) | Passed |
| - | No request carried a secret key; only the publishable key was used | Passed |
| - | No sideways scrolling at 375, 768 and 1280 px; mobile menu has the new links | Passed |

Note on item 9: the browser test checks the screens and that the app only writes to the user's own row.
The rule that the **database** refuses writes to other people's rows is proven in section A.

## C. Bugs found by testing and fixed

- Two elements shared the id `portfolio` (the "Other portfolio website" box and the Portfolio section), which broke focus and links. The link box now uses `portfolioSite`.
- Avatar link check in the database could be fooled by `https://evil.com/x/storage/...`; replaced with a stricter pattern.
- Links with a port number passed the browser check but failed the database check; the browser now rejects them first.
- City + Country (up to 160 characters) could overflow the older 100-character `location` column; it is now trimmed to 100 when kept in sync.

## D. Not tested / known limits

- Not tested against live Supabase (Auth emails, Storage service, real RLS in Supabase's runtime).
- Not tested on real phones or in Safari/Firefox (Chromium only).
- Thumbnail images load from the address the member typed (third-party sites can see visitors' IP addresses).
- Creator search/browse (`/creators`) is not part of this phase; it still shows "Coming soon".
