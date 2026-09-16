/**
 * Choosing what to ask next.
 *
 * Two inputs drive selection: which topics are weak, and which misconceptions
 * keep recurring. The second matters more. A learner whose answers repeatedly
 * show `filter-vs-join-condition` does not need more questions "about joins"
 * in general — they need the questions that isolate that one distinction, and
 * they need them now rather than after the rotation happens to come round.
 */

import { SOURCE_QUESTIONS } from "@/data/seed/db-exam1/source-questions";
import type { Attempt } from "@/lib/types";
import {
  generateDivisionQuestion,
  generateJoinResultQuestion,
  generateSchemaContrastQuestion,
  generateShapeQuestion,
  type JoinVariant
} from "./generators/joins";
import { generateIntegrityQuestion, generateKeyQuestion } from "./generators/keys";
import {
  generateCartesianDomainQuestion,
  generateProjectQuestion,
  generateSelectQuestion,
  generateTerminologyQuestion
} from "./generators/model";
import { generateReadQuestion, generateWriteQuestion } from "./generators/queries";
import { seedFrom, shuffle, makeRng } from "./generators/random";
import { labEvents, masteryByTopic, recentlyMissed, weakestTopics } from "./mastery";
import { MISTAKES, getMistake, rankMistakes, type MistakeTag } from "./mistakes";
import type { Difficulty, LabQuestion } from "./question-model";
import { TOPICS, type TopicId } from "./topics";

function withTopic(question: LabQuestion, topic: TopicId): LabQuestion {
  return question.topic === topic ? question : { ...question, topic };
}

/** Generated question variants available for each topic. */
const GENERATORS: Record<TopicId, (seed: number, difficulty: Difficulty) => LabQuestion> = {
  "relational-terminology": (seed, difficulty) => generateTerminologyQuestion(seed, difficulty),
  "degree-cardinality": (seed, difficulty) =>
    withTopic(
      seed % 3 === 0
        ? generateCartesianDomainQuestion(seed, difficulty)
        : generateShapeQuestion(seed, pickVariantForShape(seed), difficulty),
      "degree-cardinality"
    ),
  keys: (seed, difficulty) =>
    generateKeyQuestion(seed, seed % 2 === 0 ? "superkey" : "candidate", difficulty),
  integrity: (seed, difficulty) => generateIntegrityQuestion(seed, difficulty),
  selection: (seed, difficulty) => generateSelectQuestion(seed, difficulty),
  projection: (seed, difficulty) => generateProjectQuestion(seed, difficulty),
  "cartesian-product": (seed, difficulty) => generateShapeQuestion(seed, "product", difficulty),
  equijoin: (seed, difficulty) => generateJoinResultQuestion(seed, "equijoin", difficulty),
  "natural-join": (seed, difficulty) =>
    seed % 3 === 0
      ? generateSchemaContrastQuestion(seed, difficulty)
      : generateJoinResultQuestion(seed, "natural", difficulty),
  "outer-join-left": (seed, difficulty) =>
    generateJoinResultQuestion(seed, "left-outer", difficulty),
  "outer-join-right": (seed, difficulty) =>
    generateJoinResultQuestion(seed, "right-outer", difficulty),
  "outer-join-full": (seed, difficulty) =>
    generateJoinResultQuestion(seed, "full-outer", difficulty),
  semijoin: (seed, difficulty) => generateJoinResultQuestion(seed, "semijoin", difficulty),
  division: (seed, difficulty) => generateDivisionQuestion(seed, difficulty),
  "reading-expressions": (seed, difficulty) => generateReadQuestion(seed, difficulty),
  "writing-expressions": (seed, difficulty) => generateWriteQuestion(seed, difficulty),
  "multi-table": (seed) => withTopic(generateWriteQuestion(seed, "stretch"), "multi-table")
};

const SHAPE_VARIANTS: (JoinVariant | "product")[] = [
  "product",
  "equijoin",
  "natural",
  "left-outer",
  "full-outer",
  "semijoin"
];

function pickVariantForShape(seed: number): JoinVariant | "product" {
  return SHAPE_VARIANTS[seed % SHAPE_VARIANTS.length];
}

