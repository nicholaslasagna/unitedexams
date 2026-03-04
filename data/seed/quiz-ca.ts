import type { QuizSet } from "@/lib/types";

const computerArchitectureQuizSetsRaw: QuizSet[] = [
  {
    id: "ca-fundamentals",
    courseId: "computer-architecture",
    title: "Topic 1: ISA Fundamentals & Performance",
    description: "ISA categories, Flynn's Taxonomy, processor performance calculations, and RISC-V basics — directly from Assignment 1 and Topic 1 lectures.",
    difficulty: "Intermediate",
    estMinutes: 30,
    tags: ["isa", "performance", "fundamentals", "homework-aligned"],
    timerDefaultMinutes: 25,
    questions: [
      {
        id: "ca-fund-q1",
        type: "single",
        prompt: "What are the **two categories of ISA** in Computer Architecture?",
        options: [
          "RISC (Reduced Instruction Set Computer) and CISC (Complex Instruction Set Computing)",
          "SIMD (Single Instruction Multiple Data) and MIMD (Multiple Instruction Multiple Data)",
          "Harvard Architecture and Von Neumann Architecture",
          "Scalar and Superscalar"
        ],
        correct: [0],
        explanation: "ISA (Instruction Set Architecture) is the interface between software and hardware. The two main ISA categories are **RISC** and **CISC**. RISC uses simpler, uniform-length instructions (e.g., RISC-V, ARM), while CISC uses complex, variable-length instructions (e.g., x86).",
        walkthroughSteps: [
          "ISA stands for **Instruction Set Architecture** — it defines registers, data types, addressing modes, instruction formats, and available operations.",
          "**RISC** (Reduced Instruction Set Computer): simpler instructions, hardware is simpler, more power-efficient, but may need more instructions for complex tasks.",
          "**CISC** (Complex Instruction Set Computing): complex multi-step instructions, fewer lines of code needed, but hardware is more complex and power-hungry.",
          "Key tradeoff: RISC favors **simplicity and pipelining**; CISC favors **code density and fewer instructions per task**."
        ],
        references: ["Assignment 1 Problem 1a", "Topic 1 Lecture Slides"],
        tags: ["isa", "risc", "cisc", "chapter-1"]
      },
      {
        id: "ca-fund-q2",
        type: "single",
        prompt: "Which of the following is **NOT** an advantage of RISC architecture?",
        options: [
          "Simpler instruction set design",
          "Less expensive and power efficient",
          "Efficient complex computations with fewer instructions",
          "Simpler hardware implementation"
        ],
        correct: [2],
        explanation: "\"Efficient complex computations with fewer instructions\" is a CISC advantage, not RISC. RISC advantages include simpler instruction design, lower cost/power, and simpler hardware. RISC typically requires **more** instructions for complex operations.",
        walkthroughSteps: [
          "RISC advantages: (1) Simpler instruction set, (2) Less expensive & power efficient, (3) Simpler hardware.",
          "RISC disadvantages: (1) Less efficient for complex tasks, (2) More lines of code needed, (3) Compiler must do more work.",
          "CISC advantages: (1) Efficient complex computations, (2) Better code density, (3) Fewer instructions needed.",
          "Option C describes a CISC strength — RISC needs *more* instructions for complex work, not fewer."
        ],
        references: ["Assignment 1 Problem 1a"],
        tags: ["isa", "risc", "cisc", "chapter-1"]
      },
      {
        id: "ca-fund-q3",
        type: "single",
        prompt: "According to **Flynn's Taxonomy**, which type has multiple instruction streams operating on multiple data streams, where each processor runs independently?",
        options: [
          "SISD — Single Instruction, Single Data",
          "SIMD — Single Instruction, Multiple Data",
          "MISD — Multiple Instruction, Single Data",
          "MIMD — Multiple Instruction, Multiple Data"
        ],
        correct: [3],
        explanation: "MIMD (Multiple Instruction Streams, Multiple Data Streams) involves multiple processors running independently, each executing different instructions on different data. This includes both tightly-coupled and loosely-coupled systems.",
        walkthroughSteps: [
          "**SISD**: One instruction, one data stream — sequential (e.g., early single-core CPUs).",
          "**SIMD**: One instruction applied to many data elements in parallel — used in GPUs, vector processors, image processing.",
          "**MISD**: Multiple instructions on single data — no commercial implementations exist.",
          "**MIMD**: Multiple instructions on multiple data streams independently — this is what modern multi-core and distributed systems use."
        ],
        references: ["Assignment 1 Problem 1c", "Topic 1 Lecture — Flynn's Taxonomy"],
        tags: ["parallelism", "flynns-taxonomy", "chapter-1"]
      },
      {
        id: "ca-fund-q4",
        type: "single",
        prompt: "What are the four types of parallelism in Computer Architecture?",
        options: [
          "Data-Level (DLP), Task-Level (TLP), Instruction-Level (ILP), and Request-Level (RLP)",
          "Thread-Level, Process-Level, Core-Level, and Chip-Level",
          "Pipeline, Superscalar, VLIW, and Vector",
          "Spatial, Temporal, Functional, and Structural"
        ],
        correct: [0],
        explanation: "The four types of parallelism are **Data-Level Parallelism (DLP)**, **Task-Level Parallelism (TLP)**, **Instruction-Level Parallelism (ILP)**, and **Request-Level Parallelism (RLP)**.",
        walkthroughSteps: [
          "**DLP** — same operation on many data elements (e.g., vector addition).",
          "**TLP** — different tasks/threads running concurrently.",
          "**ILP** — executing multiple instructions from one stream simultaneously (pipelining, superscalar).",
          "**RLP** — handling many independent requests concurrently (e.g., web servers)."
        ],
        references: ["Assignment 1 Problem 1b", "Topic 1 Lecture Slides"],
        tags: ["parallelism", "chapter-1"]
      },
      {
        id: "ca-fund-q5",
        type: "free",
        prompt: "A single-cycle processor has a clock frequency of **0.5 GHz**. A multicycle processor has a clock frequency of **2 GHz**. A pipeline processor has a clock period **0.1 ns longer** than the multicycle processor.\n\nA program has **40% ALU**, **20% branch**, and **40% memory** operations with IC = 1000.\n- Single-cycle: 1 CC per instruction\n- Multicycle: 4 CC for ALU/branch, 5 CC for memory\n- Pipeline: CPI = 1\n\n**Calculate the CPU time for each processor and determine which performs best.**",
        explanation: "The pipeline processor is fastest at **0.6 µs**, followed by single-cycle at **2.0 µs**, and multicycle at **2.2 µs**. Pipeline wins because although its clock period is slightly longer than multicycle, it achieves CPI = 1 through overlapping execution.",
        sampleAnswer: "Single-cycle: 2.0 µs, Multicycle: 2.2 µs, Pipeline: 0.6 µs — Pipeline performs best.",
        hintSteps: [
          "Start by finding each processor's **clock period** (T = 1/f).",
          "Calculate **total clock cycles** for each: single-cycle uses IC × CPI; multicycle sums per-type; pipeline uses IC × 1.",
          "CPU Time = Total Cycles × Clock Period.",
          "Compare the three CPU times — smallest wins."
        ],
        walkthroughSteps: [
          "**Single-cycle**: T_s = 1/(0.5×10⁹) = **2 ns**. Cycles = 1000 × 1 = 1000. CPU Time = 1000 × 2ns = **2000 ns = 2.0 µs**.",
          "**Multicycle**: T_m = 1/(2×10⁹) = **0.5 ns**. Cycles = 400(4) + 200(4) + 400(5) = 1600 + 800 + 2000 = **4400**. CPU Time = 4400 × 0.5ns = **2200 ns = 2.2 µs**.",
          "**Pipeline**: T_p = T_m + 0.1ns = 0.5 + 0.1 = **0.6 ns**. CPI = 1, so Cycles = 1000. CPU Time = 1000 × 0.6ns = **600 ns = 0.6 µs**.",
          "Comparing: Single-cycle (2.0 µs) > Multicycle (2.2 µs) > **Pipeline (0.6 µs)**. The pipeline processor performs best due to the lowest execution time."
        ],
        references: ["Assignment 1 Problem 2", "CPU Time = IC × CPI × T_clk"],
        tags: ["performance", "cpu-time", "pipeline", "chapter-1"]
      },
      {
        id: "ca-fund-q6",
        type: "single",
        prompt: "The CPU performance equation is: `CPU Time = IC × CPI × T_clk`. Which factor does **compiler optimization** primarily affect?",
        options: [
          "Clock cycle time (T_clk)",
          "Instruction Count (IC)",
          "Cycles Per Instruction (CPI)",
          "Both IC and CPI"
        ],
        correct: [3],
        explanation: "Compiler optimization affects **both IC and CPI**. A better compiler can reduce the total number of instructions (IC) by eliminating redundant operations, AND it can choose instructions with lower CPI (e.g., avoiding expensive division when shifts work).",
        walkthroughSteps: [
          "**IC (Instruction Count)**: Compiler can reduce total instructions through dead code elimination, loop unrolling, strength reduction.",
          "**CPI (Cycles Per Instruction)**: Compiler can choose simpler instructions, reorder to avoid hazards, and improve cache locality.",
          "**T_clk**: This is determined by hardware design, not the compiler.",
          "Therefore the compiler primarily influences **both IC and CPI** through instruction selection and scheduling."
        ],
        references: ["Topic 1 Lecture — Performance Metrics"],
        tags: ["performance", "cpu-time", "chapter-1"]
      },
      {
        id: "ca-fund-q7",
        type: "single",
        prompt: "In RISC-V, which register is **hardwired to zero** and cannot be modified?",
        options: [
          "ra (x1)",
          "sp (x2)",
          "zero (x0)",
          "gp (x3)"
        ],
        correct: [2],
        explanation: "Register **x0 (zero)** is hardwired to the value 0 in RISC-V. Writing to x0 has no effect — it always reads as 0. This is useful for constructing operations like `mov` (add rd, rs, zero) and conditional branches (beq zero, zero, label for unconditional jump).",
        walkthroughSteps: [
          "RISC-V has **32 integer registers** (x0 through x31).",
          "**x0 = zero**: Always 0, writes are discarded. Enables pseudo-instructions like `mv rd, rs` → `add rd, rs, x0`.",
          "**x1 = ra**: Return address (caller-saved).",
          "**x2 = sp**: Stack pointer. Arguments go in **a0–a7**, saved registers are **s0–s11**."
        ],
        references: ["Topic 1 Lecture — RISC-V Registers", "RISC-V Reference Sheet"],
        tags: ["risc-v", "registers", "isa"]
      }
    ]
  },
  {
    id: "ca-assembly",
    courseId: "computer-architecture",
    title: "RISC-V Assembly & Machine Code",
    description: "C-to-assembly translation, machine code encoding/decoding, function calls with stack — from Assignments 2–5 and Midterm exam.",
    difficulty: "Intermediate",
    estMinutes: 40,
    tags: ["assembly", "machine-code", "functions", "exam-aligned"],
    timerDefaultMinutes: 35,
    questions: [
      {
        id: "ca-asm-q1",
        type: "free",
        prompt: "Write RISC-V assembly to initialize register `a0` with the value **0xABCD_1234** using only **2 instructions**.",
        explanation: "Use `lui` to load the upper 20 bits, then `ori` to fill in the lower 12 bits. Split: upper = 0xABCD1, lower = 0x234.",
        sampleAnswer: "lui a0, 0xABCD1\nori a0, a0, 0x234",
        hintSteps: [
          "You need to load a 32-bit constant but RISC-V immediates are at most 20 bits (lui) or 12 bits (I-type).",
          "Use **lui** (Load Upper Immediate) to set bits [31:12], then an I-type instruction for bits [11:0].",
          "Split: 0xABCD_1234 → upper 20 bits = 0xABCD1, lower 12 bits = 0x234."
        ],
        walkthroughSteps: [
          "**Goal**: Load 0xABCD_1234 into a0 using exactly 2 instructions.",
          "**Step 1**: Split the 32-bit value. `lui` loads a 20-bit immediate into bits [31:12]. We need upper = **0xABCD1**.",
          "**Step 2**: The lower 12 bits are **0x234**. Use `ori` (OR immediate) to set them: `ori a0, a0, 0x234`.",
          "**Verification**: 0xABCD1 << 12 = 0xABCD1000. Then 0xABCD1000 | 0x234 = **0xABCD1234**.",
          "**Final answer**: `lui a0, 0xABCD1` then `ori a0, a0, 0x234`."
        ],
        references: ["Assignment 2 Problem 1a"],
        tags: ["assembly", "lui", "immediate", "risc-v"]
      },
      {
        id: "ca-asm-q2",
        type: "free",
        prompt: "Convert the following C code to RISC-V assembly:\n\n```c\na = (b + c) - (d - 15);\n```\n\nAssume a, b, c, d → s0, s1, s2, s3.",
        explanation: "Break the expression into parts: compute (b+c) in a temp, compute (d-15) in another temp, then subtract.",
        sampleAnswer:
          "```asm\n# a: s0, b: s1, c: s2, d: s3\n# Temporary registers used: t0, t1\n\nadd  t0, s1, s2      # t0 = b + c\naddi t1, s3, -15     # t1 = d - 15\nsub  s0, t0, t1      # a = t0 - t1\n```\n\nNo comments:\n\n```asm\nadd  t0, s1, s2\naddi t1, s3, -15\nsub  s0, t0, t1\n```",
        hintSteps: [
          "Split the expression: `(b + c)` and `(d - 15)` need to be computed separately first.",
          "Use `add` for register-register addition, `addi` for subtracting 15 (add -15).",
          "Store intermediates in temporary registers (t0, t1), then `sub` for the final result.",
          "Final assembly should be exactly 3 instructions with destination `s0`."
        ],
        walkthroughSteps: [
          "**Mapping**: a → s0, b → s1, c → s2, d → s3.",
          "**Compute (b + c)**: `add t0, s1, s2` — t0 now holds b + c.",
          "**Compute (d - 15)**: `addi t1, s3, -15` — t1 now holds d - 15. Note: subtract 15 = add (-15).",
          "**Final subtraction**: `sub s0, t0, t1` — s0 = (b+c) - (d-15) = a.",
          "**Final answer format**:\n```asm\n# a: s0, b: s1, c: s2, d: s3\n# Temporary registers used: t0, t1\n\nadd  t0, s1, s2      # t0 = b + c\naddi t1, s3, -15     # t1 = d - 15\nsub  s0, t0, t1      # a = t0 - t1\n```\nNo comments:\n```asm\nadd  t0, s1, s2\naddi t1, s3, -15\nsub  s0, t0, t1\n```"
        ],
        references: ["Assignment 2 Problem 2"],
        tags: ["assembly", "c-to-asm", "arithmetic", "risc-v"]
      },
      {
        id: "ca-asm-q3",
        type: "free",
        prompt: "Convert to RISC-V assembly:\n\n```c\nVec[8] = Vec[4] + a - 120;\n```\n\nAssume: a → s0, base address of Vec in a0. Use temporary registers.",
        explanation: "Load Vec[4] from memory (offset = 4×4 = 16 bytes), add `a`, subtract 120, then store into Vec[8] (offset = 8×4 = 32 bytes).",
        sampleAnswer: "lw t0, 16(a0)\naddi t0, t0, -120\nadd t0, t0, s0\nsw t0, 32(a0)",
        hintSteps: [
          "For int arrays, **byte offset = index × 4**. Vec[4] is at offset 16, Vec[8] is at offset 32.",
          "Use `lw` to load Vec[4], `addi` to subtract 120, `add` to add a, `sw` to store result.",
          "Order of add/subtract doesn't matter for the final result since addition is commutative."
        ],
        walkthroughSteps: [
          "**Array offsets**: Each int is 4 bytes. Vec[4] offset = 4 × 4 = **16**. Vec[8] offset = 8 × 4 = **32**.",
          "**Load Vec[4]**: `lw t0, 16(a0)` — loads the word at address (a0 + 16) into t0.",
          "**Subtract 120**: `addi t0, t0, -120` — t0 = Vec[4] - 120.",
          "**Add a**: `add t0, t0, s0` — t0 = Vec[4] + a - 120.",
          "**Store into Vec[8]**: `sw t0, 32(a0)` — writes t0 to memory at address (a0 + 32)."
        ],
        references: ["Assignment 2 Problem 3"],
        tags: ["assembly", "arrays", "memory", "lw-sw", "risc-v"]
      },
      {
        id: "ca-asm-q4",
        type: "free",
        prompt: "Convert to RISC-V assembly:\n\n```c\nif (i == j)\n    a = b + c;\nelse\n    a = b - c;\n```\n\nAssume: a, b, c, i, j → a0, a1, a2, s6, s7.",
        explanation: "Use `beq` to branch when i == j. The else block (subtraction) falls through, then unconditionally jumps past the if block.",
        sampleAnswer: "beq s6, s7, equal\nsub a0, a1, a2\nbeq zero, zero, exit\nequal:\nadd a0, a1, a2\nexit:",
        hintSteps: [
          "Start with a conditional branch: `beq s6, s7, equal` — if i == j, jump to the `equal` label.",
          "If NOT equal (falls through): execute the else block `sub a0, a1, a2`, then jump over the if block.",
          "At the `equal` label: execute `add a0, a1, a2`. Use `beq zero, zero, exit` as unconditional jump."
        ],
        walkthroughSteps: [
          "**Strategy**: Test the condition first, branch to the `if` body, let the `else` body be the fall-through.",
          "**Branch**: `beq s6, s7, equal` — if i == j, jump to label `equal`.",
          "**Else block** (falls through when i ≠ j): `sub a0, a1, a2` — a = b - c.",
          "**Skip past if block**: `beq zero, zero, exit` — unconditional jump (zero always equals zero).",
          "**If block at `equal`**: `add a0, a1, a2` — a = b + c.",
          "**Exit label**: Both paths converge here."
        ],
        references: ["Assignment 3 Problem 1", "Midterm Exam A1a"],
        tags: ["assembly", "branching", "if-else", "risc-v"]
      },
      {
        id: "ca-asm-q5",
        type: "free",
        prompt: "Convert to RISC-V assembly:\n\n```c\nfor (i = 0; i <= 100; i++) {\n    A[2*i] = a + A[i];\n}\n```\n\nAssume: i → a0, a → s0, base address of A = 0xEA38_257C → s2.",
        explanation: "Initialize the base address with lui/ori, loop with bge for exit condition, compute array offsets with slli, load/add/store for the body.",
        sampleAnswer: "lui s2, 0xEA382 / ori s2, s2, 0x57C / addi a0, zero, 0 / addi t0, zero, 101 / loop: bge a0, t0, exit / ...",
        hintSteps: [
          "First load the base address 0xEA38_257C into s2 using `lui` and `ori`.",
          "Initialize i=0, set loop bound to 101 (exit when i >= 101, equivalent to i > 100).",
          "Inside loop: A[i] offset = 4*i (slli by 2), A[2*i] offset = 8*i (slli by 3).",
          "Load A[i], add a, store result to A[2*i], increment i, jump back."
        ],
        walkthroughSteps: [
          "**Load base address**: Split 0xEA38_257C → upper 20 bits = 0xEA382, lower 12 bits = 0x57C.\n`lui s2, 0xEA382` then `ori s2, s2, 0x57C`.",
          "**Init loop**: `addi a0, zero, 0` (i=0) and `addi t0, zero, 101` (bound).",
          "**Loop guard**: `bge a0, t0, exit` — exit when i >= 101 (i.e., i > 100).",
          "**Load A[i]**: `slli t1, a0, 2` (t1 = 4*i), `add t2, s2, t1` (t2 = &A[i]), `lw t3, 0(t2)` (t3 = A[i]).",
          "**Compute a + A[i]**: `add t4, s0, t3`.",
          "**Store to A[2*i]**: `slli t5, a0, 3` (t5 = 8*i), `add t6, s2, t5` (t6 = &A[2*i]), `sw t4, 0(t6)`.",
          "**Increment and loop**: `addi a0, a0, 1` then `beq zero, zero, loop`."
        ],
        references: ["Assignment 3 Problem 2", "Midterm Exam A1b"],
        tags: ["assembly", "loops", "arrays", "memory", "risc-v"]
      },
      {
        id: "ca-asm-q6",
        type: "free",
        prompt: "Convert the following C functions to RISC-V assembly using proper **calling convention and stack management**:\n\n```c\nint function1(int a, int b) {\n    if (function2(2*a, b) > 0)\n        return 1;\n    else\n        return 0;\n}\n\nint function2(int a, int b) {\n    return a - b;\n}\n```",
        explanation: "function1 is a **non-leaf** function (calls function2), so it must save `ra` on the stack. function2 is a **leaf** function — no stack needed. Arguments pass through a0/a1, return value in a0.",
        sampleAnswer: "function1: addi sp,sp,-4 / sw ra,0(sp) / slli a0,a0,1 / jal ra,function2 / ble a0,zero,ELSE / addi a0,zero,1 / beq zero,zero,EXIT / ELSE: addi a0,zero,0 / EXIT: lw ra,0(sp) / addi sp,sp,4 / jalr zero,0(ra)\nfunction2: sub a0,a0,a1 / jalr zero,0(ra)",
        hintSteps: [
          "Identify leaf vs non-leaf: function1 calls another function → **non-leaf** (must save ra). function2 doesn't → **leaf**.",
          "For non-leaf: allocate stack space, save ra, prepare arguments, call with `jal`, restore ra before returning.",
          "2*a = shift left by 1: `slli a0, a0, 1`. b is already in a1.",
          "Check result > 0 with `ble a0, zero, ELSE` (branch to ELSE if result ≤ 0)."
        ],
        walkthroughSteps: [
          "**function1 (non-leaf)** — calls function2, so must save return address.",
          "**Prologue**: `addi sp, sp, -4` / `sw ra, 0(sp)` — make stack space and save ra.",
          "**Prepare args**: `slli a0, a0, 1` — a0 = 2*a. b is already in a1.",
          "**Call**: `jal ra, function2` — jump to function2, saving return address in ra.",
          "**Branch on result**: `ble a0, zero, ELSE` — if result ≤ 0, go to ELSE.",
          "**True block**: `addi a0, zero, 1` (return 1) then `beq zero, zero, EXIT`.",
          "**ELSE block**: `addi a0, zero, 0` (return 0).",
          "**Epilogue at EXIT**: `lw ra, 0(sp)` / `addi sp, sp, 4` / `jalr zero, 0(ra)` — restore ra, deallocate stack, return.",
          "**function2 (leaf)**: Just `sub a0, a0, a1` / `jalr zero, 0(ra)` — no stack needed."
        ],
        references: ["Assignment 4 Problem 1", "Midterm Exam A2"],
        tags: ["assembly", "functions", "stack", "calling-convention", "risc-v"]
      },
      {
        id: "ca-asm-q7",
        type: "free",
        prompt: "Translate the following RISC-V instruction into **32-bit machine code (hex)**:\n\n```\nlw s1, 120(a0)\n```",
        explanation: "This is an I-type instruction. Encode: imm[11:0] | rs1 | funct3 | rd | opcode. Result: **0x0785_2483**.",
        sampleAnswer: "0x07852483",
        hintSteps: [
          "`lw` is I-type format: `imm[11:0] | rs1 | funct3 | rd | opcode`.",
          "Look up: opcode(lw) = 0000011, funct3(lw) = 010.",
          "Registers: rd = s1 = x9, rs1 = a0 = x10. Immediate = 120₁₀.",
          "Convert 120 to 12-bit binary, assemble all fields, convert to hex."
        ],
        walkthroughSteps: [
          "**Identify format**: `lw` is a **Load** instruction → I-type format.",
          "**Field values**: opcode = 0000011 (0x03), funct3 = 010, rd = s1 = x9 = 01001, rs1 = a0 = x10 = 01010, imm = 120 = 0x078 = 000001111000.",
          "**Assemble bits** [31:0]: `000001111000 | 01010 | 010 | 01001 | 0000011`.",
          "**Group into 4-bit nibbles**: 0000 0111 1000 0101 0010 0100 1000 0011.",
          "**Convert to hex**: 0 7 8 5 2 4 8 3 → **0x07852483**."
        ],
        references: ["Assignment 5 Problem 1"],
        tags: ["machine-code", "encoding", "i-type", "risc-v"]
      },
      {
        id: "ca-asm-q8",
        type: "free",
        prompt: "Translate the following C code into RISC-V assembly, then convert **both instructions** to machine code (hex):\n\n```c\na = b - c - 100;\n```\n\nAssume: a → a1 (x11), b → a2 (x12), c → a3 (x13). Use t0 for intermediate values.",
        explanation: "First instruction: `sub t0, a2, a3` (R-type → 0x40D602B3). Second: `addi a1, t0, -100` (I-type → 0xF9C28593).",
        sampleAnswer: "sub t0, a2, a3 → 0x40D602B3\naddi a1, t0, -100 → 0xF9C28593",
        hintSteps: [
          "Split: first compute b-c into t0, then subtract 100 with addi (add -100).",
          "`sub` is R-type: funct7=0100000, funct3=000, opcode=0110011.",
          "`addi` is I-type: funct3=000, opcode=0010011. -100 in 12-bit two's complement = 0xF9C.",
          "Registers: t0=x5, a1=x11, a2=x12, a3=x13."
        ],
        walkthroughSteps: [
          "**Assembly**: `sub t0, a2, a3` (t0 = b-c) then `addi a1, t0, -100` (a1 = t0-100).",
          "**Encode sub (R-type)**: funct7=0100000, rs2=a3=x13=01101, rs1=a2=x12=01100, funct3=000, rd=t0=x5=00101, opcode=0110011.\nBinary: 0100000 01101 01100 000 00101 0110011 → **0x40D602B3**.",
          "**Encode addi (I-type)**: imm = -100 → 12-bit two's complement: 4096-100 = 3996 = 0xF9C = 111110011100.\nrs1=t0=x5=00101, funct3=000, rd=a1=x11=01011, opcode=0010011.\nBinary: 111110011100 00101 000 01011 0010011 → **0xF9C28593**."
        ],
        references: ["Assignment 5 Problem 2"],
        tags: ["machine-code", "encoding", "r-type", "i-type", "risc-v"]
      },
      {
        id: "ca-asm-q9",
        type: "free",
        prompt: "Translate the following **machine code** into a RISC-V assembly instruction:\n\n```\n0x4168_0FB3\n```",
        explanation: "Decode: opcode = 0110011 (R-type), rd = t6 (x31), funct3 = 000, rs1 = a6 (x16), rs2 = s6 (x22), funct7 = 0100000 → **sub t6, a6, s6**.",
        sampleAnswer: "sub t6, a6, s6",
        hintSteps: [
          "Convert hex to binary: 0x41680FB3 = 0100 0001 0110 1000 0000 1111 1011 0011.",
          "Extract opcode [6:0] = 0110011 → R-type.",
          "For R-type: extract rd[11:7], funct3[14:12], rs1[19:15], rs2[24:20], funct7[31:25].",
          "funct7=0100000 with funct3=000 and opcode=0110011 → SUB instruction."
        ],
        walkthroughSteps: [
          "**Hex to binary**: 0x41680FB3 = 0100 0001 0110 1000 0000 1111 1011 0011.",
          "**Extract opcode** [6:0] = 0110011 → **R-type (OP)**.",
          "**Extract fields**: rd[11:7] = 11111 = x31 = **t6**, funct3[14:12] = 000, rs1[19:15] = 10000 = x16 = **a6**, rs2[24:20] = 10110 = x22 = **s6**, funct7[31:25] = 0100000.",
          "**Decode operation**: opcode=0110011 + funct3=000 + funct7=0100000 (bit 30 set) → **SUB**.",
          "**Final instruction**: `sub t6, a6, s6` — meaning t6 = a6 - s6."
        ],
        references: ["Assignment 5 Problem 3", "Midterm Exam A4"],
        tags: ["machine-code", "decoding", "r-type", "risc-v"]
      },
      {
        id: "ca-asm-q10",
        type: "free",
        prompt: "Translate to machine code (hex):\n\n```\naddi t0, zero, -101\n```",
        explanation: "I-type: imm = -101 in 12-bit two's complement = 0xF9B. zero = x0, t0 = x5, funct3 = 000, opcode = 0010011. Result: **0xF9B00293**.",
        sampleAnswer: "0xF9B00293",
        hintSteps: [
          "`addi` is I-type: imm[11:0] | rs1 | funct3 | rd | opcode.",
          "opcode(addi) = 0010011, funct3 = 000.",
          "-101 in 12-bit two's complement: 4096 - 101 = 3995 = 0xF9B.",
          "rs1 = zero = x0 = 00000, rd = t0 = x5 = 00101."
        ],
        walkthroughSteps: [
          "**Format**: `addi` is I-type: `imm[11:0] | rs1 | funct3 | rd | opcode`.",
          "**Immediate**: -101₁₀ → 12-bit two's complement: 4096 - 101 = 3995 = **0xF9B** = 111110011011.",
          "**Fields**: rs1 = zero = x0 = 00000, funct3 = 000, rd = t0 = x5 = 00101, opcode = 0010011.",
          "**Assemble**: 111110011011 00000 000 00101 0010011.",
          "**Group and convert**: 1111 1001 1011 0000 0000 0010 1001 0011 → **0xF9B00293**."
        ],
        references: ["Midterm Exam A3"],
        tags: ["machine-code", "encoding", "i-type", "risc-v"]
      }
    ]
  },
  {
    id: "ca-pipeline",
    courseId: "computer-architecture",
    title: "Pipeline, Hazards & Branch Prediction",
    description: "5-stage pipeline analysis, RAW hazard detection, forwarding, stalls, and 2-bit branch prediction — from Topic 2 lectures and Midterm exam.",
    difficulty: "Advanced",
    estMinutes: 30,
    tags: ["pipeline", "hazards", "forwarding", "branch-prediction", "exam-aligned"],
    timerDefaultMinutes: 25,
    questions: [
      {
        id: "ca-pipe-q1",
        type: "single",
        prompt: "In a 5-stage RISC-V pipeline (IF, ID, EX, MEM, WB), a **RAW (Read After Write) hazard** occurs when:",
        options: [
          "An instruction writes to a register before the previous instruction reads it",
          "A consumer instruction tries to read a register before the producer instruction has written it back",
          "Two instructions write to the same register in the same cycle",
          "A branch instruction causes the pipeline to flush"
        ],
        correct: [1],
        explanation: "A **RAW hazard** occurs when a consumer instruction needs to read a register value that a producer instruction hasn't written back yet. The consumer is in the ID stage trying to read, but the producer hasn't reached WB yet.",
        walkthroughSteps: [
          "**RAW = Read After Write**: The dependent instruction wants to READ a value that hasn't been WRITTEN yet.",
          "Example: `add x1, x2, x3` followed by `sub x4, x1, x5` — the sub needs x1 but add hasn't written it back.",
          "Without forwarding, the consumer must **stall** until the producer reaches WB.",
          "With forwarding, the result can be forwarded from EX/MEM pipeline registers, avoiding most stalls (except load-use)."
        ],
        references: ["Topic 2 Lecture — Data Hazards", "Midterm Exam A5a"],
        tags: ["pipeline", "hazards", "raw", "chapter-2"]
      },
      {
        id: "ca-pipe-q2",
        type: "free",
        prompt: "For the following RISC-V instructions, **identify all RAW dependencies and hazards**:\n\n```\nlw   sp, 20(ra)\nand  tp, sp, t0\nor   s0, sp, t1\nadd  s1, tp, t0\nbeq  s0, s1, label\n```",
        explanation: "RAW dependencies exist wherever an instruction reads a register written by a previous instruction. Hazards occur when the write hasn't completed by the time the read happens in the pipeline.",
        sampleAnswer: "Dependencies: (1→2) sp, (1→3) sp, (2→4) tp, (3→5) s0, (4→5) s1. Hazards on: sp(1→2), sp(1→3), tp(2→4), s0(3→5), s1(4→5).",
        hintSteps: [
          "List what each instruction **writes** (destination register).",
          "For each instruction, check if any **source register** was written by a recent prior instruction.",
          "A hazard exists when the distance is small enough that the write hasn't reached WB by the time the read happens in ID."
        ],
        walkthroughSteps: [
          "**Instruction 1** (`lw sp, 20(ra)`): Writes **sp**. Reads ra.",
          "**Instruction 2** (`and tp, sp, t0`): Reads **sp** (written by I1) → **RAW hazard on sp (I1→I2)**. Writes tp.",
          "**Instruction 3** (`or s0, sp, t1`): Reads **sp** (written by I1) → **RAW dependency on sp (I1→I3)**. Writes s0.",
          "**Instruction 4** (`add s1, tp, t0`): Reads **tp** (written by I2) → **RAW hazard on tp (I2→I4)**. Writes s1.",
          "**Instruction 5** (`beq s0, s1, label`): Reads **s0** (from I3) and **s1** (from I4) → **RAW hazards on s0 (I3→I5) and s1 (I4→I5)**.",
          "**Critical hazard**: I1→I2 is a **load-use hazard** (lw followed immediately by use of sp) — this requires a stall even with forwarding."
        ],
        references: ["Midterm Exam A5a"],
        tags: ["pipeline", "hazards", "raw", "chapter-2"]
      },
      {
        id: "ca-pipe-q3",
        type: "single",
        prompt: "Which hazard **cannot** be resolved by forwarding alone and always requires at least one stall (bubble)?",
        options: [
          "ALU-to-ALU dependency (e.g., add followed by sub using same register)",
          "Load-use dependency (e.g., lw followed immediately by an instruction using the loaded value)",
          "Store-after-load dependency",
          "Branch target resolution"
        ],
        correct: [1],
        explanation: "A **load-use hazard** cannot be fully resolved by forwarding because the loaded value isn't available until the end of the MEM stage, but the dependent instruction needs it at the beginning of EX. This requires at least **one bubble (stall cycle)**.",
        walkthroughSteps: [
          "Forwarding can bypass results from the EX/MEM or MEM/WB pipeline registers to the ALU inputs.",
          "For ALU instructions, the result is ready after EX — forwarding from EX/MEM works for the next instruction.",
          "For **load (lw)**, the data isn't available until the **end of MEM** stage — but the next instruction needs it at the **start of EX**.",
          "Since MEM and EX happen at the same time for consecutive instructions, we'd need to forward \"backward in time\" — impossible! So we must insert **one stall cycle**."
        ],
        references: ["Topic 2 Lecture — Load-Use Hazard", "Midterm Exam A5b"],
        tags: ["pipeline", "hazards", "forwarding", "stalls", "chapter-2"]
      },
      {
        id: "ca-pipe-q4",
        type: "single",
        prompt: "In a **2-bit dynamic branch predictor**, what are the four states?",
        options: [
          "Strong Taken, Weak Taken, Weak Not-Taken, Strong Not-Taken",
          "Always Taken, Sometimes Taken, Sometimes Not-Taken, Always Not-Taken",
          "Predict, Execute, Verify, Update",
          "Branch, No-Branch, Stall, Flush"
        ],
        correct: [0],
        explanation: "The 2-bit predictor uses four states: **Strong Taken → Weak Taken → Weak Not-Taken → Strong Not-Taken**. A single misprediction only moves one state — you need two consecutive mispredictions to change the prediction direction. This provides **hysteresis**.",
        walkthroughSteps: [
          "The 2-bit predictor is a **finite state machine** with 4 states.",
          "**Strong Taken (ST)**: Predict taken. If wrong, move to Weak Taken (not all the way to not-taken).",
          "**Weak Taken (WT)**: Predict taken. If wrong, move to Weak Not-Taken (prediction flips).",
          "**Weak Not-Taken (WNT)**: Predict not-taken. If wrong, move to Weak Taken.",
          "**Strong Not-Taken (SNT)**: Predict not-taken. If wrong, move to Weak Not-Taken.",
          "**Key benefit**: A single anomalous branch outcome doesn't flip the prediction — this helps with loops that are taken many times then not-taken once at the end."
        ],
        references: ["Topic 2 Lecture — Branch Prediction", "Midterm Exam A6b"],
        tags: ["branch-prediction", "pipeline", "chapter-2"]
      },
      {
        id: "ca-pipe-q5",
        type: "single",
        prompt: "What is a **control hazard** and how does it differ from a **data hazard**?",
        options: [
          "Control hazards come from branch outcome uncertainty; data hazards come from register dependencies between instructions",
          "Control hazards affect the ALU; data hazards affect memory",
          "Control hazards only occur in multicycle processors; data hazards occur in pipelined processors",
          "They are the same thing with different names"
        ],
        correct: [0],
        explanation: "A **control hazard** occurs because the pipeline doesn't know which instruction to fetch next until a branch is resolved. A **data hazard** occurs when an instruction depends on a result that isn't available yet due to pipeline timing.",
        walkthroughSteps: [
          "**Data hazard**: Instruction B needs data produced by instruction A, but A hasn't finished writing it. Solved by forwarding or stalls.",
          "**Control hazard**: A branch instruction means we don't know the next PC until the branch is resolved (ID or EX stage). We might fetch wrong instructions.",
          "Control hazard solutions: (1) Stall until branch resolved, (2) Predict not-taken, (3) Dynamic prediction (2-bit), (4) Delayed branch.",
          "Data hazards are about **register values**; control hazards are about **instruction flow/PC**."
        ],
        references: ["Topic 2 Lecture", "Midterm Exam A6b"],
        tags: ["pipeline", "hazards", "control-hazard", "chapter-2"]
      },
      {
        id: "ca-pipe-q6",
        type: "single",
        prompt: "In the 5-stage pipeline (IF, ID, EX, MEM, WB), which stage does the **register file write-back** occur?",
        options: [
          "EX (Execute)",
          "MEM (Memory Access)",
          "WB (Write-Back)",
          "ID (Instruction Decode)"
        ],
        correct: [2],
        explanation: "The **WB (Write-Back)** stage is where computed results (from ALU or memory) are written back to the register file. This is the last pipeline stage.",
        walkthroughSteps: [
          "**IF** (Instruction Fetch): Fetch instruction from memory using PC.",
          "**ID** (Instruction Decode): Decode instruction and read register values.",
          "**EX** (Execute): ALU computes result, calculates addresses, evaluates branches.",
          "**MEM** (Memory Access): Load/store access data memory.",
          "**WB** (Write-Back): Result written to destination register in the register file."
        ],
        references: ["Topic 2 Lecture — 5-Stage Pipeline"],
        tags: ["pipeline", "stages", "chapter-2"]
      }
    ]
  }
];

export const computerArchitectureQuizSets: QuizSet[] = computerArchitectureQuizSetsRaw.map((set) => ({
  ...set,
  mode: set.mode ?? "quiz"
}));
