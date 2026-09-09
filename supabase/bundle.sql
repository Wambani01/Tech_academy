-- Tech Lab Academy — full provisioning bundle
-- Generated from supabase/migrations/ + supabase/seed.sql by scripts/build-bundle.mjs.
-- Do not edit by hand — run `npm run bundle` instead.
-- Paste the whole file into the Supabase SQL editor and Run, once, on a
-- fresh project. It is NOT idempotent: the enum and table creates fail on
-- a second run. To start over, run: drop schema public cascade;
--                                   create schema public;

begin;

-- ====================================================================
-- step 1  —  20260101000000_schema.sql
-- ====================================================================
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

-- ====================================================================
-- step 2  —  20260101000001_rls.sql
-- ====================================================================
-- Tech Lab Academy — row-level security
-- Run after 01-schema.sql.

-- role helper: security definer so policies never recurse into profiles
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_instructor_of(course uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1
    from courses c
    join instructors i on i.id = c.lead_instructor_id
    where c.id = course and i.profile_id = auth.uid()
  );
$$;

alter table profiles        enable row level security;
alter table instructors     enable row level security;
alter table courses         enable row level security;
alter table modules         enable row level security;
alter table lessons         enable row level security;
alter table enrollments     enable row level security;
alter table lesson_progress enable row level security;
alter table assignments     enable row level security;
alter table submissions     enable row level security;
alter table certificates    enable row level security;
alter table events          enable row level security;
alter table registrations   enable row level security;
alter table media_assets    enable row level security;
alter table pages           enable row level security;
alter table page_blocks     enable row level security;
alter table faqs            enable row level security;
alter table enquiries       enable row level security;
alter table payments        enable row level security;

-- public reads ---------------------------------------------------------
create policy pub_courses on courses for select
  using (status = 'published' or is_admin());

create policy pub_modules on modules for select
  using (exists (select 1 from courses c where c.id = course_id
                 and (c.status = 'published' or is_admin())));

create policy pub_lessons on lessons for select
  using (exists (select 1 from modules m join courses c on c.id = m.course_id
                 where m.id = module_id and (c.status = 'published' or is_admin())));

create policy pub_instructors on instructors for select using (true);
create policy pub_events      on events      for select using (status <> 'cancelled' or is_admin());
create policy pub_faqs        on faqs        for select using (is_live or is_admin());
create policy pub_pages       on pages       for select using (status = 'published' or is_admin());
create policy pub_blocks      on page_blocks for select
  using (exists (select 1 from pages p where p.id = page_id
                 and (p.status = 'published' or is_admin())));
create policy pub_media       on media_assets for select using (true);

-- own rows -------------------------------------------------------------
create policy own_profile_read   on profiles for select using (id = auth.uid() or is_admin());
create policy own_profile_write  on profiles for update using (id = auth.uid() or is_admin());

create policy own_enrolments on enrollments for select
  using (profile_id = auth.uid() or is_admin() or is_instructor_of(course_id));

create policy own_progress_all on lesson_progress for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy own_certificates on certificates for select
  using (profile_id = auth.uid() or is_admin());

create policy own_registrations on registrations for select
  using (profile_id = auth.uid() or is_admin());
create policy insert_registration on registrations for insert with check (true);

create policy read_assignments on assignments for select
  using (
    is_admin() or is_instructor_of(course_id)
    or exists (select 1 from enrollments e
               where e.course_id = assignments.course_id and e.profile_id = auth.uid())
  );

create policy own_submissions_read on submissions for select
  using (profile_id = auth.uid() or is_admin()
         or exists (select 1 from assignments a
                    where a.id = assignment_id and is_instructor_of(a.course_id)));

create policy own_submissions_write on submissions for insert
  with check (profile_id = auth.uid());
create policy own_submissions_update on submissions for update
  using (profile_id = auth.uid()
         or is_admin()
         or exists (select 1 from assignments a
                    where a.id = assignment_id and is_instructor_of(a.course_id)));

-- enquiries: anyone may submit, only staff may read
create policy insert_enquiry on enquiries for insert with check (true);
create policy read_enquiries on enquiries for select using (is_admin());

