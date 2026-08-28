import { describe, expect, it } from "vitest";
import { validatePassword } from "@/lib/auth/password";

describe("validatePassword", () => {
  it("scores an empty password as zero, not as a partially strong one", () => {
    const result = validatePassword("");
    // Regression: "" used to score 15 because it is not in the common-password
    // list, so an untouched signup field advertised 15% strength.
    expect(result.score).toBe(0);
    expect(result.valid).toBe(false);
    expect(result.checks.commonBlocked).toBe(false);
  });

  it("rejects passwords under the length floor", () => {
    const result = validatePassword("Ab1!xyz");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at least 10 characters/i);
  });

  it("rejects common passwords regardless of shape", () => {
    const result = validatePassword("Password123");
    expect(result.checks.commonBlocked).toBe(false);
    expect(result.valid).toBe(false);
  });

  it("requires three of the four character classes", () => {
    expect(validatePassword("abcdefghijkl").valid).toBe(false);
    expect(validatePassword("abcdefghij1").valid).toBe(false);
    expect(validatePassword("Abcdefghij1").valid).toBe(true);
  });

  it("accepts a strong password and scores it fully", () => {
    const result = validatePassword("Tr0ub4dour&3xtra");
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  it("never returns a score outside 0-100", () => {
    for (const pw of ["", "a", "aA1!", "Abcdefghij1", "Tr0ub4dour&3xtra", "password"]) {
      const { score } = validatePassword(pw);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});
