-- ============================================================
-- Libra v1 — user_books table for vanilla JS sync
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.user_books (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_books enable row level security;

create policy "users own books"
  on public.user_books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_user_books_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger user_books_updated_at
  before update on public.user_books
  for each row execute function public.set_user_books_updated_at();
