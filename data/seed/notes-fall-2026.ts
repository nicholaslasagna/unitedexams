/**
 * Notes and cheat sheets for the classes added in Fall 2026.
 *
 * Kept in their own file so notes.ts does not keep growing without bound;
 * the map in notes.ts spreads these in.
 *
 * Format follows the existing notes: a topic map first, then the material
 * organised the way an exam tests it, with the solve patterns spelled out.
 * The cheat sheets are deliberately terse — the thing you would actually
 * want on one page the morning of.
 */

export const algorithmsNotes = `## Analysis of Algorithms — Master Notes

Built around the standard graduate algorithms sequence: prove the cost, then
choose the paradigm that fits the structure.

> **What exams actually test:** setting up and solving recurrences, choosing
> between greedy and DP with a *justification*, graph algorithm selection,
> and reductions for NP-hardness. Memorised algorithm listings score poorly;
> arguments score well.

## A. Asymptotics

### Definitions worth stating precisely

  - $f = O(g)$: $\\exists c, n_0$ such that $f(n) \\le c\\,g(n)$ for $n \\ge n_0$. An **upper** bound, not necessarily tight.
  - $f = \\Omega(g)$: same with $\\ge$. A **lower** bound.
  - $f = \\Theta(g)$: both. The tight bound.
  - $f = o(g)$: $\\lim f/g = 0$. Strictly smaller.

**The trap.** Upper/lower bound and best/worst case are independent axes. You
can give a $\\Omega$ bound on a worst case, or an $O$ bound on a best case.
Insertion sort is $O(n^2)$ worst case *and* $\\Theta(n)$ best case.

### Growth order to have memorised

$$1 \\prec \\log n \\prec \\sqrt{n} \\prec n \\prec n\\log n \\prec n^2 \\prec n^3 \\prec 2^n \\prec n!$$

## B. Recurrences

### Master theorem

For $T(n) = aT(n/b) + f(n)$ with $a \\ge 1$, $b > 1$, compare $f(n)$ against
the watershed $n^{\\log_b a}$:

  1. $f(n) = O(n^{\\log_b a - \\varepsilon})$ → $T(n) = \\Theta(n^{\\log_b a})$ — leaves dominate.
  2. $f(n) = \\Theta(n^{\\log_b a})$ → $T(n) = \\Theta(n^{\\log_b a}\\log n)$ — every level equal.
  3. $f(n) = \\Omega(n^{\\log_b a + \\varepsilon})$ **and** $af(n/b) \\le cf(n)$ for some $c<1$ → $T(n) = \\Theta(f(n))$ — root dominates.

**Solve pattern**

  - Read off $a$, $b$, $f(n)$.
  - Compute $n^{\\log_b a}$.
  - Compare. If the ratio is only a $\\log$ factor, you are in the **gap** — the master theorem does not apply and you must use a recursion tree.
  - For case 3, *check the regularity condition*; it is the step most people skip.

### Standard results

| Recurrence | Solution | Where it comes from |
| --- | --- | --- |
| $T(n) = 2T(n/2) + \\Theta(n)$ | $\\Theta(n\\log n)$ | merge sort |
| $T(n) = T(n/2) + \\Theta(1)$ | $\\Theta(\\log n)$ | binary search |
| $T(n) = 7T(n/2) + \\Theta(n^2)$ | $\\Theta(n^{\\log_2 7})$ | Strassen |
| $T(n) = 2T(n/2) + n\\log n$ | $\\Theta(n\\log^2 n)$ | gap case, use a tree |
| $T(n) = T(n/3) + T(2n/3) + n$ | $\\Theta(n\\log n)$ | unbalanced split |

### Recursion trees

Use when the master theorem fails. Work per level, number of levels, sum.
For an unbalanced split, sandwich between the shortest and longest path —
if both are $\\Theta(\\log n)$ the bound is tight.

## C. Greedy vs dynamic programming

Both need **optimal substructure**. The difference:

  - **Greedy** additionally needs the *greedy-choice property* — the locally best choice is part of some global optimum. Solves one chain of subproblems, never revisits.
  - **DP** is for **overlapping subproblems** — the same subproblem recurs, so memoise.

**Proving greedy correct.** Exchange argument: take any optimal solution,
swap in the greedy choice, show the result is still feasible and no worse.
Then induct on the remainder.

### Canonical problems

  - Greedy: activity selection (earliest finish), Huffman coding, MST (Kruskal/Prim), Dijkstra, fractional knapsack.
  - DP: 0/1 knapsack, LCS, edit distance, matrix-chain order, Floyd–Warshall, Bellman–Ford.

**0/1 knapsack is $\\Theta(nW)$ — pseudo-polynomial.** $W$ is written in
$\\log W$ bits, so the runtime is exponential in input *size*. This is why it
being NP-hard is not a contradiction.

## D. Graphs

| Problem | Algorithm | Time | Notes |
| --- | --- | --- | --- |
| Single-source, non-negative | Dijkstra | $O((V+E)\\log V)$ | binary heap |
| Single-source, negative allowed | Bellman–Ford | $O(VE)$ | detects negative cycles |
| All-pairs | Floyd–Warshall | $O(V^3)$ | DP over intermediate vertices |
| MST | Kruskal | $O(E\\log E)$ | sort dominates; union-find |
| MST | Prim | $O(E\\log V)$ | better on dense graphs |
| Topological order | DFS finish times | $O(V+E)$ | DAGs only |

**Why Dijkstra needs non-negative weights.** It finalises a vertex on
extraction and never reconsiders it. A negative edge can make a
later-discovered path cheaper, breaking that invariant.

## E. NP-completeness

  - **P**: solvable in polynomial time.
  - **NP**: a certificate is *verifiable* in polynomial time.
  - **NP-hard**: at least as hard as everything in NP.
  - **NP-complete**: in NP **and** NP-hard.

**Direction of a reduction — the most commonly failed step.** To show $X$ is
NP-hard you reduce a known-hard problem **to** $X$: $A \\le_p X$. Reducing
$X$ to something hard proves nothing.

**Solve pattern for a hardness proof**

  - Pick a known NP-complete problem close in structure (3-SAT, vertex cover, subset sum, Hamiltonian cycle).
  - Give a polynomial-time mapping from arbitrary instances of $A$ into instances of $X$.
  - Prove both directions: yes maps to yes, and no maps to no.
  - For NP-completeness, also exhibit a polynomial-time verifiable certificate for $X$.
`;