-- admin write-everything ----------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['instructors','courses','modules','lessons','events',
                           'media_assets','pages','page_blocks','faqs','assignments',
                           'enrollments','certificates']
  loop
    execute format(
      'create policy admin_all_%1$s on %1$I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- payments: no client access at all. Service role bypasses RLS.
create policy payments_admin_read on payments for select using (is_admin());

-- ====================================================================
-- step 3  —  20260101000002_definer_search_path.sql
-- ====================================================================
-- Pin search_path on the security-definer functions.
--
-- `is_admin`, `is_instructor_of` and `handle_new_user` run as their owner. With
-- an unpinned search_path a caller can prepend a schema of their own and shadow
-- `profiles` / `courses` / `instructors`, so the helper reads attacker-supplied
-- rows while still holding owner rights. `is_admin()` gates every admin RLS
-- policy in 20260101000001_rls.sql, which makes this the widest blast radius in
-- the schema. Supabase's own database linter flags all three
-- (`function_search_path_mutable`).

alter function is_admin()                   set search_path = public, pg_temp;
alter function is_instructor_of(uuid)       set search_path = public, pg_temp;
alter function handle_new_user()            set search_path = public, pg_temp;

-- ====================================================================
-- step 4  —  20260909120000_lock_down_definer_functions.sql
-- ====================================================================
-- Finish the search_path pinning that 20260101000002 started.
--
-- `touch_updated_at` was left out of that migration. It is the one trigger
-- function in the schema that is NOT security definer, so the blast radius is
-- far smaller than `is_admin` — but it is inconsistent to pin three of four
-- functions, and Supabase's database linter keeps reporting the fourth
-- (`function_search_path_mutable`), which trains you to ignore the report.
--
-- Also drops the redundant explicit EXECUTE grants on the three security-definer
-- functions. These were never what made the functions callable — Postgres grants
-- EXECUTE to PUBLIC by default, and `anon` / `authenticated` were inheriting it
-- from there. Removing the explicit grants changes nothing on its own; the RPC
-- endpoints are closed in 20260909130000 by moving the functions out of the
-- API-exposed schema, which is the only fix that works. Kept as a separate step
-- so the two concerns stay legible in the history.

alter function touch_updated_at() set search_path = public, pg_temp;

revoke execute on function public.is_admin()             from anon, authenticated;
revoke execute on function public.is_instructor_of(uuid) from anon, authenticated;
revoke execute on function public.handle_new_user()      from anon, authenticated;

-- ====================================================================
-- step 5  —  20260909130000_move_helpers_out_of_api_schema.sql
-- ====================================================================
-- Close the RPC endpoints on the security-definer helpers.
--
-- All four helper functions lived in `public`, which PostgREST exposes, so anon
-- and authenticated could POST to /rest/v1/rpc/is_admin,
-- /rest/v1/rpc/is_instructor_of and /rest/v1/rpc/handle_new_user. None of them
-- is meant to be called by a client: three serve RLS policies, one serves a
-- trigger. `handle_new_user` is the worst of it — security definer, runs as its
-- owner, and writes to `profiles`.
--
-- The obvious fix does not work. Revoking EXECUTE (from PUBLIC, which is where
-- the grant actually comes from) breaks RLS: policy expressions ARE permission-
-- checked against the querying role, so `select from enquiries` as
-- `authenticated` fails with
--
--     ERROR: 42501: permission denied for function is_admin
--
-- because `read_enquiries` is `using (is_admin())` with no other condition to
-- short-circuit to. Verified directly against this database.
--
-- So move them instead. A schema outside PostgREST's exposed list has no RPC
-- endpoint, while EXECUTE stays intact so policies keep working. Verified before
-- applying, all inside a rolled-back transaction:
--
--   * Policies survive the move. They store function OIDs, not names, so
--     `alter function ... set schema` does not invalidate them: as
--     `authenticated`, courses still returned 6 rows and enquiries/assignments
--     evaluated without error.
--   * on_auth_user_created still fires — inserting an auth.users row created the
--     matching profile with the moved `handle_new_user`.
--   * The touch triggers still fire — an update writing a deliberately stale
--     `updated_at = '2000-01-01'` came back as the current timestamp, so the
--     moved `touch_updated_at` overwrote it.
--
-- `search_path = public, pg_temp` on these functions stays correct: the tables
-- they read (profiles, courses, instructors) remain in `public`.
--
-- Do NOT add `private` to the project's exposed schemas — that would undo this.

create schema if not exists private;

-- USAGE only. It lets the roles reach the functions they already hold EXECUTE
-- on; it does not grant access to anything else placed in the schema later.
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_admin()             set schema private;
alter function public.is_instructor_of(uuid) set schema private;
alter function public.handle_new_user()      set schema private;
alter function public.touch_updated_at()     set schema private;

-- ====================================================================
-- step 6  —  seed.sql
-- ====================================================================
-- Tech Lab Academy — seed data lifted from the prototypes.
-- Run after 02-rls.sql, as the service role (bypasses RLS).

insert into instructors (full_name, email, track, role_title, bio, position) values
  ('Sarah Kamau',    'sarah.kamau@techlabacademy.co',   'Marketing',  'Lead Instructor',  '10+ years in growth and performance marketing across East Africa.', 1),
  ('Tom Odhiambo',   'tom.odhiambo@techlabacademy.co',  'Design',     'Lead Instructor',  'Brand and product designer; formerly in-house at two Nairobi studios.', 2),
  ('Linda Nyambura', 'linda.n@techlabacademy.co',       'Development','Lead Instructor',  'Full-stack engineer teaching the fundamentals the modern way.', 3),
  ('Eric Mutua',     'eric.mutua@techlabacademy.co',    'Automation', 'Lead Instructor',  'Builds internal tools and automations for ops teams.', 4),
  ('Rita Njeri',     'rita.njeri@techlabacademy.co',    'Marketing',  'Guest Instructor', 'Performance marketer specialising in paid social.', 5),
  ('Mercy Wanjiru',  'mercy.w@techlabacademy.co',       'Design',     'Guest Instructor', 'Visual systems designer and illustrator.', 6);

insert into courses (slug, title, track, level, blurb, duration, price_kes, status) values
  ('ai-powered-content-campaigns',   'AI-Powered Content & Campaigns',    'Marketing',  'Beginner',     'Plan, write and automate content and ad campaigns using modern AI tools.', '6 weeks · Cohort',  15000, 'published'),
  ('performance-marketing-analytics','Performance Marketing & Analytics', 'Marketing',  'Intermediate', 'Run paid campaigns and read the data that actually moves budget decisions.', '8 weeks · Cohort', 18000, 'published'),
  ('brand-visual-systems',           'Brand & Visual Systems',            'Design',     'Beginner',     'Build cohesive brand identities and design systems from scratch.', '6 weeks · Cohort',  15000, 'published'),
  ('product-design-with-ai',         'Product Design with AI Tools',      'Design',     'Intermediate', 'Wireframe, prototype and ship UX using AI-assisted design workflows.', '8 weeks · Cohort', 18000, 'draft'),
  ('web-development-foundations',    'Web Development Foundations',       'Development','Beginner',     'HTML, CSS and JavaScript fundamentals, built the modern way.', '10 weeks · Cohort', 22000, 'published'),
  ('ai-assisted-app-development',    'AI-Assisted App Development',       'Development','Advanced',     'Ship full-stack apps faster with AI pair-programming tools.', '10 weeks · Cohort', 25000, 'published'),
  ('no-code-workflow-automation',    'No-Code Workflow Automation',       'Automation', 'Beginner',     'Automate repetitive work and connect tools without writing code.', '4 weeks · Cohort', 12000, 'published'),
  ('internal-tools-for-ops',         'Internal Tools for Ops Teams',      'Automation', 'Intermediate', 'Build lightweight internal tools that replace spreadsheets and email.', '6 weeks · Cohort', 15000, 'draft');

insert into events (slug, title, track, format, starts_at, capacity, description, status) values
  ('ai-campaign-automation-90',  'AI Campaign Automation in 90 Minutes',  'Marketing',  'Online, Live', '2026-07-14 18:00+03', 300, 'A hands-on session on automating campaign workflows with AI.', 'past'),
  ('brand-system-with-ai',       'Building a Brand System with AI Tools', 'Design',     'Online, Live', '2026-07-28 18:00+03', 250, 'From moodboard to type scale in one sitting.', 'past'),
  ('shipping-faster-ai-coding',  'Shipping Faster with AI Pair-Coding',   'Development','Online, Live', '2026-08-09 18:00+03', 200, 'Live build: an app in ninety minutes.', 'past'),
  ('no-code-small-teams',        'No-Code Tools for Small Teams',         'Automation', 'Hybrid',       '2026-08-21 18:00+03', 150, 'Replace three spreadsheets with one workflow.', 'past'),
  ('portfolio-reviews-live-q4',  'Portfolio Reviews Live',               'Design',     'Online, Live', '2026-09-24 18:00+03', 180, 'Bring work in progress; leave with notes.', 'upcoming'),
  ('content-strategy-2027',      'Content Strategy for 2027',            'Marketing',  'Online, Live', '2026-10-08 18:00+03', 300, 'What is changing in search and social next year.', 'upcoming');

-- FAQ collection, in display order
insert into faqs (position, question, answer, category, is_live) values
  (1, 'Do I need any experience to start?', 'No. Every track has a beginner cohort that starts from first principles. If you already work in the field, the intermediate and advanced cohorts skip the basics.', 'Programs', true),
  (2, 'How much time should I set aside each week?', 'Plan for six to eight hours: two live sessions plus project work you can schedule around a job.', 'Programs', true),
  (3, 'Can I pay in instalments?', 'Yes. Cohort fees can be split across the length of the programme, paid by M-Pesa, card or bank transfer. Ask admissions before you enrol.', 'Payments', true),
  (4, 'What is your refund policy?', 'Full refund up to seven days before your cohort starts, and a pro-rata refund in the first two weeks.', 'Payments', true),
  (5, 'Do I get a certificate?', 'Every completed programme issues a verifiable certificate with a public link you can add to LinkedIn or a CV.', 'Certificates', true),
  (6, 'How long do I keep access to the material?', 'Lifetime access to lesson recordings, templates and resources for any programme you complete.', 'Campus', true),
  (7, 'Are sessions online or in person?', 'Most cohorts run online with live sessions. Selected programmes add optional in-person studio days in Nairobi.', 'Campus', true),
  (8, 'Do you help with job placement?', 'We run portfolio reviews and introduce strong graduates to hiring partners, but we do not guarantee placement.', 'Programs', false);

-- media: the real Cloudinary ids, namespaced under tech-lab-academy/ because the
-- product environment is shared with another project. `folder` stays the bare
-- category — it drives the filter pills in the admin media library, not delivery.
-- Dimensions and byte sizes are the uploaded originals.
insert into media_assets (public_id, filename, folder, width, height, bytes, alt) values
  ('tech-lab-academy/marketing/hero-classroom-daylight', 'hero-classroom-daylight.png', 'marketing', 2560, 1440, 4138160, 'Sunlit classroom with students working at laptops'),
  ('tech-lab-academy/marketing/cohort-classroom',        'cohort-classroom.png',        'marketing', 2560, 1440, 5564876, 'A cohort working around a shared table'),
  ('tech-lab-academy/courses/track-ai-marketing',        'track-ai-marketing.png',      'courses',   2560, 1440, 4849825, 'Marketer reviewing a campaign dashboard'),
  ('tech-lab-academy/courses/track-brand-design',        'track-brand-design.png',      'courses',   2560, 1440, 5450515, 'Brand colour swatches on a desk'),
  ('tech-lab-academy/courses/track-development',         'track-development.png',       'courses',   2560, 1440, 3894596, 'Two developers pair-programming'),
  ('tech-lab-academy/courses/track-automation',          'track-automation.png',        'courses',   2560, 1440, 4102590, 'Workflow cards mapped on a glass board'),
  ('tech-lab-academy/marketing/business-team-training',  'business-team-training.png',  'marketing', 2496, 1664, 5763877, 'A team in a private training session'),
  ('tech-lab-academy/marketing/campus-evening-study',    'campus-evening-study.png',    'marketing', 2496, 1664, 6016109, 'Student studying at home in the evening'),
  ('tech-lab-academy/marketing/campus-exterior',         'campus-exterior.png',         'marketing', 2304, 1728, 7112653, 'Academy building at golden hour'),
  ('tech-lab-academy/people/instructor-sarah',           'instructor-sarah.png',        'people',    2304, 1728, 4622025, 'Portrait of an instructor in a classroom'),
  ('tech-lab-academy/people/instructor-tom',             'instructor-tom.png',          'people',    2304, 1728, 5153361, 'Portrait of an instructor in a studio'),
  ('tech-lab-academy/people/students-whiteboard',        'students-whiteboard.png',     'people',    2304, 1728, 5987145, 'Students at a whiteboard'),
  ('tech-lab-academy/courses/course-workspace',          'course-workspace.png',        'courses',   2560, 1440, 2671891, 'Course workspace still life');

-- pages + blocks. fields payloads mirror the block registry.
insert into pages (slug, title, status, published_at) values
  ('home',     'Homepage',        'published', now()),
  ('about',    'About',           'published', now()),
  ('business', 'For Business',    'published', now()),
  ('campus',   'Digital Campus',  'published', now()),
  ('events',   'Events',          'published', now());

-- page_blocks: the complete set for every seeded page. Payloads mirror the
-- block registry in cms/block-registry.md and lib/cms/schemas.ts.

-- Homepage ------------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'East Africa''s Practical Tech Academy',
         'headline', 'Learn the skills that get you hired & paid.',
         'sub',      'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.',
         'cta1',     'Browse Programs',
         'cta2',     'For Teams'),
       m.id,
       'Sunlit classroom with students working at laptops'
