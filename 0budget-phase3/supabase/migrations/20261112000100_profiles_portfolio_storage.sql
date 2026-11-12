-- =====================================================================
-- 0Budget - Phase 3: creator profiles, portfolio entries, avatar storage
-- =====================================================================
-- ADDITIVE migration. Run it AFTER 20261111000100_create_profiles.sql (Phase 2).
-- It never edits that file; it only extends what Phase 2 created.
-- It is safe to run more than once.
--
-- What this migration does:
--   1. Adds new columns to public.profiles (city, country, experience, equipment,
--      social links, public/private switch).
--   2. Makes profiles respect the public/private switch (replaces the Phase 2
--      "everyone can read everything" policy).
--   3. Adds a safe "is this username free?" function for the edit form.
--   4. Creates public.portfolio_entries with Row Level Security.
--   5. Creates the "avatars" Storage bucket with per-user upload rules.
--
-- Privacy reminder: public.profiles holds NO email address. Emails stay in Supabase's
-- private auth.users table.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Helper: is this text a safe https:// link?
-- ---------------------------------------------------------------------
-- Used by CHECK constraints so a profile can never store "javascript:", "data:", "http:" or
-- links with a username:password@ part. Requires a real domain name (at least one dot).
create or replace function public.is_https_url(p_url text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_url ~ '^https://[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:[0-9]{1,5})?([/?#][^[:space:]]*)?$'
$$;


-- ---------------------------------------------------------------------
-- 1. New columns on public.profiles
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists city             text,
  add column if not exists country          text,
  add column if not exists experience_level text,
  add column if not exists equipment        text[]  not null default '{}',
  add column if not exists instagram_url    text,
  add column if not exists youtube_url      text,
  add column if not exists linkedin_url     text,
  add column if not exists website_url      text,
  add column if not exists portfolio_url    text,
  -- PRIVACY SWITCH. Existing Phase 2 profiles were already publicly readable, so the default stays
  -- "public". Each member can switch their profile to private on the Edit Profile page.
  add column if not exists is_public        boolean not null default true;

comment on column public.profiles.is_public is
  'true = anyone can see this profile; false = only the owner can see it (enforced by Row Level Security).';
comment on column public.profiles.location is
  'Legacy single-line location from Phase 2 onboarding. The app now keeps it equal to "city, country".';

-- Constraints (dropped first so this file can be re-run).
alter table public.profiles
  drop constraint if exists profiles_city_length,
  drop constraint if exists profiles_country_length,
  drop constraint if exists profiles_experience_valid,
  drop constraint if exists profiles_equipment_limit,
  drop constraint if exists profiles_instagram_url_valid,
  drop constraint if exists profiles_youtube_url_valid,
  drop constraint if exists profiles_linkedin_url_valid,
  drop constraint if exists profiles_website_url_valid,
  drop constraint if exists profiles_portfolio_url_valid,
  drop constraint if exists profiles_skills_limit,
  drop constraint if exists profiles_interests_limit,
  drop constraint if exists profiles_username_not_reserved,
  drop constraint if exists profiles_avatar_url_own_storage;

alter table public.profiles
  add constraint profiles_city_length check (city is null or char_length(btrim(city)) between 1 and 80),
  add constraint profiles_country_length check (country is null or char_length(btrim(country)) between 1 and 80),
  add constraint profiles_experience_valid check (
    experience_level is null or experience_level in ('beginner', 'intermediate', 'professional')
  ),
  add constraint profiles_equipment_limit check (
    cardinality(equipment) <= 20 and char_length(array_to_string(equipment, ',')) <= 1300
  ),
  -- Social links: https only, and each one must point at the right kind of site.
  add constraint profiles_instagram_url_valid check (
    instagram_url is null or (
      char_length(instagram_url) <= 300
      and instagram_url ~ '^https://([A-Za-z0-9-]+\.)*instagram\.com([/?#][^[:space:]]*)?$'
    )
  ),
  add constraint profiles_youtube_url_valid check (
    youtube_url is null or (
      char_length(youtube_url) <= 300
      and youtube_url ~ '^https://([A-Za-z0-9-]+\.)*(youtube\.com|youtu\.be)([/?#][^[:space:]]*)?$'
    )
  ),
  add constraint profiles_linkedin_url_valid check (
    linkedin_url is null or (
      char_length(linkedin_url) <= 300
      and linkedin_url ~ '^https://([A-Za-z0-9-]+\.)*linkedin\.com([/?#][^[:space:]]*)?$'
    )
  ),
  add constraint profiles_website_url_valid check (
    website_url is null or (char_length(website_url) <= 300 and public.is_https_url(website_url))
  ),
  add constraint profiles_portfolio_url_valid check (
    portfolio_url is null or (char_length(portfolio_url) <= 300 and public.is_https_url(portfolio_url))
  );

-- Small correction to two Phase 2 limits: 20 items of 40 characters plus 19 commas is 819
-- characters, but Phase 2 capped the joined text at 800. The cap is now 900 so the form's own
-- limits (20 items, 40 characters each) can never be rejected by the database.
alter table public.profiles
  add constraint profiles_skills_limit check (
    cardinality(skills) <= 20 and char_length(array_to_string(skills, ',')) <= 900
  ),
  add constraint profiles_interests_limit check (
    cardinality(interests) <= 20 and char_length(array_to_string(interests, ',')) <= 900
  );

-- Usernames: words that could be confused with site pages or staff cannot be claimed.
-- NOT VALID = checked for every new or changed row, without re-checking old rows.
alter table public.profiles
  add constraint profiles_username_not_reserved check (
    username is null or username not in (
      'admin', 'administrator', 'mod', 'moderator', 'staff', 'support', 'help', 'official', 'system',
      'root', 'null', 'undefined', 'me', 'you', 'new', 'edit', 'settings', 'login', 'logout', 'signup',
      'register', 'api', 'www', 'mail', 'about', 'contact', 'terms', 'privacy', 'guidelines', 'creators',
      'projects', 'opportunities', 'companies', 'dashboard', 'profile', 'onboarding', 'team', 'security',
      'billing', '0budget', 'zerobudget'
    )
  ) not valid;

-- A profile picture link must have the shape of a file in THIS member's own folder of the
-- "avatars" bucket:  https://<host>/storage/v1/object/public/avatars/<member id>/<file name>
-- This is defence in depth, not a guarantee: it stops accidental or casual misuse (pointing an
-- avatar at another member's file, or at any random image address), but the database cannot know
-- which host is your Supabase project, so it cannot stop someone who deliberately hosts a file at
-- an address of exactly this shape on their own server. The real upload protection is the Storage
-- policies in section 5. (Old rows are not re-checked; Phase 2 had no way to set an avatar.)
alter table public.profiles
  add constraint profiles_avatar_url_own_storage check (
    avatar_url is null
    or avatar_url ~ ('^https://[^/]+/storage/v1/object/public/avatars/' || id::text || '/[^/?#]+$')
  ) not valid;


-- ---------------------------------------------------------------------
-- 2. Row Level Security for profiles: respect the public/private switch
-- ---------------------------------------------------------------------
drop policy if exists "Profiles are publicly readable" on public.profiles;
drop policy if exists "Public profiles are readable; owners can read their own" on public.profiles;

create policy "Public profiles are readable; owners can read their own"
  on public.profiles
  for select
  to anon, authenticated
  using (is_public or (select auth.uid()) = id);

-- The Phase 2 UPDATE policy ("Users can update their own profile") is unchanged. Allow the
-- new editable columns (id, created_at and updated_at stay locked, exactly as in Phase 2).
grant update (
  city, country, experience_level, equipment,
  instagram_url, youtube_url, linkedin_url, website_url, portfolio_url,
  is_public
) on public.profiles to authenticated;


-- ---------------------------------------------------------------------
-- 3. "Is this username free?" (for the Edit Profile form)
-- ---------------------------------------------------------------------
-- A private profile is invisible to other people, so the browser cannot simply search for a
-- username. This function answers only yes/no, never returns any profile data, and only logged-in
-- users can call it. The unique constraint on profiles.username remains the real protection.
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.profiles p
    where p.username = lower(btrim(p_username))
      and p.id <> (select auth.uid())
  );
$$;

revoke all on function public.is_username_available(text) from public, anon, authenticated;
grant execute on function public.is_username_available(text) to authenticated;


-- ---------------------------------------------------------------------
-- 4. Portfolio entries
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_entries (
  id            uuid        primary key default gen_random_uuid(),
  profile_id    uuid        not null references public.profiles (id) on delete cascade,
  title         text        not null,
  description   text,
  category      text        not null,
  project_url   text,
  thumbnail_url text,
  project_year  smallint    not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint portfolio_title_length check (char_length(btrim(title)) between 2 and 120),
  constraint portfolio_description_length check (description is null or char_length(description) <= 1000),
  constraint portfolio_category_valid check (category in (
    'short_film', 'feature_film', 'documentary', 'music_video', 'advertisement',
    'web_series', 'student_film', 'experimental_film', 'photography', 'other'
  )),
  constraint portfolio_project_url_valid check (
    project_url is null or (char_length(project_url) <= 500 and public.is_https_url(project_url))
  ),
  constraint portfolio_thumbnail_url_valid check (
    thumbnail_url is null or (char_length(thumbnail_url) <= 500 and public.is_https_url(thumbnail_url))
  ),
  constraint portfolio_year_valid check (project_year between 1900 and 2100)
);

comment on table public.portfolio_entries is
  'Portfolio items on a creator profile. Links only (no file uploads). Visible whenever the owner''s profile is visible.';

-- Lists of "this person's entries, newest first" are the main query.
create index if not exists portfolio_entries_profile_year_idx
  on public.portfolio_entries (profile_id, project_year desc, created_at desc);

drop trigger if exists portfolio_entries_set_updated_at on public.portfolio_entries;
create trigger portfolio_entries_set_updated_at
  before update on public.portfolio_entries
  for each row execute function public.set_updated_at();   -- function created in the Phase 2 migration

-- At most 30 entries per member, so nobody can fill the table with spam.
create or replace function public.enforce_portfolio_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.portfolio_entries where profile_id = new.profile_id) >= 30 then
    raise exception 'Portfolio limit reached: at most 30 entries per member.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists portfolio_entries_limit on public.portfolio_entries;
