import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import {
  buildLoginRedirect,
  isProtectedPath,
  shouldForceOnboarding
} from "@/lib/auth/guards";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, user, supabase } = await updateSupabaseSession(request);

  // If Supabase env is missing, do not block development/local flows.
  if (!supabase) return response;

  if (isProtectedPath(pathname)) {
    if (!user) {
      return NextResponse.redirect(buildLoginRedirect(request));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("reset_required, university_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.reset_required) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/reset-password";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    const { count } = await supabase
      .from("user_courses")
      .select("course_id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const needsUniversity = !profile?.university_id;
    const needsCourses = (count ?? 0) === 0;
    const role = profile?.role ?? "student";

    if (shouldForceOnboarding(pathname, needsUniversity, needsCourses, role)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/app/account";
      redirectUrl.searchParams.set("onboarding", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*"]
};
