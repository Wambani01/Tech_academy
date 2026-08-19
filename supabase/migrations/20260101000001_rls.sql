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
