import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  extractClientIpFromHeaders,
  hashIpForStorage,
  shouldRequireIpApproval,
  type UserRole
} from "@/lib/auth/ip-protection";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, mfa_enabled")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_preferences")
      .select("extra_signin_protection")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const role = (profile?.role ?? "student") as UserRole;
  const mfaEnabled = Boolean(profile?.mfa_enabled);
  const extraSigninProtection = Boolean(prefs?.extra_signin_protection);
  const requiresApproval = shouldRequireIpApproval({
    role,
    mfaEnabled,
    extraSigninProtection
  });

  if (!requiresApproval) {
    const response = NextResponse.json({
      ok: true,
      requiresApproval: false,
      approved: true
    });
    response.cookies.delete("ue_ip_ok");
    return response;
  }

  const ipAddress = extractClientIpFromHeaders(request.headers);
  if (!ipAddress) {
    return NextResponse.json({
      ok: true,
      requiresApproval: true,
      approved: false,
      reason: "ip_unavailable"
    });
  }

  const ipHash = await hashIpForStorage(ipAddress);
  const { data: row } = await supabase
    .from("login_ip_allowlist")
    .select("approved")
    .eq("user_id", user.id)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  const approved = Boolean(row?.approved);
  const response = NextResponse.json({
    ok: true,
    requiresApproval: true,
    approved
  });

  if (approved) {
    response.cookies.set("ue_ip_ok", ipHash, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true
    });
  }

  return response;
}

