// United Exams - Computer Architecture Notes (TrainingData aligned)
window.COMPARCH_NOTES = `
<h2>Computer Architecture Exam Notes (CS 3375)</h2>
<p>These notes mirror your <strong>Midterm Spring 2025</strong>, Topic 1/2 slides, RISC-V handout, and assembly drills.</p>

<div class="callout"><strong>Exam focus pattern:</strong> code translation, machine-code encoding/decoding, hazard analysis on a 5-stage pipeline, and branch prediction behavior.</div>

<h3>Topic 1 Fundamentals</h3>
<ul>
  <li>Performance metrics: <strong>response time</strong> vs <strong>throughput</strong>.</li>
  <li>Speedup = execution time old / execution time new.</li>
  <li>Processor equation: <code>CPU time = IC x CPI x cycle time</code>.</li>
  <li>Architecture design balances performance with cost, power, and availability.</li>
</ul>

<h3>RISC-V Essentials</h3>
<ul>
  <li>32 integer registers; <code>x0 = 0</code> always.</li>
  <li>Common formats: R, I, S, B, U, J.</li>
  <li>Load/store use base+offset addressing.</li>
  <li>Calling convention quick anchors: args in <code>a0-a7</code>, return in <code>a0</code>, return address in <code>ra</code>.</li>
</ul>

<h3>Assembly and Machine Code</h3>
<ul>
  <li>Array indexing: for int arrays, byte offset = index x 4.</li>
  <li><code>A[2*i]</code> offset is <code>8*i</code> (shift left by 3).</li>
  <li>Sign-immediate sanity: <code>addi</code> uses 12-bit signed immediate.</li>
  <li>Practice both directions: assembly -> hex and hex -> assembly.</li>
</ul>

<h3>5-Stage Pipeline (IF, ID, EX, MEM, WB)</h3>
<ul>
  <li><strong>RAW hazards</strong>: consumer reads before producer writeback.</li>
  <li>Forwarding removes many ALU-to-ALU stalls.</li>
  <li>Load-use usually still needs at least one bubble.</li>
  <li>Control hazards come from branch outcome/target uncertainty.</li>
</ul>

<h3>Branch Prediction</h3>
<ul>
  <li>Predicted-not-taken is simple baseline.</li>
  <li>2-bit predictor uses Strong/Weak Taken and Strong/Weak Not-Taken states.</li>
  <li>Hysteresis lowers mispredictions for strongly biased branches.</li>
</ul>

<h3>What to Drill Before Quiz</h3>
<ul>
  <li>Translate <code>if/else</code> and <code>for</code> loops into clean RISC-V.</li>
  <li>Decode one R-type and one I-type instruction from hex by hand.</li>
  <li>Draw a 5-stage timing chart and mark RAW/control hazards + stalls/forwarding.</li>
</ul>
`;
