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

const softwareEngineeringArchitectureNotes = `## Software Engineering Exam 2 Architecture Guide (Chapter 6)

Built around the **Chapter 6 Architectural Design** deck and the likely exam question your professor described: identify the architecture from a multiple-choice list **A-G**.

> **What the exam is probably testing:** can you look at a scenario, pick the strongest architectural clue, and eliminate the close distractors fast.

## The A-G Map

Use this exact order when you drill:

  - **A** = Model-View-Controller (MVC)
  - **B** = Layered architecture
  - **C** = Repository architecture
  - **D** = Client-server architecture
  - **E** = Pipe-and-filter architecture
  - **F** = Transaction processing architecture
  - **G** = Language processing architecture

## The Fast Recognition Rule

Do not start by reading every option deeply. Start by asking:

  1. Is this about **UI separation**? -> **MVC**
  2. Is this about **system levels/layers**? -> **Layered**
  3. Is this about **one shared central data store**? -> **Repository**
  4. Is this about **clients using network services**? -> **Client-server**
  5. Is this about **data flowing through stages**? -> **Pipe-and-filter**
  6. Is this about **database-backed user transactions**? -> **Transaction processing**
  7. Is this about **translating or interpreting a formal language**? -> **Language processing**

## A. Model-View-Controller (MVC)

**Use it when the scenario says**

  - model, view, controller
  - multiple views of the same data
  - user input is handled separately from data storage
  - UI changes should not force data-model changes

**Core idea**

  - **Model** = system data / business state
  - **View** = what the user sees
  - **Controller** = input handling and control logic

**Main distractor**

  - **Layered** also separates concerns, but MVC is specifically about **presentation + interaction + data**.

## B. Layered Architecture

**Use it when the scenario says**

  - layers / levels
  - each layer provides services to the one above
  - adjacent layer communication
  - operating-system-like service hierarchy
  - inner layers protect critical assets

**Core idea**

  - the system is broken into levels of abstraction or responsibility

**Best exam clue**

  - if the prompt sounds like “level 1, level 2, level 3” or “upper layer uses lower-layer services,” this is usually **Layered**.

**Main distractor**

  - **MVC** is a special UI/data interaction structure; **Layered** is a whole-system structural style.

## C. Repository Architecture

**Use it when the scenario says**

  - central repository
  - shared data store
  - independent tools/components read and write the same data
  - components do not talk much directly, but all depend on common stored information

**Core idea**

  - the repository is the center of the system

**Advantages**

  - components can stay relatively independent
  - shared data is consistent and accessible

**Disadvantages**

  - repository can become a single point of failure
  - repository schema changes can ripple outward

**Main distractor**

  - **Client-server** is about remote services across a network.
  - **Repository** is about **shared central data**.

## D. Client-Server Architecture

**Use it when the scenario says**

  - browser/client/mobile app talks to one or more servers
  - distributed services over a network
  - server provides service, client consumes it
  - multiple shared services available remotely

**Core idea**

  - system functionality is distributed across clients and servers

**Advantages**

  - services can be shared and scaled
  - distribution over a network is natural

**Disadvantages**

  - network performance matters
  - services/servers may fail independently

**Main distractor**

  - if the prompt is really about business requests + database integrity, the better answer may be **Transaction processing**, not client-server.

## E. Pipe-and-Filter Architecture

**Use it when the scenario says**

  - sequence of transformations
  - output of one step becomes input to the next
  - streaming or batch processing
  - filters/stages/pipeline

**Core idea**

  - data moves through a chain of processing stages

**Best exam clue**

  - if the system sounds like “step 1 transforms, then step 2 transforms, then step 3 transforms,” that is **Pipe-and-filter**.

**Main distractor**

  - **Language processing** often uses phases that look pipelined, but the application type is about formal-language translation. The architectural pattern is still pipe-and-filter only if the question emphasizes the transformation chain itself.

## F. Transaction Processing Architecture

**Use it when the scenario says**

  - users make requests against a shared database
  - updates must preserve consistency and integrity
  - orders, bookings, reservations, purchases, banking records
  - transaction manager / commit / integrity / rollback

**Core idea**

  - process user transactions reliably against persistent shared data

**Canonical examples**

  - e-commerce systems
  - banking systems
  - hotel reservations

**Main distractor**

  - many transaction systems are deployed using **client-server**, but the **application architecture** being tested is transaction processing.

## G. Language Processing Architecture

**Use it when the scenario says**

  - compiler
  - interpreter
  - command processor
  - lexical analysis / parsing / semantic analysis / code generation
  - formal language translation

**Core idea**

  - take a formal language as input and translate or interpret it

**Main distractor**

  - the internal implementation may look like **Pipe-and-filter**, but the application category is **Language processing**.

## The Closest Distractor Pairs

### MVC vs Layered

  - **MVC** = model/view/controller around UI + data
  - **Layered** = service levels across the whole system

### Repository vs Client-server

  - **Repository** = central shared data store
  - **Client-server** = remote service interaction over a network

### Pipe-and-filter vs Language processing

  - **Pipe-and-filter** = transformation chain
  - **Language processing** = compiler/interpreter style formal-language system

### Client-server vs Transaction processing

  - **Client-server** = distribution style
  - **Transaction processing** = business/request/database integrity application type

## Architecture and Non-Functional Requirements

From the deck:

  - **Performance**: localize operations; larger components can reduce communication overhead
  - **Security**: layered architecture helps protect critical assets in inner layers
  - **Safety**: localize safety-critical parts
  - **Availability**: use redundancy and fault tolerance
  - **Maintainability**: prefer self-contained fine-grained components

This matters because some multiple-choice questions may ask for the architecture that best supports a non-functional goal.

## Exact Exam Strategy for the A-G Question

When you get the question:

  1. Underline the strongest noun phrase in the scenario.
  2. Decide whether the question is about:
     - UI structure
     - system levels
     - shared data
     - network services
     - staged transformation
     - user transactions
     - language translation
  3. Pick the matching A-G bucket.
  4. Eliminate the nearest distractor out loud in your head.

If you can name **why the second-best answer is wrong**, you usually have the right answer.

## High-Yield Memory Anchors

  - **MVC** -> interface/data split
  - **Layered** -> service levels
  - **Repository** -> shared central store
  - **Client-server** -> network services
  - **Pipe-and-filter** -> sequence of transforms
  - **Transaction processing** -> user requests + DB integrity
  - **Language processing** -> compiler/interpreter

## Best Way to Study This Tonight

  1. Run the **Exam 2 Architecture Recognition Simulation** once.
  2. Run the **Focused Drill** until the A-G mapping is automatic.
  3. Redo every missed question by explaining why the top distractor is wrong.
  4. Memorize the seven one-line anchors above.
`;

