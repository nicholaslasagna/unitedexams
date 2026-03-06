import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  materialId: z.string().uuid()
});

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ materialId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { materialId } = paramsSchema.parse(await context.params);

    const { data: material, error: lookupError } = await supabase
      .from("section_materials")
      .select("id, section_id")
      .eq("id", materialId)
      .maybeSingle();

    if (lookupError || !material) {
      return NextResponse.json({ error: lookupError?.message || "Material not found." }, { status: 404 });
    }

    const { data: canManage, error: roleError } = await supabase.rpc("section_professor_exists", {
      section_id_input: material.section_id,
      user_id_input: routeContext.user.id
    });

    if (roleError || !canManage) {
      await safeWriteAuditLog(supabase, request, {
        action: "material.delete",
        targetType: "section_material",
        targetId: materialId,
        outcome: "denied",
        metadata: { sectionId: material.section_id, message: roleError?.message || "Section access denied" }
      });
      return NextResponse.json({ error: "Only section professors can remove materials." }, { status: 403 });
    }

    const { error } = await supabase.from("section_materials").delete().eq("id", materialId);
    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "material.delete",
        targetType: "section_material",
        targetId: materialId,
        outcome: "error",
        metadata: { sectionId: material.section_id, message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "material.delete",
      targetType: "section_material",
      targetId: materialId,
      metadata: { sectionId: material.section_id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove material.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
