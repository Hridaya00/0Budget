-- =====================================================================
-- 0Budget - Phase 2: profiles table, automatic profile creation, RLS
-- =====================================================================
-- Run this once in the Supabase SQL Editor (or with `supabase db push`).
--
-- Privacy note: this table is PUBLICLY READABLE (creator profiles are meant to be
-- discoverable). It therefore holds NO private data. The user's email address stays in
-- Supabase's own auth.users table, which the browser can never read for other people.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------
create table public.profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  full_name            text        not null,
  username             text,
  account_type         text        not null default 'filmmaker',
  organisation_name    text,
  location             text,
  bio                  text,
  skills               text[]      not null default '{}',
  interests            text[]      not null default '{}',
  avatar_url           text,
  -- true once the person has finished OR skipped onboarding (so we only prompt once)
  onboarding_completed boolean     not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint profiles_username_key unique (username),
  constraint profiles_full_name_length check (char_length(btrim(full_name)) between 2 and 80),
  constraint profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  constraint profiles_account_type_valid check (account_type in (
    'filmmaker', 'director', 'screenwriter', 'actor', 'cinematographer',
    'video_editor', 'musician', 'photographer', 'film_student', 'production_company'
  )),
  constraint profiles_organisation_name_length check (
    organisation_name is null or char_length(btrim(organisation_name)) between 2 and 100
  ),
  -- a production company must name its organisation
  constraint profiles_company_needs_organisation check (
    account_type <> 'production_company' or organisation_name is not null
  ),
  constraint profiles_location_length check (location is null or char_length(location) <= 100),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),
  constraint profiles_skills_limit check (
    cardinality(skills) <= 20 and char_length(array_to_string(skills, ',')) <= 800
  ),
  constraint profiles_interests_limit check (
    cardinality(interests) <= 20 and char_length(array_to_string(interests, ',')) <= 800
  ),
  -- https only, so a profile can never hold a "javascript:" style link
  constraint profiles_avatar_url_valid check (
    avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 500)
  )
);

comment on table public.profiles is 'Public creator/organisation profiles. Contains no private data (no email).';

-- ---------------------------------------------------------------------
-- 2. Keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Secure, automatic profile creation
-- ---------------------------------------------------------------------
-- The browser can NOT insert into profiles (no INSERT policy or grant exists).
-- Instead, a database trigger creates exactly one profile whenever Supabase Auth creates a user.
-- The sign-up form passes full_name / account_type / organisation_name as user metadata. That
-- metadata is controlled by the visitor, so every value is validated here before it is used.

create or replace function public.create_profile_for_user(p_id uuid, p_email text, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(p_meta, '{}'::jsonb);
  v_name text  := left(btrim(coalesce(v_meta ->> 'full_name', '')), 80);
  v_type text  := coalesce(v_meta ->> 'account_type', '');
  v_org  text  := left(btrim(coalesce(v_meta ->> 'organisation_name', '')), 100);
begin
  -- Name: use the supplied one, else the part of the email before "@", else a neutral fallback.
  if char_length(v_name) < 2 then
    v_name := left(btrim(split_part(coalesce(p_email, ''), '@', 1)), 80);
  end if;
  if char_length(v_name) < 2 then
    v_name := 'New member';
  end if;

  -- Account type: anything unknown becomes "filmmaker" (never trust metadata).
  if v_type not in (
    'filmmaker', 'director', 'screenwriter', 'actor', 'cinematographer',
    'video_editor', 'musician', 'photographer', 'film_student', 'production_company'
  ) then
    v_type := 'filmmaker';
  end if;

  -- Organisation name only applies to production companies.
  if v_type <> 'production_company' or char_length(v_org) < 2 then
    v_org := null;
  end if;

  if v_type = 'production_company' and v_org is null then
    raise exception 'An organisation name is required for production company accounts.'
      using errcode = '23514';
  end if;

  -- "on conflict do nothing" guarantees a user can never end up with two profiles.
  insert into public.profiles (id, full_name, account_type, organisation_name)
  values (p_id, v_name, v_type, v_org)
  on conflict (id) do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.create_profile_for_user(new.id, new.email, new.raw_user_meta_data);
  return new;
end;
$$;

-- These functions run with elevated rights, so nobody may call them directly from the browser
-- (Supabase would otherwise expose them as API functions).
revoke all on function public.create_profile_for_user(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Back-fill: any user who signed up before this migration gets a profile too.
do $$
declare
  u record;
begin
  for u in
    select au.id, au.email, au.raw_user_meta_data
    from auth.users au
    where not exists (select 1 from public.profiles p where p.id = au.id)
  loop
    begin
      perform public.create_profile_for_user(u.id, u.email, u.raw_user_meta_data);
    exception when others then
      -- Never let one odd old account block the whole migration.
      raise warning 'Could not back-fill profile for user %: %', u.id, sqlerrm;
    end;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Anyone (including visitors who are not logged in) can read public profiles.
create policy "Profiles are publicly readable"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- A logged-in user can update ONLY their own row, and cannot hand it to someone else.
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- There is deliberately NO insert policy and NO delete policy:
--   * profiles are created only by the trigger above;
--   * profiles are removed only when the auth user is deleted (on delete cascade).

-- ---------------------------------------------------------------------
-- 5. Column-level privileges (second layer of protection)
-- ---------------------------------------------------------------------
revoke all on public.profiles from anon, authenticated;

grant select on public.profiles to anon, authenticated;

-- Users may change only these columns. They can never change id, created_at or updated_at.
grant update (
  full_name, username, account_type, organisation_name, location, bio,
  skills, interests, avatar_url, onboarding_completed
) on public.profiles to authenticated;
