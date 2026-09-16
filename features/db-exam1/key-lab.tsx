"use client";

import { useMemo, useState } from "react";
import { KeyRound, ShieldAlert, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RelationTable } from "@/components/ra/relation-table";
import { generateIntegrityQuestion, generateKeyQuestion, isCandidateKey, isSuperkey } from "./generators/keys";
import { cn } from "@/lib/utils";

/**
 * Keys & integrity, as a lab rather than a quiz.
 *
 * Click attributes to assemble a set, and the uniqueness / irreducibility
 * tests run live against the table — the same tests the grader uses. The
 * integrity half is a concrete insert: which rule does this row break?
 */

export function KeyLab({
  onDrill,
  className
}: {
  onDrill?: (topic: "keys" | "integrity") => void;
  className?: string;
}) {
  const [seed, setSeed] = useState(11);
  const [selected, setSelected] = useState<string[]>([]);
  const [insertChoice, setInsertChoice] = useState<number | null>(null);
  const [insertChecked, setInsertChecked] = useState(false);

  const keyQuestion = useMemo(() => generateKeyQuestion(seed, "candidate", "core"), [seed]);
  const relation = keyQuestion.context?.relations?.[0];
  const integrityQuestion = useMemo(() => generateIntegrityQuestion(seed + 3, "core"), [seed]);

  const superkey = relation ? isSuperkey(relation, selected) : false;
  const candidate = relation ? isCandidateKey(relation, selected) : false;

  const toggle = (attribute: string) => {
    setSelected((current) =>
      current.includes(attribute)
        ? current.filter((name) => name !== attribute)
        : [...current, attribute]
    );
  };

  const verdict =
    selected.length === 0
      ? "Pick one or more attributes. Uniqueness is tested against the tuples shown."
      : candidate
        ? `{${selected.join(", ")}} is a candidate key: unique, and no proper subset is unique.`
        : superkey
          ? `{${selected.join(", ")}} is a superkey but not a candidate key — some proper subset already identifies tuples, so the extra attribute is unnecessary.`
          : `{${selected.join(", ")}} is not a superkey: at least two tuples share those values.`;

  return (
    <div className={cn("space-y-5", className)}>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-heading font-semibold text-text">Keys lab</h2>
            <p className="mt-0.5 text-body-sm text-text-secondary">
              Assemble an attribute set and read uniqueness off the data — the way Lecture 2
              defines superkeys and candidate keys.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSeed(Math.floor(Math.random() * 100000));
              setSelected([]);
            }}
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            New table
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {relation ? <RelationTable relation={relation} caption={relation.name} /> : null}

          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-secondary">
              Candidate set
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {relation?.attributes.map((attribute) => {
                const on = selected.includes(attribute);
                return (
                  <button
                    key={attribute}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(attribute)}
                    className={cn(
                      "rounded-xl border px-3 py-2 font-mono text-body-sm font-semibold transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                      on
                        ? "border-transparent bg-accent text-accent-fg"
                        : "border-borderc bg-soft text-text hover:border-border-accent"
                    )}
                  >
                    {attribute}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone={superkey ? "success" : "default"} size="sm">
              Superkey {superkey ? "yes" : "no"}
            </Badge>
            <Badge tone={candidate ? "success" : "default"} size="sm">
              Candidate key {candidate ? "yes" : "no"}
            </Badge>
          </div>

          <p className="rounded-xl border border-borderc bg-soft px-4 py-3 text-body-sm leading-relaxed text-text">
            {verdict}
          </p>

          <p className="text-body-sm text-text-secondary">
            A superkey only has to be unique. A candidate key has to be unique{" "}
            <span className="font-semibold text-text">and</span> irreducible. If A alone identifies
            every tuple, {"{A, B}"} is still a superkey — B is just unnecessary.
          </p>

          {onDrill ? (
            <Button variant="secondary" size="sm" onClick={() => onDrill("keys")}>
              <KeyRound className="h-3.5 w-3.5" aria-hidden />
              Drill key questions
            </Button>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">Integrity lab</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            Name the rule a concrete insert breaks — entity integrity for the primary key,
            referential integrity for the foreign key.
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-body-sm font-semibold text-text">{integrityQuestion.prompt}</p>
          {integrityQuestion.kind === "choice" ? (
            <div className="space-y-2" role="group" aria-label="Integrity rule">
              {integrityQuestion.options.map((option, index) => {
                const selectedOption = insertChoice === index;
                const reveal = insertChecked;
                return (
                  <button
                    key={index}
                    type="button"
                    aria-pressed={selectedOption}
                    onClick={() => {
                      setInsertChoice(index);
                      setInsertChecked(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-body-sm transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                      !reveal && selectedOption && "border-border-accent bg-accent/10",
                      !reveal && !selectedOption && "border-borderc bg-surface hover:bg-soft dark:bg-surface-raised",
                      reveal && option.correct && "border-success/50 bg-success/10",
                      reveal && selectedOption && !option.correct && "border-danger/50 bg-danger/10"
                    )}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setInsertChecked(true)}
              disabled={insertChoice === null}
            >
              Check
            </Button>
            {onDrill ? (
              <Button variant="secondary" onClick={() => onDrill("integrity")}>
                <ShieldAlert className="h-4 w-4" aria-hidden />
                Drill integrity
              </Button>
            ) : null}
          </div>

          {insertChecked && integrityQuestion.kind === "choice" && insertChoice !== null ? (
            <p
              className={cn(
                "rounded-xl border px-4 py-3 text-body-sm leading-relaxed",
                integrityQuestion.options[insertChoice]?.correct
                  ? "border-success/40 bg-success/10 text-text"
                  : "border-danger/40 bg-danger/10 text-text"
              )}
            >
              {integrityQuestion.options[insertChoice]?.correct
                ? integrityQuestion.explanation
                : integrityQuestion.options[insertChoice]?.note ?? integrityQuestion.explanation}
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
