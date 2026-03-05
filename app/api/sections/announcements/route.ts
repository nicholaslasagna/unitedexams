import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { escapeHtml, sendMailerSendEmail } from "@/lib/email/mailer";

const inputSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(1).max(12000),
  sendEmail: z.boolean().optional().default(true)
});

interface RecipientRow {
  user_id: string;
  email: string;
  display_name: string;
}

function resolveSiteUrl(request: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return request.nextUrl.origin;
}

function renderAnnouncementEmail(params: {
  sectionName: string;
  courseId: string;
  title: string;
  message: string;
  postedBy: string;
  recipientName: string;
  siteUrl: string;
}) {
  const safeSection = escapeHtml(params.sectionName);
  const safeCourse = escapeHtml(params.courseId);
  const safeTitle = escapeHtml(params.title);
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br/>");
  const safePostedBy = escapeHtml(params.postedBy || "Instructor");
  const safeRecipient = escapeHtml(params.recipientName || "Student");

  const html = `
  <div style="margin:0;background:#090A1D;padding:32px 12px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;border-radius:18px;overflow:hidden;background:linear-gradient(140deg,#5a3ff5,#7a5cff 40%,#4ac9ff);padding:1px;">
      <div style="background:#F8FAFC;padding:28px 24px;">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6B7280;">United Exams</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.2;color:#111827;">New class announcement</h1>
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">Hi ${safeRecipient}, ${safePostedBy} posted an update in <strong>${safeSection}</strong> (${safeCourse}).</p>
        <div style="margin:0 0 10px;border:1px solid #E5E7EB;border-radius:10px;padding:14px;background:#FFFFFF;">
          <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111827;">${safeTitle}</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">${safeMessage}</p>
        </div>
        <p style="margin:14px 0 0;">
          <a href="${params.siteUrl}/app/announcements" style="display:inline-block;background:linear-gradient(140deg,#5a3ff5,#6c4cff);color:#fff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600;">
            Open announcements
          </a>
        </p>
      </div>
    </div>
  </div>`;

  const text = `United Exams class announcement\n\nSection: ${params.sectionName} (${params.courseId})\nPosted by: ${params.postedBy}\n\n${params.title}\n\n${params.message}\n\nOpen announcements:\n${params.siteUrl}/app/announcements`;

  return { html, text };
}

export const runtime = "nodejs";

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
    return NextResponse.json({ error: "Invalid announcement payload." }, { status: 400 });
  }

  const { data: canPost, error: roleError } = await supabase.rpc("section_professor_exists", {
    section_id_input: payload.sectionId,
    user_id_input: user.id
  });

  if (roleError || !canPost) {
    return NextResponse.json({ error: "Only section professors can post announcements." }, { status: 403 });
  }

  const { error: insertError } = await supabase.from("section_announcements").insert({
    section_id: payload.sectionId,
    posted_by: user.id,
    title: payload.title,
    message_md: payload.message,
    send_email: payload.sendEmail
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  if (!payload.sendEmail) {
    return NextResponse.json({ ok: true });
  }

  const [{ data: sectionRow }, { data: profileRow }, recipientsResult] = await Promise.all([
    supabase
      .from("class_sections")
      .select("name, section_name, course_id")
      .eq("id", payload.sectionId)
      .maybeSingle(),
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.rpc("get_section_notification_recipients", { section_id_input: payload.sectionId })
  ]);

  const recipients = (recipientsResult.data ?? []) as RecipientRow[];
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, warning: "Announcement posted, but there were no enrolled students to email." });
  }

  const sectionName =
    (sectionRow?.name && sectionRow.name.trim()) ||
    (sectionRow?.section_name && sectionRow.section_name.trim()) ||
    "Untitled Section";
  const courseId = sectionRow?.course_id || "course";
  const postedBy = profileRow?.display_name || "Instructor";
  const siteUrl = resolveSiteUrl(request);

  const { data: studentMembers } = await supabase
    .from("section_members")
    .select("user_id")
    .eq("section_id", payload.sectionId)
    .eq("role", "student");
  const allowedStudentIds = new Set((studentMembers ?? []).map((row) => row.user_id));

  const uniqueRecipients = new Map<string, RecipientRow>();
  for (const recipient of recipients) {
    if (recipient.user_id === user.id) continue;
    if (!allowedStudentIds.has(recipient.user_id)) continue;
    const email = recipient.email?.trim().toLowerCase();
    if (!email) continue;
    const dedupeKey = recipient.user_id || email;
    if (!uniqueRecipients.has(dedupeKey)) uniqueRecipients.set(dedupeKey, recipient);
  }

  if (uniqueRecipients.size === 0) {
    return NextResponse.json({ ok: true, warning: "Announcement posted, but there were no student recipients to email." });
  }

  let failedCount = 0;
  for (const recipient of uniqueRecipients.values()) {
    const email = recipient.email.trim().toLowerCase();
    if (!email) continue;

    const { html, text } = renderAnnouncementEmail({
      sectionName,
      courseId,
      title: payload.title,
      message: payload.message,
      postedBy,
      recipientName: recipient.display_name,
      siteUrl
    });

    const mailResult = await sendMailerSendEmail({
      toEmail: email,
      subject: `New announcement — ${sectionName}`,
      html,
      text
    });

    if (!mailResult.ok) {
      failedCount += 1;
    }
  }

  if (failedCount > 0) {
    return NextResponse.json({
      ok: true,
      warning: `Announcement posted. ${failedCount} email${failedCount === 1 ? "" : "s"} failed to send.`
    });
  }

  return NextResponse.json({ ok: true });
}
