import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in the browser.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    console.warn("Supabase URL is missing or invalid. Please update .env.local");
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey!);
}
