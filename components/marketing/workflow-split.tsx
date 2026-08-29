/**
 * Workflow split — two columns ("For students" / "For professors")
 * sharing one bordered grid. Each side has a labeled tag, an italic
 * serif column title, and a numbered, hairline-divided list of steps.
 *
 * Replaces the previous twin-card approach (badge + tone gradient +
 * step list with rounded cards inside each) with the editorial
 * Claude Design layout: a single grid with a vertical divider,
 * mono numerals, no inner card chrome.
 */
const studentSteps = [
  {
    t: "Open your class",
    d: "Find it in the index. Everything for that class sits in one place — practice quizzes, walkthroughs, mock exams and notes."
  },
  {
    t: "Pick a study mode",
    d: "Quiz before lecture, study after, timed before midterms, exam two days out. Same questions, different stakes."
  },
  {
    t: "Watch your mastery climb",
    d: "Per-topic mastery bars surface what you've actually consolidated, not just what you've clicked through."
  },
  {
    t: "Sit the exam knowing",
    d: "By the time it counts, the questions feel familiar — because they are."
  }
];

const profSteps = [
  {
    t: "Claim a course shell",
    d: "We set the class up publicly. You take it over for your section, with the institution badge."
  },
  {
    t: "Curate or author",
    d: "Pick from the bank, edit existing items, or upload your own. Solutions render with KaTeX, code samples, diagrams."
  },
  {
    t: "Open it to your roster",
    d: "Section-scoped assignments and exam settings. Students see the right paper at the right time, no LMS dance."
  },
  {
    t: "Read the room",
    d: "Per-question difficulty, per-student mastery — the analytics you'd hand-build in a spreadsheet, already there."
  }
];

export function WorkflowSplit() {
  return (
    <section className="ed-section">
      <div className="ed-section-head">
        <h2>
          Two sides of the <em>same desk</em>.
        </h2>
        <p className="section-meta">For students · For professors</p>
      </div>

      <div className="workflow-grid">
        <div className="workflow-col">
          <p className="wf-label">For students</p>
          <h3 className="wf-col-title">A study tool that knows the syllabus.</h3>
          {studentSteps.map((step, i) => (
            <div className="wf-step" key={step.t}>
              <span className="wf-step-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="wf-step-title">{step.t}</p>
                <p className="wf-step-desc">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="workflow-col">
          <p className="wf-label">For professors</p>
          <h3 className="wf-col-title">A workspace built for sections.</h3>
          {profSteps.map((step, i) => (
            <div className="wf-step" key={step.t}>
              <span className="wf-step-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="wf-step-title">{step.t}</p>
                <p className="wf-step-desc">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
