import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthenticatedRouteContext } from "@/lib/auth/server-guards";
import { safeWriteAuditLog } from "@/lib/security/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("assignment"),
    sourceId: z.string().uuid(),
    studentId: z.string().uuid().optional().nullable(),
    reviewId: z.string().uuid().optional().nullable()
  }),
  z.object({
    kind: z.literal("exam"),
    sourceId: z.string().uuid(),
    studentId: z.string().uuid().optional().nullable(),
    reviewId: z.string().uuid().optional().nullable()
  })
]);

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    await requireAuthenticatedRouteContext(supabase);
    const payload = reviewSchema.parse(await request.json());

    const { data, error } =
      payload.kind === "assignment"
        ? await supabase.rpc("get_assignment_submission_review", {
            assignment_id_input: payload.sourceId,
            student_id_input: payload.studentId ?? null,
            submission_id_input: payload.reviewId ?? null
          })
        : await supabase.rpc("get_exam_attempt_review", {
            exam_id_input: payload.sourceId,
            student_id_input: payload.studentId ?? null,
            attempt_id_input: payload.reviewId ?? null
          });

    if (error) {
      await safeWriteAuditLog(supabase, request, {
        action: "submission.review",
        targetType: payload.kind === "assignment" ? "assignment_submission" : "exam_attempt",
        outcome: "error",
        metadata: {
          kind: payload.kind,
          sourceId: payload.sourceId,
          studentId: payload.studentId ?? null,
          reviewId: payload.reviewId ?? null,
          message: error.message
        }
      });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await safeWriteAuditLog(supabase, request, {
      action: "submission.review",
      targetType: payload.kind === "assignment" ? "assignment_submission" : "exam_attempt",
      metadata: {
        kind: payload.kind,
        sourceId: payload.sourceId,
        studentId: payload.studentId ?? null,
        reviewId: payload.reviewId ?? null
      }
    });

    return NextResponse.json({ ok: true, review: data ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load submission review.";
    const status =
      /unauthorized/i.test(message) ? 401 : /access required|do not have access|not authorized/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