create trigger portfolio_entries_limit
  before insert on public.portfolio_entries
  for each row execute function public.enforce_portfolio_limit();

alter table public.portfolio_entries enable row level security;

drop policy if exists "Portfolio entries follow profile visibility" on public.portfolio_entries;
drop policy if exists "Members can add portfolio entries to their own profile" on public.portfolio_entries;
drop policy if exists "Members can edit their own portfolio entries" on public.portfolio_entries;
drop policy if exists "Members can delete their own portfolio entries" on public.portfolio_entries;

-- Anyone may read entries of PUBLIC profiles. Owners may always read their own.
create policy "Portfolio entries follow profile visibility"
  on public.portfolio_entries
  for select
  to anon, authenticated
  using (
    profile_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = portfolio_entries.profile_id and p.is_public
    )
  );

create policy "Members can add portfolio entries to their own profile"
  on public.portfolio_entries
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy "Members can edit their own portfolio entries"
  on public.portfolio_entries
  for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Members can delete their own portfolio entries"
  on public.portfolio_entries
  for delete
  to authenticated
  using (profile_id = (select auth.uid()));

-- Column-level privileges (second layer): an entry can never be handed to another member,
-- and nobody can edit created_at / updated_at.
revoke all on public.portfolio_entries from anon, authenticated;
grant select on public.portfolio_entries to anon, authenticated;
grant insert (profile_id, title, description, category, project_url, thumbnail_url, project_year)
  on public.portfolio_entries to authenticated;
grant update (title, description, category, project_url, thumbnail_url, project_year)
  on public.portfolio_entries to authenticated;
grant delete on public.portfolio_entries to authenticated;


-- ---------------------------------------------------------------------
-- 5. Storage: the "avatars" bucket
-- ---------------------------------------------------------------------
-- * Public bucket: profile pictures load by URL for everyone (needed for public profiles).
-- * 2 MB limit and JPEG / PNG / WebP only (no SVG: SVG files can carry scripts).
-- * Files live at   avatars/<member id>/<file name>   and members can only touch their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members can list their own avatar files" on storage.objects;
drop policy if exists "Members can upload their own avatar" on storage.objects;
drop policy if exists "Members can replace their own avatar" on storage.objects;
drop policy if exists "Members can delete their own avatar" on storage.objects;

-- Note: there is deliberately NO policy that lets visitors list the bucket. Picture URLs work
-- without one (public bucket), and listing would reveal the folders of private profiles.
create policy "Members can list their own avatar files"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Members can upload their own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Members can replace their own avatar"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Members can delete their own avatar"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
