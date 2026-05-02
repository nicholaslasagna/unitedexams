import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  examId: z.string().uuid()
});

const accessRulesSchema = z.object({
  requireSectionMembership: z.boolean(),
  requireProctorCode: z.boolean(),
  proctorCode: z.string().trim().max(64).optional(),
  clearProctorCode: z.boolean().optional(),
  requireNetworkAllowlist: z.boolean(),
  allowMobileHotspot: z.boolean(),
  blockVpn: z.boolean(),
  lockdownMode: z.boolean(),
  suspicionThreshold: z.number().int().min(20).max(500),
  openNotesAllowed: z.boolean().optional()
});

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ examId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { examId } = paramsSchema.parse(await context.params);
    const payload = accessRulesSchema.parse(await request.json());

    const { data: exam, error: examLookupError } = await supabase
      .from("exams")
      .select("id, section_id")
      .eq("id", examId)
      .maybeSingle();

    if (examLookupError || !exam) {
      return NextResponse.json({ error: examLookupError?.message || "Exam not found." }, { status: 404 });
    }

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: exam.section_id,
      user_id_input: routeContext.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "exam.access_rules.update",
        targetType: "exam",
        targetId: examId,
        outcome: "denied",
        metadata: { sectionId: exam.section_id, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can update exam access rules." }, { status: 403 });
    }

    const { error } = await supabase.rpc("upsert_exam_access_rules", {
      exam_id_input: examId,
      require_section_membership_input: payload.requireSectionMembership,
      require_proctor_code_input: payload.requireProctorCode,
      proctor_code_input: payload.proctorCode?.trim() || null,
      clear_proctor_code_input: Boolean(payload.clearProctorCode),
      require_network_allowlist_input: payload.requireNetworkAllowlist,
      allow_mobile_hotspot_input: payload.allowMobileHotspot,
      block_vpn_input: payload.blockVpn,
      lockdown_mode_input: payload.lockdownMode,
      suspicion_threshold_input: payload.suspicionThreshold,
      open_notes_allowed_input: Boolean(payload.openNotesAllowed)
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "exam.access_rules.update",
        targetType: "exam",
        targetId: examId,
        outcome: "error",
        metadata: { sectionId: exam.section_id, message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "exam.access_rules.update",
      targetType: "exam",
      targetId: examId,
      metadata: { sectionId: exam.section_id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update exam access rules.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
