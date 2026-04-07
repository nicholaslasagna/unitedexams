export interface CourseContent {
  notes: string;
  cheatSheet: string;
  resources: { label: string; href: string; type: "video" | "article" | "book" | "tool" }[];
}

const computerArchitectureMidtermNotes = `## Computer Architecture Midterm Master Notes (CS 3375)

Built directly around the **Spring 2025 midterm** you provided.

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

const computerArchitectureMidtermCheatSheet = `## Computer Architecture Midterm Cheat Sheet (CS 3375)

Built from the **Spring 2025 midterm**.

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

const softwareEngineeringArchitectureNotes = `## Software Engineering Exam 2 Master Guide (Chapters 5 and 6)

Built directly from your posted review sheet plus the **Chapter 5 System Modeling** and **Chapter 6 Architectural Design** decks.

> **Exam format:** about 26 Canvas questions, closed-book, closed-notes, no phone/smartwatch/calculator, and you need your charged laptop.

## What Exam 2 Is Actually Testing

Treat this exam as two connected halves:

  - **Chapter 5:** can you recognize the right UML/system model quickly and explain what it shows?
  - **Chapter 6:** can you classify architectures and application types from short scenario descriptions?

If you can do those two jobs fast, you are aligned with the exam.

## What Changed in This Review Pack

This pack is now biased toward the **actual homework and Canvas review style** you posted, not just general chapter summaries. That means you should expect repeated exposure to:

  - exact UML diagram identification wording
  - exact symbol questions
  - exact use case/class/state notation traps
  - exact Chapter 6 true/false and best-answer wording
  - the same pattern/application-type distinctions, but phrased the way your professor has already used

## Chapter 5: System Modeling

### The Four System Perspectives

Chapter 5 organizes models around four perspectives:

  - **External / context perspective**: what surrounds the system
  - **Interaction perspective**: how the system interacts with actors or components
  - **Structural perspective**: how the system is organized statically
  - **Behavioral perspective**: how the system behaves dynamically in response to data or events

### UML Diagram Types and What They Show

  - **Context diagram / context model**: what lies outside the system boundary
  - **Use case diagram**: interactions between a system and external actors
  - **Sequence diagram**: time-ordered interactions/messages between actors and system objects/components
  - **Class diagram**: object classes and associations/relationships between them
  - **Activity diagram**: the activities in a process or data-processing workflow
  - **State machine diagram / state diagram**: how the system reacts to internal and external events

### Which Diagram Belongs to Which Model Type

  - **Context model** -> context diagram
  - **Interaction model** -> use case diagram, sequence diagram
  - **Structural model** -> class diagram
  - **Behavioral model (data-driven)** -> activity diagram
  - **Behavioral model (event-driven)** -> state machine diagram

That mapping is one of the easiest places to lose points if you mix up "interaction" and "behavioral."

## Chapter 5 Symbols You Need to Know

### Use Case Diagram

  - **Actor**: stick-figure role outside the system
  - **Use case**: oval showing one discrete task
  - **Association**: solid line between actor and use case
  - **<<include>>**: dashed arrow pointing to the included use case; happens every time
  - **<<extend>>**: dashed arrow pointing to the base use case; happens only sometimes
  - **Generalization**: inheritance/specialization between parent and child actor/use case

### Sequence Diagram

  - actors/objects listed across the top
  - **Lifeline**: vertical dotted line showing existence over time
  - **Message**: arrow between participants
  - **Return/reply**: dashed line back
  - **Activation box**: shows when an object is active
  - **alt frame**: alternative message paths / condition branches

### Class Diagram

  - classes shown as rectangles
  - attributes/operations belong inside class boxes
  - relationships you need to recognize:
    - **Association**
    - **Generalization**
    - **Aggregation**
    - **Composition**

Do not confuse use case relationships like **include** and **extend** with class-diagram relationships.

### Activity Diagram

  - models process steps / workflow
  - **Solid bar**: fork or join for parallel/concurrent flow
  - **End point**: diagram termination
  - **Swimlanes**: show which person/organization/system is responsible for which activities

### State Machine Diagram

  - **State**: rounded rectangle
  - **Transition**: arc/arrow labeled by event
  - **entry / do / exit** activities may be shown inside a state
  - used to model responses to internal and external events

## Chapter 5 Homework Mirrors You Should Know Cold

These are the fastest points to lose if you hesitate:

  - **System modeling** = developing abstract models of a system to understand functionality and communicate with customers.
  - **Context model** = how external entities interact with an internal software system.
  - In a **context diagram**, the **circle** represents the **process**.
  - **Interaction models** = **use case diagrams** and **sequence diagrams**.
  - **Use cases** represent **functional requirements**.
  - The **use case symbol** is the **ellipse / oval**.
  - Use case relationships to memorize:
    - **Association**
    - **Include**
    - **Extend**
    - **Inheritance / generalization**
  - In a **sequence diagram**, an **alt frame** means **if-else logic**.
  - In a **class diagram**:
    - \`+\` = public
    - \`-\` = private
    - \`#\` = protected
  - **Aggregation** = **hollow diamond**
  - Multiplicity **\`6..*\`** = **six or more**
  - Behavioral stimuli can be triggered by:
    - **events**
    - **data**
  - The UML diagram used to describe system behavior in response to events is the **state diagram / state machine diagram**.

## Chapter 5: High-Yield Distinctions

### Use Case vs Sequence

  - **Use case** = high-level actor/system interaction overview
  - **Sequence** = detailed message order for one scenario

### Activity vs State Machine

  - **Activity** = data-driven process flow
  - **State machine** = event-driven state changes

### Data-Driven vs Event-Driven

  - **Data-driven**: some data arrives and processing begins
  - **Event-driven**: some internal or external event occurs and triggers behavior

## How to Draw the Chapter 5 Diagrams Under Exam Pressure

### Context Diagram

  1. Draw the system boundary first.
  2. Add external actors and neighboring systems.
  3. Do not put internal class/message/state detail in it.

### Use Case Diagram

  1. Identify actors first.
  2. Turn each discrete task into a use case.
  3. Add association/include/extend/generalization only when justified.

### State Machine Diagram

  1. Name the object/system whose states you are modeling.
  2. List meaningful states.
  3. Connect them with event-triggered transitions.
  4. Add entry/do/exit only if it clarifies behavior.

### Class Diagram

  1. Start with core domain nouns.
  2. Turn those into classes.
  3. Add the most important relationships.
  4. Keep it structural; do not drift into runtime sequence behavior.

## Model-Driven Engineering / Model-Driven Architecture

### Core Idea

  - **MDE**: models are the principal outputs, not just programs
  - **MDA**: model-focused design/implementation approach using UML-based models at different abstraction levels

### The Three MDA Model Types

  - **CIM**: Computation-Independent Model
    - domain model / important abstractions
  - **PIM**: Platform-Independent Model
    - system operation without committing to a platform
  - **PSM**: Platform-Specific Model
    - transformed toward a target platform / implementation environment

### Why People Like MDE/MDA

  - higher level of abstraction
  - less focus on programming-language details
  - code generation can make platform adaptation cheaper in principle

### Why People Resist It

  - translator/tool creation and maintenance cost
  - limited tool availability / customization needs
  - full automation is rarely complete in practice
  - extra manual coding reduces cost-effectiveness
  - heavy up-front modeling can clash with agile habits

## Guaranteed Lecture Callouts

These came directly from your lecture-review images and are worth memorizing almost word-for-word.

### Context Model

If the exam asks:

  - **"Sometimes a context diagram is used to represent a system. What characteristics are shown in a context model?"**

the right answer is:

  - **how external entities interact with an internal software system**

That is the external/system-boundary view. It is **not**:

  - internal component interaction
  - system states
  - process/workflow activities
  - user-visible functional behavior

### MDA True / False

If the exam asks:

  - **"In model-driven architecture, the final output it tries to obtain is executable code."**

answer:

  - **True**

Reason:

  - MDA raises abstraction through models, but the overall chain still aims toward implementation / executable code.

### List All Architectural Patterns

If the exam shows the full multiple-choice list from the lecture image, the real Chapter 6 patterns are:

  - **Client-server**
  - **Layered**
  - **Pipes and filters**
  - **Repository**
  - **Model-view-controller**

The distractors from that lecture image were:

  - **Class view**
  - **Logical filter**
  - **Development view**

The slide spelled the last valid option as **Model-view-controllers**, but treat that as the normal **Model-view-controller (MVC)** answer.

### What Determines Architecture Structure

If the exam asks which factors **determine the structure of a system architecture**, select:

  - **Safety**
  - **Availability**
  - **Performance**
  - **Security**
  - **Maintainability**

Reject the process/method distractors:

  - **Use case patterns**
  - **Agile method**

### MDA Statements That Were Correct in Homework

The homework-style statements you should recognize immediately are:

  - **MDA focuses on the design and implementation stages of software development.**
  - **MDA will try to generate executable code by sending a platform-specific model through a translator tool.**

The statement about **CIM / PIM / PSM** is still important even when the homework phrasing does not mention those abbreviations directly:

  - **CIM** = domain abstraction
  - **PIM** = system operation without platform commitment
  - **PSM** = transformed toward a target platform

## Chapter 6: Architectural Design

### Why Architectural Design Matters

Architecture matters because it lets you:

  - communicate the system to stakeholders
  - analyze the system before full implementation
  - reuse proven large-scale organization ideas

### Architecture Diagram Symbols in This Class

  - **Boxes** = components
  - **Nested boxes** = subcomponents
  - **Arrows/lines** = data flow or control flow

Keep this separate from UML symbolism. Chapter 6 uses simple architecture views, not detailed UML semantics.

## The A-G Architecture Map

Your professor already hinted at this style of question before, so memorize the map:

  - **A** = Model-View-Controller (MVC)
  - **B** = Layered architecture
  - **C** = Repository architecture
  - **D** = Client-server architecture
  - **E** = Pipe-and-filter architecture
  - **F** = Transaction processing architecture
  - **G** = Language processing architecture

## Architectural Patterns and Their Meanings

### MVC

Use when the clue is:

  - UI/input/data separation
  - multiple views of the same data
  - interface evolution without rewriting the model

### Layered

Use when the clue is:

  - service levels / adjacent layers
  - inner layers protecting critical assets
  - a hierarchy of responsibilities

### Repository

Use when the clue is:

  - one central shared data store
  - many tools/components reading and writing the same information
  - components stay relatively independent through shared data

### Client-Server

Use when the clue is:

  - clients consuming remote network services
  - browsers/apps talking to servers
  - distributed system roles across a network

### Pipe-and-Filter

Use when the clue is:

  - staged transformation pipeline
  - output of one stage becomes input to the next
  - batch/stream transformations

### Exact Pattern List to Memorize

If the exam asks you to **list all architectural patterns introduced in this chapter**, the correct list is:

  - **Client-server**
  - **Layered**
  - **Pipes and filters**
  - **Repository**
  - **Model-view-controller**

Reject distractors like:

  - **Class view**
  - **Development view**
  - **Logical filter**

## Chapter 6 Homework Mirrors You Should Know Cold

These showed up in your Chapter 6 homework wording almost directly:

  - **Architectural design** matters because it defines the overall structure and organization of a system and is a critical link between requirements and implementation.
  - A **component** in a system architecture is represented by a **box / rectangular block**.
  - Architectural design helps stakeholders by improving **communication**.
  - **False**: an architectural diagram shows the **detailed** relationships between components.
  - **True**: an architectural pattern is a description of a system's organization.
  - **Online shopping** is a **transaction processing** example.
  - Primary reason for using architectural patterns:
    - **to provide a template solution to common software design problems**
  - **False**: it is not possible to combine several architectural patterns in one application.

## Chapter 6 Application Types and Examples

### Data Processing

  - bulk input data processed into outputs/reports/files
  - strong clue: batch jobs, nightly processing, large input files

### Transaction Processing

  - user requests against a shared database with integrity constraints
  - classic examples: reservations, banking, shopping, orders

### Event Processing

  - incoming events trigger system behavior
  - strong clue: sensors/interrupts/monitors/reactive systems

### Language Processing

  - compiler/interpreter/command processor style systems
  - strong clue: formal language input becomes another representation or execution behavior

## Architecture and Non-Functional Requirements

The chapter explicitly emphasizes:

  - **Performance**
  - **Security**
  - **Safety**
  - **Availability**
  - **Maintainability**

If the exam asks which factors **determine the structure of a system architecture**, select:

  - **Safety**
  - **Availability**
  - **Performance**
  - **Security**
  - **Maintainability**

Do **not** select:

  - **Use case patterns**
  - **Agile method**

### The Most Exam-Relevant Mappings

  - **Security** -> layered protection of critical assets in inner layers
  - **Safety** -> localize safety-critical features/components
  - **Availability** -> redundancy and fault tolerance
  - **Maintainability** -> self-contained fine-grained components are easier to change
  - **Performance** -> localize operations / reduce communication overhead

## Closest Distractor Pairs

### Use Case vs Sequence

  - use case = who interacts and what task they perform
  - sequence = which messages happen in what order

### Activity vs State Machine

  - activity = data/process flow
  - state machine = event/state response

### MVC vs Layered

  - MVC = UI/data/control separation
  - layered = service levels across the whole system

### Repository vs Client-Server

  - repository = shared central data
  - client-server = distributed service interaction over a network

### Pipe-and-Filter vs Language Processing

  - pipe-and-filter = transformation pattern
  - language processing = compiler/interpreter application type

### Client-Server vs Transaction Processing

  - client-server = distribution style
  - transaction processing = database-backed business request application type

## Best Way to Study This Exam Tonight

  1. Run the new **Exam 2 Guaranteed Lecture Questions** set until those four direct lecture-image questions are automatic.
  2. Run the **Exam 2 Full Simulation** once straight through because it now mirrors the homework/review wording much more closely.
  3. Drill the **UML + System Modeling Drill** until the Chapter 5 notation questions feel automatic.
  4. Run the **Architecture A-G Drill** after that so pattern/application-type recognition becomes fast instead of fuzzy.
  5. Use the walkthrough sets only after you miss something or cannot explain it cleanly.
  6. Before the exam, recite from memory:
     - the four system perspectives
     - the diagram-type mapping
     - context circle = process
     - use case = functional requirements
     - use case symbol = ellipse
     - include vs extend vs generalization
     - \`+ / - / #\`
     - aggregation = hollow diamond
     - \`6..*\` = six or more
     - CIM / PIM / PSM
     - the A-G architecture map
     - context model = external entities interacting with the system boundary
     - architecture structure drivers = safety, availability, performance, security, maintainability
     - MDA final output = executable code
     - MDA true/false = **True**
     - pattern purpose = template solution to common design problems
     - online shopping = transaction processing
     - architecture drivers = safety, availability, performance, security, maintainability
     - exact architectural pattern list = client-server, layered, pipes and filters, repository, MVC
`;

