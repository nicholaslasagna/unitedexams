"use client";

import { BookOpen, FileText, GraduationCap, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SOURCE_QUESTIONS } from "@/data/seed/db-exam1/source-questions";
import { cn } from "@/lib/utils";
import type { TopicId } from "./topics";

/**
 * The course's own materials, organised so a learner can jump from a lecture
 * or a homework question into practice on that material.
 *
 * Descriptions stay inside what the slides and the assignment actually say.
 */

interface SourceGroup {
  id: string;
  title: string;
  origin: string;
  summary: string;
  topics: { id: TopicId; label: string }[];
  questionIds?: string[];
}

const GROUPS: SourceGroup[] = [
  {
    id: "lecture-2",
    title: "Lecture 2 — The Relational Model",
    origin: "Lecture 2",
    summary:
      "Relation, tuple, attribute, domain; degree and cardinality; Cartesian products of domains; superkey vs candidate key; entity and referential integrity; NULL as absence of a value.",
    topics: [
      { id: "relational-terminology", label: "Terminology" },
      { id: "degree-cardinality", label: "Degree & cardinality" },
      { id: "keys", label: "Keys" },
      { id: "integrity", label: "Integrity" }
    ],
    questionIds: [
      "lec2-terminology",
      "lec2-degree-cardinality",
      "lec2-keys",
      "lec2-cartesian-domains",
      "lec2-null",
      "lec2-integrity-rules"
    ]
  },
  {
    id: "lecture-3",
    title: "Lecture 3 — Relational Algebra (σ, Π, ∪, −)",
    origin: "Lecture 3",
    summary:
      "Selection slices horizontally; projection slices vertically and eliminates duplicates. The in-class question: list sex and DOB of staff whose position is Assistant.",
    topics: [
      { id: "selection", label: "Selection σ" },
      { id: "projection", label: "Projection Π" },
      { id: "writing-expressions", label: "Write the Assistant query" }
    ],
    questionIds: ["lec3-selection", "lec3-projection-duplicates", "lec3-assistant", "lec3-union"]
  },
  {
    id: "lecture-4",
    title: "Lecture 4 — Cartesian product and joins",
    origin: "Lecture 4",
    summary:
      "Cardinality multiplies, degree adds. A theta join is σ over a product: R ⋈_F S = σ_F(R X S). Equijoin keeps both copies of the joining attribute.",
    topics: [
      { id: "cartesian-product", label: "Cartesian product" },
      { id: "equijoin", label: "Equijoin" }
    ],
    questionIds: ["lec4-product-shape", "lec4-join-identity", "lec4-difference"]
  },
  {
    id: "lecture-5",
    title: "Lecture 5 — Natural join, outer joins, semijoin, division",
    origin: "Lecture 5",
    summary:
      "Natural join collapses the duplicate join attribute. Outer joins preserve the named side and pad with NULL. Semijoin is Π over the join. Division means for all — the DreamHome viewing example.",
    topics: [
      { id: "natural-join", label: "Natural join" },
      { id: "outer-join-left", label: "Left outer" },
      { id: "semijoin", label: "Semijoin" },
      { id: "division", label: "Division" }
    ],
    questionIds: [
      "lec5-semijoin-rewrite",
      "lec5-natural-clients",
      "lec5-left-outer-viewings",
      "lec5-semijoin-glasgow",
      "lec5-division-viewing"
    ]
  },
  {
    id: "hw1-q1",
    title: "Homework #1, Question 1 — R and S",
    origin: "Homework #1, Question 1",
    summary:
      "Two relations sharing j, with matching values, a left-only value and a right-only value. Compute the equijoin, natural join, all three outer joins, the semijoin and a division.",
    topics: [
      { id: "equijoin", label: "Equijoin" },
      { id: "natural-join", label: "Natural join" },
      { id: "outer-join-left", label: "Outer joins" },
      { id: "semijoin", label: "Semijoin" },
      { id: "division", label: "Division" }
    ],
    questionIds: ["hw1-q1a", "hw1-q1b", "hw1-q1c", "hw1-q1d", "hw1-q1e", "hw1-q1f", "hw1-q1g"]
  },
  {
    id: "hw1-q2",
    title: "Homework #1, Question 2 — Hotel / Room",
    origin: "Homework #1, Question 2",
    summary:
      "Read Hotel ▷ (σ price > 50 (Room)) and σ Hotel.hotelNo = Room.hotelNo (Hotel X Room) into English: whose attributes survive, and what happens to hotels with no rooms.",
    topics: [{ id: "reading-expressions", label: "Read the expressions" }],
    questionIds: ["hw1-q2a", "hw1-q2b"]
  },
  {
    id: "hw1-q3",
    title: "Homework #1, Question 3 — Staff / Branch",
    origin: "Homework #1, Question 3",
    summary:
      "Write algebra over the class case study. city is in Branch, not Staff — that is why these need a join on branchNo.",
    topics: [{ id: "writing-expressions", label: "Write the queries" }],
    questionIds: ["hw1-q3a", "hw1-q3b", "hw1-q3c"]
  },
  {
    id: "hw1-q4",
    title: "Homework #1, Question 4 — Library",
    origin: "Homework #1, Question 4",
    summary:
      "From a single projection through a four-relation join path. Book and Borrower share no attribute; the path is ISBN → copyNo → borrowerNo.",
    topics: [
      { id: "writing-expressions", label: "Write the queries" },
      { id: "multi-table", label: "Multi-table" }
    ],
    questionIds: ["hw1-q4a", "hw1-q4b", "hw1-q4c", "hw1-q4d", "hw1-q4e", "hw1-q4f", "hw1-q4g"]
  },
  {
    id: "sg-music",
    title: "Study guide — Album / RecordLabel",
    origin: "Class study guide",
    summary:
      "Seven join tasks over two relations sharing only labelCode, ending with a theta join on Album.sales ≥ RecordLabel.minSalesTarget — the one predicate in the course material that is not an equality.",
    topics: [
      { id: "equijoin", label: "Equijoin & theta join" },
      { id: "natural-join", label: "Natural join" },
      { id: "outer-join-left", label: "Outer joins" },
      { id: "semijoin", label: "Semijoin" }
    ],
    questionIds: [
      "sg-music-1",
      "sg-music-2",
      "sg-music-3",
      "sg-music-4",
      "sg-music-5",
      "sg-music-6",
      "sg-music-7"
    ]
  },
  {
    id: "sg-cpa-read",
    title: "Class Practice Activity — Questions 1 and 2",
    origin: "Class Practice Activity",
    summary:
      "Foreign keys and the two integrity rules over the hotel schema, then four expressions to read back into English — including the division that asks who has booked at every London hotel.",
    topics: [
      { id: "integrity", label: "Integrity" },
      { id: "reading-expressions", label: "Read the expressions" },
      { id: "division", label: "Division" }
    ],
    questionIds: ["sg-cpa-1a", "sg-cpa-2a", "sg-cpa-2c", "sg-cpa-2d", "sg-cpa-2f"]
  },
  {
    id: "sg-cpa-write",
    title: "Class Practice Activity — Question 3",
    origin: "Class Practice Activity",
    summary:
      "Seven queries to write over Hotel, Room, Booking and Guest. (f) only works as an outer join: an unoccupied room still has to be listed.",
    topics: [
      { id: "selection", label: "Selection" },
      { id: "projection", label: "Projection" },
      { id: "writing-expressions", label: "Write the queries" },
      { id: "outer-join-left", label: "Outer join" },
      { id: "multi-table", label: "Multi-table" }
    ],
    questionIds: [
      "sg-cpa-3a",
      "sg-cpa-3b",
      "sg-cpa-3c",
      "sg-cpa-3d",
      "sg-cpa-3e",
      "sg-cpa-3f",
      "sg-cpa-3g"
    ]
  }
];

