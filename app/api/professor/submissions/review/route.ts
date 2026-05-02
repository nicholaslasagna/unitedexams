import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  assignmentId: z.string().uuid(),
  studentId: z.string().uuid()
});


export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = reviewSchema.parse(await request.json());

    const { data, error } = await supabase.rpc("get_assignment_submission_review", {
      assignment_id_input: payload.assignmentId,
      student_id_input: payload.studentId
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "submission.review",
        targetType: "assignment_submission",
        outcome: "error",
        metadata: {
          assignmentId: payload.assignmentId,
          studentId: payload.studentId,
          message: error.message
        }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "submission.review",
      targetType: "assignment_submission",
      metadata: {
        assignmentId: payload.assignmentId,
        studentId: payload.studentId
      }
    });

    return NextResponse.json({ ok: true, review: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load submission review.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
