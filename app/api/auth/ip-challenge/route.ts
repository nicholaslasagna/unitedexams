import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createChallengeToken,
  extractClientIpFromHeaders,
  hashIpForStorage,
  hashTokenForChallenge,
  shouldRequireIpApproval,
  type UserRole
} from "@/lib/auth/ip-protection";

const inputSchema = z.object({
  action: z.enum(["send", "resend"]).optional()
});

const CHALLENGE_TTL_MINUTES = 15;
const CHALLENGE_LIMIT_PER_HOUR = 3;

function resolveSiteUrl(request: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return request.nextUrl.origin;
}

function renderApprovalEmail(params: {
  approveUrl: string;
  userAgent: string;
  issuedAtIso: string;
}) {
  const supportEmail = "support@unitedexams.com";
  const resetUrl = `${params.approveUrl.split("/auth/approve-login")[0]}/forgot-password`;
  const issuedAt = new Date(params.issuedAtIso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const html = `
  <div style="margin:0;background:#090A1D;padding:32px 12px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;border-radius:18px;overflow:hidden;background:linear-gradient(140deg,#5a3ff5,#7a5cff 40%,#4ac9ff);padding:1px;">
      <div style="background:#F8FAFC;padding:28px 24px;">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6B7280;">United Exams</p>
        <h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;color:#111827;">Approve new sign-in</h1>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
          We detected a new sign-in attempt. To continue, confirm it came from you.
        </p>
        <ul style="margin:0 0 18px;padding-left:18px;color:#374151;font-size:14px;line-height:1.6;">
          <li>Time: ${issuedAt}</li>
          <li>Device: ${params.userAgent}</li>
          <li>Link expires in ${CHALLENGE_TTL_MINUTES} minutes</li>
        </ul>
        <p style="margin:0 0 20px;">
          <a href="${params.approveUrl}" style="display:inline-block;background:linear-gradient(140deg,#5a3ff5,#6c4cff);color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">
            Approve sign-in
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#4B5563;">
          If this wasn&apos;t you, reset your password immediately:
          <a href="${resetUrl}" style="color:#5B3FF2;text-decoration:none;">Reset password</a>.
        </p>
        <p style="margin:0;font-size:12px;color:#6B7280;">
          Need help? Contact <a href="mailto:${supportEmail}" style="color:#5B3FF2;text-decoration:none;">${supportEmail}</a>.
        </p>
      </div>
    </div>
  </div>`;

  const text = `United Exams sign-in approval

We detected a new sign-in attempt.
Time: ${issuedAt}
Device: ${params.userAgent}

Approve sign-in (expires in ${CHALLENGE_TTL_MINUTES} minutes):
${params.approveUrl}

If this wasn't you, reset your password:
${resetUrl}

Support: ${supportEmail}`;

  return { html, text };
}

async function sendApprovalEmail(params: {
  toEmail: string;
  approveUrl: string;
  userAgent: string;
  issuedAtIso: string;
}) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    return { ok: false, warning: "MAILERSEND_API_KEY is not configured." };
  }

  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "no-reply@unitedexams.com";
  const fromName = process.env.MAILERSEND_FROM_NAME || "United Exams";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@unitedexams.com";
  const { html, text } = renderApprovalEmail({
    approveUrl: params.approveUrl,
    userAgent: params.userAgent,
    issuedAtIso: params.issuedAtIso
  });

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: params.toEmail }],
      reply_to: { email: supportEmail, name: "United Exams Support" },
      subject: "New sign-in to United Exams — approve?",
      html,
      text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { ok: false, warning: `MailerSend error (${response.status}): ${detail.slice(0, 180)}` };
  }

  return { ok: true };
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
    payload = inputSchema.parse(await request.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ error: "Invalid challenge payload." }, { status: 400 });
  }

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, mfa_enabled")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_preferences")
      .select("extra_signin_protection")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const requireIpApproval = shouldRequireIpApproval({
    role: (profile?.role ?? "student") as UserRole,
    mfaEnabled: Boolean(profile?.mfa_enabled),
    extraSigninProtection: Boolean(prefs?.extra_signin_protection)
  });

  if (!requireIpApproval) {
    return NextResponse.json({ ok: true, approved: true, requiresApproval: false });
  }

  const ipAddress = extractClientIpFromHeaders(request.headers);
  if (!ipAddress) {
    return NextResponse.json(
      { error: "Could not identify your current network. Try again in a moment." },
      { status: 400 }
    );
  }

  const ipHash = await hashIpForStorage(ipAddress);
  const { data: approvedEntry } = await supabase
    .from("login_ip_allowlist")
    .select("approved")
    .eq("user_id", user.id)
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (approvedEntry?.approved) {
    return NextResponse.json({ ok: true, approved: true, requiresApproval: true });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("login_ip_challenges")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= CHALLENGE_LIMIT_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many approval emails requested. Try again in about an hour." },
      { status: 429 }
    );
  }

  const token = createChallengeToken(32);
  const tokenHash = await hashTokenForChallenge(token);
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000).toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from("login_ip_challenges")
    .insert({
      user_id: user.id,
      ip_hash: ipHash,
      token_hash: tokenHash,
      expires_at: expiresAt
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: "Unable to create approval challenge." }, { status: 500 });
  }

  const siteUrl = resolveSiteUrl(request);
  const approveUrl = `${siteUrl}/auth/approve-login?token=${encodeURIComponent(token)}&cid=${encodeURIComponent(inserted.id)}`;
  if (!user.email) {
    return NextResponse.json(
      {
        error: "Your account email is unavailable. Contact support@unitedexams.com."
      },
      { status: 400 }
    );
  }

  const mailResult = await sendApprovalEmail({
    toEmail: user.email,
    approveUrl,
    userAgent: request.headers.get("user-agent")?.slice(0, 160) || "Unknown device",
    issuedAtIso: new Date().toISOString()
  });

  if (!mailResult.ok) {
    return NextResponse.json({
      ok: true,
      requiresApproval: true,
      warning:
        payload.action === "resend"
          ? mailResult.warning || "Email provider is unavailable."
          : "Challenge created, but email delivery is not configured yet."
    });
  }

  return NextResponse.json({
    ok: true,
    requiresApproval: true,
    challengeSent: true
  });
}
