// United Exams - Theory of Automata Notes (TrainingData aligned)
window.AUTOMATA_NOTES = `
<h2>Theory of Automata Notes (CS 3383)</h2>
<p>Built from your <strong>HW1</strong>, <strong>HW2</strong>, <strong>Test 1</strong>, and lecture notes outline.</p>

<div class="callout"><strong>Exam pattern:</strong> set/relation proofs + regular-language constructions + nonregular proofs. Most mistakes come from using the wrong model/tool.</div>

<h3>Sets and Relations (HW1 heavy)</h3>
<ul>
  <li>Core identity: <code>A - (B intersection C) = (A - B) union (A - C)</code>.</li>
  <li>Relation operations: inverse, composition, reflexive transitive closure <code>R*</code>.</li>
  <li>Graph criteria: a relation is a function iff each domain node has exactly one outgoing edge.</li>
  <li>Property checks: reflexive/symmetric/transitive vs antisymmetric; partial vs total orders.</li>
</ul>

<h3>Regular Languages and Regex</h3>
<ul>
  <li>Regex operations: union, concatenation, Kleene star.</li>
  <li>From your work: no-more-than-3-a's and a-count-divisible-by-3 constructions.</li>
  <li>Test identity: <code>(b* a*) intersection (a* b*) = a* union b*</code>.</li>
  <li>Lecture example: language with 2 or 3 ones (first two nonconsecutive) starts with <code>0*10*010*</code> pattern.</li>
</ul>

<h3>DFA/NFA Construction (HW2)</h3>
<ul>
  <li>DFA construction tasks: pattern constraints like "each a immediately preceded by b" and substring tracking like "contains abab".</li>
  <li>NFA and regex conversion tasks: build machine from expression and expression from machine.</li>
  <li>Know closure facts to simplify proof paths quickly.</li>
</ul>

<h3>Proving Non-Regular</h3>
<ul>
  <li>Pumping lemma is your main contradiction tool.</li>
  <li>Typical examples: <code>{a^n b^n}</code>, and homework-style hard languages.</li>
  <li>Quantifier order matters: choose witness after pumping length is fixed.</li>
</ul>

<h3>CFG / PDA / TM Ladder</h3>
<ul>
  <li>All regular languages are context-free, but not vice versa.</li>
  <li>PDA handles stack-structured dependencies (e.g., <code>{ww^R}</code> as a CFL example).</li>
  <li>TM level is needed for broader computability tasks (e.g., language families beyond CFL).</li>
</ul>

<h3>Fast Prep Checklist</h3>
<ul>
  <li>Do one relation-property proof, one regex design, one DFA table build, one pumping proof.</li>
  <li>When solving: first label the language class, then choose the proof/machine tool.</li>
</ul>
`;
