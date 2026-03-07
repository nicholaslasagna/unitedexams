"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { SectionSummary } from "@/features/professor/api";

export function SectionCard({
  section,
  onCopy,
  onRegenerate,
  onDelete
}: {
  section: SectionSummary;
  onCopy: (code: string) => void;
  onRegenerate: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
}) {
  const router = useRouter();
  const sectionHref = `/app/sections/${section.id}`;

  const openSection = () => {
    router.push(sectionHref);
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover focus-within:border-border-accent focus-within:shadow-card-hover"
      onClick={openSection}
    >
      <CardBody
        className="space-y-3 p-5"
        role="link"
        tabIndex={0}
        aria-label={`Open section ${section.name}`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openSection();
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-text">{section.name}</h3>
            <p className="text-xs text-muted">
              {section.course_id}
              {section.term ? ` · ${section.term}` : ""}
            </p>
          </div>
          <Link
            href={sectionHref}
            className="text-sm font-semibold text-accent hover:text-text"
            onClick={(event) => event.stopPropagation()}
          >
            Open section
          </Link>
        </div>

        <div
          className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="font-mono text-sm text-text">Join code: {section.join_code}</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-8 px-2" onClick={() => onCopy(section.join_code)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-8 px-2" onClick={() => onRegenerate(section.id)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onDelete ? (
              <Button variant="ghost" className="h-8 px-2 text-danger hover:text-danger" onClick={() => onDelete(section.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
