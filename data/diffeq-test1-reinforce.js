// United Exams - Differential Equations Reinforcement Bank
window.DIFFEQ_TEST1_REINFORCE = [
{id:"DR-01",chapter:1,type:"single",topics:["separable","first-order"],
  question:"Which rewrite confirms y' = (x^2)/(1+y) is separable?",
  options:["dy/dx = x^2(1+y)","(1+y)dy = x^2 dx","y dy = x dx","dy + y dx = x^2"],
  answer:[1],
  explanation:"Move (1+y) with dy and x terms with dx."},

{id:"DR-02",chapter:1,type:"single",topics:["linear-first-order","integrating-factor"],
  question:"For y' + 2y = e^x, the integrating factor is:",
  options:["e^x","e^{2x}","2e^x","x^2"],
  answer:[1],
  explanation:"mu(x)=exp(integral 2 dx)=e^{2x}."},

{id:"DR-03",chapter:1,type:"fill",topics:["growth-decay"],
  question:"In y' = ky, if k < 0 the solution exhibits exponential _______.",
  answer:["decay"],acceptableAnswers:[["decay"]],
  explanation:"Negative k gives decay."},

{id:"DR-04",chapter:1,type:"multi",topics:["exact-equations","first-order"],
  question:"For M(x,y)dx + N(x,y)dy = 0, exactness means: (Select all that apply)",
  options:[
    "There exists potential F with dF = M dx + N dy.",
    "Partial M/partial y equals partial N/partial x.",
    "Equation must be linear in y.",
    "Solution can be written F(x,y)=C.",
  ],answer:[0,1,3],
  explanation:"Exact equations correspond to total differentials."},

{id:"DR-05",chapter:2,type:"single",topics:["characteristic-equation","repeated-roots"],
  question:"Repeated root r=3 for y''-6y'+9y=0 gives:",
  options:["c1e^{3x}+c2e^{-3x}","(c1+c2x)e^{3x}","c1cos3x+c2sin3x","c1+c2e^{3x}"],
  answer:[1],
  explanation:"Repeated root form includes x factor."},

{id:"DR-06",chapter:2,type:"single",topics:["undetermined-coefficients"],
  question:"A good first trial for y''+y = 3cos x is:",
  options:["Acos x + Bsin x","x(Acos x + Bsin x)","Ae^x","Ax^2+Bx+C"],
  answer:[1],
  explanation:"cos x overlaps homogeneous basis, so multiply by x."},

{id:"DR-07",chapter:2,type:"fill",topics:["wronskian","linear-independence"],
  question:"If W(y1,y2)(x0) != 0 at some x0 for a second-order linear ODE, y1 and y2 are linearly _______.",
  answer:["independent"],acceptableAnswers:[["independent"]],
  explanation:"Nonzero Wronskian indicates independence."},

{id:"DR-08",chapter:2,type:"multi",topics:["damping","modeling"],
  question:"Which statements describe underdamped motion? (Select all that apply)",
  options:[
    "Oscillatory behavior is present.",
    "Amplitude decays over time.",
    "No oscillation occurs.",
    "Complex conjugate roots with negative real part appear.",
  ],answer:[0,1,3],
  explanation:"Underdamped systems oscillate while decaying."},

{id:"DR-09",chapter:3,type:"single",topics:["laplace-table"],
  question:"L{e^{at}} equals:",
  options:["1/(s+a)","1/(s-a)","a/(s^2+a^2)","s/(s-a)"],
  answer:[1],
  explanation:"L{e^{at}} = 1/(s-a) for s>a."},

{id:"DR-10",chapter:3,type:"single",topics:["inverse-laplace","partial-fractions"],
  question:"Inverse Laplace of 1/(s-2) is:",
  options:["e^{-2t}","2e^t","e^{2t}","t e^{2t}"],
  answer:[2],
  explanation:"1/(s-a) maps to e^{at}."},

{id:"DR-11",chapter:3,type:"fill",topics:["derivative-rule","laplace"],
  question:"L{y''} = s^2Y(s) - s y(0) - _______.",
  answer:["y'(0)"],acceptableAnswers:[["y'(0)"],["y prime at zero"],["y prime 0"]],
  explanation:"Second-derivative transform includes both initial position and velocity terms."},

{id:"DR-12",chapter:3,type:"multi",topics:["unit-step","piecewise"],
  question:"Unit step functions are useful for representing: (Select all that apply)",
  options:[
    "Piecewise forcing that turns on at time a.",
    "Inputs with delays.",
    "Only polynomial forcing.",
    "Switching behavior in circuits/mechanical loads.",
  ],answer:[0,1,3],
  explanation:"u(t-a) captures delayed/switching input structure."},

{id:"DR-13",chapter:4,type:"single",topics:["systems","eigenvectors"],
  question:"In x' = Ax, eigenvectors primarily determine:",
  options:["Only time step size","Solution directions/modes","Initial condition values","Whether A is square"],
  answer:[1],
  explanation:"Eigenvectors define invariant directions of modal solutions."},

{id:"DR-14",chapter:4,type:"single",topics:["stability","linear-systems"],
  question:"If one eigenvalue has positive real part, the origin is:",
  options:["Asymptotically stable","Unstable","Always a center","Always neutral"],
  answer:[1],
  explanation:"Any positive real part introduces growth, so unstable."},

{id:"DR-15",chapter:4,type:"fill",topics:["phase-plane","classification"],
  question:"A repeated negative eigenvalue with two independent eigenvectors gives a stable _______.",
  answer:["node"],acceptableAnswers:[["node"],["stable node"]],
  explanation:"Negative repeated real eigenvalue with full eigenspace gives stable node behavior."},

{id:"DR-16",chapter:1,type:"single",topics:["existence-uniqueness"],
  question:"A standard local existence-uniqueness theorem for y' = f(x,y) around (x0,y0) typically requires:",
  options:[
    "f and partial f/partial y continuous near (x0,y0)",
    "f polynomial only",
    "Initial value y0 = 0",
    "Equation already solved explicitly",
  ],answer:[0],
  explanation:"Continuity of f and fy near the point is a common sufficient condition."},

{id:"DR-17",chapter:2,type:"single",topics:["variation-of-parameters"],
  question:"Variation of parameters is especially useful when forcing terms are:",
  options:[
    "Outside the standard UC guess family",
    "Always zero",
    "Only constants",
    "Only exponentials",
  ],answer:[0],
  explanation:"VoP handles broad forcing classes where UC is awkward."},

{id:"DR-18",chapter:2,type:"multi",topics:["homogeneous-vs-nonhomogeneous"],
  question:"For linear ODEs, which are true? (Select all that apply)",
  options:[
    "General solution of nonhomogeneous equation = y_h + y_p.",
    "Any sum of homogeneous solutions remains a homogeneous solution.",
    "Particular solution is unique in absolute terms.",
    "Different particular solutions differ by a homogeneous solution.",
  ],answer:[0,1,3],
  explanation:"Particular solutions are not unique; differences lie in y_h."},

{id:"DR-19",chapter:3,type:"single",topics:["convolution","laplace"],
  question:"Convolution in time domain corresponds to what in s-domain?",
  options:["Addition","Multiplication","Differentiation","Time shift"],
  answer:[1],
  explanation:"Laplace transforms turn convolution into multiplication."},

{id:"DR-20",chapter:4,type:"multi",topics:["qualitative-analysis","systems"],
  question:"In phase portrait analysis, useful information includes: (Select all that apply)",
  options:[
    "Direction fields/flow arrows",
    "Equilibria and their type",
    "Nullclines",
    "Only exact numeric values at integer times",
  ],answer:[0,1,2],
  explanation:"Qualitative tools include flow, equilibria, and nullclines."},
];