/**
 * Questions that isolate one misconception.
 *
 * Mapping a tag to the exercise that separates it is the whole point of
 * tracking tags — without this the taxonomy would be decoration.
 */
const REPAIR: Partial<Record<MistakeTag, (seed: number) => LabQuestion>> = {
  "degree-cardinality-swapped": (seed) => generateShapeQuestion(seed, "equijoin", "intro"),
  "cartesian-arithmetic": (seed) => generateShapeQuestion(seed, "product", "core"),
  "equijoin-vs-natural-join": (seed) => generateSchemaContrastQuestion(seed, "core"),
  "outer-join-side": (seed) =>
    generateJoinResultQuestion(seed, seed % 2 === 0 ? "left-outer" : "right-outer", "core"),
  "outer-join-drops-unmatched": (seed) => generateJoinResultQuestion(seed, "left-outer", "core"),
  "inner-join-pads-unmatched": (seed) => generateJoinResultQuestion(seed, "equijoin", "core"),
  "outer-join-as-product": (seed) => generateShapeQuestion(seed, "full-outer", "core"),
  "semijoin-wrong-relation": (seed) => generateJoinResultQuestion(seed, "semijoin", "core"),
  "semijoin-direction": (seed) => generateJoinResultQuestion(seed, "semijoin", "core"),
  "missed-multiple-matches": (seed) => generateJoinResultQuestion(seed, "equijoin", "stretch"),
  "division-any-not-all": (seed) => generateDivisionQuestion(seed, "core"),
  "division-extra-pairings": (seed) => generateDivisionQuestion(seed, "stretch"),
  "superkey-minimality": (seed) => generateKeyQuestion(seed, "candidate", "core"),
  "primary-vs-candidate-key": (seed) => generateKeyQuestion(seed, "candidate", "core"),
  "entity-vs-referential-integrity": (seed) => generateIntegrityQuestion(seed, "core"),
  "null-semantics": (seed) => generateIntegrityQuestion(seed, "core"),
  "wrong-relation-for-attribute": (seed) => generateWriteQuestion(seed, "core"),
  "filter-vs-join-condition": (seed) => generateReadQuestion(seed, "core"),
  "missing-join": (seed) => generateWriteQuestion(seed, "core"),
  "missing-condition": (seed) => generateWriteQuestion(seed, "core"),
  "wrong-join-attributes": (seed) => generateJoinResultQuestion(seed, "equijoin", "core"),
  "forgot-duplicate-elimination": (seed) => generateProjectQuestion(seed, "core"),
  "selection-for-projection": (seed) => generateProjectQuestion(seed, "core"),
  "projection-for-selection": (seed) => generateSelectQuestion(seed, "core"),
};

/** The exercise that repairs a misconception, if one is mapped. */
export function repairQuestion(tag: MistakeTag, seed: number): LabQuestion | null {
  const build = REPAIR[tag];
  return build ? build(seed) : null;
}

/**
 * A near-transfer follow-up: the same skill, different numbers.
 *
 * Offered straight after a wrong answer, while the correction is still in
 * mind. Seeded off the question that was missed so it is reproducible and so
 * it is never the identical question again.
 */
export function followUpQuestion(question: LabQuestion, attemptIndex = 0): LabQuestion | null {
  const seed = seedFrom(question.id, "follow-up", attemptIndex);
  const generator = GENERATORS[question.topic];
  if (!generator) return null;
  const next = generator(seed, question.difficulty);
  return next.id === question.id ? generator(seed + 1, question.difficulty) : next;
}

/** Professor-authored questions for a topic, newest material first. */
export function sourceQuestions(topic: TopicId): LabQuestion[] {
  return SOURCE_QUESTIONS.filter((question) => question.topic === topic);
}

/** Every question id the learner has already answered. */
function answeredIds(attempts: Attempt[]): Set<string> {
  return new Set(labEvents(attempts).map((event) => event.questionId));
}

