import { describe, expect, it } from "vitest";
import { PREMIUM_FEATURES } from "@/lib/billing/premium-features";

/**
 * These guard the rule in premium-features.ts: the list someone pays
 * against describes only what a paid account can use today.
 *
 * It previously advertised "Walkthrough videos (rolling out)" with no video
 * code anywhere in the repo, and an "Exam readiness signal" 0-100 score that
 * was never computed. Both were removed; these tests make re-adding that
 * kind of entry fail loudly.
 */
describe("PREMIUM_FEATURES", () => {
  it("makes no aspirational or hedged claims", () => {
    for (const feature of PREMIUM_FEATURES) {
      const text = `${feature.title} ${feature.tooltip}`;
      expect(text).not.toMatch(
        /rolling out|coming soon|shortly|in beta|early access|we(?:'ll| will) (?:add|publish|ship)|planned|roadmap|soon\b/i
      );
    }
  });

  it("does not promise recurring delivery it cannot guarantee", () => {
    for (const feature of PREMIUM_FEATURES) {
      expect(feature.tooltip).not.toMatch(/each week|every week|weekly|each month|monthly/i);
    }
  });

  it("has no entry for features with no implementation", () => {
    const ids = PREMIUM_FEATURES.map((f) => f.id);
    expect(ids).not.toContain("video-walkthroughs");
    expect(ids).not.toContain("readiness-signal");
  });

  it("keeps every entry well-formed", () => {
    const ids = new Set<string>();
    for (const feature of PREMIUM_FEATURES) {
      expect(feature.title.trim()).not.toBe("");
      expect(feature.tooltip.trim().length).toBeGreaterThan(20);
      expect(ids.has(feature.id)).toBe(false);
      ids.add(feature.id);
    }
  });
});
