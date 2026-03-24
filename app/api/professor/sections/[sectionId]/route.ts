import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  sectionId: z.string().uuid()
});

const updateGradingPolicySchema = z
  .object({
    assignmentWeight: z.number().int().min(0).max(100),
    examWeight: z.number().int().min(0).max(100)
  })
  .refine((value) => value.assignmentWeight + value.examWeight === 100, {
    message: "Assignment and exam weights must total 100."
  });

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ sectionId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { sectionId } = paramsSchema.parse(await context.params);
    const payload = updateGradingPolicySchema.parse(await request.json());

    const { data: section, error: lookupError } = await supabase
      .from("class_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("owner_id", routeContext.user.id)
      .maybeSingle();

    if (lookupError || !section) {
      await safeWriteAuditLog(supabase, request, {
        action: "section.grading_policy.update",
        targetType: "class_section",
        targetId: sectionId,
        outcome: "denied",
        metadata: { message: lookupError?.message || "Not owner" }
      });
      return NextResponse.json({ error: "Only the section owner can update grading policy." }, { status: 403 });
    }

    const { data: updatedSection, error: updateError } = await supabase
      .from("class_sections")
      .update({
        assignment_weight: payload.assignmentWeight,
        exam_weight: payload.examWeight
      })
      .eq("id", sectionId)
      .select("id, name, term, course_id, join_code, created_at, assignment_weight, exam_weight")
      .single();

    if (updateError || !updatedSection) {
      await safeWriteAuditLog(supabase, request, {
        action: "section.grading_policy.update",
        targetType: "class_section",
        targetId: sectionId,
        outcome: "error",
        metadata: { message: updateError?.message || "Update failed" }
      });
      return NextResponse.json(
        { error: updateError?.message || "Unable to update grading policy." },
        { status: 400 }
      );
    }

    await safeWriteAuditLog(supabase, request, {
      action: "section.grading_policy.update",
      targetType: "class_section",
      targetId: sectionId,
      metadata: {
        assignmentWeight: payload.assignmentWeight,
        examWeight: payload.examWeight
      }
    });

    return NextResponse.json({ ok: true, section: updatedSection });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update grading policy.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ sectionId: string }> }
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const routeContext = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(routeContext);
    const { sectionId } = paramsSchema.parse(await context.params);

    const { data: section, error: lookupError } = await supabase
      .from("class_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("owner_id", routeContext.user.id)
      .maybeSingle();

    if (lookupError || !section) {
      await safeWriteAuditLog(supabase, request, {
        action: "section.delete",
        targetType: "class_section",
        targetId: sectionId,
        outcome: "denied",
        metadata: { message: lookupError?.message || "Not owner" }
      });
      return NextResponse.json({ error: "Only the section owner can delete this section." }, { status: 403 });
    }

    const { error } = await supabase.from("class_sections").delete().eq("id", sectionId);
    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "section.delete",
        targetType: "class_section",
        targetId: sectionId,
        outcome: "error",
        metadata: { message: error.message }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "section.delete",
      targetType: "class_section",
      targetId: sectionId
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete section.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
