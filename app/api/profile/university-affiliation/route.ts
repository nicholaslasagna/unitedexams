import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("request"),
    universityId: z.string().uuid()
  }),
  z.object({
    action: z.literal("redeem"),
    code: z.string().trim().min(8).max(128)
  })
]);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    await requireAuthenticatedRouteContext(supabase);

    const { data, error } = await supabase
      .from("university_affiliation_requests")
      .select("id, university_id, status, requested_at, reviewed_at, note, universities(name)")
      .order("requested_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, requests: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to list university affiliation requests.";
    const status = /unauthorized/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    const payload = requestSchema.parse(await request.json());

    if (payload.action === "request") {
      const { data, error } = await supabase.rpc("request_university_affiliation", {
        university_id_input: payload.universityId
      });

      if (error) {
        await safeWriteAuditLog(supabase, request, {
          action: "profile.university_affiliation.request",
          targetType: "university",
          targetId: payload.universityId,
          outcome: "error",
          metadata: { message: error.message }
        });
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await safeWriteAuditLog(supabase, request, {
        action: "profile.university_affiliation.request",
        targetType: "profile",
        targetId: routeContext.user.id,
        metadata: { universityId: payload.universityId }
      });

      return NextResponse.json({ ok: true, request: data?.[0] ?? null });
    }

    const { data, error } = await supabase.rpc("redeem_university_affiliation_code", {
      code_input: payload.code
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "profile.university_affiliation.redeem_code",
        targetType: "profile",
        targetId: routeContext.user.id,
        outcome: "error",
        metadata: { message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "profile.university_affiliation.redeem_code",
      targetType: "profile",
      targetId: routeContext.user.id
    });

    return NextResponse.json({ ok: true, affiliation: data?.[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update university affiliation.";
    const status = /unauthorized/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
