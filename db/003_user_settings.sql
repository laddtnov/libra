-- ============================================================
-- Libra — add settings column to user_books
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

alter table public.user_books
  add column if not exists settings jsonb not null default '{}';
