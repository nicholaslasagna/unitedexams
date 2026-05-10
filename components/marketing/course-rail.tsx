"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Persistent right-side rail of course codes — a vertical strip of
 * mono uppercase text down the right edge of the homepage. Hovering
 * a code highlights the corresponding course card; scrolling past a
 * course's section auto-marks it active via IntersectionObserver.
 *
 * Hidden on screens narrower than 1100px (the design's editorial
 * grid only has the headroom for it on desktops). Above-mobile but
 * below-desktop users get the same hero without the rail — the
 * editorial layout stays clean.
 */
export type CourseRailEntry = {
  id: string;
  code: string;
};

export function CourseRail({ entries }: { entries: CourseRailEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            setActiveId(record.target.id);
          }
        }
      },
      // Cross the middle band of the viewport — the most "in view" course
      // wins. Negative margins on top/bottom shrink the active band.
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <aside className="course-rail" aria-label="Course shortcuts">
      <span className="course-rail-line" aria-hidden />
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`#${entry.id}`}
          className={cn("rail-mark", activeId === entry.id && "is-active")}
          onMouseEnter={() => setActiveId(entry.id)}
        >
          {entry.code}
        </Link>
      ))}
      <span className="course-rail-line" aria-hidden />
    </aside>
  );
}
