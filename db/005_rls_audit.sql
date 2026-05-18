-- ============================================================
-- Libra — RLS audit: assert user_books policy exists
-- The "users own books" FOR ALL policy covers all columns,
-- including the settings JSONB column added in 003 (which now
-- stores an AES-GCM encrypted claude_key, not plaintext).
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename  = 'user_books'
       and policyname = 'users own books'
  ) then
    raise exception 'RLS policy "users own books" is missing on public.user_books — re-run 002_user_books.sql';
  end if;
end;
$$;

comment on policy "users own books" on public.user_books is
  'Each user may only SELECT, INSERT, UPDATE, DELETE their own row. '
  'Covers all columns including settings (which stores an encrypted claude_key). '
  'Verified in migration 005.';