export interface PracticeOptions {
  attempts: Attempt[];
  /** Restrict to one topic, or leave undefined for an adaptive mix. */
  topic?: TopicId;
  count?: number;
  difficulty?: Difficulty;
  /** Varies the generated variants between sessions. */
  seed?: number;
  /** Include the professor's own questions the learner has not seen yet. */
  includeSource?: boolean;
}

/**
 * Build a practice set.
 *
 * Unseen professor material comes first — it is the closest thing to the real
 * exam — and generated variants fill the rest, so a session never runs out and
 * never repeats verbatim.
 */
export function buildPracticeSet({
  attempts,
  topic,
  count = 8,
  difficulty = "core",
  seed = Date.now(),
  includeSource = true
}: PracticeOptions): LabQuestion[] {
  const seen = answeredIds(attempts);
  const questions: LabQuestion[] = [];
  const used = new Set<string>();

  const push = (question: LabQuestion | null) => {
    if (!question || used.has(question.id) || questions.length >= count) return;
    used.add(question.id);
    questions.push(question);
  };

  const topics = topic ? [topic] : adaptiveTopicOrder(attempts, seed);

  // 1. Repair whatever keeps going wrong.
  if (!topic) {
    rankMistakes(mistakeTally(attempts), 2).forEach((entry, index) => {
      push(repairQuestion(entry.tag, seedFrom(seed, entry.tag, index)));
    });
  }

  // 2. Professor material the learner has not met yet.
  if (includeSource) {
    topics.forEach((topicId) => {
      sourceQuestions(topicId)
        .filter((question) => !seen.has(question.id))
        .forEach(push);
    });
  }

  // 3. Generated variants, cycling through the chosen topics. Variants the
  // learner has already answered are skipped as well — seeding is
  // deterministic, so without this the same session repeats verbatim.
  let round = 0;
  const limit = count * 8;
  while (questions.length < count && round < limit) {
    const topicId = topics[round % topics.length];
    const generator = GENERATORS[topicId];
    if (generator) {
      const candidate = generator(seedFrom(seed, topicId, round), difficulty);
      if (!seen.has(candidate.id)) push(candidate);
    }
    round += 1;
  }

  // Someone who has exhausted the variants is better served by a repeat than
  // by a short set, so the last pass drops the "unseen" requirement.
  round = 0;
  while (questions.length < count && round < limit) {
    const topicId = topics[round % topics.length];
    const generator = GENERATORS[topicId];
    if (generator) push(generator(seedFrom(seed, "repeat", topicId, round), difficulty));
    round += 1;
  }

  return questions.slice(0, count);
}

function mistakeTally(attempts: Attempt[]): Partial<Record<MistakeTag, number>> {
  const counts: Partial<Record<MistakeTag, number>> = {};
  labEvents(attempts).forEach((event) => {
    event.mistakes.forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
  });
  return counts;
}

/**
 * Topic order for an adaptive session: weakest first, then whatever has not
 * been started, then everything else for maintenance.
 */
function adaptiveTopicOrder(attempts: Attempt[], seed: number): TopicId[] {
  const mastery = masteryByTopic(attempts);
  const weak = weakestTopics(attempts, 6).map((entry) => entry.topic);
  const unstarted = TOPICS.filter((topic) => mastery[topic.id].level === "not-started").map(
    (topic) => topic.id
  );
  const rest = shuffle(
    makeRng(seed),
    TOPICS.map((topic) => topic.id).filter(
      (id) => !weak.includes(id) && !unstarted.includes(id)
    )
  );
  const ordered = [...weak, ...unstarted, ...rest];
  return ordered.length > 0 ? ordered : TOPICS.map((topic) => topic.id);
}

// ── Mock exam ─────────────────────────────────────────────────────────────

/**
 * Exam 1's blueprint.
 *
 * Weighted the way the topic model is weighted, so the mixture reflects what
 * the exam emphasises rather than giving every topic one question each. Joins
 * and writing algebra carry the most because the study guide says so.
 */
