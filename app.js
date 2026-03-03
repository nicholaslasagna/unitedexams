// ═══════════════════════════════════════════════════════════
//  United Exams — Main Application
//  React + React Router (HashRouter) — compiled via Babel
// ═══════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { HashRouter, Routes, Route, Link, useParams, useNavigate, useLocation } = ReactRouterDOM;

/* ═══ Helpers ═══ */
function getCourse(id) { return (window.UE_COURSES || []).find(c => c.id === id); }
function getQuizSet(courseId, quizId) {
  const c = getCourse(courseId);
  return c ? c.quizSets.find(qs => qs.id === quizId) : null;
}
function courseIcon(icon) {
  const icons = {
    code: "\u{1F4BB}",
    function: "f(x)",
    cpu: "\u2699\uFE0F",
    automata: "\u03A3"
  };
  return icons[icon] || "\u{1F4DA}";
}
function estimateQuizCount(quizSet) {
  const bank = window[quizSet.questionBankKey] || [];
  const cfg = quizSet.config || {};
  const chapterSet = new Set(cfg.chapters || []);
  const professorCount = cfg.professorQuestions === false
    ? 0
    : bank.filter(item => item.fromProfessor).length;
  const freeCount = cfg.freeResponseIncluded === false
    ? 0
    : bank.filter(item => item.type === "free").length;
  const chapterPool = bank.filter(item => !item.fromProfessor && item.type !== "free" && chapterSet.has(item.chapter)).length;
  const randomCount = Math.min(cfg.maxQuestions || chapterPool, chapterPool);
  return professorCount + freeCount + randomCount;
}

/* ═══ Theme Manager ═══ */
function useTheme() {
  const [theme, setThemeState] = useState(() => UE.storage.getTheme());
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    UE.storage.setTheme(next);
    setThemeState(next);
  };
  return { theme, toggle };
}

/* ═══ Streak Hook ═══ */
function useStreak() {
  const [streak, setStreak] = useState(() => UE.storage.getStreak());
  const refresh = () => setStreak(UE.storage.getStreak());
  return { streak, refresh };
}

