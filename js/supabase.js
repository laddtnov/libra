import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

if (!window.supabase) throw new Error('Supabase SDK not loaded');
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
