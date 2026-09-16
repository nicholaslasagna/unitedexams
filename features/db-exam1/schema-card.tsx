"use client";

import { KeyRound, Link2 } from "lucide-react";
import { getCourseSchema } from "@/data/seed/db-exam1/relations";
import { cn } from "@/lib/utils";

/**
 * The schema, printed beside the question.
 *
 * Deciding *which relation holds which attribute* is half of writing a query,
 * and the mistake the course punishes hardest — reaching for `city` in Staff.
 * So the schema stays visible while the learner works rather than being
 * something they have to remember or go and look up. Primary keys are
 * underlined, as the homework underlines them.
 */
export function SchemaCard({
  schemaId,
  /** Relations to emphasise — the ones this question needs. */
  highlight = [],
  className
}: {
  schemaId: string;
  highlight?: string[];
  className?: string;
}) {
  const schema = getCourseSchema(schemaId);
  if (!schema) return null;

  const emphasised = new Set(highlight.map((name) => name.toLowerCase()));

  return (
    <div className={cn("rounded-xl border border-borderc bg-soft px-4 py-3", className)}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-body-sm font-semibold text-text">{schema.label}</h3>
        <span className="text-caption uppercase tracking-[0.08em] text-faint">{schema.origin}</span>
      </div>

      <ul className="space-y-2">
        {schema.relations.map((relation) => {
          const isEmphasised =
            emphasised.size === 0 || emphasised.has(relation.name.toLowerCase());
          return (
            <li
              key={relation.name}
              className={cn(
                "font-mono text-[0.8rem] leading-relaxed",
                isEmphasised ? "text-text" : "text-faint opacity-60"
              )}
            >
              <span className="font-semibold">{relation.name}</span>
              <span className="text-muted">(</span>
              {relation.attributes.map((attribute, index) => (
                <span key={attribute}>
                  {index > 0 ? <span className="text-muted">, </span> : null}
                  <span
                    className={cn(
                      relation.primaryKey.includes(attribute) &&
                        "underline decoration-accent decoration-2 underline-offset-2"
                    )}
                  >
                    {attribute}
                  </span>
                </span>
              ))}
              <span className="text-muted">)</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-borderc pt-2 text-caption text-faint">
        <span className="inline-flex items-center gap-1">
          <KeyRound className="h-3 w-3" aria-hidden />
          underlined = primary key
        </span>
        {schema.relations.some((relation) => relation.foreignKeys?.length) ? (
          <span className="inline-flex items-center gap-1">
            <Link2 className="h-3 w-3" aria-hidden />
            {schema.relations
              .flatMap((relation) =>
                (relation.foreignKeys ?? []).map(
                  (fk) => `${relation.name}.${fk.attributes.join(",")} → ${fk.references}`
                )
              )
              .join(" · ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
