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
