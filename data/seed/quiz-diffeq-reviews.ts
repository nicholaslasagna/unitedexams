import type { QuizSet } from "@/lib/types";

export const differentialEquationReviewReplacements: QuizSet[] = [
  {
    id: "de-core-legacy",
    courseId: "differential-equations",
    title: "Differential Equations Test Review I (Hard Solving)",
    description:
      "Pure computation practice from hwk_diff1, hwk_diff2, and review1_1. No theory prompts, only step-by-step solving.",
    difficulty: "Advanced",
    estMinutes: 40,
    tags: ["test-review", "free-response", "hard-solving", "step-by-step"],
    timerDefaultMinutes: 36,
    questions: [
      {
        id: "de-core-legacy-q1",
        type: "free",
        prompt: "Solve the differential equation `y' = 2xy + 3y - 4x - 6`.",
        explanation:
          "Factor the right side as `(2x+3)(y-2)`, separate variables, integrate, and solve for `y`.",
        sampleAnswer: "`y(x) = 2 + C e^{x^2+3x}`.",
        hintSteps: [
          "Factor `2xy + 3y - 4x - 6` by grouping.",
          "Write the ODE in separable form `dy/(y-2) = (2x+3)dx`.",
          "Integrate both sides exactly.",
          "Exponentiate and isolate `y`."
        ],
        walkthroughSteps: [
          "Rewrite RHS: `2xy + 3y - 4x - 6 = (2x+3)(y-2)`.",
          "Separate: `dy/(y-2) = (2x+3)dx`.",
          "Integrate: `ln|y-2| = x^2 + 3x + C`.",
          "Exponentiate: `y-2 = C e^{x^2+3x}`.",
          "Final form: `y(x)=2 + C e^{x^2+3x}`."
        ],
        references: ["review1_1.pdf Problem 1"],
        tags: ["separable", "factorization", "first-order", "solve"]
      },
      {
        id: "de-core-legacy-q2",
        type: "free",
        prompt: "Solve the differential equation `dy/dx = y(y+1)/(x(x-1))`.",
        explanation:
          "This is separable with partial fractions on both sides before integration.",
        sampleAnswer:
          "`ln|y/(y+1)| = ln|(x-1)/x| + C` (equivalently `y/(y+1) = C (x-1)/x`).",
        hintSteps: [
          "Separate into `dy/(y(y+1)) = dx/(x(x-1))`.",
          "Decompose each side into partial fractions.",
          "Integrate both sides term-by-term.",
          "Combine logarithms and simplify."
        ],
        walkthroughSteps: [
          "Separate: `dy/(y(y+1)) = dx/(x(x-1))`.",
          "Use `1/(y(y+1)) = 1/y - 1/(y+1)`.",
          "Use `1/(x(x-1)) = -1/x + 1/(x-1)`.",
          "Integrate: `ln|y| - ln|y+1| = -ln|x| + ln|x-1| + C`.",
          "Combine logs: `ln|y/(y+1)| = ln|(x-1)/x| + C`."
        ],
        references: ["review1_1.pdf Problem 4"],
        tags: ["separable", "partial-fractions", "logarithms", "solve"]
      },
      {
        id: "de-core-legacy-q3",
        type: "free",
        prompt: "Solve the IVP `t y' + 2y = t^2 + t + 1`, `y(1)=2`.",
        explanation:
          "Convert to linear standard form, use integrating factor `mu=t^2`, then apply the initial condition.",
        sampleAnswer: "`y(t) = t^2/4 + t/3 + 1/2 + (11/12)/t^2`.",
        hintSteps: [
          "Divide the equation by `t` to get `y' + (2/t)y = t + 1 + 1/t`.",
          "Compute integrating factor `mu(t)=exp(integral 2/t dt)`.",
          "Integrate `(mu y)'` exactly.",
          "Use `y(1)=2` to determine the constant."
        ],
        walkthroughSteps: [
          "Write `y' + (2/t)y = t + 1 + 1/t`.",
          "Integrating factor: `mu(t)=t^2`.",
          "Then `(t^2 y)' = t^3 + t^2 + t`.",
          "Integrate: `t^2 y = t^4/4 + t^3/3 + t^2/2 + C`.",
          "So `y = t^2/4 + t/3 + 1/2 + C/t^2`.",
          "Apply `y(1)=2`: `2 = 1/4 + 1/3 + 1/2 + C`, so `C=11/12`."
        ],
        references: ["review1_1.pdf Problem 8"],
        tags: ["linear-first-order", "integrating-factor", "ivp", "solve"]
      },
      {
        id: "de-core-legacy-q4",
        type: "free",
        prompt: "Solve the IVP `t y' + (t+1)y = 2t e^{-t}`, `y(1)=3` (for `t>0`).",
        explanation:
          "After dividing by `t`, this is linear with integrating factor `te^t`.",
        sampleAnswer: "`y(t) = e^{-t}(t + (3e-1)/t)`.",
        hintSteps: [
          "Divide by `t` first.",
          "Compute the integrating factor for `y' + (1+1/t)y = 2e^{-t}`.",
          "Integrate `(mu y)'`.",
          "Use `y(1)=3`."
        ],
        walkthroughSteps: [
          "Standard form: `y' + (1+1/t)y = 2e^{-t}`.",
          "Integrating factor: `mu(t)=exp(integral(1+1/t)dt)=te^t`.",
          "Multiply through: `(te^t y)' = 2t`.",
          "Integrate: `te^t y = t^2 + C`.",
          "So `y = (t^2 + C)/(te^t) = e^{-t}(t + C/t)`.",
          "Apply `y(1)=3`: `3 = e^{-1}(1+C)`, so `C=3e-1`."
        ],
        references: ["hwk_diff1.pdf Problem 2"],
        tags: ["linear-first-order", "integrating-factor", "ivp", "solve"]
      },
      {
        id: "de-core-legacy-q5",
        type: "free",
        prompt: "Solve `dy/dx = e^{2x+3y}`.",
        explanation:
          "Separate using `e^{-3y}dy = e^{2x}dx`, integrate both sides, then isolate `y`.",
        sampleAnswer:
          "`e^{-3y} = C - (3/2)e^{2x}` (equivalently `y = -(1/3)ln(C - (3/2)e^{2x})`).",
        hintSteps: [
          "Use `e^{2x+3y}=e^{2x}e^{3y}`.",
          "Move `e^{3y}` to the left side.",
          "Integrate each side with respect to its variable.",
          "Absorb constants cleanly."
        ],
        walkthroughSteps: [
          "Start: `dy/dx = e^{2x}e^{3y}`.",
          "Separate: `e^{-3y}dy = e^{2x}dx`.",
          "Integrate: `integral e^{-3y}dy = integral e^{2x}dx`.",
          "Get `-(1/3)e^{-3y} = (1/2)e^{2x} + C`.",
          "Rearrange to `e^{-3y} = C - (3/2)e^{2x}`."
        ],
        references: ["hwk_diff1.pdf Problem 3"],
        tags: ["separable", "exponential", "first-order", "solve"]
      },
      {
        id: "de-core-legacy-q6",
        type: "free",
        prompt: "Solve the IVP `y' = (1-2x)y^2`, `y(0) = -1/6`.",
        explanation:
          "Separate as `y^{-2}dy=(1-2x)dx`, integrate, then use the initial condition.",
        sampleAnswer: "`y(x) = -1/(x - x^2 + 6)`.",
        hintSteps: [
          "Move `y^2` to the left side before integrating.",
          "Remember `integral y^{-2}dy = -1/y`.",
          "Apply `y(0)=-1/6` to solve for the constant.",
          "Write final answer as a single rational expression."
        ],
        walkthroughSteps: [
          "Separate: `y^{-2}dy = (1-2x)dx`.",
          "Integrate: `-1/y = x - x^2 + C`.",
          "Apply `x=0`, `y=-1/6`: `6 = C`.",
          "So `-1/y = x - x^2 + 6`.",
          "Hence `y = -1/(x - x^2 + 6)`."
        ],
        references: ["hwk_diff1.pdf Problem 4"],
        tags: ["separable", "ivp", "rational-form", "solve"]
      },
      {
        id: "de-core-legacy-q7",
        type: "free",
        prompt:
          "Solve `(2x+3) + (2y-2)y' = 0` by checking exactness first.",
        explanation:
          "Interpreting as `(2x+3)dx + (2y-2)dy = 0`, it is exact and integrates directly.",
        sampleAnswer: "`x^2 + 3x + y^2 - 2y = C`.",
        hintSteps: [
          "Rewrite as `M(x,y)dx + N(x,y)dy = 0`.",
          "Compute `M_y` and `N_x`.",
          "Integrate `M` with respect to `x` to get potential `F`.",
          "Match with `N` to finish `F(x,y)=C`."
        ],
        walkthroughSteps: [
          "Set `M=2x+3`, `N=2y-2`.",
          "Check exactness: `M_y=0` and `N_x=0`, so exact.",
          "Integrate `M` wrt `x`: `F=x^2+3x+g(y)`.",
          "Differentiate wrt `y`: `F_y=g'(y)=2y-2`.",
          "Integrate: `g(y)=y^2-2y`.",
          "Solution: `x^2+3x+y^2-2y=C`."
        ],
        references: ["hwk_diff2.pdf Problem 1"],
        tags: ["exact-equation", "potential-function", "first-order", "solve"]
      },
      {
        id: "de-core-legacy-q8",
        type: "free",
        prompt:
          "Solve `(3x^2-2xy+2) + (6y^2-x^2+3)y' = 0` by exact-equation method.",
        explanation:
          "The equation is exact because `M_y=N_x=-2x`; integrate to potential `F` and set `F=C`.",
        sampleAnswer: "`x^3 - x^2y + 2x + 2y^3 + 3y = C`.",
        hintSteps: [
          "Identify `M(x,y)` and `N(x,y)`.",
          "Check exactness with partial derivatives.",
          "Integrate `M` wrt `x` and include `g(y)`.",
          "Use `F_y=N` to determine `g(y)`."
        ],
        walkthroughSteps: [
          "Write `M=3x^2-2xy+2`, `N=6y^2-x^2+3`.",
          "Check: `M_y=-2x`, `N_x=-2x` -> exact.",
          "Integrate `M` wrt `x`: `F=x^3-x^2y+2x+g(y)`.",
          "Compute `F_y=-x^2+g'(y)` and set equal to `N`.",
          "So `g'(y)=6y^2+3`, hence `g(y)=2y^3+3y`.",
          "Final implicit solution: `x^3 - x^2y + 2x + 2y^3 + 3y = C`."
        ],
        references: ["hwk_diff2.pdf Problem 3"],
        tags: ["exact-equation", "partial-derivatives", "implicit-solution", "solve"]
      }
    ]
  },
  {
    id: "de-reinforce-legacy",
    courseId: "differential-equations",
    title: "Differential Equations Test Review II (Hard Solving)",
    description:
      "Second-order and IVP heavy solving set from hwk_diff3, hwk_diff4, and review1_1 with full worked steps.",
    difficulty: "Advanced",
    estMinutes: 44,
    tags: ["test-review", "free-response", "second-order", "hard-solving"],
    timerDefaultMinutes: 40,
    questions: [
      {
        id: "de-reinforce-legacy-q1",
        type: "free",
        prompt: "Find the general solution of `y'' + 2y' - 3y = 0`.",
        explanation:
          "Solve the characteristic equation and combine independent exponential modes.",
        sampleAnswer: "`y(x) = C1 e^x + C2 e^{-3x}`.",
        hintSteps: [
          "Set up the characteristic polynomial.",
          "Factor it.",
          "Use one exponential term per distinct real root.",
          "Combine with constants."
        ],
        walkthroughSteps: [
          "Characteristic equation: `r^2 + 2r - 3 = 0`.",
          "Factor: `(r-1)(r+3)=0`.",
          "Roots are `r=1` and `r=-3`.",
          "General solution: `y = C1 e^x + C2 e^{-3x}`."
        ],
        references: ["hwk_diff3.pdf Problem 1"],
        tags: ["second-order", "homogeneous", "characteristic-roots", "solve"]
      },
      {
        id: "de-reinforce-legacy-q2",
        type: "free",
        prompt: "Find the general solution of `y'' - 2y' + 2y = 0`.",
        explanation:
          "Complex roots produce an exponential envelope times sine/cosine basis.",
        sampleAnswer: "`y(x)=e^x(C1 cos x + C2 sin x)`.",
        hintSteps: [
          "Build characteristic equation.",
          "Compute discriminant to detect complex roots.",
          "Write roots as `a +- bi`.",
          "Use real-form solution template."
        ],
        walkthroughSteps: [
          "Characteristic equation: `r^2 - 2r + 2 = 0`.",
          "Roots: `r = (2 +- sqrt(4-8))/2 = 1 +- i`.",
          "So `a=1`, `b=1`.",
          "General solution: `y=e^x(C1 cos x + C2 sin x)`."
        ],
        references: ["hwk_diff3.pdf Problem 1"],
        tags: ["second-order", "complex-roots", "homogeneous", "solve"]
      },
      {
        id: "de-reinforce-legacy-q3",
        type: "free",
        prompt: "Solve the IVP `y'' + 4y = 0`, `y(0)=0`, `y'(0)=1`.",
        explanation:
          "Use trigonometric homogeneous basis and solve constants from initial conditions.",
        sampleAnswer: "`y(x) = (1/2) sin(2x)`.",
        hintSteps: [
          "Solve the homogeneous equation first.",
          "Use `y(0)=0` to get one constant.",
          "Differentiate and use `y'(0)=1` for the other.",
          "Simplify."
        ],
        walkthroughSteps: [
          "Characteristic equation: `r^2+4=0` -> `r=+-2i`.",
          "General solution: `y=C1 cos(2x)+C2 sin(2x)`.",
          "From `y(0)=0`: `C1=0`.",
          "Then `y' = 2C2 cos(2x)` and `y'(0)=2C2=1` -> `C2=1/2`.",
          "Final: `y=(1/2)sin(2x)`."
        ],
        references: ["hwk_diff3.pdf Problem 2"],
        tags: ["ivp", "second-order", "trig-solution", "solve"]
      },
      {
        id: "de-reinforce-legacy-q4",
        type: "free",
        prompt: "Solve the IVP `3y'' - y' + 2y = 0`, `y(0)=2`, `y'(0)=0`.",
        explanation:
          "Use complex-root form, then solve constants with the two initial conditions.",
        sampleAnswer:
          "`y(x)=e^{x/6}\\left(2\\cos(\\sqrt{23}x/6) - (2/\\sqrt{23})\\sin(\\sqrt{23}x/6)\\right)`.",
        hintSteps: [
          "Write characteristic equation `3r^2-r+2=0`.",
          "Find `a` and `b` from roots.",
          "Use real-form `e^{ax}(C1 cos bx + C2 sin bx)`.",
          "Apply both initial conditions carefully."
        ],
        walkthroughSteps: [
          "Characteristic equation: `3r^2-r+2=0`.",
          "Roots: `r = (1 +- i\\sqrt{23})/6`.",
          "General solution: `y=e^{x/6}(C1 cos(\\sqrt{23}x/6)+C2 sin(\\sqrt{23}x/6))`.",
          "From `y(0)=2`, get `C1=2`.",
          "Differentiate and evaluate at `x=0`: `0 = C1/6 + (\\sqrt{23}/6)C2`.",
          "So `C2 = -2/\\sqrt{23}`."
        ],
        references: ["hwk_diff3.pdf Problem 2"],
        tags: ["ivp", "complex-roots", "second-order", "solve"]
      },
      {
        id: "de-reinforce-legacy-q5",
        type: "free",
        prompt: "Find the general solution of `16y'' + 24y' + 9y = 0`.",
        explanation:
          "The characteristic polynomial has a repeated root, so include the `t e^{rt}` term.",
        sampleAnswer: "`y(t) = (C1 + C2 t)e^{-3t/4}`.",
        hintSteps: [
          "Compute characteristic equation.",
          "Check if it is a perfect square.",
          "Use repeated-root solution form.",
          "Write final homogeneous solution."
        ],
        walkthroughSteps: [
          "Characteristic equation: `16r^2 + 24r + 9 = 0`.",
          "Factor: `(4r+3)^2=0`.",
          "Repeated root: `r=-3/4`.",
          "General solution: `y=(C1+C2 t)e^{-3t/4}`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["repeated-root", "second-order", "homogeneous", "solve"]
      },
      {
        id: "de-reinforce-legacy-q6",
        type: "free",
        prompt: "Find the general solution of `y'' - 2y' - 3y = 3e^{2t}`.",
        explanation:
          "Solve homogeneous part first, then use undetermined coefficients for the forcing `3e^{2t}`.",
        sampleAnswer: "`y(t)=C1 e^{3t} + C2 e^{-t} - e^{2t}`.",
        hintSteps: [
          "Solve `y''-2y'-3y=0` for `y_h`.",
          "Try `y_p = A e^{2t}` for the RHS.",
          "Substitute and solve for `A`.",
          "Combine `y_h + y_p`."
        ],
        walkthroughSteps: [
          "Homogeneous characteristic: `r^2-2r-3=0` -> roots `3,-1`.",
          "So `y_h = C1 e^{3t} + C2 e^{-t}`.",
          "Try `y_p = A e^{2t}`.",
          "Then `y_p' = 2Ae^{2t}`, `y_p''=4Ae^{2t}`.",
          "Substitute: `4A - 4A - 3A = 3` -> `A=-1`.",
          "Therefore `y = C1 e^{3t} + C2 e^{-t} - e^{2t}`."
        ],
        references: ["hwk_diff4.pdf Problem 1"],
        tags: ["nonhomogeneous", "undetermined-coefficients", "second-order", "solve"]
      },
      {
        id: "de-reinforce-legacy-q7",
        type: "free",
        prompt: "Solve the IVP `y'' + y' - 2y = 2t`, `y(0)=0`, `y'(0)=1`.",
        explanation:
          "Use homogeneous + polynomial particular, then enforce initial conditions.",
        sampleAnswer: "`y(t)=e^t - (1/2)e^{-2t} - t - 1/2`.",
        hintSteps: [
          "Solve homogeneous equation first.",
          "Use trial `y_p = at + b` for RHS `2t`.",
          "Find `a,b` by substitution.",
          "Use both initial conditions to solve constants."
        ],
        walkthroughSteps: [
          "Homogeneous characteristic: `r^2+r-2=0` -> roots `1,-2`.",
          "So `y_h = C1 e^t + C2 e^{-2t}`.",
          "Try `y_p=at+b`: then `y_p'=a`, `y_p''=0`.",
          "Substitute: `a - 2(at+b) = 2t` -> `a=-1`, `b=-1/2`.",
          "General solution: `y=C1e^t + C2e^{-2t} - t - 1/2`.",
          "From `y(0)=0`: `C1 + C2 = 1/2`.",
          "From `y'(0)=1`: `C1 - 2C2 - 1 = 1` -> `C1 - 2C2 = 2`.",
          "Solve: `C1=1`, `C2=-1/2`."
        ],
        references: ["hwk_diff4.pdf Problem 2"],
        tags: ["ivp", "nonhomogeneous", "undetermined-coefficients", "solve"]
      },
      {
        id: "de-reinforce-legacy-q8",
        type: "free",
        prompt:
          "Solve the IVP `dy/dx = xy^2 - 9x - 2y^2 + 18`, `y(0)=-5`.",
        explanation:
          "Factor RHS as `(x-2)(y^2-9)`, separate variables, integrate with partial fractions, and apply the initial condition.",
        sampleAnswer:
          "`(y-3)/(y+3) = 4e^{3x^2-12x}` (equivalently `y=3(1+r)/(1-r)`, `r=4e^{3x^2-12x}`).",
        hintSteps: [
          "Factor the RHS completely before separating.",
          "Use `1/(y^2-9)` partial fractions.",
          "Integrate both sides and combine constants.",
          "Use `y(0)=-5` to determine the multiplicative constant."
        ],
        walkthroughSteps: [
          "Factor RHS: `xy^2 - 9x - 2y^2 + 18 = (x-2)(y^2-9)`.",
          "Separate: `dy/(y^2-9) = (x-2)dx`.",
          "Partial fractions: `1/(y^2-9) = (1/6)(1/(y-3) - 1/(y+3))`.",
          "Integrate: `(1/6)ln|(y-3)/(y+3)| = x^2/2 - 2x + C`.",
          "Multiply by 6: `ln|(y-3)/(y+3)| = 3x^2 - 12x + C1`.",
          "Apply `y(0)=-5`: `ln 4 = C1`, so `(y-3)/(y+3)=4e^{3x^2-12x}`."
        ],
        references: ["review1_1.pdf Problem 2"],
        tags: ["separable", "partial-fractions", "ivp", "hard-solving"]
      }
    ]
  }
];
