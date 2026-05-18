import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireUniversityAdmin } from "@/lib/auth/server-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusSchema = z.enum(["pending", "approved", "rejected", "canceled", "all"]).default("pending");

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireUniversityAdmin(routeContext);

    const status = statusSchema.parse(new URL(request.url).searchParams.get("status") ?? "pending");
    const { data, error } = await supabase.rpc("get_university_affiliation_requests", {
      status_input: status
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, requests: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to list university affiliation requests.";
    const status = /unauthorized/i.test(message)
      ? 401
      : /university-admin access/i.test(message)
        ? 403
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
