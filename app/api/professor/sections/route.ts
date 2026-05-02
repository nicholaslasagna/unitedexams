import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSectionSchema = z.object({
  name: z.string().trim().min(2).max(160),
  term: z.string().trim().max(80).optional().nullable(),
  courseId: z.string().trim().min(1).max(80)
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = createSectionSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("class_sections")
      .insert({
        name: payload.name,
        section_name: payload.name,
        term: payload.term?.trim() || null,
        course_id: payload.courseId,
        created_by: context.user.id,
        owner_id: context.user.id
      })
      .select("id, name, term, course_id, join_code, created_at")
      .single();

    if (error || !data) {
      await safeWriteAuditLog(supabase, request, {
        action: "section.create",
        targetType: "class_section",
        outcome: "error",
        metadata: { message: error?.message || "Insert failed", courseId: payload.courseId }
      });
      return NextResponse.json({ error: error?.message || "Unable to create section." }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "section.create",
      targetType: "class_section",
      targetId: data.id,
      metadata: { courseId: payload.courseId }
    });

    return NextResponse.json({
      ok: true,
      section: {
        ...data,
        assignment_weight: 40,
        exam_weight: 60
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create section.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
