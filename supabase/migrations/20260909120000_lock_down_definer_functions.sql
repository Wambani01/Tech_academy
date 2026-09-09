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