const EXAM_BLUEPRINT: { topic: TopicId; count: number }[] = [
  { topic: "relational-terminology", count: 1 },
  { topic: "degree-cardinality", count: 2 },
  { topic: "keys", count: 2 },
  { topic: "integrity", count: 2 },
  { topic: "selection", count: 1 },
  { topic: "projection", count: 1 },
  { topic: "cartesian-product", count: 2 },
  { topic: "equijoin", count: 2 },
  { topic: "natural-join", count: 2 },
  { topic: "outer-join-left", count: 1 },
  { topic: "outer-join-right", count: 1 },
  { topic: "outer-join-full", count: 1 },
  { topic: "semijoin", count: 2 },
  { topic: "division", count: 2 },
  { topic: "reading-expressions", count: 2 },
  { topic: "writing-expressions", count: 2 },
  { topic: "multi-table", count: 2 }
];

export const MOCK_EXAM_LENGTH = EXAM_BLUEPRINT.reduce((sum, row) => sum + row.count, 0);

/**
 * A full mock exam.
 *
 * Draws from the professor's questions first and fills the remainder with
 * generated variants, so repeated sittings are never identical but always
 * cover the same blueprint.
 */
export function buildMockExam(seed: number, attempts: Attempt[] = []): LabQuestion[] {
  const seen = answeredIds(attempts);
  const rng = makeRng(seed);
  const questions: LabQuestion[] = [];
  const used = new Set<string>();

  EXAM_BLUEPRINT.forEach(({ topic, count }) => {
    const pool = shuffle(rng, sourceQuestions(topic));
    // Prefer professor questions not yet seen, then any professor question.
    const ordered = [
      ...pool.filter((question) => !seen.has(question.id)),
      ...pool.filter((question) => seen.has(question.id))
    ];

    let taken = 0;
    for (const question of ordered) {
      if (taken >= count) break;
      if (used.has(question.id)) continue;
      used.add(question.id);
      questions.push(question);
      taken += 1;
    }

    let attempt = 0;
    while (taken < count && attempt < 12) {
      const generator = GENERATORS[topic];
      if (!generator) break;
      const generated = generator(seedFrom(seed, topic, attempt), "core");
      attempt += 1;
      if (used.has(generated.id)) continue;
      used.add(generated.id);
      questions.push(generated);
      taken += 1;
    }
  });

  return questions;
}

// ── Cram mode ─────────────────────────────────────────────────────────────

/**
 * The high-yield set for the night before.
 *
 * Priority order: repair what keeps going wrong, revisit what was missed
 * most recently, then cover the heaviest topics. Deliberately short — a list
 * of sixty questions the evening before an exam is not a revision plan.
 */
export function buildCramSet(attempts: Attempt[], seed: number, count = 12): LabQuestion[] {
  const questions: LabQuestion[] = [];
  const used = new Set<string>();

  const push = (question: LabQuestion | null) => {
    if (!question || used.has(question.id) || questions.length >= count) return;
    used.add(question.id);
    questions.push(question);
  };

  rankMistakes(mistakeTally(attempts), 4).forEach((entry, index) =>
    push(repairQuestion(entry.tag, seedFrom(seed, "cram", entry.tag, index)))
  );

  recentlyMissed(attempts, 4).forEach((event, index) => {
    const source = SOURCE_QUESTIONS.find((question) => question.id === event.questionId);
    if (source) {
      push(source);
      return;
    }
    const generator = GENERATORS[event.topic];
    if (generator) push(generator(seedFrom(seed, "cram-missed", event.topic, index), "core"));
  });

  weakestTopics(attempts, 4).forEach((entry, index) => {
    const generator = GENERATORS[entry.topic];
    if (generator) push(generator(seedFrom(seed, "cram-weak", entry.topic, index), "core"));
  });

  const heaviest = [...TOPICS].sort((a, b) => b.weight - a.weight);
  heaviest.forEach((topic, index) => {
    const generator = GENERATORS[topic.id];
    if (generator) push(generator(seedFrom(seed, "cram-heavy", topic.id, index), "core"));
  });

  return questions.slice(0, count);
}

/** Every misconception with a repair exercise, for the analytics panel. */
export const REPAIRABLE_MISTAKES = MISTAKES.filter((mistake) => REPAIR[mistake.tag]).map(
  (mistake) => mistake.tag
);

export { getMistake };
