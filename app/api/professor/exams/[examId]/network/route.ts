import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClientIp, hashIpForStorage } from "@/lib/auth/ip-protection";

const removeSchema = z.object({
  ipHash: z.string().trim().min(16).optional()
});


export async function POST(
  request: NextRequest,
  context: { params: Promise<{ examId: string }> }
) {
  const { examId } = await context.params;
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

  const ipAddress = getClientIp(request.headers);
  if (!ipAddress) {
    return NextResponse.json(
      { error: "Unable to determine the current network IP." },
      { status: 400 }
    );
  }

  const ipHash = await hashIpForStorage(ipAddress);
  const { data, error } = await supabase.rpc("add_exam_allowed_network", {
    exam_id_input: examId,
    ip_hash_input: ipHash
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    addedIpHash: ipHash,
    totalAllowed: Number(data ?? 0)
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ examId: string }> }
) {
  const { examId } = await context.params;
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

  const parsed = removeSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid remove-network payload." }, { status: 400 });
  }

  let targetHash = parsed.data.ipHash ?? null;
  if (!targetHash) {
    const ipAddress = getClientIp(request.headers);
    if (!ipAddress) {
      return NextResponse.json(
        { error: "No network hash provided and current network was unavailable." },
        { status: 400 }
      );
    }
    targetHash = await hashIpForStorage(ipAddress);
  }

  const { data, error } = await supabase.rpc("remove_exam_allowed_network", {
    exam_id_input: examId,
    ip_hash_input: targetHash
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    removedIpHash: targetHash,
    totalAllowed: Number(data ?? 0)
  });
}
