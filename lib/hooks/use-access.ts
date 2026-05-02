"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/lib/app-data-context";
import { resolveAccess, type AccessContext } from "@/lib/access";
import type { UserProfile } from "@/lib/types";

/**
 * Shape of a single row from the `current_user_access` Supabase view
 * (Stage 4 migration). Every field has a defensible default in case the
 * view does not exist yet (dev / staging without the migrations applied).
 *
 * NOTE: snake_case mirrors the SQL columns. We translate to camelCase
 * before handing the values back to the access model.
 */
interface CurrentUserAccessRow {
  user_id: string;
  role: UserProfile["role"];
  university_id: string | null;
  premium_active: boolean | null;
  premium_plan: UserProfile["premiumPlan"] | null;
  premium_renews_at: string | null;
  premium_source: string | null;
  premium_expires_at: string | null;
  institution_covered: boolean | null;
  institution_verified: boolean | null;
  institution_source: string | null;
  institution_expires_at: string | null;
  professor_workspace: boolean | null;
  professor_verified: boolean | null;
  professor_verified_at: string | null;
  has_joined_section: boolean | null;
}

/**
 * useAccess — single hook every public/app page calls to get the
 * centralized AccessContext.
 *
 * Resolution order:
 *   1. Try the `current_user_access` Supabase view (Stage 4).
 *      - One round-trip; the view has security_invoker so RLS still
 *        applies. Returns the resolved coverage state for the user.
 *      - If this succeeds we use it as the source of truth and ignore
 *        the local profile mirror (which may be stale).
 *   2. If the view query fails (table not yet migrated, dev env, etc.),
 *      fall back to reading `profile` plus a probe of `section_members`.
 *      That keeps the experience working — defaults to the safe
 *      "free student" behavior.
 *
 * @param options.inInstitutionFlow Pass `true` if the current page is
 *        rendering inside a section-managed flow (e.g. a quiz launched
 *        with `?section=xxx`). Always suppresses upgrade prompts.
 */
export function useAccess(options?: { inInstitutionFlow?: boolean }): AccessContext {
  const { isAuthenticated, profile, supabase, user } = useAppData();

  // hasJoinedSection: from the view if present, otherwise from a fallback
  // probe. Default `false` is the safe "no upgrade prompt suppression".
  const [hasJoinedSection, setHasJoinedSection] = useState<boolean>(false);

  // resolvedProfile: starts as the local profile and gets overlaid with
  // server-resolved coverage flags once the view query returns. We never
  // *replace* the profile object — only augment the access-relevant
  // fields, so the rest of the app keeps working.
  const [resolvedProfile, setResolvedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    setResolvedProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user) {
      setHasJoinedSection(false);
      return;
    }

    let active = true;

    void (async () => {
      try {
        // Stage 4 view — preferred path.
        const { data, error } = await supabase
          .from("current_user_access")
          .select(
            "user_id, role, university_id, premium_active, premium_plan, premium_renews_at, premium_source, premium_expires_at, institution_covered, institution_verified, institution_source, institution_expires_at, professor_workspace, professor_verified, professor_verified_at, has_joined_section"
          )
          .maybeSingle();

        if (!active) return;

        if (!error && data) {
          const row = data as CurrentUserAccessRow;
          setHasJoinedSection(Boolean(row.has_joined_section));
          setResolvedProfile((prev) => ({
            ...prev,
            premiumActive: Boolean(row.premium_active),
            premiumPlan: (row.premium_plan as UserProfile["premiumPlan"]) ?? null,
            premiumRenewsAt: row.premium_renews_at ?? null,
            institutionCovered: Boolean(row.institution_covered),
            institutionVerified: Boolean(row.institution_verified),
            professorVerified: Boolean(row.professor_verified),
            professorVerifiedAt: row.professor_verified_at ?? undefined
          }));
          return;
        }

        // Fallback path — view doesn't exist (dev env / pre-migration).
        // Probe section_members so the existing institution flow keeps
        // suppressing prompts where it should.
        const probe = await supabase
          .from("section_members")
          .select("section_id")
          .eq("user_id", user.id)
          .limit(1);

        if (!active) return;
        if (probe.error) {
          setHasJoinedSection(false);
          return;
        }
        setHasJoinedSection((probe.data?.length ?? 0) > 0);
      } catch {
        if (!active) return;
        setHasJoinedSection(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, supabase, user]);

  return resolveAccess({
    isAuthenticated,
    profile: resolvedProfile,
    hasJoinedSection,
    inInstitutionFlow: options?.inInstitutionFlow
  });
}