const softwareEngineeringArchitectureCheatSheet = `## Software Engineering Exam 2 Architecture Cheat Sheet

Use this right before the exam if the question is the A-G architecture recognition question.

## A-G Map

  - **A** = Model-View-Controller (MVC)
  - **B** = Layered architecture
  - **C** = Repository architecture
  - **D** = Client-server architecture
  - **E** = Pipe-and-filter architecture
  - **F** = Transaction processing architecture
  - **G** = Language processing architecture

## One-Line Triggers

  - **A / MVC** -> UI + input + data are separated
  - **B / Layered** -> service levels, adjacent layers, inner protection
  - **C / Repository** -> central shared data store
  - **D / Client-server** -> clients use networked services
  - **E / Pipe-and-filter** -> chained processing stages
  - **F / Transaction processing** -> user requests + database integrity
  - **G / Language processing** -> compiler/interpreter/formal language translation

## Fast Eliminations

  - UI split? -> **MVC**, not layered
  - Shared central data? -> **Repository**, not client-server
  - Networked services? -> **Client-server**, not repository
  - Staged transforms? -> **Pipe-and-filter**
  - Compiler/interpreter? -> **Language processing**
  - Online orders/reservations/banking? -> **Transaction processing**

## NFR Clues

  - security with inner protected assets -> **Layered**
  - independent tools sharing data -> **Repository**
  - batch transformations -> **Pipe-and-filter**

## What To Say In Your Head

  - “What is the single strongest clue?”
  - “What is the nearest wrong answer?”
  - “Why is my answer more specific?”

If you can answer those three fast, you are ready for the question.
`;

