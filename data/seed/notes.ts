import {
  algorithmsCheatSheet,
  algorithmsNotes,
  architectureGradCheatSheet,
  architectureGradNotes,
  databaseCheatSheet,
  databaseNotes,
  osCheatSheet,
  osNotes
} from "@/data/seed/notes-fall-2026";

export interface CourseContent {
  notes: string;
  cheatSheet: string;
  resources: { label: string; href: string; type: "video" | "article" | "book" | "tool" }[];
}

const computerArchitectureMidtermNotes = `## Computer Architecture Midterm Master Notes

Built directly around the standard Computer Architecture midterm topic outline.

> **Topics this midterm typically tests:** C-to-RISC-V translation, procedure calls + stack frames, machine-code encode/decode, 5-stage pipeline hazards/timing, and 2-bit branch prediction.

## Midterm Topic Map

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

Built from the standard Computer Architecture midterm topic outline.

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

const softwareEngineeringArchitectureNotes = `## Software Engineering Final Exam Master Guide (Chapters 7, 8, and 9)

Built directly around:

  - the standard Software Engineering final-review topic list
  - the **Chapter 8 Testing** topic outline
  - the **Chapter 9 Evolution** topic outline
  - the highest-yield **core final-review items**
  - the prior Chapter 5/6/7 homework-style questions already worked correctly

> **Final format:** in-person, laptop required, scratch paper provided, and the test covers **Chapters 7, 8, 9, plus the Impacts of Computing Solutions lecture**.

## What the Final Is Really Testing

Treat the final as four blocks:

  - **Chapter 7:** design/implementation continuation, reuse, configuration management, host-target development, open source
  - **Chapter 8:** verification and validation, testing strategies, interface/component/system testing, release/user testing, TDD
  - **Chapter 9:** software evolution, legacy systems, maintenance, refactoring, reengineering
  - **Computing impacts:** positive and negative effects of computing solutions, especially AI, displacement, unemployment, and cyber crimes

If you can classify questions into one of those four blocks immediately, the exam becomes much easier to control.

## Core Final Review Items

These are the highest-yield Software Engineering final-review items. Lock the wording and the answer pattern for each.

### 1. First design-stage / external environment question

If the exam asks which diagram helps you understand the relationship between the software and its external environment first, the answer is:

  - **Context diagram**

### 2. Object-class identification question

If the exam asks which approaches help identify object classes for a class diagram, select:

  - **grammatical analysis where nouns are objects/attributes and verbs are operations**
  - **basing identification on tangible things in the application domain**
  - **scenario-based analysis where you identify objects in each scenario**

Do **not** select the mathematical class-density distractor or the flowchart-until-pattern distractor.

### 3. Reuse question

If the exam asks what can be reused during software development, the correct selections are:

  - **Components**
  - **Classes and objects**
  - **Application systems**
  - **Architectural patterns**

### 4. Observer-pattern relationship question

If the exam asks how observers relate to each other in the Observer pattern, the correct idea is:

  - **Observers do not know about the existence of other observers; they only know about changes in the observable (subject).**

### 5. Costs of reuse question

If the exam asks which costs are explicitly listed as costs of reuse, select:

  - **time spent looking for reusable software**
  - **cost of buying reusable software**
  - **cost of adapting/configuring reusable components**
  - **cost of integrating reusable elements with new code**

Do **not** select the reliability-decrease distractor. Reuse normally increases reliability when the reused element is already mature/tested.

### 6. Testing-goals question

If the exam asks the two things you are trying to do when you test software, select:

  - **discover situations in which the behavior of the software is incorrect**
  - **demonstrate that the software meets its requirements**

### 7. Regression-testing question

If the exam asks which testing checks that changes have not broken previously working code, the answer is:

  - **Regression testing**

### 8. Urgent-change question

If the exam asks what may cause urgent software changes, select:

  - **changes to the system's environment**
  - **new government legislation**
  - **detection of critical faults**

