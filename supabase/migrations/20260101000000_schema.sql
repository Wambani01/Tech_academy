-- Tech Lab Academy — schema
-- Supabase / Postgres. Run before 02-rls.sql.

create extension if not exists "pgcrypto";

create type user_role      as enum ('student','instructor','admin');
create type course_status  as enum ('draft','published','archived');
create type enrol_status   as enum ('active','completed','cancelled');
create type submit_status  as enum ('pending','submitted','graded');
create type event_status   as enum ('upcoming','past','cancelled');
create type page_status    as enum ('draft','published');
create type block_kind     as enum ('hero','stats','tracks','steps','proof','faq','cta','meta');
create type enquiry_status as enum ('new','contacted','enrolled','closed');

-- people ---------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null,
  email       text not null unique,
  role        user_role not null default 'student',
  track       text,
  avatar_id   text,                       -- cloudinary public_id
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table instructors (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references profiles on delete set null,
  full_name   text not null,
  email       text not null,
  track       text not null,
  role_title  text not null default 'Lead Instructor',
  bio         text,
  photo_id    text,
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- catalogue ------------------------------------------------------------
create table courses (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  track               text not null,
  level               text not null,
  blurb               text not null,
  description         text,
  duration            text not null,          -- '6 weeks · Cohort'
  price_kes           int  not null default 0,
  lead_instructor_id  uuid references instructors on delete set null,
  hero_id             text,
  status              course_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index on courses (track) where status = 'published';

create table modules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses on delete cascade,
  position    int  not null,
  title       text not null,
  duration    text,
  unique (course_id, position)
);

create table lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules on delete cascade,
  position    int  not null,
  title       text not null,
  kind        text not null default 'video',  -- video | reading | exercise
  video_id    text,                           -- cloudinary public_id
  duration_s  int,
  body        text,
  unique (module_id, position)
);

-- learning -------------------------------------------------------------
create table enrollments (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profiles on delete cascade,
  course_id     uuid not null references courses on delete cascade,
  progress_pct  int  not null default 0 check (progress_pct between 0 and 100),
  status        enrol_status not null default 'active',
  enrolled_at   timestamptz not null default now(),
  unique (profile_id, course_id)
);

create table lesson_progress (
  profile_id   uuid not null references profiles on delete cascade,
  lesson_id    uuid not null references lessons on delete cascade,
  completed_at timestamptz,
  primary key (profile_id, lesson_id)
);

create table assignments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses on delete cascade,
  title       text not null,
  brief       text,
  due_at      timestamptz,
  position    int not null default 0
);

create table submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references assignments on delete cascade,
  profile_id     uuid not null references profiles on delete cascade,
  body           text,
  file_id        text,
  status         submit_status not null default 'pending',
  score          int check (score between 0 and 100),
  feedback       text,
  submitted_at   timestamptz,
  graded_at      timestamptz,
  unique (assignment_id, profile_id)
);

create table certificates (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles on delete cascade,
  course_id   uuid not null references courses on delete cascade,
  serial      text not null unique,
  issued_at   timestamptz not null default now(),
  unique (profile_id, course_id)
);

-- events ---------------------------------------------------------------
create table events (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  track        text not null,
  format       text not null default 'Online, Live',
  starts_at    timestamptz not null,
  capacity     int,
  description  text,
  hero_id      text,
  status       event_status not null default 'upcoming',
  created_at   timestamptz not null default now()
);

create table registrations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events on delete cascade,
  profile_id  uuid references profiles on delete cascade,
  name        text,
  email       text,
  created_at  timestamptz not null default now()
);

-- cms ------------------------------------------------------------------
create table media_assets (
  id          uuid primary key default gen_random_uuid(),
  public_id   text not null unique,        -- cloudinary
  filename    text not null,
  folder      text not null default 'marketing',
  width       int,
  height      int,
  bytes       int,
  alt         text,
  created_at  timestamptz not null default now()
);

create table pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  status        page_status not null default 'draft',
  published_at  timestamptz,
  updated_by    uuid references profiles on delete set null,
  updated_at    timestamptz not null default now()
);

create table page_blocks (
  id            uuid primary key default gen_random_uuid(),
  page_id       uuid not null references pages on delete cascade,
  position      int  not null,
  kind          block_kind not null,
  fields        jsonb not null default '{}',   -- live
  draft_fields  jsonb,                          -- null = no pending edit
  image_id      uuid references media_assets on delete set null,
  image_alt     text,
  updated_by    uuid references profiles on delete set null,
  updated_at    timestamptz not null default now(),
  unique (page_id, position)
);

create table faqs (
  id          uuid primary key default gen_random_uuid(),
  position    int  not null,
  question    text not null,
  answer      text not null,
  category    text not null default 'Programs',
  is_live     boolean not null default true,
  updated_by  uuid references profiles on delete set null,
  updated_at  timestamptz not null default now()
);

-- enquiries (v1 replaces payments) -------------------------------------
create table enquiries (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references courses on delete set null,
  profile_id  uuid references profiles on delete set null,
  full_name   text not null,
  email       text not null,
  phone       text,
  message     text,
  status      enquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

-- v2: payments. Written by webhooks with the service role only.
create table payments (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references profiles on delete set null,
  course_id     uuid references courses on delete set null,
  provider      text not null,             -- mpesa | stripe
  provider_ref  text,
  amount_kes    int  not null,
  status        text not null default 'pending',
  raw           jsonb,
  created_at    timestamptz not null default now()
);

-- housekeeping ---------------------------------------------------------
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','instructors','courses','pages','page_blocks','faqs']
  loop
    execute format(
      'create trigger %I_touch before update on %I
       for each row execute function touch_updated_at()', t, t);
  end loop;
end $$;

-- create a profile whenever an auth user appears
create or replace function handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
