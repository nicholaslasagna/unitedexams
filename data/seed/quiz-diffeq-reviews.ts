import type { QuizSet } from "@/lib/types";

const differentialEquationReviewReplacementsRaw: QuizSet[] = [
  {
    id: "de-hw1",
    courseId: "differential-equations",
    title: "Differential Equations Homework 1 Study",
    description:
      "Homework 1 step-by-step solving set. Work each equation exactly like the worksheet, one problem at a time.",
    difficulty: "Advanced",
    estMinutes: 42,
    tags: ["homework-1", "step-by-step", "free-response", "solve-only"],
    timerDefaultMinutes: 40,
    questions: [
      {
        id: "de-hw1-q1",
        type: "free",
        prompt: "Solve `y' + 3y = t + e^{-2t}`.",
        explanation: "First-order linear ODE. Use integrating factor `e^{3t}`.",
        sampleAnswer: "`y(t) = t/3 - 1/9 + e^{-2t} + C e^{-3t}`.",
        hintSteps: [
          "Identify linear form `y' + P(t)y = Q(t)` with `P(t)=3`.",
          "Use integrating factor `\u03bc(t)=e^{\int 3 dt}=e^{3t}`.",
          "Rewrite as `(e^{3t}y)' = e^{3t}(t+e^{-2t})`.",
          "Integrate and divide by `e^{3t}`."
        ],
        walkthroughSteps: [
          "Multiply by `e^{3t}`: `(e^{3t}y)' = t e^{3t} + e^t`.",
          "Integrate: `e^{3t}y = \int t e^{3t}dt + \int e^t dt + C`.",
          "Compute `\int t e^{3t}dt = e^{3t}(t/3 - 1/9)` and `\int e^t dt = e^t`.",
          "So `e^{3t}y = e^{3t}(t/3 - 1/9) + e^t + C`.",
          "Divide by `e^{3t}`: `y = t/3 - 1/9 + e^{-2t} + C e^{-3t}`."
        ],
        references: ["hwk_diff1.pdf Problem 1"],
        tags: ["homework-1", "linear-first-order", "integrating-factor"]
      },
      {
        id: "de-hw1-q2",
        type: "free",
        prompt: "Solve `y' + y = 5\sin(2t)`.",
        explanation: "First-order linear ODE with sinusoidal forcing; integrating factor `e^t`.",
        sampleAnswer: "`y(t) = \sin(2t) - 2\cos(2t) + C e^{-t}`.",
        hintSteps: [
          "Use `\u03bc(t)=e^{\int 1 dt}=e^t`.",
          "Write `(e^t y)' = 5 e^t \sin(2t)`.",
          "Use `\int e^{at}\sin(bt)dt` formula.",
          "Divide by `e^t` at the end."
        ],
        walkthroughSteps: [
          "Multiply by `e^t`: `(e^t y)' = 5 e^t\sin(2t)`.",
          "Integrate: `e^t y = 5\int e^t\sin(2t)dt + C`.",
          "`\int e^t\sin(2t)dt = e^t(\sin(2t)-2\cos(2t))/5`.",
          "Thus `e^t y = e^t(\sin(2t)-2\cos(2t)) + C`.",
          "So `y = \sin(2t)-2\cos(2t)+C e^{-t}`."
        ],
        references: ["hwk_diff1.pdf Problem 1"],
        tags: ["homework-1", "linear-first-order", "trig-forcing"]
      },
      {
        id: "de-hw1-q3",
        type: "free",
        prompt: "Solve the IVP `y' + (2/t)y = \cos t / t^2`, `y(\pi)=0`, `t>0`.",
        explanation: "Use integrating factor `t^2` so the left side becomes `(t^2y)'`.",
        sampleAnswer: "`y(t) = \sin t / t^2`.",
        hintSteps: [
          "Treat this as linear in `y` with `P(t)=2/t`.",
          "Integrating factor is `\u03bc(t)=e^{\int (2/t)dt}=t^2`.",
          "Integrate `(t^2y)' = \cos t`.",
          "Use `y(\pi)=0` to find the constant."
        ],
        walkthroughSteps: [
          "Multiply by `t^2`: `(t^2y)' = \cos t`.",
          "Integrate: `t^2y = \sin t + C`.",
          "Apply `y(\pi)=0`: `0 = \sin\pi + C`, so `C=0`.",
          "Therefore `y(t)=\sin t / t^2`."
        ],
        references: ["hwk_diff1.pdf Problem 2"],
        tags: ["homework-1", "ivp", "integrating-factor"]
      },
      {
        id: "de-hw1-q4",
        type: "free",
        prompt: "Solve the IVP `t y' + (t+1)y = 2t e^{-t}`, `y(1)=3`, `t>0`.",
        explanation: "Divide by `t`, solve linear ODE with integrating factor `te^t`.",
        sampleAnswer: "`y(t) = e^{-t}(t + (3e-1)/t)`.",
        hintSteps: [
          "Write `y' + (1+1/t)y = 2e^{-t}`.",
          "Compute `\u03bc(t)=e^{\int(1+1/t)dt}=te^t`.",
          "Integrate `(te^t y)' = 2t`.",
          "Use `y(1)=3`."
        ],
        walkthroughSteps: [
          "`(te^t y)' = 2t`.",
          "Integrate: `te^t y = t^2 + C`.",
          "So `y = e^{-t}(t + C/t)`.",
          "At `t=1`: `3 = e^{-1}(1+C)` gives `C=3e-1`.",
          "Final: `y(t)=e^{-t}(t + (3e-1)/t)`."
        ],
        references: ["hwk_diff1.pdf Problem 2"],
        tags: ["homework-1", "ivp", "linear-first-order"]
      },
      {
        id: "de-hw1-q5",
        type: "free",
        prompt: "Solve `dy/dx = e^{2x+3y}`.",
        explanation: "Separable after rewriting as `e^{-3y}dy = e^{2x}dx`.",
        sampleAnswer: "`e^{-3y} = C - (3/2)e^{2x}`.",
        hintSteps: [
          "Use `e^{2x+3y}=e^{2x}e^{3y}`.",
          "Move `e^{3y}` to the left.",
          "Integrate both sides.",
          "Solve implicitly for `y`."
        ],
        walkthroughSteps: [
          "Separate: `e^{-3y}dy = e^{2x}dx`.",
          "Integrate: `-(1/3)e^{-3y} = (1/2)e^{2x}+C`.",
          "Multiply by `-3`: `e^{-3y} = C - (3/2)e^{2x}`.",
          "Equivalent explicit form: `y = -(1/3)\ln(C-(3/2)e^{2x})`."
        ],
        references: ["hwk_diff1.pdf Problem 3"],
        tags: ["homework-1", "separable", "exponential"]
      },
      {
        id: "de-hw1-q6",
        type: "free",
        prompt: "Solve `y' = \cos^2 x\,\cos^2(2y)`.",
        explanation: "Separable: put all `y` terms with `dy`, all `x` terms with `dx`.",
        sampleAnswer: "`\tfrac12\tan(2y)+y = x/2 + \sin(2x)/4 + C`.",
        hintSteps: [
          "Write `dy/\cos^2(2y) = \cos^2 x\,dx`.",
          "Use identities `1/\cos^2(2y)=\sec^2(2y)` and `\cos^2x=(1+\cos2x)/2`.",
          "Integrate left with substitution `u=2y`.",
          "Integrate right term-by-term."
        ],
        walkthroughSteps: [
          "`\int \sec^2(2y)dy = \int \cos^2x\,dx`.",
          "Left: `(1/2)\tan(2y)`.",
          "Right: `\int (1+\cos2x)/2\,dx = x/2 + \sin(2x)/4`.",
          "Thus `(1/2)\tan(2y) = x/2 + \sin(2x)/4 + C`.",
          "Equivalent solved form includes same constant shift."
        ],
        references: ["hwk_diff1.pdf Problem 3"],
        tags: ["homework-1", "separable", "trig-integrals"]
      },
      {
        id: "de-hw1-q7",
        type: "free",
        prompt: "Solve `dy/dx = y/x`.",
        explanation: "Direct separable equation leading to logarithms and power-law solution.",
        sampleAnswer: "`y = Cx`.",
        hintSteps: [
          "Rewrite as `dy/y = dx/x`.",
          "Integrate both sides.",
          "Exponentiate and absorb sign into constant."
        ],
        walkthroughSteps: [
          "`\int dy/y = \int dx/x` gives `\ln|y| = \ln|x| + C`.",
          "So `|y| = e^C|x|`.",
          "Absorb constants/signs: `y = Cx`."
        ],
        references: ["hwk_diff1.pdf Problem 3"],
        tags: ["homework-1", "separable", "logarithms"]
      },
      {
        id: "de-hw1-q8",
        type: "free",
        prompt: "Solve the IVP `y' = (1-2x)y^2`, `y(0)=-1/6`.",
        explanation: "Separable IVP with `\int y^{-2}dy = -1/y`.",
        sampleAnswer: "`y(x) = -1/(x-x^2+6)`.",
        hintSteps: [
          "Separate `y^{-2}dy = (1-2x)dx`.",
          "Integrate both sides.",
          "Use `y(0)=-1/6` to determine constant.",
          "Invert to solve for `y`."
        ],
        walkthroughSteps: [
          "`\int y^{-2}dy = \int (1-2x)dx` gives `-1/y = x-x^2+C`.",
          "At `x=0`, `-1/(-1/6)=6`, so `C=6`.",
          "Then `-1/y = x-x^2+6`.",
          "Hence `y = -1/(x-x^2+6)`."
        ],
        references: ["hwk_diff1.pdf Problem 4"],
        tags: ["homework-1", "ivp", "separable"]
      }
    ]
  },
  {
    id: "de-hw2",
    courseId: "differential-equations",
    title: "Differential Equations Homework 2 Study",
    description:
      "Homework 2 exact-equation and integrating-factor practice, solved line by line.",
    difficulty: "Advanced",
    estMinutes: 46,
    tags: ["homework-2", "exact-equations", "integrating-factor", "free-response"],
    timerDefaultMinutes: 42,
    questions: [
      {
        id: "de-hw2-q1",
        type: "free",
        prompt: "Solve `(2x+3) + (2y-2)y' = 0` using exact-equation workflow.",
        explanation: "`M=2x+3`, `N=2y-2`; exact since `M_y=N_x=0`.",
        sampleAnswer: "`x^2+3x+y^2-2y = C`.",
        hintSteps: [
          "Write `Mdx+Ndy=0`.",
          "Check `M_y` vs `N_x`.",
          "Integrate `M` wrt `x` and add `g(y)`.",
          "Match with `N` to determine `g(y)`."
        ],
        walkthroughSteps: [
          "`M=2x+3`, `N=2y-2`, exact since `M_y=N_x=0`.",
          "`F_x=M` gives `F=x^2+3x+g(y)`.",
          "`F_y=g'(y)=2y-2` so `g=y^2-2y`.",
          "Implicit solution: `x^2+3x+y^2-2y=C`."
        ],
        references: ["hwk_diff2.pdf Problem 1"],
        tags: ["homework-2", "exact", "implicit-solution"]
      },
      {
        id: "de-hw2-q2",
        type: "free",
        prompt: "Solve `y' = e^{2x} + y + 1`.",
        explanation: "Linear equation: `y' - y = e^{2x}+1` with integrating factor `e^{-x}`.",
        sampleAnswer: "`y(x)=C e^x + e^{2x} - 1`.",
        hintSteps: [
          "Rearrange to `y' - y = e^{2x}+1`.",
          "Use integrating factor `\u03bc=e^{-x}`.",
          "Integrate `(e^{-x}y)' = e^x + e^{-x}`.",
          "Solve for `y`."
        ],
        walkthroughSteps: [
          "Multiply by `e^{-x}`: `(e^{-x}y)' = e^x + e^{-x}`.",
          "Integrate: `e^{-x}y = e^x - e^{-x} + C`.",
          "Multiply by `e^x`: `y = e^{2x} - 1 + Ce^x`."
        ],
        references: ["hwk_diff2.pdf Problem 2"],
        tags: ["homework-2", "linear-first-order", "integrating-factor"]
      },
      {
        id: "de-hw2-q3",
        type: "free",
        prompt: "Solve `(3x^2-2xy+2) + (6y^2-x^2+3)y' = 0`.",
        explanation: "Exact equation with `M_y=N_x=-2x`.",
        sampleAnswer: "`x^3 - x^2y + 2x + 2y^3 + 3y = C`.",
        hintSteps: [
          "Identify `M` and `N`.",
          "Check exactness via partials.",
          "Integrate `M` wrt `x`.",
          "Match `F_y` with `N`."
        ],
        walkthroughSteps: [
          "`M=3x^2-2xy+2`, `N=6y^2-x^2+3`.",
          "`M_y=-2x`, `N_x=-2x` => exact.",
          "`F=\int M dx = x^3-x^2y+2x+g(y)`.",
          "`F_y=-x^2+g'(y)=6y^2-x^2+3` => `g'=6y^2+3`.",
          "`g=2y^3+3y`; final `x^3-x^2y+2x+2y^3+3y=C`."
        ],
        references: ["hwk_diff2.pdf Problem 3"],
        tags: ["homework-2", "exact", "partial-derivatives"]
      },
      {
        id: "de-hw2-q4",
        type: "free",
        prompt: "Solve `(y/x + 6x) + (\ln x - 2)y' = 0`.",
        explanation: "Exact after writing `M=y/x+6x`, `N=\ln x -2`.",
        sampleAnswer: "`y\ln x - 2y + 3x^2 = C`.",
        hintSteps: [
          "Check exactness: `M_y` and `N_x`.",
          "Integrate `M` wrt `x` treating `y` constant.",
          "Differentiate with respect to `y` and match `N`."
        ],
        walkthroughSteps: [
          "`M_y=1/x`, `N_x=1/x`, so exact.",
          "`F=\int (y/x+6x)dx = y\ln x + 3x^2 + g(y)`.",
          "`F_y=\ln x + g'(y) = \ln x -2` => `g'=-2`.",
          "`g=-2y`; solution `y\ln x -2y +3x^2 = C`."
        ],
        references: ["hwk_diff2.pdf Problem 4"],
        tags: ["homework-2", "exact", "logarithms"]
      },
      {
        id: "de-hw2-q5",
        type: "free",
        prompt: "Solve `y + (2xy - e^{-2y})y' = 0`.",
        explanation:
          "Not exact as written. Use integrating factor `\\mu(y)=e^{2y}/y`, then solve the exact equation.",
        sampleAnswer: "`x e^{2y} - \\ln|y| = C`.",
        hintSteps: [
          "Write differential form `Mdx + Ndy = 0` with `M=y`, `N=2xy-e^{-2y}`.",
          "Check exactness: `M_y \\neq N_x`, so look for integrating factor depending on `y`.",
          "Compute `(N_x-M_y)/M` and integrate to get `\\mu(y)`.",
          "Multiply through by `\\mu(y)` and solve as exact."
        ],
        walkthroughSteps: [
          "Re-express ODE as `y\\,dx + (2xy-e^{-2y})\\,dy=0`.",
          "Here `M=y`, `N=2xy-e^{-2y}` so `M_y=1`, `N_x=2y` (not exact).",
          "Compute `(N_x-M_y)/M = (2y-1)/y = 2 - 1/y`, a function of `y` only.",
          "Integrating factor: `\\mu(y)=e^{\\int(2-1/y)dy}=e^{2y}/y`.",
          "Multiply equation: `e^{2y}dx + (2xe^{2y}-1/y)dy=0` (now exact).",
          "Potential from `F_x=e^{2y}` is `F=xe^{2y}+g(y)`.",
          "Match `F_y=2xe^{2y}+g'(y)=2xe^{2y}-1/y`, so `g'=-1/y` and `g=-\\ln|y|`.",
          "Final implicit solution: `x e^{2y} - \\ln|y| = C`."
        ],
        references: ["hwk_diff2.pdf Problem 5", "review1_1.pdf Problem 14"],
        tags: ["homework-2", "integrating-factor", "not-exact", "implicit"]
      },
      {
        id: "de-hw2-q6",
        type: "free",
        prompt: "Solve the IVP `(2x-y) + (2y-x)y' = 0`, `y(1)=3`.",
        explanation: "Exact equation with an initial condition to solve for `C`.",
        sampleAnswer: "`x^2 - xy + y^2 = 7`.",
        hintSteps: [
          "Set `M=2x-y`, `N=2y-x`.",
          "Check exactness and build `F(x,y)`.",
          "Apply point `(1,3)` to compute constant."
        ],
        walkthroughSteps: [
          "`M_y=-1`, `N_x=-1` => exact.",
          "`F=\int (2x-y)dx = x^2-xy+g(y)`.",
          "`F_y=-x+g'(y)=2y-x` => `g'=2y`, so `g=y^2`.",
          "Implicit family: `x^2-xy+y^2=C`.",
          "Use `(1,3)`: `1-3+9=7`, so `C=7`."
        ],
        references: ["hwk_diff2.pdf Problem 6"],
        tags: ["homework-2", "ivp", "exact"]
      },
      {
        id: "de-hw2-q7",
        type: "free",
        prompt: "Solve `(x+2)\\sin y + (x\\cos y)y' = 0`.",
        explanation:
          "Not exact as written. Use integrating factor `\\mu(x)=x e^x`, then solve the exact equation.",
        sampleAnswer: "`x^2 e^x\\sin y = C`.",
        hintSteps: [
          "Take `M=(x+2)\\sin y`, `N=x\\cos y`.",
          "Check exactness first: `M_y \\neq N_x`.",
          "Compute `(M_y-N_x)/N` to test for integrating factor in `x`.",
          "Multiply by `\\mu(x)` and solve exact potential."
        ],
        walkthroughSteps: [
          "Differential form: `Mdx+Ndy=0` with `M=(x+2)\\sin y`, `N=x\\cos y`.",
          "Check exactness: `M_y=(x+2)\\cos y`, `N_x=\\cos y` -> not exact.",
          "Compute `(M_y-N_x)/N = ((x+1)\\cos y)/(x\\cos y) = (x+1)/x`, function of `x` only.",
          "Integrating factor: `\\mu(x)=e^{\\int (x+1)/x\\,dx}=e^{x+\\ln x}=x e^x`.",
          "Multiply equation: `x e^x(x+2)\\sin y\\,dx + x^2 e^x\\cos y\\,dy = 0` (exact).",
          "Take `F_y = x^2 e^x\\cos y`, integrate wrt `y`: `F = x^2 e^x\\sin y + h(x)`.",
          "Differentiate wrt `x` and match to `M^*`; this gives `h'(x)=0`.",
          "Final implicit solution: `x^2 e^x\\sin y = C`."
        ],
        references: ["hwk_diff2.pdf Problem 7", "review1_1.pdf Problem 15"],
        tags: ["homework-2", "integrating-factor", "not-exact", "trigonometric"]
      },
      {
        id: "de-hw2-q8",
        type: "free",
        prompt: "For `y' = e^{2x} + y + 1`, solve and then verify by substitution.",
        explanation: "Use your result and plug back into `y' - y` to confirm RHS.",
        sampleAnswer: "`y=Ce^x+e^{2x}-1`; substitution gives `y'-y=e^{2x}+1`.",
        hintSteps: [
          "Reuse solution from Problem 2.",
          "Differentiate your `y`.",
          "Compute `y'-y` exactly.",
          "Match with original RHS."
        ],
        walkthroughSteps: [
          "Take `y=Ce^x+e^{2x}-1`.",
          "Then `y'=Ce^x+2e^{2x}`.",
          "`y'-y = (Ce^x+2e^{2x})-(Ce^x+e^{2x}-1)=e^{2x}+1`.",
          "So the solution is verified."
        ],
        references: ["hwk_diff2.pdf Problem 2"],
        tags: ["homework-2", "verification", "linear-first-order"]
      }
    ]
  },
  {
    id: "de-hw3",
    courseId: "differential-equations",
    title: "Differential Equations Homework 3 Study",
    description:
      "Homework 3 second-order homogeneous equations and IVPs, solved with characteristic equations and constants.",
    difficulty: "Advanced",
    estMinutes: 48,
    tags: ["homework-3", "second-order", "ivp", "free-response"],
    timerDefaultMinutes: 44,
    questions: [
      {
        id: "de-hw3-q1",
        type: "free",
        prompt: "Find the general solution of `y'' + 2y' - 3y = 0`.",
        explanation: "Characteristic equation gives two distinct real roots.",
        sampleAnswer: "`y=C_1 e^x + C_2 e^{-3x}`.",
        hintSteps: ["Form characteristic polynomial.", "Factor polynomial.", "Build solution from roots."],
        walkthroughSteps: [
          "`r^2+2r-3=0 = (r-1)(r+3)`.",
          "Roots: `r=1,-3`.",
          "`y=C_1e^x + C_2e^{-3x}`."
        ],
        references: ["hwk_diff3.pdf Problem 1"],
        tags: ["homework-3", "homogeneous", "characteristic"]
      },
      {
        id: "de-hw3-q2",
        type: "free",
        prompt: "Find the general solution of `6y'' - y' - y = 0`.",
        explanation: "Two distinct real roots from quadratic formula.",
        sampleAnswer: "`y=C_1 e^{x/2} + C_2 e^{-x/3}`.",
        hintSteps: ["Characteristic equation.", "Solve for roots.", "Write linear combination."],
        walkthroughSteps: [
          "Characteristic: `6r^2-r-1=0`.",
          "Roots: `r=(1\pm5)/12` => `1/2`, `-1/3`.",
          "`y=C_1e^{x/2}+C_2e^{-x/3}`."
        ],
        references: ["hwk_diff3.pdf Problem 1"],
        tags: ["homework-3", "homogeneous", "real-roots"]
      },
      {
        id: "de-hw3-q3",
        type: "free",
        prompt: "Find the general solution of `y'' - 2y' + 2y = 0`.",
        explanation: "Complex roots `1\pm i` lead to oscillatory exponential form.",
        sampleAnswer: "`y=e^x(C_1\cos x + C_2\sin x)`.",
        hintSteps: ["Compute roots.", "Identify `a` and `b`.", "Use complex-root template."],
        walkthroughSteps: [
          "`r^2-2r+2=0` -> `r=1\pm i`.",
          "Template: `e^{ax}(C_1\cos bx + C_2\sin bx)`.",
          "So `y=e^x(C_1\cos x + C_2\sin x)`."
        ],
        references: ["hwk_diff3.pdf Problem 1"],
        tags: ["homework-3", "complex-roots", "homogeneous"]
      },
      {
        id: "de-hw3-q4",
        type: "free",
        prompt: "Find the general solution of `y'' + 6y' + 13y = 0`.",
        explanation: "Complex roots with negative real part produce decaying oscillation.",
        sampleAnswer: "`y=e^{-3x}(C_1\cos 2x + C_2\sin 2x)`.",
        hintSteps: ["Characteristic equation.", "Roots in `a\pm bi` form.", "Plug into template."],
        walkthroughSteps: [
          "`r^2+6r+13=0` -> `r=-3\pm2i`.",
          "Use complex-root solution.",
          "`y=e^{-3x}(C_1\cos2x + C_2\sin2x)`."
        ],
        references: ["hwk_diff3.pdf Problem 1"],
        tags: ["homework-3", "complex-roots", "decay"]
      },
      {
        id: "de-hw3-q5",
        type: "free",
        prompt: "Solve the IVP `y'' + 4y = 0`, `y(0)=0`, `y'(0)=1`.",
        explanation: "Use trig homogeneous solution and enforce both initial conditions.",
        sampleAnswer: "`y=(1/2)\sin(2x)`.",
        hintSteps: ["General solution first.", "Use `y(0)` then `y'(0)`.", "Substitute constants back."],
        walkthroughSteps: [
          "`y=C_1\cos2x + C_2\sin2x`.",
          "`y(0)=0` -> `C_1=0`.",
          "`y'=2C_2\cos2x`, so `y'(0)=2C_2=1` -> `C_2=1/2`.",
          "Final: `y=(1/2)\sin2x`."
        ],
        references: ["hwk_diff3.pdf Problem 2"],
        tags: ["homework-3", "ivp", "trigonometric"]
      },
      {
        id: "de-hw3-q6",
        type: "free",
        prompt: "Solve the IVP `y'' + 2y' + 2y = 0`, `y(\pi/4)=2`, `y'(\pi/4)=-2`.",
        explanation: "Roots `-1\pm i` and two conditions at `x=\pi/4`.",
        sampleAnswer: "`y=e^{-x}(C_1\cos x + C_2\sin x)` with constants from the given point.",
        hintSteps: ["Find homogeneous solution.", "Evaluate `y` and `y'` at `\pi/4`.", "Solve linear system for `C_1,C_2`."],
        walkthroughSteps: [
          "Characteristic roots: `-1\pm i` so `y=e^{-x}(C_1\cos x + C_2\sin x)`.",
          "Differentiate product carefully for `y'`.",
          "Plug `x=\pi/4` into both equations.",
          "Solve the resulting 2x2 system for constants."
        ],
        references: ["hwk_diff3.pdf Problem 2"],
        tags: ["homework-3", "ivp", "complex-roots"]
      },
      {
        id: "de-hw3-q7",
        type: "free",
        prompt: "Solve the IVP `3y'' - y' + 2y = 0`, `y(0)=2`, `y'(0)=0`.",
        explanation: "Complex-root IVP with constants fixed at `x=0`.",
        sampleAnswer:
          "`y=e^{x/6}\left(2\cos(\sqrt{23}x/6) - (2/\sqrt{23})\sin(\sqrt{23}x/6)\right)`.",
        hintSteps: ["Find roots of `3r^2-r+2=0`.", "Use real-form basis.", "Apply initial conditions."],
        walkthroughSteps: [
          "Roots: `(1\pm i\sqrt{23})/6`.",
          "General solution: `e^{x/6}(C_1\cos(\sqrt{23}x/6)+C_2\sin(\sqrt{23}x/6))`.",
          "`y(0)=2` -> `C_1=2`.",
          "Use `y'(0)=0` to solve `C_2=-2/\sqrt{23}`."
        ],
        references: ["hwk_diff3.pdf Problem 2"],
        tags: ["homework-3", "ivp", "complex-roots"]
      },
      {
        id: "de-hw3-q8",
        type: "free",
        prompt: "Solve the IVP `y'' + 8y' - 9y = 0`, `y(1)=1`, `y'(1)=0`.",
        explanation: "Distinct real roots and initial conditions at `x=1`.",
        sampleAnswer: "`y=C_1e^x + C_2e^{-9x}` with constants determined from `x=1` data.",
        hintSteps: ["Find characteristic roots.", "Write `y` and `y'`.", "Plug `x=1` values.", "Solve system."],
        walkthroughSteps: [
          "Characteristic: `r^2+8r-9=0` => roots `1` and `-9`.",
          "`y=C_1e^x + C_2e^{-9x}` and `y'=C_1e^x -9C_2e^{-9x}`.",
          "Apply `y(1)=1`, `y'(1)=0` to solve constants.",
          "Substitute constants into final expression."
        ],
        references: ["hwk_diff3.pdf Problem 2"],
        tags: ["homework-3", "ivp", "real-roots"]
      }
    ]
  },
  {
    id: "de-hw4",
    courseId: "differential-equations",
    title: "Differential Equations Homework 4 Study",
    description:
      "Homework 4 nonhomogeneous second-order equations and IVPs, with full solution walkthroughs.",
    difficulty: "Advanced",
    estMinutes: 52,
    tags: ["homework-4", "nonhomogeneous", "ivp", "free-response"],
    timerDefaultMinutes: 48,
    questions: [
      {
        id: "de-hw4-q1",
        type: "free",
        prompt: "Find the general solution of `16y'' + 24y' + 9y = 0`.",
        explanation: "Repeated-root homogeneous ODE from the characteristic polynomial.",
        sampleAnswer: "`y=(C_1 + C_2 t)e^{-3t/4}`.",
        hintSteps: [
          "Write the characteristic equation `16r^2+24r+9=0`.",
          "Check the discriminant to confirm a repeated root.",
          "For repeated root `r`, use `y=(C_1+C_2t)e^{rt}`."
        ],
        walkthroughSteps: [
          "Characteristic equation: `16r^2 + 24r + 9 = 0`.",
          "Factor: `16r^2 + 24r + 9 = (4r+3)^2`, so `(4r+3)^2=0`.",
          "The repeated root is `r=-3/4`.",
          "For a double root, `y(t)=(C_1 + C_2 t)e^{rt}`.",
          "Therefore `y(t)=(C_1 + C_2 t)e^{-3t/4}`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["homework-4", "homogeneous", "repeated-root"]
      },
      {
        id: "de-hw4-q2",
        type: "free",
        prompt: "Find the general solution of `y'' - 2y' - 3y = 3e^{2t}`.",
        explanation: "Solve homogeneous part, then use undetermined coefficients for exponential forcing.",
        sampleAnswer: "`y=C_1e^{3t}+C_2e^{-t}-e^{2t}`.",
        hintSteps: [
          "Homogeneous roots come from `r^2-2r-3=0`.",
          "Try a particular `y_p=Ae^{2t}` since `r=2` is not a homogeneous root.",
          "Substitute `y_p`, `y_p'`, and `y_p''` and solve for `A`."
        ],
        walkthroughSteps: [
          "Homogeneous equation: `r^2-2r-3=0=(r-3)(r+1)` gives roots `r=3,-1`.",
          "So `y_h=C_1e^{3t}+C_2e^{-t}`.",
          "Try `y_p=Ae^{2t}`. Then `y_p'=2Ae^{2t}`, `y_p''=4Ae^{2t}`.",
          "Substitute: `4Ae^{2t}-2(2Ae^{2t})-3(Ae^{2t})=3e^{2t}`.",
          "This is `-3A e^{2t}=3e^{2t}`, so `A=-1`.",
          "Final solution: `y=C_1e^{3t}+C_2e^{-t}-e^{2t}`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["homework-4", "nonhomogeneous", "undetermined-coefficients"]
      },
      {
        id: "de-hw4-q3",
        type: "free",
        prompt: "Find the general solution of `y'' + 2y' = 3 + 4\sin(2t)`.",
        explanation: "Use homogeneous plus a resonant/trigonometric particular via undetermined coefficients.",
        sampleAnswer: "`y=C_1 + C_2e^{-2t} + (3/2)t - (1/2)\cos(2t) - (1/2)\sin(2t)`.",
        hintSteps: [
          "Homogeneous roots satisfy `r(r+2)=0`.",
          "Use `y_p=At + B\cos(2t)+C\sin(2t)` because constant forcing resonates with root `r=0`.",
          "Substitute into `y''+2y'` and match constant, cosine, and sine coefficients."
        ],
        walkthroughSteps: [
          "Homogeneous: `r^2+2r=0` gives `r=0,-2`, so `y_h=C_1 + C_2e^{-2t}`.",
          "Try `y_p=At + B\cos(2t)+C\sin(2t)`.",
          "Then `y_p'=A-2B\sin(2t)+2C\cos(2t)` and `y_p''=-4B\cos(2t)-4C\sin(2t)`.",
          "Substitute into `y''+2y'`: `2A + (-4B+4C)\cos(2t) + (-4C-4B)\sin(2t)`.",
          "Match coefficients with `3+4\sin(2t)`:",
          "`2A=3`, `-4B+4C=0`, `-4C-4B=4`.",
          "Solve: `A=3/2`, `C=B`, and `-8B=4` so `B=C=-1/2`.",
          "Final: `y=C_1 + C_2e^{-2t} + (3/2)t - (1/2)\cos(2t) - (1/2)\sin(2t)`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["homework-4", "nonhomogeneous", "trig-forcing"]
      },
      {
        id: "de-hw4-q4",
        type: "free",
        prompt: "Find the general solution of `y'' + 9y = 9\sec^2(3t)`.",
        explanation: "Use variation of parameters with basis `cos(3t), sin(3t)` for secant-squared forcing.",
        sampleAnswer:
          "`y=C_1\cos(3t)+C_2\sin(3t)-1+\sin(3t)\ln|\\sec(3t)+\\tan(3t)|`.",
        hintSteps: [
          "Homogeneous basis: `y_1=\\cos(3t)`, `y_2=\\sin(3t)`.",
          "Compute Wronskian `W=y_1y_2' - y_2y_1'`.",
          "Use `u_1'=-y_2 g/W`, `u_2'=y_1 g/W` with `g(t)=9\\sec^2(3t)`."
        ],
        walkthroughSteps: [
          "Homogeneous part: `r^2+9=0` gives `y_h=C_1\\cos(3t)+C_2\\sin(3t)`.",
          "Take `y_1=\\cos(3t)`, `y_2=\\sin(3t)`. Then `W=3`.",
          "With `g(t)=9\\sec^2(3t)`: `u_1'=-y_2 g/W=-3\\tan(3t)\\sec(3t)` and `u_2'=y_1 g/W=3\\sec(3t)`.",
          "Integrate: `u_1=-\\sec(3t)` and `u_2=\\ln|\\sec(3t)+\\tan(3t)|`.",
          "Build particular: `y_p=u_1y_1+u_2y_2=-1+\\sin(3t)\\ln|\\sec(3t)+\\tan(3t)|`.",
          "General solution: `y=C_1\\cos(3t)+C_2\\sin(3t)-1+\\sin(3t)\\ln|\\sec(3t)+\\tan(3t)|`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["homework-4", "variation-of-parameters", "nonhomogeneous"]
      },
      {
        id: "de-hw4-q5",
        type: "free",
        prompt: "Find the general solution of `y'' - 4y' + 4y = (x+1)e^{2x}`.",
        explanation: "Repeated homogeneous root; solve nonhomogeneous term with variation of parameters.",
        sampleAnswer: "`y=e^{2x}\\left(C_1 + C_2x + x^3/6 + x^2/2\\right)`.",
        hintSteps: [
          "Homogeneous root is repeated: `(r-2)^2=0`.",
          "Use `y_1=e^{2x}`, `y_2=xe^{2x}` for variation of parameters.",
          "Compute `W`, then integrate `u_1'` and `u_2'` from `g(x)=(x+1)e^{2x}`."
        ],
        walkthroughSteps: [
          "Homogeneous: `(r-2)^2=0` so `y_h=(C_1 + C_2x)e^{2x}`.",
          "Choose `y_1=e^{2x}`, `y_2=xe^{2x}`. Wronskian is `W=e^{4x}`.",
          "With `g(x)=(x+1)e^{2x}`:",
          "`u_1'=-y_2 g/W=-x(x+1)=-x^2-x`, and `u_2'=y_1 g/W=x+1`.",
          "Integrate: `u_1=-(x^3/3) - x^2/2`, `u_2=x^2/2 + x`.",
          "Particular: `y_p=u_1y_1+u_2y_2=e^{2x}(x^3/6 + x^2/2)`.",
          "Final: `y=e^{2x}\\left(C_1 + C_2x + x^3/6 + x^2/2\\right)`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["homework-4", "resonance", "undetermined-coefficients"]
      },
      {
        id: "de-hw4-q6",
        type: "free",
        prompt: "Solve the IVP `y'' + y = \tan t`, `y(0)=1`, `y'(0)=1`.",
        explanation: "Variation of parameters with trigonometric basis, then apply initial conditions.",
        sampleAnswer: "`y(t)=\\cos t + 2\\sin t - \\cos t\\ln|\\sec t + \\tan t|`.",
        hintSteps: [
          "Homogeneous basis is `\\cos t, \\sin t` with Wronskian `W=1`.",
          "Use `u_1'=-y_2 g`, `u_2'=y_1 g` for `g(t)=\\tan t`.",
          "After building `y_p`, apply `y(0)=1` and `y'(0)=1`."
        ],
        walkthroughSteps: [
          "Homogeneous equation: `r^2+1=0`, so `y_h=C_1\\cos t + C_2\\sin t`.",
          "Take `y_1=\\cos t`, `y_2=\\sin t`, `W=1`, and forcing `g(t)=\\tan t`.",
          "`u_1'=-\\sin t\\tan t = \\cos t - \\sec t`, so `u_1=\\sin t - \\ln|\\sec t+\\tan t|`.",
          "`u_2'=\\cos t\\tan t = \\sin t`, so `u_2=-\\cos t`.",
          "Thus `y_p=u_1y_1+u_2y_2=-\\cos t\\ln|\\sec t+\\tan t|`.",
          "General form: `y=C_1\\cos t + C_2\\sin t - \\cos t\\ln|\\sec t+\\tan t|`.",
          "From `y(0)=1`, get `C_1=1`.",
          "Differentiate and apply `y'(0)=1`: `C_2-1=1`, so `C_2=2`.",
          "Final: `y(t)=\\cos t + 2\\sin t - \\cos t\\ln|\\sec t + \\tan t|`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["homework-4", "ivp", "variation-of-parameters"]
      },
      {
        id: "de-hw4-q7",
        type: "free",
        prompt: "Solve the IVP `9y'' - 12y' + 4y = 0`, `y(0)=2`, `y'(0)=-1`.",
        explanation: "Repeated root IVP.",
        sampleAnswer: "`y(t)=\\left(2-\\frac{7}{3}t\\right)e^{2t/3}`.",
        hintSteps: [
          "Solve characteristic equation `(3r-2)^2=0`.",
          "Use repeated-root form `y=(C_1+C_2t)e^{2t/3}`.",
          "Apply `y(0)` first, then `y'(0)`."
        ],
        walkthroughSteps: [
          "Characteristic: `9r^2-12r+4=(3r-2)^2=0` => `r=2/3` double.",
          "`y=(C_1+C_2t)e^{2t/3}`.",
          "`y(0)=2` gives `C_1=2`.",
          "Differentiate: `y' = C_2 e^{2t/3} + (C_1+C_2t)(2/3)e^{2t/3}`.",
          "At `t=0`: `y'(0)=C_2 + (2/3)C_1 = -1` gives `C_2 + 4/3 = -1`.",
          "So `C_2=-7/3`.",
          "Final `y(t)=\\left(2-\\frac{7}{3}t\\right)e^{2t/3}`."
        ],
        references: ["hwk_diff4.pdf Problem 2"],
        tags: ["homework-4", "ivp", "repeated-root"]
      },
      {
        id: "de-hw4-q8",
        type: "free",
        prompt: "Solve the IVP `y'' + y' - 2y = 2t`, `y(0)=0`, `y'(0)=1`.",
        explanation: "Nonhomogeneous IVP with polynomial forcing.",
        sampleAnswer: "`y(t)=e^t-\\frac12e^{-2t}-t-\\frac12`.",
        hintSteps: [
          "Homogeneous roots come from `(r+2)(r-1)=0`.",
          "Try linear particular `y_p=At+B` for forcing `2t`.",
          "Use `y(0)` and `y'(0)` to solve `C_1,C_2`."
        ],
        walkthroughSteps: [
          "Homogeneous equation: `r^2+r-2=0`, roots `1,-2`, so `y_h=C_1e^t+C_2e^{-2t}`.",
          "Try `y_p=At+B`, so `y_p'=A`, `y_p''=0`.",
          "Substitute into ODE: `A-2(At+B)=2t` => `-2A t + (A-2B)=2t`.",
          "Match coefficients: `A=-1`, `B=-1/2`.",
          "General form: `y=C_1e^t+C_2e^{-2t}-t-1/2`.",
          "From `y(0)=0`: `C_1+C_2=1/2`.",
          "Differentiate: `y'=C_1e^t-2C_2e^{-2t}-1`; from `y'(0)=1`: `C_1-2C_2=2`.",
          "Solve the system: `C_2=-1/2`, `C_1=1`.",
          "Final: `y(t)=e^t-\\frac12e^{-2t}-t-\\frac12`."
        ],
        references: ["hwk_diff4.pdf Problem 2"],
        tags: ["homework-4", "ivp", "nonhomogeneous"]
      }
    ]
  }
];

export const differentialEquationReviewReplacements: QuizSet[] = differentialEquationReviewReplacementsRaw.map(
  (set) => ({
    ...set,
    mode: "homework"
  }),
);
