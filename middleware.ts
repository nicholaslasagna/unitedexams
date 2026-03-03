import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const AUTH_PAGES = new Set(["/login", "/signup", "/forgot-password"]);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, user, supabase } = await updateSupabaseSession(request);

  // If Supabase env is missing, do not block development/local flows.
  if (!supabase) return response;

  if (pathname.startsWith("/app")) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname !== "/reset-password") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("reset_required")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.reset_required) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/reset-password";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  if (user && AUTH_PAGES.has(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup", "/forgot-password", "/reset-password"]
};