export const algorithmsCheatSheet = `## Analysis of Algorithms — One Page

### Master theorem
$T(n) = aT(n/b) + f(n)$, watershed $n^{\\log_b a}$

  - $f$ smaller by $n^{\\varepsilon}$ → $\\Theta(n^{\\log_b a})$
  - $f$ equal → $\\Theta(n^{\\log_b a}\\log n)$
  - $f$ larger by $n^{\\varepsilon}$ **and** regularity → $\\Theta(f(n))$
  - Ratio only $\\log n$ → **gap**, use a recursion tree

### Must-know recurrences
$2T(n/2)+n \\Rightarrow n\\log n$ · $T(n/2)+1 \\Rightarrow \\log n$ ·
$7T(n/2)+n^2 \\Rightarrow n^{2.81}$ · $2T(n/2)+n\\log n \\Rightarrow n\\log^2 n$

### Sorting
| | Best | Avg | Worst | Space |
| --- | --- | --- | --- | --- |
| Merge | $n\\log n$ | $n\\log n$ | $n\\log n$ | $O(n)$ |
| Quick | $n\\log n$ | $n\\log n$ | $n^2$ | $O(\\log n)$ |
| Heap | $n\\log n$ | $n\\log n$ | $n\\log n$ | $O(1)$ |

Comparison lower bound $\\Omega(n\\log n)$ from $\\log_2(n!)$ — decision tree.

### Greedy vs DP
Greedy = optimal substructure **+ greedy-choice**, prove by exchange.
DP = optimal substructure **+ overlapping subproblems**, memoise.

### Graph algorithms
Dijkstra $O((V+E)\\log V)$, non-negative only ·
Bellman–Ford $O(VE)$, negatives OK ·
Floyd–Warshall $O(V^3)$ ·
Kruskal $O(E\\log E)$ + union-find ·
Prim $O(E\\log V)$

### NP-hardness
$A \\le_p X$ with $A$ known hard. **Known-hard TO your problem.**
NP-complete = in NP + NP-hard.

### Exam habits
State complexity unprompted · name the brute force before discarding it ·
check the regularity condition in case 3 · dry-run one small input by hand.
`;

