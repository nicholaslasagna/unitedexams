export interface SupabasePublicEnv {
  url: string;
  publicKey: string;
  legacyAnonKey: string | null;
}

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const legacyAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  if (!url || !publicKey) return null;
  return { url, publicKey, legacyAnonKey };
}

export function getSupabaseEdgeFunctionKey(env: SupabasePublicEnv) {
  return env.legacyAnonKey || env.publicKey;
}

export function hasSupabasePublicEnv() {
  return Boolean(getSupabasePublicEnv());
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or a Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return env;
}
