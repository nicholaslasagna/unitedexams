export interface MailSendInput {
  toEmail: string;
  subject: string;
  html: string;
  text: string;
}

export interface MailSendResult {
  ok: boolean;
  warning?: string;
}

export async function sendMailerSendEmail(input: MailSendInput): Promise<MailSendResult> {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    return { ok: false, warning: "MAILERSEND_API_KEY is not configured." };
  }

  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || "no-reply@unitedexams.com";
  const fromName = process.env.MAILERSEND_FROM_NAME || "United Exams";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@unitedexams.com";

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: input.toEmail }],
      reply_to: { email: supportEmail, name: "United Exams Support" },
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      ok: false,
      warning: `MailerSend error (${response.status}): ${detail.slice(0, 220)}`
    };
  }

  return { ok: true };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
