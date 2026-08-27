/**
 * Big-tech interview simulations.
 *
 * ids are UUID-shaped on purpose: lib/storage/supabase-repository.ts only
 * persists an attempt to Postgres when isUuidLike(quizId) passes, and
 * attempts.quiz_set_id has no FK. So these ride the existing attempt →
 * points → leaderboard pipeline with zero backend changes.
 *
 * Questions are original, written in each company's publicly documented
 * style. Nothing here is a leaked or proprietary question.
 */

export type InterviewRoundKind = "coding" | "system-design" | "behavioral" | "domain";

/** One rubric line an interviewer actually looks for, plus how to fix it. */
export interface InterviewSignal {
  id: string;
  label: string;
  /** Relative importance inside its question. */
  weight: number;
  /** Shown when the candidate misses it. Concrete, actionable. */
  hint: string;
}

/** A runnable coding workspace — the part that makes this a real technical round. */
export interface CodingWorkspace {
  language: "javascript";
  /** The function the tests call. Candidates must keep this name. */
  functionName: string;
  starterCode: string;
  tests: { name: string; args: unknown[]; expected: unknown }[];
  /** Rubric weight earned proportionally by passing tests. */
  weight: number;
}

export interface InterviewQuestion {
  id: string;
  kind: InterviewRoundKind;
  /** What the interviewer says out loud. */
  prompt: string;
  /** Framing/constraints the interviewer gives if asked. */
  context?: string;
  /** Pushes the interviewer makes once you have a first answer. */
  followUps?: string[];
  minutes: number;
  /** Present on rounds where you actually write and run code. */
  coding?: CodingWorkspace;
  signals: InterviewSignal[];
  /** What a hire-level answer covers. Shown during self-review. */
  strongAnswer: string;
}

export interface InterviewRound {
  id: string;
  name: string;
  format: string;
  minutes: number;
  /**
   * Premium rounds complete the real loop. Free accounts always get a full,
   * ungated first round — same editor, same tests, same rubric, same score —
   * so the free experience is a real interview, not a teaser.
   */
  premium?: boolean;
  questions: InterviewQuestion[];
}

/** A non-question stage of the real loop: recruiter screen, debrief, offer. */
export interface LoopStage {
  name: string;
  whatHappens: string;
  howToPrepare: string[];
}

export interface CompanyInterview {
  id: string;
  company: string;
  logoAccent: string;
  role: string;
  level: string;
  blurb: string;
  /** The real loop, stage by stage. */
  process: string[];
  /** What this company disproportionately rewards. */
  bar: string[];
  /** Common ways strong engineers fail this specific loop. */
  pitfalls: string[];
  rounds: InterviewRound[];
  /** Premium: the stages around the technical rounds that decide offers. */
  loopStages: LoopStage[];
}

