"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Download, ShieldCheck, Smartphone, Trash2, Upload } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemePalettePicker } from "@/components/ui/theme-palette-picker";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { validatePassword } from "@/lib/auth/password";
import { getPaletteById } from "@/lib/theme/palettes";

interface MfaFactor {
  id: string;
  status: string;
  friendly_name?: string;
  factor_type?: string;
}

interface MfaListResult {
  data?: { all?: MfaFactor[]; totp?: MfaFactor[] };
  error?: { message?: string };
}

interface MfaEnrollResult {
  data?: { id?: string; totp?: { qr_code?: string } };
  error?: { message?: string };
}

interface MfaChallengeResult {
  data?: { id?: string };
  error?: { message?: string };
}

interface MfaVerifyResult {
  error?: { message?: string };
}

interface MfaApi {
  listFactors?: () => Promise<MfaListResult>;
  enroll?: (params: { factorType: string; friendlyName?: string }) => Promise<MfaEnrollResult>;
  challenge?: (params: { factorId: string }) => Promise<MfaChallengeResult>;
  verify?: (params: { factorId: string; challengeId: string; code: string }) => Promise<MfaVerifyResult>;
  unenroll?: (params: { factorId: string }) => Promise<MfaVerifyResult>;
}

interface PendingEmailChange {
  new_email: string;
  requested_at: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface TrustedIpEntry {
  ipHash: string;
  maskedIp: string;
  approved: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  approvedAt: string | null;
}

export default function SettingsPage() {
  const {
    ready,
    preferences,
    savePreferences,
    exportData,
    importData,
    user,
    supabase,
    profile
  } = useAppData();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState<PendingEmailChange | null>(null);
  const [trustedIps, setTrustedIps] = useState<TrustedIpEntry[]>([]);
  const [trustedIpsLoading, setTrustedIpsLoading] = useState(false);
  const [trustedIpsBusy, setTrustedIpsBusy] = useState<string | null>(null);

  const [factors, setFactors] = useState<MfaFactor[]>([]);
  const [mfaCode, setMfaCode] = useState("");
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [pendingQrSvg, setPendingQrSvg] = useState<string | null>(null);
  const [mfaBusy, setMfaBusy] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const mfaApi = useMemo<MfaApi | undefined>(() => {
    if (!supabase) return undefined;
    const authWithMfa = supabase.auth as unknown as { mfa?: MfaApi };
    return authWithMfa.mfa;
  }, [supabase]);

  const currentEmail = user?.email || profile.email || "";
  const isDarkPreview = useMemo(() => {
    if (preferences.theme === "dark") return true;
    if (preferences.theme === "light") return false;
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [preferences.theme]);

  const loadPendingEmailChange = useCallback(async () => {
    if (!supabase || !user) {
      setPendingEmailChange(null);
      return;
    }
    const { data } = await supabase
      .from("email_change_requests")
      .select("new_email, requested_at, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();
    setPendingEmailChange((data as PendingEmailChange | null) ?? null);
  }, [supabase, user]);

  const refreshMfa = async () => {
    if (!mfaApi || typeof mfaApi.listFactors !== "function") return;
    const result = (await mfaApi.listFactors()) as {
      data?: { all?: MfaFactor[]; totp?: MfaFactor[] };
      error?: { message?: string };
    };
    if (result.error) return;
    const next = result.data?.all ?? result.data?.totp ?? [];
    setFactors(next);

    if (supabase && user) {
      await supabase
        .from("profiles")
        .update({ mfa_enabled: next.length > 0 })
        .eq("id", user.id);
    }
  };

  const loadTrustedIps = useCallback(async () => {
    if (!user) {
      setTrustedIps([]);
      return;
    }

    setTrustedIpsLoading(true);
    try {
      const response = await fetch("/api/auth/trusted-ips", {
        method: "GET",
        cache: "no-store"
      });
      const payload = (await response.json()) as {
        items?: TrustedIpEntry[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load trusted networks.");
      }

      setTrustedIps(payload.items ?? []);
    } catch (error) {
      setTrustedIps([]);
      push({
        title: "Unable to load trusted networks",
        description: (error as Error).message,
        tone: "error"
      });
    } finally {
      setTrustedIpsLoading(false);
    }
  }, [push, user]);

  useEffect(() => {
    refreshMfa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfaApi]);

  useEffect(() => {
    void loadPendingEmailChange();
  }, [loadPendingEmailChange]);

  useEffect(() => {
    void loadTrustedIps();
  }, [loadTrustedIps]);

  const updatePreferences = async (
    updater: (prev: typeof preferences) => typeof preferences,
    successTitle?: string
  ) => {
    try {
      const next = updater(preferences);
      await savePreferences(next);
      if (successTitle) {
        push({ title: successTitle, tone: "success" });
      }
    } catch (error) {
      push({
        title: "Unable to update appearance settings",
        description: (error as Error).message,
        tone: "error"
      });
    }
  };

  const applyPalettePreset = async (presetId: string) => {
    const preset = getPaletteById(presetId);
    if (!preset) return;
    await updatePreferences(
      (prev) => ({
        ...prev,
        palette: preset.id,
        accentPreset: preset.id,
        accentHue: preset.hue,
        accentSaturation: preset.saturation,
        accentLightness: preset.lightness,
        accentStrength: preset.strength
      }),
      "Accent palette updated"
    );
  };

  const applyCustomAccent = async (next: {
    hue: number;
    saturation: number;
    lightness: number;
    strength: number;
  }) => {
    await updatePreferences((prev) => ({
      ...prev,
      palette: "custom",
      accentPreset: "custom",
      accentHue: next.hue,
      accentSaturation: next.saturation,
      accentLightness: next.lightness,
      accentStrength: next.strength
    }));
  };

  const onExport = async () => {
    const localData = await exportData();
    let exportPayload: unknown = localData;

    if (supabase && user?.id) {
      const prefPromise = supabase
        .from("user_preferences")
        .select(
          "theme_mode, accent_preset, accent_hue, accent_saturation, accent_lightness, accent_strength, reduce_motion, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      const [profileRow, prefRow, userCoursesRows, attemptsRows, masteryRows] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, display_name, real_name, show_real_name, show_university, university_id, role, created_at, updated_at")
          .eq("id", user.id)
          .maybeSingle(),
        prefPromise,
        supabase
          .from("user_courses")
          .select("course_id, created_at")
          .eq("user_id", user.id),
        supabase
          .from("attempts")
          .select("id, quiz_set_id, score, correct_count, total_count, time_spent_seconds, completed_at, created_at, points_earned")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("mastery_by_topic")
          .select("course_id, tag, mastery, attempts_count, correct_count, updated_at")
          .eq("user_id", user.id)
      ]);

      exportPayload = {
        ...localData,
        supabase: {
          profile: profileRow.data ?? null,
          preferences: (prefRow.data as Record<string, unknown> | null) ?? null,
          user_courses: userCoursesRows.data ?? [],
          attempts_summary: attemptsRows.data ?? [],
          mastery: masteryRows.data ?? []
        }
      };
    }

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `united-exams-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(href);
    push({ title: "Data export created", tone: "success" });
  };

  const onImportClick = () => {
    fileRef.current?.click();
  };

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      push({ title: "Data imported successfully", tone: "success" });
    } catch {
      push({ title: "Import failed", description: "Please use a valid export JSON file.", tone: "error" });
    }
  };

  const changePassword = async () => {
    if (!supabase || !user?.email) {
      push({ title: "Supabase is not configured.", tone: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      push({ title: "Passwords do not match", tone: "error" });
      return;
    }

    if (currentPassword === newPassword) {
      push({ title: "New password must differ from current password", tone: "error" });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      push({ title: "Password requirements not met", description: validation.message, tone: "error" });
      return;
    }

    setSavingPassword(true);

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (reauthError) {
      setSavingPassword(false);
      push({ title: "Current password is incorrect", tone: "error" });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setSavingPassword(false);
      push({ title: "Unable to change password", description: updateError.message, tone: "error" });
      return;
    }

    await supabase
      .from("profiles")
      .update({
        reset_required: false,
        password_changed_at: new Date().toISOString()
      })
      .eq("id", user.id);

    setSavingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    push({ title: "Password updated", tone: "success" });
  };

  const requestEmailChange = async () => {
    if (!supabase || !user) {
      push({ title: "You must be signed in to change email.", tone: "error" });
      return;
    }

    const nextEmail = newEmail.trim().toLowerCase();
    const confirmEmailValue = confirmNewEmail.trim().toLowerCase();

    if (!nextEmail || !confirmEmailValue) {
      push({ title: "Enter and confirm your new email.", tone: "error" });
      return;
    }
    if (nextEmail !== confirmEmailValue) {
      push({ title: "New email entries do not match.", tone: "error" });
      return;
    }
    if (nextEmail === currentEmail.trim().toLowerCase()) {
      push({ title: "New email must differ from your current email.", tone: "error" });
      return;
    }
    if (!emailPassword.trim()) {
      push({ title: "Enter your current password to continue.", tone: "error" });
      return;
    }

    setEmailBusy(true);
    try {
      const response = await fetch("/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          newEmail: nextEmail,
          confirmEmail: confirmEmailValue,
          currentPassword: emailPassword
        })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        pendingEmail?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to request email change.");
      }

      setPendingEmailChange({
        new_email: payload.pendingEmail || nextEmail,
        requested_at: new Date().toISOString(),
        status: "pending"
      });
      setEmailPassword("");
      push({
        title: "Verification email sent",
        description: payload.message || "Check your inbox to confirm the new email.",
        tone: "success"
      });
    } catch (error) {
      push({ title: "Unable to change email", description: (error as Error).message, tone: "error" });
    } finally {
      setEmailBusy(false);
    }
  };

  const resendEmailChange = async () => {
    setEmailBusy(true);
    try {
      const response = await fetch("/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend" })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        pendingEmail?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to resend verification.");
      }

      await loadPendingEmailChange();
      push({
        title: "Verification sent",
        description: payload.message || "If possible, we sent another verification email.",
        tone: "success"
      });
    } catch (error) {
      push({ title: "Unable to resend", description: (error as Error).message, tone: "error" });
    } finally {
      setEmailBusy(false);
    }
  };

  const cancelEmailChange = async () => {
    setEmailBusy(true);
    try {
      const response = await fetch("/auth/change-email", { method: "DELETE" });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to cancel email change.");
      }
      setPendingEmailChange(null);
      push({
        title: "Pending change cancelled",
        description: payload.message || "Email change request has been cancelled.",
        tone: "success"
      });
    } catch (error) {
      push({ title: "Unable to cancel", description: (error as Error).message, tone: "error" });
    } finally {
      setEmailBusy(false);
    }
  };

  const revokeTrustedIp = async (ipHash: string) => {
    setTrustedIpsBusy(ipHash);
    try {
      const response = await fetch("/api/auth/trusted-ips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipHash })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to revoke trusted network.");
      }
      await loadTrustedIps();
      push({ title: "Trusted network revoked", tone: "success" });
    } catch (error) {
      push({
        title: "Unable to revoke trusted network",
        description: (error as Error).message,
        tone: "error"
      });
    } finally {
      setTrustedIpsBusy(null);
    }
  };

  const enrollMfa = async () => {
    if (!mfaApi || typeof mfaApi.enroll !== "function") {
      push({ title: "MFA API not available in this environment.", tone: "error" });
      return;
    }

    setMfaBusy(true);

    const enrollResult = (await mfaApi.enroll({
      factorType: "totp",
      friendlyName: "United Exams Authenticator"
    })) as {
      data?: { id?: string; totp?: { qr_code?: string } };
      error?: { message?: string };
    };

    setMfaBusy(false);

    if (enrollResult.error || !enrollResult.data?.id) {
      push({ title: "Failed to start MFA setup", description: enrollResult.error?.message, tone: "error" });
      return;
    }

    setPendingFactorId(enrollResult.data.id);
    setPendingQrSvg(enrollResult.data.totp?.qr_code ?? null);
    push({ title: "Scan the QR code and enter a 6-digit code", tone: "success" });
  };

  const verifyMfa = async () => {
    if (!pendingFactorId || !mfaApi || typeof mfaApi.challenge !== "function" || typeof mfaApi.verify !== "function") {
      return;
    }
    if (!mfaCode.trim()) return;

    setMfaBusy(true);

    const challengeResult = (await mfaApi.challenge({ factorId: pendingFactorId })) as {
      data?: { id?: string };
      error?: { message?: string };
    };

    if (challengeResult.error || !challengeResult.data?.id) {
      setMfaBusy(false);
      push({ title: "Could not start MFA verification", description: challengeResult.error?.message, tone: "error" });
      return;
    }

    const verifyResult = (await mfaApi.verify({
      factorId: pendingFactorId,
      challengeId: challengeResult.data.id,
      code: mfaCode.trim()
    })) as { error?: { message?: string } };

    setMfaBusy(false);

    if (verifyResult.error) {
      push({ title: "Invalid MFA code", description: verifyResult.error.message, tone: "error" });
      return;
    }

    push({ title: "2FA enabled", tone: "success" });
    setPendingFactorId(null);
    setPendingQrSvg(null);
    setMfaCode("");
    refreshMfa();
  };

  const disableFactor = async (factorId: string) => {
    if (!mfaApi || typeof mfaApi.unenroll !== "function") return;
    setMfaBusy(true);
    const result = (await mfaApi.unenroll({ factorId })) as { error?: { message?: string } };
    setMfaBusy(false);
    if (result.error) {
      push({ title: "Unable to disable factor", description: result.error.message, tone: "error" });
      return;
    }
    push({ title: "2FA factor removed", tone: "success" });
    refreshMfa();
  };

  const deleteAccount = async () => {
    if (!supabase || !user) return;
    if (deletePhrase.trim() !== "DELETE") {
      push({ title: "Type DELETE to confirm account deletion", tone: "error" });
      return;
    }

    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc("delete_my_account", {
        confirmation_text: deletePhrase.trim()
      });
      if (error) {
        throw error;
      }
      await supabase.auth.signOut();
      push({ title: "Account deleted", tone: "success" });
      window.location.href = "/signup";
    } catch (error) {
      push({ title: "Unable to delete account", description: (error as Error).message, tone: "error" });
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52" />
        <Skeleton className="h-72" />
        <Skeleton className="h-52" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted">Theme, personalization, security, and data portability.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Appearance</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Theme mode</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["dark", "light", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                      preferences.theme === theme
                        ? "border-brand-2/55 bg-brand-2/10 text-text"
                        : "border-borderc text-muted"
                    }`}
                    onClick={() => void updatePreferences((prev) => ({ ...prev, theme }), "Theme updated")}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-borderc bg-soft p-3">
              <ThemePalettePicker
                palette={preferences.palette}
                customHue={preferences.accentHue}
                customSaturation={preferences.accentSaturation}
                customLightness={preferences.accentLightness}
                customStrength={preferences.accentStrength}
                isDark={isDarkPreview}
                onPaletteChange={(paletteId) => {
                  if (paletteId === "custom") {
                    void applyCustomAccent({
                      hue: preferences.accentHue,
                      saturation: preferences.accentSaturation,
                      lightness: preferences.accentLightness,
                      strength: preferences.accentStrength
                    });
                    return;
                  }
                  void applyPalettePreset(paletteId);
                }}
                onCustomChange={(next) => {
                  void applyCustomAccent(next);
                }}
              />
            </div>

            <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
              <span>
                <span className="block text-sm font-semibold text-text">Reduced motion</span>
                <span className="text-xs text-muted">Respect animations/motion preference.</span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                checked={preferences.reducedMotion}
                onChange={(event) =>
                  void updatePreferences(
                    (prev) => ({ ...prev, reducedMotion: event.target.checked }),
                    "Motion preference saved"
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
              <span>
                <span className="block text-sm font-semibold text-text">Celebration confetti</span>
                <span className="text-xs text-muted">Only for personal-best milestones.</span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                checked={preferences.confettiEnabled}
                onChange={(event) =>
                  void updatePreferences(
                    (prev) => ({ ...prev, confettiEnabled: event.target.checked }),
                    "Celebration setting saved"
                  )
                }
              />
            </label>

            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Live preview</p>
              <p className="mt-1 text-xs text-muted">Buttons, chips, focus ring, progress, and card depth update instantly.</p>

              <div className="mt-3 space-y-3 rounded-xl border border-borderc bg-surface p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">
                    Secondary
                  </Button>
                  <Button variant="ghost" size="sm">
                    Ghost
                  </Button>
                  <Badge tone="accent">Accent tag</Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Progress</p>
                  <ProgressBar value={72} />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Input + focus state</p>
                  <Input
                    value="Focus me with Tab"
                    readOnly
                    className="focus-visible:ring-2 focus-visible:ring-accent/65"
                    aria-label="Appearance preview focus input"
                  />
                </div>

                <div className="rounded-lg border border-borderc bg-soft px-3 py-2 text-sm">
                  <p className="font-semibold text-text">Preview card title</p>
                  <p className="text-xs text-muted">
                    <a href="#0" className="font-semibold text-accent underline-offset-2 hover:underline">
                      Accent link
                    </a>{" "}
                    remains readable in both themes.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Security</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Email</p>
              <p className="mt-1 text-xs text-muted">
                Change your login email safely. You&apos;ll keep access with your current email until the new one is verified.
              </p>

              <div className="mt-3 space-y-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Current email</label>
                  <Input value={currentEmail} readOnly className="opacity-85" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">New email</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    placeholder="you@new-university.edu"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Confirm new email</label>
                  <Input
                    type="email"
                    value={confirmNewEmail}
                    onChange={(event) => setConfirmNewEmail(event.target.value)}
                    placeholder="Repeat your new email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Current password</label>
                  <Input
                    type="password"
                    value={emailPassword}
                    onChange={(event) => setEmailPassword(event.target.value)}
                    placeholder="Re-authenticate to change email"
                  />
                </div>
              </div>

              <p className="mt-2 text-xs text-muted">You&apos;ll need to confirm from your inbox.</p>

              <Button className="mt-3" onClick={requestEmailChange} loading={emailBusy}>
                Send verification to new email
              </Button>

              {pendingEmailChange ? (
                <div className="mt-3 rounded-lg border border-brand-2/35 bg-brand-2/10 p-3">
                  <p className="text-sm font-semibold text-text">
                    Email change pending confirmation for:{" "}
                    <span className="font-mono text-brand-2">{pendingEmailChange.new_email}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Requested {new Date(pendingEmailChange.requested_at).toLocaleString()}.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={resendEmailChange} disabled={emailBusy}>
                      Resend confirmation
                    </Button>
                    <Button variant="ghost" onClick={cancelEmailChange} disabled={emailBusy}>
                      Cancel change
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-borderc bg-soft p-3">
              <p className="text-sm font-semibold text-text">Change password</p>
              <p className="mt-1 text-xs text-muted">Re-auth with your current password before saving a new one.</p>

              <div className="mt-3 space-y-2">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Current password"
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button className="mt-3" onClick={changePassword} loading={savingPassword}>
                <ShieldCheck className="h-4 w-4" />
                Update password
              </Button>
              <p className="mt-3 text-xs text-muted">
                Need a reset link instead?{" "}
                <Link href="/forgot-password" className="font-semibold text-accent hover:text-text">
                  Forgot password
                </Link>
              </p>
            </div>

            <div className="rounded-xl border border-borderc bg-soft p-3">
              <label className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold text-text">Extra sign-in protection</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    Require email approval for new networks. Professor/admin accounts are always protected; if 2FA is off, we strongly recommend enabling this.
                  </span>
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--brand-2))]"
                  checked={Boolean(preferences.extraSigninProtection)}
                  onChange={(event) =>
                    void updatePreferences(
                      (prev) => ({
                        ...prev,
                        extraSigninProtection: event.target.checked
                      }),
                      "Sign-in protection updated"
                    )
                  }
                />
              </label>

              <div className="mt-4 rounded-lg border border-borderc bg-surface p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Trusted networks
                  </p>
                  <Button variant="ghost" onClick={() => void loadTrustedIps()}>
                    Refresh
                  </Button>
                </div>

                {trustedIpsLoading ? (
                  <p className="text-xs text-muted">Loading trusted networks…</p>
                ) : trustedIps.length === 0 ? (
                  <p className="text-xs text-muted">
                    No approved network entries yet. New networks will require email approval.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {trustedIps.map((entry) => (
                      <div
                        key={entry.ipHash}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borderc bg-soft px-3 py-2"
                      >
                        <div className="space-y-0.5">
                          <p className="font-mono text-xs text-text">{entry.maskedIp}</p>
                          <p className="text-[11px] text-muted">
                            Last seen {new Date(entry.lastSeenAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => revokeTrustedIp(entry.ipHash)}
                          loading={trustedIpsBusy === entry.ipHash}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-borderc bg-soft p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">2FA (Authenticator app)</p>
                <div className="inline-flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      factors.length > 0
                        ? "bg-success/15 text-success"
                        : "bg-warn/15 text-warn"
                    }`}
                  >
                    {factors.length > 0 ? "Enabled" : "Not enabled"}
                  </span>
                  <Smartphone className="h-4 w-4 text-brand-2" />
                </div>
              </div>

              {factors.length === 0 ? (
                <p className="mt-1 text-xs text-muted">No MFA factors enrolled yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {factors.map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between rounded-lg border border-borderc bg-surface px-3 py-2 text-sm">
                      <span>
                        {factor.friendly_name || "Authenticator"} · {factor.status}
                      </span>
                      <Button variant="ghost" onClick={() => disableFactor(factor.id)} disabled={mfaBusy}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={enrollMfa} disabled={mfaBusy}>
                  Enable 2FA
                </Button>
              </div>

              {pendingQrSvg ? (
                <div className="mt-3 rounded-lg border border-borderc bg-surface p-3">
                  <p className="text-xs text-muted">Scan this QR code in your authenticator app.</p>
                  <div className="mt-2 rounded-lg bg-white p-3" dangerouslySetInnerHTML={{ __html: pendingQrSvg }} />
                  <div className="mt-2 flex gap-2">
                    <Input value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} placeholder="6-digit code" />
                    <Button onClick={verifyMfa} loading={mfaBusy}>Verify</Button>
                  </div>
                </div>
              ) : null}

              {factors.length === 0 ? (
                <div className="mt-3 rounded-lg border border-warn/35 bg-warn/10 px-3 py-2 text-xs text-warn">
                  Recommended: enable 2FA to protect your study history and account settings.
                </div>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Data</h2>
        </CardHeader>
        <CardBody className="space-y-5">
          <p className="text-sm text-muted">
            Export your progress as JSON or import it from a previous backup.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onExport}>
              <Download className="h-4 w-4" />
              Export data
            </Button>
            <Button variant="ghost" onClick={onImportClick}>
              <Upload className="h-4 w-4" />
              Import data
            </Button>
            <input ref={fileRef} type="file" accept="application/json" onChange={onImportFile} className="hidden" />
          </div>

          <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
            <p className="text-sm font-semibold text-danger">Danger Zone</p>
            <p className="mt-1 text-xs text-muted">
              This permanently deletes your account and all connected data.
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <Input
                value={deletePhrase}
                onChange={(event) => setDeletePhrase(event.target.value)}
                placeholder='Type "DELETE" to confirm'
              />
              <Button variant="ghost" onClick={deleteAccount} loading={deletingAccount}>
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-4 text-sm text-muted">
          Signed in as <span className="font-semibold text-text">{user?.email || profile.email || "Unknown"}</span>
        </CardBody>
      </Card>
    </div>
  );
}
