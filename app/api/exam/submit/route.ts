import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const submitExamSchema = z.object({
  attemptId: z.string().uuid(),
  answers: z.record(z.string(), z.array(z.number().int())).default({})
});

export const runtime = "edge";

export async function POST(request: NextRequest) {
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

  let payload: z.infer<typeof submitExamSchema>;
  try {
    payload = submitExamSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid exam submit payload." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("submit_exam", {
    attempt_id_input: payload.attemptId,
    answers_input: payload.answers
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        score: number;
        correct_count: number;
        total_count: number;
        suspicion_score: number;
        results_available: boolean;
        show_results_after: string;
        status: string;
      }
    | null;

  if (!row) {
    return NextResponse.json({ error: "Unable to submit exam." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    score: Number(row.score ?? 0),
    correctCount: Number(row.correct_count ?? 0),
    totalCount: Number(row.total_count ?? 0),
    suspicionScore: Number(row.suspicion_score ?? 0),
    resultsAvailable: Boolean(row.results_available),
    showResultsAfter: row.show_results_after,
    status: row.status
  });
}
