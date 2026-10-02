import type { Question } from "@/lib/types";

// Each chapter starts with eight timed-mock questions and one guided written item.
export const schedulingQuestions: Question[] = [
  {
    id: "os-e1-c5-01", type: "single",
    prompt: "____ is the number of processes that are completed per time unit.",
    options: ["CPU utilization", "Response time", "Turnaround time", "Throughput"], correct: [3],
    explanation: "Throughput counts completed processes per unit time. Utilization is the fraction of time the CPU is busy; the other two choices measure elapsed time for a request.",
    references: ["Ch5 CPU Scheduling.pdf, PDF page 5"], tags: ["chapter-5", "scheduling-criteria", "slide-exercise"]
  },
  {
    id: "os-e1-c5-02", type: "fill",
    prompt: "The slide's FCFS example has P1 = 24 ms, P2 = 3 ms, P3 = 3 ms. All arrive at time 0 in that order. Ignore context-switch cost. What is the average waiting time? Enter a number in ms.", correct: ["17", "17.0", "17.00"],
    explanation: "The waiting times are 0, 24 and 27 ms. Their average is (0 + 24 + 27)/3 = 17 ms.",
    hintSteps: ["Waiting ends when a process first receives the CPU in nonpreemptive FCFS."],
    walkthroughSteps: ["Draw P1 from 0 to 24, P2 from 24 to 27, P3 from 27 to 30.", "Subtract arrival time 0 from each start time: 0, 24, 27.", "Divide the sum 51 by 3 to get 17 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 6"], tags: ["chapter-5", "fcfs", "waiting-time", "slide-example"], difficulty: "med"
  },
  {
    id: "os-e1-c5-03", type: "fill",
    prompt: "Use nonpreemptive SJF on the slide's processes: P1 = 6 ms, P2 = 8 ms, P3 = 7 ms, P4 = 3 ms. All arrive at time 0; context-switch cost is zero. What is the average waiting time? Enter a number in ms.", correct: ["7", "7.0", "7.00"],
    explanation: "SJF runs P4, P1, P3, P2. Their waits in that order are 0, 3, 9, 16 ms, averaging 28/4 = 7 ms.",
    hintSteps: ["Sort the CPU bursts before drawing the Gantt chart."],
    walkthroughSteps: ["Sort bursts: P4 (3), P1 (6), P3 (7), P2 (8).", "Gantt chart: P4 0-3, P1 3-9, P3 9-16, P2 16-24.", "Waiting times are 0, 3, 9, 16; their average is 7 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 9"], tags: ["chapter-5", "sjf", "waiting-time", "slide-example"], difficulty: "med"
  },
  {
    id: "os-e1-c5-04", type: "fill",
    prompt: "The slide's round-robin example has quantum 4 ms and bursts P1 = 24 ms, P2 = 3 ms, P3 = 3 ms. All arrive at 0 in that order; ignore switch cost. What is the average waiting time, rounded to TWO decimal places? Enter a number in ms.", correct: ["5.67"],
    explanation: "Completion times are P1 = 30, P2 = 7, P3 = 10. Waiting = completion - arrival - burst gives 6, 4, 7 ms. The exact average is 17/3, which rounds to 5.67; the slide displays the truncated value 5.66.",
    hintSteps: ["Use total waiting time, including the waits between P1's quanta."],
    walkthroughSteps: ["Run P1 0-4, P2 4-7, P3 7-10, then P1's remaining 20 ms from 10 to 30.", "Waits: P1 = 30-24 = 6, P2 = 7-3 = 4, P3 = 10-3 = 7.", "Average = 17/3 = 5.666..., rounded to 5.67 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 13"], tags: ["chapter-5", "round-robin", "waiting-time", "slide-example"], difficulty: "hard"
  },
  {
    id: "os-e1-c5-05", type: "fill",
    prompt: "Use nonpreemptive priority scheduling; smaller priority numbers win. All arrive at 0 and switch cost is zero.\n\n| Process | Burst (ms) | Priority |\n|---|---:|---:|\n| P1 | 10 | 3 |\n| P2 | 1 | 1 |\n| P3 | 2 | 4 |\n| P4 | 1 | 5 |\n| P5 | 5 | 2 |\n\nWhat is the average waiting time? Enter a number in ms.", correct: ["8.2", "8.20"],
    explanation: "Order: P2, P5, P1, P3, P4. Waiting times in that order: 0, 1, 6, 16, 18; average = 41/5 = 8.2 ms.",
    hintSteps: ["Sort by priority rather than burst length."],
    walkthroughSteps: ["Priorities 1 through 5 give P2, P5, P1, P3, P4.", "Gantt chart: P2 0-1, P5 1-6, P1 6-16, P3 16-18, P4 18-19.", "Average the start times because every arrival is 0: 41/5 = 8.2 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 15"], tags: ["chapter-5", "priority-scheduling", "slide-example"], difficulty: "med"
  },
  {
    id: "os-e1-c5-06", type: "single",
    prompt: "What distinguishes a multilevel FEEDBACK queue from a fixed multilevel queue?",
    options: ["Processes can move between queues as their behavior or waiting time changes", "It requires every queue to use FCFS", "It never preempts a process", "It schedules only kernel threads"], correct: [0],
    explanation: "Feedback lets CPU-heavy processes move down and long-waiting processes move up. A fixed multilevel queue classifies processes into separate queues without that movement.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 17-20"], tags: ["chapter-5", "multilevel-feedback", "exam-style"]
  },
  {
    id: "os-e1-c5-07", type: "single",
    prompt: "____ involves the decision of which kernel thread to schedule onto which CPU.",
    options: ["Process-contention scope", "System-contention scope", "Dispatcher", "Round-robin scheduling"], correct: [1],
    explanation: "SCS chooses among kernel threads across the system. PCS schedules user threads onto available kernel threads within a process.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 24-28"], tags: ["chapter-5", "thread-scheduling", "slide-exercise"]
  },
  {
    id: "os-e1-c5-08", type: "single",
    prompt: "The two general approaches to load balancing are ____ and ____.",
    options: ["Soft affinity, hard affinity", "Coarse grained, fine grained", "Soft real-time, hard real-time", "Push migration, pull migration"], correct: [3],
    explanation: "Push migration moves work away from overloaded CPUs; pull migration lets an idle CPU take work from a busy CPU.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 34, 38"], tags: ["chapter-5", "load-balancing", "slide-exercise"]
  },
  {
    id: "os-e1-c5-09", type: "free",
    prompt: "All arrive at time 0, in order P1, P2, P3, with bursts 24, 3, 3 ms. Ignore switching cost. Draw the Gantt chart and compute average WAITING and RESPONSE times for (a) FCFS, (b) nonpreemptive SJF, (c) RR with q = 4 ms. Break equal SJF bursts by process order. Explain why P1's RR response time differs from its waiting time.",
    explanation: "FCFS averages 17 ms for both measures; SJF averages 3 ms for both; RR waiting averages 17/3 ms while response averages 11/3 ms.",
    sampleAnswer: "FCFS: P1 0-24, P2 24-27, P3 27-30; waiting/response (P1,P2,P3) = (0,24,27), average 17. SJF: P2 0-3, P3 3-6, P1 6-30; waiting/response = (6,0,3), average 3. RR: P1 0-4, P2 4-7, P3 7-10, then P1 10-14,14-18,18-22,22-26,26-30. Waiting=(6,4,7), average 17/3; response=(0,4,7), average 11/3. P1 responds immediately but later waits 6 ms for P2/P3. Response ends at the FIRST dispatch; total waiting includes every ready-queue interval.",
    solutionMd: "| Algorithm | Waiting P1/P2/P3 | Average waiting | Response P1/P2/P3 | Average response |\n|---|---|---|---|---|\n| FCFS | 0,24,27 | 17 | 0,24,27 | 17 |\n| SJF | 6,0,3 | 3 | 6,0,3 | 3 |\n| RR q=4 | 6,4,7 | 17/3 | 0,4,7 | 11/3 |\n\nAll times are ms. Award credit for all three timelines, six averages, and the distinction between first dispatch and cumulative waiting.",
    hintSteps: ["Response = first start - arrival. Waiting = completion - arrival - burst for this CPU-only workload.", "In RR, a completed short process leaves the queue; P1 runs alone after time 10."],
    walkthroughSteps: ["Draw each algorithm's CPU intervals using the same input data.", "Record first start and final completion separately for each process.", "Calculate response and waiting per process before taking their averages.", "Explain P1's 0 response versus 6 waiting under RR."],
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 4, 6-9, 12-13"], tags: ["chapter-5", "gantt-chart", "round-robin", "exam-style"], difficulty: "hard", homeworkFormat: "calc"
  },
  {
    id: "os-e1-c5-10", type: "multi",
    prompt: "Which scheduling goals and definitions are correct? Select all that apply.",
    options: ["Maximize CPU utilization", "Maximize throughput", "Minimize turnaround, waiting and response time", "Response time includes all execution until termination", "For a CPU-only job, waiting = completion - arrival - CPU burst"], correct: [0, 1, 2, 4],
    explanation: "Utilization and throughput are maximized; the time measures are minimized. Turnaround ends at completion, response at the first response/dispatch. The stated waiting formula assumes no I/O waiting.",
    references: ["Ch5 CPU Scheduling.pdf, PDF page 4"], tags: ["chapter-5", "scheduling-criteria", "exam-style"]
  },
  {
    id: "os-e1-c5-11", type: "single",
    prompt: "A process arrives at 2 ms, first runs at 5 ms, completes at 15 ms, and uses 7 ms of CPU with no I/O. Which tuple is (response, turnaround, waiting), in ms?",
    options: ["(3,13,6)", "(6,13,3)", "(3,15,8)", "(5,13,7)"], correct: [0],
    explanation: "Response = 5-2 = 3, turnaround = 15-2 = 13, waiting = 13-7 = 6. The waiting time can exceed response if the process is preempted after its first run.",
    walkthroughSteps: ["Subtract arrival from first run for response.", "Subtract arrival from completion for turnaround.", "Subtract the CPU burst from turnaround to get total waiting, since there is no I/O."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 4 (additional calculation)"], tags: ["chapter-5", "scheduling-criteria", "exam-style"], difficulty: "med"
  },
  {
    id: "os-e1-c5-12", type: "single",
    prompt: "During the CPU/I/O burst cycle, which process is eligible for the CPU scheduler's next selection?",
    options: ["A process waiting for disk I/O", "A process in the ready queue", "A terminated process", "A process that has not been admitted to the system"], correct: [1],
    explanation: "The CPU scheduler selects a ready process. Processes alternate CPU execution and I/O waits; a process blocked for I/O is not ready to execute.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 2-3"], tags: ["chapter-5", "cpu-io-bursts", "ready-queue", "exam-style"]
  },
  {
    id: "os-e1-c5-13", type: "fill",
    prompt: "For bursts P1 = 24, P2 = 3, P3 = 3 ms, all arriving at 0, change the FCFS queue order to P2, P3, P1. Ignore switching cost. What is the average waiting time? Enter a number in ms.", correct: ["3", "3.0", "3.00"],
    explanation: "P2 waits 0, P3 waits 3, P1 waits 6; average = 9/3 = 3 ms. The contrast with 17 ms illustrates FCFS's sensitivity to ordering and the convoy effect.",
    walkthroughSteps: ["Run P2 0-3, P3 3-6, P1 6-30.", "Average the start times: (0+3+6)/3 = 3."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 7"], tags: ["chapter-5", "fcfs", "convoy-effect", "slide-example"]
  },
  {
    id: "os-e1-c5-14", type: "single",
    prompt: "____ scheduling is approximated by predicting the next CPU burst with an exponential average of the measured lengths of previous CPU bursts.",
    options: ["Multilevel queue", "RR", "FCFS", "SJF"], correct: [3],
    explanation: "SJF needs the next CPU burst length; exponential averaging estimates it from the measured past and the prior prediction.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 8-11, 21"], tags: ["chapter-5", "sjf", "burst-prediction", "slide-exercise"]
  },
  {
    id: "os-e1-c5-15", type: "fill",
    prompt: "Use exponential averaging: next prediction = alpha * actual burst + (1-alpha) * previous prediction. With alpha = 0.5, actual burst = 6 ms and previous prediction = 10 ms, what is the next prediction? Enter a number in ms.", correct: ["8", "8.0", "8.00"],
    explanation: "0.5*6 + 0.5*10 = 3+5 = 8 ms. Alpha 0 ignores the new burst; alpha 1 ignores the previous prediction.",
    hintSteps: ["Both the new observation and old estimate get weight 0.5."],
    walkthroughSteps: ["Multiply 6 by 0.5 to get 3.", "Multiply 10 by 0.5 to get 5.", "Add them: next prediction 8 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 10 (additional calculation)"], tags: ["chapter-5", "burst-prediction", "exam-style"]
  },
  {
    id: "os-e1-c5-16", type: "single",
    prompt: "The ____ scheduling algorithm is designed especially for time-sharing systems.",
    options: ["SJF", "FCFS", "RR", "Multilevel queue"], correct: [2],
    explanation: "Round robin gives ready processes repeated bounded time slices, improving interactive response compared with letting a long job monopolize the CPU.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 12, 23"], tags: ["chapter-5", "round-robin", "slide-exercise"]
  },
  {
    id: "os-e1-c5-17", type: "multi",
    prompt: "Which statements about round-robin's time quantum are correct? Select all that apply.",
    options: ["With a quantum at least as large as every burst, RR behaves like FCFS", "Very small quanta can make context-switch overhead dominate", "An unfinished process goes to the end of the ready queue when its quantum expires", "Making the quantum smaller always improves throughput"], correct: [0, 1, 2],
    explanation: "Large quanta remove effective preemption; tiny quanta add switching overhead. Quantum expiry moves unfinished work to the tail. Response and overhead must be balanced.",
    references: ["Ch5 CPU Scheduling.pdf, PDF page 12"], tags: ["chapter-5", "round-robin", "time-quantum", "exam-style"]
  },
  {
    id: "os-e1-c5-18", type: "single",
    prompt: "Which of the following is true of multilevel queue scheduling?",
    options: ["Processes can move between queues", "Each queue has its own scheduling algorithm", "A queue cannot have absolute priority over lower-priority queues", "It is the most general CPU-scheduling algorithm"], correct: [1],
    explanation: "Separate queues can use different algorithms. The migration feature belongs to multilevel feedback queues; fixed queues can have strict priority over one another.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 17-19, 22"], tags: ["chapter-5", "multilevel-queue", "slide-exercise"]
  },
  {
    id: "os-e1-c5-19", type: "fill",
    prompt: "In the slide's feedback scheduler, Q0 uses RR q=8 ms, Q1 uses RR q=16 ms, Q2 uses FCFS. A new CPU-only process needs 35 ms and faces no other jobs. It uses its full Q0 and Q1 allotments before demotion. How many ms remain when it enters Q2? Enter a number.", correct: ["11", "11.0"],
    explanation: "It consumes 8+16=24 ms in the first two queues, leaving 35-24=11 ms for Q2.",
    walkthroughSteps: ["Q0: use 8, leaving 27.", "Q1: use 16, leaving 11.", "Demote to Q2 to finish the remaining 11 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 20 (additional calculation)"], tags: ["chapter-5", "multilevel-feedback", "exam-style"]
  },
  {
    id: "os-e1-c5-20", type: "single",
    prompt: "A thread library schedules user threads within one process onto kernel threads. What scope is this, and which Pthread constant names it?",
    options: ["PCS; PTHREAD_SCOPE_PROCESS", "SCS; PTHREAD_SCOPE_PROCESS", "PCS; PTHREAD_SCOPE_SYSTEM", "SCS; pthread_join"], correct: [0],
    explanation: "Process-contention scope competes within one process. PTHREAD_SCOPE_SYSTEM requests system-contention scope; pthread_join waits for a thread's termination.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 24-27"], tags: ["chapter-5", "thread-scheduling", "pthreads", "exam-style"]
  },
  {
    id: "os-e1-c5-21", type: "fill",
    prompt: "The slide describes a quad-core chip with 2 hardware threads per core. How many logical processors does the OS see? Enter an integer.", correct: ["8"],
    explanation: "4 cores * 2 hardware threads/core = 8 logical processors. Hardware threads share core resources, so this does not mean 8 independent physical cores.",
    references: ["Ch5 CPU Scheduling.pdf, PDF page 32"], tags: ["chapter-5", "hardware-threads", "slide-example"]
  },
  {
    id: "os-e1-c5-22", type: "single",
    prompt: "Why can hardware multithreading improve use of a CPU core during a memory stall?",
    options: ["The core can run another hardware thread while one waits for memory", "It removes all memory access latency", "It gives every hardware thread its own physical core", "It prevents all context switches"], correct: [0],
    explanation: "A memory stall leaves execution resources underused. Another hardware thread can make progress; the OS schedules software threads onto logical CPUs while the core selects among hardware threads.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 30-33"], tags: ["chapter-5", "memory-stall", "hardware-threads", "exam-style"]
  },
  {
    id: "os-e1-c5-23", type: "single",
    prompt: "Adapted from the affinity exercise: which mechanism can restrict a thread to one specified CPU by setting its allowed CPU set to a singleton?",
    options: ["Hard processor affinity", "Soft processor affinity", "NUMA alone", "Load balancing"], correct: [0],
    explanation: "Hard affinity restricts the allowed CPU set, which can contain one CPU or several. Soft affinity is only a preference. The slide's wording 'allows a thread to run on only one processor' is clarified here because affinity need not be a singleton.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 35, 37 (exercise clarified)"], tags: ["chapter-5", "processor-affinity", "slide-exercise"]
  },
  {
    id: "os-e1-c5-24", type: "single",
    prompt: "On a NUMA system, which placement usually reduces a thread's memory-access cost?",
    options: ["Run it near the memory node holding its data", "Always migrate it to a remote node", "Ignore memory location and balance only thread counts", "Disable every CPU's cache"], correct: [0],
    explanation: "Non-uniform memory access means local and remote memory have different costs. NUMA-aware scheduling keeps thread execution and its frequently accessed memory near one another.",
    references: ["Ch5 CPU Scheduling.pdf, PDF page 36"], tags: ["chapter-5", "numa", "exam-style"]
  },
  {
    id: "os-e1-c5-25", type: "single",
    prompt: "Which ready-queue organization is allowed by the CPU-scheduler slides?",
    options: ["Only a FIFO linked list", "Only a priority queue", "FIFO, priority queue, tree, or an unordered linked list", "Only one private queue per CPU"], correct: [2],
    explanation: "A ready queue describes eligible work, not a mandatory data structure. Multiprocessors can additionally use a common ready queue or separate per-processor queues.",
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 3, 29"], tags: ["chapter-5", "ready-queue", "multiprocessor-scheduling", "exam-style"]
  },
  {
    id: "os-e1-c5-26", type: "free",
    prompt: "A CPU has short interactive jobs and long CPU-bound jobs. Explain the FCFS convoy effect, why small RR quanta can help response yet hurt efficiency, and how the slide's three-level feedback queue treats a long 35-ms CPU burst (Q0 q=8, Q1 q=16, Q2 FCFS).",
    explanation: "FCFS lets a long job delay shorter work; RR trades response for switching cost; feedback demotes a CPU-heavy job after 8 and 16 ms, leaving 11 ms for Q2.",
    sampleAnswer: "A long FCFS job causes a convoy of short jobs to wait. RR bounds each turn so interactive jobs get a prompt first dispatch, but too-small quanta spend excessive time saving/restoring contexts. Quantum should be large relative to switch cost. Feedback gives the 35-ms job 8 ms in Q0,16 in Q1, then the remaining 11 in Q2; higher-priority queues get service first. Moving long-waiting jobs upward can reduce starvation. Selection depends on workload, not one universally best algorithm.",
    solutionMd: "Credit: convoy definition; response/overhead tradeoff; timeline 8+16+11; feedback demotion and upward movement for long waits.",
    hintSteps: ["Compare first response to total completion.", "Track the remaining burst after each allotment."],
    walkthroughSteps: ["Describe a short job stuck behind a long FCFS job.", "Explain the benefit and cost of preemption.", "Subtract 8 then 16 from 35.", "Explain why feedback uses the process's observed behavior to choose its queue."],
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 7, 12, 19-20"], tags: ["chapter-5", "convoy-effect", "multilevel-feedback", "exam-style"], homeworkFormat: "multi-step"
  },
  {
    id: "os-e1-c5-27", type: "free",
    prompt: "A multicore NUMA server has one idle CPU and one overloaded CPU. Explain push versus pull migration, soft versus hard processor affinity, and why moving a thread can improve load balance yet worsen locality. Include the two scheduling levels in a hardware-multithreaded core.",
    explanation: "Balancing spreads runnable work; affinity and NUMA placement preserve cache/memory locality. OS software-thread scheduling and the core's hardware-thread scheduling are distinct.",
    sampleAnswer: "Push migration periodically finds overload and sends work away; pull migration lets an idle CPU take work. Soft affinity prefers a prior CPU but permits migration; hard affinity restricts the permitted set. Moving a thread may use an idle core but lose warm-cache data and cause remote NUMA accesses. The OS selects software threads for logical CPUs; each core selects which hardware thread uses its execution resources. Respect hard-affinity constraints while weighing load against locality.",
    solutionMd: "Credit each migration/affinity definition, cache and NUMA costs, and both scheduling levels. Hard affinity can permit several CPUs; it is not inherently one CPU.",
    hintSteps: ["Think of who initiates the move: busy side or idle side.", "Distinguish a preference from a restriction."],
    walkthroughSteps: ["Define push and pull.", "Define soft and hard affinity.", "Explain cache warmth and local versus remote memory.", "Identify the OS scheduling level and the hardware core level."],
    references: ["Ch5 CPU Scheduling.pdf, PDF pages 29-36"], tags: ["chapter-5", "load-balancing", "processor-affinity", "numa", "exam-style"], homeworkFormat: "multi-step"
  },
  {
    id: "os-e1-c5-28", type: "fill",
    prompt: "Use the slide's priority + round-robin scheduler. All arrive at time 0; smaller priority numbers win, q=2 ms within a priority, ties start in process-ID order, and switch cost is zero.\n\n| Process | Burst (ms) | Priority |\n|---|---:|---:|\n| P1 | 4 | 3 |\n| P2 | 5 | 2 |\n| P3 | 8 | 2 |\n| P4 | 7 | 1 |\n| P5 | 3 | 3 |\n\nWhat is the average waiting time? Enter a number in ms.", correct: ["13.8", "13.80"],
    explanation: "P4 runs first, then P2/P3 share priority 2, then P1/P5 share priority 3. Completion times (P1-P5) are 26,16,20,7,27. Subtract bursts to obtain waits 22,11,12,0,24; average 69/5=13.8 ms.",
    hintSteps: ["Finish all priority 1 work before priority 2; rotate only within the current priority."],
    walkthroughSteps: ["P4 runs 0-7.", "Priority 2: P2 7-9, P3 9-11, P2 11-13, P3 13-15, P2 15-16, P3 16-18 and 18-20.", "Priority 3: P1 20-22, P5 22-24, P1 24-26, P5 26-27.", "Waiting=completion-burst:22,11,12,0,24; average 13.8 ms."],
    references: ["Ch5 CPU Scheduling.pdf, PDF page 16"], tags: ["chapter-5", "priority-scheduling", "round-robin", "slide-example"], difficulty: "hard"
  }
];