export const companyInterviews: CompanyInterview[] = [
  {
    id: "6f1c0a20-4d1e-4a5b-9c31-0a1b2c3d4e01",
    company: "Google",
    logoAccent: "from-blue-500/20 to-emerald-500/15",
    role: "Software Engineer",
    level: "L4 (mid-level)",
    blurb:
      "Structured, rubric-driven, and famously consistent. Your interviewers write detailed feedback that a hiring committee reads without ever meeting you — so what you say out loud matters as much as what you type.",
    process: [
      "Recruiter screen (~30 min) — resume walkthrough, timeline, level calibration.",
      "Technical phone screen (~45 min) — one or two coding problems in a shared doc.",
      "Onsite loop (4–5 rounds) — 2–3 coding, 1 system design (L5+ weighted heavily), 1 Googleyness & Leadership.",
      "Hiring committee — reviews written packets only. You are judged on the notes, not the vibe.",
      "Team matching — you can pass the bar and still wait for a team fit."
    ],
    bar: [
      "Clean, correct code on the first pass — they care about bug-free more than clever.",
      "Explicit complexity analysis, stated without being asked.",
      "Communicating your reasoning continuously, because the packet is written from what you said."
    ],
    pitfalls: [
      "Jumping to code before restating the problem and confirming constraints.",
      "Silent thinking. An interviewer who can't hear your reasoning can't write it down.",
      "Ignoring edge cases until prompted, then patching instead of re-reasoning."
    ],
    rounds: [
      {
        id: "goog-r1",
        name: "Coding 1 — Arrays & hashing",
        format: "45 min, shared doc, no autocomplete",
        minutes: 45,
        questions: [
          {
            id: "goog-q1",
            kind: "coding",
            prompt:
              "You're given a list of server log entries, each a (userId, timestampSeconds) pair, in arbitrary order. Return every userId that made more than 20 requests inside any rolling 60-second window. Walk me through your approach before you write anything.",
            context:
              "Assume up to 10 million entries and that they don't fit comfortably in memory sorted all at once. Timestamps can repeat.",
            followUps: [
              "What's your time and space complexity, and which one would you sacrifice first?",
              "Now the logs arrive as an unbounded stream instead of a list. What changes?",
              "How would you shard this across 10 machines, and what breaks at the shard boundaries?"
            ],
            coding: {
              language: "javascript",
              functionName: "usersOverRateLimit",
              weight: 6,
              starterCode: `/**
 * @param {Array<[string, number]>} logs  (userId, timestampSeconds), unordered
 * @param {number} limit                  more than this many = flagged
 * @param {number} windowSeconds          rolling window size
 * @returns {string[]} flagged userIds, sorted ascending
 */
function usersOverRateLimit(logs, limit = 20, windowSeconds = 60) {
  // Talk through your approach before you write. Then make the tests pass.
}
`,
              tests: [
                { name: "no logs", args: [[], 3, 60], expected: [] },
                {
                  name: "4 requests inside the window is over the limit of 3",
                  args: [[["u1", 0], ["u1", 1], ["u1", 2], ["u1", 3]], 3, 60],
                  expected: ["u1"]
                },
                {
                  name: "exactly the limit is not over it",
                  args: [[["u1", 0], ["u1", 1], ["u1", 2]], 3, 60],
                  expected: []
                },
                {
                  name: "spread beyond the window is fine",
                  args: [[["u1", 0], ["u1", 100], ["u1", 200], ["u1", 300]], 3, 60],
                  expected: []
                },
                {
                  name: "window edge: 0 and 60 are not in the same window",
                  args: [[["u1", 0], ["u1", 20], ["u1", 40], ["u1", 60]], 3, 60],
                  expected: []
                },
                {
                  name: "two users flagged, returned sorted",
                  args: [
                    [
                      ["u2", 0], ["u2", 1], ["u2", 2], ["u2", 3],
                      ["u1", 0], ["u1", 5], ["u1", 10], ["u1", 15]
                    ],
                    3,
                    60
                  ],
                  expected: ["u1", "u2"]
                }
              ]
            },
            minutes: 25,
            signals: [
              {
                id: "goog-q1-s1",
                label: "Restated the problem and confirmed constraints before coding",
                weight: 3,
                hint: "Open with a 20-second restatement plus two clarifying questions (input size, duplicates, memory limits). Google's rubric explicitly scores problem comprehension."
              },
              {
                id: "goog-q1-s2",
                label: "Chose group-by-user + sliding window over brute force, and said why",
                weight: 3,
                hint: "Name the brute-force option (O(n²) pairwise) out loud, then discard it with a reason. Interviewers score the comparison, not just the final pick."
              },
              {
                id: "goog-q1-s3",
                label: "Stated time/space complexity unprompted",
                weight: 2,
                hint: "Say 'O(n log n) for the per-user sort, O(n) space' before the interviewer asks. Volunteering it reads as senior."
              },
              {
                id: "goog-q1-s4",
                label: "Handled edge cases: single entry, ties at the window edge, exactly 20 requests",
                weight: 2,
                hint: "Say 'more than 20' means strictly >, so 20 is not a hit — then test the boundary explicitly in your dry run."
              },
              {
                id: "goog-q1-s5",
                label: "Dry-ran the code on a small input, out loud, and caught a bug or confirmed correctness",
                weight: 3,
                hint: "Trace 4–5 rows by hand before declaring done. Finding your own bug scores higher than the interviewer finding it."
              },
              {
                id: "goog-q1-s6",
                label: "Answered the streaming follow-up with a concrete structure (deque / heap per user)",
                weight: 2,
                hint: "For streams: keep a per-user deque of timestamps, evict from the front while front < now - 60. Say the eviction rule explicitly."
              }
            ],
            strongAnswer:
              "Restate: find users with >20 events in any 60s rolling window. Clarify size, duplicates, memory. Group entries by userId (hash map), sort each user's timestamps, then run a two-pointer sliding window per user: advance right, move left while t[right] - t[left] >= 60, and flag when right - left + 1 > 20. O(n log n) time from the per-user sorts, O(n) space. Edge cases: users with <21 events short-circuit; exactly 20 is not a hit; identical timestamps still count individually. For a stream, replace the sorted array with a per-user deque and evict from the front on each arrival. For sharding, partition by userId hash so all of a user's events land on one machine — no boundary problem, since the window is per-user."
          }
        ]
      },
      {
        id: "goog-r2",
        premium: true,
        name: "System design — scale & tradeoffs",
        format: "45 min, whiteboard",
        minutes: 45,
        questions: [
          {
            id: "goog-q2",
            kind: "system-design",
            prompt:
              "Design a URL shortener that serves 100,000 redirects per second globally, with p99 redirect latency under 50ms. Start wherever you like.",
            context:
              "Roughly 1 billion links stored. Redirects vastly outnumber creates — about 1000:1. Custom aliases are supported.",
            followUps: [
              "How do you generate ids without a global lock?",
              "A single link goes viral and takes 40% of your traffic. What happens?",
              "What's your consistency story when a user creates a custom alias that already exists?"
            ],
            minutes: 40,
            signals: [
              {
                id: "goog-q2-s1",
                label: "Gathered requirements and did back-of-envelope math before drawing",
                weight: 3,
                hint: "Spend the first 5 minutes on numbers: 100k RPS × 100 bytes ≈ 10MB/s egress, 1B links × ~500 bytes ≈ 500GB. Design decisions have to fall out of the math."
              },
              {
                id: "goog-q2-s2",
                label: "Separated the read path from the write path explicitly",
                weight: 3,
                hint: "With a 1000:1 read ratio, say plainly: 'I'm optimizing the read path first' and design cache-first, then treat writes as a lower-QPS problem."
              },
              {
                id: "goog-q2-s3",
                label: "Proposed a concrete id-generation scheme with no global lock",
                weight: 3,
                hint: "Per-host counter ranges (a block allocator), or base62 of a Snowflake-style id: timestamp + machine id + sequence. Name the collision story."
              },
              {
                id: "goog-q2-s4",
                label: "Put a CDN/edge cache in front and reasoned about hit rate and TTL",
                weight: 2,
                hint: "Redirects are immutable, so cache aggressively at the edge with long TTLs. Say the expected hit rate (>95%) and what the origin sees at 5% miss."
              },
              {
                id: "goog-q2-s5",
                label: "Handled the hot-key/viral-link case specifically",
                weight: 2,
                hint: "A viral link is the easy case — it's cached everywhere. Say that out loud, then discuss the hard version: a hot *write* key, or cache stampede on TTL expiry (use jittered TTLs / request coalescing)."
              },
              {
                id: "goog-q2-s6",
                label: "Named at least one real tradeoff and what they'd give up",
                weight: 3,
                hint: "Example: 'I'd accept eventual consistency for analytics counts, but custom aliases need a strongly consistent uniqueness check — so those go through a single-writer path or a CAS insert.'"
              }
            ],
            strongAnswer:
              "Requirements first: 100k RPS reads, ~100 writes/s, 1B links, p99 < 50ms, custom aliases. Math: 500GB of link data, 10MB/s egress. Read path: client → edge CDN (immutable redirects, long jittered TTL) → regional cache (Redis) → KV store (Bigtable/DynamoDB) keyed by short code. >95% edge hit rate keeps origin QPS in the low thousands. Write path: id generation via per-host pre-allocated counter blocks base62-encoded — no global lock, no coordination on the hot path. Custom aliases take a different path: conditional insert (compare-and-set) on the KV store so uniqueness is strongly consistent, returning a clean 409 on conflict. Viral links are trivially handled by the cache; the real risks are cache stampede on expiry (jitter TTLs, coalesce origin requests) and hot shards on write. Analytics counts go async through a queue with eventual consistency — I'd trade exact counts for redirect latency every time."
          }
        ]
      },
      {
        id: "goog-r3",
        premium: true,
        name: "Googleyness & Leadership",
        format: "30–45 min, behavioral",
        minutes: 40,
        questions: [
          {
            id: "goog-q3",
            kind: "behavioral",
            prompt:
              "Tell me about a time you disagreed with a technical decision your team had already committed to. What did you do?",
            context:
              "The interviewer is scoring for collaboration, humility, and bias to action — not for being right.",
            followUps: [
              "What did the person you disagreed with say afterwards?",
              "What would you do differently now?",
              "How did you decide it was worth escalating — or not?"
            ],
            minutes: 15,
            signals: [
              {
                id: "goog-q3-s1",
                label: "Used a clear structure (situation → action → result), not a rambling story",
                weight: 3,
                hint: "STAR or similar. Two sentences of setup, most of your airtime on what *you* specifically did, then a concrete outcome."
              },
              {
                id: "goog-q3-s2",
                label: "Said 'I' more than 'we' when describing the actions",
                weight: 2,
                hint: "Interviewers can only credit what you personally did. Replace 'we decided' with 'I proposed X, and the team chose Y'."
              },
              {
                id: "goog-q3-s3",
                label: "Showed you sought data or a reversible experiment rather than arguing from opinion",
                weight: 3,
                hint: "The winning move is 'I asked to spend two days prototyping both and measuring' — it converts a disagreement into evidence."
              },
              {
                id: "goog-q3-s4",
                label: "Demonstrated committing fully after the decision went against you",
                weight: 3,
                hint: "Explicitly say 'I disagreed, then committed and made it work' — that sentence is what the rubric is listening for."
              },
              {
                id: "goog-q3-s5",
                label: "Gave a specific, honest reflection on what you'd change",
                weight: 2,
                hint: "Avoid 'nothing' or a humblebrag. Name a real mistake — raising it too late, or over-escalating early."
              }
            ],
            strongAnswer:
              "A hire-level answer is 90 seconds of setup, three minutes of specific personal action, and a measurable result. It shows you (1) raised the concern early and directly to the decision-maker, (2) argued with data or proposed a cheap reversible test rather than a debate, (3) committed genuinely once the call was made, and (4) can name what you'd do differently without either self-flagellating or claiming you were simply right all along."
          }
        ]
      }
    ]
  },
  {
    id: "6f1c0a20-4d1e-4a5b-9c31-0a1b2c3d4e02",
    company: "Meta",
    logoAccent: "from-sky-500/20 to-indigo-500/15",
    role: "Software Engineer (Product)",
    level: "E4/E5",
    blurb:
      "Fast, high-signal, and unusually strict on time. Meta coding rounds pack two problems into 40 minutes, so the bar is speed with correctness — you are expected to arrive at optimal quickly, not to wander toward it.",
    process: [
      "Recruiter screen — role, level, timeline.",
      "Technical screen (~45 min) — typically two coding problems, both expected to be finished.",
      "Onsite 'loop': 2 coding rounds, 1 system/product architecture (E5+), 1 behavioral ('Jedi').",
      "Debrief + hiring manager review; team matching often happens after the offer.",
      "Down-leveling is common — you can be offered E4 after interviewing for E5."
    ],
    bar: [
      "Two problems in 40 minutes means ~18 minutes each including tests.",
      "Optimal solution expected, not just working — brute force alone often fails the round.",
      "Product sense in design rounds: who is the user and what breaks their experience?"
    ],
    pitfalls: [
      "Spending 10 minutes on clarifying questions. Ask two, then move.",
      "Writing pseudocode instead of real, running code.",
      "Forgetting to test — Meta interviewers expect you to dry-run without being told."
    ],
    rounds: [
      {
        id: "meta-r1",
        name: "Coding — two problems, 40 minutes",
        format: "45 min, CoderPad, both problems expected",
        minutes: 45,
        questions: [
          {
            id: "meta-q1",
            kind: "coding",
            prompt:
              "Given a binary tree, return the values you'd see standing to the right of it, top to bottom. Then, second problem: given a list of intervals representing meeting times, return the minimum number of rooms needed. You have 40 minutes for both.",
            context:
              "The interviewer will keep an eye on the clock and nudge you forward if you're over ~20 minutes on the first.",
            followUps: [
              "Can you do the right-side view iteratively instead of recursively?",
              "For the meeting rooms, what if intervals arrive as a stream?",
              "Which of the two would you optimize differently if n were 10 million?"
            ],
            coding: {
              language: "javascript",
              functionName: "minMeetingRooms",
              weight: 6,
              starterCode: `/**
 * Second problem, live-coded. A meeting ending at time T frees the room
 * for a meeting starting at T.
 *
 * @param {Array<[number, number]>} intervals  [start, end] pairs
 * @returns {number} minimum rooms needed
 */
function minMeetingRooms(intervals) {

}
`,
              tests: [
                { name: "no meetings", args: [[]], expected: 0 },
                { name: "one meeting", args: [[[7, 10]]], expected: 1 },
                { name: "touching endpoints share a room", args: [[[1, 5], [5, 8]]], expected: 1 },
                { name: "classic overlap", args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
                { name: "three fully nested", args: [[[1, 10], [2, 9], [3, 8]]], expected: 3 }
              ]
            },
            minutes: 40,
            signals: [
              {
                id: "meta-q1-s1",
                label: "Finished both problems inside the time box",
                weight: 3,
                hint: "Budget 18 minutes each. If you're at 20 on the first, say 'let me lock this in and move' — the interviewer is scoring throughput."
              },
              {
                id: "meta-q1-s2",
                label: "Reached optimal on both (BFS level-order; sort + min-heap or sweep line)",
                weight: 3,
                hint: "Right-side view: BFS taking the last node per level, O(n). Meeting rooms: sort by start, min-heap of end times — O(n log n). Brute force alone typically fails this round."
              },
              {
                id: "meta-q1-s3",
                label: "Wrote real, compilable code — not pseudocode",
                weight: 3,
                hint: "Meta expects code that would run. Declare types, handle the empty input, return the right thing."
              },
              {
                id: "meta-q1-s4",
                label: "Kept clarifying questions to about two, then started",
                weight: 2,
                hint: "Ask only what changes your solution (can the tree be empty? can intervals touch at endpoints?). Then code."
              },
              {
                id: "meta-q1-s5",
                label: "Tested with a small example without being asked",
                weight: 2,
                hint: "Spend 60 seconds tracing a 3-node tree and two overlapping intervals. Say the expected output before you trace."
              },
              {
                id: "meta-q1-s6",
                label: "Handled the endpoint-touching case for intervals ([1,5] and [5,8] need one room)",
                weight: 2,
                hint: "Ask or state the assumption explicitly: a meeting ending at 5 frees the room for one starting at 5. Getting this wrong is the classic silent failure."
              }
            ],
            strongAnswer:
              "Problem 1: BFS level-order traversal, push the last node of each level into the result — O(n) time, O(w) space for the widest level. Handle the empty root. Problem 2: sort intervals by start time, maintain a min-heap of end times; for each interval, pop while heap top <= current start (room freed), then push current end. Heap size at its peak is the answer — O(n log n) / O(n). State the endpoint convention up front. A strong candidate finishes both in ~35 minutes and still traces a small example for each."
          }
        ]
      },
      {
        id: "meta-r2",
        premium: true,
        name: "Product architecture",
        format: "45 min, design with a product lens",
        minutes: 45,
        questions: [
          {
            id: "meta-q2",
            kind: "system-design",
            prompt:
              "Design the backend for a 'close friends' story feature: a user posts a story visible only to a hand-picked subset of followers, disappearing after 24 hours. Assume 500 million daily active users.",
            context:
              "Meta wants to hear product reasoning alongside the architecture — who sees what, and how wrong the failure modes feel to a real person.",
            followUps: [
              "What happens if someone is removed from the close-friends list after the story is posted?",
              "How do you keep the viewer list private from other viewers?",
              "Fan-out on write or on read? Defend it at this scale."
            ],
            minutes: 40,
            signals: [
              {
                id: "meta-q2-s1",
                label: "Framed the product requirement before the architecture",
                weight: 3,
                hint: "Start with the user story and the sharpest privacy rule: a non-member must never learn the story exists. Meta scores product judgment explicitly."
              },
              {
                id: "meta-q2-s2",
                label: "Made an explicit fan-out choice with a scale justification",
                weight: 3,
                hint: "Close-friends lists are small (tens), so fan-out on write is cheap here — contrast that with a celebrity's public story, where you'd flip to fan-out on read."
              },
              {
                id: "meta-q2-s3",
                label: "Designed expiry concretely (TTL + lazy filtering), not hand-waved",
                weight: 2,
                hint: "Say 'TTL on the storage row plus a filter at read time', because deletion is never instantaneous at this scale."
              },
              {
                id: "meta-q2-s4",
                label: "Treated the permission check as the correctness-critical path",
                weight: 3,
                hint: "The revocation case is the interview. State whether removal revokes access retroactively — and enforce the check at read time, not just at fan-out time."
              },
              {
                id: "meta-q2-s5",
                label: "Kept the viewer list private and said how",
                weight: 2,
                hint: "Viewer identities are visible to the author only; enforce server-side authorization on the viewers endpoint rather than trusting the client."
              },
              {
                id: "meta-q2-s6",
                label: "Named a failure mode in human terms, not just technical terms",
                weight: 2,
                hint: "'If the permission check is stale, someone sees a story meant to exclude them — that's a trust-breaking bug, so I'd fail closed.' That sentence is the product-sense signal."
              }
            ],
            strongAnswer:
              "Lead with the product invariant: a user not on the list must never see the story or infer it exists — so the system fails closed. Storage: story rows with author, media pointer, 24h TTL, plus a membership snapshot. Because close-friends lists are small, fan-out on write into each recipient's story feed is cheap; a celebrity public story would flip to fan-out on read. Critically, still re-check permission at read time against the current list so revocation takes effect retroactively — fan-out state alone is not the authorization source of truth. Expiry is a TTL plus a read-time filter, since deletes lag. Viewer lists are author-only, enforced server-side. The failure mode I care about most is a stale permission check leaking a story to someone deliberately excluded; that's a trust bug, not a latency bug, so I'd take the extra read to get it right."
          }
        ]
      },
      {
        id: "meta-r3",
        premium: true,
        name: "Behavioral ('Jedi')",
        format: "45 min, conflict, ambiguity, speed",
        minutes: 45,
        questions: [
          {
            id: "meta-q3",
            kind: "behavioral",
            prompt:
              "Tell me about the hardest conflict you've had with a coworker. Not a disagreement — a conflict.",
            context:
              "Meta's behavioral round probes conflict, ambiguity, and how you operate when things are moving fast and under-specified.",
            followUps: [
              "What was their side of it? Steelman it for me.",
              "What did you do that made it worse?",
              "How is your working relationship now?"
            ],
            minutes: 20,
            signals: [
              {
                id: "meta-q3-s1",
                label: "Picked a real conflict, not a sanitized non-story",
                weight: 3,
                hint: "'We disagreed about tabs vs spaces' reads as evasive. Pick something with actual stakes where you were genuinely frustrated."
              },
              {
                id: "meta-q3-s2",
                label: "Steelmanned the other person's position credibly",
                weight: 3,
                hint: "Explain why a reasonable person would hold their view. Candidates who can't do this get scored as difficult to work with."
              },
              {
                id: "meta-q3-s3",
                label: "Owned a specific contribution to the problem",
                weight: 3,
                hint: "Name one thing you did that escalated it — waiting too long to talk directly, or arguing in a public channel."
              },
              {
                id: "meta-q3-s4",
                label: "Described a direct conversation, not escalation-first",
                weight: 2,
                hint: "Going to the manager before talking to the person reads badly. Lead with 'I asked for 20 minutes with them directly'."
              },
              {
                id: "meta-q3-s5",
                label: "Ended with a concrete resolution and a durable working relationship",
                weight: 2,
                hint: "Close the loop: what changed operationally, and where the relationship stands now."
              }
            ],
            strongAnswer:
              "Strong answers pick a conflict with real stakes, describe the other person's view generously enough that the interviewer could argue it, own a specific escalating action of their own, show a direct one-on-one conversation as the first move, and end with both a concrete operational fix and an intact relationship. The failure modes are choosing a fake-safe story, painting the other person as irrational, or never naming your own contribution."
          }
        ]
      }
    ]
  },
  {
    id: "6f1c0a20-4d1e-4a5b-9c31-0a1b2c3d4e03",
    company: "Apple",
    logoAccent: "from-zinc-400/20 to-slate-500/15",
    role: "Software Engineer",
    level: "ICT3/ICT4",
    blurb:
      "Team-specific and deeply practical. Apple loops vary enormously by org — there's no single company-wide rubric — and interviewers dig hard into what you personally built, often down to memory layout, battery, or failure handling on a real device.",
    process: [
      "Recruiter screen, then usually a hiring-manager call for the specific team.",
      "Technical screen — coding, often with domain flavor (systems, graphics, embedded, app frameworks).",
      "Onsite 4–6 rounds with the actual team you'd join, plus a cross-functional partner.",
      "Deep dive on your past projects — expect to defend design decisions in detail.",
      "Team-specific decision; there's no central committee normalizing across orgs."
    ],
    bar: [
      "Depth over breadth — they will keep asking 'why' until you hit the bottom of your knowledge.",
      "Real-world constraints: memory, power, latency, and what happens on a bad network.",
      "Ownership and craft. Apple hires people who sweat details others skip."
    ],
    pitfalls: [
      "Overstating your role on a team project — they will drill until it's obvious.",
      "Answering only at the abstraction you're comfortable in. Be ready to go one layer down.",
      "Treating it like a generic FAANG loop; research the specific team's domain."
    ],
    rounds: [
      {
        id: "aapl-r1",
        name: "Coding — memory & correctness",
        format: "60 min, whiteboard or laptop",
        minutes: 60,
        questions: [
          {
            id: "aapl-q1",
            kind: "coding",
            prompt:
              "Implement an LRU cache with O(1) get and put. Then tell me what you'd change if this ran on a memory-constrained device where allocation churn matters.",
            context:
              "The follow-up is the real interview. Apple wants to know whether you think about what the code costs on actual hardware.",
            followUps: [
              "Where does your implementation allocate, and can you make it allocation-free after warmup?",
              "How would you make this thread-safe without killing throughput?",
              "What does this do to cache locality, and would an array-backed design beat pointers here?"
            ],
            coding: {
              language: "javascript",
              functionName: "runLru",
              weight: 6,
              starterCode: `/**
 * Implement the LRU cache, then drive it with the given operations.
 * Both get and put must be O(1).
 *
 * @param {number} capacity
 * @param {Array<["put", key, value] | ["get", key]>} ops
 * @returns {number[]} the result of each get, -1 on a miss
 */
function runLru(capacity, ops) {

}
`,
              tests: [
                { name: "miss on an empty cache returns -1", args: [2, [["get", 42]]], expected: [-1] },
                {
                  name: "evicts the least recently used",
                  args: [2, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2], ["get", 3]]],
                  expected: [1, -1, 3]
                },
                {
                  name: "updating an existing key refreshes it without growing",
                  args: [2, [["put", 1, 1], ["put", 1, 9], ["get", 1], ["put", 2, 2], ["put", 3, 3], ["get", 1]]],
                  expected: [9, -1]
                },
                {
                  name: "capacity of 1",
                  args: [1, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["get", 2]]],
                  expected: [-1, 2]
                }
              ]
            },
            minutes: 45,
            signals: [
              {
                id: "aapl-q1-s1",
                label: "Correct O(1) design: hash map + doubly linked list",
                weight: 3,
                hint: "Map key → node, plus a doubly linked list for recency. Both get and put must move the node to the head in constant time."
              },
              {
                id: "aapl-q1-s2",
                label: "Handled eviction, capacity 0/1, and updating an existing key",
                weight: 3,
                hint: "Updating an existing key must refresh recency without changing size — that's the case most candidates drop."
              },
              {
                id: "aapl-q1-s3",
                label: "Reasoned concretely about allocation and memory layout",
                weight: 3,
                hint: "Pre-allocate a node pool and use indices instead of pointers, so steady-state operation does zero allocation. That answer is what this round is actually testing."
              },
              {
                id: "aapl-q1-s4",
                label: "Discussed thread safety with a real strategy and its cost",
                weight: 2,
                hint: "Name the simple version (one lock) and its ceiling (contention), then a better option: sharded caches keyed by hash, or a lock-free read path."
              },
              {
                id: "aapl-q1-s5",
                label: "Mentioned cache locality / pointer-chasing as a real cost",
                weight: 2,
                hint: "Linked lists pointer-chase and thrash the CPU cache. An array-backed intrusive list keeps nodes contiguous and is measurably faster."
              },
              {
                id: "aapl-q1-s6",
                label: "Went one layer deeper than asked at least once",
                weight: 2,
                hint: "Apple rewards volunteering the next layer down — power cost, page faults, or what happens when the device is under memory pressure and gets jetsammed."
              }
            ],
            strongAnswer:
              "Hash map from key to a doubly-linked-list node; the list keeps recency with head = most recent. get: look up, unlink, push front. put: if present, update value and move to front; else insert and evict the tail when over capacity. Handle capacity 0 and 1 explicitly. The device-constrained version is the real answer: replace heap-allocated nodes with a fixed-size pool indexed by uint32 so steady state does zero allocation and the nodes stay contiguous for cache locality; use intrusive indices instead of pointers. For concurrency, start with a single mutex, name contention as the ceiling, then shard by key hash so writers rarely collide. Be ready to go a layer further — page pressure, jetsam, and why an allocation spike is worse than a slightly higher steady-state footprint."
          }
        ]
      },
      {
        id: "aapl-r2",
        premium: true,
        name: "Project deep dive",
        format: "45–60 min, your past work",
        minutes: 60,
        questions: [
          {
            id: "aapl-q2",
            kind: "domain",
            prompt:
              "Walk me through the most technically demanding thing you've built. I'm going to keep asking why until we run out of road — that's not hostility, it's the format.",
            context:
              "Pick something you personally owned. The interviewer will probe design alternatives, failure handling, and what you'd redo.",
            followUps: [
              "What did you consider and reject, and what would have changed your mind?",
              "What broke in production, and what did you learn from it?",
              "Which part of it are you least proud of?"
            ],
            minutes: 45,
            signals: [
              {
                id: "aapl-q2-s1",
                label: "Chose a project with genuine technical depth you personally owned",
                weight: 3,
                hint: "A CRUD app won't survive five 'why's. Pick the thing where you hit a real constraint — latency, memory, concurrency, hardware."
              },
              {
                id: "aapl-q2-s2",
                label: "Explained the problem and constraints before the solution",
                weight: 2,
                hint: "Two minutes on why this was hard buys you credibility for the next twenty."
              },
              {
                id: "aapl-q2-s3",
                label: "Named alternatives considered and why they were rejected",
                weight: 3,
                hint: "'We used X' is weak; 'we chose X over Y because Y cost us Z under our write load' is what gets scored."
              },
              {
                id: "aapl-q2-s4",
                label: "Stayed accurate at increasing depth instead of bluffing",
                weight: 3,
                hint: "Say 'I don't know, here's how I'd find out' the moment you hit your limit. Apple interviewers respect the boundary and punish the bluff."
              },
              {
                id: "aapl-q2-s5",
                label: "Was honest about failures and what you'd redo",
                weight: 2,
                hint: "Have one real production incident ready, with your specific contribution to the cause and the fix."
              },
              {
                id: "aapl-q2-s6",
                label: "Was precise about what you did versus the team",
                weight: 2,
                hint: "Use 'I' for your work and name teammates for theirs. Overstating gets caught within two follow-ups."
              }
            ],
            strongAnswer:
              "The winning shape is: 2 minutes of problem and constraints, 5 minutes of the design and the specific alternatives you rejected with reasons, then depth on demand — and a clean, unembarrassed 'I don't know, but here's how I'd find out' at the exact point your knowledge ends. Bring one real failure with your own contribution named, and be scrupulous about separating your work from your team's."
          }
        ]
      }
    ]
  },
  {
    id: "6f1c0a20-4d1e-4a5b-9c31-0a1b2c3d4e04",
    company: "OpenAI",
    logoAccent: "from-teal-500/20 to-emerald-500/15",
    role: "Software Engineer",
    level: "IC3/IC4",
    blurb:
      "Unusually practical. Expect to write working code in a real editor with the internet and an AI assistant allowed — the bar is whether you can actually ship, debug, and reason about systems under load, not whether you memorized algorithms.",
    process: [
      "Recruiter screen, then a hiring-manager conversation about what you've shipped.",
      "Practical coding — build or extend something real in your own environment; tools and docs allowed.",
      "Debugging round — you're dropped into unfamiliar code with a failing behavior.",
      "System design with an ML-infrastructure flavor (inference serving, data pipelines, evals).",
      "Values/mission conversation about deployment, safety, and judgment under uncertainty."
    ],
    bar: [
      "Working code that runs, with tests — polish and pragmatism beat elegance.",
      "Debugging methodology: forming a hypothesis and bisecting rather than guessing.",
      "Comfort with ambiguity and with saying what you don't know."
    ],
    pitfalls: [
      "Optimizing prematurely instead of getting a correct version running first.",
      "Ignoring the tooling you're allowed to use — not using available tools reads as rigid.",
      "Treating the mission/safety conversation as a formality to breeze through."
    ],
    rounds: [
      {
        id: "oai-r1",
        name: "Practical coding",
        format: "60–90 min, your editor, internet allowed",
        minutes: 90,
        questions: [
          {
            id: "oai-q1",
            kind: "coding",
            prompt:
              "Build a rate-limited, retrying client for a flaky HTTP API. It must respect a 10 requests/second limit, retry on 429 and 5xx with exponential backoff and jitter, surface a clean error after N attempts, and process a batch of 10,000 URLs concurrently. Tests count.",
            context:
              "Use whatever language, libraries, and tools you like. Getting something working end-to-end early matters more than a perfect abstraction.",
            followUps: [
              "How do you know your rate limiter is actually correct?",
              "What happens if the server sends a Retry-After header?",
              "How would you make this resumable if the process dies at item 7,000?"
            ],
            minutes: 75,
            signals: [
              {
                id: "oai-q1-s1",
                label: "Got a minimal end-to-end version running early, then iterated",
                weight: 3,
                hint: "Ship a naive sequential version in the first 15 minutes, then add concurrency and backoff. Interviewers watch for working-first instinct."
              },
              {
                id: "oai-q1-s2",
                label: "Implemented backoff with jitter, not just exponential doubling",
                weight: 3,
                hint: "Plain exponential backoff synchronizes retries into thundering herds. Use full jitter: sleep = random(0, base * 2^attempt)."
              },
              {
                id: "oai-q1-s3",
                label: "Rate limiter is actually correct under concurrency",
                weight: 3,
                hint: "A token bucket refilled on a timer, with an async semaphore gating acquisition. State how you'd prove it: count requests in a 1s window under a load test."
              },
              {
                id: "oai-q1-s4",
                label: "Respected Retry-After and distinguished retryable from fatal errors",
                weight: 2,
                hint: "429 and 5xx retry; 400/401/404 must fail fast. If Retry-After is present, it overrides your computed backoff."
              },
              {
                id: "oai-q1-s5",
                label: "Wrote tests that would actually catch a regression",
                weight: 3,
                hint: "Fake clock plus a stub server returning scripted 429s. Assert on attempt counts and elapsed spacing rather than on 'it didn't throw'."
              },
              {
                id: "oai-q1-s6",
                label: "Bounded concurrency and handled partial failure of the batch",
                weight: 2,
                hint: "Don't fire 10,000 coroutines at once. Use a worker pool, collect per-item results, and return successes alongside failures instead of aborting everything."
              }
            ],
            strongAnswer:
              "Get a sequential version working in 15 minutes, then layer on: a token-bucket limiter (10 tokens/sec, refilled on a monotonic clock) guarded by an async semaphore; a worker pool of bounded size consuming the URL queue; retry logic that classifies status codes (429/5xx retryable, 4xx fatal), honors Retry-After when present, and otherwise sleeps random(0, base·2^attempt) for full jitter; and a result collector that returns successes and failures separately so one bad URL can't sink the batch. Tests use a fake clock and a scripted stub server, asserting attempt counts and request spacing. Resumability: checkpoint completed URLs to disk/store so a restart skips them."
          }
        ]
      },
      {
        id: "oai-r2",
        premium: true,
        name: "Debugging unfamiliar code",
        format: "45–60 min, live",
        minutes: 60,
        questions: [
          {
            id: "oai-q2",
            kind: "coding",
            prompt:
              "Here's a service that batches inference requests. Under load, p99 latency spikes to 30 seconds even though GPU utilization sits at 40%. The code is unfamiliar to you. Find the problem.",
            context:
              "You can read code, add logging, run it, and ask about the deployment. The methodology is what's being scored.",
            followUps: [
              "What's your first measurement, and why that one?",
              "How would you tell a queueing problem from a slow-dependency problem?",
              "What would you add so this is diagnosable next time without a live debug session?"
            ],
            minutes: 50,
            signals: [
              {
                id: "oai-q2-s1",
                label: "Formed an explicit hypothesis before changing anything",
                weight: 3,
                hint: "Say it out loud: 'Low GPU utilization with high latency means we're waiting, not computing — so I suspect queueing or a lock.' Hypothesis-first is the scored behavior."
              },
              {
                id: "oai-q2-s2",
                label: "Reasoned from the utilization/latency mismatch specifically",
                weight: 3,
                hint: "40% utilization plus 30s p99 rules out raw compute. That pairing points to batching waits, head-of-line blocking, or lock contention."
              },
              {
                id: "oai-q2-s3",
                label: "Measured before guessing — asked for timings at each stage",
                weight: 3,
                hint: "Instrument queue wait vs. batch-formation wait vs. GPU time. Where the time actually goes ends the debate in one measurement."
              },
              {
                id: "oai-q2-s4",
                label: "Considered batching dynamics (timeout too high, batch too large)",
                weight: 2,
                hint: "A batch window waiting for a full batch under uneven traffic makes short requests wait behind a timeout. Check the max-wait and max-batch-size settings."
              },
              {
                id: "oai-q2-s5",
                label: "Checked tail-specific causes rather than averages",
                weight: 2,
                hint: "p99 problems are often one slow shard, a GC pause, or a single lock. Look at the distribution, not the mean."
              },
              {
                id: "oai-q2-s6",
                label: "Proposed durable observability, not just a one-off fix",
                weight: 2,
                hint: "Add per-stage histograms and a queue-depth gauge so the next incident is a dashboard lookup instead of a debugging session."
              }
            ],
            strongAnswer:
              "Start from the mismatch: 40% GPU utilization with 30s p99 means time is spent waiting, not computing. Hypotheses in order: (1) batch formation waiting on a max-wait timeout under bursty traffic, (2) head-of-line blocking from one oversized request, (3) lock contention or a single-threaded scheduler, (4) a slow non-GPU dependency (tokenizer, storage). Measure before touching code: per-stage timing — enqueue → batch formed → GPU start → GPU end → response — plus queue depth. That single measurement discriminates all four. Fix follows the data (typically lower max-wait, cap batch size, or split queues by request size). Leave behind per-stage histograms and a queue-depth gauge so it's diagnosable from a dashboard next time."
          }
        ]
      },
      {
        id: "oai-r3",
        premium: true,
        name: "Mission & judgment",
        format: "45 min, conversational",
        minutes: 45,
        questions: [
          {
            id: "oai-q3",
            kind: "behavioral",
            prompt:
              "You're about to ship a feature that measurably improves the product for most users, but you've found a plausible way it could be misused to cause real harm to a small group. The launch is in three days. Walk me through your thinking.",
            context:
              "There's no scripted right answer. They're evaluating how you reason under uncertainty and whether you take the harm seriously without being paralyzed.",
            followUps: [
              "What would change your decision in either direction?",
              "Who do you bring into the decision, and when?",
              "How do you handle it if leadership disagrees with you?"
            ],
            minutes: 30,
            signals: [
              {
                id: "oai-q3-s1",
                label: "Tried to quantify severity, likelihood, and reversibility",
                weight: 3,
                hint: "Structure beats sentiment: how bad, how likely, how reversible, and how many people. Irreversible harm deserves a different response than recoverable harm."
              },
              {
                id: "oai-q3-s2",
                label: "Looked for options beyond ship/don't-ship",
                weight: 3,
                hint: "Staged rollout, feature flag, rate limits, monitoring with a rollback trigger, or shipping to a lower-risk cohort first. Binary thinking scores poorly."
              },
              {
                id: "oai-q3-s3",
                label: "Named who else should be involved and escalated appropriately",
                weight: 2,
                hint: "Say it plainly: this isn't a solo call. Loop in the people who own policy/safety and your manager — early, with a written summary."
              },
              {
                id: "oai-q3-s4",
                label: "Took the harm seriously without moral grandstanding",
                weight: 2,
                hint: "Avoid both extremes: 'ship it, not my problem' and 'nothing may ever ship'. Show you weigh real user benefit against real risk."
              },
              {
                id: "oai-q3-s5",
                label: "Committed to a decision and stated what would reverse it",
                weight: 3,
                hint: "End with an actual call plus tripwires: 'I'd ship behind a flag to 5%, with these two metrics as automatic rollback triggers.'"
              }
            ],
            strongAnswer:
              "Strong answers structure the risk (severity × likelihood × reversibility × affected population), then refuse the false binary — proposing staged rollout, flags, rate limits, or a restricted cohort with monitoring and predefined rollback tripwires. They escalate to the people who own that risk rather than deciding alone, they take the harm seriously without theatrics, and they land on a concrete decision plus the specific evidence that would reverse it. Paralysis and dismissiveness both score badly; judgment under uncertainty is the thing being measured."
          }
        ]
      }
    ]
  },
  {
    id: "6f1c0a20-4d1e-4a5b-9c31-0a1b2c3d4e05",
    company: "Anthropic",
    logoAccent: "from-amber-500/20 to-orange-500/15",
    role: "Software Engineer",
    level: "IC3/IC4",
    blurb:
      "Practical and values-forward. Anthropic leans on realistic work-sample style problems, clear written and verbal communication, and genuine engagement with safety — expect to be asked what you think, not what you've memorized.",
    process: [
      "Recruiter screen, focused on what you've actually built and why Anthropic.",
      "Technical screen — practical coding, tools allowed, closer to real work than to puzzles.",
      "Take-home or extended practical exercise in some tracks.",
      "Onsite: coding, systems/ML infrastructure, and a deep values-and-judgment conversation.",
      "Team and manager conversations; communication quality is weighted heavily throughout."
    ],
    bar: [
      "Code that a colleague could read and maintain — naming, structure, and tests matter.",
      "Clear written and spoken explanation; they hire people who can think in writing.",
      "Substantive engagement with safety rather than rehearsed talking points."
    ],
    pitfalls: [
      "Treating the safety conversation as a compliance box — shallow answers are obvious.",
      "Writing clever, dense code instead of readable code.",
      "Not asking questions; they want to see collaboration, not a solo performance."
    ],
    rounds: [
      {
        id: "ant-r1",
        name: "Practical coding",
        format: "60 min, your editor, tools allowed",
        minutes: 60,
        questions: [
          {
            id: "ant-q1",
            kind: "coding",
            prompt:
              "Implement a streaming token-budget manager for a chat application. It tracks tokens across a multi-turn conversation, evicts old turns when approaching a context limit, always preserves the system prompt and the most recent user message, and reports what it dropped. Write it as if a teammate will maintain it.",
            context:
              "Assume a token-counting function is provided. Readability and tests are explicitly part of the evaluation.",
            followUps: [
              "How would you handle a single message that alone exceeds the budget?",
              "What's your eviction policy, and what does it cost the user?",
              "How would you test this without a real tokenizer?"
            ],
            coding: {
              language: "javascript",
              functionName: "fitToBudget",
              weight: 6,
              starterCode: `/**
 * Tokens are whitespace-separated words here, so tests stay readable.
 * Never drop the system prompt or the most recent user turn.
 * Evict oldest-first until the conversation fits.
 *
 * @param {Array<{id: string, role: "system"|"user"|"assistant", text: string}>} turns
 * @param {number} budget  max total tokens
 * @returns {{kept: string[], dropped: string[]}}  ids, in original order
 */
function fitToBudget(turns, budget) {

}
`,
              tests: [
                {
                  name: "everything fits, nothing dropped",
                  args: [
                    [
                      { id: "sys", role: "system", text: "a b" },
                      { id: "u1", role: "user", text: "c d" },
                      { id: "a1", role: "assistant", text: "e f" },
                      { id: "u2", role: "user", text: "g h" }
                    ],
                    100
                  ],
                  expected: { kept: ["sys", "u1", "a1", "u2"], dropped: [] }
                },
                {
                  name: "drops the oldest droppable turn first",
                  args: [
                    [
                      { id: "sys", role: "system", text: "a b" },
                      { id: "u1", role: "user", text: "c d" },
                      { id: "a1", role: "assistant", text: "e f" },
                      { id: "u2", role: "user", text: "g h" }
                    ],
                    6
                  ],
                  expected: { kept: ["sys", "a1", "u2"], dropped: ["u1"] }
                },
                {
                  name: "system prompt and latest user turn survive",
                  args: [
                    [
                      { id: "sys", role: "system", text: "a b" },
                      { id: "u1", role: "user", text: "c d" },
                      { id: "a1", role: "assistant", text: "e f" },
                      { id: "u2", role: "user", text: "g h" }
                    ],
                    4
                  ],
                  expected: { kept: ["sys", "u2"], dropped: ["u1", "a1"] }
                }
              ]
            },
            minutes: 50,
            signals: [
              {
                id: "ant-q1-s1",
                label: "Code is genuinely readable — clear names, small functions, obvious flow",
                weight: 3,
                hint: "Anthropic weights maintainability heavily. Prefer an obvious 20-line function over a clever 8-line one; name things for what they mean."
              },
              {
                id: "ant-q1-s2",
                label: "Preserved invariants explicitly (system prompt + latest user message never dropped)",
                weight: 3,
                hint: "Encode the invariant in code and assert it, rather than relying on the eviction order happening to preserve it."
              },
              {
                id: "ant-q1-s3",
                label: "Handled the pathological case: one message larger than the whole budget",
                weight: 3,
                hint: "Decide and state it: truncate with a marker, or fail loudly. Silently returning an over-budget context is the bug that reaches production."
              },
              {
                id: "ant-q1-s4",
                label: "Made the eviction policy explicit and justified its user cost",
                weight: 2,
                hint: "Oldest-first is fine — but say what the user loses (early context) and consider summarizing dropped turns instead of hard-deleting."
              },
              {
                id: "ant-q1-s5",
                label: "Reported what was dropped rather than silently discarding",
                weight: 2,
                hint: "Return a structured result: kept turns, dropped turns, token totals. Silent data loss is exactly what the prompt is testing."
              },
              {
                id: "ant-q1-s6",
                label: "Wrote tests with an injected fake token counter",
                weight: 3,
                hint: "Take the counter as a parameter so tests can use len(text.split()). Cover: fits exactly, one over, giant single message, only a system prompt."
              }
            ],
            strongAnswer:
              "Take the token counter as an injected dependency. Model the conversation as an ordered list of turns with roles. Compute the total; while over budget, evict from the oldest non-protected turn forward, where protected = system prompt + most recent user message. Assert the invariant after eviction rather than trusting ordering. Handle the pathological single-oversize message explicitly — truncate with a visible marker or raise, but never silently return an over-budget context. Return a structured result reporting kept turns, dropped turns, and token counts so callers can surface it. Tests inject a trivial word-count tokenizer and cover exact-fit, one-over, oversize-single-message, and system-prompt-only cases."
          }
        ]
      },
      {
        id: "ant-r2",
        premium: true,
        name: "Systems & ML infrastructure",
        format: "45–60 min, design discussion",
        minutes: 60,
        questions: [
          {
            id: "ant-q2",
            kind: "system-design",
            prompt:
              "Design an evaluation harness that runs 500 behavioral tests against every model checkpoint, produces a comparable score over time, and tells a researcher within an hour whether a checkpoint regressed.",
            context:
              "Some evals are deterministic; others need model-graded or human judgment. Results must stay comparable across months of checkpoints.",
            followUps: [
              "How do you keep scores comparable when an eval's grading prompt changes?",
              "How do you separate real regressions from sampling noise?",
              "What do you do about evals that saturate at 100%?"
            ],
            minutes: 50,
            signals: [
              {
                id: "ant-q2-s1",
                label: "Versioned the evals themselves, not just the checkpoints",
                weight: 3,
                hint: "An eval is code plus prompts plus grader — version all three and record the version with every result, or your time series silently lies."
              },
              {
                id: "ant-q2-s2",
                label: "Addressed noise with repeated sampling and confidence intervals",
                weight: 3,
                hint: "Single-sample scores bounce. Run n samples per item, report a mean with a CI, and only alert when the change clears the interval."
              },
              {
                id: "ant-q2-s3",
                label: "Handled model-graded evals and their reliability problem",
                weight: 2,
                hint: "Pin the grader model version, spot-check against human labels, and track grader drift — otherwise a grader change looks like a model change."
              },
              {
                id: "ant-q2-s4",
                label: "Designed for the one-hour latency target concretely",
                weight: 2,
                hint: "Parallelize across items, cache deterministic results by (eval version, checkpoint, item), and run a fast smoke subset first for early signal."
              },
              {
                id: "ant-q2-s5",
                label: "Made results reproducible and auditable",
                weight: 3,
                hint: "Store raw generations, not just scores. When a number looks wrong six weeks later, the raw outputs are the only way to settle it."
              },
              {
                id: "ant-q2-s6",
                label: "Noticed saturation/Goodharting as a real measurement risk",
                weight: 2,
                hint: "Saturated evals stop carrying signal and start getting optimized against. Retire them, or hold out a private slice."
              }
            ],
            strongAnswer:
              "Treat the eval suite as versioned artifacts: eval code, prompt, and grader each carry a version recorded with every result, so a time series is only ever compared within a version. Run n samples per item and report means with confidence intervals so noise doesn't masquerade as regression; alert only when a delta clears the interval. Model-graded evals pin the grader version and get periodically calibrated against human labels to catch grader drift. Hit the one-hour target with per-item parallelism, caching keyed by (eval version, checkpoint, item), and a fast smoke subset that reports early. Persist raw generations, not just scores, because reproducing a suspicious number later is impossible otherwise. Finally, track saturation — an eval sitting at 100% carries no signal and invites Goodharting, so retire it or keep a private held-out slice."
          }
        ]
      },
      {
        id: "ant-r3",
        premium: true,
        name: "Values & judgment",
        format: "45 min, conversational",
        minutes: 45,
        questions: [
          {
            id: "ant-q3",
            kind: "behavioral",
            prompt:
              "What's a way you think AI safety work could be getting something wrong, or a place where you disagree with a common position in the field? Be honest — I'd rather hear a real opinion than a safe one.",
            context:
              "This isn't a loyalty test. They're evaluating whether you reason independently and can hold uncertainty without either dismissing risk or catastrophizing.",
            followUps: [
              "What evidence would change your mind?",
              "What's the strongest argument against your position?",
              "How would you act on this if you joined and nobody agreed with you?"
            ],
            minutes: 30,
            signals: [
              {
                id: "ant-q3-s1",
                label: "Offered a real, specific position instead of a safe non-answer",
                weight: 3,
                hint: "Generic agreement scores as low engagement. Take an actual position you can defend, even a modest one."
              },
              {
                id: "ant-q3-s2",
                label: "Showed familiarity with the actual arguments, not headlines",
                weight: 3,
                hint: "Reference concrete work or concepts — interpretability limits, eval validity, RLHF failure modes — rather than press-level framing."
              },
              {
                id: "ant-q3-s3",
                label: "Steelmanned the opposing view",
                weight: 3,
                hint: "State the strongest counterargument before being asked. It's the clearest signal of genuine engagement."
              },
              {
                id: "ant-q3-s4",
                label: "Named what evidence would change your mind",
                weight: 2,
                hint: "Falsifiability is the point: 'If X were demonstrated, I'd drop this view.' Unfalsifiable opinions read as identity, not reasoning."
              },
              {
                id: "ant-q3-s5",
                label: "Held uncertainty calibrated — neither dismissive nor apocalyptic",
                weight: 2,
                hint: "Say how confident you are and why. Overclaiming in either direction is the most common failure in this round."
              },
              {
                id: "ant-q3-s6",
                label: "Described acting constructively inside a team that disagrees",
                weight: 2,
                hint: "'I'd write up the argument, seek disconfirming evidence, and commit to the team's direction while tracking my prediction' — disagreement plus commitment."
              }
            ],
            strongAnswer:
              "The shape that scores well: a specific, defensible position grounded in actual arguments from the field; an unprompted steelman of the opposing view; explicit falsification conditions ('this evidence would change my mind'); calibrated confidence stated out loud; and a constructive plan for holding a minority view inside a team — write it up, seek disconfirming evidence, commit to the team's direction while tracking whether your prediction holds. The failure modes are a safe non-answer, headline-level familiarity, and confident claims in either direction that nothing could falsify."
          }
        ]
      }
    ]
  }
];

export function getCompanyInterview(id: string) {
  return companyInterviews.find((interview) => interview.id === id) ?? null;
}

export function interviewTotalMinutes(interview: CompanyInterview) {
  return interview.rounds.reduce((sum, round) => sum + round.minutes, 0);
}

export function interviewQuestions(interview: CompanyInterview) {
  return interview.rounds.flatMap((round) => round.questions);
}
