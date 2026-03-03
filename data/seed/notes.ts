export interface CourseContent {
  notes: string;
  cheatSheet: string;
  resources: { label: string; href: string; type: "video" | "article" | "book" | "tool" }[];
}

export const notesByCourse: Record<string, CourseContent> = {
  "software-engineering": {
    notes: `# Software Engineering Notes\n\n## Requirements to Architecture\n- Define **functional** and **non-functional** requirements early.\n- Keep acceptance criteria measurable.\n- Trace every requirement to implementation and tests.\n\n## SOLID Quick Lens\n1. **S**ingle Responsibility\n2. **O**pen/Closed\n3. **L**iskov Substitution\n4. **I**nterface Segregation\n5. **D**ependency Inversion\n\n## Delivery Metrics\n- Lead Time\n- Deployment Frequency\n- MTTR\n- Change Failure Rate\n\n> Great teams optimize for sustainable reliability, not just speed.\n\n## Testing Pyramid\n- Unit tests (fast, many)\n- Integration tests (contract confidence)\n- E2E tests (critical paths only)\n`,
    cheatSheet: `# SE Cheat Sheet\n\n## Architecture Review Checklist\n- Bounded contexts clear?\n- Data ownership explicit?\n- Failure modes documented?\n- Observability included?\n\n## Incident Response\n1. Stabilize\n2. Communicate\n3. Mitigate\n4. Root-cause\n5. Prevent recurrence\n`,
    resources: [
      { label: "Designing Data-Intensive Applications", href: "https://dataintensive.net/", type: "book" },
      { label: "Google SRE Workbook", href: "https://sre.google/workbook/table-of-contents/", type: "article" },
      { label: "ADR Template", href: "https://github.com/joelparkerhenderson/architecture-decision-record", type: "tool" }
    ]
  },
  "differential-equations": {
    notes: `# Differential Equations Notes\n\n## First-order Strategy\n1. Classify equation type\n2. Choose method (separable / linear / exact)\n3. Solve symbolic form\n4. Apply initial condition\n5. Verify by substitution\n\n## Linear ODE\nFor \(y' + P(x)y = Q(x)\):\n\n\[\n\mu(x)=e^{\int P(x)\,dx}\n\]\n\nThen:\n\n\[\n\frac{d}{dx}(\mu y)=\mu Q\n\]\n\n## Second-order Constant Coefficients\n- Solve homogeneous via characteristic polynomial\n- Build particular solution based on forcing\n- Add: \(y = y_h + y_p\)\n\n## Laplace Core\n\n\[\n\mathcal{L}\{y'(t)\}=sY(s)-y(0)\n\]\n\n\[\n\mathcal{L}\{y''(t)\}=s^2Y(s)-sy(0)-y'(0)\n\]\n`,
    cheatSheet: `# DE Cheat Sheet\n\n## Characteristic Roots\n- Distinct real \(r_1,r_2\): \(c_1e^{r_1x}+c_2e^{r_2x}\)\n- Repeated \(r\): \((c_1+c_2x)e^{rx}\)\n- Complex \(a\pm bi\): \(e^{ax}(c_1\cos bx + c_2\sin bx)\)\n\n## Laplace Table Snippets\n- \(\mathcal{L}\{\sin(at)\}=\frac{a}{s^2+a^2}\)\n- \(\mathcal{L}\{\cos(at)\}=\frac{s}{s^2+a^2}\)\n- \(\mathcal{L}\{e^{at}\}=\frac{1}{s-a}\)\n`,
    resources: [
      { label: "Paul's Online Math Notes", href: "https://tutorial.math.lamar.edu/classes/de/de.aspx", type: "article" },
      { label: "MIT OpenCourseWare DE", href: "https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/", type: "video" },
      { label: "Desmos", href: "https://www.desmos.com/calculator", type: "tool" }
    ]
  },
  "computer-architecture": {
    notes: `# Computer Architecture Notes\n\n## Performance Equation\n\n\[\nCPU\ Time = Instruction\ Count \times CPI \times Clock\ Cycle\ Time
\]\n\n## Pipeline Hazards\n- Data hazards (RAW, WAR, WAW contexts)\n- Control hazards (branch uncertainty)\n- Structural hazards (resource conflicts)\n\n## Cache Fundamentals\n- Hit Time\n- Miss Rate\n- Miss Penalty\n\n\[\nAMAT = Hit\ Time + Miss\ Rate \times Miss\ Penalty
\]\n\n## Practical Debug Flow\n1. Validate instruction semantics\n2. Track register state\n3. Track memory effects\n4. Evaluate hazards and stalls\n`,
    cheatSheet: `# Architecture Cheat Sheet\n\n## MIPS Branches\n- \`beq rs, rt, label\` branch if equal\n- \`bne rs, rt, label\` branch if not equal\n\n## Hazard Fixes\n- Forwarding for data dependencies\n- Stalls when forwarding insufficient\n- Prediction/speculation for control hazards\n`,
    resources: [
      { label: "Computer Architecture: A Quantitative Approach", href: "https://www.elsevier.com/books/computer-architecture/hennessy/978-0-12-811905-1", type: "book" },
      { label: "Godbolt Compiler Explorer", href: "https://godbolt.org/", type: "tool" },
      { label: "Patterson & Hennessy Lecture Playlist", href: "https://www.youtube.com/results?search_query=patterson+hennessy+computer+architecture", type: "video" }
    ]
  },
  "theory-of-automata": {
    notes: `# Theory of Automata Notes\n\n## Core Language Hierarchy\nRegular \(\subset\) Context-Free \(\subset\) Context-Sensitive \(\subset\) Recursively Enumerable\n\n## DFA vs NFA\n- Same expressive power (regular languages)\n- NFA can be easier to design\n- Subset construction converts NFA to DFA\n\n## CFG Essentials\n- Variables, terminals, productions, start symbol\n- Ambiguity = multiple parse trees for same string\n\n## Computability\n- **Decidable**: halts on all inputs\n- **Recognizable**: halts and accepts members, may loop on non-members\n\n## Proof Toolkit\n- Pumping lemma (usually for non-regular/non-CFL proofs)\n- Reductions\n- Diagonalization\n`,
    cheatSheet: `# Automata Cheat Sheet\n\n## Regular Closure\nClosed under union, concatenation, star, complement, intersection, difference, reversal.\n\n## Pumping Lemma (Regular)\nIf regular, then \(\exists p\) such that every long enough string \(s=xyz\):\n- \(|xy|\le p\)\n- \(|y|>0\)\n- \(xy^iz\in L\) for all \(i\ge0\)\n`,
    resources: [
      { label: "Stanford Automata Notes", href: "https://web.stanford.edu/class/archive/cs/cs103/cs103.1164/", type: "article" },
      { label: "Sipser: Introduction to Theory of Computation", href: "https://mitpress.mit.edu/9781133187790/introduction-to-the-theory-of-computation/", type: "book" },
      { label: "JFLAP", href: "http://www.jflap.org/", type: "tool" }
    ]
  }
};
