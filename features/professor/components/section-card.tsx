import Link from "next/link";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { SectionSummary } from "@/features/professor/api";

export function SectionCard({
  section,
  onCopy,
  onRegenerate
}: {
  section: SectionSummary;
  onCopy: (code: string) => void;
  onRegenerate: (sectionId: string) => void;
}) {
  return (
    <Card>
      <CardBody className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-text">{section.name}</h3>
            <p className="text-xs text-muted">
              {section.course_id}
              {section.term ? ` · ${section.term}` : ""}
            </p>
          </div>
          <Link href={`/app/professor/sections/${section.id}`} className="text-sm font-semibold text-accent hover:text-text">
            Open section
          </Link>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
          <span className="font-mono text-sm text-text">Join code: {section.join_code}</span>
          <div className="flex gap-2">
            <Button variant="ghost" className="h-8 px-2" onClick={() => onCopy(section.join_code)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-8 px-2" onClick={() => onRegenerate(section.id)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
