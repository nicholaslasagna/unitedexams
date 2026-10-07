import type { Question, QuizSet } from "@/lib/types";

/**
 * The Exam 1 mock, in the format the exam actually uses: ten multiple-choice
 * questions and three long answers, weighted half and half, in 50 minutes.
 *
 * Every question is modelled on a specific in-class question slide or
 * assignment item, in that item's own format — the short fill-in-the-blank
 * stems, the course's own fork() code, the do { … } while (TRUE) semaphore
 * structure, and the assignments' long-answer wording — because that is what
 * the exam is drawn from. The first version read like a textbook instead.
 *
 * The long answers follow the stated emphasis: the process state transition
 * graph, semaphore pseudocode, and Amdahl's Law. Multithreading models, also
 * emphasised, get two multiple-choice questions. Between them the thirteen
 * questions touch all twelve topics on the topic list (see TOPIC_LIST).
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
    id: "os-mock-mc1",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "Which of the following best describes the role of the operating system in a computer system?",
    options: [
      "Provides the basic computing resources, such as the CPU, memory, and I/O devices",
      "Solves the users' computing problems through programs such as word processors, browsers, or games",
      "Controls and coordinates the use of the hardware among the various applications and users",
      "None of the above"
    ],
    correct: [2],
    explanation: md(
      "A computer system has three layers, and the OS is the middle one:",
      "",
      "- **Hardware** provides the basic computing resources: CPU, memory, I/O devices. That is option A.",
      "- **The operating system** controls and coordinates the use of that hardware among applications and users.",
      "- **Application programs** solve the users' computing problems. That is option B.",
      "",
      "The OS is defined as the program that acts as an intermediary between the user and the hardware."
    ),
    walkthroughSteps: [
      "Name the three layers: hardware, operating system, application programs.",
      "Options A and B describe the layers either side of the OS.",
      "The OS's own job is controlling and coordinating the hardware's use among applications and users."
    ],
    references: ["Ch. 1 Introduction — slides 21–22, Computer System Structure", "Assignment 1, Part A Q1"],
    tags: ["os-roles"]
  },
  {
    id: "os-mock-mc2",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "A microkernel is a kernel ____.",
    options: [
      "containing many components that are optimized to reduce resident memory size",
      "that is compressed before loading in order to reduce its resident memory size",
      "that is compiled to produce the smallest size possible when stored to disk",
      "that is stripped of all nonessential components"
    ],
    correct: [3],
    explanation: md(
      "A microkernel **moves as much as possible out of the kernel into user space**, keeping only a few essential services. The rest of the OS runs as separate user-level programs that communicate by message passing.",
      "",
      "- Benefits: easier to extend, and more reliable because less code runs in kernel mode.",
      "- Disadvantage: the performance overhead of user-space to kernel-space communication.",
      "- Example: Mach; the macOS kernel is partly based on it.",
      "",
      "The other three options are about making the kernel *smaller to store*, which is not what \"micro\" means here."
    ),
    walkthroughSteps: [
      "Recall the definition: few essential services in the kernel, everything else in user space.",
      "Options A–C are about memory or disk size, not about what the kernel contains.",
      "Stripped of all nonessential components is the definition."
    ],
    references: ["Ch. 2 OS Structure — slides 42–43, Microkernels; in-class question, slide 48"],
    tags: ["os-structures"]
  },
  {
    id: "os-mock-mc3",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "A ____ can be used to prevent a user program from never returning control to the operating system.",
    options: ["portal", "program counter", "firewall", "timer"],
    correct: [3],
    explanation: md(
      "The OS sets a **timer** before turning control over to a user program. The counter is set to a predefined number and decremented; when it reaches 0 it generates an interrupt, and control transfers automatically back to the OS — even if the program is in an infinite loop.",
      "",
      "This is also why turning off interrupts must be a kernel-mode instruction: a user program that could disable them could stop the timer from ever firing."
    ),
    walkthroughSteps: [
      "The problem is a program that hogs the CPU or loops forever and never gives control back.",
      "The OS needs something that interrupts it regardless of what the program does.",
      "That is the timer: when its counter reaches 0 it interrupts, and control goes back to the OS."
    ],
    references: ["Ch. 1 Introduction — slide 44, Timer; in-class question, slide 45"],
    tags: ["operation-modes"]
  },
  {
    id: "os-mock-mc4",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "_____ is/are not a technique for passing parameters from an application to a system call.",
    options: ["Cache memory", "Registers", "Stack", "Special block in memory"],
    correct: [0],
    explanation: md(
      "The three general methods for passing parameters to the OS are:",
      "",
      "1. **Registers** — the simplest, but there may be more parameters than registers.",
      "2. **A block (table) in memory**, with the address of the block passed in a register — the approach Linux takes.",
      "3. **The stack** — the program pushes the parameters and the OS pops them.",
      "",
      "Block and stack do not limit the number or length of the parameters. **Cache memory** is not one of the methods."
    ),
    walkthroughSteps: [
      "List the three methods: registers, a block in memory, the stack.",
      "Registers, Stack and Special block in memory are all on that list.",
      "Cache memory is the one that is not."
    ],
    references: ["Ch. 2 OS Structure — slide 30, System Call Parameter Passing; in-class question, slide 31", "Assignment 1, Part B Q4"],
    tags: ["system-calls"]
  },
  {
    id: "os-mock-mc5",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "A ________ saves the state of the currently running process and restores the state of the next process to run.",
    options: ["save-and-restore", "state switch", "context switch", "none of the above"],
    correct: [2],
    explanation: md(
      "A **context switch** happens when the CPU switches from one process to another. The context of a process is represented in its **PCB**, so the system saves the state of the old process into its PCB and loads the saved state of the new process from its PCB.",
      "",
      "\"Save-and-restore\" and \"state switch\" describe what happens, but neither is the term."
    ),
    walkthroughSteps: [
      "Where is a process's state kept? In its process control block.",
      "Switching the CPU between processes means saving one PCB's state and loading another's.",
      "The name for that is a context switch."
    ],
    references: ["Ch. 3 Process — slides 16–17, Context Switch; in-class question, slide 18"],
    tags: ["context-switching"]
  },
  {
    id: "os-mock-mc6",
    type: "single",
    difficulty: "hard",
    points: MC_POINTS,
    prompt: md(
      "Consider the following code segment:",
      "",
      "```c",
      "pid_t pid;",
      "pid = fork();",
      "if (pid == 0) { /* child process */",
      "    fork();",
      "    thread_create( . . .);",
      "}",
      "fork();",
      "```",
      "",
      "Including the initial parent process, how many processes are there, and how many threads are created by `thread_create()`?"
    ),
    options: [
      "5 processes; 2 threads",
      "6 processes; 2 threads",
      "6 processes; 3 threads",
      "8 processes; 4 threads"
    ],
    correct: [1],
    explanation: md(
      "**6 processes, 2 threads.** Name the processes as they appear:",
      "",
      "| Step | What happens | Processes |",
      "|---|---|---|",
      "| start | P0 | 1 |",
      "| `pid = fork();` | P0 creates P1. In P1, `pid == 0` | 2 |",
      "| `fork();` inside the `if` | only P1 is inside the `if`: it creates P2, which is a copy of P1, so P2's `pid` is also 0 | 3 |",
      "| `thread_create()` | P1 and P2 are both inside the `if`, so each creates one thread | 3, plus **2 threads** |",
      "| final `fork();` | P0, P1 and P2 each fork once more | **6** |",
      "",
      "Why not the distractors:",
      "",
      "- **5 processes** forgets to count the initial parent.",
      "- **3 threads** assumes P0 also runs `thread_create()` — but P0's `pid` is the child's PID, not 0, so it skips the `if`.",
      "- **4 threads** assumes the final `fork()` copies the extra threads into the new children. It does not: `fork()` duplicates only the thread that calls it.",
      "",
      "Counting every thread in the system instead — each of the 6 processes has its own main thread, plus the 2 created — gives 8. Say which you are counting."
    ),
    hintSteps: [
      "Track which processes have pid == 0. Remember a child created inside the if is a copy of a process that already has pid == 0.",
      "Every process alive at the final fork() runs it."
    ],
    walkthroughSteps: [
      "pid = fork(): P0 and P1. Only P1 has pid == 0.",
      "Inside the if, P1 forks P2. P2 copies P1's memory, so P2's pid is 0 too.",
      "P1 and P2 each call thread_create(): 2 threads created.",
      "P0, P1 and P2 each run the final fork(): 3 × 2 = 6 processes."
    ],
    references: ["Ch. 4 Thread — in-class question, slide 46", "Ch. 3 Process — slides 22–23, Process Creation", "Assignment 2, Part B Q14"],
    tags: ["process-creation"]
  },
  {
    id: "os-mock-mc7",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "Which multithreading model maps many user-level threads to a single kernel thread?",
    options: ["Many-to-One", "One-to-One", "Many-to-Many", "One-to-Many"],
    correct: [0],
    explanation: md(
      "**Many-to-one**: many user-level threads mapped to a single kernel thread. Multiple threads may not run in parallel on a multicore system, because only one may be in the kernel at a time. Few systems use it; it suits lightweight tasks that don't need parallel execution.",
      "",
      "- **One-to-one**: each user-level thread maps to its own kernel thread. Threads run in parallel, but creating a user thread means creating a kernel thread, and a large number of kernel threads can burden the system. Used by high-performance applications such as web servers and databases.",
      "- **Many-to-many**: many user-level threads multiplexed onto a smaller or equal number of kernel threads, with the OS creating as many kernel threads as it needs. Suits balanced workloads.",
      "- **One-to-many** is not one of the models in the Chapter 4 slides — it appears only as a wrong option."
    ),
    walkthroughSteps: [
      "Read the name as user-level threads → kernel threads.",
      "Many user-level threads to one kernel thread: many-to-one.",
      "Its consequence: no parallelism on a multicore system."
    ],
    references: ["Ch. 4 Thread — slide 16, Many-to-One; in-class question, slide 20", "Assignment 2, Part A Q9"],
    tags: ["multithreading-models"]
  },
  {
    id: "os-mock-mc8",
    type: "single",
    difficulty: "med",
    points: MC_POINTS,
    prompt:
      "The ____ multithreading model multiplexes many user-level threads to a smaller or equal number of kernel threads.",
    options: ["many-to-one model", "one-to-one model", "many-to-many model", "many-to-some model"],
    correct: [2],
    explanation: md(
      "**Many-to-many** lets many user-level threads be mapped to many kernel threads — a smaller or equal number of them — and lets the OS create a sufficient number of kernel threads. Unlike many-to-one, threads can run in parallel on a multicore system; unlike one-to-one, you don't need a kernel thread for every user thread.",
      "",
      "\"Many-to-some\" is not a model; it is the trap for students who read \"smaller or equal number\" literally."
    ),
    walkthroughSteps: [
      "\"Many user-level threads\" on the left side rules out one-to-one.",
      "\"Smaller or equal number of kernel threads\" — more than one is allowed, which rules out many-to-one.",
      "Many user threads on many kernel threads: many-to-many."
    ],
    references: ["Ch. 4 Thread — slide 18, Many-to-Many Model; in-class question, slide 19"],
    tags: ["multithreading-models"]
  },
  {
    id: "os-mock-mc9",
    type: "single",
    difficulty: "hard",
    points: MC_POINTS,
    prompt: md(
      "Consider the following set of processes, with the length of the CPU burst time given in milliseconds. All arrive at time 0, in the order P1, P2, P3, P4, P5.",
      "",
      "| Process | Burst Time |",
      "|---|---|",
      "| P1 | 6 |",
      "| P2 | 2 |",
      "| P3 | 8 |",
      "| P4 | 3 |",
      "| P5 | 4 |",
      "",
      "What is the average waiting time using **Round Robin (RR) with a time quantum of 2**?"
    ),
    options: ["6.2 ms", "9.8 ms", "11.0 ms", "12.4 ms"],
    correct: [2],
    explanation: md(
      "**11.0 ms.** The Gantt chart:",
      "",
      "```",
      "| P1 | P2 | P3 | P4 | P5 | P1 | P3 | P4 | P5 | P1 | P3 | P3 |",
      "0    2    4    6    8    10   12   14   15   17   19   21   23",
      "```",
      "",
      "Every process arrives at 0, so waiting time = completion time − burst time:",
      "",
      "| Process | Completes | Burst | Waits |",
      "|---|---|---|---|",
      "| P1 | 19 | 6 | 13 |",
      "| P2 | 4 | 2 | 2 |",
      "| P3 | 23 | 8 | 15 |",
      "| P4 | 15 | 3 | 12 |",
      "| P5 | 17 | 4 | 13 |",
      "",
      "(13 + 2 + 15 + 12 + 13) / 5 = 55 / 5 = **11.0 ms**.",
      "",
      "The other answers are the same processes under other algorithms: **6.2 ms is SJF** and **9.8 ms is FCFS**. RR has the worst average here — a small quantum keeps sending the long jobs to the back of the queue."
    ),
    hintSteps: [
      "Each process runs for at most 2 ms, then goes to the back of the ready queue if it has work left.",
      "Write down the completion time of each process from your Gantt chart, then subtract its burst."
    ],
    walkthroughSteps: [
      "First pass: P1 0–2 (4 left), P2 2–4 (done), P3 4–6 (6 left), P4 6–8 (1 left), P5 8–10 (2 left).",
      "Second pass: P1 10–12 (2 left), P3 12–14 (4 left), P4 14–15 (done), P5 15–17 (done).",
      "Then P1 17–19 (done), P3 19–21 and 21–23 (done).",
      "Waiting times 13, 2, 15, 12 and 13 sum to 55; 55 / 5 = 11.0 ms."
    ],
    references: ["Ch. 5 CPU Scheduling — slides 12–13, Round Robin; Example of RR with Time Quantum = 4", "Assignment 3, Part B Q11"],
    tags: ["cpu-scheduling"]
  },
  {
    id: "os-mock-mc10",
    type: "single",
    difficulty: "easy",
    points: MC_POINTS,
    prompt: "In Peterson's solution, the ____ variable indicates if a process is ready to enter its critical section.",
    options: ["turn", "lock", "flag[i]", "turn[i]"],
    correct: [2],
    explanation: md(
      "Peterson's solution is a two-process, software-based solution with two shared variables:",
      "",
      "- `boolean flag[2]` — **`flag[i] = true` means process Pi is ready** to enter its critical section.",
      "- `int turn` — whose turn it is to enter the critical section.",
      "",
      "Process Pi sets `flag[i] = true; turn = j;` and then waits while `flag[j] && turn == j`. Peterson's solution has no `lock` variable, and `turn` is a single integer, not an array.",
      "",
      "On modern architectures the processor or compiler may reorder these writes, so Peterson's solution needs a memory barrier to be guaranteed correct."
    ),
    walkthroughSteps: [
      "Peterson's solution shares exactly two variables: turn and flag[2].",
      "turn says whose turn it is; flag says who wants in.",
      "\"Ready to enter\" is flag[i]."
    ],
    references: ["Ch. 6 Synchronization — slides 11–12, Peterson's Solution; in-class question, slide 19", "Assignment 3, Part B Q12"],
    tags: ["petersons-solution"]
  }
];

