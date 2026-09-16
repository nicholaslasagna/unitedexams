/**
 * Relations, the way CS 4354 defines them.
 *
 * A relation is a *set* of tuples over named attributes (Lecture 2). Two
 * consequences drive this whole module:
 *
 *   - there are no duplicate tuples, so anything that can introduce one
 *     (projection, union) has to de-duplicate;
 *   - attribute order and tuple order carry no meaning, so equality between
 *     two relations compares them as sets, not as printed tables.
 *
 * Attributes are stored as display names. When two relations that share an
 * attribute name are combined, the shared name is qualified as
 * `Relation.attribute` — and *only* the colliding one is. That is the
 * convention in the Lecture 4 Cartesian-product slide (`client.clientNo`,
 * `fName`, ..., `Viewing.clientNo`) and in Homework #1, where the product of
 * R and S is printed as `r_id, R.j, r2, r3, s_id, S.j, s2, s3`.
 */

/** A single cell. `null` is the relational NULL — absence of a value. */
export type RAValue = string | number | null;

export type Tuple = RAValue[];

export interface Relation {
  /** Relation name, used to qualify colliding attributes. */
  name: string;
  /** Display names, unique within the relation, aligned with tuple slots. */
  attributes: string[];
  tuples: Tuple[];
  /**
   * The base relation each attribute came from, aligned with `attributes`.
   *
   * Needed because a join only qualifies the names that *collide*: joining
   * Book to BookCopy leaves `copyNo` unqualified, and a learner who then
   * writes `BookCopy.copyNo` in the next join condition — exactly as the
   * professor writes it — has to be understood. Without provenance the
   * qualifier has nothing to match against and the reference fails.
   *
   * Optional: a hand-written base relation may omit it, in which case every
   * attribute is taken to come from that relation.
   */
  sources?: string[];
}

/** Provenance for each attribute, defaulting to the relation's own name. */
export function sourcesOf(relation: Relation): string[] {
  return relation.sources ?? relation.attributes.map(() => relation.name);
}

/** Number of attributes. The thing students most often swap with cardinality. */
export function degree(relation: Relation): number {
  return relation.attributes.length;
}

/** Number of tuples. */
export function cardinality(relation: Relation): number {
  return relation.tuples.length;
}

/** The part of `hotel.hotelNo` after the dot; the whole string when unqualified. */
export function unqualify(attribute: string): string {
  const dot = attribute.lastIndexOf(".");
  return dot === -1 ? attribute : attribute.slice(dot + 1);
}

/** The part before the dot, or null when the name carries no qualifier. */
export function qualifierOf(attribute: string): string | null {
  const dot = attribute.lastIndexOf(".");
  return dot === -1 ? null : attribute.slice(0, dot);
}

export function makeRelation(
  name: string,
  attributes: string[],
  tuples: Tuple[]
): Relation {
  return { name, attributes, tuples: dedupeTuples(tuples) };
}

/**
 * Stable key for set semantics.
 *
 * Values are tagged with their type before encoding so the number 1 and the
 * string "1" stay distinct — without that, a relation could silently lose a
 * tuple to de-duplication. JSON rather than a delimiter because any delimiter
 * cheap enough to pick can also appear inside a value, and control characters
 * make the file itself unreadable to tooling.
 */
export function tupleKey(tuple: Tuple): string {
  return JSON.stringify(
    tuple.map((value) => {
      if (value === null) return ["null"];
      if (typeof value === "number") return ["num", value];
      return ["str", value];
    })
  );
}

export function dedupeTuples(tuples: Tuple[]): Tuple[] {
  const seen = new Set<string>();
  const out: Tuple[] = [];
  for (const tuple of tuples) {
    const key = tupleKey(tuple);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tuple);
  }
  return out;
}

/**
 * Locate an attribute by the name a learner (or the professor) wrote.
 *
 * Accepts the exact display name, an unqualified name when it is
 * unambiguous, and a qualified name whose qualifier matches. Returns -1 when
 * nothing matches and -2 when the reference is ambiguous, so callers can tell
 * "no such attribute" from "which one did you mean?" — the second is a real
 * and teachable mistake once two relations are in play.
 */
export const ATTRIBUTE_NOT_FOUND = -1;
export const ATTRIBUTE_AMBIGUOUS = -2;

