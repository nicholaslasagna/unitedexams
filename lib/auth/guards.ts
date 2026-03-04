import type { NextRequest } from "next/server";

export function isProtectedPath(pathname: string) {
  return pathname.startsWith("/app");
}

export function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";
}

export function isProfessorPath(pathname: string) {
  return pathname.startsWith("/app/professor");
}

export function buildLoginRedirect(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set("next", next);
  return redirectUrl;
}

export function resolveNextAfterLogin(nextValue: string | null | undefined) {
  if (!nextValue) return "/app/dashboard";
  if (!nextValue.startsWith("/")) return "/app/dashboard";
  if (nextValue.startsWith("//")) return "/app/dashboard";
  return nextValue;
}

export function shouldForceOnboarding(
  pathname: string,
  needsUniversity: boolean,
  needsCourses: boolean,
  role: string
) {
  if (role === "professor") return false;
  if (!needsUniversity && !needsCourses) return false;
  if (pathname.startsWith("/app/account")) return false;
  if (pathname.startsWith("/app/settings")) return false;
  return pathname.startsWith("/app");
}
