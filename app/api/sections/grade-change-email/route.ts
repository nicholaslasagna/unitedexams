import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { escapeHtml, sendMailerSendEmail } from "@/lib/email/mailer";

const inputSchema = z.object({
  submissionId: z.string().uuid()
});

interface GradePayloadRow {
  submission_id: string;
  section_id: string;
  section_name: string;
  course_id: string;
  assignment_title: string;
  student_user_id: string;
  student_email: string | null;
  student_display_name: string | null;
  status: string;
  score: number | null;
  feedback_md: string | null;
  graded_at: string | null;
  updated_at: string | null;
}

function resolveSiteUrl(request: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return request.nextUrl.origin;
}

function renderGradeEmail(params: {
  studentName: string;
  sectionName: string;
  courseId: string;
  assignmentTitle: string;
  status: string;
  score: number | null;
  feedback: string | null;
  siteUrl: string;
}) {
  const safeStudent = escapeHtml(params.studentName || "Student");
  const safeSection = escapeHtml(params.sectionName);
  const safeCourse = escapeHtml(params.courseId);
  const safeAssignment = escapeHtml(params.assignmentTitle);
  const safeStatus = escapeHtml(params.status);
  const safeFeedback = escapeHtml(params.feedback || "").replace(/\n/g, "<br/>");
  const scoreText = params.score === null ? "Pending" : `${params.score}%`;

  const html = `
  <div style="margin:0;background:#090A1D;padding:32px 12px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;border-radius:18px;overflow:hidden;background:linear-gradient(140deg,#5a3ff5,#7a5cff 40%,#4ac9ff);padding:1px;">
      <div style="background:#F8FAFC;padding:28px 24px;">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6B7280;">United Exams</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.2;color:#111827;">Grade update posted</h1>
        <p style="margin:0 0 14px;font-size:14px;color:#374151;">Hi ${safeStudent}, your instructor updated a grade in <strong>${safeSection}</strong> (${safeCourse}).</p>
        <div style="margin:0 0 12px;border:1px solid #E5E7EB;border-radius:10px;padding:14px;background:#FFFFFF;">
          <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">${safeAssignment}</p>
          <p style="margin:0 0 4px;font-size:14px;color:#374151;">Status: <strong>${safeStatus}</strong></p>
          <p style="margin:0;font-size:14px;color:#374151;">Score: <strong>${scoreText}</strong></p>
          ${safeFeedback ? `<p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#374151;">Feedback:<br/>${safeFeedback}</p>` : ""}
        </div>
        <p style="margin:14px 0 0;">
          <a href="${params.siteUrl}/app/sections" style="display:inline-block;background:linear-gradient(140deg,#5a3ff5,#6c4cff);color:#fff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600;">
            Open section workspace
          </a>
        </p>
      </div>
    </div>
  </div>`;

  const text = `United Exams grade update\n\nCourse: ${params.courseId}\nSection: ${params.sectionName}\nAssignment: ${params.assignmentTitle}\nStatus: ${params.status}\nScore: ${scoreText}${params.feedback ? `\n\nFeedback:\n${params.feedback}` : ""}\n\nOpen section workspace:\n${params.siteUrl}/app/sections`;

  return { html, text };
}


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

  let payload: z.infer<typeof inputSchema>;
  try {
    payload = inputSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid grade notification payload." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("get_grade_change_notification_payload", {
    submission_id_input: payload.submissionId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const row = (Array.isArray(data) ? data[0] : null) as GradePayloadRow | null;
  if (!row) {
    return NextResponse.json({ error: "You do not have permission to notify this student." }, { status: 403 });
  }

  if (row.status !== "graded") {
    return NextResponse.json({ ok: true });
  }

  if (row.student_user_id === user.id) {
    return NextResponse.json({
      ok: true,
      warning: "Grade updated. Notification skipped because this submission belongs to the instructor account."
    });
  }

  const { data: membership } = await supabase
    .from("section_members")
    .select("role")
    .eq("section_id", row.section_id)
    .eq("user_id", row.student_user_id)
    .maybeSingle();

  if (!membership || membership.role !== "student") {
    return NextResponse.json({
      ok: true,
      warning: "Grade updated. Notification skipped because recipient is not an enrolled student."
    });
  }

  const toEmail = (row.student_email || "").trim().toLowerCase();
  if (!toEmail) {
    return NextResponse.json({ ok: true, warning: "Grade updated, but student email was unavailable." });
  }

  const siteUrl = resolveSiteUrl(request);
  const { html, text } = renderGradeEmail({
    studentName: row.student_display_name || "Student",
    sectionName: row.section_name,
    courseId: row.course_id,
    assignmentTitle: row.assignment_title,
    status: row.status,
    score: row.score,
    feedback: row.feedback_md,
    siteUrl
  });

  const mailResult = await sendMailerSendEmail({
    toEmail,
    subject: `Grade update — ${row.assignment_title}`,
    html,
    text
  });

  if (!mailResult.ok) {
    return NextResponse.json({
      ok: true,
      warning: mailResult.warning || "Grade updated, but email delivery failed."
    });
  }

  return NextResponse.json({ ok: true });
}