from pages p, media_assets m
where p.slug = 'home' and m.public_id = 'tech-lab-academy/marketing/hero-classroom-daylight';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'stats', jsonb_build_object(
         's1', '2,400+ · Trained',
         's2', '4.9★ · Avg rating',
         's3', '35+ · Programs',
         's4', '100% · Hands-on')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 3, 'tracks', jsonb_build_object(
         'title', 'Pick your track',
         't1', 'AI Marketing',
         'b1', 'Campaigns, content & analytics with AI.',
         't2', 'Brand & Product Design',
         'b2', 'Visual systems & AI creative flow.',
         't3', 'Web & App Development',
         'b3', 'Modern stacks, AI pair-coding.',
         't4', 'No-Code Automation',
         'b4', 'Internal tools, zero heavy code.'),
       m.id,
       'Marketer reviewing a campaign dashboard'
from pages p, media_assets m
where p.slug = 'home' and m.public_id = 'tech-lab-academy/courses/track-ai-marketing';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 4, 'steps', jsonb_build_object(
         'title', 'Five steps to a provable skill',
         'step1', 'Enroll',
         'step2', 'Learn by doing',
         'step3', 'Apply it',
         'step4', 'Get certified',
         'step5', 'Keep growing')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 5, 'proof', jsonb_build_object(
         'title',  'What graduates say',
         'quote1', 'I came in able to run ads and left able to explain why they worked. The campaign brief from week four got me the job.',
         'attr1',  'Marketing cohort, 2026',
         'quote2', 'The assignments were real client work in disguise. My portfolio tripled in six weeks.',
         'attr2',  'Design cohort, 2026',
         'quote3', 'Pair-coding with AI properly — not just autocomplete. I ship features I would have quoted a month for.',
         'attr3',  'Development cohort, 2026')
