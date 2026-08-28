import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateIso));
}

export function formatRelativeDate(dateIso: string) {
  const now = new Date();
  const date = new Date(dateIso);
  const diffMs = now.getTime() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(dateIso);
}

export function minutesSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

/**
 * A plain-language band for a single score.
 *
 * This was called `percentile` and led with "Top 5% pace", which claims a
 * ranking against other students. No such comparison is computed anywhere
 * - the input is one score from one attempt - so the label invented social
 * proof. These bands describe only the score in front of the user.
 */
export function scoreBandLabel(score: number) {
  if (score >= 95) return "Nearly everything correct";
  if (score >= 85) return "Solid grasp";
  if (score >= 70) return "Mostly there";
  if (score >= 50) return "About half correct";
  return "Early days on this set";
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function choiceMarkerForIndex(index: number) {
  let value = Math.max(0, Math.floor(index));
  let marker = "";

  do {
    marker = String.fromCharCode(65 + (value % 26)) + marker;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return marker;
}