export const databaseNotes = `## Concepts of Database Systems — Master Notes

> **What exams actually test:** turning requirements into a normalised
> schema, SQL semantics under NULLs and grouping, functional dependencies
> and decomposition, and the ACID/isolation vocabulary applied to a scenario.

## A. The relational model

  - **Relation** = table, **tuple** = row, **attribute** = column, **domain** = the column's type.
  - **Superkey**: uniquely identifies a row. **Candidate key**: a *minimal* superkey. **Primary key**: the candidate key you designate.
  - A relation can have several candidate keys. The ones you did not pick still need UNIQUE constraints, or the database permits duplicates your model forbids.
  - **Foreign key**: references a candidate key in another relation. Referential integrity means it either matches or is NULL.

### ER to relational

| ER construct | Becomes |
| --- | --- |
| Entity | A relation, keyed on its identifier |
| 1:1 | Foreign key on either side (pick the mandatory one) |
| 1:N | Foreign key on the **N** side |
| M:N | A **junction relation** with an FK to each side |
| Multivalued attribute | Its own relation |
| Weak entity | Relation keyed on (owner key, discriminator) |

**Relationship attributes** — a grade, an enrolment date — belong on the
junction relation, not on either entity.

## B. Relational algebra

Primitives: $\\sigma$ (select), $\\pi$ (project), $\\cup$, $-$, $\\times$, $\\rho$ (rename).

Derived: $\\bowtie$ (natural join) $= \\pi(\\sigma_{\\text{match}}(R \\times S))$,
and $R \\cap S = R - (R - S)$.

Knowing which are primitive matters for expressive-power questions — for
instance, that relational algebra cannot express transitive closure.

## C. SQL semantics

### Logical evaluation order

$$\\text{FROM} \\to \\text{WHERE} \\to \\text{GROUP BY} \\to \\text{HAVING} \\to \\text{SELECT} \\to \\text{ORDER BY}$$

Everything confusing about SQL follows from this order:

  - \`WHERE\` cannot see aggregates — groups do not exist yet.
  - \`HAVING\` can, and is the only place an aggregate condition is legal.
  - \`SELECT\` aliases are generally not visible in \`WHERE\` or \`HAVING\`.

### NULL — three-valued logic

  - Any comparison with NULL is **UNKNOWN**, not TRUE or FALSE.
  - \`WHERE\` keeps only TRUE, so \`= NULL\` matches nothing. Use \`IS NULL\`.
  - \`COUNT(col)\` skips NULLs; \`COUNT(*)\` counts rows. They disagree exactly when NULLs are present.
  - \`x NOT IN (1, NULL)\` is UNKNOWN — so a single NULL in the subquery empties the result. Prefer \`NOT EXISTS\`.

### Joins

  - \`INNER\`: matches only.
  - \`LEFT\`: all left rows, right columns NULL-padded when unmatched.
  - **Trap:** a \`WHERE\` condition on a right-hand column silently converts a LEFT JOIN back into an INNER JOIN, because NULL fails the comparison. Put it in the \`ON\` clause instead.

### Anti-join (rows with no match)

Two safe forms: \`LEFT JOIN ... WHERE right.key IS NULL\`, or \`NOT EXISTS\`.
\`NOT IN\` is the unsafe third.

## D. Normalisation

| Form | Requires |
| --- | --- |
| 1NF | Atomic values, no repeating groups |
| 2NF | 1NF + no non-key attribute depends on **part** of a composite key |
| 3NF | 2NF + no non-key attribute depends on another **non-key** attribute |
| BCNF | Every non-trivial determinant is a **superkey** |

**Solve pattern**

  - Compute attribute closures to find the candidate keys.
  - Mark prime attributes (those in some candidate key).
  - Check each FD: is the left side a superkey? If not, is the right side prime?
  - Decompose along the offending dependency. Check the lossless-join condition: the shared attributes must be a key of at least one fragment.

**Tradeoff worth stating:** a BCNF decomposition is always lossless but may
not preserve every dependency. A 3NF decomposition can always be both.

## E. Transactions

**ACID**

  - **Atomicity** — all or nothing.
  - **Consistency** — constraints hold before and after.
  - **Isolation** — concurrent transactions do not see each other's partial work.
  - **Durability** — committed survives a crash, via write-ahead logging.

**Isolation levels and what each still permits**

| Level | Dirty read | Non-repeatable | Phantom |
| --- | --- | --- | --- |
| READ UNCOMMITTED | yes | yes | yes |
| READ COMMITTED | no | yes | yes |
| REPEATABLE READ | no | no | yes |
| SERIALIZABLE | no | no | no |

**Two-phase locking** — grow then shrink, never acquire after the first
release — guarantees conflict-serialisable schedules but *not* deadlock
freedom. Strict 2PL holds exclusive locks to commit, which also avoids
cascading aborts.

## F. Indexing

  - B-tree index turns a scan into $O(\\log n)$ for matching predicates.
  - Costs: slower writes (every index is maintained), plus storage.
  - **Low cardinality is the weak case** — a boolean index matches half the table and the optimiser will scan anyway.
  - **Leftmost prefix**: an index on (a, b) serves \`a\` and \`a AND b\`, but not \`b\` alone.
`;

