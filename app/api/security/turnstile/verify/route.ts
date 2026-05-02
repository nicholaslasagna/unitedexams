import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getTurnstileClientIp,
  isTurnstileConfigured,
  verifyTurnstileToken
} from "@/lib/security/turnstile";

const verifySchema = z.object({
  token: z.string().trim().min(1),
  action: z.enum(["signup", "login", "forgot-password", "reset-password"])
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  let payload: z.infer<typeof verifySchema>;

  try {
    payload = verifySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 });
  }

  if (!isTurnstileConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const verification = await verifyTurnstileToken(payload.token, {
    expectedAction: payload.action,
    remoteIp: getTurnstileClientIp(request.headers),
    softFail: false
  });

  if (!verification.ok) {
    return NextResponse.json(
      {
        error:
          verification.reason || "Verification failed. Please retry the challenge."
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
