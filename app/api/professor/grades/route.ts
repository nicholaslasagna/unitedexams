import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext, requireVerifiedProfessor } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const upsertGradeSchema = z.object({
  assignmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  status: z.enum(["submitted", "graded", "needs_review"]),
  score: z.number().min(0).max(100).nullable(),
  feedback: z.string().max(12000).nullable().optional()
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedRouteContext(supabase);
    requireVerifiedProfessor(context);
    const payload = upsertGradeSchema.parse(await request.json());

    const { data: submissionId, error } = await supabase.rpc("upsert_manual_grade", {
      assignment_id_input: payload.assignmentId,
      student_id_input: payload.studentId,
      status_input: payload.status,
      score_input: payload.score,
      feedback_input: payload.feedback ?? null
    });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "grade.upsert",
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

    const resolvedSubmissionId = submissionId ? String(submissionId) : "";
    await safeWriteAuditLog(supabase, request, {
      action: "grade.upsert",
      targetType: "assignment_submission",
      targetId: resolvedSubmissionId || null,
      metadata: {
        assignmentId: payload.assignmentId,
        studentId: payload.studentId,
        status: payload.status,
        score: payload.score
      }
    });

    return NextResponse.json({ ok: true, submissionId: resolvedSubmissionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save grade.";
    const status = /unauthorized/i.test(message) ? 401 : /professor access/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