export const databaseCheatSheet = `## Database Systems — One Page

### SQL evaluation order
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
\`WHERE\` = rows, before grouping · \`HAVING\` = groups, after aggregation

### NULL rules
\`= NULL\` never matches → use \`IS NULL\` ·
\`COUNT(col)\` skips NULLs, \`COUNT(*)\` does not ·
\`NOT IN\` + any NULL ⇒ empty result → use \`NOT EXISTS\`

### Joins
LEFT JOIN pads unmatched right columns with NULL.
A \`WHERE\` on a right column turns LEFT back into INNER — put it in \`ON\`.
Anti-join: \`LEFT JOIN … WHERE r.key IS NULL\` or \`NOT EXISTS\`.

### Normal forms
1NF atomic · 2NF no partial dependency on a composite key ·
3NF no transitive (non-key → non-key) · BCNF every determinant is a superkey

Lossless join: shared attributes must be a key of one fragment.
BCNF always lossless, may lose a dependency. 3NF can keep both.

### ER → relational
1:N → FK on the N side · M:N → junction table ·
relationship attributes live on the junction

### ACID
Atomicity · Consistency · Isolation · Durability (write-ahead log)

### Isolation
READ COMMITTED still allows non-repeatable reads.
REPEATABLE READ still allows phantoms.
SERIALIZABLE allows none.

### 2PL
Grow then shrink. Gives serialisability, **not** deadlock freedom.

### Indexes
Faster reads, slower writes, more storage.
Bad on low cardinality. Leftmost prefix only: (a,b) serves \`a\`, not \`b\`.
`;