const automataTest2Notes = `## Theory of Automata Test 2 Master Notes

Built directly around:

  - the **standard Test 2 topic outline**
  - the **previous Test 2** you provided
  - **Chapter 2** of the lecture notes
  - **Homework 2 solutions**

> **Actual exam constraints:** closed-book, closed-notes, three questions, and the scope is **Chapter 2 + Assignment 2 only**.

## What Chapter 2 Really Covers

Chapter 2 is the finite-automata block:

  - **2.1 Deterministic finite automata (DFA)**
  - **2.2 Nondeterministic finite automata (NFA)**
  - **2.3 Finite automata and regular expressions**
  - **2.4 Languages that are and are not regular**

That means your prep should center on exactly three families of questions:

  - **DFA construction / transition tables**
  - **NFA or regex-to-automata construction**
  - **Pumping-lemma proofs for non-regularity**

If you can do those three cleanly under time pressure, you are aligned with the announced format.

## What the Previous Test 2 Asked

The prior test you gave me had:

1. Draw an NFA for

   \`((ba) union b)^* union ((bb) union a)^*\`

2. Prove that

   \`{ a^n b^n : n >= 0 }\`

   is not regular.

That is a strong signal. The instructor is comfortable mixing:

  - one **construction** question
  - one **proof of non-regularity** question

The new exam has **three** questions, so the safest assumption is:

  - one DFA-style construction
  - one NFA/regex-style construction
  - one pumping-lemma proof

## HW2 Topics You Need Cold

From Homework 2, the patterns worth memorizing are:

  - regex recognition and construction:
    - \`a(ba)^*\`
    - strings containing substring \`aab\` or \`bba\`
    - \`emptyset^* union a(ba union baa)^*(b union ba)\`
  - DFA construction:
    - every \`a\` must be immediately preceded by one \`b\`
    - contains \`abab\` as a substring
  - NFA / FA construction:
    - \`(ab)^*(ba)^* union aa^*\`
    - \`(ab union aab union aba)^*\`
    - \`((ab)^* union (bc)^*)ab\`
    - \`((ab union aba)^* a)^*\`
  - non-regular proofs:
    - \`{ a^n b a^m b a^{m+n} : m,n >= 1 }\`
    - \`{ ww^R : w in {a,b}^* }\`

These are not random homework exercises. They are almost exactly the kinds of things a Chapter 2 test can ask.

## Solve Pattern 1: DFA Construction

When asked for a DFA:

  - define each state by **what information it remembers**
  - use the **minimum memory needed**
  - include a **dead state** if violations must stay rejected
  - test your machine on:
    - one obvious accepted string
    - one obvious rejected string
    - epsilon if relevant

### Example mindset

For “each \`a\` is immediately preceded by one \`b\`”:

  - one state means “neutral / no active permission”
  - one state means “I just saw \`b\`, so an \`a\` is allowed next”
  - one dead state means “the rule was broken”

If you cannot explain your state meanings in one sentence each, your DFA is not settled yet.

## Solve Pattern 2: NFA / Regex Construction

When asked for an NFA from a regex:

  - identify the **top-level operator first**
  - build **inside-out**
  - use these standard moves:
    - **union** -> epsilon split
    - **concatenation** -> connect accept of first to start of second
    - **Kleene star** -> accept epsilon and loop completed pieces back

### Important shortcut

Do **not** try to force determinism into an NFA question.

If a symbol could either:

  - finish one token, or
  - continue another token,

then branch nondeterministically.

That is exactly why NFAs are easier for these constructions.

### Example

For \`(ab union aab union aba)^*\`:

  - all three tokens start with \`a\`
  - so share that prefix
  - when you read the \`b\` after the first \`a\`, branch:
    - one path says “this was \`ab\`”
    - another says “I am still building \`aba\`”

That is the correct NFA instinct.

## Solve Pattern 3: Pumping Lemma

Your proof script should be almost mechanical:

1. Assume \`L\` is regular.
2. Let \`p\` be the pumping length.
3. Choose a witness string \`w\` in \`L\` with \`|w| >= p\`.
4. Force where \`y\` must lie using \`|xy| <= p\`.
5. Pump with \`i = 0\` or \`i = 2\`.
6. Show the pumped string breaks the defining property.
7. Contradiction. Therefore \`L\` is not regular.

### What students get wrong

  - choosing a witness that does not expose the structure
  - forgetting that **the adversary chooses the split**
  - not explaining why \`y\` must be in a specific region
  - saying “not equal anymore” without naming the violated property

### Classic prior-test proof

For \`{ a^n b^n : n >= 0 }\`:

  - choose \`w = a^p b^p\`
  - since \`|xy| <= p\`, \`y\` lies in the first block of \`a\`s
  - pumping changes only the count of \`a\`s
  - so the counts no longer match

### Harder HW2 proof

For \`{ a^n b a^m b a^{m+n} : m,n >= 1 }\`:

  - choose \`w = a^p b a^p b a^{2p}\`
  - force \`y\` into the first \`a\`-block
  - pumping changes the first block only
  - but the final block still has exponent \`2p\`
  - so it can no longer equal \`m+n\`

## Closed-Book Priority List

If you only memorize a few things, memorize these:

  - how to define clean DFA state meanings
  - union / concatenation / star NFA construction patterns
  - the pumping-lemma quantifier order
  - why \`|xy| <= p\` matters
  - one complete proof of \`{ a^n b^n : n >= 0 }\`
  - one complete proof of the HW2 language \`a^n b a^m b a^{m+n}\`

## Final Exam-Day Tactics

  - Start by classifying the question: **DFA**, **NFA/regex**, or **pumping lemma**.
  - For construction questions, write down state meaning before transitions.
  - For proof questions, write the pumping skeleton immediately so you do not lose quantifier order.
  - If a regex/NFA question looks ugly, split it by its top-level operator first and never skip that step.
  - If stuck, do not improvise a different theorem. Chapter 2 questions usually want the standard tool.
`;

