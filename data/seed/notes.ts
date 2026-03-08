export interface CourseContent {
  notes: string;
  cheatSheet: string;
  resources: { label: string; href: string; type: "video" | "article" | "book" | "tool" }[];
}

const computerArchitectureMidtermNotes = `## Computer Architecture Midterm Master Notes

Built directly around the **standard midterm** you provided.

> **What the actual exam tested:** C-to-RISC-V translation, procedure calls + stack frames, machine-code encode/decode, 5-stage pipeline hazards/timing, and 2-bit branch prediction.

## Exact Midterm Map

### A1. C to RISC-V

You must be able to convert:

  - a simple \`if/else\`
  - a counted \`for\` loop
  - array indexing with scaled offsets

**Solve pattern**

  - Write the C control-flow shape first: compare, branch target, fall-through path, merge point.
  - For \`if (i == j)\`, branch on equality, let the \`else\` body be fall-through, and jump over the \`if\` body after the else path.
  - For integer arrays, remember:
    - \`A[i]\` offset = \`4*i\`
    - \`A[2*i]\` offset = \`8*i\`
  - Replace multiplication by powers of two with \`slli\`.
  - For \`i <= 100\`, a clean branch-exit form is to compare against \`101\` and exit when \`i >= 101\`.

### A2. Procedure Calls + Stack

You must know the difference between:

  - **leaf procedure**: does not call another function
  - **non-leaf procedure**: calls another function and must preserve what it needs

**Calling convention anchors**

  - arguments: \`a0-a7\`
  - return value: \`a0\`
  - return address: \`ra\`
  - saved registers: \`s0-s11\`

**Solve pattern**

  - If the function calls another function, save \`ra\`.
  - Save any \`s\` registers you decide to use.
  - Preserve the first result before making the second call.
  - Restore registers and deallocate stack before returning.

### A3. Assembly to Machine Code

For \`addi t0, zero, -101\`:

  - format: **I-type**
  - opcode for \`addi\`: \`0010011\`
  - \`rd = x5 (t0)\`
  - \`rs1 = x0 (zero)\`
  - \`funct3 = 000\`
  - 12-bit two's complement of \`-101\` = \`0xF9B\`
  - final hex: **\`0xF9B00293\`**

**Solve pattern**

  - Identify instruction format.
  - Write fields in exact bit order.
  - Convert signed immediate carefully before assembling hex.

### A4. Machine Code to Assembly

For \`0x4168_0FB3\`:

  - opcode \`0110011\` -> **R-type**
  - \`rd = x31 = t6\`
  - \`rs1 = x16 = a6\`
  - \`rs2 = x22 = s6\`
  - \`funct3 = 000\`
  - \`funct7 = 0100000\`
  - final instruction: **\`sub t6, a6, s6\`**

**Solve pattern**

  - Extract opcode first.
  - If R-type, decode \`rd | funct3 | rs1 | rs2 | funct7\`.
  - Use \`funct3 + funct7\` together to distinguish operations like \`add\` vs \`sub\`.

### A5. RAW Hazards + Pipeline Timing

Code:

\`\`\`
lw  sp, 20(ra)
and tp, sp, t0
or  s0, sp, t1
add s1, tp, t0
beq s0, s1, label
\`\`\`

**RAW dependencies**

  - \`lw -> and\` on \`sp\`
  - \`lw -> or\` on \`sp\`
  - \`and -> add\` on \`tp\`
  - \`or -> beq\` on \`s0\`
  - \`add -> beq\` on \`s1\`

**Pipeline timing numbers**

Assuming the standard 5-stage class model with:

  - \`IF, ID, EX, MEM, WB\`
  - normal register-file write/read timing
  - forwarding into later pipeline stages
  - branch comparison resolved in the pipeline datapath rather than counting only fetch

Then the full pipeline-drain counts are:

  - **No forwarding:** \`14\` clock cycles
  - **With forwarding:** \`10\` clock cycles

If your instructor instead stops counting at **branch resolution in EX** rather than draining the remaining empty stages, the same schedule is often reported as:

  - **No forwarding:** \`12\`
  - **With forwarding:** \`8\`

State your timing assumption clearly on the exam. The stall logic is the main thing being graded.

**Why**

  - Without forwarding, \`lw -> and\` causes the biggest early delay.
  - \`and -> add\` still forces waiting in the no-forwarding case.
  - With forwarding, almost everything clears except the classic load-use penalty.

### A6. 5-Stage Pipeline + 2-Bit Predictor

You need both:

  - the **block diagram / stage explanation**
  - the **control-hazard explanation with 2-bit predictor FSM**

**Stage responsibilities**

  - \`IF\`: fetch instruction, advance/select next PC
  - \`ID\`: decode, read registers, generate immediate/control
  - \`EX\`: ALU op, address calc, branch compare/target
  - \`MEM\`: load/store memory access
  - \`WB\`: write final result back to register file

**Hazard difference**

  - **Data hazard**: an instruction needs a value that is not ready yet
  - **Control hazard**: the next PC is uncertain because branch outcome/target is not yet known

**2-bit predictor states**

  - Strongly Not Taken
  - Weakly Not Taken
  - Weakly Taken
  - Strongly Taken

Prediction rule:

  - predict **Not Taken** in the two not-taken states
  - predict **Taken** in the two taken states

Update rule:

  - a correct outcome strengthens the current state
  - a wrong outcome weakens it
  - it takes **two opposite outcomes** to flip a strong prediction

## Exact Exam-Day Workflow

When you see a problem, classify it immediately:

  - branch / loop translation
  - procedure + stack
  - encoding
  - decoding
  - hazard list
  - pipeline timing
  - branch prediction

Then use the smallest reliable template you know.

## What You Should Memorize Cold

  - RISC-V register names used often in class: \`zero, ra, sp, t0-t6, s0-s11, a0-a7\`
  - R/I/S/B/U/J formats
  - \`addi\` is I-type
  - array offsets for \`int\` arrays are multiples of 4
  - 5 pipeline stages in order
  - 4 states of the 2-bit predictor

## Common Midterm Mistakes

  - forgetting to multiply array index by 4 bytes
  - missing the unconditional jump after the \`else\` body
  - not saving \`ra\` in a non-leaf procedure
  - confusing \`add\`/\`sub\` decode because funct3 is the same and funct7 changes
  - listing dependencies but not labeling the actual RAW hazard edges
  - giving a branch-predictor definition without the state transitions

## Best Study Plan Right Now

  1. Do one full timed run of the new midterm simulation.
  2. Rework every missed part without looking at the answer for 10 minutes.
  3. Drill A3/A4 encoding-decoding by hand until it feels routine.
  4. Redraw the A5 timing table twice: once no forwarding, once with forwarding.
  5. Recite the 2-bit predictor FSM out loud from memory.
`;

