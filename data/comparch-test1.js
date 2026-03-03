// United Exams - Computer Architecture Core Bank (aligned to TrainingData)
window.COMPARCH_TEST1_BANK = [

// Professor-priority questions from Midterm/Handouts
{id:"CP1",chapter:2,type:"single",fromProfessor:true,topics:["assembly","branch"],
  question:"For C code `if (i == j) a = b + c; else a = b - c;` with i in s6 and j in s7, the branch condition should compare:",
  options:["s6 and s7", "a0 and a1", "ra and sp", "t0 and t1"],
  answer:[0],
  explanation:"The condition depends on i and j, so compare s6 with s7 before choosing add/sub path."},

{id:"CP2",chapter:2,type:"single",fromProfessor:true,topics:["assembly","array-addressing"],
  question:"In `A[2*i] = a + A[i]` for 4-byte integers, the byte offset for A[2*i] is:",
  options:["i << 1", "i << 2", "i << 3", "i << 4"],
  answer:[2],
  explanation:"Index 2*i times 4 bytes = 8*i, implemented as left shift by 3."},

{id:"CP3",chapter:2,type:"single",fromProfessor:true,topics:["machine-code","encoding"],
  question:"Machine code (hex) for `addi t0, zero, -101` is:",
  options:["0xF9B00293", "0xF9B00313", "0x09B00293", "0x41680FB3"],
  answer:[0],
  explanation:"-101 encoded in 12-bit immediate (two's complement) with rd=t0 and opcode for ADDI."},

{id:"CP4",chapter:2,type:"single",fromProfessor:true,topics:["machine-code","decode"],
  question:"Instruction `0x41680FB3` decodes to:",
  options:["add x31, x16, x22", "sub x31, x16, x22", "and x31, x16, x22", "beq x31, x16, x22"],
  answer:[1],
  explanation:"R-type with funct7=0100000 and funct3=000 corresponds to SUB."},

{id:"CP5",chapter:3,type:"single",fromProfessor:true,topics:["pipeline","hazards"],
  question:"In a 5-stage pipeline, a load-use dependency typically requires a stall because:",
  options:[
    "Register file cannot be written at all.",
    "Loaded value is produced too late for immediate next EX stage operand use.",
    "Branch predictor disables forwarding.",
    "All loads are multicycle and unpipelined by definition.",
  ],answer:[1],
  explanation:"Load result becomes available after MEM, often too late for next instruction EX without bubble."},

{id:"CP6",chapter:3,type:"single",fromProfessor:true,topics:["branch-prediction","2-bit"],
  question:"A 2-bit dynamic predictor reduces mispredictions vs 1-bit because it:",
  options:[
    "Eliminates branch hazards completely.",
    "Requires two consecutive opposite outcomes to reverse strong prediction.",
    "Uses floating-point confidence counters.",
    "Predicts using opcode parity.",
  ],answer:[1],
  explanation:"Saturating 2-bit FSM adds hysteresis against one-off branch behavior."},

// Chapter 1: fundamentals and ISA
{id:"C1-01",chapter:1,type:"single",topics:["performance","metrics"],
  question:"Which metric measures time to finish one task?",
  options:["Throughput", "Response time", "Utilization", "Bandwidth"],
  answer:[1],
  explanation:"Response time (latency) is completion time for a single task."},

{id:"C1-02",chapter:1,type:"single",topics:["performance","speedup"],
  question:"Speedup of machine X over machine Y is:",
  options:["Exec time X / Exec time Y", "Exec time Y / Exec time X", "CPI X / CPI Y", "Clock rate X / Clock rate Y"],
  answer:[1],
  explanation:"Lower execution time means better performance; ratio uses Y over X."},

{id:"C1-03",chapter:1,type:"single",topics:["cpu-time","equation"],
  question:"Processor performance equation is commonly written as CPU time =",
  options:["IC + CPI + cycle time", "IC x CPI x cycle time", "IC / CPI / cycle time", "CPI / IC x cycle time"],
  answer:[1],
  explanation:"Instruction count times cycles per instruction times cycle time."},

{id:"C1-04",chapter:1,type:"single",topics:["isa","architecture-definition"],
  question:"In the slides, the 'old' view of architecture focused mainly on:",
  options:["Cooling and datacenter design", "ISA decisions only", "Compiler optimization only", "Network protocols"],
  answer:[1],
  explanation:"Old view centered on ISA choices (registers, addressing, encoding, etc.)."},

{id:"C1-05",chapter:1,type:"single",topics:["parallelism","flynn"],
  question:"SIMD stands for:",
  options:["Single instruction, multiple data", "Single instruction, mixed data", "Sequential instruction, multiple decode", "Synchronous instruction, memory distributed"],
  answer:[0],
  explanation:"Flynn taxonomy: single instruction stream over multiple data streams."},

{id:"C1-06",chapter:1,type:"multi",topics:["isa","risc-v"],
  question:"According to Topic 1 slides, ISA design decisions include: (Select all that apply)",
  options:["Registers", "Addressing modes", "Instruction encoding", "Cooling fan geometry"],
  answer:[0,1,2],
  explanation:"ISA defines programmer-visible instruction/register/address behavior."},

{id:"C1-07",chapter:1,type:"fill",topics:["registers","risc-v"],
  question:"RISC-V register x0 always contains constant _______.",
  answer:["0"],acceptableAnswers:[["0"],["zero"]],
  explanation:"x0 is hardwired zero."},

{id:"C1-08",chapter:1,type:"single",topics:["addressing-modes","risc-v"],
  question:"RISC-V base addressing mode for load/store is commonly:",
  options:["PC-relative only", "base + offset displacement", "autoincrement", "stack-implied only"],
  answer:[1],
  explanation:"Loads/stores use register base with immediate offset."},

// Chapter 2: assembly and instruction formats
{id:"C2-01",chapter:2,type:"single",topics:["instruction-format","r-type"],
  question:"Register-register ALU instructions like add/sub are typically:",
  options:["R-type", "S-type", "B-type", "U-type"],
  answer:[0],
  explanation:"R-type contains rd, rs1, rs2 and funct fields."},

{id:"C2-02",chapter:2,type:"single",topics:["instruction-format","types"],
  question:"Which format is used for branch instructions like beq?",
  options:["I-type", "B-type", "U-type", "R-type"],
  answer:[1],
  explanation:"Conditional branches use B-type immediate encoding."},

{id:"C2-03",chapter:2,type:"single",topics:["calling-convention","procedure"],
  question:"In standard RISC-V calling convention used in the midterm prompt, integer return value is placed in:",
  options:["sp", "ra", "a0", "s0"],
  answer:[2],
  explanation:"a0 carries first return value."},

{id:"C2-04",chapter:2,type:"single",topics:["calling-convention","procedure"],
  question:"For nested function calls, preserving return address is commonly done by:",
  options:["Overwriting x0", "Saving ra on stack", "Using t0 permanently", "Disabling jumps"],
  answer:[1],
  explanation:"Caller/callee save conventions use stack frame management."},

{id:"C2-05",chapter:2,type:"multi",topics:["assembly","loop"],
  question:"In array loop assembly, common operations include: (Select all that apply)",
  options:["Shift index for byte offset", "Add base address", "Load/store through computed address", "Modify opcode field directly at runtime"],
  answer:[0,1,2],
  explanation:"Address arithmetic combines scaled index with base pointer and memory op."},

{id:"C2-06",chapter:2,type:"fill",topics:["immediate","addi"],
  question:"`addi` uses a _______-bit signed immediate field in RV32I.",
  answer:["12"],acceptableAnswers:[["12"],["twelve"]],
  explanation:"I-type immediate is 12 bits."},

// Chapter 3: pipelining and hazards
{id:"C3-01",chapter:3,type:"single",topics:["pipeline-stages"],
  question:"Canonical 5-stage pipeline order is:",
  options:["IF-ID-EX-MEM-WB", "IF-EX-ID-MEM-WB", "ID-IF-EX-WB-MEM", "IF-ID-MEM-EX-WB"],
  answer:[0],
  explanation:"Standard RISC 5-stage sequence."},

{id:"C3-02",chapter:3,type:"single",topics:["hazards","raw"],
  question:"RAW hazard means:",
  options:["Read-after-write dependency", "Write-after-read dependency", "Write-after-write dependency", "Instruction cache miss"],
  answer:[0],
  explanation:"Consumer reads value before producer writes it."},

{id:"C3-03",chapter:3,type:"single",topics:["forwarding","hazards"],
  question:"Forwarding primarily helps reduce:",
  options:["Control hazards", "Data hazards", "Only structural hazards", "TLB misses"],
  answer:[1],
  explanation:"Bypassing routes produced values to dependent ALU inputs sooner."},

{id:"C3-04",chapter:3,type:"single",topics:["control-hazard","branch"],
  question:"Control hazards are caused mainly by:",
  options:["Loads", "Branches/jumps", "Integer adds", "Register spills"],
  answer:[1],
  explanation:"Next PC is uncertain until branch resolves."},

{id:"C3-05",chapter:3,type:"multi",topics:["branch-prediction","2-bit"],
  question:"2-bit branch predictor typically has states: (Select all that apply)",
  options:["Strongly taken", "Weakly taken", "Weakly not taken", "Strongly not taken"],
  answer:[0,1,2,3],
  explanation:"Classic 2-bit saturating FSM uses these four states."},

{id:"C3-06",chapter:3,type:"fill",topics:["hazards","load-use"],
  question:"When forwarding cannot satisfy immediate dependency after a load, pipeline inserts a _______.",
  answer:["stall"],acceptableAnswers:[["stall"],["bubble"]],
  explanation:"Load-use hazard frequently needs one bubble."},

{id:"C3-07",chapter:3,type:"single",topics:["dependencies","midterm"],
  question:"In sequence `lw sp,20(ra)` followed immediately by `and tp,sp,t0`, the dependency type is:",
  options:["WAW", "WAR", "RAW", "No dependency"],
  answer:[2],
  explanation:"and reads sp produced by preceding lw."},

// Chapter 4: architecture and memory hierarchy
{id:"C4-01",chapter:4,type:"single",topics:["architecture","von-vs-harvard"],
  question:"Harvard architecture differs from Von Neumann by:",
  options:["No registers", "Separate instruction and data memories", "No control unit", "Using only 16-bit instructions"],
  answer:[1],
  explanation:"Harvard splits instruction/data memory paths."},

{id:"C4-02",chapter:4,type:"single",topics:["cache","amat"],
  question:"AMAT formula is:",
  options:["Hit time + miss rate x miss penalty", "Hit time x miss rate + miss penalty", "Miss penalty / hit time", "Hit rate + miss time"],
  answer:[0],
  explanation:"Standard average memory access time model."},

{id:"C4-03",chapter:4,type:"single",topics:["parallelism","trends"],
  question:"Slides identify post-ILP trends emphasizing:",
  options:["Only faster single core clocks", "DLP/TLP/RLP style parallelism", "No software changes required", "Replacing memory hierarchy"],
  answer:[1],
  explanation:"After single-core scaling slowed, explicit parallel models became central."},

{id:"C4-04",chapter:4,type:"fill",topics:["power","tdp"],
  question:"TDP stands for Thermal Design _______.",
  answer:["power"],acceptableAnswers:[["power"]],
  explanation:"TDP characterizes sustained power envelope for cooling/power design."},

// Free response
{id:"CFR1",chapter:3,type:"free",topics:["midterm","hazard-analysis"],
  question:"Given a short RISC-V instruction block, show a full hazard analysis workflow: list RAW dependencies, identify required stalls, and then show how forwarding changes timing.",
  answer:[],
  explanation:"Start with dependency graph, map each instruction through IF/ID/EX/MEM/WB timeline, insert bubbles where value not yet available, then re-evaluate with forwarding paths and remaining load-use/control stalls."},

{id:"CFR2",chapter:2,type:"free",topics:["assembly","machine-code","procedures"],
  question:"Explain how to go from C pseudocode to RISC-V assembly and then to machine code, including calling convention, immediate encoding, and branch offsets.",
  answer:[],
  explanation:"Decompose high-level logic into compare/branch/arithmetic/load-store sequence, respect register roles and stack frame, then encode opcode/funct/register/immediate fields per instruction format."},
];
