import { supabase } from './supabase.js';

// ── Current session user ──────────────────────────────────────────────────────
let currentUser = null;
export function getCurrentUser() { return currentUser; }

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
    options: { emailRedirectTo: globalThis.location.origin },
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

// ── Settings sync ─────────────────────────────────────────────────────────────
export async function pushSettingsToCloud(settings) {
  if (!currentUser) return;
  await supabase.from('user_books').upsert({
    user_id:  currentUser.id,
    settings,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

export async function pullSettingsFromCloud() {
  if (!currentUser) return null;
  const { data, error } = await supabase
    .from('user_books')
    .select('settings')
    .eq('user_id', currentUser.id)
    .single();
  if (error || !data?.settings) return null;
  return data.settings;
}

export function buildSettings() {
  const year        = new Date().getFullYear();
  const goal        = localStorage.getItem(`libra-goal-${year}`);
  const apiKey      = localStorage.getItem('libra-claude-key');
  const streak      = localStorage.getItem('libra-streak');
  const displayName = localStorage.getItem('libra-display-name');
  const settings    = {};
  if (goal)        settings[`goal_${year}`] = goal;
  if (apiKey)      settings.claude_key      = apiKey;
  if (streak)      settings.streak          = streak;
  if (displayName) settings.display_name    = displayName;
  return settings;
}

export function applySettings(settings) {
  if (!settings || typeof settings !== 'object') return;
  const year = new Date().getFullYear();
  if (settings[`goal_${year}`]) localStorage.setItem(`libra-goal-${year}`, settings[`goal_${year}`]);
  if (settings.claude_key)      localStorage.setItem('libra-claude-key',   settings.claude_key);
  if (settings.streak)          localStorage.setItem('libra-streak',        settings.streak);
  if (settings.display_name)    localStorage.setItem('libra-display-name',  settings.display_name);
}
