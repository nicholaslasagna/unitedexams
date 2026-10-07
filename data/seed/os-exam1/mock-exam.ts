import type { Question, QuizSet } from "@/lib/types";

/**
 * The Exam 1 mock, in the format the exam actually uses: ten multiple-choice
 * questions and three long answers, weighted half and half.
 *
 * Built from the topic list for the midterm, the chapter 1–6 slides and the
 * three assignments, leaning where the course has said the exam leans:
 * multithreading models, Amdahl's Law, the process state transition graph
 * and semaphore pseudocode. Between them the thirteen questions touch all
 * twelve topics on the list, one tag each (see TOPIC_LIST below).
 */

const md = (...lines: string[]) => lines.join("\n");

/** Ten multiple-choice questions share half the paper. */
const MC_POINTS = 5;
/** Three long answers share the other half. */
const LONG_POINTS = 50 / 3;

/** The midterm topic list, numbered as given, keyed by the tag each question carries. */
export const TOPIC_LIST: Record<string, number> = {
  "os-roles": 1,
  "os-structures": 2,
  "operation-modes": 3,
  "system-calls": 4,
  "process-concept": 5,
  "context-switching": 6,
  "process-creation": 7,
  "multithreading-models": 8,
  "amdahls-law": 9,
  "cpu-scheduling": 10,
  "petersons-solution": 11,
  semaphores: 12
};

// ── Part A: multiple choice ─────────────────────────────────────────────────