from pages p where p.slug = 'home';

-- The questions themselves live in `faqs`; only the heading is stored here.
insert into page_blocks (page_id, position, kind, fields)
select p.id, 6, 'faq', jsonb_build_object(
         'title', 'Questions people ask before enrolling',
         'intro', 'Everything about cohorts, payment and certificates. Still unsure? Talk to admissions.')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 7, 'cta', jsonb_build_object(
         'title', 'For Individuals',
         'btn',   'Browse All Courses')
from pages p where p.slug = 'home';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 8, 'meta', jsonb_build_object(
         'title', 'Tech Lab Academy — practical tech training in Nairobi',
         'desc',  'Cohort-based programs in marketing, design, development and AI tools — real projects, real feedback, real portfolio.')
from pages p where p.slug = 'home';

-- About ---------------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'About Us',
         'headline', 'We built the academy we wished existed.',
         'sub',      'Most training teaches tools in isolation. We pair strategy with hands-on practice, so every graduate leaves with judgment, not just button-pushing skills — and a portfolio to prove it.',
         'cta1',     '',
         'cta2',     '')
from pages p where p.slug = 'about';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'stats', jsonb_build_object(
         's1', '2019 · Founded',
         's2', '2,400+ · Graduates',
         's3', '35+ · Programs run',
         's4', '18 · Instructors')
