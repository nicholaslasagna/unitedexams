import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeWriteAuditLog } from "@/lib/security/audit";

const CHANGE_EMAIL_RATE_LIMIT_MS = 2 * 60 * 1000;

type ChangeEmailAction = "request" | "resend";

interface ChangeEmailPayload {
  action?: ChangeEmailAction;
  newEmail?: string;
  confirmEmail?: string;
  currentPassword?: string;
}

function normalizeEmail(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function isEmailFormatValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function redirectTargetFromRequest(request: NextRequest) {
  const fallback = request.nextUrl.origin;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\/$/, "");
  return `${siteUrl}/auth/callback?flow=email-change`;
}

async function readPayload(request: NextRequest): Promise<ChangeEmailPayload> {
  try {
    return (await request.json()) as ChangeEmailPayload;
  } catch {
    return {};
  }
}

async function getPendingRequestMeta(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string
) {
  const { data } = await supabase
    .from("email_change_requests")
    .select("new_email, requested_at, status")
    .eq("user_id", userId)
    .maybeSingle();

  return data ?? null;
}

function isRateLimited(requestedAtIso: string | null | undefined) {
  if (!requestedAtIso) return false;
  const requestedAt = new Date(requestedAtIso).getTime();
  if (Number.isNaN(requestedAt)) return false;
  const elapsed = Date.now() - requestedAt;
  return elapsed < CHANGE_EMAIL_RATE_LIMIT_MS;
}

async function addAuditLog(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  request: NextRequest,
  userId: string,
  action: string,
  metadata: Record<string, unknown>
) {
  await safeWriteAuditLog(supabase, request, {
    action,
    targetType: "user",
    targetId: userId,
    metadata
  });
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

  const body = await readPayload(request);
  const action: ChangeEmailAction = body.action === "resend" ? "resend" : "request";
  const emailRedirectTo = redirectTargetFromRequest(request);

  if (action === "resend") {
    const pending = await getPendingRequestMeta(supabase, user.id);

    if (!pending || pending.status !== "pending") {
      return NextResponse.json({ ok: true, message: "If possible, we sent a verification link." });
    }

    if (isRateLimited(pending.requested_at)) {
      return NextResponse.json(
        { error: "Please wait at least 2 minutes before requesting another email." },
        { status: 429 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser(
      { email: pending.new_email },
      { emailRedirectTo }
    );

    if (updateError) {
      return NextResponse.json(
        {
          error: "Unable to resend verification right now. Please try again."
        },
        { status: 400 }
      );
    }

    await supabase
      .from("email_change_requests")
      .update({ requested_at: new Date().toISOString(), status: "pending" })
      .eq("user_id", user.id);

    await addAuditLog(supabase, request, user.id, "email_change_resend", {
      new_email: pending.new_email
    });

    return NextResponse.json({
      ok: true,
      message: "Verification sent. Check your inbox.",
      pendingEmail: pending.new_email
    });
  }

  const currentEmail = normalizeEmail(user.email);
  const newEmail = normalizeEmail(body.newEmail);
  const confirmEmail = normalizeEmail(body.confirmEmail);
  const currentPassword = (body.currentPassword ?? "").trim();

  if (!currentEmail) {
    return NextResponse.json(
      { error: "Current account email is unavailable. Please sign in again." },
      { status: 400 }
    );
  }

  if (!newEmail || !confirmEmail) {
    return NextResponse.json({ error: "Enter and confirm your new email." }, { status: 400 });
  }

  if (newEmail !== confirmEmail) {
    return NextResponse.json({ error: "New email entries do not match." }, { status: 400 });
  }

  if (!isEmailFormatValid(newEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (newEmail === currentEmail) {
    return NextResponse.json(
      { error: "New email must be different from your current email." },
      { status: 400 }
    );
  }

  if (!currentPassword) {
    return NextResponse.json(
      { error: "Enter your current password to continue." },
      { status: 400 }
    );
  }

  const pending = await getPendingRequestMeta(supabase, user.id);
  if (isRateLimited(pending?.requested_at)) {
    return NextResponse.json(
      { error: "Please wait at least 2 minutes before requesting another email." },
      { status: 429 }
    );
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: currentEmail,
    password: currentPassword
  });

  if (reauthError) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const { error: changeError } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo }
  );

  if (changeError) {
    return NextResponse.json(
      {
        error: "Unable to start email change right now. Please try again."
      },
      { status: 400 }
    );
  }

  await supabase.from("email_change_requests").upsert({
    user_id: user.id,
    new_email: newEmail,
    requested_at: new Date().toISOString(),
    status: "pending",
    updated_at: new Date().toISOString()
  });

  await addAuditLog(supabase, request, user.id, "email_change_requested", {
    current_email: currentEmail,
    new_email: newEmail
  });

  return NextResponse.json({
    ok: true,
    message: "Verification sent. Check your inbox.",
    pendingEmail: newEmail
  });
}

export async function DELETE(request: NextRequest) {
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

  await supabase
    .from("email_change_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "pending");

  await supabase
    .from("email_change_requests")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "cancelled");

  await addAuditLog(supabase, request, user.id, "email_change_cancelled", {});

  return NextResponse.json({ ok: true, message: "Pending email change cancelled." });
}
