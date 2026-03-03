import type { QuizSet } from "@/lib/types";
import { differentialEquationReviewReplacements } from "./quiz-diffeq-reviews";

export const testReviewQuizSetReplacements: QuizSet[] = [
  ...differentialEquationReviewReplacements,
  {
    id: "ta-core-legacy",
    courseId: "theory-of-automata",
    title: "Theory of Automata Test Review I (Free Response)",
    description:
      "Exact free-response prompts from HW1 and Test 1 with rigorous step-by-step proof guidance.",
    difficulty: "Advanced",
    estMinutes: 34,
    tags: ["test-review", "free-response", "hw1", "test1", "proof-heavy"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "ta-core-legacy-q1",
        type: "free",
        prompt: "Prove that `A - (B ∩ C) = (A - B) ∪ (A - C)`.",
        explanation: "Use double containment: prove LHS subset RHS and RHS subset LHS.",
        sampleAnswer:
          "Show x in A-(B∩C) implies x in (A-B)∪(A-C), and conversely x in (A-B)∪(A-C) implies x in A-(B∩C).",
        hintSteps: [
          "Set equality proof starts with two subset proofs.",
          "Translate set difference and intersection definitions explicitly.",
          "Use negation of intersection carefully (`not in B∩C`).",
          "Repeat in reverse direction for completeness."
        ],
        walkthroughSteps: [
          "Assume `x in A-(B∩C)`: then `x in A` and `x notin B∩C`.",
          "`x notin B∩C` means `x notin B` or `x notin C`.",
          "Hence `x in A-B` or `x in A-C`, so `x in (A-B)∪(A-C)`.",
          "Reverse direction: if `x in (A-B)∪(A-C)`, then x is in A and missing at least one of B,C; thus `x notin B∩C` and x in `A-(B∩C)`."
        ],
        references: ["HW1 Problem 1", "HW1 ans Problem 1"],
        tags: ["sets", "proof", "identity", "hw1"]
      },
      {
        id: "ta-core-legacy-q2",
        type: "free",
        prompt:
          "Let `R = {(a, b), (a, c), (c, d), (a, a), (b, a)}`. Find `R ◦ R`, find `R^-1`, and state whether `R`, `R ◦ R`, or `R^-1` is a function.",
        explanation:
          "Compute composition via chaining, inverse by swapping pairs, and function check via outgoing-edge uniqueness.",
        sampleAnswer:
          "R◦R={(a,a),(a,b),(a,c),(a,d),(b,a),(b,b),(b,c)}; R^-1={(b,a),(c,a),(d,c),(a,a),(a,b)}; none are functions.",
        hintSteps: [
          "For composition, chain `(x,y)` with `(y,z)`.",
          "For inverse, swap coordinates in each pair.",
          "Function test: each first component must map to exactly one value.",
          "Check whether any first component appears with multiple seconds."
        ],
        walkthroughSteps: [
          "Composition: generate `(x,z)` whenever `(x,y)` and `(y,z)` exist in R.",
          "Inverse: each `(u,v)` becomes `(v,u)`.",
          "R has both `(a,b)` and `(a,c)` so R is not a function.",
          "Same multivalued issue appears in `R◦R` and `R^-1`, so none are functions."
        ],
        references: ["HW1 Problem 2", "HW1 ans Problem 2"],
        tags: ["relations", "composition", "inverse", "functions", "hw1"]
      },
      {
        id: "ta-core-legacy-q3",
        type: "free",
        prompt:
          "Test 1 Q1 used `R = {(a,c),(c,e),(e,e),(e,b),(d,b),(d,d)}`. Draw/describe directed graphs for (a) `R` and (b) `R ∪ R^-1`.",
        explanation:
          "`R ∪ R^-1` adds reverse edges for every original edge; self-loops remain unchanged.",
        sampleAnswer:
          "Graph (a) has directed edges exactly as listed by R. Graph (b) includes all edges in R plus reversed non-loop edges `(c,a),(e,c),(b,e),(b,d)`.",
        hintSteps: [
          "Graph for relation is one directed edge per ordered pair.",
          "Inverse relation swaps each ordered pair.",
          "Union includes all original and inverse edges.",
          "Self-loops remain self-loops in both relations."
        ],
        walkthroughSteps: [
          "List R edges directly: `(a,c),(c,e),(e,e),(e,b),(d,b),(d,d)`.",
          "Compute inverse edges: `(c,a),(e,c),(e,e),(b,e),(b,d),(d,d)`.",
          "Take union with originals.",
          "Final graph for union has bidirectional counterparts for non-loop edges."
        ],
        references: ["Test 1 Problem 1"],
        tags: ["relations", "graphs", "inverse", "test1"]
      },
      {
        id: "ta-core-legacy-q4",
        type: "free",
        prompt: "Explain why `(b* a*) ∩ (a* b*) = a* ∪ b*` is true.",
        explanation:
          "A string cannot simultaneously have b-before-a and a-before-b unless it contains only one symbol type.",
        sampleAnswer:
          "Strings in both forms must be all a's or all b's. Mixed a/b order would violate one side, so intersection is a* ∪ b*.",
        hintSteps: [
          "Interpret each regex as an ordering constraint.",
          "Consider strings containing both a and b.",
          "Show contradiction for mixed strings.",
          "Show pure-a and pure-b strings satisfy both sides."
        ],
        walkthroughSteps: [
          "`b*a*` means all b's come before all a's.",
          "`a*b*` means all a's come before all b's.",
          "A mixed string cannot satisfy both orderings simultaneously.",
          "Only all-a or all-b strings satisfy both, giving `a* ∪ b*`."
        ],
        references: ["Test 1 Problem 2", "HW1 Problem 15(b)"],
        tags: ["regex", "intersection", "proof", "test1"]
      },
      {
        id: "ta-core-legacy-q5",
        type: "free",
        prompt:
          "Write a regular expression for `L = { w in {0,1}* : w has two or three occurrences of 1, the first and second of which are not consecutive }`.",
        explanation:
          "Require at least one 0 between first and second 1; allow optional third 1 later.",
        sampleAnswer: "0*10+10*(10*)?  (equivalent forms accepted).",
        hintSteps: [
          "Build the mandatory first two 1's with a gap of at least one 0.",
          "Add arbitrary 0* at front/back.",
          "Then add an optional third 1 block.",
          "Verify exactly 2 or 3 ones are allowed."
        ],
        walkthroughSteps: [
          "First 1: `...1`.",
          "Gap constraint: at least one zero => `0+`.",
          "Second 1 gives core `10+1`.",
          "Wrap with optional leading/trailing zeros and optional third 1 term."
        ],
        references: ["Test 1 Problem 3"],
        tags: ["regex", "language-design", "test1"]
      },
      {
        id: "ta-core-legacy-q6",
        type: "free",
        prompt:
          "For positive integers, relation `aRb` iff `b` is divisible by `a`: determine whether R is a partial order and whether it is a total order.",
        explanation:
          "Divisibility is reflexive, antisymmetric, transitive => partial order; not all pairs comparable => not total.",
        sampleAnswer:
          "R is a partial order, not a total order (example incomparable pair: 2 and 3).",
        hintSteps: [
          "Check reflexive, antisymmetric, transitive one by one.",
          "Then test comparability for all pairs.",
          "Find one counterexample for totality.",
          "State final classification clearly."
        ],
        walkthroughSteps: [
          "Reflexive: every a divides itself.",
          "Antisymmetric: if a|b and b|a then a=b for positive integers.",
          "Transitive: a|b and b|c implies a|c.",
          "Not total: 2 and 3 are incomparable under divisibility."
        ],
        references: ["HW1 Problem 4(a)"],
        tags: ["partial-order", "total-order", "relations", "hw1"]
      },
      {
        id: "ta-core-legacy-q7",
        type: "free",
        prompt: "Show by induction that `n^4 - 4n^2` is divisible by 3 for all `n >= 0`.",
        explanation: "Do base case then inductive step using expansion at n+1.",
        sampleAnswer:
          "Base n=0 works. Assume true for n. Expand at n+1, factor remaining term, show it's divisible by 3, conclude.",
        hintSteps: [
          "Prove base case first.",
          "State inductive hypothesis in divisible-by-3 form.",
          "Expand `(n+1)^4 - 4(n+1)^2` and separate old term.",
          "Show remainder divisible by 3 by factor/case analysis."
        ],
        walkthroughSteps: [
          "Base: n=0 gives 0, divisible by 3.",
          "Assume `n^4-4n^2 = 3k`.",
          "Expand at n+1 and rewrite as old term plus remainder.",
          "Show remainder divisible by 3, so whole expression is divisible by 3."
        ],
        references: ["HW1 Problem 7"],
        tags: ["induction", "proof", "number-theory", "hw1"]
      },
      {
        id: "ta-core-legacy-q8",
        type: "free",
        prompt:
          "Write regular expressions for: (a) all strings over `{a,b}` with no more than three a's, and (b) all strings with number of a's divisible by three.",
        explanation:
          "Use union of cases for <=3 a's, and repeating 3-a blocks for divisibility-by-3.",
        sampleAnswer:
          "(a) b* ∪ b*ab* ∪ b*ab*ab* ∪ b*ab*ab*ab* ; (b) b*(ab*ab*ab*)*",
        hintSteps: [
          "For <=3 a's, split into 0,1,2,3 a-case union.",
          "Insert b* between all a occurrences.",
          "For divisible-by-3, build a block with exactly 3 a's.",
          "Repeat block with Kleene star."
        ],
        walkthroughSteps: [
          "Case union handles no-more-than constraints cleanly.",
          "Each added `a` is separated by optional `b*`.",
          "For divisibility by 3, one block contributes exactly 3 a's.",
          "Repeat block zero-or-more times with leading `b*`."
        ],
        references: ["HW1 Problem 14(a,b)"],
        tags: ["regex", "construction", "hw1", "test-review"]
      }
    ]
  },
  {
    id: "ta-reinforce-legacy",
    courseId: "theory-of-automata",
    title: "Theory of Automata Test Review II (Free Response)",
    description:
      "Exact free-response prompts from HW2 focused on DFA/NFA construction and non-regularity proofs.",
    difficulty: "Advanced",
    estMinutes: 34,
    tags: ["test-review", "free-response", "hw2", "dfa", "nfa", "pumping-lemma"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "ta-reinforce-legacy-q1",
        type: "free",
        prompt:
          "Write down the transition table of a DFA accepting `{ w in {a,b}* : each a in w is immediately preceded by one b }`.",
        explanation:
          "Track whether previous symbol was b; reject when an a appears without that precondition.",
        sampleAnswer:
          "States q0(start,accept), q1(seen b,accept), qd(dead). q0:a->qd,b->q1; q1:a->q0,b->q1; qd:a->qd,b->qd.",
        hintSteps: [
          "State meaning should encode whether a future a is currently allowed.",
          "Need one dead state for violations.",
          "Empty string should be accepted.",
          "Check all transitions for determinism."
        ],
        walkthroughSteps: [
          "Use q0 for neutral/start, q1 for last symbol b, qd for invalid.",
          "From q0, reading a violates rule -> qd.",
          "From q1, reading a is valid -> q0.",
          "All transitions from qd remain in qd."
        ],
        references: ["HW2 Problem 3"],
        tags: ["dfa", "transition-table", "construction", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q2",
        type: "free",
        prompt:
          "Write down the transition table of a DFA accepting `{ w in {a,b}* : w has abab as a substring }`.",
        explanation:
          "Build prefix-progress states for pattern abab and a final absorbing accept state.",
        sampleAnswer:
          "States q0,q1,q2,q3,q4(accept) tracking matched prefix lengths 0..4; q4 loops on both symbols.",
        hintSteps: [
          "Use one state per matched prefix length of 'abab'.",
          "Handle fallback transitions on mismatch.",
          "Once full match reached, stay accepting.",
          "Test with strings 'abab', 'ababa', 'babab'."
        ],
        walkthroughSteps: [
          "q0 no match, q1 matched 'a', q2 matched 'ab', q3 matched 'aba', q4 matched 'abab'.",
          "Fill transitions to advance or fallback to longest valid prefix.",
          "Set q4 as absorbing accept.",
          "Validate using sample accepted and rejected strings."
        ],
        references: ["HW2 Problem 4"],
        tags: ["dfa", "substring", "construction", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q3",
        type: "free",
        prompt: "Draw an NFA that accepts `(ab)* (ba)* ∪ aa*` and explain your design.",
        explanation:
          "Use union via epsilon branches and separate sub-automata for each pattern branch.",
        sampleAnswer:
          "Start with epsilon split into branch for (ab)*(ba)* and branch for aa*. Accept states merge with epsilon.",
        hintSteps: [
          "Break expression into union of two languages.",
          "Build each branch independently.",
          "Use epsilon transitions from start into each branch.",
          "Ensure both branches can reach accepting states."
        ],
        walkthroughSteps: [
          "Construct branch A for `(ab)*(ba)*` with loop structure for each pair.",
          "Construct branch B for `aa*` (one a then a-loop).",
          "Add epsilon-split from start to both branches.",
          "Combine accepts via shared accept state (or multiple accepts)."
        ],
        references: ["HW2 Problem 9"],
        tags: ["nfa", "regex-to-automata", "union", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q4",
        type: "free",
        prompt:
          "Write the transition relation table for an NFA accepting `(ab ∪ aab ∪ aba)*`.",
        explanation:
          "Create fragment paths for each token (ab, aab, aba), then loop back for Kleene star repetition.",
        sampleAnswer:
          "Use branching after an initial a-state into b (ab), ab (aab), and ba (aba), each returning to start/accept for star.",
        hintSteps: [
          "Inside star, language is union of three fixed tokens.",
          "Build token paths with shared prefixes where possible.",
          "Star means allow epsilon (empty string) and repetition.",
          "Add loop from token-end states back to start."
        ],
        walkthroughSteps: [
          "Model token start with leading `a` prefix.",
          "Branch into three token-completion paths.",
          "Mark start as accepting for epsilon in star.",
          "Loop completed token states to start for repetition."
        ],
        references: ["HW2 Problem 10"],
        tags: ["nfa", "transition-relation", "kleene-star", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q5",
        type: "free",
        prompt:
          "Using lecture-note construction, draw/describe a finite automaton accepting `((ab)* ∪ (bc)*)ab`.",
        explanation:
          "Build union machine for `(ab)*` and `(bc)*`, then concatenate with terminal `ab` segment.",
        sampleAnswer:
          "Construct union sub-FA for the two stars, connect its accept states by epsilon/transition chain to an `a->b` tail.",
        hintSteps: [
          "Do union sub-machine first.",
          "Then apply concatenation with suffix `ab`.",
          "Track accepting-state flow after suffix.",
          "Check strings from each union branch followed by final ab."
        ],
        walkthroughSteps: [
          "Create branch for `(ab)*` and branch for `(bc)*`, both allowing epsilon.",
          "Unify their accept outputs.",
          "Append concatenated suffix transitions `a` then `b`.",
          "Only states after consuming suffix are final accepts."
        ],
        references: ["HW2 Problem 11"],
        tags: ["finite-automata", "construction", "concatenation", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q6",
        type: "free",
        prompt:
          "Using lecture-note construction, draw/describe a finite automaton accepting `((ab ∪ aba)* a)*`.",
        explanation:
          "Inner star repeats tokens from union then a; outer star repeats whole block and includes epsilon.",
        sampleAnswer:
          "Build inner NFA/FA for `(ab ∪ aba)*a`, then add outer loop from accept back to start with start also accepting.",
        hintSteps: [
          "Parse nesting from inside out.",
          "Construct union token machine for `ab` and `aba`.",
          "Apply inner star and trailing `a` concatenation.",
          "Apply outer star with epsilon acceptance."
        ],
        walkthroughSteps: [
          "Build token union for `ab` or `aba`.",
          "Apply Kleene star around token union.",
          "Concatenate with trailing `a` to finish one block.",
          "Wrap another star around full block for repeated blocks or epsilon."
        ],
        references: ["HW2 Problem 12"],
        tags: ["finite-automata", "nested-construction", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q7",
        type: "free",
        prompt:
          "Show that language `{ a^n b a^m b a^{m+n} : n,m >= 1 }` is not regular using the pumping lemma.",
        explanation:
          "Pump within first a-block to change n but not the terminal exponent relation `m+n`.",
        sampleAnswer:
          "Choose witness with n=m=p; decomposition forces y in first a-block; pumping breaks final exponent constraint.",
        hintSteps: [
          "Assume regular with pumping length p.",
          "Choose witness string linking first and last exponents.",
          "Argue `|xy|<=p` places y in first block.",
          "Pump i=0 or i=2 to violate relation."
        ],
        walkthroughSteps: [
          "Let witness be `a^p b a^p b a^{2p}`.",
          "Any valid split has y in first `a^p` block.",
          "Pumping changes first block length only.",
          "Last block remains `a^{2p}`, so required `m+n` relation fails."
        ],
        references: ["HW2 Problem 13"],
        tags: ["pumping-lemma", "non-regular", "proof", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q8",
        type: "free",
        prompt:
          "Show that language `{ ww^R : w in {a,b}* }` is not regular using the pumping lemma.",
        explanation:
          "This even-palindrome language fails pumping because pumping near one side destroys symmetry.",
        sampleAnswer:
          "Use witness a^p b^p b^p a^p; pumping y from first a-block breaks mirrored counts.",
        hintSteps: [
          "Assume regular and get pumping length p.",
          "Choose a symmetric witness string.",
          "Split constraints force y in leading a-run.",
          "Pump to break palindrome symmetry."
        ],
        walkthroughSteps: [
          "Pick `s = a^p b^p b^p a^p` in the language.",
          "With `|xy|<=p`, y lies in first a-block.",
          "Pump down (i=0): left side a-count shrinks, right side unchanged.",
          "Result is not of form `ww^R`, contradiction."
        ],
        references: ["HW2 Problem 14"],
        tags: ["pumping-lemma", "palindrome", "non-regular", "hw2"]
      }
    ]
  },
  {
    id: "ca-core-legacy",
    courseId: "computer-architecture",
    title: "Computer Architecture Test Review I (Free Response)",
    description:
      "Exact free-response prompts from Midterm Practice and in-class topics, with full reasoning workflows.",
    difficulty: "Advanced",
    estMinutes: 36,
    tags: ["test-review", "free-response", "midterm-aligned", "pipeline", "machine-code"],
    timerDefaultMinutes: 32,
    questions: [
      {
        id: "ca-core-legacy-q1",
        type: "free",
        prompt:
          "Convert to RISC-V assembly: `if (i == j) a = b + c; else a = b - c;` with `a,b,c,i,j` in `a0,a1,a2,s6,s7`.",
        explanation:
          "Use `beq s6,s7,equal`, fall-through else path, and unconditional jump to exit after else.",
        sampleAnswer:
          "beq s6,s7,equal\nsub a0,a1,a2\nbeq zero,zero,exit\nequal:\nadd a0,a1,a2\nexit:",
        hintSteps: [
          "Compare i and j registers directly.",
          "Place else path in fall-through.",
          "Jump over if-body after else executes.",
          "Ensure a0 gets final result in both branches."
        ],
        walkthroughSteps: [
          "Condition `i==j` means compare `s6` and `s7`.",
          "Branch to label `equal` when true.",
          "Else computes subtraction in a0.",
          "If branch computes addition in a0, then both paths merge at exit."
        ],
        references: ["Midterm Practice - A1(a)", "Assignment 3 Problem 1"],
        tags: ["assembly", "branching", "if-else", "midterm"]
      },
      {
        id: "ca-core-legacy-q2",
        type: "free",
        prompt:
          "Convert to RISC-V assembly: `for (i=0; i<=100; i++) { A[2*i] = a + A[i]; }` with `i->a0`, `a->s0`, base `A=0xEA38_257C->s2`.",
        explanation:
          "Initialize base with `lui/ori`, use `bge` with bound 101, scale offsets by 4*i and 8*i via shifts.",
        sampleAnswer:
          "lui s2,0xEA382\nori s2,s2,0x57C\naddi a0,zero,0\naddi t0,zero,101\nloop:\nbge a0,t0,exit\nslli t1,a0,2\nadd t2,s2,t1\nlw t3,0(t2)\nadd t4,s0,t3\nslli t5,a0,3\nadd t6,s2,t5\nsw t4,0(t6)\naddi a0,a0,1\nbeq zero,zero,loop\nexit:",
        hintSteps: [
          "Convert loop guard `i<=100` into branch-exit form.",
          "Compute `A[i]` offset as `4*i`.",
          "Compute `A[2*i]` offset as `8*i`.",
          "Do load, compute, store, increment, loop."
        ],
        walkthroughSteps: [
          "Load base address into s2 using upper/lower immediate split.",
          "Initialize i and loop limit (101 for `i<=100`).",
          "Address A[i] using `slli i,2` then base add and load.",
          "Address A[2*i] using `slli i,3` then base add and store."
        ],
        references: ["Midterm Practice - A1(b)", "Assignment 3 Problem 2"],
        tags: ["assembly", "loops", "arrays", "addressing", "midterm"]
      },
      {
        id: "ca-core-legacy-q3",
        type: "free",
        prompt:
          "Convert C functions to RISC-V using standard procedure call + stack:\n`int sumofsq(int a,int b){ return square(a)+square(b); }`\n`int square(int a){ return a*a; }`",
        explanation:
          "sumofsq is non-leaf and must save `ra` and needed s-registers; square is leaf and returns product in a0.",
        sampleAnswer:
          "sumofsq saves ra/s regs, calls square(a), saves result, calls square(b), adds results in a0, restores frame, returns. square multiplies a0 by itself and returns.",
        hintSteps: [
          "Identify leaf vs non-leaf function roles.",
          "Preserve values needed across calls in saved registers.",
          "Use a0/a1 as call args and a0 as return.",
          "Restore stack frame and ra before return."
        ],
        walkthroughSteps: [
          "sumofsq allocates stack and saves ra + any callee-saved registers used.",
          "First call square(a), preserve result.",
          "Second call square(b), then add two results into a0.",
          "Restore saved registers, deallocate stack, and `jalr` return."
        ],
        references: ["Midterm Practice - A2"],
        tags: ["procedures", "stack", "calling-convention", "midterm"]
      },
      {
        id: "ca-core-legacy-q4",
        type: "free",
        prompt: "Translate `addi t0, zero, -101` into 32-bit machine code (hex). Show field mapping.",
        explanation: "I-type encoding yields `0xF9B00293`.",
        sampleAnswer:
          "imm=-101 -> 12-bit two's complement F9B; rs1=00000; funct3=000; rd=t0=00101; opcode=0010011 -> 0xF9B00293.",
        hintSteps: [
          "Use I-type field order: imm rs1 funct3 rd opcode.",
          "Compute 12-bit two's complement for -101.",
          "Insert register and opcode bits.",
          "Convert assembled binary to hex."
        ],
        walkthroughSteps: [
          "Opcode for addi is `0010011`; rd t0 is x5.",
          "Immediate -101 in 12-bit two's complement is `0xF9B`.",
          "Assemble fields into 32 bits.",
          "Hex result is `0xF9B00293`."
        ],
        references: ["Midterm Practice - A3"],
        tags: ["machine-code", "i-type", "encoding", "midterm"]
      },
      {
        id: "ca-core-legacy-q5",
        type: "free",
        prompt: "Decode machine code `0x4168_0FB3` into RISC-V assembly. Show opcode/funct decomposition.",
        explanation: "R-type with funct7 `0100000` + funct3 `000` decodes to `sub t6, a6, s6`.",
        sampleAnswer:
          "opcode 0110011 -> R-type; rd=x31(t6), rs1=x16(a6), rs2=x22(s6), funct7=0100000 -> sub t6,a6,s6.",
        hintSteps: [
          "Extract opcode bits [6:0] first.",
          "For R-type, parse rd/funct3/rs1/rs2/funct7.",
          "Map register numbers to ABI names.",
          "Use funct7+funct3 to pick operation."
        ],
        walkthroughSteps: [
          "Opcode 0110011 indicates R-type arithmetic instruction.",
          "Fields decode to rd x31, rs1 x16, rs2 x22, funct3 000, funct7 0100000.",
          "funct7 0100000 with funct3 000 means SUB.",
          "Final instruction: `sub t6, a6, s6`."
        ],
        references: ["Midterm Practice - A4", "Assignment 5 Problem 3"],
        tags: ["machine-code", "decode", "r-type", "midterm"]
      },
      {
        id: "ca-core-legacy-q6",
        type: "free",
        prompt:
          "For instruction sequence `lw sp,20(ra); and tp,sp,t0; or s0,sp,t1; add s1,tp,t0; beq s0,s1,label`, identify all RAW dependencies and hazards.",
        explanation:
          "Key dependencies include lw->and on sp, lw->or on sp, and->add on tp, and or/add feeding beq.",
        sampleAnswer:
          "RAW: (lw->and on sp), (lw->or on sp), (and->add on tp), (or->beq on s0), (add->beq on s1).",
        hintSteps: [
          "Write destination register of each instruction.",
          "For each later instruction, list source registers read.",
          "Mark any read whose source was previously written.",
          "Classify especially immediate next-instruction load-use hazard."
        ],
        walkthroughSteps: [
          "lw writes sp; and reads sp -> RAW.",
          "lw writes sp; or reads sp -> RAW.",
          "and writes tp; add reads tp -> RAW.",
          "or writes s0 and add writes s1; beq reads both -> two RAW edges."
        ],
        references: ["Midterm Practice - A5(a)"],
        tags: ["pipeline", "hazards", "raw", "midterm"]
      },
      {
        id: "ca-core-legacy-q7",
        type: "free",
        prompt:
          "For the same sequence in A5(a), determine minimum clock cycles for a 5-stage pipeline (i) without forwarding and (ii) with forwarding.",
        explanation:
          "Without forwarding, each dependent consumer waits for WB; with forwarding, only unavoidable load-use/control penalties remain.",
        sampleAnswer:
          "Compute via pipeline timing table. No-forwarding inserts stalls for every RAW read-before-WB; forwarding removes most ALU stalls but keeps load-use penalty.",
        hintSteps: [
          "Draw IF/ID/EX/MEM/WB table across cycles.",
          "Place instructions assuming no hazards first.",
          "Insert stalls when operand unavailable at ID/EX as required.",
          "Repeat with forwarding paths enabled."
        ],
        walkthroughSteps: [
          "Build baseline 5-instruction timeline.",
          "In no-forwarding case, delay each dependent use until producer WB.",
          "In forwarding case, route EX/MEM outputs to dependent EX inputs.",
          "Count cycles in each case and compare."
        ],
        references: ["Midterm Practice - A5(b)"],
        tags: ["pipeline", "timing", "forwarding", "stalls", "midterm"]
      },
      {
        id: "ca-core-legacy-q8",
        type: "free",
        prompt:
          "Explain control hazard vs data hazard, then explain how a 2-bit dynamic branch predictor works (state-machine behavior).",
        explanation:
          "Control hazards come from uncertain next PC; data hazards come from operand availability. 2-bit predictor uses hysteresis via four saturating states.",
        sampleAnswer:
          "Data hazard=operand timing dependency; control hazard=branch-path uncertainty. 2-bit FSM: SNT<->WNT<->WT<->ST with updates on branch outcomes.",
        hintSteps: [
          "Define each hazard by root cause.",
          "Give one concrete instruction-level example for each.",
          "List four predictor states.",
          "Explain transition rule on taken/not-taken outcomes."
        ],
        walkthroughSteps: [
          "Data hazard: instruction needs value not yet produced.",
          "Control hazard: fetch path unknown until branch resolved.",
          "2-bit predictor states: Strong/Weak Taken and Strong/Weak Not Taken.",
          "One wrong outcome weakens confidence; two opposite outcomes flip strong prediction."
        ],
        references: ["Midterm Practice - A6(b)", "Topic 2 Pipeline Notes"],
        tags: ["control-hazard", "data-hazard", "branch-prediction", "midterm"]
      }
    ]
  },
  {
    id: "ca-reinforce-legacy",
    courseId: "computer-architecture",
    title: "Computer Architecture Test Review II (Free Response)",
    description:
      "Exact free-response prompts from Assignments 1-5 with worked-method focus and tricky-point guidance.",
    difficulty: "Advanced",
    estMinutes: 34,
    tags: ["test-review", "free-response", "assignment-aligned", "risc-v"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "ca-reinforce-legacy-q1",
        type: "free",
        prompt:
          "What is ISA? What are the two ISA categories in Computer Architecture? Give three advantages and three disadvantages for each.",
        explanation:
          "ISA is software-hardware interface; categories are RISC and CISC with classic tradeoffs in simplicity vs code density/complexity.",
        sampleAnswer:
          "ISA defines instruction formats/registers/modes/operations. Categories: RISC and CISC. RISC favors simpler hardware/power efficiency; CISC favors complex instructions/code density.",
        hintSteps: [
          "Define ISA first before listing categories.",
          "Separate RISC and CISC characteristics clearly.",
          "Provide balanced pros and cons for each.",
          "Tie pros/cons to implementation complexity and efficiency."
        ],
        walkthroughSteps: [
          "ISA defines programmer-visible contract between software and processor.",
          "RISC: simpler instructions and hardware, often efficient pipelining.",
          "CISC: richer instructions and better code density but higher hardware complexity.",
          "State three practical advantages/disadvantages for each side."
        ],
        references: ["Assignment 1 Problem 1(a)"],
        tags: ["isa", "risc", "cisc", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q2",
        type: "free",
        prompt:
          "What are the four types of parallelism in Computer Architecture? Define each briefly.",
        explanation:
          "The four are DLP, TLP, ILP, and RLP.",
        sampleAnswer:
          "Data-level, task-level, instruction-level, and request-level parallelism, each exploiting concurrency at different abstraction levels.",
        hintSteps: [
          "Name all four first.",
          "Associate each with its execution granularity.",
          "Give one quick example workload for each.",
          "Contrast ILP vs TLP explicitly."
        ],
        walkthroughSteps: [
          "DLP applies same operation across many data elements.",
          "TLP executes independent tasks/threads concurrently.",
          "ILP overlaps instructions from one stream via pipeline/superscalar ideas.",
          "RLP processes independent service requests in parallel."
        ],
        references: ["Assignment 1 Problem 1(b)", "Topic 1 Fundamentals"],
        tags: ["parallelism", "taxonomy", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q3",
        type: "free",
        prompt:
          "List Flynn's four processor classes and describe each type.",
        explanation:
          "Classes are SISD, SIMD, MISD, and MIMD, distinguished by instruction/data stream multiplicity.",
        sampleAnswer:
          "SISD single/single, SIMD single/multiple, MISD multiple/single, MIMD multiple/multiple with independent processors.",
        hintSteps: [
          "Use instruction-stream count and data-stream count axes.",
          "State one sentence behavioral definition each.",
          "Mention typical practical examples where relevant.",
          "Call out rarity of MISD in commercial systems."
        ],
        walkthroughSteps: [
          "SISD: one instruction stream over one data stream.",
          "SIMD: one instruction stream over many data elements.",
          "MISD: many instruction streams over one data stream (rare).",
          "MIMD: many instruction and data streams, independent processors."
        ],
        references: ["Assignment 1 Problem 1(c)"],
        tags: ["flynn", "processor-classes", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q4",
        type: "free",
        prompt:
          "Compute execution time for single-cycle, multicycle, and pipeline processors using Assignment 1 Problem 2 parameters (IC=1000, operation mix and CPIs given). Which performs best?",
        explanation:
          "Computed results are single-cycle 2.0 us, multicycle 2.2 us, and pipeline 0.6 us; pipeline is best.",
        sampleAnswer:
          "Single-cycle: 2.0 us. Multicycle: 2.2 us. Pipeline: 0.6 us. Best: pipeline.",
        hintSteps: [
          "Compute each clock period from frequency.",
          "Compute total cycles per architecture.",
          "Apply `CPU time = cycles * clock period`.",
          "Compare final times directly."
        ],
        walkthroughSteps: [
          "Single-cycle: Ts=2ns, cycles=1000 -> 2000ns.",
          "Multicycle: Tm=0.5ns, cycles=4400 -> 2200ns.",
          "Pipeline: Tp=0.6ns, cycles=1000 -> 600ns.",
          "Minimum time is pipeline, therefore best performance."
        ],
        references: ["Assignment 1 Problem 2"],
        tags: ["performance", "cpu-time", "pipeline", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q5",
        type: "free",
        prompt:
          "Write RISC-V assembly to initialize `a0` with `0xABCD_1234` using only two instructions.",
        explanation:
          "Split into upper/lower immediate parts: `lui a0,0xABCD1` then `ori a0,a0,0x234`.",
        sampleAnswer: "lui a0, 0xABCD1\nori a0, a0, 0x234",
        hintSteps: [
          "Use U-type + I-type pair.",
          "Split constant into upper 20 and lower 12 bits.",
          "Load upper then OR lower.",
          "Verify reconstructed 32-bit value."
        ],
        walkthroughSteps: [
          "Upper 20 bits are `0xABCD1`.",
          "Lower 12 bits are `0x234`.",
          "`lui` places upper bits at [31:12].",
          "`ori` fills low bits, yielding `0xABCD1234`."
        ],
        references: ["Assignment 2 Problem 1(a)"],
        tags: ["assembly", "immediate", "lui", "assignment2"]
      },
      {
        id: "ca-reinforce-legacy-q6",
        type: "free",
        prompt:
          "Convert C to RISC-V: `a = (b + c) - (d - 15);` with `a,b,c,d` mapped to `s0,s1,s2,s3`.",
        explanation:
          "Compute two subexpressions in temporaries, then subtract.",
        sampleAnswer:
          "```asm\n# a: s0, b: s1, c: s2, d: s3\n# Temporary registers used: t0, t1\n\nadd  t0, s1, s2      # t0 = b + c\naddi t1, s3, -15     # t1 = d - 15\nsub  s0, t0, t1      # a = t0 - t1\n```\n\nNo comments:\n\n```asm\nadd  t0, s1, s2\naddi t1, s3, -15\nsub  s0, t0, t1\n```",
        hintSteps: [
          "Preserve expression structure with temporaries.",
          "Use addi for subtracting constant 15.",
          "Perform outer subtraction last.",
          "Store final result in s0.",
          "Final answer should be the 3-instruction sequence using `t0` and `t1`."
        ],
        walkthroughSteps: [
          "Compute `(b+c)` into t0.",
          "Compute `(d-15)` into t1 using addi -15.",
          "Subtract second subexpression from first.",
          "Write final result into destination register s0.",
          "Final output:\n```asm\n# a: s0, b: s1, c: s2, d: s3\n# Temporary registers used: t0, t1\n\nadd  t0, s1, s2      # t0 = b + c\naddi t1, s3, -15     # t1 = d - 15\nsub  s0, t0, t1      # a = t0 - t1\n```\nNo comments:\n```asm\nadd  t0, s1, s2\naddi t1, s3, -15\nsub  s0, t0, t1\n```"
        ],
        references: ["Assignment 2 Problem 2"],
        tags: ["assembly", "arithmetic", "c-to-riscv", "assignment2"]
      },
      {
        id: "ca-reinforce-legacy-q7",
        type: "free",
        prompt:
          "Convert C to RISC-V: `Vec[8] = Vec[4] + a - 120;` with `a->s0` and base of `Vec` in `a0`.",
        explanation:
          "Use `lw` from offset 16, adjust and add, then `sw` to offset 32.",
        sampleAnswer:
          "lw t0,16(a0)\naddi t0,t0,-120\nadd t0,t0,s0\nsw t0,32(a0)",
        hintSteps: [
          "Convert indices to byte offsets (int = 4 bytes).",
          "Load Vec[4] first.",
          "Apply arithmetic in register.",
          "Store final value into Vec[8]."
        ],
        walkthroughSteps: [
          "Offset for Vec[4] is 16 bytes; offset for Vec[8] is 32 bytes.",
          "Load Vec[4] into temp register.",
          "Compute `temp + a - 120`.",
          "Store computed value at Vec[8] address."
        ],
        references: ["Assignment 2 Problem 3"],
        tags: ["assembly", "arrays", "load-store", "assignment2"]
      },
      {
        id: "ca-reinforce-legacy-q8",
        type: "free",
        prompt:
          "Translate `lw s1, 120(a0)` to 32-bit machine code in hex. Show field decomposition.",
        explanation:
          "I-type encoding with imm=120, rs1=a0, funct3 for lw, rd=s1, opcode load yields `0x07852483`.",
        sampleAnswer:
          "imm=000001111000, rs1=01010, funct3=010, rd=01001, opcode=0000011 -> 0x07852483.",
        hintSteps: [
          "Identify I-type layout for load.",
          "Convert decimal immediate 120 to 12-bit binary.",
          "Map register numbers for s1 and a0.",
          "Assemble and convert to hex."
        ],
        walkthroughSteps: [
          "lw uses opcode 0000011 and funct3 010.",
          "rd=s1=x9, rs1=a0=x10, imm=120 -> 0x078.",
          "Assemble `imm|rs1|funct3|rd|opcode`.",
          "Hex encoding is `0x07852483`."
        ],
        references: ["Assignment 5 Problem 1"],
        tags: ["machine-code", "encoding", "lw", "assignment5"]
      }
    ]
  }
];
