"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  isTurnstileClientEnabled
} from "@/lib/security/turnstile-client";
import { fetchUniversities } from "@/features/account/api";

function mapAuthError(message: string, captchaEnabled: boolean) {
  if (!message) return "Unable to create account.";
  const normalized = message.toLowerCase();
  if (
    captchaEnabled &&
    (normalized.includes("captcha") || normalized.includes("challenge") || normalized.includes("turnstile"))
  ) {
    return "Please complete the verification challenge and try again.";
  }
  return message;
}

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
    const query = universitySearch.trim().toLowerCase();
    if (!query) return universities.slice(0, 120);
    return universities.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 120);
  }, [universitySearch, universities]);

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
      setError("Supabase is not configured. Add environment variables first.");
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
      setError("You must accept the Privacy Policy and Terms of Service.");
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
          setError("Professor verification is not configured yet. Ask support to run the latest migration.");
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
      title="Create your account"
      subtitle="Set up your profile and start building exam mastery."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-text">
            Sign in
          </Link>
          {" · "}
          <Link href={guestReturnPath} className="font-semibold text-accent hover:text-text">
            Continue as guest
          </Link>
        </p>
      }
    >
      {activeEmail ? (
        <div className="space-y-3 rounded-xl border border-brand-2/35 bg-brand-2/10 p-4">
          <p className="text-sm text-text-secondary">
            You&apos;re already signed in as <span className="font-semibold text-text">{activeEmail}</span>.
          </p>
          <Button onClick={() => router.push("/app/dashboard")}>Go to dashboard</Button>
        </div>
      ) : checkInbox ? (
        <div className="space-y-3 rounded-xl border border-success/35 bg-success/10 p-4">
          <p className="text-lg font-semibold text-text">Check your inbox</p>
          <p className="text-sm text-muted">
            We sent a verification link to <span className="font-semibold text-text">{email}</span>. Verify your email before signing in.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                Display Name
              </label>
              <Input
                id="display-name"
                required
                value={displayName}
                maxLength={getDisplayNameMaxLength()}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="StudyPilot"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="real-name" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                Real Name (optional)
              </label>
              <Input
                id="real-name"
                value={realName}
                maxLength={getRealNameMaxLength()}
                onChange={(event) => setRealName(event.target.value)}
                placeholder="Alex Student"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/25 bg-transparent accent-[hsl(var(--accent))]"
              checked={showRealName}
              onChange={(event) => setShowRealName(event.target.checked)}
            />
            Show my real name on leaderboard
          </label>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "student", label: "Student", hint: "For studying and progress tracking." },
                { id: "professor", label: "Teacher", hint: "Creates sections, materials, and assignments." }
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRole(option.id)}
                  className={`rounded-xl border px-3 py-3 text-left ${
                    role === option.id
                      ? "border-brand-2/55 bg-brand-2/12 text-text"
                      : "border-borderc bg-soft text-text-secondary hover:bg-overlay"
                  }`}
                  aria-pressed={role === option.id}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-1 text-xs text-faint">{option.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {role === "professor" ? (
            <div className="space-y-4 rounded-xl border border-borderc bg-soft p-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                  University (required)
                </label>
                <Input
                  value={universitySearch}
                  onChange={(event) => setUniversitySearch(event.target.value)}
                  placeholder="Search your university"
                />
                <select
                  className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                  value={selectedUniversityId}
                  onChange={(event) => setSelectedUniversityId(event.target.value)}
                  disabled={loadingUniversities}
                >
                  <option value="">
                    {loadingUniversities ? "Loading universities..." : "Select your university"}
                  </option>
                  {filteredUniversities.map((university) => (
                    <option key={university.id} value={university.id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                  Professor verification code
                </label>
                <Input
                  value={professorCode}
                  onChange={(event) => setProfessorCode(event.target.value.toUpperCase())}
                  placeholder="Enter code from your university admin"
                  autoComplete="one-time-code"
                  maxLength={32}
                />
                <p className="text-xs text-faint">
                  Your university admin provides this code. Without it, teacher signup is denied.
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              Email
            </label>
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
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                Password
              </label>
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
              <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                Confirm Password
              </label>
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

          <label className="flex items-start gap-2 rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-white/25 bg-transparent accent-[hsl(var(--accent))]"
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

          {error ? (
            <p
              id={errorId}
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger outline-none"
            >
              {error}
            </p>
          ) : null}

          {turnstileEnabled ? (
            <TurnstileWidget
              key={captchaRenderKey}
              action="signup"
              onToken={setTurnstileToken}
              describedBy={error ? errorId : undefined}
            />
          ) : null}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
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
    <Suspense fallback={<div className="min-h-screen bg-[#050510]" />}>
      <SignupPageContent />
    </Suspense>
  );
}
