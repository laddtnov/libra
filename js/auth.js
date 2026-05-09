import { supabase } from './supabase.js';

// ── Current session user ──────────────────────────────────────────────────────
export let currentUser = null;

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user ?? null;
  return currentUser;
}

export function onAuthChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    callback(currentUser);
  });
}

// ── Magic link ────────────────────────────────────────────────────────────────
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  return error;
}

// ── Sign out ──────────────────────────────────────────────────────────────────
export async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
}

// ── Cloud sync ────────────────────────────────────────────────────────────────
export async function pushBooksToCloud(booksData) {
  if (!currentUser) return;
  await supabase.from('user_books').upsert({
    user_id:    currentUser.id,
    data:       booksData,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

export async function pullBooksFromCloud() {
  if (!currentUser) return null;
  const { data, error } = await supabase
    .from('user_books')
    .select('data, updated_at')
    .eq('user_id', currentUser.id)
    .single();
  if (error || !data) return null;
  return data.data;
}
