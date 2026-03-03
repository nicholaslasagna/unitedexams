// United Exams - Theory of Automata Core Bank (aligned to TrainingData)
window.AUTOMATA_TEST1_BANK = [

// Professor-priority questions from provided tests/homework
{id:"AP1",chapter:1,type:"single",fromProfessor:true,topics:["relations","graphs"],
  question:"For relation R, the directed graph of R union R^-1 is best interpreted as:",
  options:[
    "Keeping only self-loops from R.",
    "Adding reverse-direction edges for every edge in R.",
    "Removing all asymmetric edges from R.",
    "Creating a total order from R.",
  ],answer:[1],
  explanation:"R union R^-1 contains each pair and its reverse, so edges appear both directions where applicable."},

{id:"AP2",chapter:2,type:"single",fromProfessor:true,topics:["regex","set-identity"],
  question:"Which statement matches Homework/Test material?",
  options:[
    "(b* a*) intersection (a* b*) = empty set",
    "(b* a*) intersection (a* b*) = a* union b*",
    "(b* a*) intersection (a* b*) = (ab)*",
    "(b* a*) intersection (a* b*) = (a+b)*",
  ],answer:[1],
  explanation:"The overlap of a* b* and b* a* is strings of only a's or only b's."},

{id:"AP3",chapter:2,type:"single",fromProfessor:true,topics:["regex","language-design"],
  question:"A lecture-note expression for strings over {0,1} with 2 or 3 ones and first two non-consecutive starts with:",
  options:["0*10*010*", "(01)*", "1*0*1*", "(0+1)*111"],
  answer:[0],
  explanation:"The note example uses 0*10*010*... to force spacing between first and second 1."},

{id:"AP4",chapter:2,type:"single",fromProfessor:true,topics:["regex","homework"],
  question:"A valid regex for strings over {a,b} with number of a's divisible by 3 is:",
  options:["b*(ab*ab*ab*)*", "(ab)*", "a*b*", "(aa)*b*"],
  answer:[0],
  explanation:"Each block contributes exactly three a's with any number of b's in between."},

{id:"AP5",chapter:2,type:"single",fromProfessor:true,topics:["dfa","substring"],
  question:"A DFA for language 'w has abab as a substring' must:",
  options:[
    "Track progress through a,b,a,b pattern states.",
    "Count total a's only.",
    "Accept only length-4 strings.",
    "Use a stack to match symbols.",
  ],answer:[0],
  explanation:"Substring DFAs track partial matched prefix of target pattern."},

// Chapter 1: sets, relations, functions
{id:"A1-01",chapter:1,type:"single",topics:["sets","de-morgan"],
  question:"Which identity is correct?",
  options:[
    "A - (B intersection C) = (A - B) union (A - C)",
    "A - (B intersection C) = (A union B) - C",
    "A - (B intersection C) = (A - B) intersection C",
    "A - (B intersection C) = B - (A intersection C)",
  ],answer:[0],
  explanation:"This is the De Morgan-style set-difference identity proved in HW1."},

{id:"A1-02",chapter:1,type:"single",topics:["relations","composition"],
  question:"For relations R and S, composition R o S means:",
  options:[
    "(a,b) is in R o S if (a,b) is in both R and S directly.",
    "(a,b) is in R o S if there exists c with (a,c) in R and (c,b) in S.",
    "R o S always equals S o R.",
    "R o S contains only reflexive pairs.",
  ],answer:[1],
  explanation:"Composition chains through an intermediate element c."},

{id:"A1-03",chapter:1,type:"single",topics:["relations","inverse"],
  question:"If (x,y) is in relation R, then R^-1 contains:",
  options:["(x,y)","(y,x)","(x,x)","(y,y)"],
  answer:[1],
  explanation:"Inverse relation swaps ordered-pair components."},

{id:"A1-04",chapter:1,type:"single",topics:["functions","graph-criterion"],
  question:"A directed graph represents a function exactly when each node in domain has:",
  options:["At least one outgoing edge", "Exactly one outgoing edge", "Exactly one incoming edge", "No self-loops"],
  answer:[1],
  explanation:"Function requires one and only one output for each input."},

{id:"A1-05",chapter:1,type:"single",topics:["partial-order","divisibility"],
  question:"On positive integers, relation aRb iff b is divisible by a is:",
  options:["Neither partial nor total order", "A partial order but not total order", "A total order", "An equivalence relation"],
  answer:[1],
  explanation:"It is reflexive/antisymmetric/transitive but not comparable for every pair (e.g., 2 and 3)."},

{id:"A1-06",chapter:1,type:"multi",topics:["relation-properties"],
  question:"Which properties define an equivalence relation? (Select all that apply)",
  options:["Reflexive", "Symmetric", "Transitive", "Antisymmetric"],
  answer:[0,1,2],
  explanation:"Equivalence relation uses reflexive + symmetric + transitive."},

{id:"A1-07",chapter:1,type:"fill",topics:["closures","relation"],
  question:"R* is commonly called the reflexive transitive _______ of relation R.",
  answer:["closure"],acceptableAnswers:[["closure"]],
  explanation:"R* includes all zero-or-more-step reachability pairs."},

{id:"A1-08",chapter:1,type:"fill",topics:["kleene-star","languages"],
  question:"For the singleton language {epsilon}, we have {epsilon}* = {_______}.",
  answer:["epsilon"],acceptableAnswers:[["epsilon"],["e"]],
  explanation:"Concatenating epsilon any number of times stays epsilon."},

// Chapter 2: finite automata and regular languages
{id:"A2-01",chapter:2,type:"single",topics:["dfa","deterministic"],
  question:"In a DFA transition table, each state/symbol pair has:",
  options:["Zero or more next states", "Exactly one next state", "A stack action", "A grammar rule"],
  answer:[1],
  explanation:"Determinism means one defined transition per symbol from each state."},

{id:"A2-02",chapter:2,type:"single",topics:["nfa","epsilon"],
  question:"An epsilon-transition in NFA consumes:",
  options:["One symbol", "Two symbols", "No symbol", "Whole remaining string"],
  answer:[2],
  explanation:"Epsilon move changes state without input consumption."},

{id:"A2-03",chapter:2,type:"single",topics:["regular-languages","equivalence"],
  question:"DFA and NFA:",
  options:[
    "Recognize different language classes.",
    "Recognize the same regular languages.",
    "Are equivalent only for finite languages.",
    "Need stack memory to be equivalent.",
  ],answer:[1],
  explanation:"NFA can be converted to equivalent DFA by subset construction."},

{id:"A2-04",chapter:2,type:"single",topics:["closure","regular"],
  question:"Regular languages are closed under:",
  options:["Union", "Only complement", "Only reversal", "No operation"],
  answer:[0],
  explanation:"They are closed under union, concat, star, intersection, complement, etc."},

{id:"A2-05",chapter:2,type:"single",topics:["pumping-lemma","nonregular"],
  question:"Pumping lemma is mainly used to:",
  options:["Prove context-freeness", "Construct minimal DFA directly", "Show certain languages are not regular", "Compute closure R*"],
  answer:[2],
  explanation:"Typical use is contradiction proof of non-regularity."},

{id:"A2-06",chapter:2,type:"multi",topics:["regex","homework"],
  question:"Which are valid homework-style regex targets? (Select all that apply)",
  options:[
    "Strings with no more than three a's",
    "Strings with number of a's divisible by 3",
    "Only palindromes of odd length over {a,b}",
    "Strings having abab as a substring",
  ],answer:[0,1,3],
  explanation:"These appear in assigned regex/DFA construction style problems."},

{id:"A2-07",chapter:2,type:"fill",topics:["regular-expressions","operations"],
  question:"Core regex operations are union, concatenation, and Kleene _______.",
  answer:["star"],acceptableAnswers:[["star"]],
  explanation:"Star means zero-or-more repetition."},

{id:"A2-08",chapter:2,type:"single",topics:["nonregular","examples"],
  question:"Which language is not regular?",
  options:["{a^n b^n : n >= 0}", "(ab)*", "a* union b*", "b*(ab*ab*ab*)*"],
  answer:[0],
  explanation:"a^n b^n requires unbounded matching not possible with finite automata."},

{id:"A2-09",chapter:2,type:"single",topics:["regex","lecture-notes"],
  question:"From lecture notes, the language of strings over {0,1} with no substring 111 is regular and can be recognized by:",
  options:["A finite automaton", "Only a PDA", "Only a TM", "No machine"],
  answer:[0],
  explanation:"The notes explicitly discuss finite recognition device for this regular language."},

// Chapter 3: CFG and PDA
{id:"A3-01",chapter:3,type:"single",topics:["cfg","definition"],
  question:"A context-free grammar production has left side:",
  options:["Any string", "Exactly one nonterminal", "Exactly one terminal", "A set of states"],
  answer:[1],
  explanation:"CFG rule form is A -> alpha with single nonterminal A."},

{id:"A3-02",chapter:3,type:"single",topics:["pda","cfl"],
  question:"CFLs are recognized by:",
  options:["DFA", "NFA", "PDA", "Only TM"],
  answer:[2],
  explanation:"Pushdown automata characterize context-free languages."},

{id:"A3-03",chapter:3,type:"single",topics:["regular-vs-cfl"],
  question:"Which statement is true?",
  options:[
    "All CFLs are regular.",
    "All regular languages are context-free.",
    "No regular language is context-free.",
    "CFLs are exactly decidable languages.",
  ],answer:[1],
  explanation:"Regular is a strict subset of context-free."},

{id:"A3-04",chapter:3,type:"multi",topics:["ambiguity","parse-tree"],
  question:"Grammar ambiguity means: (Select all that apply)",
  options:[
    "Some string has more than one parse tree",
    "Some string has more than one leftmost derivation",
    "Alphabet has repeated symbols",
    "Different syntactic structures for same string",
  ],answer:[0,1,3],
  explanation:"Ambiguity is structural non-uniqueness of derivation/parse."},

{id:"A3-05",chapter:3,type:"fill",topics:["grammar","language-class"],
  question:"The language {ww^R : w in {a,b}*} is _______-free and not regular.",
  answer:["context"],acceptableAnswers:[["context"],["context free"],["context-free"]],
  explanation:"It is a standard CFL example generated by S->aSa | bSb | epsilon."},

// Chapter 4: Turing machines and computability
{id:"A4-01",chapter:4,type:"single",topics:["tm","decidable"],
  question:"A decider is a TM that:",
  options:["Accepts only", "Halts on all inputs with accept/reject", "Uses two tapes", "Recognizes only regular languages"],
  answer:[1],
  explanation:"Decidable language has a total halting decision procedure."},

{id:"A4-02",chapter:4,type:"single",topics:["computability","language-hierarchy"],
  question:"Language {a^n b^n c^n : n >= 0} is:",
  options:["Regular", "Context-free", "Not context-free", "Finite"],
  answer:[2],
  explanation:"Standard non-CFL example from pumping/intersection arguments."},

{id:"A4-03",chapter:4,type:"fill",topics:["church-turing","foundations"],
  question:"The _______-Turing thesis informally states effectively computable functions are exactly TM-computable.",
  answer:["church"],acceptableAnswers:[["church"],["church turing"],["church-turing"]],
  explanation:"Foundational thesis relating intuitive and formal computation."},

// Free response
{id:"AFR1",chapter:2,type:"free",topics:["pumping-lemma","proof-technique"],
  question:"Write a complete pumping-lemma proof template for showing a language is not regular, including quantifier order and witness choice strategy.",
  answer:[],
  explanation:"Assume regular with pumping length p. Choose w in L with |w|>=p. For every decomposition w=xyz with |xy|<=p and |y|>0, show an i>=0 such that x y^i z notin L. Contradiction."},

{id:"AFR2",chapter:3,type:"free",topics:["cfg-vs-fa","model-selection"],
  question:"Compare FA, PDA, and TM in one workflow: when each model is sufficient, and how to justify escalating to a stronger model in proofs.",
  answer:[],
  explanation:"FA for regular patterns, PDA for stack-structured dependencies (e.g., a^n b^n, ww^R), TM for broader algorithmic languages (e.g., a^n b^n c^n). Use closure/pumping/reductions to justify boundaries."},
];