const partA: Question[] = [
  {
    id: "os-mock-a1",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "Which of the following is **not** a goal of an operating system?",
    options: [
      "Provide an environment in which users can execute programs conveniently and efficiently",
      "Allocate the computer's resources to tasks as fairly and efficiently as possible",
      "Supervise the execution of user programs to prevent errors and improper use of the computer",
      "Solve the user's computing problems directly, the way a word processor or web browser does"
    ],
    correct: [3],
    explanation: md(
      "The first three are operating-system goals from Chapter 1. Solving the user's computing problems is the job of **application programs** — the layer *above* the operating system.",
      "",
      "The OS sits between applications and hardware: it controls and coordinates the hardware's use among applications and users, rather than doing the user's task itself."
    ),
    walkthroughSteps: [
      "A computer system has three layers: hardware (CPU, memory, I/O), the operating system, and application programs.",
      "The OS goals are about the environment, resource allocation, supervision and I/O management — all in service of running programs.",
      "Word processors and browsers are applications. They solve the user's problem; the OS makes it possible for them to run."
    ],
    references: ["Ch. 1 Introduction — Computer System Structure; Operating System Goals", "Assignment 1, Part A Q1–Q2"],
    tags: ["os-roles"]
  },
  {
    id: "os-mock-a2",
    type: "single",
    difficulty: "med",
    points: MC_POINTS,
    prompt:
      "An operating system keeps only a few essential services in the kernel and moves the rest into separate user-level programs that communicate by message passing. Which structure is this, and what is its main disadvantage?",
    options: [
      "Layered — it is difficult to define what each layer should contain",
      "Microkernel — the performance overhead of communication between user space and kernel space",
      "Monolithic — too many functions are packed into one level",
      "Loadable kernel modules — a module cannot be added while the system is running"
    ],
    correct: [1],
    explanation: md(
      "This is a **microkernel**. Its benefits are that it is easier to extend and more reliable, because less code runs in kernel mode. Its disadvantage is the overhead of every user-space ↔ kernel-space message. Mach is the example; the macOS kernel is partly based on it.",
      "",
      "- **Monolithic**: fast communication with the kernel, but too many functions in one layer.",
      "- **Layered**: easy to debug layer by layer, but low efficiency — and defining the layers is the hard part, which is why option A is a true statement about the *wrong* structure.",
      "- **Modules**: the whole point is that services load dynamically, so option D has it backwards."
    ),
    walkthroughSteps: [
      "'Few essential services in the kernel, the rest as user-level programs' is the definition of a microkernel.",
      "Those user-level services talk to each other by message passing, through the kernel.",
      "Every message crosses between user space and kernel space — that crossing is the performance cost."
    ],
    references: ["Ch. 2 OS Structure — Microkernels; Monolithic; Layered; Modules", "Assignment 1, Part B Q5"],
    tags: ["os-structures"]
  },
  {
    id: "os-mock-a3",
    type: "single",
    difficulty: "med",
    points: MC_POINTS,
    prompt: "Which of the following instructions should be allowed to execute **only in kernel mode**?",
    options: [
      "Read the clock",
      "Turn off interrupts",
      "Issue a trap instruction to request a system call",
      "Add two values held in registers"
    ],
    correct: [1],
    explanation: md(
      "**Turning off interrupts** must be privileged. The OS sets a timer before handing the CPU to a user program; if that program could disable interrupts, the timer interrupt would never arrive and the OS could never regain control.",
      "",
      "- Reading the clock changes nothing.",
      "- A **trap** is *how* a user program enters the kernel, so it has to be executable in user mode — the switch to kernel mode is the result of the trap, not a precondition for it.",
      "- Register arithmetic is ordinary user-mode computation."
    ),
    walkthroughSteps: [
      "Ask of each instruction: could a user program use it to escape the OS's control or interfere with other programs?",
      "Disabling interrupts would defeat the timer, so a program could keep the CPU forever.",
      "The trap is the doorway into kernel mode — if it required kernel mode, no system call could ever be made."
    ],
    references: ["Ch. 1 Introduction — Dual-mode Operation; Timer; User Mode or Kernel Mode"],
    tags: ["operation-modes"]
  },
  {
    id: "os-mock-a4",
    type: "single",
    difficulty: "med",
    points: MC_POINTS,
    prompt:
      "A program needs to pass more parameters to a system call than will fit in the CPU's registers. Which approach does Linux use?",
    options: [
      "The system call fails, because parameters can only be passed in registers",
      "The parameters are stored in a block in memory, and the address of the block is passed in a register",
      "The parameters are copied into cache memory, where the kernel reads them",
      "The call is split into several system calls, each passing one parameter"
    ],
    correct: [1],
    explanation: md(
      "There are three general methods for passing parameters to the OS:",
      "",
      "1. **Registers** — simplest, but limited by how many registers there are.",
      "2. **A block (table) in memory**, with the block's address passed in a register — the approach Linux takes.",
      "3. **The stack** — the program pushes the parameters and the OS pops them.",
      "",
      "Block and stack do not limit the number or length of parameters. Cache memory is not a parameter-passing technique at all."
    ),
    walkthroughSteps: [
      "Registers run out, so a second mechanism is needed for the overflow.",
      "Put the parameters somewhere in memory and pass only their location — one register, any number of parameters.",
      "That is the block method, and it is the one the slides name as Linux's."
    ],
    references: ["Ch. 2 OS Structure — System Call Parameter Passing", "Assignment 1, Part B Q4"],
    tags: ["system-calls"]
  },
  {
    id: "os-mock-a5",
    type: "single",
    difficulty: "med",
    points: MC_POINTS,
    prompt: md(
      "Consider this C program while it is running:",
      "",
      "```c",
      "int total = 0;                               // declared outside every function",
      "",
      "int main(void) {",
      "    int count = 5;",
      "    int *buf = malloc(100 * sizeof(int));",
      "    /* ... */",
      "}",
      "```",
      "",
      "In the process's memory layout, where do `total`, `count`, and the 100 integers that `malloc` allocates live?"
    ),
    options: [
      "total: data section · count: stack · the malloc'd integers: heap",
      "total: stack · count: data section · the malloc'd integers: heap",
      "total: data section · count: heap · the malloc'd integers: stack",
      "total: text section · count: stack · the malloc'd integers: data section"
    ],
    correct: [0],
    explanation: md(
      "A process has four parts:",
      "",
      "- **Text** — the compiled program code.",
      "- **Data** — global variables, so `total`.",
      "- **Heap** — memory allocated dynamically at run time with `malloc`/`new` and released with `free`/`delete`, so the 100 integers.",
      "- **Stack** — temporary data: function parameters, return addresses and local variables, so `count`.",
      "",
      "One trap: `buf` itself is a local variable, so the *pointer* is on the stack. Only what it points to is on the heap."
    ),
    walkthroughSteps: [
      "`total` is global, so it belongs to the data section for the life of the process.",
      "`count` is local to `main`, so it lives in `main`'s stack frame.",
      "`malloc` allocates at run time from the heap; the pointer `buf` holding its address is still a stack local."
    ],
    references: ["Ch. 3 Process — Process Concept; Memory Layout of a C Program"],
    tags: ["process-concept"]
  },
  {
    id: "os-mock-a6",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "The CPU switches from process P0 to process P1. Which sequence describes the context switch?",
    options: [
      "Save P0's state into P0's PCB, then load P1's saved state from P1's PCB",
      "Save P0's state into P1's PCB, then start P1 from its first instruction",
      "Copy P0's entire address space to disk, then load P1's address space from disk",
      "Terminate P0, then create P1 with fork()"
    ],
    correct: [0],
    explanation: md(
      "A process's context is represented in its **process control block** — program counter, CPU registers, process state, scheduling and memory-management information.",
      "",
      "On a switch the OS saves the outgoing process's state into *its own* PCB and loads the incoming process's saved state from *its* PCB, so P1 resumes exactly where it left off — not from its first instruction. Nothing is terminated and no address space is copied to disk. The system does no useful work while switching, which is why context-switch time is overhead."
    ),
    walkthroughSteps: [
      "Each process owns one PCB, and its saved CPU state goes back into that same PCB.",
      "P1 has run before, so its PCB already holds the point it should resume from.",
      "Save P0 into PCB0, then load P1 from PCB1."
    ],
    references: ["Ch. 3 Process — Process Control Block; CPU Switch From Process to Process; Context Switch"],
    tags: ["context-switching"]
  },
  {
    id: "os-mock-a7",
    type: "single",
    difficulty: "hard",
    points: MC_POINTS,
    prompt: md(
      "Including the original process, how many processes are there in total once this program has run? Assume every `fork()` succeeds.",
      "",
      "```c",
      "int main(void) {",
      "    for (int i = 0; i < 2; i++)",
      "        fork();",
      "",
      "    if (fork() == 0)",
      "        fork();",
      "",
      "    return 0;",
      "}",
      "```"
    ),
    options: ["6", "8", "12", "16"],
    correct: [2],
    explanation: md(
      "**12.** Count stage by stage, remembering that a child continues from the point of the `fork()` that created it:",
      "",
      "| After | Processes |",
      "|---|---|",
      "| start | 1 |",
      "| loop, i = 0 | 2 |",
      "| loop, i = 1 | 4 |",
      "| `fork()` in the `if` | 8 |",
      "| inner `fork()` | 12 |",
      "",
      "`fork()` returns `0` in the child and the child's PID (> 0) in the parent. So of the 8 processes after the `if`'s `fork()`, only the 4 new children see `0` and take the inner `fork()` — adding 4, not 8. Answering 16 means treating every process as if it took the inner branch."
    ),
    hintSteps: [
      "Each `fork()` that every process executes doubles the count.",
      "The inner `fork()` is only reached where the condition's `fork()` returned 0. Which processes are those?"
    ],
    walkthroughSteps: [
      "Two loop iterations, each executed by every process: 1 → 2 → 4.",
      "All 4 execute the `fork()` in the condition: 4 → 8.",
      "That `fork()` returned 0 only in the 4 newly created children, so only they enter the body.",
      "Those 4 each fork once more: 8 + 4 = 12."
    ],
    references: ["Ch. 3 Process — Process Creation; C Program Forking Separate Process", "Assignment 2, Part A Q4 and Q12"],
    tags: ["process-creation"]
  },
  {
    id: "os-mock-a8",
    type: "single",
    difficulty: "med",
    points: MC_POINTS,
    prompt:
      "Which multithreading model lets the operating system create a sufficient number of kernel threads — so a process's threads can run in parallel on a multicore system — **without** requiring a separate kernel thread for every user thread?",
    options: ["Many-to-one", "One-to-one", "Many-to-many", "One-to-many"],
    correct: [2],
    explanation: md(
      "**Many-to-many** multiplexes many user-level threads onto a smaller or equal number of kernel threads, and lets the OS create as many kernel threads as it needs. Use case: balanced workloads.",
      "",
      "- **Many-to-one** maps all of a process's user threads to one kernel thread. They cannot run in parallel on a multicore system, because only one may be in the kernel at a time. Few systems use it; it suits lightweight tasks.",
      "- **One-to-one** maps each user thread to its own kernel thread, so threads do run in parallel — but creating a user thread means creating a kernel thread, and a large number of kernel threads burdens the system. Use case: high-performance applications such as web servers and databases.",
      "- **One-to-many** is not one of the multithreading models in the Chapter 4 slides. It appears in the course only as a wrong option."
    ),
    walkthroughSteps: [
      "Parallel on multicore rules out many-to-one — a single kernel thread runs on a single core.",
      "'Without a kernel thread for every user thread' rules out one-to-one.",
      "What is left multiplexes many user threads onto however many kernel threads the OS decides to create: many-to-many."
    ],
    references: ["Ch. 4 Thread — Multithreading Models: Many-to-One, One-to-One, Many-to-Many", "Assignment 2, Part A Q9"],
    tags: ["multithreading-models"]
  },
  {
    id: "os-mock-a9",
    type: "single",
    difficulty: "hard",
    points: MC_POINTS,
    prompt: md(
      "Four processes arrive at time 0 in the order P1, P2, P3, P4, with these CPU burst times:",
      "",
      "| Process | Burst (ms) |",
      "|---|---|",
      "| P1 | 5 |",
      "| P2 | 3 |",
      "| P3 | 1 |",
      "| P4 | 4 |",
      "",
      "Using **Round Robin with a time quantum of 2 ms**, what is the average waiting time?"
    ),
    options: ["3.25 ms", "5.50 ms", "6.75 ms", "8.00 ms"],
    correct: [2],
    explanation: md(
      "**6.75 ms.** The Gantt chart:",
      "",
      "```",
      "| P1 | P2 | P3 | P4 | P1 | P2 | P4 | P1 |",
      "0    2    4    5    7    9    10   12   13",
      "```",
      "",
      "Every process arrives at 0, so waiting time = completion time − burst time:",
      "",
      "| Process | Completes | Burst | Waits |",
      "|---|---|---|---|",
      "| P1 | 13 | 5 | 8 |",
      "| P2 | 10 | 3 | 7 |",
      "| P3 | 5 | 1 | 4 |",
      "| P4 | 12 | 4 | 8 |",
      "",
      "(8 + 7 + 4 + 8) / 4 = 27 / 4 = **6.75 ms**.",
      "",
      "The distractors are the other algorithms on the same processes: 3.25 ms is SJF and 5.50 ms is FCFS."
    ),
    hintSteps: [
      "Run each process for at most 2 ms, then send it to the back of the ready queue if it still has work left.",
      "With every arrival at 0, waiting time is completion time minus burst time."
    ],
    walkthroughSteps: [
      "First pass: P1 0–2 (3 left), P2 2–4 (1 left), P3 4–5 (done), P4 5–7 (2 left).",
      "Second pass: P1 7–9 (1 left), P2 9–10 (done), P4 10–12 (done).",
      "Last: P1 12–13 (done).",
      "Waiting times 8, 7, 4 and 8 sum to 27; 27 / 4 = 6.75 ms."
    ],
    references: ["Ch. 5 CPU Scheduling — Round Robin; Example of RR with Time Quantum = 4", "Assignment 3, Part B Q11"],
    tags: ["cpu-scheduling"]
  },
  {
    id: "os-mock-a10",
    type: "single",
    difficulty: "hard",
    points: MC_POINTS,
    prompt: md(
      "In Peterson's solution, process Pi runs:",
      "",
      "```c",
      "flag[i] = true;",
      "turn = j;",
      "while (flag[j] && turn == j)",
      "    ;   /* busy wait */",
      "/* critical section */",
      "flag[i] = false;",
      "```",
      "",
      "P0 and P1 both want their critical sections. P0 executes `flag[0] = true; turn = 1;` and then P1 executes `flag[1] = true; turn = 0;` — all before either process reaches its `while` loop. Which process enters its critical section first?"
    ),
    options: [
      "P0 — the last write left turn == 0, so P0's condition flag[1] && turn == 1 is false",
      "P1 — P1 wrote turn last, so P1 has priority",
      "Both enter at once, because both flags are true",
      "Neither — each spins forever waiting for the other's flag to become false"
    ],
    correct: [0],
    explanation: md(
      "Each process sets `turn` to the **other** process — it offers to go second. So whichever process writes `turn` last is the one that ends up waiting.",
      "",
      "P1 wrote last, leaving `turn == 0`:",
      "",
      "- P0 checks `flag[1] && turn == 1` → `true && false` → false, so **P0 enters**.",
      "- P1 checks `flag[0] && turn == 0` → `true && true` → true, so P1 busy-waits.",
      "",
      "When P0 leaves, it sets `flag[0] = false`, P1's condition becomes false and P1 enters. That is mutual exclusion, progress and bounded waiting.",
      "",
      "Caveat from the slides: on modern architectures the processor or compiler may reorder these independent writes, so Peterson's solution needs a memory barrier to be guaranteed correct."
    ),
    walkthroughSteps: [
      "Both flags end up true, so the flags alone cannot decide — `turn` does.",
      "The final value of `turn` is 0, because P1's write came last.",
      "P0 waits only while turn == 1, which it is not, so P0 enters. P1 waits while turn == 0, which it is."
    ],
    references: ["Ch. 6 Synchronization — Peterson's Solution; Algorithm for Process Pi and Pj; Memory Barrier", "Assignment 3, Part B Q12"],
    tags: ["petersons-solution"]
  }
];

