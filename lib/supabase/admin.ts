import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES ROW LEVEL SECURITY.
 *
 * Only callable from server-side trusted contexts (webhooks, scheduled
 * jobs, admin RPCs). Never import from client modules.
 *
 * Returns null if either NEXT_PUBLIC_SUPABASE_URL or a Supabase server
 * secret is missing — callers must handle this and respond with 503 /
 * log + skip rather than crash.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !serviceKey) return null;

  cached = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        // Mark requests so they're identifiable in Postgres logs.
        "X-Client-Info": "united-exams/server-admin"
      }
    }
  });
  return cached;
}
