export interface CourseContent {
  notes: string;
  cheatSheet: string;
  resources: { label: string; href: string; type: "video" | "article" | "book" | "tool" }[];
}

export const notesByCourse: Record<string, CourseContent> = {
  "software-engineering": {
    "notes": "## Software Engineering Test 1 Cheat Sheet\n\nUse this as a high-signal review before quiz attempts. Focus on **concept contrasts**, not just definitions.\n\n> **Exam pattern:** Most misses come from mixing similar concepts (e.g., *user vs system requirements*, *validation vs verification*, *waterfall vs incremental*).\n\n### Core Product Attributes\n\n  - **Maintainability**: can evolve with changing needs.\n\n  - **Dependability & security**: safe, reliable, and trusted behavior.\n\n  - **Efficiency**: does not waste compute/memory resources.\n\n  - **Acceptability**: understandable, usable, and compatible for users.\n\n### Process Models\n\n  - **Waterfall**: sequential, plan-driven, strong documentation, weak flexibility.\n\n  - **Incremental**: delivers in slices, supports change, early feedback.\n\n  - **Agile (Scrum/XP)**: short cycles, continuous collaboration, frequent delivery.\n\n### Requirements Engineering\n\n  - **Elicitation**: interviews, scenarios, ethnography, workshops.\n\n  - **Specification**: user requirements (high-level) and system requirements (detailed).\n\n  - **Validation checks**: validity, consistency, completeness, realism, verifiability.\n\n### Agile Manifesto Values\n\n  - Individuals and interactions over processes and tools.\n\n  - Working software over comprehensive documentation.\n\n  - Customer collaboration over contract negotiation.\n\n  - Responding to change over following a plan.\n\n### Quick Traps\n\n  - Prototypes are often **throw-away**; not production-ready by default.\n\n  - Maintenance usually exceeds initial development cost in long-lived systems.\n\n  - Non-functional requirements are not optional; they define quality constraints.\n",
    "cheatSheet": "## Software Engineering Test 1 Cheat Sheet\n\nUse this as a high-signal review before quiz attempts. Focus on **concept contrasts**, not just definitions.\n\n> **Exam pattern:** Most misses come from mixing similar concepts (e.g., *user vs system requirements*, *validation vs verification*, *waterfall vs incremental*).\n\n### Core Product Attributes\n\n  - **Maintainability**: can evolve with changing needs.\n\n  - **Dependability & security**: safe, reliable, and trusted behavior.\n\n  - **Efficiency**: does not waste compute/memory resources.\n\n  - **Acceptability**: understandable, usable, and compatible for users.\n\n### Process Models\n\n  - **Waterfall**: sequential, plan-driven, strong documentation, weak flexibility.\n\n  - **Incremental**: delivers in slices, supports change, early feedback.\n\n  - **Agile (Scrum/XP)**: short cycles, continuous collaboration, frequent delivery.\n\n### Requirements Engineering\n\n  - **Elicitation**: interviews, scenarios, ethnography, workshops.\n\n  - **Specification**: user requirements (high-level) and system requirements (detailed).\n\n  - **Validation checks**: validity, consistency, completeness, realism, verifiability.\n\n### Agile Manifesto Values\n\n  - Individuals and interactions over processes and tools.\n\n  - Working software over comprehensive documentation.\n\n  - Customer collaboration over contract negotiation.\n\n  - Responding to change over following a plan.\n\n### Quick Traps\n\n  - Prototypes are often **throw-away**; not production-ready by default.\n\n  - Maintenance usually exceeds initial development cost in long-lived systems.\n\n  - Non-functional requirements are not optional; they define quality constraints.\n",
    "resources": [
      {
        "label": "IEEE SWEBOK Overview",
        "href": "https://www.computer.org/education/bodies-of-knowledge/software-engineering",
        "type": "article"
      },
      {
        "label": "Agile Manifesto",
        "href": "https://agilemanifesto.org/",
        "type": "article"
      },
      {
        "label": "Software Engineering at Google",
        "href": "https://abseil.io/resources/swe-book",
        "type": "book"
      }
    ]
  },
  "differential-equations": {
    "notes": "## Differential Equations Quick Reference\n\nPrioritize method selection first, then execution. Most errors happen from choosing the wrong method.\n\n> **Workflow:** classify equation type -> pick method -> solve general form -> apply initial condition -> sanity-check behavior.\n\n### First-Order ODEs\n\n  - **Separable**: rewrite as g(y)dy = f(x)dx, then integrate.\n\n  - **Linear**: y' + P(x)y = Q(x), integrating factor mu(x)=exp(integral P(x)dx).\n\n  - **Logistic**: y' = ry(1-y/K), equilibria at y=0 and y=K.\n\n### Second-Order Linear ODEs\n\n  - Characteristic equation gives homogeneous solution shape.\n\n  - Distinct real roots: c1e^{r1x}+c2e^{r2x}.\n\n  - Repeated root r: (c1+c2x)e^{rx}.\n\n  - Complex roots a +- bi: e^{ax}(c1 cos bx + c2 sin bx).\n\n### Nonhomogeneous Strategy\n\n  - Find y_h first.\n\n  - Find y_p using undetermined coefficients (or variation of parameters).\n\n  - If trial overlaps y_h, multiply by x until independent.\n\n### Laplace Transform\n\n  - L{y'} = sY(s)-y(0).\n\n  - L{y''} = s^2Y(s)-s y(0)-y'(0).\n\n  - Use partial fractions for inverse transforms of rational Y(s).\n\n  - Great for piecewise forcing and initial-value problems.\n\n### Systems and Stability\n\n  - For x' = Ax, eigenvalues control growth/decay/oscillation.\n\n  - All eigenvalues with negative real parts -> asymptotically stable origin.\n\n  - One positive and one negative real eigenvalue -> saddle (unstable).\n",
    "cheatSheet": "## Differential Equations Quick Reference\n\nPrioritize method selection first, then execution. Most errors happen from choosing the wrong method.\n\n> **Workflow:** classify equation type -> pick method -> solve general form -> apply initial condition -> sanity-check behavior.\n\n### First-Order ODEs\n\n  - **Separable**: rewrite as g(y)dy = f(x)dx, then integrate.\n\n  - **Linear**: y' + P(x)y = Q(x), integrating factor mu(x)=exp(integral P(x)dx).\n\n  - **Logistic**: y' = ry(1-y/K), equilibria at y=0 and y=K.\n\n### Second-Order Linear ODEs\n\n  - Characteristic equation gives homogeneous solution shape.\n\n  - Distinct real roots: c1e^{r1x}+c2e^{r2x}.\n\n  - Repeated root r: (c1+c2x)e^{rx}.\n\n  - Complex roots a +- bi: e^{ax}(c1 cos bx + c2 sin bx).\n\n### Nonhomogeneous Strategy\n\n  - Find y_h first.\n\n  - Find y_p using undetermined coefficients (or variation of parameters).\n\n  - If trial overlaps y_h, multiply by x until independent.\n\n### Laplace Transform\n\n  - L{y'} = sY(s)-y(0).\n\n  - L{y''} = s^2Y(s)-s y(0)-y'(0).\n\n  - Use partial fractions for inverse transforms of rational Y(s).\n\n  - Great for piecewise forcing and initial-value problems.\n\n### Systems and Stability\n\n  - For x' = Ax, eigenvalues control growth/decay/oscillation.\n\n  - All eigenvalues with negative real parts -> asymptotically stable origin.\n\n  - One positive and one negative real eigenvalue -> saddle (unstable).\n",
    "resources": [
      {
        "label": "Paul's Online Math Notes",
        "href": "https://tutorial.math.lamar.edu/classes/de/de.aspx",
        "type": "article"
      },
      {
        "label": "MIT OCW Differential Equations",
        "href": "https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/",
        "type": "video"
      },
      {
        "label": "Desmos Calculator",
        "href": "https://www.desmos.com/calculator",
        "type": "tool"
      }
    ]
  },
  "computer-architecture": {
    "notes": "## Computer Architecture Exam Notes (CompArch Core)\n\nThese notes mirror your **Midterm Practice**, Topic 1/2 slides, RISC-V handout, and assembly drills.\n\n> **Exam focus pattern:** code translation, machine-code encoding/decoding, hazard analysis on a 5-stage pipeline, and branch prediction behavior.\n\n### Topic 1 Fundamentals\n\n  - Performance metrics: **response time** vs **throughput**.\n\n  - Speedup = execution time old / execution time new.\n\n  - Processor equation: `CPU time = IC x CPI x cycle time`.\n\n  - Architecture design balances performance with cost, power, and availability.\n\n### RISC-V Essentials\n\n  - 32 integer registers; `x0 = 0` always.\n\n  - Common formats: R, I, S, B, U, J.\n\n  - Load/store use base+offset addressing.\n\n  - Calling convention quick anchors: args in `a0-a7`, return in `a0`, return address in `ra`.\n\n### Assembly and Machine Code\n\n  - Array indexing: for int arrays, byte offset = index x 4.\n\n  - `A[2*i]` offset is `8*i` (shift left by 3).\n\n  - Sign-immediate sanity: `addi` uses 12-bit signed immediate.\n\n  - Practice both directions: assembly -> hex and hex -> assembly.\n\n### 5-Stage Pipeline (IF, ID, EX, MEM, WB)\n\n  - **RAW hazards**: consumer reads before producer writeback.\n\n  - Forwarding removes many ALU-to-ALU stalls.\n\n  - Load-use usually still needs at least one bubble.\n\n  - Control hazards come from branch outcome/target uncertainty.\n\n### Branch Prediction\n\n  - Predicted-not-taken is simple baseline.\n\n  - 2-bit predictor uses Strong/Weak Taken and Strong/Weak Not-Taken states.\n\n  - Hysteresis lowers mispredictions for strongly biased branches.\n\n### What to Drill Before Quiz\n\n  - Translate `if/else` and `for` loops into clean RISC-V.\n\n  - Decode one R-type and one I-type instruction from hex by hand.\n\n  - Draw a 5-stage timing chart and mark RAW/control hazards + stalls/forwarding.\n",
    "cheatSheet": "## Computer Architecture Exam Notes (CompArch Core)\n\nThese notes mirror your **Midterm Practice**, Topic 1/2 slides, RISC-V handout, and assembly drills.\n\n> **Exam focus pattern:** code translation, machine-code encoding/decoding, hazard analysis on a 5-stage pipeline, and branch prediction behavior.\n\n### Topic 1 Fundamentals\n\n  - Performance metrics: **response time** vs **throughput**.\n\n  - Speedup = execution time old / execution time new.\n\n  - Processor equation: `CPU time = IC x CPI x cycle time`.\n\n  - Architecture design balances performance with cost, power, and availability.\n\n### RISC-V Essentials\n\n  - 32 integer registers; `x0 = 0` always.\n\n  - Common formats: R, I, S, B, U, J.\n\n  - Load/store use base+offset addressing.\n\n  - Calling convention quick anchors: args in `a0-a7`, return in `a0`, return address in `ra`.\n\n### Assembly and Machine Code\n\n  - Array indexing: for int arrays, byte offset = index x 4.\n\n  - `A[2*i]` offset is `8*i` (shift left by 3).\n\n  - Sign-immediate sanity: `addi` uses 12-bit signed immediate.\n\n  - Practice both directions: assembly -> hex and hex -> assembly.\n\n### 5-Stage Pipeline (IF, ID, EX, MEM, WB)\n\n  - **RAW hazards**: consumer reads before producer writeback.\n\n  - Forwarding removes many ALU-to-ALU stalls.\n\n  - Load-use usually still needs at least one bubble.\n\n  - Control hazards come from branch outcome/target uncertainty.\n\n### Branch Prediction\n\n  - Predicted-not-taken is simple baseline.\n\n  - 2-bit predictor uses Strong/Weak Taken and Strong/Weak Not-Taken states.\n\n  - Hysteresis lowers mispredictions for strongly biased branches.\n\n### What to Drill Before Quiz\n\n  - Translate `if/else` and `for` loops into clean RISC-V.\n\n  - Decode one R-type and one I-type instruction from hex by hand.\n\n  - Draw a 5-stage timing chart and mark RAW/control hazards + stalls/forwarding.\n",
    "resources": [
      {
        "label": "RISC-V ISA Manual",
        "href": "https://riscv.org/technical/specifications/",
        "type": "book"
      },
      {
        "label": "Computer Architecture - Hennessy & Patterson",
        "href": "https://www.elsevier.com/books/computer-architecture/hennessy/978-0-12-811905-1",
        "type": "book"
      },
      {
        "label": "Compiler Explorer",
        "href": "https://godbolt.org/",
        "type": "tool"
      }
    ]
  },
  "theory-of-automata": {
    "notes": "## Theory of Automata Notes (Automata Core)\n\nBuilt from your **HW1**, **HW2**, **Test 1**, and lecture notes outline.\n\n> **Exam pattern:** set/relation proofs + regular-language constructions + nonregular proofs. Most mistakes come from using the wrong model/tool.\n\n### Sets and Relations (HW1 heavy)\n\n  - Core identity: `A - (B intersection C) = (A - B) union (A - C)`.\n\n  - Relation operations: inverse, composition, reflexive transitive closure `R*`.\n\n  - Graph criteria: a relation is a function iff each domain node has exactly one outgoing edge.\n\n  - Property checks: reflexive/symmetric/transitive vs antisymmetric; partial vs total orders.\n\n### Regular Languages and Regex\n\n  - Regex operations: union, concatenation, Kleene star.\n\n  - From your work: no-more-than-3-a's and a-count-divisible-by-3 constructions.\n\n  - Test identity: `(b* a*) intersection (a* b*) = a* union b*`.\n\n  - Lecture example: language with 2 or 3 ones (first two nonconsecutive) starts with `0*10*010*` pattern.\n\n### DFA/NFA Construction (HW2)\n\n  - DFA construction tasks: pattern constraints like \"each a immediately preceded by b\" and substring tracking like \"contains abab\".\n\n  - NFA and regex conversion tasks: build machine from expression and expression from machine.\n\n  - Know closure facts to simplify proof paths quickly.\n\n### Proving Non-Regular\n\n  - Pumping lemma is your main contradiction tool.\n\n  - Typical examples: `{a^n b^n}`, and homework-style hard languages.\n\n  - Quantifier order matters: choose witness after pumping length is fixed.\n\n### CFG / PDA / TM Ladder\n\n  - All regular languages are context-free, but not vice versa.\n\n  - PDA handles stack-structured dependencies (e.g., `{ww^R}` as a CFL example).\n\n  - TM level is needed for broader computability tasks (e.g., language families beyond CFL).\n\n### Fast Prep Checklist\n\n  - Do one relation-property proof, one regex design, one DFA table build, one pumping proof.\n\n  - When solving: first label the language class, then choose the proof/machine tool.\n",
    "cheatSheet": "## Theory of Automata Notes (Automata Core)\n\nBuilt from your **HW1**, **HW2**, **Test 1**, and lecture notes outline.\n\n> **Exam pattern:** set/relation proofs + regular-language constructions + nonregular proofs. Most mistakes come from using the wrong model/tool.\n\n### Sets and Relations (HW1 heavy)\n\n  - Core identity: `A - (B intersection C) = (A - B) union (A - C)`.\n\n  - Relation operations: inverse, composition, reflexive transitive closure `R*`.\n\n  - Graph criteria: a relation is a function iff each domain node has exactly one outgoing edge.\n\n  - Property checks: reflexive/symmetric/transitive vs antisymmetric; partial vs total orders.\n\n### Regular Languages and Regex\n\n  - Regex operations: union, concatenation, Kleene star.\n\n  - From your work: no-more-than-3-a's and a-count-divisible-by-3 constructions.\n\n  - Test identity: `(b* a*) intersection (a* b*) = a* union b*`.\n\n  - Lecture example: language with 2 or 3 ones (first two nonconsecutive) starts with `0*10*010*` pattern.\n\n### DFA/NFA Construction (HW2)\n\n  - DFA construction tasks: pattern constraints like \"each a immediately preceded by b\" and substring tracking like \"contains abab\".\n\n  - NFA and regex conversion tasks: build machine from expression and expression from machine.\n\n  - Know closure facts to simplify proof paths quickly.\n\n### Proving Non-Regular\n\n  - Pumping lemma is your main contradiction tool.\n\n  - Typical examples: `{a^n b^n}`, and homework-style hard languages.\n\n  - Quantifier order matters: choose witness after pumping length is fixed.\n\n### CFG / PDA / TM Ladder\n\n  - All regular languages are context-free, but not vice versa.\n\n  - PDA handles stack-structured dependencies (e.g., `{ww^R}` as a CFL example).\n\n  - TM level is needed for broader computability tasks (e.g., language families beyond CFL).\n\n### Fast Prep Checklist\n\n  - Do one relation-property proof, one regex design, one DFA table build, one pumping proof.\n\n  - When solving: first label the language class, then choose the proof/machine tool.\n",
    "resources": [
      {
        "label": "Introduction to the Theory of Computation (Sipser)",
        "href": "https://mitpress.mit.edu/9781133187790/introduction-to-the-theory-of-computation/",
        "type": "book"
      },
      {
        "label": "JFLAP",
        "href": "http://www.jflap.org/",
        "type": "tool"
      },
      {
        "label": "Stanford CS103 Archive",
        "href": "https://web.stanford.edu/class/archive/cs/cs103/cs103.1164/",
        "type": "article"
      }
    ]
  }
};
