import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import {
  buildLoginRedirect,
  canonicalizeRoute,
  isProtectedPath,
  shouldForceOnboarding
} from "@/lib/auth/guards";
import {
  createSignedApprovedIpCookieValue,
  getApprovedIpCookieName,
  getClientIp,
  getTrustDeviceCookieName,
  hashIpForStorage,
  isValidApprovedIpCookie,
  isValidTrustDeviceCookie,
  shouldRequireIpApproval,
  type UserRole
} from "@/lib/auth/ip-protection";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { response, user, supabase } = await updateSupabaseSession(request);

  // If Supabase env is missing, do not block development/local flows.
  if (!supabase) return response;

  if (isProtectedPath(pathname)) {
    if (!user) {
      return NextResponse.redirect(buildLoginRedirect(request));
    }

    const [{ data: profile }, { data: prefs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("reset_required, university_id, role, mfa_enabled")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_preferences")
        .select("extra_signin_protection")
        .eq("user_id", user.id)
        .maybeSingle()
    ]);

    if (profile?.reset_required && !pathname.startsWith("/reset-password")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/reset-password";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    const role = (profile?.role ?? "student") as UserRole;
    const extraSigninProtection = Boolean(prefs?.extra_signin_protection);
    const mfaEnabled = Boolean(profile?.mfa_enabled);

    const requiresIpApproval = shouldRequireIpApproval({
      role,
      mfaEnabled,
      extraSigninProtection
    });

    if (requiresIpApproval) {
      const trustedDeviceCookie = request.cookies.get(getTrustDeviceCookieName())?.value;
      const trustDeviceValid = await isValidTrustDeviceCookie(trustedDeviceCookie, user.id);
      if (trustDeviceValid) {
        return response;
      }

      const ipAddress = getClientIp(request.headers);
      if (!ipAddress) {
        // If IP cannot be determined, skip IP gating entirely.
        return response;
      }

      const ipHash = await hashIpForStorage(ipAddress);
      const approvedIpCookie = request.cookies.get(getApprovedIpCookieName())?.value;
      const approvedIpCookieValid = await isValidApprovedIpCookie(approvedIpCookie, ipHash);

      if (!approvedIpCookieValid) {
        const { data: trustedIp } = await supabase
          .from("login_ip_allowlist")
          .select("approved")
          .eq("user_id", user.id)
          .eq("ip_hash", ipHash)
          .maybeSingle();

        if (!trustedIp?.approved) {
          const approvalUrl = request.nextUrl.clone();
          approvalUrl.pathname = "/auth/approval-required";
          approvalUrl.search = "";
          approvalUrl.searchParams.set(
            "next",
            canonicalizeRoute(`${request.nextUrl.pathname}${request.nextUrl.search}`)
          );
          return NextResponse.redirect(approvalUrl);
        }

        response.cookies.set(getApprovedIpCookieName(), await createSignedApprovedIpCookieValue(ipHash), {
          path: "/",
          maxAge: 60 * 60 * 24,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true
        });
      }
    }

    const { count } = await supabase
      .from("user_courses")
      .select("course_id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const needsUniversity = !profile?.university_id;
    const needsCourses = (count ?? 0) === 0;
    const normalizedRole = profile?.role ?? "student";

    if (shouldForceOnboarding(pathname, needsUniversity, needsCourses, normalizedRole)) {
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