const softwareEngineeringArchitectureCheatSheet = `## Software Engineering Exam 2 Cheat Sheet (Chapters 5 and 6)

### Exam Shape

  - around **26 Canvas questions**
  - closed-book / closed-notes
  - charged laptop required

### Chapter 5 Fast Map

  - **Context model** -> context diagram
  - **Interaction model** -> use case, sequence
  - **Structural model** -> class diagram
  - **Behavioral model (data-driven)** -> activity diagram
  - **Behavioral model (event-driven)** -> state machine diagram

### UML One-Line Triggers

  - **Use case** -> actors + tasks
  - **Sequence** -> messages in time order
  - **Class** -> classes + relationships
  - **Activity** -> workflow / process steps
  - **State machine** -> states + events

### Relationship Memory Hooks

  - **include** -> always
  - **extend** -> sometimes
  - **generalization** -> inheritance
  - **class relationships** -> association, generalization, aggregation, composition
  - **aggregation symbol** -> hollow diamond
  - **visibility** -> \`+ public\`, \`- private\`, \`# protected\`
  - **multiplicity \`6..*\`** -> six or more

### Behavioral Split

  - **data-driven** -> data arrives -> activity diagram
  - **event-driven** -> event occurs -> state machine diagram
  - **stimuli** -> events and data

### MDE / MDA

  - **MDE** -> models are principal outputs
  - **CIM** -> domain abstraction
  - **PIM** -> no platform commitment
  - **PSM** -> platform-specific transformation
  - drawbacks -> tool/translator cost, incomplete automation, agile tension
  - **MDA T/F** -> executable code is the final target output -> **True**
  - **context model** -> external entities interacting with the internal software system
  - **MDA homework truths** ->
    - focuses on design and implementation stages
    - tries to generate executable code from transformed models

### Chapter 6 A-G Map

  - **A** = MVC
  - **B** = Layered
  - **C** = Repository
  - **D** = Client-server
  - **E** = Pipe-and-filter
  - **F** = Transaction processing
  - **G** = Language processing

### Architecture One-Line Triggers

  - **MVC** -> UI + data + input split
  - **Layered** -> service levels / inner protection
  - **Repository** -> central shared data store
  - **Client-server** -> networked services
  - **Pipe-and-filter** -> staged transforms
  - **Transaction processing** -> requests + DB integrity
  - **Language processing** -> compiler/interpreter

### Application Types

  - **Data processing** -> batch input/output jobs
  - **Transaction processing** -> reservations/orders/banking
  - **Event processing** -> reactive to arriving events
  - **Language processing** -> compiler/interpreter

### NFR Hooks

  - security -> layered inner protection
  - safety -> localize critical features
  - availability -> redundancy / fault tolerance
  - maintainability -> fine-grained self-contained components
  - performance -> reduce communication / localize work
  - architecture structure drivers -> **Safety, Availability, Performance, Security, Maintainability**

### Exact Pattern List

  - **Client-server**
  - **Layered**
  - **Pipes and filters**
  - **Repository**
  - **Model-view-controller**

### Chapter 6 Homework Reminders

  - **component symbol** -> box
  - **stakeholder benefit** -> communication
  - **detailed relationships in architecture diagram?** -> False
  - **architectural pattern = system organization description** -> True
  - **patterns can be combined** -> True, so the "not possible" statement is False
  - **online shopping** -> transaction processing
  - **pattern purpose** -> template solution to common design problems
`;


const automataTest2Notes = `## Theory of Automata Test 2 Master Notes (CS 3383)

Built directly around:

  - the **Spring 2026 Test 2 announcement**
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