export const synchronizationQuestions: Question[] = [
  {
    id: "os-e1-c6-01", type: "single",
    prompt: "A race condition ____. Choose the best description from the slide's exercise.",
    options: ["Results from concurrent reads alone, even when no data changes", "Occurs when unsynchronized concurrent accesses include modification and the outcome depends on their ordering", "Occurs only when the result is independent of instruction order", "Is prevented merely by having a single CPU"], correct: [1],
    explanation: "This clarifies slide option B: overlapping access/modification is dangerous when the outcome depends on timing. Pure reads are not enough; interleaving on one CPU can still cause a race.",
    references: ["Ch6 Synchronization.pdf, PDF pages 3-5 (exercise clarified)"], tags: ["chapter-6", "race-condition", "slide-exercise"]
  },
  {
    id: "os-e1-c6-02", type: "multi",
    prompt: "Which are the THREE standard requirements for a solution to the critical-section problem? Select all that apply.",
    options: ["Mutual exclusion", "Progress", "Bounded waiting", "Every entire process must run atomically", "All processes must take turns even when one has no interest in entering"], correct: [0, 1, 2],
    explanation: "Mutual exclusion prevents overlap. Progress prevents indefinite postponement of a choice when entry is possible. Bounded waiting limits how many other entries occur after a request; strict alternation is not required.",
    references: ["Ch6 Synchronization.pdf, PDF pages 6-10"], tags: ["chapter-6", "critical-section", "exam-style"]
  },
  {
    id: "os-e1-c6-03", type: "single",
    prompt: "In Peterson's two-process algorithm, assume sequentially consistent atomic reads/writes. Both flag[0] and flag[1] are true, and the last turn assignment sets turn=1. Which process may enter?\n\nP 0 waits while flag[1] && turn==1.\nP 1 waits while flag[0] && turn==0.",
    options: ["P0 only", "P1 only", "Both", "Neither"], correct: [1],
    explanation: "P0's guard is true, so it spins. P1's guard is false because turn is 1; P1 enters. Each process initially gives the other the turn; the final assignment breaks a simultaneous request tie.",
    hintSteps: ["Substitute turn=1 into each process's own wait condition."],
    walkthroughSteps: ["P0: true && 1==1 is true, so wait.", "P1: true && 1==0 is false, so enter.", "On exit P1 clears flag[1], letting P0 proceed."],
    references: ["Ch6 Synchronization.pdf, PDF pages 11-12"], tags: ["chapter-6", "peterson", "exam-style"], difficulty: "med"
  },
  {
    id: "os-e1-c6-04", type: "single",
    prompt: "In the slide's conceptual memory-ordering example, one thread writes x=100, then flag=true; another spins until flag and prints x. Why might it print 0 without suitable synchronization?",
    options: ["The flag write may become visible before the x write because of reordering", "100 cannot fit in an integer", "A true flag automatically resets x", "Any read is a critical-section solution"], correct: [0],
    explanation: "The conceptual example illustrates ordering and visibility, requiring appropriate barriers/synchronization. It is not portable C/C++ code as written: unsynchronized ordinary shared variables create a data race; use a mutex or correctly ordered atomics in real code.",
    references: ["Ch6 Synchronization.pdf, PDF pages 13-18"], tags: ["chapter-6", "memory-ordering", "memory-barrier", "exam-style"]
  },
  {
    id: "os-e1-c6-05", type: "single",
    prompt: "The slide's atomic test_and_set(target) saves the old Boolean value, sets target=true, and returns the old value. If lock is initially false, what does the first call return and what is lock afterward?",
    options: ["Returns false; lock becomes true", "Returns true; lock stays false", "Returns true; lock becomes true", "Returns false; lock stays false"], correct: [0],
    explanation: "The operation atomically returns the original value and writes true. A false return means the caller acquired the previously free lock; later callers see true and spin until release.",
    references: ["Ch6 Synchronization.pdf, PDF pages 20-22"], tags: ["chapter-6", "test-and-set", "atomicity", "exam-style"]
  },
  {
    id: "os-e1-c6-06", type: "single",
    prompt: "An initially empty bounded buffer holds n items. Which semaphore initial values are correct for (mutex, empty, full)?",
    options: ["(1,n,0)", "(0,n,1)", "(1,0,n)", "(n,1,1)"], correct: [0],
    explanation: "mutex starts 1 for exclusive buffer access, empty startsn available slots, and full starts 0 because there is no item to consume.",
    references: ["Ch6 Synchronization.pdf, PDF pages 37-39"], tags: ["chapter-6", "bounded-buffer", "semaphore", "exam-style"]
  },
  {
    id: "os-e1-c6-07", type: "single",
    prompt: "How many philosophers may eat simultaneously in the standard dining-philosophers problem with 5 philosophers and 5 shared chopsticks (each philosopher needs both adjacent chopsticks)?",
    options: ["1", "2", "3", "5"], correct: [1],
    explanation: "Eating neighbors would share a chopstick. Two nonadjacent philosophers can eat; three would need six distinct chopsticks, but only five exist.",
    references: ["Ch6 Synchronization.pdf, PDF pages 43-49"], tags: ["chapter-6", "dining-philosophers", "slide-exercise"]
  },
  {
    id: "os-e1-c6-08", type: "single",
    prompt: "A call to pthread_cond_signal() ____. Assume at least one thread is waiting on the condition variable.",
    options: ["Releases the mutex and signals one waiting thread", "Releases the mutex and signals all waiting threads", "Signals a waiting thread but does not release the mutex", "Signals all waiting threads without releasing the mutex"], correct: [2],
    explanation: "The slide's answer is C. A signal wakes at least one waiter; it does not unlock the signaling thread's mutex. The waiting thread must reacquire its associated mutex and recheck the predicate; broadcast is the operation used to wake all waiters.",
    references: ["Ch6 Synchronization.pdf, PDF pages 55-56, 59"], tags: ["chapter-6", "condition-variable", "pthreads", "slide-exercise"]
  },
  {
    id: "os-e1-c6-09", type: "free",
    prompt: "Write producer and consumer pseudocode for an initially empty bounded buffer with n slots using mutex, empty and full semaphores. State initial values and operation order. Explain why a producer must wait(empty) BEFORE wait(mutex), and give a deadlock execution if the order is reversed for both producer and consumer.",
    explanation: "Initial values are mutex 1, empty n, full 0. Wait for the resource before locking the buffer; holding the buffer lock while waiting for a slot/item can block the process that would make it available.",
    sampleAnswer: "mutex=1; empty=n; full=0. Producer: produce locally; wait(empty); wait(mutex); insert; signal(mutex); signal(full). Consumer: wait(full); wait(mutex); remove; signal(mutex); signal(empty); consume locally. If a full buffer's producer first locks mutex then waits(empty), it blocks holding mutex. A consumer needs mutex to remove an item and signal(empty), so both wait forever. Symmetrically, a consumer taking mutex before wait(full) can deadlock on an empty buffer.",
    solutionMd: "```text\nmutex = 1; empty = n; full = 0\nproducer: produce; wait(empty); wait(mutex); insert; signal(mutex); signal(full)\nconsumer: wait(full); wait(mutex); remove; signal(mutex); signal(empty); consume\n```\n\nCredit all initial values, both ordered protocols, exclusive insertion/removal, and the full/empty-buffer deadlock trace. Local producing/consuming need not hold mutex.",
    hintSteps: ["empty and full represent availability; mutex represents exclusive access.", "A blocked process holding mutex prevents the peer from changing the buffer."],
    walkthroughSteps: ["Initialize availability from an empty buffer.", "Acquire an available slot/item before acquiring mutex.", "Update the shared buffer while holding mutex, then release it.", "Signal availability to the peer.", "Trace a producer blocking on empty while holding mutex and a consumer blocked on that mutex."],
    references: ["Ch6 Synchronization.pdf, PDF pages 37-39 (additional deadlock analysis)"], tags: ["chapter-6", "bounded-buffer", "semaphore", "deadlock", "exam-style"], difficulty: "hard", homeworkFormat: "multi-step"
  },
  {
    id: "os-e1-c6-10", type: "single",
    prompt: "A(n) _______ refers to where a process is accessing/updating shared data.",
    options: ["Critical section", "Entry section", "Mutex", "Test-and-set"], correct: [0],
    explanation: "The critical section performs the shared-data access. The entry section obtains permission, the exit section releases it, and the remainder does other work.",
    references: ["Ch6 Synchronization.pdf, PDF pages 6-9"], tags: ["chapter-6", "critical-section", "slide-exercise"]
  },
  {
    id: "os-e1-c6-11", type: "single",
    prompt: "A solution to the critical-section problem does not have to satisfy which named requirement?",
    options: ["Mutual exclusion", "Progress", "Atomicity of the entire critical section as one machine instruction", "Bounded waiting"], correct: [2],
    explanation: "The slide's third choice is atomicity. Clarified here: a critical section may contain many instructions while locks prevent competing entry. Atomic primitive operations may implement the protocol, but the three standard requirements are exclusion, progress and bounded waiting.",
    references: ["Ch6 Synchronization.pdf, PDF page 10 (exercise clarified)"], tags: ["chapter-6", "critical-section", "slide-exercise"]
  },
  {
    id: "os-e1-c6-12", type: "single",
    prompt: "In Peterson's solution, the ____ variable indicates if process Pi is ready to enter its critical section.",
    options: ["turn", "lock", "flag[i]", "turn[i]"], correct: [2],
    explanation: "flag[i] records Pi's intent to enter; turn resolves competition between the two processes. There is one shared scalar turn, not a turn array.",
    references: ["Ch6 Synchronization.pdf, PDF pages 11, 19"], tags: ["chapter-6", "peterson", "slide-exercise"]
  },
  {
    id: "os-e1-c6-13", type: "single",
    prompt: "An instruction that executes atomically ____.",
    options: ["Must consist of only one machine instruction", "Executes as a single, uninterruptible unit", "Cannot be used to solve the critical-section problem", "All of the above"], correct: [1],
    explanation: "Atomic describes an indivisible effect, not a required number of implementation instructions. Atomic read-modify-write primitives are useful for synchronization.",
    references: ["Ch6 Synchronization.pdf, PDF page 23"], tags: ["chapter-6", "atomicity", "slide-exercise"]
  },
  {
    id: "os-e1-c6-14", type: "single",
    prompt: "Race conditions on shared data are prevented by requiring all conflicting accesses to use the same appropriate lock correctly. True or false?",
    options: ["True", "False"], correct: [0],
    explanation: "True under the stated discipline. This clarifies the slide's statement that critical regions are protected by locks: one unprotected conflicting access can still race, and the wrong lock does not help.",
    references: ["Ch6 Synchronization.pdf, PDF page 24 (exercise clarified)"], tags: ["chapter-6", "race-condition", "mutex", "slide-exercise"]
  },
  {
    id: "os-e1-c6-15", type: "single",
    prompt: "A counting semaphore ____.",
    options: ["Is essentially an integer variable accessed through atomic operations", "Is accessed through only one standard operation", "Can safely be modified by simultaneous non-atomic increments", "Cannot control access to critical sections"], correct: [0],
    explanation: "A semaphore's value is an integer; atomic wait and signal control it. Counting semaphores track multiple resources and a semaphore initialized 1 can implement exclusion.",
    references: ["Ch6 Synchronization.pdf, PDF pages 25-27, 33"], tags: ["chapter-6", "semaphore", "slide-exercise"]
  },
  {
    id: "os-e1-c6-16", type: "single",
    prompt: "_____ can be used to prevent busy waiting when implementing a semaphore.",
    options: ["Spinlocks", "Waiting queues", "A mutex that always spins", "Allowing wait() to succeed even without a resource"], correct: [1],
    explanation: "A waiting queue plus block/wakeup lets a process sleep until a resource is available. Spinning consumes CPU cycles while waiting; a wakeup makes a process ready, not necessarily immediately running.",
    references: ["Ch6 Synchronization.pdf, PDF pages 29-34"], tags: ["chapter-6", "busy-waiting", "semaphore", "slide-exercise"]
  },
  {
    id: "os-e1-c6-17", type: "single",
    prompt: "In the slide's introductory mutual-exclusion pattern, a mutex lock and a binary semaphore initialized 1 can both allow one process/thread into the critical section at a time. True or false?",
    options: ["True", "False"], correct: [0],
    explanation: "True for this use. The original 'essentially the same thing' exercise is narrowed to the taught exclusion pattern: real mutex APIs have ownership rules, while semaphores can also signal between different threads. They are not interchangeable in every API or application.",
    references: ["Ch6 Synchronization.pdf, PDF pages 26, 35 (exercise clarified)"], tags: ["chapter-6", "mutex", "binary-semaphore", "slide-exercise"]
  },
  {
    id: "os-e1-c6-18", type: "multi",
    prompt: "Adapted from the bounded-buffer slide exercise: what is the purpose of mutex? Select all correct descriptions.",
    options: ["Count empty slots", "Count occupied slots", "Control access to the shared buffer", "Ensure mutual exclusion during buffer updates"], correct: [2, 3],
    explanation: "Both original choices C and D describe mutex, so this exercise uses select-all rather than forcing one of two valid answers. empty and full count availability; mutex protects insertion/removal.",
    references: ["Ch6 Synchronization.pdf, PDF pages 38, 48 (exercise adapted to multi-answer)"], tags: ["chapter-6", "bounded-buffer", "mutex", "slide-exercise"]
  },
  {
    id: "os-e1-c6-19", type: "single",
    prompt: "Pthreads can be implemented ____. Use the implementation choices taught by the slides.",
    options: ["Only inside the operating-system kernel", "Only at user level", "At user level or inside the operating-system kernel", "Only on Windows"], correct: [2],
    explanation: "Pthreads is an API specification, not a mandate for one implementation level. It can have user-level or kernel-supported implementations; the slides discuss POSIX on UNIX, Linux and macOS.",
    references: ["Ch6 Synchronization.pdf, PDF pages 50, 57"], tags: ["chapter-6", "pthreads", "slide-exercise"]
  },
  {
    id: "os-e1-c6-20", type: "single",
    prompt: "When the owner of a mutex invokes pthread_mutex_unlock(), all threads blocked on that mutex become owners and enter their critical sections together. True or false?",
    options: ["True", "False"], correct: [1],
    explanation: "False. Unlocking makes the mutex available to be acquired; it does not grant ownership to all waiters. One thread acquires it at a time. This clarifies the slide's 'all threads ... are unblocked' claim without assuming an implementation's exact wakeup policy.",
    references: ["Ch6 Synchronization.pdf, PDF pages 51, 58 (exercise clarified)"], tags: ["chapter-6", "mutex", "pthreads", "slide-exercise"]
  },
  {
    id: "os-e1-c6-21", type: "fill",
    prompt: "Use the slide's blocking semaphore implementation: wait(S) decrements S.value and blocks if the result is negative; signal(S) increments it and wakes one waiter if the result is <=0. Starting at value 2, three processes call wait with no intervening signal. What is S.value afterward? Enter an integer.", correct: ["-1"],
    explanation: "The sequence is 2 -> 1 -> 0 -> -1. The third process blocks; the magnitude of the negative value represents waiting processes in this implementation.",
    walkthroughSteps: ["First wait consumes one available resource: value 1.", "Second wait consumes the last resource: value 0.", "Third wait decrements to-1 and queues the caller."],
    references: ["Ch6 Synchronization.pdf, PDF pages 30-32 (additional trace)"], tags: ["chapter-6", "semaphore", "blocking", "exam-style"], difficulty: "med"
  },
  {
    id: "os-e1-c6-22", type: "single",
    prompt: "In the blocking semaphore implementation, S.value is -1 and one process is waiting. What does one signal(S) do?",
    options: ["Set value 0 and move one waiter to the ready queue", "Set value 0 and immediately guarantee the waiter is running", "Set value-2 and add another waiter", "Leave the value unchanged"], correct: [0],
    explanation: "signal increments -1 to 0, then its <=0 test wakes one waiting process. Wakeup changes blocked to ready; the CPU scheduler decides when it runs.",
    references: ["Ch6 Synchronization.pdf, PDF pages 30-32"], tags: ["chapter-6", "semaphore", "blocking", "exam-style"]
  },
  {
    id: "os-e1-c6-23", type: "fill",
    prompt: "P1 must execute statement S1 before P2 executes S2. P1 does S1; signal(synch). P2 does wait(synch); S2. What initial value must synch have? Enter an integer.", correct: ["0"],
    explanation: "Starting at 0 prevents P2 from passing its wait until P1 signals after S1. Initializing at 1 would let P2 run S2 too early.",
    references: ["Ch6 Synchronization.pdf, PDF page 28"], tags: ["chapter-6", "semaphore", "execution-order", "slide-example"]
  },
  {
    id: "os-e1-c6-24", type: "single",
    prompt: "The readers-writers problem permits which simultaneous accesses to the shared data set?",
    options: ["Several readers, with no writer accessing the data", "One writer alongside any number of readers", "Two writers if they have different process IDs", "Every reader and writer concurrently"], correct: [0],
    explanation: "Readers can coexist because they do not modify the data. A writer needs exclusive access against both other writers and readers.",
    references: ["Ch6 Synchronization.pdf, PDF pages 40-42"], tags: ["chapter-6", "readers-writers", "exam-style"]
  },
  {
    id: "os-e1-c6-25", type: "single",
    prompt: "In the slide's reader-priority readers-writers solution, which reader operations use rw_mutex?",
    options: ["The first reader acquires it; the last reader releases it", "Every reader holds it exclusively for its whole read", "No reader touches it", "The second reader releases it even while the first is reading"], correct: [0],
    explanation: "The first reader excludes writers with rw_mutex; the last reader releases it. A separate mutex protects read_count updates. rw_mutex starts 1, mutex starts 1, and read_count starts 0.",
    references: ["Ch6 Synchronization.pdf, PDF pages 41-42"], tags: ["chapter-6", "readers-writers", "semaphore", "exam-style"]
  },
  {
    id: "os-e1-c6-26", type: "single",
    prompt: "What can happen if a continuous stream of readers keeps the reader count positive in the reader-priority algorithm?",
    options: ["A waiting writer can starve while readers keep making progress", "Every process necessarily deadlocks", "Readers must all stop immediately", "The writer automatically gains higher priority"], correct: [0],
    explanation: "The last-reader release never occurs, postponing the writer indefinitely. This is starvation, since readers still progress; it is not a system-wide deadlock.",
    references: ["Ch6 Synchronization.pdf, PDF pages 40-42 (additional analysis)"], tags: ["chapter-6", "readers-writers", "starvation", "exam-style"]
  },
  {
    id: "os-e1-c6-27", type: "single",
    prompt: "Five philosophers each execute wait(chopstick[i]), then wait(chopstick[(i+1)%5]). What happens if all successfully take their first chopstick before any takes a second?",
    options: ["Deadlock: each waits for a chopstick held by its neighbor", "All five can eat concurrently", "Only a harmless CPU scheduling delay", "Mutual exclusion has been violated on every chopstick"], correct: [0],
    explanation: "Each holds one resource while waiting for the next, forming a cycle. Chopstick mutual exclusion is working; the acquisition protocol causes deadlock.",
    references: ["Ch6 Synchronization.pdf, PDF pages 45-46"], tags: ["chapter-6", "dining-philosophers", "deadlock", "slide-exercise"]
  },
  {
    id: "os-e1-c6-28", type: "multi",
    prompt: "Which dining-philosophers deadlock fixes are given by the slides? Select all that apply.",
    options: ["Allow at most four of five philosophers to attempt acquiring chopsticks at once", "Acquire both chopsticks together only when both are available, using a protected protocol", "Make odd and even philosophers acquire the two sides in opposite orders", "Have all five acquire their left chopstick first"], correct: [0, 1, 2],
    explanation: "The first three prevent the all-hold-one cycle. Allowing four contenders is an admission limit, not a claim that four can eat simultaneously; at most two can eat with five chopsticks.",
    references: ["Ch6 Synchronization.pdf, PDF page 47"], tags: ["chapter-6", "dining-philosophers", "deadlock", "exam-style"]
  },
  {
    id: "os-e1-c6-29", type: "single",
    prompt: "Which POSIX functions acquire and release a mutex?",
    options: ["pthread_mutex_lock and pthread_mutex_unlock", "sem_open and sem_close", "pthread_cond_signal and pthread_cond_wait", "fork and wait"], correct: [0],
    explanation: "Mutexes are initialized before use, acquired with pthread_mutex_lock and released by their owner with pthread_mutex_unlock. Condition variables and semaphores use separate operations.",
    references: ["Ch6 Synchronization.pdf, PDF pages 50-51"], tags: ["chapter-6", "pthreads", "mutex", "exam-style"]
  },
  {
    id: "os-e1-c6-30", type: "single",
    prompt: "Which pairing matches the POSIX semaphore APIs illustrated in the slides?",
    options: ["Named: sem_open; unnamed: sem_init; both use sem_wait/sem_post", "Named: sem_init; unnamed: sem_open; both use pthread_join", "Named semaphores cannot be shared by unrelated processes", "Unnamed semaphores can never be placed in shared memory"], correct: [0],
    explanation: "Names let unrelated processes refer to the same semaphore. Unnamed semaphores can synchronize threads, or processes when appropriately initialized and stored in shared memory. wait/post acquire/release semaphore permits.",
    references: ["Ch6 Synchronization.pdf, PDF pages 52-54"], tags: ["chapter-6", "posix-semaphore", "exam-style"]
  },
  {
    id: "os-e1-c6-31", type: "single",
    prompt: "A thread holds mutex m, then executes while(a != b) pthread_cond_wait(&cv,&m). What does pthread_cond_wait do with m?",
    options: ["Atomically releases it while waiting, then reacquires it before returning", "Keeps it locked throughout the sleep", "Unlocks it and never reacquires it", "Destroys the mutex"], correct: [0],
    explanation: "The atomic release-and-wait avoids a gap that could lose a notification; releasing allows a peer to update the predicate. Returning reacquires the mutex. A loop handles spurious wakeups and changes by other threads before the lock is reacquired.",
    references: ["Ch6 Synchronization.pdf, PDF pages 55-56"], tags: ["chapter-6", "condition-variable", "pthreads", "exam-style"], difficulty: "med"
  },
  {
    id: "os-e1-c6-32", type: "free",
    prompt: "Two threads each perform count++ once on a shared integer initially 0. Assume the slide's conceptual model: each increment is load, add 1, store, and these steps may interleave. Show a trace ending at 1, explain the lost update, and give a mutex-based repair. Then distinguish mutual exclusion, progress, and bounded waiting.",
    explanation: "Both can load 0 and store 1, losing one increment. Protect the entire read-modify-write with a common mutex; a correct critical-section protocol also needs liveness properties.",
    sampleAnswer: "A loads 0; B loads 0; A adds 1/stores 1; B adds 1/stores 1. Final count 1, though two increments were requested. Initialize mutex, and have each thread lock; count++; unlock. Mutual exclusion means no overlapping protected updates. Progress means interested processes can decide who enters when the section is free. Bounded waiting puts a finite bound on other entries after a request. A mutex fixes the data race but its API name alone does not establish a fairness guarantee. Ordinary unsynchronized C/C++ increments are a data race, so the trace is a conceptual interleaving exercise.",
    solutionMd: "Credit a six-step load/add/store interleaving yielding 1, a common lock around the whole increment, and correct definitions of all three requirements. In the conceptual model sequential increments produce 2.",
    hintSteps: ["Have both threads read before either writes.", "Lock around the whole update rather than only around the store."],
    walkthroughSteps: ["Expand each increment into load/add/store.", "Interleave both loads before stores.", "Show the second store overwrites the first update.", "Protect the whole shared update and distinguish safety from progress/fairness."],
    references: ["Ch6 Synchronization.pdf, PDF pages 2-8 (additional trace)"], tags: ["chapter-6", "race-condition", "critical-section", "exam-style"], homeworkFormat: "multi-step"
  },
  {
    id: "os-e1-c6-33", type: "free",
    prompt: "Using POSIX-style pseudocode, show how one thread waits for a == b and another changes the protected state and notifies it. State which operations release/reacquire the mutex and why the wait belongs in a while loop. Contrast the condition variable with a semaphore initialized 0 for enforcing S1 before S2.",
    explanation: "A condition variable waits for a predicate under a mutex; the semaphore records permits. Condition notifications are not saved as permits when no waiter exists.",
    sampleAnswer: "Waiter: lock(m); while(a!=b) cond_wait(cv,m); use protected state; unlock(m). Updater: lock(m); update a/b; cond_signal(cv); unlock(m). cond_wait atomically releases m and waits, then reacquires m before returning. cond_signal does not release m, so a woken waiter may still block reacquiring it. Recheck in a while loop for spurious wakeups or another thread changing the state. For ordering, synch=0; P1 executes S1 then signal(synch); P2 wait(synch) then S2. Unlike a condition notification, the semaphore signal leaves a permit if P2 has not yet waited.",
    solutionMd: "```text\nwaiter: lock(m); while (a != b) cond_wait(cv,m); use_state(); unlock(m)\nupdater: lock(m); update_state(); cond_signal(cv); unlock(m)\nordering: synch=0; P1: S1; signal(synch); P2: wait(synch); S2\n```\n\nCredit predicate under mutex, while loop, wait release/reacquire, signal retaining mutex, and permit versus notification.",
    hintSteps: ["Both accesses to a and b need the same mutex.", "A notification tells a waiter to recheck a predicate; it does not guarantee the predicate remains true."],
    walkthroughSteps: ["Protect the predicate and updates with m.", "Wait in a loop, atomically releasing m while sleeping.", "Update and signal while coordinating with the same mutex, then unlock.", "Explain reacquisition and predicate rechecking.", "Compare the stored semaphore permit with a condition-variable notification."],
    references: ["Ch6 Synchronization.pdf, PDF pages 28, 55-56, 59"], tags: ["chapter-6", "condition-variable", "execution-order", "exam-style"], difficulty: "hard", homeworkFormat: "multi-step"
  },
  {
    id: "os-e1-c6-34", type: "single",
    prompt: "Two kernel threads both read next_available_pid=42 before either updates it. They each assign 42 to a new process, then each stores 43. What failed?",
    options: ["The shared PID allocation operation lacked mutual exclusion/atomicity", "The ready queue was too short", "The CPU used SJF", "The processes had separate private variables"], correct: [0],
    explanation: "The slide's kernel-variable example is a race: a shared read-modify-write can allocate the same PID twice. Protect or atomically perform the entire allocation, not just its final store.",
    references: ["Ch6 Synchronization.pdf, PDF page 3 (additional trace)"], tags: ["chapter-6", "race-condition", "kernel", "exam-style"]
  },
  {
    id: "os-e1-c6-35", type: "single",
    prompt: "Does the simple spinlock while(test_and_set(&lock)); followed by lock=false automatically guarantee bounded waiting?",
    options: ["No; repeated competing acquisitions can starve a waiter", "Yes; any atomic operation establishes FIFO order", "Yes; setting lock=false hands it to the longest-waiting process", "No; it cannot provide mutual exclusion"], correct: [0],
    explanation: "Atomic test-and-set can provide mutual exclusion, but this simple loop has no queue or turn-taking bound. A process can repeatedly lose the next acquisition; busy waiting also consumes CPU cycles.",
    references: ["Ch6 Synchronization.pdf, PDF pages 8, 20-22 (additional analysis)"], tags: ["chapter-6", "test-and-set", "bounded-waiting", "exam-style"]
  }
];