export function resolveAttributeIndex(relation: Relation, reference: string): number {
  const ref = reference.trim();
  const exact = relation.attributes.indexOf(ref);
  if (exact !== -1) return exact;

  const refQualifier = qualifierOf(ref);
  const refBase = unqualify(ref);
  const sources = sourcesOf(relation);

  const matches: number[] = [];
  relation.attributes.forEach((attribute, index) => {
    if (unqualify(attribute).toLowerCase() !== refBase.toLowerCase()) return;
    if (refQualifier) {
      // `R.j` matches the attribute stored as `R.j`, and also a bare `j`
      // whose provenance says it came from R.
      const source = qualifierOf(attribute) ?? sources[index] ?? relation.name;
      if (source.toLowerCase() !== refQualifier.toLowerCase()) return;
    }
    matches.push(index);
  });

  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return ATTRIBUTE_AMBIGUOUS;
  return ATTRIBUTE_NOT_FOUND;
}

export function hasAttribute(relation: Relation, reference: string): boolean {
  return resolveAttributeIndex(relation, reference) >= 0;
}

/**
 * Combine two attribute lists for a product-style operation, qualifying only
 * the names that actually collide.
 */
export function combineAttributes(
  left: Relation,
  right: Relation
): { attributes: string[]; leftNames: string[]; rightNames: string[]; sources: string[] } {
  const leftBases = left.attributes.map(unqualify);
  const rightBases = right.attributes.map(unqualify);
  const colliding = new Set(
    leftBases.filter((base) => rightBases.includes(base)).map((base) => base.toLowerCase())
  );

  // Qualify with the attribute's ORIGIN relation rather than the name of the
  // operand it arrived in. After Book ⋈ BookCopy the left operand is called
  // "Book⋈BookCopy", and qualifying its copyNo with that would produce
  // `Book⋈BookCopy.copyNo` — a name no learner would ever write. Provenance
  // gives `BookCopy.copyNo`, which is how the professor writes the next join
  // condition.
  const leftSources = sourcesOf(left);
  const rightSources = sourcesOf(right);

  const leftNames = left.attributes.map((attribute, index) =>
    colliding.has(leftBases[index].toLowerCase()) && qualifierOf(attribute) === null
      ? `${leftSources[index]}.${attribute}`
      : attribute
  );
  const rightNames = right.attributes.map((attribute, index) =>
    colliding.has(rightBases[index].toLowerCase()) && qualifierOf(attribute) === null
      ? `${rightSources[index]}.${attribute}`
      : attribute
  );

  return {
    attributes: [...leftNames, ...rightNames],
    leftNames,
    rightNames,
    sources: [...leftSources, ...rightSources]
  };
}

/** Attribute names shared by both relations, compared unqualified. */
export function commonAttributes(left: Relation, right: Relation): string[] {
  const rightBases = new Set(right.attributes.map((a) => unqualify(a).toLowerCase()));
  return left.attributes
    .map(unqualify)
    .filter((base) => rightBases.has(base.toLowerCase()));
}

/**
 * Set equality: same attributes (in any order) and same tuples (in any
 * order), with tuples re-aligned to the attribute order before comparison.
 * This is what lets a learner's answer count as correct when they list
 * columns or rows in a different sequence from the stored solution.
 */
export function relationsEqual(a: Relation, b: Relation): boolean {
  if (a.attributes.length !== b.attributes.length) return false;
  if (a.tuples.length !== b.tuples.length) return false;

  // Map each of b's attributes onto a's positions.
  const order: number[] = [];
  const used = new Set<number>();
  for (const attribute of a.attributes) {
    const base = unqualify(attribute).toLowerCase();
    const index = b.attributes.findIndex(
      (candidate, i) => !used.has(i) && unqualify(candidate).toLowerCase() === base
    );
    if (index === -1) return false;
    used.add(index);
    order.push(index);
  }

  const aKeys = new Set(a.tuples.map(tupleKey));
  const bKeys = new Set(b.tuples.map((tuple) => tupleKey(order.map((i) => tuple[i]))));
  if (aKeys.size !== bKeys.size) return false;
  for (const key of aKeys) if (!bKeys.has(key)) return false;
  return true;
}

/** Column values for one attribute, in tuple order. */
export function columnValues(relation: Relation, reference: string): RAValue[] {
  const index = resolveAttributeIndex(relation, reference);
  if (index < 0) return [];
  return relation.tuples.map((tuple) => tuple[index]);
}

export function renameRelation(relation: Relation, name: string): Relation {
  return { ...relation, name };
}
