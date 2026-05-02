import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createMaterialSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().trim().min(1).max(160),
  bodyMd: z.string().trim().max(40000),
  attachments: z.array(z.string().trim().url().max(4000)).max(24).optional()
});


export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = createMaterialSchema.parse(await request.json());

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: payload.sectionId,
      user_id_input: context.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "material.create",
        targetType: "section_material",
        outcome: "denied",
        metadata: { sectionId: payload.sectionId, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can post materials." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("section_materials")
      .insert({
        section_id: payload.sectionId,
        title: payload.title,
        body_md: payload.bodyMd,
        attachments: payload.attachments ?? [],
        created_by: context.user.id
      })
      .select("id, section_id, title, body_md, attachments, created_by, created_at, updated_at")
      .single();

    if (error || !data) {
      await safeWriteAuditLog(supabase, request, {
        action: "material.create",
        targetType: "section_material",
        outcome: "error",
        metadata: { sectionId: payload.sectionId, message: error?.message || "Insert failed" }
      });
      return NextResponse.json({ error: error?.message || "Unable to post material." }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "material.create",
      targetType: "section_material",
      targetId: data.id,
      metadata: { sectionId: payload.sectionId, attachmentCount: payload.attachments?.length ?? 0 }
    });

    return NextResponse.json({ ok: true, material: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to post material.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