export const osNotes = `## Operating Systems — Master Notes

> **What exams actually test:** scheduling arithmetic, the concurrency
> vocabulary applied to a scenario, the four deadlock conditions, and
> address-translation and page-replacement calculations.

## A. Processes and threads

**Process** = program in execution, with its own address space.
**Thread** = a unit of execution inside a process.

| Per thread | Shared across threads |
| --- | --- |
| Stack | Code |
| Registers, PC | Heap |
| Thread-local storage | Globals / statics |
| | Open file descriptors |

The shared heap is what makes threads cheap to communicate through, and
exactly what makes them dangerous.

### Context switch

Save the running process's registers, PC and stack pointer into its **PCB**,
load the next one's, switch the page-table base register. Memory is never
copied. The real cost is the cold cache and flushed TLB afterwards.

### fork()

Returns **twice**: the child's PID in the parent, **0** in the child, $-1$ on
failure. Modern kernels use copy-on-write, so the address space is shared
read-only until one side writes.

## B. CPU scheduling

| Policy | Preemptive | Strength | Weakness |
| --- | --- | --- | --- |
| FCFS | no | trivial | convoy effect |
| SJF | optional | optimal average wait | bursts unknown; starvation |
| Round-robin | yes | fair, responsive | quantum tuning |
| Priority | optional | matches importance | starvation without ageing |
| Multilevel feedback | yes | adapts to behaviour | many parameters |

**Solve pattern for scheduling arithmetic**

  - Draw the Gantt chart first. Do not try to do it in your head.
  - Waiting time = start − arrival (summed over runs if preempted).
  - Turnaround = completion − arrival = waiting + burst.
  - Then average.

**Convoy effect.** Under FCFS one long job in front inflates everyone's wait.
Bursts 100, 2, 2 give an average wait of 67.3; reversed, 2. Same work.

**Round-robin limits.** Quantum → ∞ degenerates to FCFS. Quantum → 0 is all
overhead. Rule of thumb: ~80% of bursts should finish within one quantum.

## C. Synchronisation

**Race condition**: the result depends on the interleaving.
**Critical section**: code that must not run concurrently.

Requirements for a correct solution: **mutual exclusion**, **progress**,
**bounded waiting**.

  - **Mutex**: ownership; only the locker unlocks.
  - **Semaphore**: a counter; \`wait\`/\`signal\` must be **atomic**, which needs a hardware primitive (test-and-set, compare-and-swap) — not another software lock.
  - **Monitor**: mutual exclusion plus condition variables, enforced by the language.

**Spin locks on multicore.** A plain test-and-set writes every iteration, so
every waiter invalidates the cache line each spin. Use
**test-and-test-and-set** — spin on a read, attempt the atomic only when the
lock looks free — plus backoff, or a queue lock (MCS) where each waiter
spins on its own line.

## D. Deadlock

**Coffman's four conditions, all required simultaneously**

  1. Mutual exclusion
  2. Hold and wait
  3. No preemption
  4. Circular wait

Prevention = design one away (a global lock ordering kills circular wait).
Avoidance = Banker's algorithm, needs maximum claims declared in advance.
Detection = find a cycle in the wait-for graph, then abort a victim.

**Starvation is not deadlock.** A starving process is runnable but never
chosen; a deadlocked one cannot run at all.

## E. Virtual memory

### Address translation

Page size $2^k$ ⇒ offset is $k$ bits. The rest is the page number.

*Example:* 32-bit address, 4 KB pages ⇒ 12 offset bits, 20 page-number bits,
so a single-level table has $2^{20}$ entries — 4 MB per process at 4 bytes
each. Hence multi-level tables.

### TLB

Caches recent translations. Without one, every reference needs a second
reference to read the page table.

$$\\text{EAT} = h(t_{\\text{TLB}} + t_{\\text{mem}}) + (1-h)(t_{\\text{TLB}} + 2t_{\\text{mem}})$$

*Example:* $h = 0.95$, 1 ns TLB, 100 ns memory ⇒
$0.95(101) + 0.05(201) = 106$ ns, about 6% overhead.

### Page replacement

  - **FIFO** — simple, suffers **Belady's anomaly** (more frames can mean more faults).
  - **LRU** — a stack algorithm, so immune to Belady; needs approximation in hardware (reference bits, clock).
  - **OPT** — evict the page used furthest in the future. Unimplementable, used as the benchmark.

**Thrashing**: resident set smaller than the working set, so nearly every
access faults. CPU utilisation collapses, and a naive scheduler that admits
more processes makes it worse. Fix with working-set or page-fault-frequency
allocation.
`;

