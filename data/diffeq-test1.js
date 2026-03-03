// United Exams - Differential Equations Core Bank
window.DIFFEQ_TEST1_BANK = [

// Professor-priority questions
{id:"DP1",chapter:1,type:"single",fromProfessor:true,topics:["separable","first-order"],
  question:"Which first-order differential equation is separable as written?",
  options:[
    "y' + 3y = x",
    "y' = x(1 + y)",
    "y' + x y = x^2",
    "x y' + y = sin(x)",
  ],answer:[1],
  explanation:"y' = x(1+y) can be rearranged as dy/(1+y) = x dx, so it is separable."},

{id:"DP2",chapter:1,type:"fill",fromProfessor:true,topics:["linear-first-order","integrating-factor"],
  question:"For y' + P(x)y = Q(x), the standard integrating factor is mu(x) = e^{______}.",
  answer:["integral of p(x) dx"],
  acceptableAnswers:[["integral","p(x)","dx"],["int","p(x)","dx"],["\u222bp(x)dx"],["p(x)","dx"]],
  explanation:"For linear first-order ODEs, mu(x) = exp( integral P(x) dx )."},

{id:"DP3",chapter:2,type:"single",fromProfessor:true,topics:["second-order","characteristic-equation"],
  question:"For y'' - 4y' + 4y = 0, which general solution is correct?",
  options:[
    "y = c1 e^{2x} + c2 e^{-2x}",
    "y = c1 cos(2x) + c2 sin(2x)",
    "y = (c1 + c2 x)e^{2x}",
    "y = c1 + c2 e^{4x}",
  ],answer:[2],
  explanation:"Characteristic equation r^2 - 4r + 4 = (r-2)^2 has repeated root r=2, so y=(c1+c2 x)e^{2x}."},

{id:"DP4",chapter:3,type:"single",fromProfessor:true,topics:["laplace","derivative-rule"],
  question:"If L{y(t)} = Y(s), then L{y'(t)} equals:",
  options:["sY(s)","sY(s) - y(0)","sY(s) - y'(0)","Y(s)/s"],
  answer:[1],
  explanation:"Derivative rule: L{y'} = sY(s) - y(0)."},

{id:"DP5",chapter:4,type:"single",fromProfessor:true,topics:["systems","matrix-form"],
  question:"A linear system x' = Ax is solved by diagonalizing A primarily to:",
  options:[
    "Convert every system into a separable scalar ODE.",
    "Reduce the system to independent modes along eigenvectors.",
    "Avoid using initial conditions.",
    "Guarantee periodic solutions.",
  ],answer:[1],
  explanation:"Diagonalization decouples the system into modes associated with eigenvalues/eigenvectors."},

// Chapter 1
{id:"D1-01",chapter:1,type:"single",topics:["classification","order"],
  question:"The order of y''' + 2y' - y = e^x is:",
  options:["1","2","3","Depends on initial conditions"],
  answer:[2],
  explanation:"The highest derivative is third derivative, so order is 3."},

{id:"D1-02",chapter:1,type:"single",topics:["linear-first-order"],
  question:"Which equation is linear in y?",
  options:[
    "y' + x y = cos(x)",
    "y' = y^2 + x",
    "y' + sin(y) = x",
    "y y' + x = 0",
  ],answer:[0],
  explanation:"Linear means y and derivatives appear to first power and are not multiplied together."},

{id:"D1-03",chapter:1,type:"single",topics:["initial-value-problem","separable"],
  question:"Solve y' = 2x with y(0)=3. What is y(x)?",
  options:["x^2 + 3","2x^2 + 3","x^2 + 2","2x + 3"],
  answer:[0],
  explanation:"Integrate: y = x^2 + C, and y(0)=3 gives C=3."},

{id:"D1-04",chapter:1,type:"single",topics:["logistic","equilibria"],
  question:"For y' = r y(1 - y/K), the equilibrium solutions are:",
  options:["y = r and y = K","y = 0 and y = K","y = 1 and y = K/r","y = -K and y = K"],
  answer:[1],
  explanation:"Set y' = 0: y=0 or (1-y/K)=0 => y=K."},

{id:"D1-05",chapter:1,type:"multi",topics:["separable","technique"],
  question:"For a separable ODE, which steps are valid? (Select all that apply)",
  options:[
    "Collect y terms with dy on one side and x terms with dx on the other.",
    "Integrate both sides after separation.",
    "Always apply Laplace transforms first.",
    "Apply initial conditions after finding the antiderivative relation.",
  ],answer:[0,1,3],
  explanation:"Separable workflow: separate variables, integrate, then apply conditions."},

{id:"D1-06",chapter:1,type:"fill",topics:["growth-decay"],
  question:"For y' = ky with k > 0, solutions show exponential _______.",
  answer:["growth"],acceptableAnswers:[["growth"]],
  explanation:"Positive k in y'=ky gives exponential growth."},

// Chapter 2
{id:"D2-01",chapter:2,type:"single",topics:["characteristic-equation","distinct-roots"],
  question:"If r1 and r2 are distinct real roots of the characteristic equation, the homogeneous solution is:",
  options:[
    "y_h = c1 e^{r1 x} + c2 e^{r2 x}",
    "y_h = (c1 + c2 x)e^{r1 x}",
    "y_h = e^{ax}(c1 cos bx + c2 sin bx) always",
    "y_h = c1 r1^x + c2 r2^x",
  ],answer:[0],
  explanation:"Distinct real roots produce sum of exponentials."},

{id:"D2-02",chapter:2,type:"single",topics:["complex-roots"],
  question:"For roots r = a +- bi, the real-form solution is:",
  options:[
    "y = c1 e^{ax} cos(bx) + c2 e^{ax} sin(bx)",
    "y = c1 cos(ax) + c2 sin(ax)",
    "y = c1 e^{bx} + c2 e^{-bx}",
    "y = (c1 + c2 x)e^{ax}",
  ],answer:[0],
  explanation:"Complex conjugate roots give damped sinusoidal form."},

{id:"D2-03",chapter:2,type:"single",topics:["undetermined-coefficients"],
  question:"Method of undetermined coefficients is typically used for:",
  options:[
    "First-order nonlinear ODEs only",
    "Linear ODEs with simple forcing terms like polynomials, exponentials, sines/cosines",
    "Any PDE with boundary values",
    "Only exact equations",
  ],answer:[1],
  explanation:"Undetermined coefficients targets linear constant-coefficient ODEs with compatible forcing forms."},

{id:"D2-04",chapter:2,type:"single",topics:["resonance","particular-solution"],
  question:"If a guessed particular solution duplicates part of y_h, you should:",
  options:[
    "Discard the problem as unsolvable",
    "Multiply the guess by x (or higher power as needed)",
    "Differentiate the guess once",
    "Replace forcing with zero",
  ],answer:[1],
  explanation:"Resonance correction: multiply trial by x enough times to restore linear independence."},

{id:"D2-05",chapter:2,type:"fill",topics:["wronskian","linear-independence"],
  question:"Two solutions are linearly independent on an interval if their Wronskian is not identically _______.",
  answer:["zero"],acceptableAnswers:[["zero"],["0"]],
  explanation:"A nonzero Wronskian (on interval) indicates independence."},

{id:"D2-06",chapter:2,type:"multi",topics:["damped-oscillator","modeling"],
  question:"For m y'' + c y' + k y = 0, which statements are true? (Select all that apply)",
  options:[
    "c controls damping.",
    "k controls stiffness/restoring force.",
    "m has no effect on dynamics.",
    "Different c values can produce under/critical/over damping.",
  ],answer:[0,1,3],
  explanation:"Mass, damping, and stiffness all shape dynamics; c determines damping regime."},

// Chapter 3
{id:"D3-01",chapter:3,type:"single",topics:["laplace-table"],
  question:"L{sin(at)} equals:",
  options:["a/(s^2 + a^2)","s/(s^2 + a^2)","1/(s-a)","a/(s-a)^2"],
  answer:[0],
  explanation:"Standard table entry: L{sin(at)} = a/(s^2+a^2)."},

{id:"D3-02",chapter:3,type:"single",topics:["laplace-table"],
  question:"L{cos(at)} equals:",
  options:["a/(s^2 + a^2)","s/(s^2 + a^2)","1/(s+a)","s/(s-a^2)"],
  answer:[1],
  explanation:"Standard table entry: L{cos(at)} = s/(s^2+a^2)."},

{id:"D3-03",chapter:3,type:"single",topics:["partial-fractions","inverse-laplace"],
  question:"To invert Y(s) that is a rational function, the usual first step is:",
  options:[
    "Differentiate Y(s) repeatedly",
    "Use partial fraction decomposition",
    "Set s=0 and approximate",
    "Apply Fourier transform",
  ],answer:[1],
  explanation:"Partial fractions express Y(s) in invertible table forms."},

{id:"D3-04",chapter:3,type:"fill",topics:["unit-step","shifting"],
  question:"The Laplace time-shifting theorem usually involves the unit step function u(t-a), where a is a positive _______.",
  answer:["constant"],acceptableAnswers:[["constant"],["number"]],
  explanation:"Time shift uses u(t-a) with positive shift constant a."},

{id:"D3-05",chapter:3,type:"multi",topics:["laplace-application","ivp"],
  question:"Why is Laplace transform useful for IVPs? (Select all that apply)",
  options:[
    "It converts differential equations into algebraic equations in s.",
    "It naturally incorporates initial conditions.",
    "It only works for homogeneous equations.",
    "It handles piecewise/impulse forcing well.",
  ],answer:[0,1,3],
  explanation:"Laplace reduces differentiation to algebra and handles initial data and discontinuous forcing."},

// Chapter 4
{id:"D4-01",chapter:4,type:"single",topics:["systems","eigenvalues"],
  question:"For x' = Ax with two distinct real eigenvalues, the solution is generally:",
  options:[
    "A linear combination of eigenvector modes e^{lambda t}",
    "Always periodic",
    "Always polynomial in t",
    "Independent of initial conditions",
  ],answer:[0],
  explanation:"Each eigenpair contributes a modal term c v e^{lambda t}."},

{id:"D4-02",chapter:4,type:"single",topics:["equilibrium","stability"],
  question:"If all eigenvalues of A have negative real parts, the equilibrium at the origin is:",
  options:["Unstable","Asymptotically stable","A saddle","Always a center"],
  answer:[1],
  explanation:"Negative real parts imply trajectories decay toward origin."},

{id:"D4-03",chapter:4,type:"fill",topics:["phase-plane"],
  question:"A linear 2D system with one positive and one negative real eigenvalue has a _______ point.",
  answer:["saddle"],acceptableAnswers:[["saddle"],["saddle point"]],
  explanation:"Opposite-sign real eigenvalues classify as saddle (unstable)."},

{id:"D4-04",chapter:4,type:"multi",topics:["modeling","qualitative-analysis"],
  question:"Qualitative analysis of DE models often focuses on which items? (Select all that apply)",
  options:[
    "Equilibrium points",
    "Stability behavior",
    "Long-term trends",
    "The exact decimal value of every trajectory at every t",
  ],answer:[0,1,2],
  explanation:"Qualitative methods emphasize equilibrium, stability, and long-term behavior."},

// Free response
{id:"DFR1",chapter:2,type:"free",topics:["second-order","solution-strategy"],
  question:"Outline a full strategy for solving a nonhomogeneous second-order linear ODE with constant coefficients and initial conditions.",
  answer:[],
  explanation:"Typical steps: solve homogeneous via characteristic equation, choose a method for y_p (undetermined coefficients or variation of parameters), form y=y_h+y_p, compute constants from initial conditions, verify."},

{id:"DFR2",chapter:3,type:"free",topics:["laplace","ivp"],
  question:"Explain when Laplace transforms are preferable to direct ODE methods, and give one example type of forcing where Laplace is especially efficient.",
  answer:[],
  explanation:"Laplace is preferred for IVPs with discontinuous, piecewise, impulse, or shifted inputs. It converts derivatives to algebra and embeds initial conditions directly."},
];
