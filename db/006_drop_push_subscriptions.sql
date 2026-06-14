-- ============================================================
-- Libra — drop push_subscriptions table
-- Web Push reminders were removed; this table is no longer used.
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

drop table if exists public.push_subscriptions;
