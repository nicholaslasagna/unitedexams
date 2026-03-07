"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { School, ShieldCheck, UserRoundPlus } from "lucide-react";
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
      subtitle="Choose your role, set your identity, and prepare the account for coursework, sections, and exam practice."
      eyebrow="New account setup"
      heroTitle={<>Build your study system from day one.</>}
      heroDescription="Student accounts move straight into courses and progress tracking. Professor accounts include university selection and verification before section creation goes live."
      heroStats={[
        { label: "Roles", value: "Student / Professor", detail: "One signup path with role-aware setup" },
        { label: "Verification", value: "University-linked", detail: "Professor onboarding is approval-gated" },
        { label: "Consent", value: "Required", detail: "Privacy and terms acceptance are logged at signup" }
      ]}
      heroAside={
        <div className="grid gap-3">
          {[
            {
              icon: UserRoundPlus,
              title: "Student accounts start immediately",
              detail: "Pick a display identity, verify your email, and move into courses, notes, homework, and quizzes."
            },
            {
              icon: School,
              title: "Professor accounts are university-scoped",
              detail: "Search for the accredited institution, then enter the admin-issued verification code to unlock sections."
            },
            {
              icon: ShieldCheck,
              title: "Consent and bot protection are built in",
              detail: "Signup records legal acceptance and uses human verification before the account is created."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-[1.2rem] border border-borderc bg-surface/75 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
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
        <div className="space-y-3 rounded-[1.3rem] border border-brand-2/35 bg-brand-2/10 p-4">
          <p className="text-sm text-text-secondary">
            You&apos;re already signed in as <span className="font-semibold text-text">{activeEmail}</span>.
          </p>
          <Button onClick={() => router.push("/app/dashboard")}>Go to dashboard</Button>
        </div>
      ) : checkInbox ? (
        <div className="space-y-4 rounded-[1.35rem] border border-success/35 bg-success/10 p-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-success">Account created</p>
            <p className="mt-2 text-lg font-semibold text-text">Check your inbox</p>
          </div>
          <p className="text-sm text-muted">
            We sent a verification link to <span className="font-semibold text-text">{email}</span>. Verify your email before signing in.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3 text-sm text-text-secondary">
              Open the verification email and confirm the account.
            </div>
            <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3 text-sm text-text-secondary">
              After verification, use the same email and password on the sign-in page.
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="rounded-[1.2rem] border border-borderc bg-soft p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Signup path</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3">
                <p className="text-xs font-semibold text-text">1. Identity</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">Set the display name, optional real name, and leaderboard preference.</p>
              </div>
              <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3">
                <p className="text-xs font-semibold text-text">2. Role setup</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">Students continue directly. Professors must choose a university and verification code.</p>
              </div>
              <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3">
                <p className="text-xs font-semibold text-text">3. Access + consent</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">Create credentials, accept legal terms, and complete human verification.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[1.2rem] border border-borderc bg-soft p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Identity</p>
              <p className="mt-1 text-sm text-text-secondary">These values set the profile students and instructors will recognize inside the app.</p>
            </div>

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
                <p className="text-xs text-faint">Visible across study, sections, and leaderboard surfaces.</p>
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
                <p className="text-xs text-faint">Used for formal context only if you choose to show it publicly.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-[1rem] border border-borderc bg-surface/70 px-3 py-3 text-sm text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/25 bg-transparent accent-[hsl(var(--accent))]"
                checked={showRealName}
                onChange={(event) => setShowRealName(event.target.checked)}
              />
              Show my real name on leaderboard
            </label>
          </div>

          <div className="space-y-4 rounded-[1.2rem] border border-borderc bg-soft p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Role setup</p>
              <p className="mt-1 text-sm text-text-secondary">Choose the workspace type this account should unlock.</p>
            </div>

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
                      : "border-borderc bg-surface/70 text-text-secondary hover:bg-overlay"
                  }`}
                  aria-pressed={role === option.id}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-1 text-xs text-faint">{option.hint}</p>
                </button>
              ))}
            </div>

            {role === "professor" ? (
              <div className="space-y-4 rounded-[1rem] border border-brand-2/30 bg-brand-2/10 p-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
                    University (required)
                  </label>
                  <Input
                    value={universitySearch}
                    onChange={(event) => setUniversitySearch(event.target.value)}
                    placeholder="Search your university"
                  />
                  <p className="text-xs text-faint">
                    {loadingUniversities
                      ? "Loading accredited universities..."
                      : `Showing ${visibleUniversityOptions.length} of ${universities.length} universities`}
                  </p>
                  <select
                    className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                    value={selectedUniversityId}
                    onChange={(event) => setSelectedUniversityId(event.target.value)}
                    disabled={loadingUniversities}
                  >
                    <option value="">
                      {loadingUniversities ? "Loading universities..." : "Select your university"}
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
            ) : (
              <div className="rounded-[1rem] border border-borderc bg-surface/70 px-4 py-3 text-sm text-text-secondary">
                Student accounts can complete signup immediately and choose courses after email verification.
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-[1.2rem] border border-borderc bg-soft p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Access and consent</p>
              <p className="mt-1 text-sm text-text-secondary">Create the sign-in credentials, accept the policies, and finish verification.</p>
            </div>

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

            <label className="flex items-start gap-2 rounded-[1rem] border border-borderc bg-surface/70 px-3 py-3 text-sm text-muted">
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
          </div>

          {error ? (
            <p
              id={errorId}
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className="rounded-[1rem] border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger outline-none"
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
            loadingLabel="Creating account..."
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
