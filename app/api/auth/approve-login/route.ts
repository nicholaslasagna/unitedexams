import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseEdgeFunctionKey, getSupabasePublicEnv } from "@/lib/supabase/env";
import {
  createSignedApprovedIpCookieValue,
  createSignedTrustDeviceCookieValue,
  getApprovedIpCookieName,
  getTrustDeviceCookieName
} from "@/lib/auth/ip-protection";

const approveSchema = z.object({
  token: z.string().trim().min(24),
  cid: z.string().trim().uuid(),
  trustDevice: z.boolean().optional()
});


export async function POST(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  let payload: z.infer<typeof approveSchema>;
  try {
    payload = approveSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid approval token." }, { status: 400 });
  }

  const response = await fetch(`${env.url}/functions/v1/approve-login-ip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getSupabaseEdgeFunctionKey(env),
      ...(env.legacyAnonKey
        ? {
            Authorization: `Bearer ${env.legacyAnonKey}`
          }
        : {})
    },
    body: JSON.stringify({
      token: payload.token,
      cid: payload.cid
    })
  });

  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    ipHash?: string;
    userId?: string;
    error?: string;
  };

  if (!response.ok || !result.ok) {
    return NextResponse.json(
      {
        error: result.error || "This approval link is invalid or expired."
      },
      { status: 400 }
    );
  }

  const next = NextResponse.json({ ok: true });
  if (result.ipHash) {
    next.cookies.set(getApprovedIpCookieName(), await createSignedApprovedIpCookieValue(result.ipHash), {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true
    });
  }

  if (payload.trustDevice && result.userId) {
    next.cookies.set(
      getTrustDeviceCookieName(),
      await createSignedTrustDeviceCookieValue(result.userId),
      {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
      }
    );
  } else {
    next.cookies.delete(getTrustDeviceCookieName());
  }

  return next;
}
