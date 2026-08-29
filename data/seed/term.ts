/**
 * The academic term the seeded library is current for.
 *
 * Defined once because it was previously written into the homepage and the
 * hero index separately, which is how a site ends up advertising two
 * different terms on the same screen.
 */
export const CURRENT_TERM = {
  /** Long form, e.g. shown in the hero index masthead. */
  label: "Fall 2026",
  /** Short form for tight editorial furniture. */
  short: "Fall 26"
} as const;