export function SourceMaterials({
  onStartPractice,
  onOpenQuestions,
  className
}: {
  onStartPractice: (options: { topic: TopicId; label: string }) => void;
  onOpenQuestions: (questionIds: string[], title: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">Course sources</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            Lectures 2–5, Homework #1 and the class study guide, as set. Generated variants live
            in the drills — they are labelled as such and are never passed off as course material.
          </p>
        </CardHeader>
      </Card>

      {GROUPS.map((group) => {
        const count = group.questionIds
          ? SOURCE_QUESTIONS.filter((question) => group.questionIds!.includes(question.id)).length
          : SOURCE_QUESTIONS.filter((question) =>
              group.topics.some(
                (topic) =>
                  topic.id === question.topic &&
                  (question.source === "professor" || question.source === "study-guide")
              )
            ).length;

        return (
          <Card key={group.id}>
            <CardBody className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-body-sm font-semibold text-text">
                    {group.id.startsWith("hw") ? (
                      <FileText className="h-4 w-4 text-accent" aria-hidden />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-accent" aria-hidden />
                    )}
                    {group.title}
                  </p>
                  <p className="mt-1.5 text-body-sm leading-relaxed text-text-secondary">
                    {group.summary}
                  </p>
                </div>
                <Badge tone="accent" size="sm">
                  {count} course question{count === 1 ? "" : "s"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.questionIds ? (
                  <Button
                    size="sm"
                    onClick={() => onOpenQuestions(group.questionIds!, group.title)}
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    Open these questions
                  </Button>
                ) : null}
                {group.topics.map((topic) => (
                  <Button
                    key={topic.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => onStartPractice({ topic: topic.id, label: topic.label })}
                  >
                    Practise {topic.label}
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>
        );
      })}

      <Card>
        <CardBody className="flex flex-wrap items-center gap-3">
          <Library className="h-4 w-4 text-accent" aria-hidden />
          <p className="text-body-sm text-text-secondary">
            The existing CS 4354 quizzes, notes and cheat sheet on the class page cover SQL,
            normalisation and later exams. This section is Exam 1 only — Lectures 2–5 and
            Homework #1.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
