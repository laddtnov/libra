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
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user ?? null;
    callback(currentUser, event);
  });
}

// ── Password reset ────────────────────────────────────────────────────────────
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${globalThis.location.origin}?reset=1`,
  });
  return error;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error;
}

// Establish recovery session from hash tokens (needed when user is already signed in)
export async function establishRecoverySession() {
  const hash  = new URLSearchParams(globalThis.location.hash.replace('#', ''));
  const at    = hash.get('access_token');
  const rt    = hash.get('refresh_token');
  if (!at || !rt) return false;
  const { error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
  return !error;
}

// ── Email + password auth ─────────────────────────────────────────────────────
export async function signUpWithPassword(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  return error;
}

export async function signInWithPassword(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
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
  const payload = { ...settings };
  if (payload.claude_key) {
    payload.claude_key = await _encryptKey(currentUser.id, payload.claude_key);
  }
  await supabase.from('user_books').upsert({
    user_id:    currentUser.id,
    settings:   payload,
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
  const s = { ...data.settings };
  if (s.claude_key) {
    s.claude_key = await _decryptKey(currentUser.id, s.claude_key) ?? s.claude_key;
  }
  return s;
}

export function buildSettings() {
  const year        = new Date().getFullYear();
  const goal        = localStorage.getItem(`libra-goal-${year}`);
  const genreGoals  = localStorage.getItem(`libra-genre-goals-${year}`);
  const apiKey      = localStorage.getItem('libra-claude-key');
  const streak      = localStorage.getItem('libra-streak');
  const displayName = localStorage.getItem('libra-display-name');
  const settings    = {};
  if (goal)        settings[`goal_${year}`]        = goal;
  if (genreGoals)  settings[`genre_goals_${year}`] = genreGoals;
  if (apiKey)      settings.claude_key              = apiKey;
  if (streak)      settings.streak                  = streak;
  if (displayName) settings.display_name            = displayName;
  return settings;
}

export function applySettings(settings) {
  if (!settings || typeof settings !== 'object') return;
  const year = new Date().getFullYear();
  if (settings[`goal_${year}`])        localStorage.setItem(`libra-goal-${year}`,        settings[`goal_${year}`]);
  if (settings[`genre_goals_${year}`]) localStorage.setItem(`libra-genre-goals-${year}`, settings[`genre_goals_${year}`]);
  if (settings.claude_key)             localStorage.setItem('libra-claude-key',           settings.claude_key);
  if (settings.streak)                 localStorage.setItem('libra-streak',               settings.streak);
  if (settings.display_name)           localStorage.setItem('libra-display-name',         settings.display_name);
}
