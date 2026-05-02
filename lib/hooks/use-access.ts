"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/lib/app-data-context";
import { resolveAccess, type AccessContext } from "@/lib/access";

/**
 * useAccess — single hook every public/app page can call to get the
 * centralized AccessContext. Reads the auth + profile state out of
 * `AppDataContext` and (optionally) probes Supabase for "has this user
 * joined any section?" so flows can suppress generic guest prompts
 * inside section-managed studying.
 *
 * @param options.inInstitutionFlow Pass `true` if the current page is
 *        rendering inside a section-managed flow (e.g. a quiz launched
 *        with `?section=xxx`). Always suppresses upgrade prompts.
 */
export function useAccess(options?: { inInstitutionFlow?: boolean }): AccessContext {
  const { isAuthenticated, profile, supabase, user } = useAppData();
  const [hasJoinedSection, setHasJoinedSection] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user) {
      setHasJoinedSection(false);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("section_members")
          .select("section_id")
          .eq("user_id", user.id)
          .limit(1);
        if (!active) return;
        if (error) return;
        setHasJoinedSection((data?.length ?? 0) > 0);
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
    profile,
    hasJoinedSection,
    inInstitutionFlow: options?.inInstitutionFlow
  });
}