from pages p where p.slug = 'about';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 3, 'meta', jsonb_build_object(
         'title', 'About Tech Lab Academy',
         'desc',  'A small, senior team of instructors across marketing, design, development and automation.')
from pages p where p.slug = 'about';

-- For Business --------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'For Teams & Organisations',
         'headline', 'Upskill your whole team in AI-first ways of working.',
         'sub',      'Structured, cohort-based training for marketing, design, dev and ops teams — built around your stack, your tools, and your timeline.',
         'cta1',     'Book a Team Demo',
         'cta2',     ''),
       m.id,
       'A team in a private training session'
from pages p, media_assets m
where p.slug = 'business' and m.public_id = 'tech-lab-academy/marketing/business-team-training';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'stats', jsonb_build_object(
         's1', '3× · Speed',
         's2', '40+ · Orgs',
         's3', '4–12wk · Cohort',
         's4', '')
from pages p where p.slug = 'business';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 3, 'meta', jsonb_build_object(
         'title', 'Corporate training — Tech Lab Academy',
         'desc',  'Custom cohorts for marketing, design, dev and ops teams, built around your stack and goals.')
from pages p where p.slug = 'business';

-- Digital Campus ------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields, image_id, image_alt)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'Digital Campus',
         'headline', 'Learn anywhere, apply everywhere.',
         'sub',      'Video lessons, templates and community from any device — with structured milestones so you actually finish.',
         'cta1',     'Explore Campus',
         'cta2',     ''),
       m.id,
       'Student studying at home in the evening'
