// United Exams - Differential Equations Notes
window.DIFFEQ_NOTES = `
<h2>Differential Equations Quick Reference</h2>
<p>Prioritize method selection first, then execution. Most errors happen from choosing the wrong method.</p>

<div class="callout"><strong>Workflow:</strong> classify equation type -> pick method -> solve general form -> apply initial condition -> sanity-check behavior.</div>

<h3>First-Order ODEs</h3>
<ul>
  <li><strong>Separable</strong>: rewrite as g(y)dy = f(x)dx, then integrate.</li>
  <li><strong>Linear</strong>: y' + P(x)y = Q(x), integrating factor mu(x)=exp(integral P(x)dx).</li>
  <li><strong>Logistic</strong>: y' = ry(1-y/K), equilibria at y=0 and y=K.</li>
</ul>

<h3>Second-Order Linear ODEs</h3>
<ul>
  <li>Characteristic equation gives homogeneous solution shape.</li>
  <li>Distinct real roots: c1e^{r1x}+c2e^{r2x}.</li>
  <li>Repeated root r: (c1+c2x)e^{rx}.</li>
  <li>Complex roots a +- bi: e^{ax}(c1 cos bx + c2 sin bx).</li>
</ul>

<h3>Nonhomogeneous Strategy</h3>
<ul>
  <li>Find y_h first.</li>
  <li>Find y_p using undetermined coefficients (or variation of parameters).</li>
  <li>If trial overlaps y_h, multiply by x until independent.</li>
</ul>

<h3>Laplace Transform</h3>
<ul>
  <li>L{y'} = sY(s)-y(0).</li>
  <li>L{y''} = s^2Y(s)-s y(0)-y'(0).</li>
  <li>Use partial fractions for inverse transforms of rational Y(s).</li>
  <li>Great for piecewise forcing and initial-value problems.</li>
</ul>

<h3>Systems and Stability</h3>
<ul>
  <li>For x' = Ax, eigenvalues control growth/decay/oscillation.</li>
  <li>All eigenvalues with negative real parts -> asymptotically stable origin.</li>
  <li>One positive and one negative real eigenvalue -> saddle (unstable).</li>
</ul>
`;
