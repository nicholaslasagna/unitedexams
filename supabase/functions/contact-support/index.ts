// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ContactPayload {
  subject?: string | null;
  category?: "Bug" | "Content request" | "Account help" | "Other";
  message?: string;
  currentUrl?: string | null;
  currentRoute?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required Edge Function secret: ${name}`);
  }
  return value;
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderContactEmail(input: {
  messageId: string;
  subject: string;
  category: string;
  message: string;
  userId: string;
  displayName: string;
  email: string;
  role: string;
  university: string | null;
  currentUrl: string | null;
  currentRoute: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  submittedAt: string;
  attemptsSummary: Array<{ quiz_set_id: string; score: number; completed_at: string | null }>;
}) {
  const attemptsHtml =
    input.attemptsSummary.length > 0
      ? `<ul style="margin:8px 0 0;padding-left:18px;color:#111827;font-size:13px;line-height:1.6;">
          ${input.attemptsSummary
            .map(
              (attempt) =>
                `<li><code>${escapeHtml(attempt.quiz_set_id)}</code> — score ${attempt.score}%${attempt.completed_at ? ` (${escapeHtml(attempt.completed_at)})` : ""}</li>`
            )
            .join("")}
        </ul>`
      : `<p style="margin:8px 0 0;font-size:13px;color:#4B5563;">No recent attempts found.</p>`;

  return `
  <div style="margin:0;background:#090A1D;padding:32px 12px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <div style="max-width:760px;margin:0 auto;border-radius:18px;overflow:hidden;background:linear-gradient(140deg,#5a3ff5,#7a5cff 40%,#4ac9ff);padding:1px;">
      <div style="background:#F8FAFC;padding:28px 24px;">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6B7280;">United Exams · Support</p>
        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;color:#111827;">New contact request</h1>
        <p style="margin:0 0 18px;font-size:14px;color:#374151;">
          Category: <strong>${escapeHtml(input.category)}</strong><br />
          Subject: <strong>${escapeHtml(input.subject)}</strong><br />
          Message ID: <code>${escapeHtml(input.messageId)}</code>
        </p>
        <div style="border:1px solid #D1D5DB;border-radius:12px;padding:12px 14px;background:#FFFFFF;">
          <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap;color:#111827;">${escapeHtml(input.message)}</p>
        </div>
        <h2 style="margin:20px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#6B7280;">User context</h2>
        <ul style="margin:0;padding-left:18px;color:#111827;font-size:13px;line-height:1.6;">
          <li>User ID: <code>${escapeHtml(input.userId)}</code></li>
          <li>Display name: ${escapeHtml(input.displayName)}</li>
          <li>Email: ${escapeHtml(input.email)}</li>
          <li>Role: ${escapeHtml(input.role)}</li>
          <li>University: ${escapeHtml(input.university ?? "Not set")}</li>
          <li>Current URL: ${escapeHtml(input.currentUrl ?? "Unknown")}</li>
          <li>Current route: ${escapeHtml(input.currentRoute ?? "Unknown")}</li>
          <li>User agent: ${escapeHtml(input.userAgent ?? "Unknown")}</li>
          <li>Approx IP: ${escapeHtml(input.ipAddress ?? "Unavailable")}</li>
          <li>Submitted: ${escapeHtml(input.submittedAt)}</li>
        </ul>
        <h2 style="margin:20px 0 10px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#6B7280;">Recent quiz attempts</h2>
        ${attemptsHtml}
        <p style="margin:22px 0 0;font-size:12px;color:#6B7280;">
          Owned by <a href="https://imagicaststudios.com" style="color:#5B3FF2;text-decoration:none;">Imagicast Studios</a>
        </p>
      </div>
    </div>
  </div>`;
}

async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = Deno.env.get("MAILERSEND_API_KEY");
  if (!apiKey) {
    return { ok: false, warning: "MAILERSEND_API_KEY is not configured." };
  }

  const fromEmail = Deno.env.get("MAILERSEND_FROM_EMAIL") || "no-reply@unitedexams.com";
  const fromName = Deno.env.get("MAILERSEND_FROM_NAME") || "United Exams";
  const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@unitedexams.com";

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: params.to }],
      reply_to: { email: supportEmail, name: "United Exams Support" },
      subject: params.subject,
      html: params.html,
      text: params.text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      ok: false,
      warning: `MailerSend error (${response.status}): ${detail.slice(0, 200)}`
    };
  }

  return { ok: true };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let supabaseUrl: string;
  let supabaseAnonKey: string;
  let supabaseServiceRoleKey: string;
  try {
    supabaseUrl = requireEnv("SUPABASE_URL");
    supabaseAnonKey = requireEnv("SUPABASE_ANON_KEY");
    supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  } catch (error) {
    return json(500, { error: (error as Error).message });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return json(401, { error: "Unauthorized" });
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const {
    data: { user },
    error: userError
  } = await anonClient.auth.getUser();
  if (userError || !user) {
    return json(401, { error: "Unauthorized" });
  }

  const payload = (await request.json().catch(() => ({}))) as ContactPayload;
  const message = (payload.message || "").trim();
  const category = payload.category || "Other";
  const subject = (payload.subject || "").trim() || "Support request";

  if (message.length < 20) {
    return json(400, { error: "Message must be at least 20 characters." });
  }

  if (!["Bug", "Content request", "Account help", "Other"].includes(category)) {
    return json(400, { error: "Invalid category." });
  }

  const [{ data: profile }, { data: attempts }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, display_name, email, role, university_id, universities(name)")
      .eq("id", user.id)
      .maybeSingle(),
    adminClient
      .from("attempts")
      .select("quiz_set_id, score, completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(3)
  ]);

  const displayName = (profile?.display_name as string | undefined) || user.user_metadata?.display_name || "Student";
  const userEmail = (user.email || (profile?.email as string | null) || "").trim();
  const userRole = (profile?.role as string | undefined) || "student";
  const universityName = ((profile?.universities as { name?: string }[] | null)?.[0]?.name as string | undefined) || null;
  const timestamp = new Date().toISOString();

  const meta = {
    current_url: payload.currentUrl || null,
    current_route: payload.currentRoute || null,
    user_agent: payload.userAgent || null,
    approximate_ip: payload.ipAddress || null,
    submitted_at: timestamp,
    recent_attempts: (attempts ?? []).map((row) => ({
      quiz_set_id: row.quiz_set_id,
      score: Number(row.score ?? 0),
      completed_at: row.completed_at
    }))
  };

  const { data: inserted, error: insertError } = await adminClient
    .from("contact_messages")
    .insert({
      user_id: user.id,
      email: userEmail || null,
      name: displayName,
      subject,
      category,
      message,
      meta,
      status: "open"
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return json(500, { error: "Unable to save contact message." });
  }

  const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@unitedexams.com";
  const html = renderContactEmail({
    messageId: inserted.id,
    subject,
    category,
    message,
    userId: user.id,
    displayName,
    email: userEmail || "unknown-email",
    role: userRole,
    university: universityName,
    currentUrl: payload.currentUrl || null,
    currentRoute: payload.currentRoute || null,
    userAgent: payload.userAgent || null,
    ipAddress: payload.ipAddress || null,
    submittedAt: timestamp,
    attemptsSummary: (attempts ?? []).map((row) => ({
      quiz_set_id: row.quiz_set_id as string,
      score: Number(row.score ?? 0),
      completed_at: row.completed_at as string | null
    }))
  });

  const text = `United Exams support message

Message ID: ${inserted.id}
Category: ${category}
Subject: ${subject}

From:
- user_id: ${user.id}
- display_name: ${displayName}
- email: ${userEmail || "unknown"}
- role: ${userRole}
- university: ${universityName || "Not set"}
- current_url: ${payload.currentUrl || "Unknown"}
- current_route: ${payload.currentRoute || "Unknown"}
- user_agent: ${payload.userAgent || "Unknown"}
- approximate_ip: ${payload.ipAddress || "Unavailable"}
- submitted_at: ${timestamp}

Message:
${message}`;

  const mailResult = await sendMail({
    to: supportEmail,
    subject: `[United Exams] ${category} — ${subject}`,
    html,
    text
  });

  if (!mailResult.ok) {
    return json(200, {
      ok: true,
      warning: mailResult.warning || "Message saved, but email delivery failed."
    });
  }

  return json(200, { ok: true });
});
