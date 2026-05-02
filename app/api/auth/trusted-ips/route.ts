import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { maskIpHash } from "@/lib/auth/ip-protection";

const deleteSchema = z.object({
  ipHash: z.string().trim().min(16)
});


export async function GET() {
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

  const { data, error } = await supabase
    .from("login_ip_allowlist")
    .select("ip_hash, approved, first_seen_at, last_seen_at, approved_at")
    .eq("user_id", user.id)
    .eq("approved", true)
    .order("last_seen_at", { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    items: (data ?? []).map((entry) => ({
      ipHash: entry.ip_hash,
      maskedIp: maskIpHash(entry.ip_hash),
      approved: entry.approved,
      firstSeenAt: entry.first_seen_at,
      lastSeenAt: entry.last_seen_at,
      approvedAt: entry.approved_at
    }))
  });
}

export async function DELETE(request: NextRequest) {
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

  let payload: z.infer<typeof deleteSchema>;
  try {
    payload = deleteSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid trusted IP request." }, { status: 400 });
  }

  const { error } = await supabase
    .from("login_ip_allowlist")
    .delete()
    .eq("user_id", user.id)
    .eq("ip_hash", payload.ipHash);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