export const osCheatSheet = `## Operating Systems — One Page

### Thread vs process
Per thread: stack, registers, PC. Shared: code, heap, globals, file descriptors.

### fork()
Parent gets child PID · child gets 0 · $-1$ on failure · copy-on-write

### Scheduling
Draw the Gantt chart. Waiting = start − arrival. Turnaround = completion − arrival.

FCFS → convoy effect · SJF → optimal average wait, bursts unknown ·
RR → quantum ∞ = FCFS, quantum 0 = all overhead · Priority → needs ageing

### Deadlock — all four required
Mutual exclusion · Hold and wait · No preemption · Circular wait
Break one to prevent. Banker's = avoidance. Wait-for cycle = detection.
Starvation ≠ deadlock.

### Synchronisation
Mutex has ownership; semaphore is a counter.
Semaphore ops must be atomic → hardware test-and-set / CAS.
Spin locks: use test-and-**test**-and-set, else the line ping-pongs.

### Address translation
Page $2^k$ ⇒ $k$ offset bits. 32-bit + 4 KB ⇒ 20-bit VPN ⇒ $2^{20}$ entries.

### TLB effective access time
$\\text{EAT} = h(t_{TLB} + t_{mem}) + (1-h)(t_{TLB} + 2t_{mem})$
95%, 1 ns, 100 ns ⇒ **106 ns**

### Page replacement
FIFO — Belady's anomaly · LRU — stack algorithm, immune · OPT — benchmark only
Thrashing = working set > frames. More processes makes it worse.
`;

