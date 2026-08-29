import type { QuizSet } from "@/lib/types";

/**
 * Computer Systems Organization and Architecture (CS-5375) — Fall 2026.
 *
 * The graduate treatment: quantitative performance models and
 * instruction-level parallelism, then the multiprocessor material —
 * coherence, consistency and scaling — that the undergraduate course does
 * not reach.
 */
export const architectureSystemsQuizSets: QuizSet[] = [
  {
    id: "arch-performance-ilp",
    courseId: "computer-systems-architecture",
    title: "Performance Models & Instruction-Level Parallelism",
    description:
      "Amdahl's law, the CPU performance equation, pipeline hazards, branch prediction and out-of-order execution.",
    difficulty: "Advanced",
    estMinutes: 30,
    tags: ["amdahl", "cpi", "pipelining", "ilp", "branch-prediction"],
    timerDefaultMinutes: 28,
    questions: [
      {
        id: "arch-pi-q1",
        type: "single",
        prompt:
          "An optimisation makes 40% of a program's execution 4× faster. By Amdahl's law, what is the overall speedup?",
        options: ["1.43×", "1.60×", "2.50×", "4.00×"],
        correct: [0],
        explanation:
          "Speedup $= 1 / ((1 - f) + f/s) = 1/(0.6 + 0.4/4) = 1/0.7 \\approx 1.43$. The 60% you did not touch dominates — even an infinite speedup on that 40% would only reach 1.67×.",
        walkthroughSteps: [
          "Amdahl: $S = \\dfrac{1}{(1-f) + f/s}$ with $f$ the affected fraction and $s$ its local speedup.",
          "Here $f = 0.4$, $s = 4$, so the enhanced part shrinks from 0.4 to 0.1.",
          "New time $= 0.6 + 0.1 = 0.7$ of the original, giving $S = 1/0.7 \\approx 1.43$.",
          "Take the limit: as $s \\to \\infty$ the best possible is $1/0.6 \\approx 1.67$.",
          "The lesson the course wants: optimise the common case, and measure before choosing what to optimise."
        ],
        tags: ["amdahl", "performance", "speedup"]
      },
      {
        id: "arch-pi-q2",
        type: "single",
        prompt:
          "A program executes $2 \\times 10^9$ instructions at CPI 1.5 on a 3 GHz processor. What is its execution time?",
        options: ["1.0 s", "0.5 s", "1.5 s", "3.0 s"],
        correct: [0],
        explanation:
          "Time $= \\dfrac{\\text{IC} \\times \\text{CPI}}{\\text{clock rate}} = \\dfrac{2\\times10^9 \\times 1.5}{3\\times10^9} = 1.0$ s. This is the CPU performance equation, and the three factors are the only levers there are.",
        walkthroughSteps: [
          "CPU time $=$ instruction count $\\times$ CPI $\\times$ clock period.",
          "Total cycles $= 2\\times10^9 \\times 1.5 = 3\\times10^9$.",
          "Clock period $= 1/(3\\times10^9)$ s, so time $= 3\\times10^9 / 3\\times10^9 = 1.0$ s.",
          "Each factor is owned by a different layer: instruction count by the compiler and ISA, CPI by the microarchitecture, clock rate by the technology.",
          "This is why comparing processors by clock rate alone is meaningless — a lower CPI can beat a higher frequency."
        ],
        tags: ["cpi", "performance-equation", "clock-rate"]
      },
      {
        id: "arch-pi-q3",
        type: "single",
        prompt:
          "Which hazard type does **register renaming** eliminate?",
        options: [
          "False dependencies — write-after-read and write-after-write",
          "True data dependencies (read-after-write)",
          "Control hazards from mispredicted branches",
          "Structural hazards from a single memory port"
        ],
        correct: [0],
        explanation:
          "WAR and WAW are name dependencies: they exist only because two instructions reuse an architectural register. Renaming to distinct physical registers removes them. RAW is a genuine data flow and cannot be renamed away.",
        walkthroughSteps: [
          "RAW (true dependency): a later instruction needs a value the earlier one produces. Real, unavoidable.",
          "WAR and WAW: artefacts of a finite architectural register file, not of the computation.",
          "Renaming maps each write to a fresh physical register, so the false dependencies disappear.",
          "This is what makes aggressive out-of-order issue possible — Tomasulo's algorithm renames via reservation stations.",
          "Control hazards need prediction, and structural hazards need more hardware; renaming addresses neither."
        ],
        tags: ["ilp", "register-renaming", "hazards"]
      },
      {
        id: "arch-pi-q4",
        type: "single",
        prompt:
          "A 2-bit saturating branch predictor is in the 'strongly taken' state. How many consecutive not-taken outcomes are needed before it predicts not-taken?",
        options: ["2", "1", "3", "4"],
        correct: [0],
        explanation:
          "Strongly taken → weakly taken after one not-taken (still predicting taken), then → weakly not-taken after a second, at which point the prediction flips. That hysteresis is the point: a single anomaly does not flip the predictor.",
        walkthroughSteps: [
          "The four states are strongly taken (11), weakly taken (10), weakly not-taken (01), strongly not-taken (00).",
          "Each not-taken outcome decrements by one state; each taken outcome increments.",
          "From 11, one not-taken gives 10 — the top bit is still 1, so it still predicts taken.",
          "A second not-taken gives 01, and the prediction is now not-taken. So two.",
          "This is why 2-bit predictors beat 1-bit on loops: the single not-taken at loop exit costs one misprediction instead of two."
        ],
        tags: ["branch-prediction", "saturating-counter", "ilp"]
      },
      {
        id: "arch-pi-q5",
        type: "multi",
        prompt:
          "Select every technique that increases instruction-level parallelism.",
        options: [
          "Out-of-order execution",
          "Superscalar issue",
          "Speculative execution past branches",
          "Increasing the clock frequency",
          "Loop unrolling"
        ],
        correct: [0, 1, 2, 4],
        explanation:
          "ILP is about issuing more independent work per cycle. Raising the clock does not change how much parallelism is exposed — it makes each cycle shorter, which is a different axis entirely.",
        walkthroughSteps: [
          "Out-of-order execution: run instructions as their operands become ready rather than in program order.",
          "Superscalar: issue several instructions per cycle from the same stream.",
          "Speculation: keep the pipeline fed past an unresolved branch, squashing on a misprediction.",
          "Loop unrolling: a compiler technique that exposes more independent instructions per iteration and reduces branch overhead.",
          "Clock frequency shortens a cycle but does not add parallelism, and is limited by power — which is precisely why the industry turned to multicore."
        ],
        tags: ["ilp", "superscalar", "speculation"]
      },
      {
        id: "arch-pi-q6",
        type: "single",
        prompt:
          "A 5-stage pipeline has a 2-cycle branch penalty and branches are 20% of instructions. With a 90% accurate predictor, what is the CPI contribution from branches?",
        options: ["0.04", "0.20", "0.40", "0.02"],
        correct: [0],
        explanation:
          "Only mispredictions cost: $0.20 \\times 0.10 \\times 2 = 0.04$ cycles per instruction. Improving the predictor to 95% would halve that to 0.02.",
        walkthroughSteps: [
          "Fraction of instructions that are branches: 0.20.",
          "Fraction of those mispredicted: $1 - 0.90 = 0.10$.",
          "Penalty per misprediction: 2 cycles.",
          "Contribution $= 0.20 \\times 0.10 \\times 2 = 0.04$ CPI.",
          "Add this to the base CPI. Note the sensitivity: deeper pipelines raise the penalty, which is why prediction accuracy matters far more in a 20-stage design than a 5-stage one."
        ],
        tags: ["branch-prediction", "cpi", "pipelining"]
      },
      {
        id: "arch-pi-q7",
        type: "single",
        prompt:
          "What problem does a **reorder buffer** solve in an out-of-order processor?",
        options: [
          "It allows results to be computed out of order but committed in program order, so exceptions and mispredictions stay precise",
          "It reorders memory accesses to improve cache locality",
          "It replaces the branch predictor",
          "It increases the number of architectural registers"
        ],
        correct: [0],
        explanation:
          "The ROB decouples execution order from commit order. Instructions execute as soon as operands are ready but retire in program order, so architectural state only ever reflects a consistent prefix — which is what makes precise exceptions and clean misprediction recovery possible.",
        walkthroughSteps: [
          "Out-of-order execution finishes instructions in whatever order the data flow allows.",
          "Writing architectural state in that order would make an exception's state incoherent — you could not say which instructions had completed.",
          "The ROB holds results in program order and commits from the head, so state advances as a clean prefix.",
          "On a misprediction or exception, everything after the offending entry is squashed by flushing the ROB.",
          "This is what 'precise exceptions' means, and it is why speculation is safe."
        ],
        tags: ["ilp", "reorder-buffer", "precise-exceptions"]
      },
      {
        id: "arch-pi-q8",
        type: "free",
        prompt:
          "A processor has a 32 KB L1 with a 1-cycle hit and a 2% miss rate, a 256 KB L2 with a 10-cycle hit and a 20% local miss rate, and a 100-cycle memory access. Compute the average memory access time and explain each term.",
        explanation:
          "Multi-level AMAT: $\\text{AMAT} = t_{L1} + m_{L1}(t_{L2} + m_{L2} \\cdot t_{mem})$.",
        sampleAnswer:
          "AMAT $= 1 + 0.02 \\times (10 + 0.20 \\times 100) = 1 + 0.02 \\times 30 = 1.6$ cycles. The 1 is the L1 hit time, paid on every access. The 0.02 weights the rest by how often L1 misses. Inside the parentheses, 10 is the L2 hit time paid on every L1 miss, and $0.20 \\times 100 = 20$ is the expected memory cost, since only 20% of L2 accesses miss. Note the 20% is a *local* miss rate — relative to accesses reaching L2 — so the global miss-to-memory rate is $0.02 \\times 0.20 = 0.4\\%$.",
        hintSteps: [
          "Write the recursive form first: hit time plus miss rate times miss penalty, where the penalty is itself an AMAT.",
          "Be careful which miss rate you are given — local (relative to accesses that reach this level) or global (relative to all accesses).",
          "Every access pays the L1 hit time, even the ones that miss.",
          "Work from the innermost level outwards."
        ],
        walkthroughSteps: [
          "General form: $\\text{AMAT} = \\text{hit time} + \\text{miss rate} \\times \\text{miss penalty}$, applied recursively.",
          "Innermost: an L2 miss costs 100 cycles, and 20% of L2 accesses miss, contributing $0.20 \\times 100 = 20$ cycles.",
          "L2 level: every access that reaches L2 pays its 10-cycle hit time, so the L1 miss penalty is $10 + 20 = 30$ cycles.",
          "L1 level: every access pays 1 cycle, and 2% additionally pay the 30-cycle penalty.",
          "AMAT $= 1 + 0.02 \\times 30 = 1.6$ cycles.",
          "Sanity check the leverage: halving the L1 miss rate to 1% gives 1.3 cycles, while halving memory latency to 50 only gives 1.4 — so the cache hierarchy matters more than raw memory speed here.",
          "Distinguish local from global miss rates explicitly; mixing them is the most common arithmetic error on this topic."
        ],
        tags: ["caches", "amat", "memory-hierarchy"]
      }
    ]
  },
  {
    id: "arch-parallel-coherence",
    courseId: "computer-systems-architecture",
    title: "Multicore, Cache Coherence & Consistency",
    description:
      "Coherence protocols, the difference between coherence and consistency, false sharing, and how parallel speedup actually scales.",
    difficulty: "Advanced",
    estMinutes: 30,
    tags: ["cache-coherence", "memory-consistency", "multicore", "mesi"],
    timerDefaultMinutes: 28,
    questions: [
      {
        id: "arch-pc-q1",
        type: "single",
        prompt:
          "What is the difference between cache **coherence** and memory **consistency**?",
        options: [
          "Coherence concerns the order of operations to a single location; consistency concerns the order of operations across different locations",
          "They are two names for the same guarantee",
          "Coherence applies to writes and consistency applies to reads",
          "Consistency is a hardware property and coherence is a software one"
        ],
        correct: [0],
        explanation:
          "Coherence answers 'do all cores agree on the sequence of values at address X?'. Consistency answers 'in what order do accesses to *different* addresses become visible?'. A machine can be perfectly coherent and still allow surprising reorderings across locations.",
        walkthroughSteps: [
          "Coherence is per-location: writes to one address are serialised and every core eventually sees that order.",
          "Consistency is across locations: it constrains how a core's accesses to X and Y may be reordered as seen by others.",
          "Sequential consistency is the strongest common model — a single global interleaving preserving each thread's program order.",
          "Relaxed models (TSO, weak ordering) allow reordering for performance and expose memory fences to the programmer.",
          "The practical consequence: coherence is free to the programmer, consistency is not — lock-free code has to reason about the model explicitly."
        ],
        tags: ["cache-coherence", "memory-consistency", "definitions"]
      },
      {
        id: "arch-pc-q2",
        type: "single",
        prompt:
          "In the MESI protocol, what does the **Exclusive** state mean?",
        options: [
          "This cache holds the only cached copy and it is clean, so it can be written without notifying anyone",
          "This cache holds a modified copy that must be written back",
          "The line is shared with at least one other cache",
          "The line is invalid and must be refetched"
        ],
        correct: [0],
        explanation:
          "Exclusive means sole owner, unmodified. Its value is the optimisation: a write can silently transition E → M with no bus traffic, which matters because private data is written far more often than shared data.",
        walkthroughSteps: [
          "Modified: sole copy, dirty — memory is stale and this cache must write back.",
          "Exclusive: sole copy, clean — matches memory.",
          "Shared: possibly present in other caches, clean.",
          "Invalid: not usable.",
          "The E state is exactly what MSI lacks: without it, the first write to a privately-held clean line needs a bus upgrade, so MESI saves that transaction on the common case of thread-private data."
        ],
        tags: ["cache-coherence", "mesi", "protocol-states"]
      },
      {
        id: "arch-pc-q3",
        type: "single",
        prompt:
          "Two threads on different cores update two distinct variables that happen to sit in the same cache line. What is this, and what does it cost?",
        options: [
          "False sharing — the line ping-pongs between caches even though the threads never touch the same variable",
          "True sharing — unavoidable synchronisation cost",
          "A data race that requires a lock",
          "Nothing; distinct variables never interfere"
        ],
        correct: [0],
        explanation:
          "Coherence works at cache-line granularity, not variable granularity. Each write invalidates the other core's copy of the whole line, so the line bounces between caches and performance collapses without any logical sharing at all.",
        walkthroughSteps: [
          "Coherence tracks lines, typically 64 bytes — not individual variables.",
          "Core A writes its variable, invalidating the line in Core B's cache. Core B writes its own variable, invalidating A's. Repeat.",
          "There is no correctness bug — no data race, no lock needed — purely a performance pathology.",
          "The fix is layout: pad the variables into separate lines, or give each thread its own accumulator and combine at the end.",
          "It shows up as parallel code that gets *slower* with more threads, which is the diagnostic signature."
        ],
        tags: ["cache-coherence", "false-sharing", "performance"]
      },
      {
        id: "arch-pc-q4",
        type: "single",
        prompt:
          "A program is 95% parallelisable. By Amdahl's law, what is the maximum speedup on infinitely many cores?",
        options: ["20×", "95×", "19×", "Unbounded"],
        correct: [0],
        explanation:
          "The serial 5% bounds everything: $S_{\\max} = 1/(1 - 0.95) = 20$. Beyond about 20 cores the returns are negligible, which is Amdahl's warning about strong scaling.",
        walkthroughSteps: [
          "$S(n) = \\dfrac{1}{(1-p) + p/n}$ with $p = 0.95$.",
          "As $n \\to \\infty$ the term $p/n \\to 0$, leaving $S_{\\max} = 1/(1-p) = 1/0.05 = 20$.",
          "At 20 cores you already get $1/(0.05 + 0.0475) \\approx 10.3$ — about half the ceiling.",
          "This is *strong* scaling: fixed problem size, more cores.",
          "Gustafson's law offers the counterpoint — if the problem grows with the machine, the serial fraction shrinks in relative terms and scaling looks far better."
        ],
        tags: ["amdahl", "parallelism", "scaling"]
      },
      {
        id: "arch-pc-q5",
        type: "multi",
        prompt:
          "Which are genuine reasons a directory-based coherence protocol is used instead of snooping in large systems?",
        options: [
          "Snooping broadcasts to every cache, and the bus bandwidth becomes the bottleneck",
          "A directory tracks which caches hold a line, so invalidations are sent point-to-point",
          "Directories scale to interconnects with no shared bus",
          "Directories eliminate the need for coherence entirely",
          "Directories require less storage than snooping"
        ],
        correct: [0, 1, 2],
        explanation:
          "Directories scale because they replace broadcast with targeted messages and do not assume a shared bus. They do not remove the need for coherence, and they cost *more* storage — the directory itself is state proportional to memory.",
        walkthroughSteps: [
          "Snooping requires every cache to observe every transaction, which needs a broadcast medium.",
          "Broadcast traffic grows with core count, so the interconnect saturates.",
          "A directory records, per line, which caches have a copy and in what state.",
          "Invalidations then go only to the sharers — point-to-point over any topology, no bus required.",
          "The cost is directory storage and an extra indirection in latency, so it is a scalability trade, not a free win."
        ],
        tags: ["cache-coherence", "directory-protocol", "scalability"]
      },
      {
        id: "arch-pc-q6",
        type: "single",
        prompt:
          "Under sequential consistency, which reordering is a processor allowed to perform?",
        options: [
          "None that is observable — every core must appear to execute its own accesses in program order, interleaved into one global order",
          "Any reordering, since SC only constrains a single core",
          "Reordering of writes only",
          "Reordering of reads only"
        ],
        correct: [0],
        explanation:
          "Sequential consistency requires a single total order over all memory operations that is consistent with each thread's program order. Hardware may reorder internally, but nothing observable may violate that — which is why SC costs performance and why real machines relax it.",
        walkthroughSteps: [
          "Lamport's definition: the result is as if operations executed in some sequential order, with each processor's operations in the order its program specifies.",
          "The 'as if' matters — speculation and buffering are fine so long as no observer can tell.",
          "Common hardware relaxations break exactly this: TSO lets a store buffer delay a write past a later read.",
          "That relaxation is what makes Dekker's algorithm fail on real hardware without a fence.",
          "Memory fences let the programmer buy back the ordering where it is actually needed, rather than paying for it everywhere."
        ],
        tags: ["memory-consistency", "sequential-consistency", "reordering"]
      },
      {
        id: "arch-pc-q7",
        type: "single",
        prompt:
          "What does the roofline model tell you about a kernel with low arithmetic intensity?",
        options: [
          "It is memory-bandwidth bound, so more FLOPs of compute capability will not help",
          "It is compute bound and needs a faster clock",
          "It will scale linearly with core count",
          "It has too many cache misses to model"
        ],
        correct: [0],
        explanation:
          "Arithmetic intensity is FLOPs per byte moved. Low intensity puts the kernel on the sloped part of the roofline, where performance is capped by bandwidth — the fix is improving data reuse, not adding compute.",
        walkthroughSteps: [
          "Plot attainable FLOP/s against arithmetic intensity: a bandwidth-limited slope rising to a flat compute ceiling.",
          "The ridge point is where the two limits meet.",
          "Left of the ridge, performance $=$ intensity $\\times$ bandwidth, so only more reuse or more bandwidth helps.",
          "Right of the ridge, you are compute bound and peak FLOP/s is the limit.",
          "Practical use: blocking and tiling raise arithmetic intensity, moving a kernel rightwards toward the compute ceiling. Adding cores to a bandwidth-bound kernel usually does nothing."
        ],
        tags: ["roofline", "performance-models", "bandwidth"]
      },
      {
        id: "arch-pc-q8",
        type: "free",
        prompt:
          "Explain why a spin lock implemented with a plain test-and-set performs badly on a multicore machine, and describe test-and-test-and-set as the fix.",
        explanation:
          "Plain test-and-set writes on every spin attempt, so every waiter invalidates the line each iteration and the interconnect saturates. TTAS spins on a read until the lock looks free.",
        sampleAnswer:
          "A plain `while (test_and_set(&lock)) ;` performs an atomic read-modify-write on every iteration. A write requires exclusive ownership of the cache line, so each waiting core invalidates every other copy on every spin — with $n$ waiters the line ping-pongs continuously and coherence traffic grows with $n$, slowing even the core holding the lock. Test-and-test-and-set spins on an ordinary read instead: `while (lock || test_and_set(&lock)) ;`. Reads leave the line in Shared state in every waiter's cache, generating no coherence traffic at all, and the expensive atomic is attempted only when the lock appears free. Adding exponential backoff reduces the thundering herd when it is released, and a queue lock such as MCS removes the contention entirely by having each waiter spin on its own private location.",
        hintSteps: [
          "Ask what a test-and-set does to the cache line — is it a read or a write?",
          "Then ask what a write does to every other core's copy of that line under MESI.",
          "Count the coherence transactions per spin iteration as the number of waiters grows.",
          "The fix keeps the atomic but stops performing it on every iteration — what cheaper operation can screen for it?"
        ],
        walkthroughSteps: [
          "Test-and-set is an atomic read-modify-write, so it needs the line in Modified state — exclusive ownership.",
          "Every spinning core therefore issues a write on every iteration, invalidating all other copies.",
          "With $n$ waiters, that is $O(n)$ invalidations per iteration and the interconnect saturates.",
          "The lock holder is slowed too, because its own memory accesses now contend with the storm — so contention makes the critical section longer, which makes contention worse.",
          "TTAS: spin on a plain load, which leaves the line Shared in every cache and generates no traffic once loaded.",
          "Only when the read shows the lock free does a core attempt the atomic, so the expensive operation happens roughly once per genuine release.",
          "Exponential backoff further reduces the burst of simultaneous attempts at release time.",
          "MCS or CLH queue locks are the scalable answer: each waiter spins on its own cache line, giving O(1) traffic per handoff regardless of waiter count."
        ],
        tags: ["synchronisation", "spin-lock", "cache-coherence"]
      }
    ]
  }
];
