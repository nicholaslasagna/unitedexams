"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Copy, Eye, EyeOff, X } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { courses } from "@/data/seed";
import {
  fetchUniversities,
  fetchUserCourses,
  getMyProfileNameChangeRequests,
  onboardingStatus,
  requestProfileNameChange,
  saveUserCourses
} from "@/features/account/api";
import {
  joinSectionByCode,
  leaveJoinedSection,
  listJoinedSections,
  type JoinedSectionSummary
} from "@/features/professor/api";
import type { UniversityRecord } from "@/lib/supabase/types";
import {
  getDisplayNameMaxLength,
  getRealNameMaxLength,
  normalizeRealName,
  validateRealName
} from "@/lib/auth/display-name";
import type { ProfileNameChangeRequestRow } from "@/features/account/api";
import { PremiumStatusCard } from "@/components/billing/premium-status-card";

function parseOnboardingParam() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("onboarding") === "1";
}

const onboardingAccentOptions = [
  { id: "classic-violet", label: "Classic Violet", hue: 265, strength: 60 },
  { id: "deep-indigo", label: "Deep Indigo", hue: 245, strength: 52 },
  { id: "electric-plum", label: "Electric Plum", hue: 280, strength: 74 }
] as const;

function getInitialAccentOptionId(hue: number, strength: number) {
  const found = onboardingAccentOptions.find(
    (option) => option.hue === hue && option.strength === strength
  );
  return found?.id ?? onboardingAccentOptions[0].id;
}

