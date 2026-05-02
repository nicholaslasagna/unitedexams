/**
 * United Exams — Centralized Access Model
 * ----------------------------------------
 * One place that answers: who is this user, what can they do, and what
 * messaging should we show them?
 *
 * The site has multiple audiences with different expectations:
 *   - guests browsing public study material
 *   - free signed-in students saving basic progress
 *   - premium students with deeper analytics & study features
 *   - verified institution students whose school covers access
 *   - professors / verified professors who run sections
 *   - admins / school admins
 *
 * Pages should NOT scatter `if (isAuthenticated && profile.role === ...)`
 * checks. Instead, call `resolveAccess(...)` once and read the resulting
 * `AccessContext`, then ask focused questions like `canStartTimedExam(ctx)`
 * or read `ctx.gates.savedProgress` for whether to show a soft lock.
 *
 * The data this model reads is mostly already on `UserProfile`. Two
 * fields — `premiumActive` and `institutionCovered` — are currently
 * UI-only placeholders. When the backend grows the corresponding tables
 * (Stripe subscriptions, institution license rows), populate those
 * fields and the entire UI will start respecting them automatically.
 */

import type { UserProfile } from "@/lib/types";

// ─── Roles ─────────────────────────────────────────────────────────

/**
 * Discrete tiers the UI can branch on. Use this in `switch` statements
 * for at-a-glance copy variations. For boolean checks (e.g. "should we
 * show a premium prompt?") prefer the `gates` object on `AccessContext`.
 */
export type AccessTier =
  | "guest"
  | "free_student"
  | "premium_student"
  | "verified_institution_student"
  | "professor"
  | "verified_professor"
  | "institution_professor"
  | "admin";

// ─── Inputs the model reads ────────────────────────────────────────

export interface AccessInput {
  isAuthenticated: boolean;
  profile: UserProfile;
  /**
   * True if the user has joined at least one section. We treat this as
   * a strong signal that the school has wired them into a real class
   * — used to suppress generic "create account" prompts in section flows.
   */
  hasJoinedSection?: boolean;
  /**
   * True when this view is being rendered inside an institution-managed
   * flow (e.g. a section-specific quiz with `?section=xxx`). Always
   * suppresses upgrade prompts regardless of subscription state.
   */
  inInstitutionFlow?: boolean;
}

// ─── Outputs the UI reads ──────────────────────────────────────────

export interface AccessGates {
  /** Can save attempts long-term? Guests get local-only saves. */
  savedProgress: boolean;
  /** Can use the full study walkthrough (hint + reasoning) bank? */
  studyWalkthrough: boolean;
  /** Can launch a strict timed exam simulation with full scoring? */
  timedExam: boolean;
  /** Can reveal homework solutions / step-by-step? */
  homeworkSolutions: boolean;
  /** Can see deeper analytics (mistake history, mastery, weak topics)? */
  advancedAnalytics: boolean;
  /** Can join the leaderboard board (vs. just preview top 5)? */
  fullLeaderboard: boolean;
  /** Can request/own a section as a professor? */
  professorWorkspace: boolean;
}

export interface AccessMessaging {
  /** Hide all premium upgrade prompts (premium users + institution + professors). */
  hidePremiumPrompts: boolean;
  /** Show the warm "Included through your institution" badge. */
  showInstitutionNote: boolean;
  /** Show the subtle "Premium active" indicator. */
  showPremiumActive: boolean;
  /** Show the "Create an account to save your progress" prompt. */
  showGuestSavePrompt: boolean;
  /** Show professor-oriented CTAs (sections, request a course). */
  showProfessorCtas: boolean;
}

export interface AccessContext {
  tier: AccessTier;
  gates: AccessGates;
  messaging: AccessMessaging;
  /** Convenience booleans — derived from the tier. */
  isGuest: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  isInstitutionCovered: boolean;
  isProfessorTier: boolean;
  isAdmin: boolean;
}

// ─── Tier resolver ─────────────────────────────────────────────────

