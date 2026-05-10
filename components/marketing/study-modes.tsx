/**
 * Study modes — four editorial tiles, each with a single coloured
 * top bar so they're distinguishable without flooding the surface.
 * Mono "Mode 0X" label, italic-serif title, calm description, mono
 * meta strip at the bottom.
 *
 * Pulled away from the previous icon-tile look (which read as
 * "SaaS feature grid") in favour of the Claude Design publication
 * style — the four modes feel like four chapters in a method.
 */
const modes = [
  {
    n: "01",
    title: "Quiz",
    desc: "Short timed sets pulled from the course's question bank. Quickly find what you don't know yet.",
    meta: ["10–15 min", "Adaptive"],
    color: "hsl(38 92% 50%)"
  },
  {
    n: "02",
    title: "Study",
    desc: "Untimed, walkthroughs visible after each answer. The mode you use the night before, calmly.",
    meta: ["Untimed", "Solutions on"],
    color: "hsl(170 60% 48%)"
  },
  {
    n: "03",
    title: "Timed",
    desc: "A single sitting with a clock. Same set, exam-style timer, no skipping back.",
    meta: ["45 min", "No backtrack"],
    color: "hsl(220 60% 60%)"
  },
  {
    n: "04",
    title: "Exam",
    desc: "A full mock built from past finals — the closest thing to sitting the real paper.",
    meta: ["120 min", "Proctor mode"],
    color: "hsl(8 70% 58%)"
  }
];

export function StudyModesSection() {
  return (
    <section className="ed-section" id="modes">
      <div className="ed-section-head">
        <h2>
          Four ways to <em>practice</em>.
        </h2>
        <p className="section-meta">Same questions · different posture</p>
      </div>
      <div className="modes-grid-ed">
        {modes.map((mode) => (
          <article
            key={mode.n}
            className="mode-ed"
            style={{ ["--mode-color" as string]: mode.color }}
          >
            <p className="mode-num">Mode {mode.n}</p>
            <h3 className="mode-title-ed">{mode.title}</h3>
            <p className="mode-desc-ed">{mode.desc}</p>
            <div className="mode-meta">
              {mode.meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
