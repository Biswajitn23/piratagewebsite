import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function initSupabaseIfPossible() {
  if (supabase) return;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    supabase = createClient(url, key, { auth: { persistSession: false } });
  }
}

export function isSupabaseEnabled() {
  initSupabaseIfPossible();
  return Boolean(supabase);
}

export function getSupabase() {
  initSupabaseIfPossible();
  if (!supabase) throw new Error("Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY.");
  return supabase;
}

export default getSupabase;