const computerArchitectureMidtermCheatSheet = `## Computer Architecture Midterm Cheat Sheet

Built from the **standard midterm**.

> **If you can do these six things cleanly, you are aligned to the exam.**

## 1. C to RISC-V

  - \`if/else\`: compare -> branch -> fall-through else -> jump -> merge
  - \`A[i]\` offset = \`4*i\`
  - \`A[2*i]\` offset = \`8*i\`
  - \`i <= 100\` can be written as exit when \`i >= 101\`

## 2. Procedure + Stack

  - non-leaf function saves \`ra\`
  - save any \`s\` registers you use
  - return value always in \`a0\`

## 3. Encode \`addi t0, zero, -101\`

  - I-type
  - immediate = \`0xF9B\`
  - final hex = **\`0xF9B00293\`**

## 4. Decode \`0x4168_0FB3\`

  - R-type
  - final instruction = **\`sub t6, a6, s6\`**

## 5. Hazards for the Given Pipeline Question

RAW edges:

  - \`lw -> and\` on \`sp\`
  - \`lw -> or\` on \`sp\`
  - \`and -> add\` on \`tp\`
  - \`or -> beq\` on \`s0\`
  - \`add -> beq\` on \`s1\`

Timing under the standard full-drain count:

  - no forwarding = **14**
  - forwarding = **10**

If counting only to branch EX resolution:

  - no forwarding = **12**
  - forwarding = **8**

## 6. 2-Bit Predictor

States:

  - Strongly Not Taken
  - Weakly Not Taken
  - Weakly Taken
  - Strongly Taken

Rules:

  - weak states flip easily
  - strong states need two opposite outcomes to fully flip

## Last-Minute Memory Checks

  - 5 pipeline stages: \`IF -> ID -> EX -> MEM -> WB\`
  - data hazard = missing operand timing
  - control hazard = uncertain next PC
  - \`addi\` uses a **signed 12-bit immediate**
`;

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
    "notes": computerArchitectureMidtermNotes,
    "cheatSheet": computerArchitectureMidtermCheatSheet,
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
