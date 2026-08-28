/**
 * Tags worth showing on a set card.
 *
 * Sets carry tags for search (the filter box matches against them), but
 * showing all of them turns a list into a wall of slugs: the homework index
 * rendered four chips on every one of twelve cards, and on a card titled
 * "Homework 1" marked "Homework" those chips read `homework-1`,
 * `step-by-step`, `free-response`, `solve-only` - one restating the title,
 * three restating the mode badge directly above them.
 *
 * Dropped here, kept in the search index: a student can still find a set by
 * typing "free-response", they just are not shown the word on every row.
 */

/** Formats already communicated by the mode badge on the same card. */
const FORMAT_TAGS = new Set([
  "step-by-step",
  "free-response",
  "solve-only",
  "multiple-choice",
  "practice",
  "quiz",
  "exam",
  "homework",
  "drill"
]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function displayTags(tags: string[], title: string, limit = 3): string[] {
  const titleWords = new Set(normalize(title).split(" ").filter(Boolean));

  return tags
    .filter((tag) => {
      if (FORMAT_TAGS.has(tag.toLowerCase())) return false;
      // "homework-1" on "… Homework 1" adds nothing the eye has not read.
      const words = normalize(tag).split(" ").filter(Boolean);
      if (words.length > 0 && words.every((word) => titleWords.has(word))) return false;
      return true;
    })
    .slice(0, limit);
}
