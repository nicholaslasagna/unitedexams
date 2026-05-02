import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  requestedRealName: z.string().trim().min(1).max(32)
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    const payload = inputSchema.parse(await request.json());

    const { error } = await supabase.rpc("request_profile_name_change", {
      requested_real_name_input: payload.requestedRealName
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "profile.name_change.request",
        targetType: "profile",
        targetId: routeContext.user.id,
        outcome: "error",
        metadata: { message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "profile.name_change.request",
      targetType: "profile",
      targetId: routeContext.user.id
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit name change request.";
    const status = /unauthorized/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