// ── Part B: long answers ────────────────────────────────────────────────────

const partB: Question[] = [
  {
    id: "os-mock-lq1",
    type: "free",
    difficulty: "med",
    homeworkFormat: "multi-step",
    points: LONG_POINTS,
    prompt: md(
      "**Draw the process state transition graph.** Label every state and every transition.",
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
      "Five states and six transitions, exactly as drawn on the Process State slide. Every arrow out of running is a reason the process stops running, and the only way back onto the CPU is through ready.",
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
    references: ["Ch. 3 Process — slide 6, Process State", "Assignment 1, Part B Q1"],
    tags: ["process-concept"]
  },
  {
    id: "os-mock-lq2",
    type: "free",
    difficulty: "hard",
    homeworkFormat: "multi-step",
    points: LONG_POINTS,
    prompt: md(
      "**(a)** Give the definitions of the semaphore operations `wait()` and `signal()`.",
      "",
      "**(b)** Use a binary semaphore to solve the critical-section problem. Show the structure of the process, and state what the semaphore is initialized to.",
      "",
      "**(c)** What is the big problem with this implementation of `wait()`, and how can a semaphore be implemented to avoid it?"
    ),
    sampleAnswer: md(
      "**(a)** A semaphore S is an integer variable that can only be accessed through two indivisible (**atomic**) operations:",
      "",
      "```c",
      "wait(S) {",
      "    while (S <= 0)",
      "        ; // busy wait",
      "    S--;",
      "}",
      "",
      "signal(S) {",
      "    S++;",
      "}",
      "```",
      "",
      "**(b)** Create a semaphore `mutex` **initialized to 1**:",
      "",
      "```c",
      "do {",
      "    wait(mutex);",
      "        // critical section",
      "    signal(mutex);",
      "        // remainder section",
      "} while (TRUE);",
      "```",
      "",
      "The first process to call `wait(mutex)` finds 1, decrements it to 0 and enters. Any other process finds 0 and loops in `wait()` until the first one calls `signal(mutex)` on its way out, so only one process is in its critical section at a time.",
      "",
      "**(c)** The big problem is the **busy loop** in `wait()`: a waiting process spins, consuming CPU cycles without doing any useful work.",
      "",
      "It is avoided by giving each semaphore a **waiting queue**, with two operations: `block()` places the process on the waiting queue, and `wakeup()` removes one process from the waiting queue and places it in the ready queue.",
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
      "*The binary-semaphore slide prints `waiting(mutex);`. The operation is `wait(mutex)`, as defined on the slide before it.*"
    ),
    explanation:
      "The semaphore definitions from the Semaphore slide, the binary-semaphore solution to the critical-section problem from Semaphore Usage Example 1, and the waiting-queue implementation that removes busy waiting.",
    rubric: [
      { criterion: "`wait(S)` loops while `S <= 0` (busy wait), then decrements `S`", marks: 2 },
      { criterion: "`signal(S)` increments `S`", marks: 1 },
      { criterion: "States that `wait()` and `signal()` are atomic (indivisible)", marks: 1 },
      { criterion: "`mutex` initialized to **1**", marks: 1 },
      { criterion: "`wait(mutex)` before the critical section and `signal(mutex)` after it, with the remainder section outside, in a loop", marks: 2 },
      { criterion: "Explains why only one process can be in its critical section at a time", marks: 1 },
      { criterion: "Identifies the busy loop as wasting CPU cycles", marks: 1 },
      { criterion: "Describes the fix: a waiting queue, with `block()` putting the process on it and `wakeup()` moving one to the ready queue", marks: 1 }
    ],
    hintSteps: [
      "wait() must not let a process through while the semaphore is 0, and takes one unit when it does let it through.",
      "For a critical section, how many processes should get past wait(mutex) before anyone calls signal? That is the initial value.",
      "What is a process doing with the CPU while it sits in that while loop?"
    ],
    walkthroughSteps: [
      "wait(S): spin while S <= 0, then S--. signal(S): S++. Both atomic.",
      "Binary semaphore: mutex = 1, so exactly one process gets through wait(mutex).",
      "Wrap the critical section: wait(mutex) on entry, signal(mutex) on exit, remainder outside, all inside do { … } while (TRUE).",
      "The spin wastes CPU. Replace it with a waiting queue: wait blocks the process when the value goes negative, and signal wakes one blocked process into the ready queue."
    ],
    references: [
      "Ch. 6 Synchronization — slide 25, Semaphore; slide 26, Semaphore Usage Example 1; slides 29–32, Semaphore Implementation with no Busy Waiting"
    ],
    tags: ["semaphores"]
  },
  {
    id: "os-mock-lq3",
    type: "free",
    difficulty: "med",
    homeworkFormat: "calc",
    points: LONG_POINTS,
    prompt: md(
      "Using **Amdahl's Law**, calculate the speedup gain of an application that has an **80 percent parallel component** for:",
      "",
      "**(a)** two processing cores",
      "",
      "**(b)** four processing cores",
      "",
      "**(c)** What does the speedup approach as the number of processing cores approaches infinity?",
      "",
      "Show your work."
    ),
    sampleAnswer: md(
      "Amdahl's Law, where **S is the serial portion** and **N is the number of processing cores**:",
      "",
      "$$\\text{speedup} \\le \\frac{1}{S + \\frac{(1 - S)}{N}}$$",
      "",
      "The application is 80% parallel, so the serial portion is **S = 1 − 0.80 = 0.20**.",
      "",
      "**(a)** N = 2:  1 / (0.20 + 0.80 / 2) = 1 / (0.20 + 0.40) = 1 / 0.60 ≈ **1.67**",
      "",
      "**(b)** N = 4:  1 / (0.20 + 0.80 / 4) = 1 / (0.20 + 0.20) = 1 / 0.40 = **2.5**",
      "",
      "**(c)** As N → ∞, (1 − S) / N → 0, so the speedup approaches 1 / S = 1 / 0.20 = **5**.",
      "",
      "However many cores are added, the 20% that must run serially caps the speedup at 5."
    ),
    explanation:
      "The step that goes wrong most often is putting the parallel fraction in for S. The formula needs the serial portion: 80% parallel means S = 0.20.",
    rubric: [
      { criterion: "Writes Amdahl's Law: speedup ≤ 1 / (S + (1 − S) / N)", marks: 2 },
      { criterion: "Uses the serial portion **S = 0.20**, not 0.80", marks: 2 },
      { criterion: "(a) Two cores: 1 / 0.60 ≈ **1.67**, with the work shown", marks: 2 },
      { criterion: "(b) Four cores: 1 / 0.40 = **2.5**, with the work shown", marks: 2 },
      { criterion: "(c) As N → ∞ the speedup approaches 1 / S = **5**", marks: 1 },
      { criterion: "Explains that the serial portion limits the speedup", marks: 1 }
    ],
    hintSteps: [
      "S is the serial portion. If 80% is parallel, what is S?",
      "Substitute S and N into 1 / (S + (1 − S) / N).",
      "As N grows, what happens to the (1 − S) / N term?"
    ],
    walkthroughSteps: [
      "S = 1 − 0.80 = 0.20.",
      "Two cores: 0.20 + 0.80 / 2 = 0.60, and 1 / 0.60 ≈ 1.67.",
      "Four cores: 0.20 + 0.80 / 4 = 0.40, and 1 / 0.40 = 2.5.",
      "As N → ∞ the parallel term vanishes, leaving 1 / 0.20 = 5 — the ceiling set by the serial portion."
    ],
    references: ["Ch. 4 Thread — slide 10, Amdahl's Law; in-class exercise, slide 13", "Assignment 2, Part B Q13"],
    tags: ["amdahls-law"]
  }
];

export const operatingSystemsExam1MockQuestions: Question[] = [...partA, ...partB];

export const operatingSystemsExam1Mock: QuizSet = {
  id: "os-exam1-mock",
  courseId: "operating-systems",
  title: "Exam 1 Mock — Real Format",
  description:
    "The midterm's format: 10 multiple-choice questions, then 3 long answers, weighted 50% / 50%, in 50 minutes. Every question is modelled on an in-class question slide or an assignment item, in its own format — including the course's fork() code — and the long answers are the process state transition graph, semaphore pseudocode and Amdahl's Law. Answers stay hidden until you submit; you then grade your long answers against a marking scheme for partial credit.",
  difficulty: "Advanced",
  estMinutes: 50,
  timerDefaultMinutes: 50,
  mode: "exam",
  // Hidden answers during the sitting; graded after submission.
  isExamSimulation: false,
  fixedOrder: true,
  questionCountTarget: 13,
  tags: ["exam-1", "chapters-1-6", "mock-exam", "real-format"],
  questions: operatingSystemsExam1MockQuestions
};
