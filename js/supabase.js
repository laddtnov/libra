import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

// Uses the global loaded via <script> tag in index.html
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