### 9. Types-of-maintenance question

The three maintenance types you must know are:

  - **Fault repairs**
  - **Environmental adaptation**
  - **Functionality addition and modification**

## Chapter 7: Design, Reuse, Configuration, Deployment, Open Source

### Interface design

Interface design is primarily concerned with:

  - **specifying the detail of the interface to a component or group of components**

### Design models

The two design-model categories emphasized in class are:

  - **Dynamic models**
  - **Structural models**

### State diagrams

State diagrams show:

  - **how objects change their state in response to events**

### System context and boundaries

The earliest high-value system model is the **context diagram** because it tells you:

  - what is outside the system boundary
  - what interacts with the system
  - how the system sits in its environment

### Observer pattern

Remember both the example and the concept:

  - a **YouTube subscriber system** is a clean observer-pattern example
  - observers are **decoupled from one another** and react to subject changes independently

### Software reuse

Reuse can happen at several abstraction levels:

  - **Abstraction-level reuse**
  - **Object/class-level reuse**
  - **Component-level reuse**
  - **System/application-level reuse**

Benefits of reuse include speed and reliability. Costs include:

  - search time
  - acquisition/purchase cost
  - adaptation/configuration cost
  - integration cost

### Configuration management

You need the three activities straight:

  - **Version management** -> track versions of components/systems
  - **System integration** -> build a working system from components
  - **Problem tracking** -> let users report bugs and let developers coordinate who is fixing what

### Host-target development

The distinction:

  - **Development platform / host** = where the software is developed
  - **Execution platform / target** = where the software actually runs for the user

For the gaming example, target systems included:

  - **user's gaming console**
  - **user's laptop**

### Open source development

Memorize these:

  - **Anyone can contribute** to an open-source system
  - **GPL** is the right pick when a question asks which license to use if you want to share everything and keep no secrets

## Chapter 8: Software Testing

### The two testing goals

Testing is trying to do two things:

  - **Validation testing**: show the software meets its requirements
  - **Defect testing**: expose incorrect, undesirable, or non-conforming behavior

### Verification vs validation

  - **Verification** = *Are we building the product right?*
  - **Validation** = *Are we building the right product?*

### Inspections vs testing

  - **Software inspections** = static verification; analyze static representations
  - **Software testing** = dynamic verification; execute the system and observe behavior

### Equivalence partitioning

Equivalence partitioning means:

  - split inputs into groups expected to behave the same way
  - choose test cases from each group rather than every single input value

### Interface testing

Know the interface types:

  - **Parameter interfaces**
  - **Shared memory interfaces**
  - **Procedural interfaces**
  - **Message passing interfaces**

Shared-memory clue:

  - a block of memory is shared between components

### Regression testing

Regression testing is:

  - **testing the system to check that changes have not broken previously working code**

### Release testing

Release testing is:

  - testing a release intended for use outside the development team
  - mainly trying to **convince the supplier that the system is good enough for use**

### Stress testing and fail-soft behavior

Stress testing deliberately overloads the system to:

  - test failure behavior
  - reveal defects that only appear under heavy load
  - check that the system **fails soft** instead of collapsing

### User testing

Know the three kinds:

  - **Alpha testing** -> users work with developers at the developer's site
  - **Beta testing** -> release is given to users so they can experiment and report problems
  - **Acceptance testing** -> customers decide whether the system is good enough to accept and deploy

### TDD benefits

The major TDD benefits emphasized in class were:

  - **Code coverage**
  - **Regression testing**
  - **Simplified debugging**
  - **System documentation**

## Chapter 9: Software Evolution and Maintenance

### Why software evolution matters

Software change is inevitable because:

  - new requirements emerge
  - the business environment changes
  - errors must be repaired
  - new hardware/software environments appear
  - performance or reliability may need improvement

