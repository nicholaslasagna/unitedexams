import type { QuizSet } from "@/lib/types";

/**
 * Operating Systems (CS-4352) — Fall 2026.
 *
 * Processes and scheduling first, then the concurrency material that most
 * exams weight heaviest: synchronisation, deadlock, virtual memory and file
 * systems.
 */
export const operatingSystemsQuizSets: QuizSet[] = [
  {
    id: "os-processes-scheduling",
    courseId: "operating-systems",
    title: "Processes, Threads & CPU Scheduling",
    description:
      "Process state, context switches, the thread/process distinction, and the scheduling algorithms with their tradeoffs.",
    difficulty: "Intermediate",
    estMinutes: 28,
    tags: ["processes", "threads", "scheduling", "context-switch"],
    timerDefaultMinutes: 25,
    questions: [
      {
        id: "os-ps-q1",
        type: "single",
        prompt: "What does a **context switch** save and restore?",
        options: [
          "The process control block state — registers, program counter, stack pointer and memory-management state",
          "Only the program counter",
          "The entire contents of physical memory",
          "The process's open files, but not its registers"
        ],
        correct: [0],
        explanation:
          "A context switch stores the running process's CPU state into its PCB and loads the next process's state. Memory is not copied — the MMU is simply repointed, typically by swapping the page-table base register.",
        walkthroughSteps: [
          "The PCB holds everything needed to resume a process: general registers, program counter, stack pointer, status word, and memory-management information.",
          "On a switch: save the current registers into the outgoing PCB, load the incoming one, and switch the page-table base register.",
          "Memory contents are never copied — that is the entire point of having page tables.",
          "The hidden cost is the cache and TLB: they are now cold or partly flushed, so the real expense is often the misses that follow rather than the register moves themselves."
        ],
        tags: ["processes", "context-switch", "pcb"]
      },
      {
        id: "os-ps-q2",
        type: "single",
        prompt: "Which resource is **not** shared between threads of the same process?",
        options: [
          "The stack",
          "The heap",
          "Global variables",
          "Open file descriptors"
        ],
        correct: [0],
        explanation:
          "Threads share the address space — heap, globals, code and the file-descriptor table — but each has its own stack, registers and program counter, because each needs an independent call chain.",
        walkthroughSteps: [
          "Per thread: stack, registers, program counter, and thread-local storage.",
          "Shared: code, heap, global/static data, open files, and the process's signal handlers.",
          "The shared heap is what makes threads cheap to communicate through, and also what makes them dangerous — hence synchronisation.",
          "A common exam trap: a pointer to a *local* variable in one thread's stack is still a valid address in the shared space, so passing it to another thread compiles and may even seem to work, but is a lifetime bug."
        ],
        tags: ["threads", "address-space", "sharing"]
      },
      {
        id: "os-ps-q3",
        type: "single",
        prompt:
          "Processes arrive at time 0 with burst times 8, 4 and 2. What is the average waiting time under **shortest-job-first**?",
        options: ["2.67", "4.67", "6.00", "8.00"],
        correct: [0],
        explanation:
          "SJF orders them 2, 4, 8. Waiting times are 0, 2 and 6, so the average is $(0 + 2 + 6)/3 = 2.67$. SJF is provably optimal for average waiting time when all jobs are available at once.",
        walkthroughSteps: [
          "Sort by burst: 2, then 4, then 8.",
          "First job waits 0. Second waits 2 (the first job's burst). Third waits $2 + 4 = 6$.",
          "Average $= (0 + 2 + 6)/3 = 8/3 \\approx 2.67$.",
          "Compare FCFS in arrival order 8, 4, 2: waits of 0, 8, 12, averaging 6.67 — far worse, and this gap is the convoy effect.",
          "SJF's catch is that burst times are not known in advance, so real schedulers estimate them with an exponential average of past bursts."
        ],
        tags: ["scheduling", "sjf", "waiting-time"]
      },
      {
        id: "os-ps-q4",
        type: "single",
        prompt:
          "In round-robin scheduling, what happens as the time quantum grows very large?",
        options: [
          "It degenerates into first-come-first-served",
          "It degenerates into shortest-job-first",
          "Context-switch overhead increases",
          "Starvation becomes more likely"
        ],
        correct: [0],
        explanation:
          "If the quantum exceeds every burst, no process is ever preempted, so processes run to completion in arrival order — exactly FCFS. A very small quantum has the opposite problem: correct fairness, but overhead dominated by context switching.",
        walkthroughSteps: [
          "Round-robin preempts a process when its quantum expires and moves it to the back of the ready queue.",
          "If the quantum is larger than the longest burst, that preemption never fires, and the behaviour collapses to FCFS.",
          "As the quantum shrinks toward zero, switches happen constantly and the overhead per unit of useful work rises.",
          "The practical rule of thumb is to set the quantum so that roughly 80% of bursts finish inside one quantum.",
          "Round-robin does not starve anyone: every process is guaranteed the CPU within $(n-1) \\times q$ time."
        ],
        tags: ["scheduling", "round-robin", "quantum"]
      },
      {
        id: "os-ps-q5",
        type: "multi",
        prompt: "Select every statement that is true of a **system call**.",
        options: [
          "It transitions the CPU from user mode to kernel mode",
          "It is more expensive than an ordinary function call",
          "It is how a user process requests a privileged operation",
          "It is executed entirely in user mode for speed",
          "Its arguments must be validated by the kernel"
        ],
        correct: [0, 1, 2, 4],
        explanation:
          "A system call is the controlled doorway into the kernel: it switches privilege level, costs far more than a function call, and its arguments come from an untrusted source and must be checked. Executing in user mode would defeat the entire purpose.",
        walkthroughSteps: [
          "User processes cannot touch hardware directly, so they trap into the kernel via a defined instruction.",
          "The trap switches the mode bit and vectors through a system-call table, which is why it is not a plain jump.",
          "Cost: mode switch, argument copying, and validation — hundreds of cycles versus a few for a function call.",
          "Validation is a security boundary, not a formality: a pointer from user space might point into the kernel, so it must be checked before being dereferenced.",
          "This cost is why buffered I/O exists — batching writes turns many system calls into one."
        ],
        tags: ["system-calls", "kernel-mode", "protection"]
      },
      {
        id: "os-ps-q6",
        type: "single",
        prompt: "What distinguishes **preemptive** from **non-preemptive** scheduling?",
        options: [
          "Preemptive scheduling can take the CPU from a running process before it blocks or finishes",
          "Preemptive scheduling only runs one process at a time",
          "Non-preemptive scheduling requires multiple CPUs",
          "Preemptive scheduling cannot be used with priorities"
        ],
        correct: [0],
        explanation:
          "Under preemption the scheduler can interrupt a running process — usually on a timer or when a higher-priority process becomes ready. Non-preemptive scheduling only reschedules when a process blocks or exits, which makes one misbehaving process able to hold the CPU indefinitely.",
        walkthroughSteps: [
          "Non-preemptive: the running process keeps the CPU until it blocks on I/O or terminates.",
          "Preemptive: a timer interrupt or a higher-priority arrival can force a switch.",
          "Preemption is what makes interactive responsiveness possible, and what makes shared data races possible — the two go together.",
          "It also introduces the need for kernel synchronisation, since a process can now be interrupted inside a critical section."
        ],
        tags: ["scheduling", "preemption"]
      },
      {
        id: "os-ps-q7",
        type: "single",
        prompt:
          "After `fork()` succeeds, what does it return in the parent and in the child?",
        options: [
          "The child's PID in the parent, and 0 in the child",
          "0 in the parent, and the parent's PID in the child",
          "The child's PID in both",
          "0 in both"
        ],
        correct: [0],
        explanation:
          "`fork()` returns twice. The parent receives the new child's PID — which it needs in order to `wait()` on it — and the child receives 0, since it can always call `getppid()` to find its parent. A negative return means the fork failed.",
        walkthroughSteps: [
          "`fork()` duplicates the calling process; both continue from the same point with the same code.",
          "The return value is the only thing distinguishing them, which is why the idiom is `if (pid == 0) { child } else { parent }`.",
          "Parent gets the child's PID because it has no other way to learn it; the child does not need the parent's, since `getppid()` exists.",
          "On failure `fork()` returns $-1$ and sets `errno` — worth checking, since process limits are real.",
          "Modern kernels implement the copy with copy-on-write, so the address space is shared read-only until one side writes."
        ],
        tags: ["processes", "fork", "posix"]
      },
      {
        id: "os-ps-q8",
        type: "free",
        prompt:
          "Explain the convoy effect under FCFS scheduling, give a concrete example, and name a scheduling policy that avoids it.",
        explanation:
          "The convoy effect is short jobs queuing behind one long job under FCFS, inflating average waiting time. SJF or round-robin both break it.",
        sampleAnswer:
          "Under FCFS, a long CPU-bound job that arrives first holds the CPU while every short job waits behind it, so average waiting time is dominated by that one job. Example: bursts of 100, 2 and 2 arriving in that order give waits of 0, 100 and 102 — an average of 67.3. Reversed to 2, 2, 100 the waits are 0, 2, 4, averaging 2. Nothing about the work changed, only the order. SJF avoids it by running short jobs first; round-robin avoids it by preempting the long job so short ones interleave and finish early.",
        hintSteps: [
          "Start from what FCFS guarantees: no preemption, strict arrival order.",
          "Construct the worst case — one very long burst arriving before several short ones.",
          "Compute the average waiting time both ways to show the ordering is what changed, not the workload.",
          "Then ask which policies break the assumption that caused it."
        ],
        walkthroughSteps: [
          "FCFS runs to completion in arrival order, so a process cannot be displaced once started.",
          "With bursts 100, 2, 2 the waiting times are 0, 100 and 102, averaging $202/3 \\approx 67.3$.",
          "Reorder to 2, 2, 100: waits are 0, 2, 4, averaging 2. Same jobs, thirty times better.",
          "The pathology is worse in practice because I/O-bound jobs get stuck behind CPU-bound ones and leave the devices idle.",
          "SJF fixes it directly by ordering on burst length, and is provably optimal for average waiting time.",
          "Round-robin fixes it without knowing burst lengths, by capping how long anyone holds the CPU."
        ],
        tags: ["scheduling", "fcfs", "convoy-effect"]
      }
    ]
  },
  {
    id: "os-concurrency-memory",
    courseId: "operating-systems",
    title: "Synchronisation, Deadlock & Virtual Memory",
    description:
      "Race conditions, semaphores and monitors, the four deadlock conditions, paging, and page-replacement behaviour.",
    difficulty: "Intermediate",
    estMinutes: 30,
    tags: ["synchronisation", "deadlock", "virtual-memory", "paging"],
    timerDefaultMinutes: 28,
    questions: [
      {
        id: "os-cm-q1",
        type: "multi",
        prompt:
          "Which four conditions must **all** hold simultaneously for deadlock to be possible?",
        options: [
          "Mutual exclusion",
          "Hold and wait",
          "No preemption",
          "Circular wait",
          "Starvation"
        ],
        correct: [0, 1, 2, 3],
        explanation:
          "Coffman's four conditions are mutual exclusion, hold and wait, no preemption, and circular wait. All four are necessary, so deadlock prevention works by designing at least one of them away. Starvation is a separate problem — a starving process is still running, just never chosen.",
        walkthroughSteps: [
          "Mutual exclusion: at least one resource is non-shareable.",
          "Hold and wait: a process holding a resource can request another.",
          "No preemption: resources are released voluntarily, never seized.",
          "Circular wait: a cycle of processes each waiting on the next.",
          "Because all four are required, prevention strategies target one — for instance, imposing a global lock ordering makes circular wait impossible.",
          "Starvation is indefinite postponement, which can happen with no deadlock at all: a low-priority process under a strict priority scheduler."
        ],
        tags: ["deadlock", "coffman-conditions"]
      },
      {
        id: "os-cm-q2",
        type: "single",
        prompt:
          "Why must the increment and decrement operations on a semaphore be **atomic**?",
        options: [
          "Otherwise two processes can interleave inside the update and both pass a guard that should admit one",
          "Because semaphores are stored on disk",
          "Because atomic operations are faster",
          "Because the compiler cannot otherwise generate code for them"
        ],
        correct: [0],
        explanation:
          "The counter update is itself a critical section. If two processes read the value before either writes back, both can see a positive count and both proceed — the exact mutual-exclusion failure the semaphore existed to prevent. Atomicity comes from hardware primitives like test-and-set or compare-and-swap, or from disabling interrupts on a uniprocessor.",
        walkthroughSteps: [
          "`wait()` is read, test, decrement — three steps that can be interrupted between any two.",
          "Two processes reading a count of 1 before either writes will both decrement it and both enter.",
          "So the semaphore's own update needs a lower-level guarantee, which is where hardware atomic instructions come in.",
          "That is not circular: the hardware primitive is a single uninterruptible instruction, not another software lock.",
          "This is also why you cannot correctly implement a semaphore with an ordinary `int` and a couple of `if` statements."
        ],
        tags: ["synchronisation", "semaphore", "atomicity"]
      },
      {
        id: "os-cm-q3",
        type: "single",
        prompt:
          "A system has 4-KB pages and a 32-bit virtual address space. How many entries does a single-level page table have?",
        options: ["$2^{20}$", "$2^{12}$", "$2^{32}$", "$2^{16}$"],
        correct: [0],
        explanation:
          "A 4-KB page needs $\\log_2 4096 = 12$ offset bits, leaving $32 - 12 = 20$ bits of page number, so $2^{20}$ entries — about a million. At 4 bytes each that is 4 MB of page table *per process*, which is exactly why multi-level tables exist.",
        walkthroughSteps: [
          "Page size $4\\,\\text{KB} = 2^{12}$ bytes, so the offset field is 12 bits.",
          "Virtual address is 32 bits, so the virtual page number takes the remaining 20 bits.",
          "A single-level table needs one entry per possible page: $2^{20} = 1{,}048{,}576$ entries.",
          "At 4 bytes per entry that is 4 MB per process, most of it never touched.",
          "Two-level paging fixes this by only allocating second-level tables for regions actually in use."
        ],
        tags: ["virtual-memory", "paging", "address-translation"]
      },
      {
        id: "os-cm-q4",
        type: "single",
        prompt: "What is **thrashing**?",
        options: [
          "A process spends more time servicing page faults than executing, because its working set does not fit in memory",
          "Two threads repeatedly acquiring the same lock",
          "The CPU switching between processes too frequently",
          "A disk performing too many sequential reads"
        ],
        correct: [0],
        explanation:
          "Thrashing is the collapse that happens when the resident set is smaller than the working set: nearly every access faults, the disk saturates, CPU utilisation falls — and a scheduler that responds by admitting more processes makes it worse.",
        walkthroughSteps: [
          "The working set is the pages a process is actively using in a given time window.",
          "If the frames allocated are fewer than that, evicted pages are needed again almost immediately.",
          "CPU utilisation drops because everyone is blocked on I/O; a naive scheduler reads that as spare capacity and admits more work, deepening the collapse.",
          "Fixes: working-set or page-fault-frequency based allocation, or suspending processes to free frames.",
          "It is distinct from lock contention and from excessive context switching, though all three present as 'the machine got slow'."
        ],
        tags: ["virtual-memory", "thrashing", "working-set"]
      },
      {
        id: "os-cm-q5",
        type: "single",
        prompt:
          "With 3 frames and the reference string 1, 2, 3, 4, 1, 2, 5, how many page faults does **FIFO** incur?",
        options: ["7", "5", "6", "4"],
        correct: [0],
        explanation:
          "Every reference faults. After 1,2,3 fill the frames, 4 evicts 1, then 1 evicts 2, then 2 evicts 3, then 5 evicts 4 — seven faults from seven references.",
        walkthroughSteps: [
          "Reference 1: fault, frames [1]. Reference 2: fault, [1,2]. Reference 3: fault, [1,2,3].",
          "Reference 4: fault, evict oldest (1), frames [2,3,4].",
          "Reference 1: fault — it was just evicted — evict 2, frames [3,4,1].",
          "Reference 2: fault, evict 3, frames [4,1,2].",
          "Reference 5: fault, evict 4, frames [1,2,5].",
          "Total: 7 faults. This string is a good illustration of FIFO's weakness — it evicts by age, ignoring whether a page is about to be used again."
        ],
        tags: ["virtual-memory", "page-replacement", "fifo"]
      },
      {
        id: "os-cm-q6",
        type: "single",
        prompt: "What is **Belady's anomaly**, and which algorithms are immune to it?",
        options: [
          "Adding frames can increase faults under FIFO; stack algorithms such as LRU and OPT are immune",
          "Adding frames always decreases faults, which is why FIFO is preferred",
          "LRU suffers it but FIFO does not",
          "It only affects segmented memory systems"
        ],
        correct: [0],
        explanation:
          "FIFO can fault *more* with more frames — counter-intuitive but real. Stack algorithms like LRU and OPT cannot, because the set of pages resident with $n$ frames is always a subset of the set resident with $n+1$ frames.",
        walkthroughSteps: [
          "The classic string 1,2,3,4,1,2,5,1,2,3,4,5 gives 9 faults with 3 frames and 10 with 4 under FIFO.",
          "The cause is that FIFO's eviction order does not respect recency of use, so more frames can change the ordering unhelpfully.",
          "A stack algorithm has the inclusion property: the pages in memory with $n$ frames are always a subset of those with $n+1$.",
          "That property makes an anomaly impossible, and LRU and OPT both have it.",
          "This is a favourite exam question precisely because the result is counter-intuitive."
        ],
        tags: ["virtual-memory", "beladys-anomaly", "page-replacement"]
      },
      {
        id: "os-cm-q7",
        type: "single",
        prompt:
          "In the readers–writers problem, what goes wrong with the naive reader-priority solution?",
        options: [
          "Writers can starve, because a continuous stream of readers never lets the lock reach zero readers",
          "Readers can corrupt each other's data",
          "It deadlocks as soon as two readers arrive",
          "It requires one semaphore per reader"
        ],
        correct: [0],
        explanation:
          "Reader-priority lets any reader in while another reader holds the lock. If readers keep arriving, the reader count never returns to zero and a waiting writer is postponed indefinitely — starvation, not deadlock, since the readers are making progress.",
        walkthroughSteps: [
          "The first reader acquires the write lock; subsequent readers just increment a counter.",
          "The write lock is only released when the count returns to zero.",
          "Under a steady arrival of readers that never happens, so a waiting writer never runs.",
          "This is starvation: the system is doing useful work, just never the writer's.",
          "Writer-priority swaps the victim; a fair solution uses a turnstile so arrivals queue in order."
        ],
        tags: ["synchronisation", "readers-writers", "starvation"]
      },
      {
        id: "os-cm-q8",
        type: "free",
        prompt:
          "Explain what a TLB is, why it works, and compute the effective access time given a 95% hit rate, a 1 ns TLB lookup and a 100 ns memory access.",
        explanation:
          "The TLB caches recent virtual-to-physical translations, exploiting locality; a miss costs an extra memory reference to walk the page table.",
        sampleAnswer:
          "The TLB is a small fully-associative cache of page-table entries inside the MMU. Without it, every memory reference would need a second reference to read the page table, doubling the cost. It works because programs exhibit locality: a handful of pages cover most accesses in any short window. Effective access time with a 95% hit rate: a hit costs 1 + 100 = 101 ns, a miss costs 1 + 100 + 100 = 201 ns (lookup, page-table read, then the data). EAT = 0.95(101) + 0.05(201) = 95.95 + 10.05 = 106 ns, about 6% over raw memory speed.",
        hintSteps: [
          "Ask first what translation costs *without* a TLB — how many memory references per access?",
          "Then state why a small cache is enough: what property of programs makes a few entries cover most accesses?",
          "For the arithmetic, write the cost of a hit and the cost of a miss separately before weighting them.",
          "Remember a miss still pays the TLB lookup — it is not free just because it missed."
        ],
        walkthroughSteps: [
          "Paging puts the translation table in memory, so a naive implementation needs two memory accesses per reference: one for the page-table entry, one for the data.",
          "The TLB caches recent translations in hardware, typically 64–1024 fully-associative entries.",
          "It works because of temporal and spatial locality — a loop over an array touches very few distinct pages.",
          "Hit cost: 1 ns lookup + 100 ns to fetch the data = 101 ns.",
          "Miss cost: 1 ns lookup + 100 ns to read the page table + 100 ns for the data = 201 ns.",
          "EAT = $0.95 \\times 101 + 0.05 \\times 201 = 95.95 + 10.05 = 106$ ns.",
          "Interpretation: a 95% hit rate keeps the overhead near 6%, whereas without the TLB it would be 100%. This is why context switches that flush the TLB are expensive, and why modern CPUs tag entries with an address-space ID to avoid flushing."
        ],
        tags: ["virtual-memory", "tlb", "effective-access-time"]
      }
    ]
  }
];