export function AccountPageContent() {
  const router = useRouter();
  const { ready, profile, saveProfile, user, supabase, preferences, savePreferences } = useAppData();
  const { push } = useToast();

  const [displayName, setDisplayName] = useState(profile.name || "");
  const [realName, setRealName] = useState(profile.realName || "");
  const [showRealName, setShowRealName] = useState(Boolean(profile.showRealName));
  const [showUniversity, setShowUniversity] = useState(Boolean(profile.showUniversity));
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | undefined>(profile.universityId);

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [search, setSearch] = useState("");
  const [openPicker, setOpenPicker] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savingCourses, setSavingCourses] = useState(false);
  const [savingNameRequest, setSavingNameRequest] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [joiningSection, setJoiningSection] = useState(false);
  const [leavingSectionId, setLeavingSectionId] = useState<string | null>(null);

  const [onboardingMode, setOnboardingMode] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedOnboardingAccent, setSelectedOnboardingAccent] = useState<string>(() =>
    getInitialAccentOptionId(preferences.accentHue, preferences.accentStrength)
  );
  const [joinCode, setJoinCode] = useState("");
  const [showUserId, setShowUserId] = useState(false);
  const [joinedSections, setJoinedSections] = useState<JoinedSectionSummary[]>([]);
  const [loadingJoinedSections, setLoadingJoinedSections] = useState(false);
  const [nameChangeRequests, setNameChangeRequests] = useState<ProfileNameChangeRequestRow[]>([]);
  const staffUniversityLocked = profile.role === "professor" || profile.role === "admin";

  const selectedUniversity = useMemo(
    () => universities.find((item) => item.id === selectedUniversityId),
    [universities, selectedUniversityId]
  );

  const filteredUniversities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universities.slice(0, 80);
    return universities.filter((item) => item.name.toLowerCase().includes(q));
  }, [universities, search]);

  const pendingNameChangeRequest = useMemo(
    () => nameChangeRequests.find((request) => request.status === "pending") ?? null,
    [nameChangeRequests]
  );

  useEffect(() => {
    setDisplayName(profile.name || "");
    setRealName(profile.realName || "");
    setShowRealName(Boolean(profile.showRealName));
    setShowUniversity(Boolean(profile.showUniversity));
    setSelectedUniversityId(profile.universityId);
  }, [profile]);

  useEffect(() => {
    if (!pendingNameChangeRequest) return;
    if (normalizeRealName(realName) !== normalizeRealName(profile.realName || "")) return;
    setRealName(pendingNameChangeRequest.requested_real_name);
  }, [pendingNameChangeRequest, profile.realName, realName]);

  useEffect(() => {
    setOnboardingMode(parseOnboardingParam());
  }, []);

  useEffect(() => {
    setSelectedOnboardingAccent(getInitialAccentOptionId(preferences.accentHue, preferences.accentStrength));
  }, [preferences.accentHue, preferences.accentStrength]);

  const loadJoinedSections = useCallback(async () => {
    if (!supabase || !user) {
      setJoinedSections([]);
      return;
    }
    setLoadingJoinedSections(true);
    try {
      const rows = await listJoinedSections(supabase, user.id);
      setJoinedSections(rows);
    } catch {
      setJoinedSections([]);
    } finally {
      setLoadingJoinedSections(false);
    }
  }, [supabase, user]);

  const loadNameChangeRequests = useCallback(async () => {
    if (!supabase || !user) {
      setNameChangeRequests([]);
      return;
    }
    try {
      const rows = await getMyProfileNameChangeRequests(supabase);
      setNameChangeRequests(rows);
    } catch {
      setNameChangeRequests([]);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (!supabase || !user) {
      setJoinedSections([]);
      return;
    }

    fetchUniversities(supabase)
      .then(setUniversities)
      .catch(() => setUniversities([]));

    fetchUserCourses(supabase, user.id)
      .then((ids) => setSelectedCourses(ids))
      .catch(() => setSelectedCourses([]));

    void loadJoinedSections();
    void loadNameChangeRequests();
  }, [loadJoinedSections, loadNameChangeRequests, supabase, user]);

  useEffect(() => {
    if (!onboardingMode || !supabase || !user) return;

    onboardingStatus(supabase, user.id)
      .then((status) => {
        if (status.hasUniversity && status.hasCourses) {
          setOnboardingMode(false);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("onboarding");
            window.history.replaceState({}, "", url.toString());
          }
        }
      })
      .catch(() => {
        // If status fetch fails, keep onboarding open rather than incorrectly dismissing it.
      });
  }, [onboardingMode, supabase, user?.id]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const persistCourses = async (courseIds: string[]) => {
    if (!supabase || !user) return false;
    setSavingCourses(true);
    try {
      await saveUserCourses(supabase, user.id, courseIds);
      return true;
    } catch (error) {
      push({ title: "Unable to update courses", description: (error as Error).message, tone: "error" });
      return false;
    } finally {
      setSavingCourses(false);
    }
  };

  const persistProfileChanges = async ({
    nextRealName = profile.realName || "",
    nextShowRealName = showRealName,
    nextShowUniversity = showUniversity,
    nextUniversityId = selectedUniversityId,
    successTitle = "Account updated",
    showSuccessToast = true
  }: {
    nextRealName?: string;
    nextShowRealName?: boolean;
    nextShowUniversity?: boolean;
    nextUniversityId?: string;
    successTitle?: string;
    showSuccessToast?: boolean;
  }): Promise<boolean> => {
    setPrivacyError(null);

    // Display name stays permanent; real-name changes are routed through university approval.
    const safeDisplayName = profile.name;
    const safeRealName = nextRealName;

    const realNameCheck = validateRealName(safeRealName);
    if (!realNameCheck.valid) {
      setPrivacyError(realNameCheck.message);
      return false;
    }

    const normalizedRealName = normalizeRealName(safeRealName);

    if (nextShowRealName && !normalizedRealName) {
      setPrivacyError("Add a real name before enabling 'show real name'.");
      return false;
    }

    if (nextShowUniversity && !nextUniversityId) {
      setPrivacyError("Select a university before enabling 'show university'.");
      return false;
    }

    setSaving(true);
    try {
      await saveProfile({
        ...profile,
        name: safeDisplayName.trim() || "Student",
        realName: profile.realName,
        showRealName: nextShowRealName,
        showUniversity: nextShowUniversity,
        universityId: nextUniversityId
      });
      if (showSuccessToast) {
        push({ title: successTitle, tone: "success" });
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[account] persistProfileChanges failed", error);
      }
      push({ title: "Unable to update account", description: (error as Error).message, tone: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAccount = async () => {
    const currentRealName = normalizeRealName(profile.realName || "");
    const requestedRealName = normalizeRealName(realName);
    const hasRealNameChange = requestedRealName !== currentRealName;
    let submittedNameRequest = false;

    const profileSaved = await persistProfileChanges({
      nextRealName: profile.realName || "",
      showSuccessToast: false
    });
    if (!profileSaved) return;

    const coursesSaved = await persistCourses(selectedCourses);
    if (!coursesSaved) return;

    if (hasRealNameChange) {
      if (!requestedRealName) {
        setPrivacyError("Real name changes require a valid full name.");
        return;
      }

      setSavingNameRequest(true);
      try {
        await requestProfileNameChange(requestedRealName);
        await loadNameChangeRequests();
        submittedNameRequest = true;
      } catch (error) {
        push({
          title: "Name change not submitted",
          description: (error as Error).message,
          tone: "error"
        });
        return;
      } finally {
        setSavingNameRequest(false);
      }
    }

    push({
      title: "Account updated",
      description: submittedNameRequest
        ? "Profile changes were saved and your real-name update was sent for university approval."
        : undefined,
      tone: "success"
    });
  };

  const nextOnboardingStep = async () => {
    if (onboardingStep === 1 && !selectedUniversityId) {
      push({ title: "Please select your university", tone: "error" });
      return;
    }
    if (onboardingStep === 2 && selectedCourses.length === 0) {
      push({ title: "Select at least one course", tone: "error" });
      return;
    }

    if (onboardingStep === 1) {
      const profileSaved = await persistProfileChanges({
        nextUniversityId: selectedUniversityId,
        showSuccessToast: false
      });
      if (!profileSaved) return;
    }

    if (onboardingStep === 2) {
      const coursesSaved = await persistCourses(selectedCourses);
      if (!coursesSaved) return;
    }

    setOnboardingStep((step) => Math.min(3, step + 1));
  };

  const finishOnboarding = async () => {
    const saved = await persistProfileChanges({
      successTitle: "Onboarding profile saved",
      showSuccessToast: false
    });
    if (!saved) return;

    const coursesSaved = await persistCourses(selectedCourses);
    if (!coursesSaved) return;

    if (supabase && user) {
      try {
        const status = await onboardingStatus(supabase, user.id);
        if (!status.hasUniversity || !status.hasCourses) {
          push({
            title: "Onboarding incomplete",
            description: "Please select a university and at least one course.",
            tone: "error"
          });
          return;
        }
      } catch {
        // If status check fails, still allow close after successful writes.
      }
    }

    setOnboardingMode(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("onboarding");
      window.history.replaceState({}, "", url.toString());
    }
    router.refresh();
    push({ title: "Onboarding complete", description: "Recommendations are now personalized.", tone: "success" });
  };

  const themePreset = async (hue: number, strength: number) => {
    try {
      await savePreferences({
        ...preferences,
        palette: "custom",
        accentPreset: "custom",
        accentHue: hue,
        accentSaturation: 72,
        accentLightness: 62,
        accentStrength: strength
      });
    } catch (error) {
      push({ title: "Unable to update accent", description: (error as Error).message, tone: "error" });
    }
  };

  const userIdValue = user?.id || profile.id || "";
  const maskedUserId = userIdValue ? "••••••••-••••-••••-••••-••••••••••••" : "";

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-semibold tracking-tight">Account</h1>
        <p className="mt-2 text-sm text-text-secondary">Profile, billing, courses, and leaderboard privacy controls.</p>
      </section>

      <PremiumStatusCard />

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Display name</label>
              <Input
                value={displayName}
                maxLength={getDisplayNameMaxLength()}
                disabled
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <p className="text-xs text-text-secondary">Display name is permanent after signup.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Real name (optional)</label>
              <Input
                value={realName}
                maxLength={getRealNameMaxLength()}
                onChange={(event) => setRealName(event.target.value)}
                placeholder="Your legal/full name"
              />
              <p className="text-xs text-text-secondary">
                Real-name changes require approval from your university admin.
              </p>
              {pendingNameChangeRequest ? (
                <p className="text-xs text-accent">
                  Pending approval: {pendingNameChangeRequest.requested_real_name}
                  {pendingNameChangeRequest.created_at
                    ? ` · requested ${new Date(pendingNameChangeRequest.created_at).toLocaleString()}`
                    : ""}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">University</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (staffUniversityLocked) return;
                  setOpenPicker((prev) => !prev);
                }}
                className="flex h-11 w-full items-center justify-between rounded-[10px] border border-borderc bg-soft px-3.5 text-left text-sm text-text"
                aria-expanded={openPicker}
                disabled={staffUniversityLocked}
              >
                <span>{selectedUniversity?.name || "Select university"}</span>
                <ChevronsUpDown className="h-4 w-4 text-muted" />
              </button>

              {openPicker ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border-bright bg-[rgba(8,10,30,0.96)] shadow-elevated backdrop-blur-xl">
                  <div className="p-2">
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search university"
                    />
                  </div>
                  <div className="max-h-56 overflow-auto px-2 pb-2">
                    {filteredUniversities.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={async () => {
                          if (staffUniversityLocked) return;
                          const previousUniversityId = selectedUniversityId;
                          setSelectedUniversityId(item.id);
                          setSearch("");
                          setOpenPicker(false);
                          const saved = await persistProfileChanges({
                            nextUniversityId: item.id,
                            successTitle: "University updated"
                          });
                          if (!saved) {
                            setSelectedUniversityId(previousUniversityId);
                          }
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-text hover:bg-overlay"
                      >
                        <span>{item.name}</span>
                        <Check className={cn("h-4 w-4", selectedUniversityId === item.id ? "text-success" : "opacity-0")} />
                      </button>
                    ))}
                    {search.trim().length > 1 && filteredUniversities.length === 0 ? (
                      <p className="rounded-lg border border-borderc bg-soft px-2 py-2 text-xs text-muted">
                        No matches found. Contact support if your accredited university is missing.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-text-secondary">
              {staffUniversityLocked
                ? "Staff university assignment is managed by your university admin."
                : "Pick from the accredited university list. Custom entries are disabled."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Courses</label>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => {
                const selected = selectedCourses.includes(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-all duration-200 ease-out-expo",
                      selected
                        ? "border-brand-2/55 bg-brand-2/10 text-text"
                        : "border-borderc bg-soft text-muted hover:text-text hover:shadow-card-hover hover:border-border-accent"
                    )}
                  >
                    {course.code} · {course.name}
                  </button>
                );
              })}
            </div>
            {selectedCourses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedCourses.map((id) => {
                  const course = courses.find((entry) => entry.id === id);
                  if (!course) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 rounded-full border border-borderc bg-surface px-2 py-1 text-xs text-text">
                      {course.code}
                      <button type="button" onClick={() => toggleCourse(id)} aria-label={`Remove ${course.code}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          <Button onClick={saveAccount} loading={saving || savingCourses || savingNameRequest}>
            Save changes
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Privacy</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent">
            <span>
              <span className="block text-sm font-semibold text-text">Show my real name on leaderboard</span>
              <span className="text-xs text-text-secondary">Off by default.</span>
            </span>
            <input
              type="checkbox"
              checked={showRealName}
              onChange={async (event) => {
                const next = event.target.checked;
                setShowRealName(next);
                const saved = await persistProfileChanges({
                  nextShowRealName: next,
                  successTitle: "Privacy updated"
                });
                if (!saved) {
                  setShowRealName(!next);
                }
              }}
              className="h-4 w-4 accent-[hsl(var(--brand-2))]"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent">
            <span>
              <span className="block text-sm font-semibold text-text">Show my university on leaderboard</span>
              <span className="text-xs text-text-secondary">Off by default.</span>
            </span>
            <input
              type="checkbox"
              checked={showUniversity}
              onChange={async (event) => {
                const next = event.target.checked;
                setShowUniversity(next);
                const saved = await persistProfileChanges({
                  nextShowUniversity: next,
                  successTitle: "Privacy updated"
                });
                if (!saved) {
                  setShowUniversity(!next);
                }
              }}
              className="h-4 w-4 accent-[hsl(var(--brand-2))]"
            />
          </label>

          <p className="text-xs text-text-secondary">
            Leaderboard is public: visitors can see top 5. Sign-in required for full list.
          </p>

          {privacyError ? (
            <p className="rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-xs text-danger">{privacyError}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Identity</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Email</label>
            <Input value={user?.email || profile.email || ""} readOnly className="opacity-85" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">User ID</label>
            <div className="flex gap-2">
              <Input value={showUserId ? userIdValue : maskedUserId} readOnly className="opacity-85" />
              <Button
                variant="secondary"
                aria-label={showUserId ? "Hide user ID" : "Show user ID"}
                disabled={!userIdValue}
                onClick={() => setShowUserId((prev) => !prev)}
              >
                {showUserId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="secondary"
                aria-label="Copy full user ID"
                disabled={!userIdValue}
                onClick={() => {
                  navigator.clipboard.writeText(userIdValue);
                  push({ title: "User ID copied", tone: "success" });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Class sections</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-text-secondary">Join a professor section using a class join code.</p>
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Enter section code"
            />
            <Button
              variant="secondary"
              loading={joiningSection}
              onClick={async () => {
                if (!supabase || !joinCode.trim() || joiningSection) return;
                setJoiningSection(true);
                try {
                  const sectionId = await joinSectionByCode(supabase, joinCode.trim());
                  await loadJoinedSections();
                  push({ title: "Joined section", tone: "success" });
                  setJoinCode("");
                  router.push(`/app/sections/${sectionId}`);
                } catch (error) {
                  push({ title: "Unable to join section", description: (error as Error).message, tone: "error" });
                } finally {
                  setJoiningSection(false);
                }
              }}
            >
              Join by code
            </Button>
          </div>
          <div className="space-y-2 rounded-xl border border-borderc bg-soft p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Joined sections</p>
            {loadingJoinedSections ? (
              <p className="text-sm text-muted">Loading joined sections…</p>
            ) : joinedSections.length === 0 ? (
              <p className="text-sm text-muted">You have not joined any sections yet.</p>
            ) : (
              <div className="space-y-2">
                {joinedSections.map((membership) => {
                  const canLeave = membership.role === "student" && !membership.isOwner;
                  return (
                    <div
                      key={membership.sectionId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borderc bg-surface px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text">{membership.sectionName}</p>
                        <p className="text-xs text-muted">
                          {membership.courseId}
                          {membership.term ? ` · ${membership.term}` : ""}
                          {membership.role !== "student" ? ` · ${membership.role}` : ""}
                        </p>
                      </div>
                      {canLeave ? (
                        <Button
                          variant="ghost"
                          loading={leavingSectionId === membership.sectionId}
                          onClick={async () => {
                            if (!supabase || !user || leavingSectionId) return;
                            const confirmed = window.confirm(
                              "Leave this section? You will lose access to its materials, homework, and exams."
                            );
                            if (!confirmed) return;

                            setLeavingSectionId(membership.sectionId);
                            try {
                              await leaveJoinedSection(supabase, {
                                sectionId: membership.sectionId,
                                userId: user.id
                              });
                              await loadJoinedSections();
                              push({ title: "Left section", tone: "success" });
                            } catch (error) {
                              push({ title: "Unable to leave section", description: (error as Error).message, tone: "error" });
                            } finally {
                              setLeavingSectionId(null);
                            }
                          }}
                        >
                          Leave section
                        </Button>
                      ) : (
                        <span className="text-xs text-muted">
                          {membership.isOwner ? "Section owner" : "Instructor access"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {onboardingMode ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#03030b]/75 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-[720px]">
            <CardHeader>
              <h2 className="text-heading font-semibold">Welcome to United Exams</h2>
              <p className="text-sm text-text-secondary">Step <span className="font-mono">{onboardingStep}</span> of <span className="font-mono">3</span></p>
            </CardHeader>
            <CardBody className="space-y-4">
              {onboardingStep === 1 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted">Pick your university.</p>
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search university"
                  />
                  <div className="max-h-44 space-y-1 overflow-auto rounded-xl border border-borderc bg-soft p-2">
                    {filteredUniversities.slice(0, 8).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedUniversityId(item.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm",
                          selectedUniversityId === item.id
                            ? "bg-brand-2/15 text-text"
                            : "text-muted hover:bg-overlay hover:text-text"
                        )}
                      >
                        <span>{item.name}</span>
                        <Check className={cn("h-4 w-4", selectedUniversityId === item.id ? "text-success" : "opacity-0")} />
                      </button>
                    ))}
                    {filteredUniversities.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-muted">No universities match this query.</p>
                    ) : null}
                  </div>
                  {search.trim().length > 1 && filteredUniversities.length === 0 ? (
                    <p className="rounded-lg border border-borderc bg-soft px-3 py-2 text-xs text-muted">
                      No matches found. Contact support if your accredited university is missing.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {onboardingStep === 2 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted">Choose at least one enrolled course.</p>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourse(course.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                          selectedCourses.includes(course.id)
                            ? "border-brand-2/55 bg-brand-2/10 text-text"
                            : "border-borderc bg-soft text-muted hover:text-text"
                        )}
                      >
                        {selectedCourses.includes(course.id) ? <Check className="h-3.5 w-3.5 text-success" /> : null}
                        {course.code}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {onboardingStep === 3 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted">Choose your accent preset.</p>
                  <div className="flex flex-wrap gap-2">
                    {onboardingAccentOptions.map((option) => {
                      const selected = selectedOnboardingAccent === option.id;
                      return (
                        <Button
                          key={option.id}
                          variant={selected ? "primary" : "secondary"}
                          onClick={() => {
                            setSelectedOnboardingAccent(option.id);
                            void themePreset(option.hue, option.strength);
                          }}
                        >
                          {selected ? <Check className="h-4 w-4" /> : null}
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setOnboardingStep((step) => Math.max(1, step - 1))}>
                  Back
                </Button>
                {onboardingStep < 3 ? (
                  <Button onClick={() => void nextOnboardingStep()} loading={saving || savingCourses}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={finishOnboarding} loading={saving || savingCourses}>
                    Finish
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