### Evolution, servicing, phase-out

  - **Evolution** -> new requirements continue to be proposed and implemented
  - **Servicing** -> software is still useful, but only bug fixes / environment-keeping changes are made; **no new functionality**
  - **Phase-out** -> system may still be used, but no further changes are made

### Urgent change requests

Urgent changes may be needed when:

  - a serious system fault must be repaired
  - the environment changes unexpectedly (for example, OS upgrade)
  - business conditions require rapid response
  - new legislation affects the system

### Legacy systems

Legacy systems are older systems that may depend on obsolete:

  - hardware
  - support software
  - languages/technologies
  - business processes and embedded rules

Legacy-system replacement is risky because business rules, data, and dependencies are often embedded in the existing system.

### System assessment

Know the three assessment ideas:

  - **Business value assessment** -> how much time/effort the system saves or how important it is to business outputs
  - **Environment assessment** -> hardware, support software, maintenance cost, operational environment factors
  - **Application assessment** -> quality and maintainability of the application itself

### Three maintenance types

  1. **Fault repairs** -> fix bugs/vulnerabilities/deficiencies
  2. **Environmental adaptation** -> adapt the software to a different operating environment
  3. **Functionality addition and modification** -> satisfy new requirements

### Refactoring vs reengineering

  - **Refactoring** = continuous structural improvement that preserves functionality; preventative maintenance
  - **Reengineering** = larger restructuring/re-documentation/translation of a legacy system to improve maintainability without changing functionality

### Reengineering activities

These were explicitly listed:

  - **Source code translation**
  - **Reverse engineering**
  - **Program modularization**

### Advantages of reengineering

Compared with replacement, reengineering has two highlighted advantages:

  - **Reduced risk**
  - **Reduced cost**

### Bad smells

Examples of bad smells you should know:

  - **Duplicate code**
  - **Long methods**
  - **Switch statements**
  - **Data clumps**

## Impacts of Computing Solutions

The final also includes broader social impact topics.

### Negative impacts explicitly named in the review guide

  - **Displacement**
  - **Unemployment**
  - **Cyber crimes**

### AI impact

The safe exam framing is:

  - AI can improve speed, automation, and access to services
  - AI can also create workforce displacement, job loss pressure, and new forms of abuse/crime

## Best Way to Use the New Final Study Content in United Exams

  1. Run **Final Core Review Drill** until those high-frequency review items are automatic.
  2. Run the **Software Engineering Final Mock Exam** straight through once with exam settings.
  3. Use **Final Testing + Evolution Drill** to isolate weak spots in Chapters 8 and 9.
  4. Before the real exam, recite from memory:
     - context diagram
     - reuse items
     - reuse costs
     - observer relationship
     - two testing goals
     - verification vs validation
     - regression testing
     - release testing goal
     - urgent change causes
     - three maintenance types
     - refactoring vs reengineering
     - GPL
     - target system examples
     - displacement / unemployment / cyber crimes
`;

const softwareEngineeringArchitectureCheatSheet = `## Software Engineering Final Exam Cheat Sheet

### Guaranteed answers

  - first system/environment diagram -> **Context diagram**
  - object-class identification -> **grammatical nouns/verbs, tangible domain things, scenario-based analysis**
  - reuse items -> **components, classes/objects, application systems, architectural patterns**
  - observer relationship -> **observers do not know about each other; they only react to subject changes**
  - reuse costs -> **search, buy, adapt/configure, integrate**
  - testing goals -> **meet requirements** and **find incorrect behavior**
  - regression testing -> **checks that changes have not broken previously working code**
  - urgent changes -> **environment changes, legislation, critical faults**
  - maintenance types -> **fault repairs, environmental adaptation, functionality addition/modification**

### Chapter 7 fast map

  - interface design -> **detail of interface to component(s)**
  - design-model types -> **dynamic** and **structural**
  - state diagram -> **objects change state in response to events**
  - target systems -> **user's laptop / user's console**
  - problem tracking -> **bug reporting + fix coordination**
  - GPL -> **share everything / no secrets**
  - open source -> **anyone can contribute**