/* ═══ Layout (persistent nav) ═══ */
function Layout({ children, theme, onToggleTheme, streak }) {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "";
  const isDashboard = location.pathname === "/dashboard";
  const isCourse = location.pathname.startsWith("/course/");
  const isQuiz = location.pathname.startsWith("/quiz/");

  return (
    <div className="app">
      <nav className="top-nav">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <span className="nav-logo">UE</span>
            <span className="nav-title">United Exams</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isLanding ? "nav-link-active" : ""}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link ${isDashboard || isCourse || isQuiz ? "nav-link-active" : ""}`}>Study Dashboard</Link>
          </div>
        </div>
        <div className="nav-right">
          {streak.current > 0 && !isLanding && (
            <div className="streak-badge" title={`Best: ${streak.best} days`}>
              <span className="streak-flame">&#x1F525;</span>
              <span className="streak-num">{streak.current}</span>
            </div>
          )}
          {isLanding && (
            <Link to="/dashboard" className="nav-cta">Open Dashboard</Link>
          )}
          <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? "\u2600\uFE0F" : "\u{1F319}"}
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
function HomePage() {
  const courses = window.UE_COURSES || [];
  const progress = UE.storage.getAllProgress();
  const totalQuizSets = courses.reduce((acc, course) => acc + course.quizSets.length, 0);
  const totalQuestions = courses.reduce((acc, course) => {
    return acc + course.quizSets.reduce((sum, quizSet) => sum + estimateQuizCount(quizSet), 0);
  }, 0);
  const completedQuizSets = courses.reduce((acc, course) => {
    return acc + course.quizSets.filter(qs => progress[qs.id]).length;
  }, 0);
  const avgBest = (() => {
    const rows = Object.values(progress || {});
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((acc, row) => acc + (row.bestScore || 0), 0) / rows.length);
  })();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-tag">UnitedExams.com</div>
          <h1 className="hero-title">A Professional Study Platform for College Courses</h1>
          <p className="hero-sub">
            Practice realistic quiz sets, review targeted walkthroughs, track progress over time, and study across Software Engineering,
            Differential Equations, Computer Architecture, and Theory of Automata.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-accent">Start Studying</Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const el = document.getElementById("courses");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Explore Courses
            </button>
          </div>
          <div className="hero-chips">
            <span className="hero-chip">Progress Tracking</span>
            <span className="hero-chip">Walkthrough Explanations</span>
            <span className="hero-chip">Weak-Area Reinforcement</span>
            <span className="hero-chip">Student + Professor Friendly</span>
          </div>
        </div>
        <div className="hero-panel">
          <h3>Live Platform Snapshot</h3>
          <div className="hero-metric-grid">
            <div className="hero-metric">
              <span className="hero-metric-label">Courses</span>
              <span className="hero-metric-value">{courses.length}</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-label">Quiz Sets</span>
              <span className="hero-metric-value">{totalQuizSets}</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-label">Question Pool</span>
              <span className="hero-metric-value">{totalQuestions}+</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-label">Your Completion</span>
              <span className="hero-metric-value">{completedQuizSets}/{totalQuizSets}</span>
            </div>
          </div>
          <div className="hero-inline-note">
            {completedQuizSets > 0
              ? `Current average best score: ${avgBest}%`
              : "No attempts yet — your dashboard will fill with scores and activity after your first quiz."
            }
          </div>
        </div>
      </section>

      <section className="audience-grid">
        <div className="aud-card">
          <h3>For Students</h3>
          <p>Train with exam-style questions, timer pressure, adaptive reinforcement, and saved best scores per quiz set.</p>
        </div>
        <div className="aud-card">
          <h3>For Professors and TAs</h3>
          <p>Use topic-tagged sets, consistent terminology, and structured walkthroughs to support tutorials and review sessions.</p>
        </div>
      </section>

      <section className="how-grid">
        <div className="how-step">
          <span className="how-num">1</span>
          <h4>Pick a Course</h4>
          <p>Start in the study dashboard and choose your class track.</p>
        </div>
        <div className="how-step">
          <span className="how-num">2</span>
          <h4>Take a Quiz Set</h4>
          <p>Answer randomized questions with real exam pacing and mixed question types.</p>
        </div>
        <div className="how-step">
          <span className="how-num">3</span>
          <h4>Close Weak Areas</h4>
          <p>Review explanations and launch reinforcement rounds focused on missed topics.</p>
        </div>
      </section>

      <section id="courses" className="landing-courses">
        <h2 className="landing-title">Course Tracks</h2>
        <div className="landing-course-grid">
          {courses.map(course => (
            <Link to={`/course/${course.id}`} key={course.id} className="landing-course-card" style={{ "--card-accent": course.color }}>
              <div className="landing-course-head">
                <span className="course-icon">{courseIcon(course.icon)}</span>
                <span className="landing-course-code">{course.code}</span>
              </div>
              <h3>{course.name}</h3>
              <p>{course.description}</p>
              <div className="landing-course-foot">{course.quizSets.length} quiz sets</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════ */
function DashboardPage({ streak }) {
  const [query, setQuery] = useState("");
  const progress = UE.storage.getAllProgress();
  const courses = window.UE_COURSES || [];

  // Collect all progress rows for dashboard widgets.
  const activity = [];
  courses.forEach(c => {
    c.quizSets.forEach(qs => {
      const p = progress[qs.id];
      if (p) {
        activity.push({
          courseName: c.name,
          courseColor: c.color,
          quizName: qs.name,
          score: p.bestScore,
          date: p.lastAttempt,
          attempts: p.attempts || 0,
          quizId: qs.id
        });
      }
    });
  });
  const recent = activity.filter(a => a.date);
  recent.sort((a, b) => new Date(b.date) - new Date(a.date));

  const leaderboard = activity
    .slice()
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.attempts !== b.attempts) return a.attempts - b.attempts;
      return new Date(b.date || 0) - new Date(a.date || 0);
    })
    .slice(0, 8);

  const totalQuizSets = courses.reduce((acc, c) => acc + c.quizSets.length, 0);
  const completedQuizSets = activity.length;
  const totalAttempts = activity.reduce((acc, r) => acc + r.attempts, 0);
  const averageBest = completedQuizSets > 0
    ? Math.round(activity.reduce((acc, r) => acc + r.score, 0) / completedQuizSets)
    : 0;
  const filteredCourses = courses.filter(course => {
    const target = `${course.name} ${course.code} ${course.description}`.toLowerCase();
    return target.includes(query.trim().toLowerCase());
  });
  const continueRow = recent[0] || null;
  const continueCourse = continueRow
    ? courses.find(c => c.name === continueRow.courseName)
    : null;
  const continueQuizSet = continueCourse
    ? continueCourse.quizSets.find(qs => qs.name === continueRow.quizName)
    : null;

  return (
    <div className="dashboard">
      <div className="dash-hero">
        <h1 className="dash-title">Study Dashboard</h1>
        <p className="dash-sub">Pick a course, launch a quiz set, and keep your score trend moving up.</p>
      </div>

      {/* Streak Banner */}
      <div className="streak-panel">
        <div className="streak-info">
          <div className="streak-big">
            <span className="streak-flame-lg">&#x1F525;</span>
            <span className="streak-count">{streak.current}</span>
            <span className="streak-label">day streak</span>
          </div>
          <div className="streak-best">Best: {streak.best} days</div>
        </div>
        <div className="streak-dots">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const ds = d.toISOString().slice(0, 10);
            const active = streak.lastDate && new Date(streak.lastDate) >= new Date(ds) &&
              (new Date(streak.lastDate) - new Date(ds)) / 86400000 < streak.current;
            const isToday = ds === new Date().toISOString().slice(0, 10);
            return (
              <div key={i} className={`streak-dot ${active ? "streak-dot-active" : ""} ${isToday ? "streak-dot-today" : ""}`}>
                <span className="streak-day-label">{["S","M","T","W","T","F","S"][d.getDay()]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-label">Quiz Sets</div>
          <div className="stat-value">{completedQuizSets}/{totalQuizSets}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Best</div>
          <div className="stat-value">{averageBest}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attempts</div>
          <div className="stat-value">{totalAttempts}</div>
        </div>
      </div>

      {continueCourse && continueQuizSet && (
        <Link className="continue-card" to={`/quiz/${continueCourse.id}/${continueQuizSet.id}`}>
          <div>
            <div className="continue-label">Continue Studying</div>
            <div className="continue-title">{continueRow.courseName} — {continueRow.quizName}</div>
            <div className="continue-sub">Last best: {continueRow.score}% • Attempts: {continueRow.attempts}</div>
          </div>
          <div className="continue-arrow">&rarr;</div>
        </Link>
      )}

      <div className="dash-search-wrap">
        <input
          className="dash-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses (e.g., architecture, automata, MATH)..."
          aria-label="Search courses"
        />
      </div>

      {/* Course Cards */}
      <div className="course-grid">
        {filteredCourses.map(c => {
          const totalQuizzes = c.quizSets.length;
          const completed = c.quizSets.filter(qs => progress[qs.id]).length;
          const bestOverall = c.quizSets.reduce((best, qs) => {
            const p = progress[qs.id];
            return p && p.bestScore > best ? p.bestScore : best;
          }, 0);
          return (
            <Link to={`/course/${c.id}`} key={c.id} className="course-card" style={{ "--card-accent": c.color }}>
              <div className="course-icon">{courseIcon(c.icon)}</div>
              <div className="course-info">
                <div className="course-code">{c.code}</div>
                <h2 className="course-name">{c.name}</h2>
                <p className="course-desc">{c.description}</p>
                <div className="course-meta">
                  <span className="course-quizzes">{totalQuizzes} quiz set{totalQuizzes !== 1 ? "s" : ""}</span>
                  {bestOverall > 0 && <span className="course-best" style={{ color: c.color }}>Best: {bestOverall}%</span>}
                </div>
              </div>
              {completed > 0 && (
                <div className="course-progress-ring" style={{ "--ring-color": c.color }}>
                  <span>{completed}/{totalQuizzes}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
      {filteredCourses.length === 0 && (
        <div className="empty-state" style={{ paddingTop: 8 }}>
          <p>No courses matched "{query}". Try a broader keyword.</p>
        </div>
      )}

      {/* Recent Activity */}
      {recent.length > 0 && (
        <div className="recent-panel">
          <h3 className="section-title">Recent Activity</h3>
          <div className="recent-list">
            {recent.slice(0, 5).map((r, i) => (
              <div key={i} className="recent-item">
                <div className="recent-dot" style={{ background: r.courseColor }} />
                <div className="recent-text">
                  <span className="recent-course">{r.courseName}</span>
                  <span className="recent-quiz">{r.quizName}</span>
                </div>
                <div className="recent-score" style={{ color: r.score >= 70 ? "var(--green)" : r.score >= 50 ? "var(--amber)" : "var(--red)" }}>
                  {r.score}%
                </div>
                <div className="recent-date">{new Date(r.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="leaderboard-panel">
          <h3 className="section-title">Leaderboard</h3>
          <div className="leaderboard-list">
            {leaderboard.map((entry, i) => (
              <div key={`${entry.quizId}-${i}`} className="leaderboard-item">
                <div className="leaderboard-rank">#{i + 1}</div>
                <div className="recent-dot" style={{ background: entry.courseColor }} />
                <div className="recent-text">
                  <span className="recent-course">{entry.courseName}</span>
                  <span className="recent-quiz">{entry.quizName}</span>
                </div>
                <div className="recent-score" style={{ color: entry.score >= 70 ? "var(--green)" : entry.score >= 50 ? "var(--amber)" : "var(--red)" }}>
                  {entry.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">&#x1F680;</div>
          <h3>Ready to start studying?</h3>
          <p>Pick a course above and take your first quiz!</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COURSE PAGE
   ═══════════════════════════════════════════════════════════ */
function CoursePage() {
  const { courseId } = useParams();
  const course = getCourse(courseId);
  const progress = UE.storage.getAllProgress();
  const [notesOpen, setNotesOpen] = useState(false);

  if (!course) return (
    <div className="not-found">
      <h2>Course not found</h2>
      <Link to="/dashboard" className="btn btn-accent">Back to Dashboard</Link>
    </div>
  );

  const notesHtml = window[course.notesKey] || null;

  return (
    <div className="course-page" style={{ "--course-color": course.color }}>
      <div className="course-header">
        <Link to="/dashboard" className="back-link">&larr; All Courses</Link>
        <div className="course-hero-icon">{courseIcon(course.icon)}</div>
        <div className="course-code-lg">{course.code}</div>
        <h1 className="course-title">{course.name}</h1>
        <p className="course-description">{course.description}</p>
      </div>

      <div className="quiz-set-list">
        <h3 className="section-title">Quiz Sets</h3>
        {course.quizSets.map(qs => {
          const p = progress[qs.id];
          return (
            <Link to={`/quiz/${course.id}/${qs.id}`} key={qs.id} className="quiz-set-card">
              <div className="qs-info">
                <h4 className="qs-name">{qs.name}</h4>
                <span className="qs-sub">{qs.subtitle}</span>
              </div>
              <div className="qs-stats">
                {p ? (
                  <>
                    <div className="qs-best" style={{ color: p.bestScore >= 70 ? "var(--green)" : p.bestScore >= 50 ? "var(--amber)" : "var(--red)" }}>
                      {p.bestScore}%
                    </div>
                    <div className="qs-attempts">{p.attempts} attempt{p.attempts !== 1 ? "s" : ""}</div>
                  </>
                ) : (
                  <div className="qs-new">Not attempted</div>
                )}
              </div>
              <div className="qs-arrow">&rarr;</div>
            </Link>
          );
        })}
      </div>

      {/* Study Notes */}
      {notesHtml && (
        <div className="notes-section">
          <button className="notes-toggle" onClick={() => setNotesOpen(!notesOpen)}>
            <h3 className="section-title" style={{ margin: 0 }}>
              {notesOpen ? "\u25BE" : "\u25B8"} Study Notes & Cheat Sheet
            </h3>
          </button>
          {notesOpen && (
            <div className="notes-content" dangerouslySetInnerHTML={{ __html: notesHtml }} />
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUESTION VIEW (shared component)
   ═══════════════════════════════════════════════════════════ */
function QuestionView({ q, answers, onSelect, showResults, isCorrect, showExp, onToggleExp, hintState, onRevealHint, onUpdateHintConfirm, onConfirmHint, checkHintMatch, getHintAnswer }) {
  const typeLabel = { single: "Multiple Choice", multi: "Select All", fill: "Fill in the Blank", free: "Free Response" };
  const hint = hintState || {};
  const hintRevealed = hint.revealed && !hint.confirmed && !showResults;
  const hintConfirmed = hint.confirmed;

  return (
    <div className="q-wrap">
      <h2 className="q-text">{q.question}</h2>
      {q.type === "multi" && <div className="q-hint">Select all that apply</div>}
      {q.type === "fill" && !showResults && !hintRevealed && <div className="q-hint">Type your answer below</div>}

      {q.type === "fill" && (
        <div className="fill-wrap">
          <input
            type="text"
            className={`fill-input ${showResults ? (isCorrect ? "fill-ok" : "fill-bad") : ""} ${hintRevealed ? "hint-locked" : ""} ${hintConfirmed ? "fill-ok" : ""}`}
            value={answers[q.id] || ""} onChange={e => onSelect(q.id, e.target.value)}
            placeholder="Type your answer..." disabled={showResults || hintRevealed || hintConfirmed} autoComplete="off"
          />
          {showResults && (
            <div className={`fill-answer ${isCorrect ? "fill-ok-box" : "fill-bad-box"}`}>
              {isCorrect ? "\u2713 Correct!" : `\u2717 Correct answer: ${q.answer.join(", ")}`}
            </div>
          )}
        </div>
      )}

      {q.type === "free" && (
        <div>
          <textarea className="free-ta" value={answers[q.id] || ""} onChange={e => onSelect(q.id, e.target.value)} placeholder="Type your answer here..." disabled={showResults} />
          {showResults && <div className="exp-box" style={{ marginTop: 16 }}><div className="exp-lbl">Sample Answer</div>{q.explanation}</div>}
        </div>
      )}

      {(q.type === "single" || q.type === "multi") && (
        <div className={`opts ${hintRevealed ? "hint-locked" : ""}`}>
          {q.options.map((opt, idx) => {
            const selected = (answers[q.id] || []).includes(idx);
            const isRight = q.answer.includes(idx);
            let cls = "opt";
            if (showResults && selected && isRight) cls += " ok";
            else if (showResults && selected && !isRight) cls += " bad";
            else if (showResults && !selected && isRight) cls += " miss";
            else if (hintConfirmed && isRight) cls += " ok";
            else if (selected) cls += " sel";
            return (
              <button key={idx} className={cls} onClick={() => onSelect(q.id, idx)} disabled={showResults || hintRevealed || hintConfirmed}>
                <div className={`ind ${q.type === "multi" ? "ind-c" : "ind-r"} ${selected || (hintConfirmed && isRight) ? "on" : ""}`}>
                  {(selected || (hintConfirmed && isRight)) && <span className="chk">{"\u2713"}</span>}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {showResults && q.type !== "free" && (
        <div>
          <button className="exp-toggle" onClick={() => onToggleExp(q.id)}>
            {showExp[q.id] ? "\u25BE Hide" : "\u25B8 Show"} Explanation
          </button>
          {showExp[q.id] && <div className="exp-box"><div className="exp-lbl">Explanation</div>{q.explanation}</div>}
        </div>
      )}

      {/* Hint System (reinforcement mode) */}
      {onRevealHint && !showResults && !hintConfirmed && q.type !== "free" && (
        <div className="hint-panel">
          {!hint.revealed ? (
            <button className="hint-btn" onClick={() => onRevealHint(q.id)}>
              &#x1F4A1; Get Hint
            </button>
          ) : (
            <div className="hint-revealed">
              <div className="hint-answer-label">&#x1F4A1; Correct Answer</div>
              <div className="hint-answer-text">{getHintAnswer(q)}</div>
              <div className="hint-confirm-label">Type the answer below to continue:</div>
              <input
                type="text"
                className={`hint-confirm-input ${checkHintMatch(q.id) ? "hint-match" : ""}`}
                value={hint.confirmText || ""}
                onChange={e => onUpdateHintConfirm(q.id, e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && checkHintMatch(q.id)) onConfirmHint(q.id); }}
                placeholder="Type the answer to confirm you've read it..."
                autoComplete="off"
              />
              {checkHintMatch(q.id) && (
                <button className="btn btn-green" style={{ marginTop: 12, padding: "10px 28px", fontSize: 14 }} onClick={() => onConfirmHint(q.id)}>
                  {"\u2713"} Confirm & Continue
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {hintConfirmed && !showResults && (
        <div className="hint-confirmed">{"\u2713"} Answer confirmed via hint — now you can continue</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUIZ PAGE (contains the entire exam state machine)
   ═══════════════════════════════════════════════════════════ */
function QuizPage({ onQuizComplete }) {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const course = getCourse(courseId);
  const quizSet = getQuizSet(courseId, quizId);

  // Main exam state
  const [screen, setScreen] = useState("start");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExp, setShowExp] = useState({});
  const [timeLeft, setTimeLeft] = useState(quizSet ? quizSet.config.totalTime : 3600);
  const [timerOn, setTimerOn] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reinforcement state
  const [reinforceQs, setReinforceQs] = useState([]);
  const [reinforceTopics, setReinforceTopics] = useState([]);
  const [reinforceAnswers, setReinforceAnswers] = useState({});
  const [reinforceShowExp, setReinforceShowExp] = useState({});
  const [reinforceIdx, setReinforceIdx] = useState(0);
  const [reinforceSubmitted, setReinforceSubmitted] = useState(false);
  const [hints, setHints] = useState({});

  const timerRef = useRef(null);

  if (!course || !quizSet) return (
    <div className="not-found">
      <h2>Quiz not found</h2>
      <Link to="/dashboard" className="btn btn-accent">Back to Dashboard</Link>
    </div>
  );

  const bank = window[quizSet.questionBankKey] || [];
  const reinforceBank = window[quizSet.reinforceBankKey] || [];
  const config = quizSet.config;
  const TOTAL_TIME = config.totalTime || 3600;
  const chapterSet = new Set(config.chapters || []);
  const professorCount = config.professorQuestions === false
    ? 0
    : bank.filter(item => item.fromProfessor).length;
  const freeCount = config.freeResponseIncluded === false
    ? 0
    : bank.filter(item => item.type === "free").length;
  const chapterPool = bank.filter(item => !item.fromProfessor && item.type !== "free" && chapterSet.has(item.chapter)).length;
  const randomCount = Math.min(config.maxQuestions || chapterPool, chapterPool);
  const totalQuestionCount = professorCount + randomCount + freeCount;

  useEffect(() => {
    if (timerOn && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setSubmitted(true); setScreen("results"); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSelect = useCallback((qId, val) => {
    if (submitted) return;
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    if (q.type === "free" || q.type === "fill") { setAnswers(p => ({ ...p, [qId]: val })); return; }
    if (q.type === "multi") {
      setAnswers(p => { const c = p[qId] || []; return { ...p, [qId]: c.includes(val) ? c.filter(i => i !== val) : [...c, val] }; });
    } else { setAnswers(p => ({ ...p, [qId]: [val] })); }
  }, [submitted, questions]);

  const handleReinforceSelect = useCallback((qId, val) => {
    if (reinforceSubmitted) return;
    const h = hints[qId];
    if (h && h.revealed && !h.confirmed) return;
    const q = reinforceQs.find(q => q.id === qId);
    if (!q) return;
    if (q.type === "free" || q.type === "fill") { setReinforceAnswers(p => ({ ...p, [qId]: val })); return; }
    if (q.type === "multi") {
      setReinforceAnswers(p => { const c = p[qId] || []; return { ...p, [qId]: c.includes(val) ? c.filter(i => i !== val) : [...c, val] }; });
    } else { setReinforceAnswers(p => ({ ...p, [qId]: [val] })); }
  }, [reinforceSubmitted, reinforceQs, hints]);

  // Hint system
  const getHintAnswer = useCallback((q) => {
    if (!q) return "";
    if (q.type === "fill") return q.answer.join(", ");
    if (q.type === "free") return "";
    return q.answer.map(i => q.options[i]).join(" | ");
  }, []);

  const revealHint = useCallback((qId) => {
    setHints(p => ({ ...p, [qId]: { revealed: true, confirmText: "", confirmed: false } }));
  }, []);

  const updateHintConfirm = useCallback((qId, text) => {
    setHints(p => ({ ...p, [qId]: { ...p[qId], confirmText: text } }));
  }, []);

  const checkHintMatch = useCallback((qId) => {
    const h = hints[qId];
    if (!h || !h.confirmText) return false;
    const q = reinforceQs.find(q => q.id === qId);
    if (!q) return false;
    const typed = h.confirmText.trim().toLowerCase();
    if (q.type === "fill") {
      if (q.acceptableAnswers) return q.acceptableAnswers.some(acc => acc.every(w => typed.includes(w.toLowerCase())));
      return q.answer.some(a => typed.includes(a.toLowerCase()));
    }
    const correctTexts = q.answer.map(i => q.options[i].toLowerCase());
    return correctTexts.every(ct => {
      const words = ct.split(/\s+/).filter(w => w.length > 3);
      const matched = words.filter(w => typed.includes(w));
      return matched.length >= Math.ceil(words.length * 0.5);
    });
  }, [hints, reinforceQs]);

  const confirmHint = useCallback((qId) => {
    if (checkHintMatch(qId)) {
      const q = reinforceQs.find(q => q.id === qId);
      setHints(p => ({ ...p, [qId]: { ...p[qId], confirmed: true } }));
      if (q && (q.type === "single" || q.type === "multi")) {
        setReinforceAnswers(p => ({ ...p, [qId]: [...q.answer] }));
      } else if (q && q.type === "fill") {
        setReinforceAnswers(p => ({ ...p, [qId]: q.answer[0] }));
      }
    }
  }, [checkHintMatch, reinforceQs]);

  const checkCorrect = useCallback((q, ans) => {
    if (!q || q.type === "free") return null;
    if (q.type === "fill") return UE.gradeFill(q, ans[q.id]);
    const ua = ans[q.id] || [];
    if (ua.length !== q.answer.length) return false;
    return q.answer.every(a => ua.includes(a)) && ua.every(a => q.answer.includes(a));
  }, []);

  const isCorrect = useCallback((qId) => checkCorrect(questions.find(q => q.id === qId), answers), [questions, answers, checkCorrect]);
  const isReinforceCorrect = useCallback((qId) => checkCorrect(reinforceQs.find(q => q.id === qId), reinforceAnswers), [reinforceQs, reinforceAnswers, checkCorrect]);

  const score = useMemo(() => {
    let correct = 0, total = 0;
    questions.forEach(q => { if (q.type !== "free") { total++; if (isCorrect(q.id)) correct++; } });
    return { correct, total };
  }, [questions, isCorrect]);

  const reinforceScore = useMemo(() => {
    let correct = 0, total = 0;
    reinforceQs.forEach(q => { if (q.type !== "free") { total++; if (isReinforceCorrect(q.id)) correct++; } });
    return { correct, total };
  }, [reinforceQs, isReinforceCorrect]);

  const wrongQuestions = useMemo(() => {
    return questions.filter(q => q.type !== "free" && !isCorrect(q.id));
  }, [questions, isCorrect]);

  const startExam = () => {
    const exam = UE.buildExam(bank, config);
    setQuestions(exam); setAnswers({}); setShowExp({}); setTimeLeft(TOTAL_TIME); setSubmitted(false); setCurrentQ(0);
    setReinforceQs([]); setReinforceAnswers({}); setReinforceShowExp({}); setReinforceIdx(0); setReinforceSubmitted(false); setHints({});
    setScreen("exam"); setTimerOn(true);
  };

  const handleSubmit = () => {
    if (!confirm("Submit your exam? You won't be able to change answers.")) return;
    setSubmitted(true); setTimerOn(false); clearInterval(timerRef.current); setScreen("results");
    // Save progress
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    UE.storage.recordAttempt(quizId, pct, `${score.correct}/${score.total}`);
    if (onQuizComplete) onQuizComplete();
  };

  const startReinforce = () => {
    const { questions: rQs, topics } = UE.buildReinforcement(wrongQuestions, bank, reinforceBank);
    setReinforceQs(rQs); setReinforceTopics(topics); setReinforceAnswers({}); setReinforceShowExp({}); setReinforceIdx(0); setReinforceSubmitted(false); setHints({});
    setScreen("reinforce");
  };

  const handleReinforceSubmit = () => {
    if (!confirm("Submit your reinforcement quiz?")) return;
    setReinforceSubmitted(true); setScreen("reinforce-results");
  };

  const q = questions[currentQ];
  const rq = reinforceQs[reinforceIdx];
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const isReview = screen === "review";
  const typeLabel = { single: "Multiple Choice", multi: "Select All", fill: "Fill in the Blank", free: "Free Response" };

  const isAnswered = (qs, ans, idx) => {
    const qq = qs[idx]; if (!qq) return false;
    const a = ans[qq.id];
    return a && (typeof a === "string" ? a.length > 0 : a.length > 0);
  };

  // ── START ──
  if (screen === "start") {
    return (
      <div>
        <div className="quiz-breadcrumb">
          <Link to={`/course/${courseId}`} className="back-link">&larr; {course.name}</Link>
        </div>
        <div className="start"><div className="start-card" style={{ "--card-accent": course.color }}>
          <div className="tag" style={{ color: course.color }}>{course.code} &middot; {course.name}</div>
          <h1>{quizSet.name}</h1>
          <p className="sub">{quizSet.subtitle} &middot; Randomized each attempt</p>
          <div className="grid3">
            <div className="g-box"><div className="g-val">{totalQuestionCount}</div><div className="g-lbl">Questions</div></div>
            <div className="g-box"><div className="g-val">{Math.floor(TOTAL_TIME / 60)}m</div><div className="g-lbl">Time Limit</div></div>
            <div className="g-box"><div className="g-val">4</div><div className="g-lbl">Types</div></div>
          </div>
          <div className="info-box">
            <strong>How it works</strong>
            <p>{config.professorQuestions ? `${bank.filter(q => q.fromProfessor).length} professor-confirmed questions always included. ` : ""}{config.maxQuestions} more drawn randomly. Includes MC, select-all, fill-in-the-blank, and free response. After the exam, you can practice your weak areas with targeted reinforcement questions.</p>
          </div>
          <button className="btn btn-accent" onClick={startExam} style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}dd)` }}>Start Exam</button>
        </div></div>
      </div>
    );
  }

  // ── RESULTS ──
  if (screen === "results") {
    const chapters = config.chapters || [1, 2, 3, 4];
    return (
      <div>
        <div className="results">
          <div className="res-hero">
            <div className="tag" style={{ marginBottom: 16, color: course.color }}>Final Score</div>
            <div className={`res-pct ${pct >= 70 ? "hi" : pct >= 50 ? "mid" : "lo"}`}>{pct}%</div>
            <div className="res-det">{score.correct} / {score.total} scored questions correct</div>
            <div className="res-btns">
              <button className="btn btn-accent" onClick={() => { setScreen("review"); setCurrentQ(0); }}>Review Answers</button>
              {wrongQuestions.length > 0 && (
                <button className="btn btn-orange" onClick={startReinforce}>
                  &#x1F504; Practice Weak Areas ({wrongQuestions.length} wrong)
                </button>
              )}
              <button className="btn btn-ghost" onClick={startExam}>New Attempt</button>
              <button className="btn btn-ghost" onClick={() => navigate(`/course/${courseId}`)}>Back to Course</button>
            </div>
          </div>

          <div className="ch-grid">
            {chapters.map(ch => {
              const chQs = questions.filter(q => q.chapter === ch && q.type !== "free");
              const chOk = chQs.filter(q => isCorrect(q.id)).length;
              const chP = chQs.length > 0 ? (chOk / chQs.length) * 100 : 0;
              return (
                <div key={ch} className="ch-box">
                  <div className="ch-lbl">Chapter {ch}</div>
                  <div className="ch-score">{chOk}/{chQs.length}</div>
                  <div className="ch-bar"><div className="ch-fill" style={{ width: `${chP}%`, background: chP >= 70 ? "var(--green)" : chP >= 50 ? "var(--amber)" : "var(--red)" }} /></div>
                </div>
              );
            })}
          </div>

          {wrongQuestions.length > 0 && (
            <div className="weak-panel">
              <div className="weak-title">&#x1F3AF; Your Weak Areas</div>
              <div className="weak-sub">
                You missed questions on these topics. Hit "Practice Weak Areas" to get a targeted mini-quiz with the questions you got wrong plus related questions to reinforce your understanding.
              </div>
              <div className="weak-topics">
                {[...new Set(wrongQuestions.flatMap(q => q.topics || []))].slice(0, 12).map(t => (
                  <span key={t} className="weak-chip">{t.replace(/-/g, " ")}</span>
                ))}
              </div>
              <div className="weak-stat">
                <div className="weak-stat-item"><div className="weak-stat-val">{wrongQuestions.length}</div><div className="weak-stat-lbl">Questions Missed</div></div>
                <div className="weak-stat-item"><div className="weak-stat-val">{[...new Set(wrongQuestions.flatMap(q => q.topics || []))].length}</div><div className="weak-stat-lbl">Weak Topics</div></div>
                <div className="weak-stat-item"><div className="weak-stat-val">{[...new Set(wrongQuestions.map(q => q.chapter))].length}</div><div className="weak-stat-lbl">Chapters</div></div>
              </div>
              <button className="btn btn-orange" onClick={startReinforce} style={{ width: "100%" }}>&#x1F504; Practice Weak Areas</button>
            </div>
          )}

          <div className="shuffle-note">Questions are randomized — retake for a different set!</div>
        </div>
      </div>
    );
  }

  // ── REINFORCE RESULTS ──
  if (screen === "reinforce-results") {
    const rPct = reinforceScore.total > 0 ? Math.round((reinforceScore.correct / reinforceScore.total) * 100) : 0;
    const stillWrong = reinforceQs.filter(q => q.type !== "free" && !isReinforceCorrect(q.id));
    return (
      <div>
        <div className="results">
          <div className="reinforce-hero">
            <div className="tag" style={{ marginBottom: 16, color: "var(--orange)" }}>Reinforcement Results</div>
            <div className={`res-pct ${rPct >= 70 ? "hi" : rPct >= 50 ? "mid" : "lo"}`}>{rPct}%</div>
            <div className="res-det">{reinforceScore.correct} / {reinforceScore.total} correct on weak-area questions</div>
            <div style={{ marginTop: 12, color: "var(--text2)", fontSize: 14 }}>
              {rPct >= 90 ? "\u{1F389} Excellent! You've solidified these topics." :
                rPct >= 70 ? "\u{1F4AA} Good improvement! A few topics still need attention." :
                  "\u{1F4DA} Keep studying these areas — try again or review the explanations."}
            </div>
            <div className="res-btns">
              <button className="btn btn-accent" onClick={() => { setScreen("reinforce-review"); setReinforceIdx(0); }}>Review Answers</button>
              {stillWrong.length > 0 && (
                <button className="btn btn-orange" onClick={() => {
                  const { questions: rQs, topics } = UE.buildReinforcement(stillWrong, bank, reinforceBank);
                  setReinforceQs(rQs); setReinforceTopics(topics); setReinforceAnswers({}); setReinforceShowExp({}); setReinforceIdx(0); setReinforceSubmitted(false); setHints({}); setScreen("reinforce");
                }}>&#x1F504; Practice Again ({stillWrong.length} still wrong)</button>
              )}
              <button className="btn btn-ghost" onClick={startExam}>New Full Exam</button>
              <button className="btn btn-ghost" onClick={() => navigate(`/course/${courseId}`)}>Back to Course</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── REINFORCE QUIZ / REINFORCE REVIEW ──
  if (screen === "reinforce" || screen === "reinforce-review") {
    if (!rq) return null;
    const isRR = screen === "reinforce-review";
    const showRes = isRR || reinforceSubmitted;
    const hint = hints[rq.id] || {};
    const hintRevealed = hint.revealed && !hint.confirmed && !showRes;
    const canAdvance = !hintRevealed;

    return (
      <div>
        <div className="hdr">
          <div className="hdr-l">
            <span className="cnt">Q{reinforceIdx + 1}/{reinforceQs.length}</span>
            <span className="pill pill-reinforce">&#x1F504; REINFORCE</span>
            <span className="pill pill-ch">Ch. {rq.chapter}</span>
            <span className="pill pill-type">{typeLabel[rq.type]}</span>
          </div>
          <span style={{ color: "var(--orange)", fontSize: 13, fontWeight: 600 }}>
            {isRR ? "Review Mode" : "Weak Area Practice"}
          </span>
        </div>

        <QuestionView
          q={rq} answers={reinforceAnswers} onSelect={handleReinforceSelect}
          showResults={showRes} isCorrect={showRes ? isReinforceCorrect(rq.id) : null}
          showExp={reinforceShowExp} onToggleExp={(id) => setReinforceShowExp(p => ({ ...p, [id]: !p[id] }))}
          hintState={hints[rq.id]} onRevealHint={!showRes ? revealHint : null}
          onUpdateHintConfirm={updateHintConfirm} onConfirmHint={confirmHint}
          checkHintMatch={checkHintMatch} getHintAnswer={getHintAnswer}
        />

        <div className="ftr">
          <button className="ftr-btn ftr-prev" onClick={() => setReinforceIdx(c => Math.max(0, c - 1))} disabled={reinforceIdx === 0}>&larr; Prev</button>
          <div className="dots">
            {reinforceQs.map((_, i) => {
              const qid = reinforceQs[i].id;
              const h = hints[qid];
              let cls = "dot ";
              if (h && h.confirmed) cls += "dot-confirmed ";
              else if (h && h.revealed) cls += "dot-hinted ";
              else if (isAnswered(reinforceQs, reinforceAnswers, i)) cls += "dot-reinforce ";
              else cls += "dot-e ";
              if (i === reinforceIdx) cls += "dot-cur";
              return <button key={i} className={cls} onClick={() => { if (canAdvance || i <= reinforceIdx) setReinforceIdx(i); }} />;
            })}
          </div>
          {reinforceIdx === reinforceQs.length - 1 && !isRR && !reinforceSubmitted ? (
            <button className="btn btn-green" style={{ padding: "10px 26px", fontSize: 14 }} onClick={handleReinforceSubmit} disabled={!canAdvance}>Submit</button>
          ) : (
            <button className="ftr-btn ftr-next" onClick={() => setReinforceIdx(c => Math.min(reinforceQs.length - 1, c + 1))} disabled={reinforceIdx === reinforceQs.length - 1 || !canAdvance}>Next &rarr;</button>
          )}
        </div>
      </div>
    );
  }

  // ── EXAM / REVIEW ──
  if (!q) return null;
  const showRes = isReview || submitted;

  return (
    <div>
      <div className="hdr">
        <div className="hdr-l">
          <span className="cnt">Q{currentQ + 1}/{questions.length}</span>
          {q.fromProfessor && <span className="pill pill-prof">&#x2B50; PROFESSOR</span>}
          <span className="pill pill-ch">Ch. {q.chapter}</span>
          <span className="pill pill-type">{typeLabel[q.type]}</span>
        </div>
        {!isReview ? (
          <div className={`timer ${timeLeft < 300 ? "timer-warn" : "timer-ok"}`}>{fmt(timeLeft)}</div>
        ) : (
          <span style={{ color: "var(--text2)", fontSize: 13 }}>Review Mode</span>
        )}
      </div>

      <QuestionView
        q={q} answers={answers} onSelect={handleSelect}
        showResults={showRes} isCorrect={showRes ? isCorrect(q.id) : null}
        showExp={showExp} onToggleExp={(id) => setShowExp(p => ({ ...p, [id]: !p[id] }))}
      />

      <div className="ftr">
        <button className="ftr-btn ftr-prev" onClick={() => setCurrentQ(c => Math.max(0, c - 1))} disabled={currentQ === 0}>&larr; Prev</button>
        <div className="dots">
          {questions.map((_, i) => (
            <button key={i} className={`dot ${isAnswered(questions, answers, i) ? "dot-a" : "dot-e"} ${i === currentQ ? "dot-cur" : ""}`} onClick={() => setCurrentQ(i)} />
          ))}
        </div>
        {currentQ === questions.length - 1 && !isReview && !submitted ? (
          <button className="btn btn-green" style={{ padding: "10px 26px", fontSize: 14 }} onClick={handleSubmit}>Submit</button>
        ) : (
          <button className="ftr-btn ftr-next" onClick={() => setCurrentQ(c => Math.min(questions.length - 1, c + 1))} disabled={currentQ === questions.length - 1}>Next &rarr;</button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
   ═══════════════════════════════════════════════════════════ */
function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { streak, refresh: refreshStreak } = useStreak();

  return (
    <HashRouter>
      <Layout theme={theme} onToggleTheme={toggleTheme} streak={streak}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage streak={streak} />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/quiz/:courseId/:quizId" element={<QuizPage onQuizComplete={refreshStreak} />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
