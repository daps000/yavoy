import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;
  
  const response = await fetch('/api/config/supabase');
  const { url, anonKey } = await response.json();
  
  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}

export function getSupabase(): Promise<SupabaseClient> {
  if (!initPromise) {
    initPromise = initSupabase();
  }
  return initPromise;
}

export { supabaseInstance as supabase };
