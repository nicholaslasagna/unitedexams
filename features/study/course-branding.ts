export interface CourseVisual {
  artworkSrc: string;
  surfaceClass: string;
  chipClass: string;
  glowClass: string;
}

const courseVisuals: Record<string, CourseVisual> = {
  "software-engineering": {
    artworkSrc: "/images/courses/software-engineering.svg",
    surfaceClass: "from-cyan-500/18 via-blue-500/12 to-transparent",
    chipClass: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    glowClass: "shadow-[0_18px_50px_hsl(195_100%_55%/0.12)]"
  },
  "differential-equations": {
    artworkSrc: "/images/courses/differential-equations.svg",
    surfaceClass: "from-indigo-500/18 via-sky-500/12 to-transparent",
    chipClass: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    glowClass: "shadow-[0_18px_50px_hsl(220_100%_62%/0.12)]"
  },
  "computer-architecture": {
    artworkSrc: "/images/courses/computer-architecture.svg",
    surfaceClass: "from-fuchsia-500/18 via-violet-500/12 to-transparent",
    chipClass: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    glowClass: "shadow-[0_18px_50px_hsl(272_100%_68%/0.12)]"
  },
  "theory-of-automata": {
    artworkSrc: "/images/courses/theory-of-automata.svg",
    surfaceClass: "from-emerald-500/18 via-teal-500/12 to-transparent",
    chipClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    glowClass: "shadow-[0_18px_50px_hsl(160_100%_48%/0.12)]"
  }
};

const fallbackVisual: CourseVisual = {
  artworkSrc: "/images/courses/default-course.svg",
  surfaceClass: "from-brand-2/18 via-brand-1/12 to-transparent",
  chipClass: "border-brand-2/30 bg-brand-2/10 text-brand-2",
  glowClass: "shadow-[0_18px_50px_hsl(var(--accent)/0.12)]"
};

export function getCourseVisual(courseId: string): CourseVisual {
  return courseVisuals[courseId] ?? fallbackVisual;
}