from pages p, media_assets m
where p.slug = 'campus' and m.public_id = 'tech-lab-academy/marketing/campus-evening-study';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'meta', jsonb_build_object(
         'title', 'Digital Campus — Tech Lab Academy',
         'desc',  'Video lessons, templates and community from any device, with structured milestones.')
from pages p where p.slug = 'campus';

-- Events --------------------------------------------------------------
insert into page_blocks (page_id, position, kind, fields)
select p.id, 1, 'hero', jsonb_build_object(
         'eyebrow',  'Masterclasses & Events',
         'headline', 'Live sessions with people doing the work right now.',
         'sub',      'One-off masterclasses and short workshops — no long-term commitment, straight to the point.',
         'cta1',     '',
         'cta2',     '')
from pages p where p.slug = 'events';

insert into page_blocks (page_id, position, kind, fields)
select p.id, 2, 'meta', jsonb_build_object(
         'title', 'Masterclasses & events — Tech Lab Academy',
         'desc',  'One-off masterclasses and short workshops with practitioners.')
from pages p where p.slug = 'events';

-- Curriculum for the flagship course, matching the course detail page.
insert into modules (course_id, position, title, duration)
select c.id, v.position, v.title, v.duration
from courses c,
     (values (1, 'Why AI + Strategy Beats Tools Alone', '45 min'),
             (2, 'Building Your Content Calendar',      '1h 10m'),
             (3, 'AI Drafting Without Losing Your Voice','55 min'),
             (4, 'Campaign Brief: Product Launch',      '1h 30m'),
             (5, 'Measuring What Matters',              '50 min'),
             (6, 'Scaling Your Workflow',               '40 min'))
       as v(position, title, duration)
where c.slug = 'ai-powered-content-campaigns';

-- One lesson per module so the player has something to render.
insert into lessons (module_id, position, title, kind)
select m.id, 1, m.title, 'video'
from modules m
join courses c on c.id = m.course_id
where c.slug = 'ai-powered-content-campaigns';

-- Link each course to the lead instructor for its track.
update courses c
set lead_instructor_id = i.id
from instructors i
where i.track = c.track and i.role_title = 'Lead Instructor';

commit;