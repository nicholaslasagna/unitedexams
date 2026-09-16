"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RAExpression } from "@/components/ra/ra-expression";
import { RA_SYMBOLS } from "@/lib/relational-algebra/notation";
import { cn } from "@/lib/utils";

/**
 * The notation reference, and the handful of rules that decide most marks.
 *
 * Written to be read in the ten minutes before the exam: every entry is the
 * symbol, one sentence of meaning, an example, and what the example returns.
 * No prose beyond that — a cheat sheet that needs reading twice is not one.
 */

const RULES: { title: string; body: string }[] = [
  {
    title: "Degree vs cardinality",
    body:
      "Degree = number of attributes (columns). Cardinality = number of tuples (rows). Selection changes cardinality only; projection changes degree, and can change cardinality too because it removes duplicates."
  },
  {
    title: "Cartesian product arithmetic",
    body:
      "cardinality(R X S) = cardinality(R) × cardinality(S). degree(R X S) = degree(R) + degree(S). They do not combine the same way."
  },
  {
    title: "A join is a filtered product",
    body:
      "R ⋈_F S = σ_F(R X S). If you cannot remember what a join returns, write it as a product and a selection and read it off."
  },
  {
    title: "Equijoin vs natural join",
    body:
      "Same tuples, different schemas. An equijoin keeps both copies of the joining attribute; a natural join eliminates one occurrence of each common attribute, so its degree is one lower per common attribute."
  },
  {
    title: "Outer joins preserve the side they name",
    body:
      "Left outer keeps every tuple of the LEFT relation, padding the right with NULL. Right outer does the opposite. Full outer keeps both. An outer join is still not a Cartesian product — only matching tuples are paired."
  },
  {
    title: "Semijoin is directional",
    body:
      "R ▷ S returns tuples of R only, with R's attributes. S decides who qualifies and then disappears. Each qualifying tuple appears once, however many matches it had. R ▷ S ≠ S ▷ R."
  },
  {
    title: "Division means for all",
    body:
      "R ÷ S keeps the values paired with EVERY tuple of S. Extra pairings are ignored. If R is over A and S over B, the result is over C = A − B."
  },
  {
    title: "NULL",
    body:
      "NULL is the absence of a value — not zero, not a space, not equal to anything including another NULL. Any comparison involving NULL is unknown, and unknown is not true."
  },
  {
    title: "Keys",
    body:
      "Superkey = identifies a tuple uniquely. Candidate key = a superkey with no proper subset that is also a superkey (uniqueness + irreducibility). Primary key = the candidate key chosen; the rest are alternate keys."
  },
  {
    title: "Integrity",
    body:
      "Entity integrity: no attribute of a primary key may be null. Referential integrity: a foreign key must match a candidate key in the referenced relation, or be wholly null."
  }
];

export function CheatSheet({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-5", className)}>
      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">Notation</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            The glyphs as CS 4354 writes them. Where a second form is common, it is noted —
            they mean the same thing.
          </p>
        </CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-borderc">
            {RA_SYMBOLS.map((symbol, index) => (
              <li
                key={`${symbol.glyph}-${index}`}
                className="grid gap-2 px-5 py-3.5 sm:grid-cols-[auto_1fr] sm:gap-4 sm:px-6"
              >
                <div className="flex items-baseline gap-2 sm:w-28 sm:flex-col sm:items-start sm:gap-0.5">
                  <span className="font-serif text-2xl font-semibold leading-none text-accent">
                    {symbol.glyph}
                  </span>
                  <span className="text-body-sm font-semibold text-text">{symbol.name}</span>
                  {symbol.alternate ? (
                    <span className="text-caption text-faint">
                      also written {symbol.alternate}
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <p className="text-body-sm leading-relaxed text-text-secondary">
                    {symbol.meaning}
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-borderc bg-soft px-3 py-1.5">
                    <RAExpression source={symbol.example} />
                  </div>
                  <p className="text-caption text-faint">{symbol.exampleMeaning}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold text-text">Rules worth memorising</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            The ten that decide most of the marks on Exam 1.
          </p>
        </CardHeader>
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            {RULES.map((rule) => (
              <div key={rule.title} className="rounded-xl border border-borderc bg-soft px-4 py-3">
                <dt className="text-body-sm font-semibold text-text">{rule.title}</dt>
                <dd className="mt-1 text-body-sm leading-relaxed text-text-secondary">
                  {rule.body}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