const automataTest2CheatSheet = `## Theory of Automata Test 2 Cheat Sheet

### Scope

  - **Chapter 2 only**
  - **HW2 only**
  - likely **3 questions**
  - closed-book / closed-notes

### Most likely question mix

1. **DFA**
2. **NFA or regex construction**
3. **Pumping lemma**

### DFA checklist

  - state meaning first
  - dead state if needed
  - every state has transitions on every symbol
  - test with one accept + one reject example

### NFA checklist

  - union -> epsilon split
  - concatenation -> connect pieces in sequence
  - star -> start accepts epsilon and loops back
  - branch when one symbol can serve multiple token paths

### Pumping lemma checklist

  - assume regular
  - let \`p\` be pumping length
  - choose witness \`w\`
  - force location of \`y\`
  - pump \`i=0\` or \`i=2\`
  - name the exact property that breaks

### Prior Test 2 questions

  - NFA for \`((ba) union b)^* union ((bb) union a)^*\`
  - prove \`{ a^n b^n : n >= 0 }\` is not regular

### HW2 constructions to review

  - DFA: each \`a\` immediately preceded by \`b\`
  - DFA: contains \`abab\`
  - NFA: \`(ab union aab union aba)^*\`
  - FA: \`((ab)^* union (bc)^*)ab\`
  - pumping: \`a^n b a^m b a^{m+n}\`

### Do not forget

  - \`|xy| <= p\` is how you force where \`y\` lives
  - in an NFA, branching is allowed and often required
  - if your DFA state meanings are vague, the machine is not ready
`;

export const notesByCourse: Record<string, CourseContent> = {
  "software-engineering": {
    "notes": softwareEngineeringArchitectureNotes,
    "cheatSheet": softwareEngineeringArchitectureCheatSheet,
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
    "notes": automataTest2Notes,
    "cheatSheet": automataTest2CheatSheet,
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
