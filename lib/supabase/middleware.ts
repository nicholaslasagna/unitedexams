import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export interface MiddlewareSessionResult {
  response: NextResponse;
  supabase: SupabaseClient | null;
  user: User | null;
}

export async function updateSupabaseSession(request: NextRequest): Promise<MiddlewareSessionResult> {
  const env = getSupabasePublicEnv();
  let response = NextResponse.next({ request });

  if (!env) {
    return { response, supabase: null, user: null };
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { response, supabase, user };
}