function resolveTier(input: AccessInput): AccessTier {
  const { isAuthenticated, profile } = input;

  if (!isAuthenticated) return "guest";

  if (profile.role === "admin") return "admin";

  if (profile.role === "professor") {
    if (profile.professorVerified && profile.universityId) {
      return profile.institutionVerified ? "institution_professor" : "verified_professor";
    }
    return "professor";
  }

  // role is "student" (or undefined)
  if (profile.institutionCovered) return "verified_institution_student";
  if (profile.premiumActive) return "premium_student";
  return "free_student";
}

// ─── Public resolver ───────────────────────────────────────────────

/**
 * Build the AccessContext for the current user/page. Call this once near
 * the top of any page that needs to branch on access state.
 */
export function resolveAccess(input: AccessInput): AccessContext {
  const tier = resolveTier(input);
  const inInstitutionFlow = Boolean(input.inInstitutionFlow);

  const isGuest = tier === "guest";
  const isPremium = tier === "premium_student";
  const isInstitutionCovered =
    tier === "verified_institution_student" ||
    tier === "institution_professor" ||
    inInstitutionFlow;
  const isProfessorTier =
    tier === "professor" || tier === "verified_professor" || tier === "institution_professor";
  const isAdmin = tier === "admin";

  // Anyone whose access is fully covered (premium / institution / professor /
  // admin) should never see student-targeted upgrade prompts.
  const hidePremiumPrompts =
    isPremium || isInstitutionCovered || isProfessorTier || isAdmin;

  const gates: AccessGates = {
    // Guests can use local-only progress (storage repository falls back
    // to localStorage), but only signed-in users get long-term cloud saves.
    savedProgress: !isGuest,
    studyWalkthrough: !isGuest, // any signed-in user can use walkthrough
    timedExam: !isGuest, // any signed-in user can run a timed exam
    homeworkSolutions: !isGuest,
    advancedAnalytics: !isGuest && (isPremium || isInstitutionCovered || isProfessorTier),
    fullLeaderboard: !isGuest,
    professorWorkspace: isProfessorTier
  };

  const messaging: AccessMessaging = {
    hidePremiumPrompts,
    showInstitutionNote: isInstitutionCovered,
    showPremiumActive: isPremium && !isInstitutionCovered,
    showGuestSavePrompt: isGuest,
    showProfessorCtas: isProfessorTier
  };

  return {
    tier,
    gates,
    messaging,
    isGuest,
    isAuthenticated: input.isAuthenticated,
    isPremium,
    isInstitutionCovered,
    isProfessorTier,
    isAdmin
  };
}

// ─── Focused permission checks ─────────────────────────────────────
// Thin wrappers over `gates` for the most-asked questions.
// Add more as new features land — keep them one-liners.

export const canSaveProgress = (ctx: AccessContext) => ctx.gates.savedProgress;
export const canStartTimedExam = (ctx: AccessContext) => ctx.gates.timedExam;
export const canStartStudyWalkthrough = (ctx: AccessContext) => ctx.gates.studyWalkthrough;
export const canRevealHomeworkSolution = (ctx: AccessContext) => ctx.gates.homeworkSolutions;
export const canSeeAdvancedAnalytics = (ctx: AccessContext) => ctx.gates.advancedAnalytics;
export const canSeeFullLeaderboard = (ctx: AccessContext) => ctx.gates.fullLeaderboard;
export const canAccessProfessorWorkspace = (ctx: AccessContext) => ctx.gates.professorWorkspace;

// ─── Lock kind for AccessGate components ───────────────────────────

export type LockKind = "open" | "soft" | "hard";

/**
 * Resolve how a feature should be presented for a given context.
 *   - "open"  — fully unlocked, render the feature
 *   - "soft"  — render but with an upgrade hint (or guest sign-up nudge)
 *   - "hard"  — replace with a placeholder telling them why & how to unlock
 *
 * Pass `requires` to declare what the feature needs. The function picks
 * the gentlest possible lock state for the user's tier.
 */
export function resolveLock(
  ctx: AccessContext,
  requires: {
    auth?: boolean;
    premiumOrInstitution?: boolean;
  }
): LockKind {
  if (ctx.messaging.hidePremiumPrompts) return "open";

  if (requires.auth && ctx.isGuest) {
    // Guests get soft-locked — let them browse, prompt them to save.
    return "soft";
  }

  if (requires.premiumOrInstitution && !ctx.isPremium && !ctx.isInstitutionCovered) {
    return "soft";
  }

  return "open";
}