// ── Part B: long answers ────────────────────────────────────────────────────

const partB: Question[] = [
  {
    id: "os-mock-b1",
    type: "free",
    difficulty: "med",
    homeworkFormat: "multi-step",
    points: LONG_POINTS,
    prompt: md(
      "**Draw the process state transition graph.** Label every state and every transition, and for each transition give the event that causes it.",
      "",
      "*On paper you would draw this. Here, write one line per arrow in the form* `from → to: cause`."
    ),
    sampleAnswer: md(
      "![Process state transition graph: new, ready, running, waiting and terminated, with six labelled transitions](/images/os/process-state-graph.svg)",
      "",
      "| From | To | Caused by |",
      "|---|---|---|",
      "| new | ready | **admitted** — the OS has finished creating the process |",
      "| ready | running | **scheduler dispatch** — the scheduler assigns it a CPU |",
      "| running | ready | **interrupt** — e.g. the timer fires and the process is preempted |",
      "| running | waiting | **I/O or event wait** |",
      "| waiting | ready | **I/O or event completion** |",
      "| running | terminated | **exit** — the process finishes execution |",
      "",
      "The two arrows people add that are **not** there:",
      "",
      "- **waiting → running.** When the I/O completes the process goes back to *ready* and waits to be dispatched again; it does not take the CPU straight back.",
      "- **ready → waiting.** Only a *running* process can request I/O or wait on an event."
    ),
    explanation:
      "Five states and six transitions. Every arrow out of running is a reason the process stops running, and the only way back onto the CPU is through ready.",
    rubric: [
      { criterion: "All five states are present: **new, ready, running, waiting, terminated**", marks: 2 },
      { criterion: "new → ready, labelled **admitted**", marks: 1 },
      { criterion: "ready → running, labelled **scheduler dispatch**", marks: 1 },
      { criterion: "running → ready, labelled **interrupt**", marks: 1 },
      { criterion: "running → waiting, labelled **I/O or event wait**", marks: 1 },
      { criterion: "waiting → ready, labelled **I/O or event completion**", marks: 1 },
      { criterion: "running → terminated, labelled **exit**", marks: 1 },
      { criterion: "No incorrect arrows — in particular no **waiting → running** and no **ready → waiting**", marks: 2 }
    ],
    hintSteps: [
      "Start with the definitions: new is being created, ready is waiting for a processor, running is executing, waiting is waiting for an event, terminated has finished.",
      "Running has three ways out. What are the three reasons a process stops executing?",
      "After an I/O completes, can the process go straight back onto the CPU?"
    ],
    walkthroughSteps: [
      "A created process is admitted into the ready queue: new → ready.",
      "The scheduler dispatches a ready process onto the CPU: ready → running.",
      "A running process leaves the CPU in one of three ways: an interrupt sends it back to ready, an I/O or event wait sends it to waiting, and exit sends it to terminated.",
      "When the I/O or event completes, a waiting process returns to ready — not to running — and must be dispatched again."
    ],
    references: ["Ch. 3 Process — Process State", "Assignment 1, Part B Q1"],
    tags: ["process-concept"]
  },
  {
    id: "os-mock-b2",
    type: "free",
    difficulty: "hard",
    homeworkFormat: "multi-step",
    points: LONG_POINTS,
    prompt: md(
      "Answer all three parts.",
      "",
      "**(a)** Write the definitions of the `wait(S)` and `signal(S)` operations on a semaphore `S` (the busy-waiting version).",
      "",
      "**(b)** Using a binary semaphore `mutex`, write the structure of a process that solves the critical-section problem. State the value `mutex` must be initialized to.",
      "",
      "**(c)** Explain why your solution guarantees mutual exclusion. Then identify the main problem with the busy-waiting definition from (a), and describe how a semaphore can be implemented to avoid it."
    ),
    sampleAnswer: md(
      "**(a)**",
      "",
      "```c",
      "wait(S) {",
      "    while (S <= 0)",
      "        ;   // busy wait",
      "    S--;",
      "}",
      "",
      "signal(S) {",
      "    S++;",
      "}",
      "```",
      "",
      "`wait()` and `signal()` must each execute **atomically** — no two processes may modify `S` at the same time.",
      "",
      "**(b)** `mutex` is initialized to **1**.",
      "",
      "```c",
      "do {",
      "    wait(mutex);",
      "        // critical section",
      "    signal(mutex);",
      "        // remainder section",
      "} while (true);",
      "```",
      "",
      "**(c)** `mutex` starts at 1. The first process to call `wait(mutex)` finds 1, decrements it to 0 and enters. Any other process that calls `wait(mutex)` finds 0 and loops, and cannot get past until the process in its critical section calls `signal(mutex)`, setting it back to 1. Because `wait` is atomic, only one waiting process can then take it from 1 to 0. So at most one process is ever in its critical section.",
      "",
      "The problem is **busy waiting**: a waiting process spins in the `while` loop, using CPU cycles without doing any useful work.",
      "",
      "The fix is to give each semaphore a **waiting queue**:",
      "",
      "```c",
      "typedef struct {",
      "    int value;",
      "    struct process *list;",
      "} semaphore;",
      "",
      "wait(semaphore *S) {",
      "    S->value--;",
      "    if (S->value < 0) {",
      "        add this process to S->list;",
      "        block();",
      "    }",
      "}",
      "",
      "signal(semaphore *S) {",
      "    S->value++;",
      "    if (S->value <= 0) {",
      "        remove a process P from S->list;",
      "        wakeup(P);",
      "    }",
      "}",
      "```",
      "",
      "`block()` places the calling process on the semaphore's waiting queue, so it stops using the CPU; `wakeup(P)` removes a process from the waiting queue and places it in the ready queue.",
      "",
      "*The slide prints the binary-semaphore example as `waiting(mutex);`. The operation is `wait(mutex)`, as defined on the slide before it.*"
    ),
    explanation:
      "The semaphore definitions, the binary-semaphore solution to the critical-section problem, and the waiting-queue implementation that removes busy waiting.",
    rubric: [
      { criterion: "`wait(S)` loops while `S <= 0`, then decrements `S`", marks: 2 },
      { criterion: "`signal(S)` increments `S`", marks: 1 },
      { criterion: "States that `wait()` and `signal()` must execute atomically", marks: 1 },
      { criterion: "`mutex` initialized to **1**", marks: 1 },
      { criterion: "`wait(mutex)` before the critical section and `signal(mutex)` after it, with the remainder section outside both", marks: 2 },
      { criterion: "Explains mutual exclusion: only one process can take `mutex` from 1 to 0; the rest wait until `signal(mutex)`", marks: 1 },
      { criterion: "Identifies busy waiting as wasting CPU cycles", marks: 1 },
      { criterion: "Describes the waiting-queue fix: `wait` blocks the process on S's list when the value goes negative; `signal` wakes one up and moves it to the ready queue", marks: 1 }
    ],
    hintSteps: [
      "`wait` must not let a process through while the semaphore is 0, and must take one unit when it does let it through.",
      "For a critical section, how many processes should be able to get past `wait(mutex)` before anyone calls `signal`? That number is the initial value.",
      "What is a process doing, CPU-wise, while it sits in that `while` loop?"
    ],
    walkthroughSteps: [
      "`wait(S)`: spin while `S <= 0`, then `S--`. `signal(S)`: `S++`. Both must be atomic.",
      "Binary semaphore for mutual exclusion: initialize `mutex` to 1, so exactly one process can get through `wait(mutex)`.",
      "Wrap the critical section: `wait(mutex)` on entry, `signal(mutex)` on exit, remainder section outside.",
      "The spin loop burns CPU while waiting. Replace it with a waiting queue: `wait` blocks when the value goes negative, and `signal` wakes one blocked process into the ready queue."
    ],
    references: [
      "Ch. 6 Synchronization — Semaphore; Semaphore Usage Example 1; Semaphore Implementation with no Busy Waiting",
      "Assignment 3, Part B Q13–Q14"
    ],
    tags: ["semaphores"]
  },
  {
    id: "os-mock-b3",
    type: "free",
    difficulty: "hard",
    homeworkFormat: "calc",
    points: LONG_POINTS,
    prompt: md(
      "Answer both parts.",
      "",
      "**(a)** Describe the **many-to-one**, **one-to-one**, and **many-to-many** multithreading models. For each, state whether a process's threads can run in parallel on a multicore system, and give one drawback or typical use case.",
      "",
      "**(b)** 70% of an application can be parallelized; the rest must run serially. Using **Amdahl's Law**, write the formula, then compute the speedup on **4 cores** and on **8 cores**, rounded to two decimal places. What does the speedup approach as the number of cores grows without limit, and what does that tell you?"
    ),
    sampleAnswer: md(
      "**(a)**",
      "",
      "| Model | Mapping | Parallel on multicore? | Drawback / use case |",
      "|---|---|---|---|",
      "| Many-to-one | many user threads → one kernel thread | **No** — only one thread can be in the kernel at a time | Few systems use it; suits lightweight tasks that don't need parallel execution |",
      "| One-to-one | each user thread → its own kernel thread | **Yes** | Creating a user thread means creating a kernel thread, and many kernel threads burden the system. Used for high-performance applications such as web servers and databases |",
      "| Many-to-many | many user threads → a smaller or equal number of kernel threads | **Yes** | The OS creates a sufficient number of kernel threads; suits balanced workloads |",
      "",
      "**(b)** With serial fraction S and N cores:",
      "",
      "$$\\text{speedup} \\le \\frac{1}{S + \\frac{1 - S}{N}}$$",
      "",
      "70% parallel means **S = 0.30** — the *serial* fraction goes in the formula.",
      "",
      "- **4 cores:** 1 / (0.30 + 0.70 / 4) = 1 / 0.475 ≈ **2.11**",
      "- **8 cores:** 1 / (0.30 + 0.70 / 8) = 1 / 0.3875 ≈ **2.58**",
      "- **N → ∞:** (1 − S) / N → 0, so the speedup approaches 1 / S = 1 / 0.30 ≈ **3.33**",
      "",
      "Doubling from 4 to 8 cores adds only about 0.47, and no number of cores can push the speedup past 3.33. The serial 30% runs at the same speed however many cores there are, so it bounds the whole program: more cores give diminishing returns."
    ),
    explanation:
      "The three multithreading models from Chapter 4 and Amdahl's Law, including the step that most often goes wrong: using the parallel fraction where the formula needs the serial one.",
    rubric: [
      { criterion: "Many-to-one: many user threads on one kernel thread, with **no** parallelism on a multicore system", marks: 1 },
      { criterion: "One-to-one: each user thread has its own kernel thread, and every user thread therefore costs a kernel thread", marks: 1 },
      { criterion: "Many-to-many: many user threads on a smaller or equal number of kernel threads, which the OS creates as needed", marks: 1 },
      { criterion: "A drawback or use case given for each of the three models", marks: 1 },
      { criterion: "Amdahl's Law written as speedup ≤ 1 / (S + (1 − S) / N)", marks: 1 },
      { criterion: "Serial fraction taken as **S = 0.30**, not 0.70", marks: 1 },
      { criterion: "4 cores: speedup ≈ **2.11**", marks: 1 },
      { criterion: "8 cores: speedup ≈ **2.58**", marks: 1 },
      { criterion: "Limit as N → ∞: 1 / S ≈ **3.33**", marks: 1 },
      { criterion: "Explains that the serial portion bounds the speedup, so extra cores give diminishing returns", marks: 1 }
    ],
    hintSteps: [
      "For each model, ask: when two threads of one process want to run at once, is there a kernel thread for each of them?",
      "Amdahl's S is the *serial* portion. If 70% is parallel, what is S?",
      "As N grows, what happens to the (1 − S) / N term?"
    ],
    walkthroughSteps: [
      "Many-to-one has a single kernel thread, so no parallelism. One-to-one gives every user thread a kernel thread: parallel, but costly. Many-to-many multiplexes onto as many kernel threads as the OS creates: parallel without that cost.",
      "S = 1 − 0.70 = 0.30.",
      "4 cores: 0.30 + 0.70 / 4 = 0.475, and 1 / 0.475 ≈ 2.11.",
      "8 cores: 0.30 + 0.70 / 8 = 0.3875, and 1 / 0.3875 ≈ 2.58.",
      "As N → ∞ the parallel term vanishes, leaving 1 / 0.30 ≈ 3.33 — the serial portion is the ceiling."
    ],
    references: ["Ch. 4 Thread — Multithreading Models; Amdahl's Law", "Assignment 2, Part A Q9 and Part B Q13"],
    tags: ["multithreading-models", "amdahls-law"]
  }
];

export const operatingSystemsExam1MockQuestions: Question[] = [...partA, ...partB];

export const operatingSystemsExam1Mock: QuizSet = {
  id: "os-exam1-mock",
  courseId: "operating-systems",
  title: "Exam 1 Mock — Real Format",
  description:
    "The midterm's format: 10 multiple-choice questions, then 3 long answers, weighted 50% / 50%. Covers all twelve topics on the topic list, with the emphasis on multithreading models, Amdahl's Law, the process state transition graph and semaphore pseudocode. Answers stay hidden until you submit; you then grade your long answers against a marking scheme for partial credit. The 75-minute timer is an estimate — set it to your exam's length on the start screen.",
  difficulty: "Advanced",
  estMinutes: 75,
  timerDefaultMinutes: 75,
  mode: "exam",
  // Hidden answers during the sitting; graded after submission.
  isExamSimulation: false,
  fixedOrder: true,
  questionCountTarget: 13,
  tags: ["exam-1", "chapters-1-6", "mock-exam", "real-format"],
  questions: operatingSystemsExam1MockQuestions
};
