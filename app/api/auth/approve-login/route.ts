import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const approveSchema = z.object({
  token: z.string().trim().min(24),
  cid: z.string().trim().uuid()
});

export const runtime = "nodejs";

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
      apikey: env.anonKey,
      Authorization: `Bearer ${env.anonKey}`
    },
    body: JSON.stringify({
      token: payload.token,
      cid: payload.cid
    })
  });

  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    ipHash?: string;
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
    next.cookies.set("ue_ip_ok", result.ipHash, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true
    });
  }
  return next;
}

