import { describe, expect, it } from "vitest";
import {
  NAV_DESTINATIONS,
  navGroup,
  resolveNavItems,
  STUDY_TOOL_HREFS
} from "@/lib/navigation/nav-model";

/**
 * The sidebar and the public top bar both read this model. Before it existed
 * they each declared their own list and had drifted: the same destination was
 * "Courses" in one and "My classes" in the other, "Dashboard" against "Home",
 * the top bar had no icons, the order differed, and Interviews was missing
 * from the top bar entirely — so signing in looked like arriving somewhere
 * else. These tests exist to keep that from happening again.
 */
describe("nav model", () => {
  it("gives every destination an icon, so neither shell renders bare text", () => {
    for (const item of NAV_DESTINATIONS) {
      expect(item.icon, `${item.key} has no icon`).toBeTruthy();
      expect(item.label.trim()).not.toBe("");
    }
  });

  it("has unique keys and no duplicate app routes", () => {
    const keys = NAV_DESTINATIONS.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    const appHrefs = NAV_DESTINATIONS.filter((i) => i.key !== "contact").map((i) => i.appHref);
    expect(new Set(appHrefs).size).toBe(appHrefs.length);
  });

  it("uses the sidebar's labels for signed-in visitors", () => {
    const byKey = new Map(resolveNavItems("member").map((i) => [i.key, i.label]));
    expect(byKey.get("home")).toBe("Home");
    expect(byKey.get("classes")).toBe("My classes");
    expect(byKey.get("interviews")).toBe("Interviews");
  });

  it("does not tell a signed-out visitor the classes are theirs", () => {
    const byKey = new Map(resolveNavItems("guest").map((i) => [i.key, i.label]));
    // They own none yet — same reason the courses page heading is not
    // "Your courses" when signed out.
    expect(byKey.get("classes")).toBe("Classes");
  });

  it("keeps both audiences in the same order", () => {
    const order = (items: { key: string }[]) => items.map((i) => i.key);
    const guest = order(resolveNavItems("guest"));
    const member = order(resolveNavItems("member"));
    // Guest nav is a subsequence of the member nav (plus Contact), so the
    // shared destinations always appear in the same sequence in both shells.
    const shared = guest.filter((key) => key !== "contact");
    let cursor = -1;
    for (const key of shared) {
      const at = member.indexOf(key);
      expect(at, `${key} missing from the member nav`).toBeGreaterThan(cursor);
      cursor = at;
    }
  });

  it("shows guests every public destination, including Interviews", () => {
    const keys = resolveNavItems("guest").map((i) => i.key);
    // Interviews used to be unreachable from the public site entirely.
    expect(keys).toContain("interviews");
    expect(keys).toContain("classes");
    expect(keys).toContain("homework");
    expect(keys).toContain("leaderboard");
    expect(keys).toContain("contact");
  });

  it("never sends a signed-out visitor to a route with no public entry", () => {
    for (const item of resolveNavItems("guest")) {
      const source = NAV_DESTINATIONS.find((d) => d.key === item.key)!;
      expect(source.publicHref, `${item.key} has no public href`).not.toBeNull();
      expect(item.href).toBe(source.publicHref);
    }
  });

  it("keeps Contact out of the signed-in nav, where Account covers support", () => {
    expect(resolveNavItems("member").map((i) => i.key)).not.toContain("contact");
  });

  it("groups the way the sidebar groups", () => {
    const member = resolveNavItems("member");
    expect(navGroup(member, "primary").map((i) => i.label)).toEqual([
      "Home",
      "My classes",
      "Interviews",
      "Leaderboard"
    ]);
    expect(navGroup(member, "study").map((i) => i.label)).toEqual([
      "Homework",
      "Exams",
      "Notes"
    ]);
    expect(navGroup(member, "you").map((i) => i.label)).toEqual(["Account", "Settings"]);
  });

  it("derives the sidebar's study-tool hrefs from the same grouping", () => {
    expect([...STUDY_TOOL_HREFS].sort()).toEqual([
      "/app/exams",
      "/app/homework",
      "/app/notes"
    ]);
  });
});
