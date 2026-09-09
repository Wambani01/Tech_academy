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
