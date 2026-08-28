"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, GraduationCap, School } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrength } from "@/components/auth/password-strength";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveNextAfterLogin } from "@/lib/auth/guards";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UniversityRecord } from "@/lib/supabase/types";
import { validatePassword } from "@/lib/auth/password";
import {
  getDisplayNameMaxLength,
  getRealNameMaxLength,
  normalizeDisplayName,
  normalizeRealName,
  validateRealName,
  validateDisplayName
} from "@/lib/auth/display-name";
import { isTurnstileClientEnabled } from "@/lib/security/turnstile-client";
import { fetchUniversities } from "@/features/account/api";
import { cn } from "@/lib/utils";

function mapAuthError(message: string, captchaEnabled: boolean) {
  if (!message) return "Unable to create account.";
  const normalized = message.toLowerCase();
  if (
    captchaEnabled &&
    (normalized.includes("captcha") || normalized.includes("challenge") || normalized.includes("turnstile"))
  ) {
    return "Please complete the verification challenge and try again.";
  }
  if (normalized.includes("user already registered") || normalized.includes("already exists")) {
    return "An account with that email already exists. Try signing in instead.";
  }
  return message;
}

function normalizeUniversitySearch(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ");
}

function formatUniversityLabel(university: UniversityRecord) {
  const suffix = [university.state, university.country].filter(Boolean).join(" - ");
  return suffix ? `${university.name} (${suffix})` : university.name;
}

function FieldLabel({
  htmlFor,
  children,
  hint
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-semibold text-text"
      >
        {children}
      </label>
      {hint ? (
        <span className="text-[11.5px] text-text-secondary">{hint}</span>
      ) : null}
    </div>
  );
}

/**
 * Sign-up form — Stripe-style.
 *
 * Single auth card on the flowing gradient background. Clean field
 * groups with proper labels + small helper text — no verbose
 * "1. Identity / 2. Role / 3. Access" preview cards crowding the form.
 *
 * Behavior unchanged: display + real name, role toggle (student /
 * professor), university picker for professors with verification code,
 * email + password (with live strength meter), legal accept, Turnstile
 * captcha when configured.
 */
