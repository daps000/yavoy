import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;
let cachedSiteUrl: string | null = null;

async function initSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;
  
  const response = await fetch('/api/config/supabase');
  const { url, anonKey, siteUrl } = await response.json();
  
  // Store the site URL for OAuth redirects
  cachedSiteUrl = siteUrl || null;
  
  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}

export function getSupabase(): Promise<SupabaseClient> {
  if (!initPromise) {
    initPromise = initSupabase();
  }
  return initPromise;
}

export function getSiteUrl(): string | null {
  return cachedSiteUrl;
}

export { supabaseInstance as supabase };
