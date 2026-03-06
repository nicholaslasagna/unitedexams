import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { extractClientIpFromHeaders, userAgentSnippet } from "@/lib/auth/ip-protection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const contactSchema = z.object({
  subject: z.string().trim().max(160).optional(),
  category: z.enum(["Bug", "Content request", "Account help", "Other"]),
  message: z.string().trim().min(20).max(8000),
  currentUrl: z.string().trim().max(2048).optional(),
  currentRoute: z.string().trim().max(512).optional()
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const env = getSupabasePublicEnv();

  if (!supabase || !env) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to contact support." }, { status: 401 });
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  let payload: z.infer<typeof contactSchema>;
  try {
    const raw = (await request.json()) as unknown;
    payload = contactSchema.parse(raw);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Invalid payload";
    return NextResponse.json({ error: reason }, { status: 400 });
  }

  const ipAddress = extractClientIpFromHeaders(request.headers);
  const agent = userAgentSnippet(request.headers.get("user-agent"));

  const response = await fetch(`${env.url}/functions/v1/contact-support`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.publicKey,
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      subject: payload.subject?.trim() || null,
      category: payload.category,
      message: payload.message.trim(),
      currentUrl: payload.currentUrl ?? null,
      currentRoute: payload.currentRoute ?? null,
      userAgent: agent,
      ipAddress
    })
  });

  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    warning?: string;
    error?: string;
  };

  if (!response.ok || !result.ok) {
    return NextResponse.json(
      {
        error:
          result.error || "We couldn't submit your message right now. Please email support@unitedexams.com."
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    warning: result.warning
  });
}