### Chapter 8 fast map

  - verification -> **building the product right**
  - validation -> **building the right product**
  - inspections -> **static verification**
  - testing -> **dynamic verification**
  - equivalence partitioning -> **group same-behavior inputs**
  - shared memory interface -> **shared block of memory**
  - release testing -> **convince supplier system is good enough for use**
  - stress testing -> **overload + fail-soft + reveal high-load defects**
  - acceptance testing -> **customer decides if deployable**
  - beta testing -> **users experiment and report problems**

### Chapter 9 fast map

  - servicing -> **keep operational, no new functionality**
  - environmental adaptation -> **adapt to new computer / OS / environment**
  - reengineering advantages -> **reduced risk, reduced cost**
  - reengineering activities -> **source code translation, reverse engineering, modularization**
  - refactoring -> **continuous structure improvement without changing functionality**
  - legacy replacement risk -> **embedded business rules, data, dependencies**
  - bad smells -> **duplicate code, long methods, switch statements, data clumps**

### Impacts of computing solutions

  - negative impacts -> **displacement, unemployment, cyber crimes**
`;


const automataTest2Notes = `## Theory of Automata Test 2 Master Notes

Built directly around:

  - the standard **Test 2 topic outline**
  - prior Test 2-style practice items
  - **Chapter 2** of the course notes
  - the **Homework 2 worked solutions**

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

## What a Typical Test 2 Asks

A prior Test 2-style practice item set was:

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
    /*
     * CSE-240 and CS-5375 were merged into one class, so the notes are the
     * union: the original RISC-V, encoding and 5-stage pipeline material
     * followed by the graduate performance, ILP and multicore half. Neither
     * replaces the other.
     */
    "notes": `${computerArchitectureMidtermNotes}\n\n---\n\n${architectureGradNotes}`,
    "cheatSheet": `${computerArchitectureMidtermCheatSheet}\n\n---\n\n${architectureGradCheatSheet}`,
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
  },

  // ── Fall 2026 ──────────────────────────────────────────────────
  "analysis-of-algorithms": {
    "notes": algorithmsNotes,
    "cheatSheet": algorithmsCheatSheet,
    "resources": [
      {
        "label": "Introduction to Algorithms (CLRS)",
        "href": "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
        "type": "book"
      },
      {
        "label": "MIT 6.006 Introduction to Algorithms",
        "href": "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
        "type": "video"
      },
      {
        "label": "Big-O Cheat Sheet",
        "href": "https://www.bigocheatsheet.com/",
        "type": "tool"
      }
    ]
  },
  "database-systems": {
    "notes": databaseNotes,
    "cheatSheet": databaseCheatSheet,
    "resources": [
      {
        "label": "Database System Concepts (Silberschatz)",
        "href": "https://www.db-book.com/",
        "type": "book"
      },
      {
        "label": "CMU 15-445 Database Systems",
        "href": "https://15445.courses.cs.cmu.edu/",
        "type": "video"
      },
      {
        "label": "PostgreSQL Documentation",
        "href": "https://www.postgresql.org/docs/current/",
        "type": "article"
      },
      {
        "label": "DB Fiddle",
        "href": "https://www.db-fiddle.com/",
        "type": "tool"
      }
    ]
  },
  "operating-systems": {
    "notes": osNotes,
    "cheatSheet": osCheatSheet,
    "resources": [
      {
        "label": "Operating Systems: Three Easy Pieces",
        "href": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
        "type": "book"
      },
      {
        "label": "MIT 6.1810 Operating System Engineering",
        "href": "https://pdos.csail.mit.edu/6.828/",
        "type": "video"
      },
      {
        "label": "The Little Book of Semaphores",
        "href": "https://greenteapress.com/wp/semaphores/",
        "type": "book"
      }
    ]
  }
};