export const architectureGradNotes = `## Graduate Architecture — Performance, ILP & Multicore

Supplements the RISC-V and 5-stage pipeline notes with the quantitative and
parallel material.

## A. Performance equations

$$\\text{CPU time} = \\text{IC} \\times \\text{CPI} \\times \\text{clock period}$$

Each factor belongs to a different layer: **IC** to the compiler and ISA,
**CPI** to the microarchitecture, **clock rate** to the technology. Comparing
processors on clock rate alone is meaningless.

**Amdahl's law**

$$S = \\frac{1}{(1-f) + f/s}, \\qquad S_{\\max} = \\frac{1}{1-f}$$

*Example:* 40% of a program made 4× faster ⇒ $1/(0.6 + 0.1) = 1.43\\times$.
Even $s \\to \\infty$ only reaches $1.67\\times$. Optimise the common case.

**Gustafson's counterpoint:** if the problem grows with the machine, the
serial fraction shrinks in relative terms and scaling looks far better.
Amdahl describes *strong* scaling, Gustafson *weak* scaling.

## B. Instruction-level parallelism

### Hazards

  - **Structural** — resource conflict. Fix with more hardware.
  - **Data** — RAW is a true dependency and unavoidable. **WAR/WAW are name dependencies** and are removed by register renaming.
  - **Control** — branches. Fix with prediction and speculation.

### Techniques

  - **Out-of-order execution** — issue when operands are ready.
  - **Register renaming** — map each write to a fresh physical register, killing WAR/WAW.
  - **Reorder buffer** — execute out of order, **commit in order**, so exceptions stay precise and mispredictions can be squashed cleanly.
  - **Superscalar** — several instructions issued per cycle.
  - **Speculation** — run past an unresolved branch, squash on a miss.

Raising the clock is *not* an ILP technique — it shortens the cycle, a
different axis, and is power-limited. That limit is why the industry turned
to multicore.

### Branch prediction

2-bit saturating counter: strongly taken → weakly taken → weakly not-taken →
strongly not-taken. **Two** consecutive misses are needed to flip the
prediction — hysteresis, so a loop's single exit costs one misprediction
rather than two.

Branch CPI contribution $=$ branch frequency $\\times$ misprediction rate
$\\times$ penalty.
*Example:* $0.20 \\times 0.10 \\times 2 = 0.04$ CPI.

## C. Memory hierarchy

$$\\text{AMAT} = t_{\\text{hit}} + m \\times \\text{penalty}$$

applied recursively for multi-level caches. **Watch local vs global miss
rates** — a level's miss rate is normally quoted relative to the accesses
that *reach* it.

*Example:* L1 1 cycle / 2% miss, L2 10 cycles / 20% local miss, memory 100 ⇒
$1 + 0.02(10 + 0.2 \\times 100) = 1.6$ cycles.

**Roofline.** Arithmetic intensity = FLOPs per byte moved. Left of the ridge
point you are bandwidth bound and only more reuse helps; right of it you are
compute bound. Tiling and blocking raise intensity and move a kernel right.

## D. Coherence vs consistency

These are different questions and are constantly confused:

  - **Coherence** — do all cores agree on the order of writes to *one* location? Handled in hardware, invisible to the programmer.
  - **Consistency** — in what order do accesses to *different* locations become visible? Exposed to the programmer through fences.

### MESI

| State | Meaning |
| --- | --- |
| **M**odified | Sole copy, dirty; memory is stale |
| **E**xclusive | Sole copy, clean |
| **S**hared | May exist elsewhere, clean |
| **I**nvalid | Unusable |

The **E** state is what MSI lacks: a write to a privately-held clean line
goes E → M with no bus traffic, which is the common case for thread-private
data.

**False sharing.** Two threads writing *different* variables in the same
cache line. No data race, no lock needed — purely a performance collapse,
because coherence works at line granularity. Fix by padding to separate
lines. The signature is parallel code that gets slower with more threads.

### Consistency models

  - **Sequential consistency** — one global interleaving preserving each thread's program order. Strongest, slowest.
  - **TSO** — allows a store buffer to delay a write past a later read. This is why Dekker's algorithm fails on real hardware without a fence.
  - **Weak ordering** — reorders freely between fences.

### Snooping vs directories

Snooping broadcasts and needs a shared bus, so it stops scaling. A
**directory** records which caches hold each line and sends invalidations
point-to-point over any topology — at the cost of directory storage and an
extra indirection.
`;

export const architectureGradCheatSheet = `## Graduate Architecture — One Page

### Performance
CPU time = IC × CPI × clock period
Amdahl $S = 1/((1-f) + f/s)$, ceiling $1/(1-f)$
40% at 4× ⇒ 1.43× · 95% parallel ⇒ 20× max

### Hazards
Structural → more hardware · RAW → true, unavoidable ·
**WAR/WAW → renaming** · Control → predict + speculate

### ILP
Out-of-order · renaming · reorder buffer (commit **in order** ⇒ precise
exceptions) · superscalar · speculation
Clock rate is *not* ILP.

### Branch prediction
2-bit counter needs **two** misses to flip.
CPI cost = freq × mispredict rate × penalty

### AMAT
$t_{hit} + m \\times \\text{penalty}$, recursive.
L1 1/2%, L2 10/20%, mem 100 ⇒ $1 + 0.02(10 + 20) = 1.6$
**Local vs global miss rate — check which is quoted.**

### Coherence vs consistency
Coherence = one location, hardware, invisible.
Consistency = across locations, exposed via fences.

### MESI
M dirty sole · E clean sole (write is free) · S shared clean · I invalid
False sharing = different variables, same line. Pad them.

### Consistency models
SC = one global order · TSO = store buffer delays writes past reads ·
weak = reorder between fences

### Scaling
Snooping = broadcast, needs a bus, stops scaling.
Directory = point-to-point, costs storage.
Roofline: low arithmetic intensity ⇒ bandwidth bound, more FLOPs will not help.
`;