function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [displayName, setDisplayName] = useState("");
  const [realName, setRealName] = useState("");
  const [showRealName, setShowRealName] = useState(false);
  const [role, setRole] = useState<"student" | "professor">("student");
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [universitySearch, setUniversitySearch] = useState("");
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [professorCode, setProfessorCode] = useState("");
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaRenderKey, setCaptchaRenderKey] = useState(0);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  const next = resolveNextAfterLogin(searchParams.get("next"));
  const guestReturnPath = next.startsWith("/app/") ? "/courses" : next;
  const turnstileEnabled = isTurnstileClientEnabled();
  const errorId = "signup-form-error";

  const filteredUniversities = useMemo(() => {
    const query = normalizeUniversitySearch(universitySearch);
    if (!query) return universities;

    const startsWith: UniversityRecord[] = [];
    const includes: UniversityRecord[] = [];

    for (const item of universities) {
      const haystack = normalizeUniversitySearch(
        [item.name, item.state, item.country].filter(Boolean).join(" ")
      );

      if (!haystack.includes(query)) continue;
      if (haystack.startsWith(query)) {
        startsWith.push(item);
      } else {
        includes.push(item);
      }
    }

    return [...startsWith, ...includes];
  }, [universitySearch, universities]);

  const selectedUniversity = useMemo(
    () => universities.find((item) => item.id === selectedUniversityId),
    [universities, selectedUniversityId]
  );
  const visibleUniversityOptions = useMemo(() => {
    if (!selectedUniversity) return filteredUniversities;
    if (filteredUniversities.some((item) => item.id === selectedUniversity.id)) return filteredUniversities;
    return [selectedUniversity, ...filteredUniversities];
  }, [filteredUniversities, selectedUniversity]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    if (!activeEmail) return;
    router.replace("/app/dashboard");
  }, [activeEmail, router]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setActiveEmail(data.user?.email ?? null);
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setActiveEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    setLoadingUniversities(true);
    fetchUniversities(supabase)
      .then((rows) => {
        if (!active) return;
        setUniversities(rows);
      })
      .catch(() => {
        if (!active) return;
        setUniversities([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingUniversities(false);
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Sign-up is temporarily unavailable.");
      return;
    }

    const { data: existingSession } = await supabase.auth.getUser();
    if (existingSession.user) {
      setError("You are already signed in. Sign out before creating a different account.");
      router.replace("/app/dashboard");
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the verification challenge.");
      return;
    }

    if (!acceptLegal) {
      setError("Please accept the Privacy Policy and Terms of Service.");
      return;
    }

    if (role === "professor") {
      if (!selectedUniversityId) {
        setError("Teachers must select their university.");
        return;
      }
      if (professorCode.trim().length < 6) {
        setError("Enter your university-issued professor verification code.");
        return;
      }

      const { data: codeValid, error: codeError } = await supabase.rpc(
        "validate_professor_verification_code",
        {
          university_id_input: selectedUniversityId,
          code_input: professorCode.trim()
        }
      );
      if (codeError) {
        const normalized = (codeError.message || "").toLowerCase();
        if (normalized.includes("function") && normalized.includes("does not exist")) {
          setError("Instructor verification isn’t available right now. Contact support and we’ll get your account set up.");
        } else {
          setError(codeError.message);
        }
        return;
      }
      if (!codeValid) {
        setError("That professor verification code is invalid or expired.");
        return;
      }
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      setError(validation.message ?? "Please use a stronger password.");
      return;
    }

    const displayNameCheck = validateDisplayName(displayName);
    if (!displayNameCheck.valid) {
      setError(displayNameCheck.message);
      return;
    }
    const realNameCheck = validateRealName(realName);
    if (!realNameCheck.valid) {
      setError(realNameCheck.message);
      return;
    }

    const normalizedDisplayName = normalizeDisplayName(displayName);
    const normalizedRealName = normalizeRealName(realName);

    setLoading(true);
    const redirectTo = `${window.location.origin}/login`;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        captchaToken: turnstileEnabled ? (turnstileToken ?? "") : undefined,
        emailRedirectTo: redirectTo,
        data: {
          display_name: normalizedDisplayName,
          real_name: normalizedRealName || null,
          show_real_name: showRealName,
          role,
          university_id: role === "professor" ? selectedUniversityId : null,
          professor_code: role === "professor" ? professorCode.trim() : null
        }
      }
    });
    setCaptchaRenderKey((value) => value + 1);
    setTurnstileToken(null);

    setLoading(false);

    if (signUpError) {
      setError(mapAuthError(signUpError.message, turnstileEnabled));
      return;
    }

    if (data.user) {
      const legalVersion = "2026-03-04";
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email.trim(),
        display_name: normalizedDisplayName,
        real_name: normalizedRealName || null,
        show_real_name: showRealName,
        university_id: role === "professor" ? selectedUniversityId : null,
        privacy_version_accepted: legalVersion,
        terms_version_accepted: legalVersion
      });

      if (profileError) {
        console.error("[signup] profile upsert failed", profileError);
      }

      const { error: consentError } = await supabase.from("legal_consents").insert([
        {
          user_id: data.user.id,
          doc_type: "privacy",
          doc_version: legalVersion,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null
        },
        {
          user_id: data.user.id,
          doc_type: "terms",
          doc_version: legalVersion,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null
        }
      ]);
      if (consentError) {
        console.error("[signup] legal consent insert failed", consentError);
      }
    }

    setCheckInbox(true);
  };

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Take 30 seconds. We'll set up the workspace for the courses you're actually taking."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-text">
            Sign in
          </Link>
          <span className="mx-2 text-text-secondary/50">·</span>
          <Link href={guestReturnPath} className="text-text-secondary hover:text-text">
            Continue as guest
          </Link>
        </p>
      }
    >
      {activeEmail ? (
        <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <p className="text-[13.5px] text-text">
            You&apos;re already signed in as{" "}
            <span className="font-semibold">{activeEmail}</span>.
          </p>
          <Button onClick={() => router.push("/app/dashboard")}>Go to dashboard</Button>
        </div>
      ) : checkInbox ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-success/35 bg-success/10 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-text">Check your inbox</p>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                We sent a verification link to{" "}
                <span className="font-semibold text-text">{email}</span>. Verify
                your email, then come back to sign in.
              </p>
            </div>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {/* ── Identity ─────────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel
                htmlFor="display-name"
                hint="Visible publicly"
              >
                Display name
              </FieldLabel>
              <Input
                id="display-name"
                required
                value={displayName}
                maxLength={getDisplayNameMaxLength()}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="StudyPilot"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel
                htmlFor="real-name"
                hint="Optional"
              >
                Real name
              </FieldLabel>
              <Input
                id="real-name"
                value={realName}
                maxLength={getRealNameMaxLength()}
                onChange={(event) => setRealName(event.target.value)}
                placeholder="Alex Student"
                autoComplete="name"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-text-secondary">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-borderc bg-soft accent-[hsl(var(--accent))]"
              checked={showRealName}
              onChange={(event) => setShowRealName(event.target.checked)}
            />
            Show my real name on the leaderboard
          </label>

          {/* ── Role ─────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-text">I am a…</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                {
                  id: "student" as const,
                  label: "Student",
                  hint: "Quizzes, walkthroughs, exam prep",
                  icon: GraduationCap
                },
                {
                  id: "professor" as const,
                  label: "Teacher",
                  hint: "Sections, assignments, grading",
                  icon: School
                }
              ]).map((option) => {
                const active = role === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                      active
                        ? "border-accent bg-accent/10 text-text"
                        : "border-borderc bg-soft text-text-secondary hover:border-border-bright hover:bg-overlay"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                        active
                          ? "border-accent/40 bg-accent/15 text-accent"
                          : "border-borderc bg-surface text-text-secondary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-semibold text-text">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-text-secondary">
                        {option.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Professor extras ─────────────────────────── */}
          {role === "professor" ? (
            <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/5 p-4">
              <div className="space-y-1.5">
                <FieldLabel hint="Required">University</FieldLabel>
                <Input
                  value={universitySearch}
                  onChange={(event) => setUniversitySearch(event.target.value)}
                  placeholder="Search your university"
                />
                <select
                  aria-label="University"
                  className="h-11 w-full rounded-lg border border-borderc bg-surface px-3 text-[13.5px] text-text focus:border-accent/50 focus:outline-none"
                  value={selectedUniversityId}
                  onChange={(event) => setSelectedUniversityId(event.target.value)}
                  disabled={loadingUniversities}
                >
                  <option value="">
                    {loadingUniversities ? "Loading universities…" : "Select your university"}
                  </option>
                  {!loadingUniversities && visibleUniversityOptions.length === 0 ? (
                    <option disabled value="">
                      No universities found for that search
                    </option>
                  ) : null}
                  {visibleUniversityOptions.map((university) => (
                    <option key={university.id} value={university.id}>
                      {formatUniversityLabel(university)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <FieldLabel hint="From your admin">Professor verification code</FieldLabel>
                <Input
                  value={professorCode}
                  onChange={(event) => setProfessorCode(event.target.value.toUpperCase())}
                  placeholder="Code from your university admin"
                  autoComplete="one-time-code"
                  maxLength={32}
                />
                <p className="text-[11.5px] text-text-secondary">
                  Without a valid code, teacher signup is denied.
                </p>
              </div>
            </div>
          ) : null}

          {/* ── Credentials ──────────────────────────────── */}
          <div className="space-y-1.5">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@university.edu"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••••"
              />
            </div>
          </div>

          <PasswordStrength password={password} />

          {/* ── Legal ───────────────────────────────────── */}
          <label className="flex items-start gap-2 text-[13px] text-text-secondary">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-borderc bg-soft accent-[hsl(var(--accent))]"
              checked={acceptLegal}
              onChange={(event) => setAcceptLegal(event.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link href="/privacy" className="font-semibold text-accent hover:text-text">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-semibold text-accent hover:text-text">
                Terms of Service
              </Link>
              .
            </span>
          </label>

          {/* ── Inline error ────────────────────────────── */}
          {error ? (
            <p
              id={errorId}
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 text-[13px] text-danger outline-none"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          ) : null}

          {/* ── Captcha (when configured) ───────────────── */}
          {turnstileEnabled ? (
            <div className="pt-1">
              <TurnstileWidget
                key={captchaRenderKey}
                action="signup"
                onToken={setTurnstileToken}
                describedBy={error ? errorId : undefined}
              />
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
            loadingLabel="Creating account…"
            disabled={
              !acceptLegal ||
              (turnstileEnabled && !turnstileToken) ||
              (role === "professor" && (!selectedUniversityId || !professorCode.trim()))
            }
          >
            Create account
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <SignupPageContent />
    </Suspense>
  );
}
