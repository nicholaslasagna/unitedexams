import type { InterviewQuestion } from "@/data/seed/interviews";

/**
 * Additional questions per round — the pool each round draws from.
 *
 * A round's questions are a BANK, not a script. Real loops keep a pool and
 * an interviewer will not re-ask a question of a returning candidate, so a
 * retake here has to be a different interview. Everything in this file
 * exists so that is true: lib/interviews/select-questions.ts rotates through
 * the bank by attempt number, and the practice mode walks all of it.
 *
 * Questions are original, written in each company's publicly documented
 * interview style. The algorithmic ones are standard computer-science
 * exercises (sliding windows, interval merging, LRU eviction) framed in that
 * company's problem domain. Nothing here is a leaked or proprietary prompt.
 *
 * Every `coding` workspace's tests are verified against a reference solution
 * before shipping — see features/interviews/content.test.ts, which fails if a
 * fixture is unsolvable or self-contradictory.
 */
export interface RoundBank {
  /** How many of this round's questions one sitting serves. */
  questionsPerAttempt: number;
  /** Appended to the round's existing questions. */
  extra: InterviewQuestion[];
}

export const ROUND_BANKS: Record<string, RoundBank> = {
  "goog-r2": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "goog-q2b",
        kind: "system-design",
        prompt:
          "Design the backend for a global photo-sharing feed. A user opens the app and sees a ranked feed of photos from accounts they follow. Start wherever you like.",
        context:
          "Hundreds of millions of daily users. Some accounts have tens of millions of followers. Reads vastly outnumber writes.",
        followUps: [
          "How do you handle an account with 40 million followers on your write path?",
          "What does the feed look like the instant after someone posts?",
          "Where does ranking happen, and what does that cost you?"
        ],
        minutes: 45,
        signals: [
          {
            id: "goog-q2b-s1",
            label: "Established scale and read/write ratio before drawing anything",
            weight: 3,
            hint: "Ask for daily actives, posts per day and reads per post. Every later decision follows from that ratio, and designing before you have it is the most common failure."
          },
          {
            id: "goog-q2b-s2",
            label: "Named fan-out-on-write versus fan-out-on-read and picked per case",
            weight: 3,
            hint: "Say both, then split: precompute feeds for ordinary accounts, query at read time for celebrity accounts. A single global choice is the wrong answer here."
          },
          {
            id: "goog-q2b-s3",
            label: "Solved the celebrity problem explicitly rather than hoping",
            weight: 3,
            hint: "Forty million writes per post will not work. Say the hybrid out loud: their posts are merged in at read time from a small hot set."
          },
          {
            id: "goog-q2b-s4",
            label: "Separated metadata storage from blob storage",
            weight: 2,
            hint: "Photos go to object storage behind a CDN; the database holds ids and metadata. Storing blobs in the primary database is the fastest way to lose the round."
          },
          {
            id: "goog-q2b-s5",
            label: "Stated a consistency model rather than assuming strong consistency",
            weight: 2,
            hint: "Feeds tolerate eventual consistency of a few seconds. Say the bound and say what the user sees during it."
          },
          {
            id: "goog-q2b-s6",
            label: "Named what you would monitor and what breaks first under load",
            weight: 2,
            hint: "Feed build latency at p99 and fan-out queue depth. Naming the first thing to break shows operational experience, which is what this round is looking for."
          }
        ],
        strongAnswer:
          "Open by pinning scale: daily actives, posts per day, reads per post — the read/write ratio decides everything after. Split storage: photos to object storage behind a CDN, metadata and the social graph in a partitioned store. Feeds are hybrid by design. For ordinary accounts, fan out on write into per-user feed lists so a read is a single range scan. For accounts with millions of followers, fanning out on write is impossible, so their posts stay in a small hot set that is merged in at read time and ranked with the precomputed portion. Ranking runs on the merged candidate set at read time with features cached, because re-ranking every stored feed on every model change is not affordable. Consistency is eventual with a bound of a few seconds, and you should say what a user sees inside that window. Under load the first things to go are feed build p99 and fan-out queue depth, so those are what you alert on."
      },
      {
        id: "goog-q2c",
        kind: "system-design",
        prompt:
          "Design a distributed rate limiter that every service in the company calls before handling a request. It must enforce per-customer quotas across hundreds of machines.",
        context:
          "Roughly a million checks per second. A check must add under a millisecond to request latency. Quotas are per customer per minute.",
        followUps: [
          "What happens when the limiter itself is unavailable?",
          "How much over-admission are you willing to accept, and why?",
          "How do you handle one customer whose traffic is a hundred times everyone else's?"
        ],
        minutes: 45,
        signals: [
          {
            id: "goog-q2c-s1",
            label: "Asked whether the limit is strict or approximate before designing",
            weight: 3,
            hint: "A strict global count needs coordination on every request; an approximate one does not. This single question changes the entire architecture, so ask it first."
          },
          {
            id: "goog-q2c-s2",
            label: "Named a concrete algorithm rather than saying 'a counter'",
            weight: 3,
            hint: "Token bucket or sliding window log or sliding window counter — name one and say what it costs. 'A counter in Redis' with no window semantics is not an answer."
          },
          {
            id: "goog-q2c-s3",
            label: "Kept the hot path local, syncing asynchronously",
            weight: 3,
            hint: "A network round trip per request cannot fit in a millisecond budget at a million QPS. Local buckets topped up from a central authority is the shape that works."
          },
          {
            id: "goog-q2c-s4",
            label: "Chose a failure mode deliberately and justified it",
            weight: 3,
            hint: "Fail open and you can be overwhelmed; fail closed and an outage in the limiter takes down every service. Say which, and say what the blast radius is."
          },
          {
            id: "goog-q2c-s5",
            label: "Quantified the over-admission the design allows",
            weight: 2,
            hint: "With n machines holding local buckets you can over-admit by up to n times the refill granularity. Give the number rather than waving at it."
          },
          {
            id: "goog-q2c-s6",
            label: "Handled the hot-key customer without hand-waving",
            weight: 2,
            hint: "Shard that customer's quota across the machines actually serving them, or give them a dedicated partition. Say how you detect them in the first place."
          }
        ],
        strongAnswer:
          "Ask first whether the limit must be strictly enforced or may be approximate, because a hard global count requires coordination on every request and an approximate one does not — nothing else can be decided before that. Assume approximate. Each machine keeps a local token bucket per customer and leases capacity from a central authority in chunks, refilling asynchronously, so the hot path is memory-local and easily inside a millisecond; a network round trip per request cannot meet that budget at a million QPS. Say the cost explicitly: with n machines you can over-admit by roughly n times the lease granularity, which is the price of not coordinating. Choose the failure mode out loud — fail open, because a limiter outage taking down every service in the company is a far worse incident than briefly admitting excess traffic — and cap the damage with a conservative local fallback. Detect hot customers from the lease traffic itself and give them either a sharded quota across the machines serving them or a dedicated partition."
      }
    ]
  },

  "goog-r3": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "goog-q3b",
        kind: "behavioral",
        prompt:
          "Tell me about a time you disagreed with a decision your team had already committed to. What did you do?",
        context:
          "The interviewer is listening for how you handle being outvoted, not whether you were right.",
        followUps: [
          "What did you do once the decision went against you?",
          "How did the relationship with that person look six months later?",
          "Knowing the outcome, would you argue it differently now?"
        ],
        minutes: 15,
        signals: [
          {
            id: "goog-q3b-s1",
            label: "Used a clear structure: situation, what you did, what happened",
            weight: 3,
            hint: "Google scores structured answers. Two sentences of context, then mostly what you personally did, then a concrete outcome."
          },
          {
            id: "goog-q3b-s2",
            label: "Made the disagreement about evidence rather than preference",
            weight: 3,
            hint: "Say what data you brought. 'I thought it was wrong' is an opinion; 'our p99 had regressed 40% in the last two similar migrations' is an argument."
          },
          {
            id: "goog-q3b-s3",
            label: "Committed properly once the decision stood",
            weight: 3,
            hint: "The signal is disagree-and-commit. Describe the work you did to make the chosen path succeed even though it was not yours."
          },
          {
            id: "goog-q3b-s4",
            label: "Said 'I' about your own actions and 'we' about the team's",
            weight: 2,
            hint: "Interviewers cannot score a story with no visible individual contribution. Be precise about which parts were yours."
          },
          {
            id: "goog-q3b-s5",
            label: "Gave a real outcome, including if you turned out to be wrong",
            weight: 2,
            hint: "Being wrong and saying so scores better than a story where you were right about everything."
          },
          {
            id: "goog-q3b-s6",
            label: "Kept it under three minutes",
            weight: 2,
            hint: "Long answers eat the round and leave no time for follow-ups. Land the arc in about two minutes and let them dig."
          }
        ],
        strongAnswer:
          "Pick a real disagreement with a concrete technical stake. Give two sentences of context — what was decided and why it mattered — then spend most of the answer on what you did: the evidence you gathered, who you took it to, and how you framed it as a tradeoff rather than a verdict. Then say what happened when the decision still went the other way, because that is the actual signal: how you made the chosen path work anyway, and what you did to keep the working relationship intact. Close with the outcome and what you would do differently, and if you turned out to be wrong, say so plainly — that reads as far more credible than a story where you were right about everything. Keep it near two minutes so there is room for their follow-ups."
      },
      {
        id: "goog-q3c",
        kind: "behavioral",
        prompt:
          "Describe something you built or changed that failed. What happened, and what did you do about it?",
        context:
          "They are testing whether you can hold responsibility without either deflecting it or performing guilt.",
        followUps: [
          "What did you personally miss that you would catch now?",
          "How did you find out it had failed?",
          "What did you change so the same class of failure could not recur?"
        ],
        minutes: 15,
        signals: [
          {
            id: "goog-q3c-s1",
            label: "Picked a real failure with real consequences",
            weight: 3,
            hint: "A story where nothing bad actually happened is not a failure story. Choose one that cost something, and say what it cost."
          },
          {
            id: "goog-q3c-s2",
            label: "Owned your part without blaming the team or the process",
            weight: 3,
            hint: "Name what you missed. Deflecting onto a bad spec or a rushed timeline is the answer this question is designed to catch."
          },
          {
            id: "goog-q3c-s3",
            label: "Described how the failure was detected and how long that took",
            weight: 3,
            hint: "Time to detection says more about your engineering than the bug did. If a user reported it, say that plainly."
          },
          {
            id: "goog-q3c-s4",
            label: "Fixed the class of problem, not just the instance",
            weight: 3,
            hint: "A test, an alert, a type, a review gate. 'I was more careful afterwards' is not a change to the system."
          },
          {
            id: "goog-q3c-s5",
            label: "Avoided performing guilt",
            weight: 2,
            hint: "Say what happened and what changed. Extended self-criticism reads as unreliable, not as accountable."
          },
          {
            id: "goog-q3c-s6",
            label: "Named what you would now check earlier",
            weight: 2,
            hint: "End on the transferable lesson in one sentence, not a list of five."
          }
        ],
        strongAnswer:
          "Choose a failure that genuinely cost something — data, revenue, trust, a weekend — because a story with no consequence does not answer the question. Set it up briefly, then say what you personally missed, in specific terms, without routing the blame to a bad spec or a tight deadline. Cover detection honestly: how you found out and how long it took, since time to detection reveals more about your engineering than the original mistake. Then the part that actually scores: what you changed so that class of failure could not recur — a regression test, an alert with a real threshold, a type that makes the state unrepresentable, a review gate. Close with one transferable sentence about what you now check earlier. Say it evenly; extended self-criticism reads as unreliable rather than accountable."
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // APPLE — correctness and memory discipline
  // ────────────────────────────────────────────────────────────────
  "aapl-r1": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "aapl-q1b",
        kind: "coding",
        prompt:
          "Write a comparator for software version strings. Return -1, 0 or 1 for a before, equal to, or after b. Assume dot-separated numeric components only, but be careful about what 'equal' means.",
        context:
          "Real inputs include '1.0' against '1', '1.01' against '1.1', and components with different counts. This ships in an updater, so a wrong answer means a device installs the wrong build.",
        followUps: [
          "Which of your test cases would a naive string compare get wrong?",
          "How would you extend it to pre-release suffixes like 1.2.0-beta.3?",
          "How do you keep this from overflowing on a component with 30 digits?"
        ],
        coding: {
          language: "javascript",
          functionName: "compareVersions",
          weight: 6,
          starterCode: `/**
 * @param {string} a  dot-separated numeric version, e.g. "1.2.10"
 * @param {string} b
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
  // Say what "equal" means here before you write anything.
}
`,
          tests: [
            { name: "identical strings", args: ["1.2.3", "1.2.3"], expected: 0 },
            { name: "missing components count as zero", args: ["1.0", "1"], expected: 0 },
            { name: "trailing zeros do not make it newer", args: ["1.0.0", "1"], expected: 0 },
            { name: "numeric, not lexicographic: 1.10 is after 1.2", args: ["1.2", "1.10"], expected: -1 },
            { name: "leading zeros are not significant", args: ["1.01", "1.1"], expected: 0 },
            { name: "a later major beats a longer minor", args: ["2.0", "1.9.9"], expected: 1 },
            { name: "an extra non-zero component is newer", args: ["1.0.1", "1.0"], expected: 1 },
            { name: "single components compare too", args: ["3", "10"], expected: -1 }
          ]
        },
        minutes: 25,
        signals: [
          {
            id: "aapl-q1b-s1",
            label: "Defined 'equal' explicitly before coding — 1.0 vs 1",
            weight: 3,
            hint: "Say out loud that missing trailing components are zero, so '1.0' and '1' are equal. Apple rounds hinge on the definition, not the loop."
          },
          {
            id: "aapl-q1b-s2",
            label: "Compared components numerically, never as strings",
            weight: 3,
            hint: "'1.10' vs '1.2': lexicographically '10' < '2'. Parse each component to a number. This is the whole point of the question."
          },
          {
            id: "aapl-q1b-s3",
            label: "Walked to the longer length, treating absent components as zero",
            weight: 3,
            hint: "Loop to max(a.length, b.length) and default missing entries to 0. Bailing at the shorter length silently declares '1.0.1' equal to '1.0'."
          },
          {
            id: "aapl-q1b-s4",
            label: "Returned a normalised -1/0/1 rather than a raw difference",
            weight: 2,
            hint: "Callers use this in sorts and equality checks. Returning a - b leaks magnitudes and invites someone to test === 1."
          },
          {
            id: "aapl-q1b-s5",
            label: "Raised the consequence of getting it wrong in shipped software",
            weight: 2,
            hint: "Say what breaks: a bad comparator means a device downgrades or skips an update. Apple's bar is correctness under consequences."
          },
          {
            id: "aapl-q1b-s6",
            label: "Named overflow or precision on very long components",
            weight: 2,
            hint: "A 30-digit component exceeds safe integer range. Say you would compare digit strings after stripping leading zeros, or use BigInt."
          }
        ],
        strongAnswer:
          "Start by defining equality: components are numeric, missing trailing components are zero, so '1.0', '1' and '1.0.0' are all equal, and '1.01' equals '1.1'. Split both on '.', walk to the longer of the two lengths, default missing entries to zero, parse each component as a number and return -1 or 1 at the first difference; if the loop finishes, return 0. Never compare as strings — '1.10' against '1.2' is exactly where that fails. Normalise the return to -1/0/1 rather than a raw difference, because callers use it for equality as well as ordering. Say the stakes out loud: this decides whether a device installs a build, so the edge cases are the feature. For enormous components, parseInt loses precision beyond the safe integer range, so compare zero-stripped digit strings by length then lexicographically, or use BigInt."
      },
      {
        id: "aapl-q1c",
        kind: "coding",
        prompt:
          "Implement a fixed-capacity ring buffer that keeps only the most recent entries. Given a capacity and a sequence of values pushed in order, return the buffer's final contents from oldest to newest.",
        context:
          "This backs a crash log that must never grow. Capacity is fixed at construction and the buffer overwrites the oldest entry when full.",
        followUps: [
          "What's the memory profile of your implementation over a million pushes?",
          "How would you make reads safe while another thread is writing?",
          "What changes if entries are variable-size byte blobs rather than fixed slots?"
        ],
        coding: {
          language: "javascript",
          functionName: "ringBufferContents",
          weight: 6,
          starterCode: `/**
 * @param {number} capacity  maximum entries retained
 * @param {any[]} pushes     values pushed, in order
 * @returns {any[]} final contents, oldest first
 */
function ringBufferContents(capacity, pushes) {
  // Watch the memory: the point is that this never grows past capacity.
}
`,
          tests: [
            { name: "nothing pushed", args: [3, []], expected: [] },
            { name: "under capacity keeps insertion order", args: [3, [1, 2]], expected: [1, 2] },
            { name: "exactly at capacity", args: [3, [1, 2, 3]], expected: [1, 2, 3] },
            { name: "overwrites the oldest once full", args: [3, [1, 2, 3, 4, 5]], expected: [3, 4, 5] },
            { name: "capacity of one keeps only the last", args: [1, [1, 2, 3]], expected: [3] },
            { name: "capacity of zero keeps nothing", args: [0, [1, 2]], expected: [] },
            { name: "wraps more than once", args: [2, [1, 2, 3, 4, 5, 6, 7]], expected: [6, 7] }
          ]
        },
        minutes: 25,
        signals: [
          {
            id: "aapl-q1c-s1",
            label: "Asked what happens at capacity zero and at capacity one",
            weight: 3,
            hint: "Both are real configurations and both are where ring buffers break. Ask before coding rather than discovering it in a test."
          },
          {
            id: "aapl-q1c-s2",
            label: "Allocated once and wrote by index rather than shifting an array",
            weight: 3,
            hint: "shift() on every push is O(n) per push and re-allocates. A fixed array with a write index modulo capacity is the point of the structure."
          },
          {
            id: "aapl-q1c-s3",
            label: "Reconstructed oldest-to-newest correctly after wrapping",
            weight: 3,
            hint: "Once wrapped, the oldest entry sits at the write index, not at 0. Rotating from the wrong origin is the classic ring buffer bug."
          },
          {
            id: "aapl-q1c-s4",
            label: "Stated the memory guarantee explicitly",
            weight: 2,
            hint: "Say 'O(capacity) memory regardless of how many pushes arrive' — that guarantee is the reason this structure was chosen."
          },
          {
            id: "aapl-q1c-s5",
            label: "Dry-ran a double wrap by hand",
            weight: 2,
            hint: "Push seven values into a buffer of two and trace the indices. One wrap can pass by luck; two cannot."
          },
          {
            id: "aapl-q1c-s6",
            label: "Answered the concurrency follow-up concretely",
            weight: 2,
            hint: "Single producer and single consumer with separate head and tail indices needs no lock if the indices are published atomically. Say which model you are assuming."
          }
        ],
        strongAnswer:
          "Ask about capacity zero and one first — both are legal and both are where this breaks. Allocate an array of exactly capacity once and keep a write index plus a count; each push writes at write % capacity and advances, so memory is O(capacity) no matter how many pushes arrive, which is the entire reason for the structure. Never use shift(), which is linear per push. To read out oldest-first, start from the write index when the buffer has wrapped and from zero when it has not, then take count entries with modular indexing. Capacity zero keeps nothing and must not divide by zero. Trace a double wrap by hand before declaring done. For concurrency, a single-producer single-consumer ring needs no lock if head and tail are published atomically; anything else needs real synchronisation."
      }
    ]
  },

  "meta-r2": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "meta-q2b",
        kind: "system-design",
        prompt:
          "Design group messaging for a billion users. Messages must arrive fast, in order within a conversation, and survive a phone being offline for a week.",
        context:
          "Groups go up to a few thousand members. Delivery latency matters more than storage cost. Assume clients are unreliable and frequently offline.",
        followUps: [
          "What guarantees ordering within a conversation across devices?",
          "How does a phone that was offline for a week catch up without downloading everything?",
          "Where do you store messages, and for how long?"
        ],
        minutes: 45,
        signals: [
          {
            id: "meta-q2b-s1",
            label: "Separated the fan-out path from the durable log",
            weight: 3,
            hint: "Write once to a per-conversation log, then fan out delivery pointers. Copying the message body per recipient is what stops this scaling."
          },
          {
            id: "meta-q2b-s2",
            label: "Made ordering explicit with a per-conversation sequence number",
            weight: 3,
            hint: "Wall-clock timestamps from clients do not order anything. A monotonic per-conversation sequence assigned server side is the answer."
          },
          {
            id: "meta-q2b-s3",
            label: "Designed catch-up as a cursor, not a full sync",
            weight: 3,
            hint: "Each device keeps its last acknowledged sequence and asks for what came after. Re-downloading the conversation is the naive answer they are probing for."
          },
          {
            id: "meta-q2b-s4",
            label: "Handled multiple devices per account with independent cursors",
            weight: 2,
            hint: "Read state is per device, not per user. Say it, because forgetting it means messages are marked read on a phone that never saw them."
          },
          {
            id: "meta-q2b-s5",
            label: "Addressed large groups without per-member fan-out at write time",
            weight: 2,
            hint: "For a few thousand members, fan out delivery notifications, not message copies, and let each device pull from the shared log."
          },
          {
            id: "meta-q2b-s6",
            label: "Stated retention and what deletion actually means",
            weight: 2,
            hint: "Say how long the log is kept and whether a delete is a tombstone or a real erase. Vagueness here is what the follow-up is for."
          }
        ],
        strongAnswer:
          "Write the message once into a durable per-conversation log with a server-assigned monotonic sequence number — client clocks cannot order anything and every ordering question later resolves to that sequence. Delivery then fans out pointers rather than message bodies, so a three-thousand-member group costs three thousand small notifications, not three thousand copies. Each device, not each user, keeps a cursor of the last sequence it acknowledged; catch-up after a week offline is a range read from that cursor, which is what keeps a returning phone from downloading the entire conversation. Per-device cursors also stop a message being marked read on a device that never displayed it. Recent history stays in a fast store and older segments age into cheaper storage behind the same read path. Be concrete about retention and about what deletion means — a tombstone that hides the message or a real erase that rewrites the log — because those are very different systems."
      },
      {
        id: "meta-q2c",
        kind: "system-design",
        prompt:
          "Design the system behind a 'people you may know' suggestion list. It should feel personal and load instantly when someone opens the page.",
        context:
          "Hundreds of millions of users, each with hundreds to thousands of connections. Suggestions can be minutes or hours stale.",
        followUps: [
          "Where does the computation happen — request time or ahead of time?",
          "How do you stop suggesting someone the user has already dismissed?",
          "What would you do if the candidate generation was too slow?"
        ],
        minutes: 45,
        signals: [
          {
            id: "meta-q2c-s1",
            label: "Split candidate generation from ranking",
            weight: 3,
            hint: "Generate a few hundred plausible candidates cheaply, then rank those. Trying to score every user against every user is the trap in this question."
          },
          {
            id: "meta-q2c-s2",
            label: "Precomputed offline and served from a cache, given the staleness budget",
            weight: 3,
            hint: "The prompt says hours of staleness are fine — that is permission to precompute. Serving from a batch-built cache is the whole design."
          },
          {
            id: "meta-q2c-s3",
            label: "Used the graph structure to bound the candidate set",
            weight: 3,
            hint: "Friends-of-friends is the natural candidate source and it is bounded. Say how you cap it for users with very high degree."
          },
          {
            id: "meta-q2c-s4",
            label: "Handled dismissals and existing connections as a filter at serve time",
            weight: 3,
            hint: "A suggestion the user already rejected reappearing is the most visible failure of this feature. Filter at read time, since the cache is stale by design."
          },
          {
            id: "meta-q2c-s5",
            label: "Named a concrete freshness path for brand-new users",
            weight: 2,
            hint: "A user with no precomputed row needs a synchronous fallback. Say what it is rather than leaving them with an empty list."
          },
          {
            id: "meta-q2c-s6",
            label: "Said what you would measure beyond click-through",
            weight: 2,
            hint: "Connections accepted and still active weeks later, not clicks. Optimising the wrong metric here is a product failure, and Meta rounds score product sense."
          }
        ],
        strongAnswer:
          "The staleness budget is the key line in the prompt: hours are acceptable, which is permission to precompute. Run a batch job that, per user, generates candidates from the graph — friends of friends is the natural bounded source, capped for very high-degree users so one celebrity connection does not explode the set — then ranks a few hundred candidates with a model on mutual-connection and affinity features. Write the top results to a key-value store so the page load is a single fast read. Two things must happen at serve time rather than in the batch: filtering out people already connected and people previously dismissed, because a rejected suggestion coming back is the most visible way this feature fails and the cache is stale by design. New users have no precomputed row, so they need a synchronous fallback path. On measurement, say plainly that click-through is the wrong target — the metric is connections that are accepted and still active weeks later, otherwise you optimise for curiosity clicks."
      }
    ]
  },

  "meta-r3": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "meta-q3b",
        kind: "behavioral",
        prompt:
          "Tell me about a time you had to move fast with incomplete information. How did you decide what to do?",
        context:
          "Meta is listening for judgement under speed, not for recklessness and not for paralysis.",
        followUps: [
          "What would have made you slow down?",
          "What did you get wrong because you moved fast?",
          "How did you communicate the uncertainty to other people?"
        ],
        minutes: 15,
        signals: [
          {
            id: "meta-q3b-s1",
            label: "Named what you knew, what you didn't, and what you decided anyway",
            weight: 3,
            hint: "Structure the answer around the gap. That framing is the answer to this question."
          },
          {
            id: "meta-q3b-s2",
            label: "Gave the reason speed was worth it",
            weight: 3,
            hint: "Say the cost of waiting in concrete terms. Moving fast without a reason reads as impatience."
          },
          {
            id: "meta-q3b-s3",
            label: "Described a reversible decision or an explicit safety net",
            weight: 3,
            hint: "Feature flag, staged rollout, quick rollback path. Fast plus reversible is the answer; fast plus irreversible is a red flag."
          },
          {
            id: "meta-q3b-s4",
            label: "Told other people what was uncertain",
            weight: 2,
            hint: "Say how you flagged the risk. Moving fast quietly is how teams get surprised."
          },
          {
            id: "meta-q3b-s5",
            label: "Admitted the part you got wrong",
            weight: 2,
            hint: "There is always one. Naming it makes the rest of the story credible."
          },
          {
            id: "meta-q3b-s6",
            label: "Said where you would not move fast",
            weight: 2,
            hint: "Name the categories you slow down for — data loss, billing, anything you cannot undo. That is the judgement they are checking."
          }
        ],
        strongAnswer:
          "Frame the whole answer around the gap: here is what we knew, here is what we did not, here is what we decided anyway and why waiting had a real cost. Make the cost concrete — a launch date, a customer commitment, an outage getting worse — because speed without a reason reads as impatience rather than judgement. The part that actually scores is what you did to make the decision survivable: a flag, a staged rollout, a rollback you had already tested. Say how you told other people what was uncertain, since moving fast quietly is how teams get surprised. Admit the piece you got wrong, and close by naming where you would not move like that — anything irreversible, anything touching money or user data — because the signal is knowing which decisions deserve speed, not being fast about all of them."
      },
      {
        id: "meta-q3c",
        kind: "behavioral",
        prompt:
          "Tell me about the most significant piece of feedback you've received. What did you do with it?",
        context:
          "They want to see whether feedback actually changes your behaviour, or whether you just absorb it politely.",
        followUps: [
          "What specifically did you do differently the following month?",
          "How did you know the change had worked?",
          "Was there feedback you decided not to act on, and why?"
        ],
        minutes: 15,
        signals: [
          {
            id: "meta-q3c-s1",
            label: "Picked feedback that stung rather than a humblebrag",
            weight: 3,
            hint: "'I care too much' is not feedback. Choose something that was genuinely uncomfortable to hear."
          },
          {
            id: "meta-q3c-s2",
            label: "Described a specific behaviour change, not an attitude change",
            weight: 3,
            hint: "'I started writing a design doc before any change over a week' beats 'I became more collaborative'."
          },
          {
            id: "meta-q3c-s3",
            label: "Said how you verified it had landed",
            weight: 3,
            hint: "Went back to the person and asked. Following up is the part most people skip and the part that shows it was real."
          },
          {
            id: "meta-q3c-s4",
            label: "Gave the timeline honestly",
            weight: 2,
            hint: "Real behaviour change takes months. A story where you fixed it the next day is not believable."
          },
          {
            id: "meta-q3c-s5",
            label: "Showed you can reject feedback with a reason",
            weight: 2,
            hint: "Not all feedback is right. Describing one piece you weighed and set aside, with your reasoning, shows judgement rather than compliance."
          },
          {
            id: "meta-q3c-s6",
            label: "Avoided blaming the person who gave it",
            weight: 2,
            hint: "Even if it was delivered badly, focus on what you did with it. Litigating the delivery loses the point."
          }
        ],
        strongAnswer:
          "Pick feedback that was genuinely uncomfortable — reversed criticism like 'you care too much' reads as evasion and interviewers hear it constantly. Say what you were told, plainly, and resist explaining why it was unfair. Then give a specific behaviour change rather than an attitude: not 'I became more collaborative' but 'I started writing a one-page design note before any change over a week and circulating it to two people'. Say how you checked it had landed, which usually means going back to the person who raised it and asking directly, because that follow-up is the step most people skip. Be honest about the timeline; a story where you fixed a long-standing habit the next day is not credible. If you have a piece of feedback you weighed and deliberately set aside, include it with your reasoning — it shows judgement rather than compliance."
      }
    ]
  },

  "aapl-r2": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "aapl-q2b",
        kind: "domain",
        prompt:
          "Take me through something you built where you had to make it work within a hard constraint — memory, battery, latency, or binary size. Start at the beginning.",
        context:
          "Apple's deep dive goes several layers down. Expect to be asked why at every level until you hit the bottom of what you know.",
        followUps: [
          "What did you measure, and with what tool?",
          "What did you try that did not work?",
          "What would you do differently with twice the time?"
        ],
        minutes: 40,
        signals: [
          {
            id: "aapl-q2b-s1",
            label: "Named the constraint as a number, not an adjective",
            weight: 3,
            hint: "'Under 40MB resident' or 'under 16ms per frame'. 'It had to be fast' cannot be interrogated, and this round is entirely interrogation."
          },
          {
            id: "aapl-q2b-s2",
            label: "Described how you measured before optimising",
            weight: 3,
            hint: "Name the instrument — a profiler, a counter, a trace. Optimising without a baseline is the thing this round is built to detect."
          },
          {
            id: "aapl-q2b-s3",
            label: "Went several layers deep without hitting a wall",
            weight: 3,
            hint: "Expect to be asked why four or five times on one thread. Prepare one project you can answer to the bottom of, rather than five you can only skim."
          },
          {
            id: "aapl-q2b-s4",
            label: "Described an approach that failed and why",
            weight: 3,
            hint: "Every real optimisation has a dead end. A story with no failed attempt reads as rehearsed rather than lived."
          },
          {
            id: "aapl-q2b-s5",
            label: "Gave the result as a before and after number",
            weight: 2,
            hint: "'From 120MB to 38MB peak' is the sentence. A percentage with no baseline says nothing."
          },
          {
            id: "aapl-q2b-s6",
            label: "Owned the tradeoff you accepted",
            weight: 2,
            hint: "Every optimisation costs something — readability, generality, a slower cold path. Naming the cost is what separates engineering from a highlight reel."
          }
        ],
        strongAnswer:
          "Open with the constraint as a number, because everything else in this round hangs off it — 'under 40MB resident on the oldest supported device' can be interrogated in a way that 'it had to be efficient' cannot. Say how you measured before you changed anything, and name the tool, since optimising without a baseline is exactly what this round is designed to catch. Then go down the layers: the change you made, why that was the bottleneck, how you knew, and what was underneath it. Include something you tried that did not work and why — every real optimisation has a dead end, and a story without one sounds rehearsed. Close with a before and after number and the cost you accepted: more complex code, a slower cold path, a narrower general case. Prepare one project you can answer to the bottom of rather than five you can only summarise, because the follow-ups will keep going until you run out."
      },
      {
        id: "aapl-q2c",
        kind: "domain",
        prompt:
          "Tell me about a bug that took you a long time to find. Walk me through how you actually found it.",
        context:
          "The interviewer wants your debugging method under real conditions, including the parts where you were stuck and wrong.",
        followUps: [
          "What was your first hypothesis, and why was it wrong?",
          "How did you make it reproduce reliably?",
          "What stopped that class of bug from happening again?"
        ],
        minutes: 40,
        signals: [
          {
            id: "aapl-q2c-s1",
            label: "Described making it reproduce before trying to fix it",
            weight: 3,
            hint: "An intermittent bug you cannot reproduce cannot be verified as fixed. Say what you did to pin it down — that step is the actual work."
          },
          {
            id: "aapl-q2c-s2",
            label: "Narrowed systematically rather than guessing",
            weight: 3,
            hint: "Bisect, disable halves, add instrumentation at a boundary. Describe the search, not just the destination."
          },
          {
            id: "aapl-q2c-s3",
            label: "Stated and then killed a wrong hypothesis",
            weight: 3,
            hint: "Say what you believed first and what evidence disproved it. Debugging stories where the first guess was right are not debugging stories."
          },
          {
            id: "aapl-q2c-s4",
            label: "Explained the root cause precisely enough to be questioned",
            weight: 3,
            hint: "Down to the mechanism: the race, the uninitialised field, the wrong lifetime. A vague cause is where this round stops going well."
          },
          {
            id: "aapl-q2c-s5",
            label: "Confirmed the fix rather than assuming it",
            weight: 2,
            hint: "Say how you proved it — the reproduction stopped firing, the counter went to zero, the test failed before and passed after."
          },
          {
            id: "aapl-q2c-s6",
            label: "Prevented the class, not the instance",
            weight: 2,
            hint: "An assertion, a test, a type change, a lint rule. Apple cares about what stops the next one."
          }
        ],
        strongAnswer:
          "Lead with the hard part: making it reproduce. An intermittent bug that you cannot trigger on demand cannot be verified as fixed, so whatever you did to pin it down — a stress loop, a captured trace, a forced schedule — is the real work and should come first. Then describe the search rather than the answer: how you halved the space, where you instrumented, what you ruled out. Include your first hypothesis and the evidence that killed it, because a debugging story where the initial guess was right is not a debugging story. State the root cause down to the mechanism, precisely enough that the interviewer can push on it, since vagueness here is where this round goes wrong. Say how you confirmed the fix rather than assuming it. Finish with what now prevents the whole class — an assertion, a regression test, a type that makes the bad state unrepresentable."
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // OPENAI — practical code against messy real inputs
  // ────────────────────────────────────────────────────────────────
  "oai-r1": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "oai-q1b",
        kind: "coding",
        prompt:
          "You have an ordered list of text segments with token counts, and a per-request token budget. Pack them into as few sequential batches as possible without any batch exceeding the budget, preserving order. Return each batch's texts.",
        context:
          "Order matters — these are document sections and reordering them changes meaning. A single segment can be larger than the budget.",
        followUps: [
          "What do you do with a segment that is bigger than the entire budget?",
          "How would you test this without hand-writing every case?",
          "Batches now have a per-batch overhead of 8 tokens. What changes?"
        ],
        coding: {
          language: "javascript",
          functionName: "packIntoBatches",
          weight: 6,
          starterCode: `/**
 * @param {Array<[string, number]>} segments  (text, tokenCount) in order
 * @param {number} budget                     max tokens per batch
 * @returns {string[][]} batches of texts, order preserved
 */
function packIntoBatches(segments, budget) {
  // Decide what an oversized segment does before you write the loop.
}
`,
          tests: [
            { name: "nothing to pack", args: [[], 10], expected: [] },
            {
              name: "everything fits in one batch",
              args: [[["a", 2], ["b", 3]], 10],
              expected: [["a", "b"]]
            },
            {
              name: "splits when the budget is reached",
              args: [[["a", 3], ["b", 4], ["c", 5]], 7],
              expected: [["a", "b"], ["c"]]
            },
            {
              name: "a batch may exactly equal the budget",
              args: [[["a", 5], ["b", 5]], 5],
              expected: [["a"], ["b"]]
            },
            {
              name: "an oversized segment gets its own batch and does not stall the packing",
              args: [[["big", 20], ["a", 1]], 5],
              expected: [["big"], ["a"]]
            },
            {
              name: "order is never rearranged to improve the fit",
              args: [[["a", 4], ["b", 1], ["c", 4]], 5],
              expected: [["a", "b"], ["c"]]
            }
          ]
        },
        minutes: 30,
        signals: [
          {
            id: "oai-q1b-s1",
            label: "Settled the oversized-segment rule before writing the loop",
            weight: 3,
            hint: "A segment bigger than the budget cannot fit anywhere. Decide out loud — own batch, or error — because an unhandled one produces an infinite loop or a dropped section."
          },
          {
            id: "oai-q1b-s2",
            label: "Kept the order and said why reordering is not allowed",
            weight: 3,
            hint: "These are document sections; best-fit packing would scramble the document. Naming the constraint shows you understood the domain, not just the algorithm."
          },
          {
            id: "oai-q1b-s3",
            label: "Got the boundary right: a batch may equal the budget, not exceed it",
            weight: 3,
            hint: "Use > budget to close a batch, not >=. Off-by-one here silently halves your throughput."
          },
          {
            id: "oai-q1b-s4",
            label: "Noted this is greedy and not the optimal bin packing, and why that is fine",
            weight: 2,
            hint: "Order-preserving greedy is optimal for this constraint; general bin packing is not, but reordering is forbidden. Say that distinction."
          },
          {
            id: "oai-q1b-s5",
            label: "Proposed property-based testing rather than more hand-written cases",
            weight: 2,
            hint: "Assert invariants over random inputs: every segment appears exactly once, order is preserved, no batch exceeds the budget unless it is a single oversized segment."
          },
          {
            id: "oai-q1b-s6",
            label: "Folded the per-batch overhead in without hand-waving",
            weight: 2,
            hint: "The overhead is charged once per batch, so the effective capacity is budget - overhead and a batch must be non-empty. Say what happens when overhead approaches the budget."
          }
        ],
        strongAnswer:
          "Ask first what an oversized segment should do, because it is the case that turns a simple loop into an infinite one or silently drops a section; give it its own batch and carry on. Order is fixed — these are document sections, so best-fit or sorting is off the table, which also makes order-preserving greedy optimal for this constraint even though general bin packing is not. Walk the segments with a running total: if adding the next segment would exceed the budget and the current batch is non-empty, close the batch and start a new one. The comparison is 'greater than', so a batch that lands exactly on the budget is allowed. O(n) time. Test with properties rather than more examples: every segment appears exactly once, order is preserved, and no batch exceeds the budget except a lone oversized segment. With per-batch overhead, the effective capacity becomes budget minus overhead, and you should say what happens if that goes to zero."
      },
      {
        id: "oai-q1c",
        kind: "coding",
        prompt:
          "A streaming response arrives as chunks tagged with a sequence index, over an unreliable transport: chunks can arrive out of order, and can be delivered twice. Reassemble the final text.",
        context:
          "Indices start at 0 and are contiguous when nothing is lost, but a gap can happen. A duplicate index always carries identical content — but do not assume it, decide what you do.",
        followUps: [
          "What do you do about a gap in the sequence — block, or emit what you have?",
          "How would you turn this into an incremental assembler that emits as it goes?",
          "How do you bound memory if a chunk never arrives?"
        ],
        coding: {
          language: "javascript",
          functionName: "assembleStream",
          weight: 6,
          starterCode: `/**
 * @param {Array<[number, string]>} chunks  (sequenceIndex, text), any order, may repeat
 * @returns {string} reassembled text, in sequence order
 */
function assembleStream(chunks) {
  // Say what you do about duplicates and gaps before writing.
}
`,
          tests: [
            { name: "nothing received", args: [[]], expected: "" },
            {
              name: "in-order chunks concatenate",
              args: [[[0, "he"], [1, "llo"]]],
              expected: "hello"
            },
            {
              name: "out-of-order chunks are sorted by index",
              args: [[[1, "llo"], [0, "he"]]],
              expected: "hello"
            },
            {
              name: "a duplicate index is not written twice",
              args: [[[0, "he"], [0, "he"], [1, "llo"]]],
              expected: "hello"
            },
            {
              name: "first delivery of an index wins",
              args: [[[0, "first"], [0, "second"]]],
              expected: "first"
            },
            {
              name: "a gap does not stop the rest being assembled",
              args: [[[0, "a"], [2, "c"]]],
              expected: "ac"
            },
            {
              name: "indices need not start at zero",
              args: [[[5, "x"], [7, "z"], [6, "y"]]],
              expected: "xyz"
            }
          ]
        },
        minutes: 30,
        signals: [
          {
            id: "oai-q1c-s1",
            label: "Stated the duplicate policy explicitly — first wins, last wins, or reject",
            weight: 3,
            hint: "The prompt deliberately says do not assume duplicates match. Pick a rule, say it out loud, and make the code match the rule."
          },
          {
            id: "oai-q1c-s2",
            label: "Decided what a gap means rather than silently concatenating",
            weight: 3,
            hint: "Emitting across a gap produces text that reads fine and is wrong. Say whether you emit, block, or mark the gap — the failure is invisible otherwise."
          },
          {
            id: "oai-q1c-s3",
            label: "Keyed by index instead of relying on arrival order",
            weight: 3,
            hint: "A Map from index to text, then sort the keys numerically. Sorting keys as strings puts 10 before 2, which is the bug hiding in this problem."
          },
          {
            id: "oai-q1c-s4",
            label: "Did not assume indices start at zero or are contiguous",
            weight: 2,
            hint: "Assemble from the sorted keys you actually received rather than counting up from 0 to n."
          },
          {
            id: "oai-q1c-s5",
            label: "Described the incremental version with a next-expected pointer",
            weight: 2,
            hint: "Buffer out-of-order chunks, emit while the buffer contains nextExpected, and advance. That is the streaming form of the same algorithm."
          },
          {
            id: "oai-q1c-s6",
            label: "Bounded memory for a chunk that never arrives",
            weight: 2,
            hint: "Say the buffer needs a cap or a timeout, and what you do on expiry — emit with a gap marker, or fail the response. Unbounded buffering is the production incident."
          }
        ],
        strongAnswer:
          "State the policies first: duplicates resolve first-write-wins, and a gap is emitted across but flagged rather than silently joined, because text that reads fine and is wrong is the worst outcome here. Collect into a Map keyed by sequence index, ignoring an index already present. Sort the keys numerically — sorting them as strings puts 10 before 2, which is the trap — and concatenate. Do not assume indices start at zero or are contiguous; assemble from the keys actually received. O(n log n) from the sort, O(n) space. The incremental version keeps a nextExpected counter and a buffer, emitting while the buffer holds nextExpected and advancing, which is the same algorithm streaming. Memory has to be bounded: a chunk that never arrives means the buffer needs a cap or a deadline, and you should say what happens on expiry rather than letting it grow."
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // ANTHROPIC — practical code, with the judgement call visible
  // ────────────────────────────────────────────────────────────────
  "ant-r1": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "ant-q1b",
        kind: "coding",
        prompt:
          "An agent trace contains repeated tool calls. Collapse runs of the same call made back-to-back with identical arguments into one entry, preserving order and leaving everything else alone.",
        context:
          "Only consecutive repeats collapse. The same tool called again later, after something else happened, is meaningful and must survive.",
        followUps: [
          "Why only consecutive repeats — what would collapsing all duplicates lose?",
          "Arguments arrive as objects whose key order varies. How do you compare them?",
          "How would you report how much was collapsed without changing the output shape?"
        ],
        coding: {
          language: "javascript",
          functionName: "collapseRepeatedCalls",
          weight: 6,
          starterCode: `/**
 * @param {Array<[string, string]>} calls  (toolName, serialisedArgs) in order
 * @returns {Array<[string, string]>} consecutive identical calls collapsed to one
 */
function collapseRepeatedCalls(calls) {
  // Only back-to-back repeats collapse. Order is preserved.
}
`,
          tests: [
            { name: "empty trace", args: [[]], expected: [] },
            {
              name: "a single call is untouched",
              args: [[["search", "{}"]]],
              expected: [["search", "{}"]]
            },
            {
              name: "consecutive identical calls collapse to one",
              args: [[["search", "{}"], ["search", "{}"], ["read", "{}"]]],
              expected: [["search", "{}"], ["read", "{}"]]
            },
            {
              name: "the same tool with different arguments is not a repeat",
              args: [[["search", "{\"q\":1}"], ["search", "{\"q\":2}"]]],
              expected: [["search", "{\"q\":1}"], ["search", "{\"q\":2}"]]
            },
            {
              name: "a repeat separated by another call is kept — it is meaningful",
              args: [[["a", "1"], ["b", "1"], ["a", "1"]]],
              expected: [["a", "1"], ["b", "1"], ["a", "1"]]
            },
            {
              name: "a long run collapses to a single entry",
              args: [[["a", "1"], ["a", "1"], ["a", "1"], ["a", "1"]]],
              expected: [["a", "1"]]
            },
            {
              name: "different tools with identical arguments are distinct",
              args: [[["a", "1"], ["b", "1"]]],
              expected: [["a", "1"], ["b", "1"]]
            }
          ]
        },
        minutes: 25,
        signals: [
          {
            id: "ant-q1b-s1",
            label: "Checked both the name and the arguments, not just the name",
            weight: 3,
            hint: "Two searches with different queries are two different actions. Collapsing on name alone destroys the trace you are trying to read."
          },
          {
            id: "ant-q1b-s2",
            label: "Collapsed only consecutive repeats, and said what global dedupe would lose",
            weight: 3,
            hint: "A tool called again after something else happened is a retry or a new decision. Global dedupe erases the loop you are debugging."
          },
          {
            id: "ant-q1b-s3",
            label: "Compared against the last kept entry rather than the previous input entry",
            weight: 3,
            hint: "In a run of four, comparing to the previous input works, but comparing to the last kept entry is what stays correct if the rule ever widens. Say which you chose."
          },
          {
            id: "ant-q1b-s4",
            label: "Raised key ordering in serialised arguments unprompted",
            weight: 2,
            hint: "{a:1,b:2} and {b:2,a:1} serialise differently and are the same call. Say you would compare canonicalised arguments, sorting keys before hashing."
          },
          {
            id: "ant-q1b-s5",
            label: "Kept the function pure and left the input untouched",
            weight: 2,
            hint: "Build a new array. Traces get read by more than one consumer, and mutating the caller's copy is a bug that surfaces far from here."
          },
          {
            id: "ant-q1b-s6",
            label: "Proposed reporting the collapse count without changing the output shape",
            weight: 2,
            hint: "Return counts on a side channel, or a parallel array. Silently hiding that twelve calls became one removes the signal someone needed."
          }
        ],
        strongAnswer:
          "Compare both the tool name and its arguments — collapsing on name alone merges two genuinely different searches. Collapse only back-to-back repeats: a tool called again after something else happened is a retry or a fresh decision, and erasing it removes exactly the loop you would be debugging. Walk once, comparing each call to the last kept entry and appending when it differs; build a new array rather than mutating the caller's trace, since traces have several readers. O(n) time. Raise argument canonicalisation without being asked: serialised objects with different key order are the same call, so compare sorted-key forms or a stable hash. And say that collapsing loses information — report how many entries collapsed on a side channel, because silently turning twelve identical calls into one hides the runaway loop someone is looking for."
      },
      {
        id: "ant-q1c",
        kind: "coding",
        prompt:
          "You have retrieved documents with a relevance score and a token cost, and a token budget for the prompt. Choose which to include. Return the chosen ids in the order you selected them.",
        context:
          "Take the highest-scoring documents that fit, considering each in score order; break score ties by id ascending. A document that does not fit is skipped and you continue down the list.",
        followUps: [
          "Is your selection optimal? If not, what would optimal cost you?",
          "Two documents say the same thing. Does your approach notice?",
          "How would you keep this stable so a small score change doesn't reshuffle the prompt?"
        ],
        coding: {
          language: "javascript",
          functionName: "chooseWithinBudget",
          weight: 6,
          starterCode: `/**
 * @param {Array<[string, number, number]>} docs  (id, tokens, score)
 * @param {number} budget                         total token budget
 * @returns {string[]} chosen ids, in selection order
 */
function chooseWithinBudget(docs, budget) {
  // Greedy by score. Say out loud whether that is optimal.
}
`,
          tests: [
            { name: "nothing retrieved", args: [[], 100], expected: [] },
            { name: "no budget selects nothing", args: [[["a", 1, 10]], 0], expected: [] },
            {
              name: "takes the highest scores that fit",
              args: [[["a", 5, 10], ["b", 5, 9], ["c", 5, 8]], 10],
              expected: ["a", "b"]
            },
            {
              name: "skips a document that does not fit and keeps going",
              args: [[["a", 100, 10], ["b", 5, 9]], 10],
              expected: ["b"]
            },
            {
              name: "score ties broken by id ascending",
              args: [[["b", 1, 5], ["a", 1, 5]], 2],
              expected: ["a", "b"]
            },
            {
              name: "a document exactly filling the budget is included",
              args: [[["a", 10, 5]], 10],
              expected: ["a"]
            },
            {
              name: "greedy by score, not by score per token",
              args: [[["big", 9, 10], ["s1", 1, 9], ["s2", 1, 9]], 10],
              expected: ["big", "s1"]
            }
          ]
        },
        minutes: 25,
        signals: [
          {
            id: "ant-q1c-s1",
            label: "Said out loud that greedy is not optimal, and why it is still the right call",
            weight: 3,
            hint: "This is a knapsack. Greedy by score is not optimal — name that, then justify it: the scores are estimates, and an exact solve buys precision the inputs do not have."
          },
          {
            id: "ant-q1c-s2",
            label: "Made the ordering a total order so the output is reproducible",
            weight: 3,
            hint: "Score descending, then id ascending. Without the tie-break the same query can build two different prompts, which makes every downstream bug unreproducible."
          },
          {
            id: "ant-q1c-s3",
            label: "Skipped an unaffordable document and continued instead of stopping",
            weight: 3,
            hint: "Stopping at the first document that does not fit throws away everything cheaper behind it. Continue down the list."
          },
          {
            id: "ant-q1c-s4",
            label: "Got the boundary right — exactly filling the budget is allowed",
            weight: 2,
            hint: "Include while running + tokens <= budget. Using < wastes a slot on every request."
          },
          {
            id: "ant-q1c-s5",
            label: "Raised near-duplicate documents unprompted",
            weight: 2,
            hint: "Two documents saying the same thing both score highly and together waste half the budget. Say you would deduplicate on similarity before selecting."
          },
          {
            id: "ant-q1c-s6",
            label: "Addressed stability against small score changes",
            weight: 2,
            hint: "Round or bucket scores before ordering so a 0.001 change cannot reshuffle the prompt. Prompt churn makes caching and evaluation useless."
          }
        ],
        strongAnswer:
          "Name it as a knapsack and say immediately that greedy by score is not optimal — then justify greedy anyway, because relevance scores are noisy estimates and an exact solve buys precision the inputs cannot support, at real latency cost. Sort by score descending then id ascending so the ordering is total and the same query always builds the same prompt; without that, downstream bugs stop being reproducible. Walk the sorted list keeping a running total, including a document while running + tokens is less than or equal to budget, and skipping — not stopping — when one does not fit, so cheaper documents behind it still get their chance. Two things worth raising unprompted: near-duplicate documents both score highly and can burn half the budget saying one thing, so deduplicate on similarity first; and scores should be bucketed before ordering so a tiny score change cannot reshuffle the whole prompt and destroy cache hits."
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // META — two problems per sitting, so the bank needs to be deeper
  // ────────────────────────────────────────────────────────────────
  "meta-r1": {
    questionsPerAttempt: 2,
    extra: [
      {
        id: "meta-q1b",
        kind: "coding",
        prompt:
          "A comment body has had parentheses mangled by an editor. Remove the fewest characters possible so the parentheses balance, leaving every other character where it is. Return the repaired string.",
        context:
          "Only '(' and ')' matter; letters and spaces are untouched. Where several removals are equally minimal, any valid result is accepted — but be ready to say why yours is deterministic.",
        followUps: [
          "Prove your removal count is actually minimal.",
          "Now do it in one pass with O(1) extra space beyond the output.",
          "What changes if we add square brackets that must also nest correctly?"
        ],
        coding: {
          language: "javascript",
          functionName: "repairParens",
          weight: 6,
          starterCode: `/**
 * @param {string} text
 * @returns {string} text with the fewest possible parentheses removed to balance
 */
function repairParens(text) {
  // Approach first, then make the tests pass.
}
`,
          tests: [
            { name: "empty string", args: [""], expected: "" },
            { name: "no parentheses at all", args: ["hello world"], expected: "hello world" },
            { name: "already balanced", args: ["a(b)c"], expected: "a(b)c" },
            { name: "drops an unmatched closer", args: ["a)b"], expected: "ab" },
            { name: "drops an unmatched opener", args: ["a(b"], expected: "ab" },
            { name: "keeps the valid pair, drops the stray closer", args: ["(a)b)"], expected: "(a)b" },
            { name: "nested and balanced survives intact", args: ["((a))"], expected: "((a))" },
            { name: "closer before opener leaves both removed", args: [")("], expected: "" }
          ]
        },
        minutes: 20,
        signals: [
          {
            id: "meta-q1b-s1",
            label: "Clarified what 'fewest' means and whether output must be unique",
            weight: 3,
            hint: "Ask whether ties matter. Meta's bar is speed with correctness, and knowing the output is not unique stops you over-engineering a canonical form."
          },
          {
            id: "meta-q1b-s2",
            label: "Used a counter or index stack rather than repeatedly rescanning",
            weight: 3,
            hint: "One pass tracking open count, marking unmatched closers; then a reverse pass for surplus openers. Rescanning until stable is the quadratic trap."
          },
          {
            id: "meta-q1b-s3",
            label: "Handled surplus openers, not just surplus closers",
            weight: 3,
            hint: "'a(b' has no bad closer at all. If you only scan left-to-right you will return it unchanged — this is the case that fails most submissions."
          },
          {
            id: "meta-q1b-s4",
            label: "Stated O(n) time and O(n) space and moved on quickly",
            weight: 2,
            hint: "Meta interviews are time-boxed and usually two problems. Say the complexity in one sentence and keep going."
          },
          {
            id: "meta-q1b-s5",
            label: "Tested ')(' — the case where nothing can be kept",
            weight: 2,
            hint: "')(' is balanced by count but invalid by order. If your solution returns it unchanged, your logic is counting rather than matching."
          }
        ],
        strongAnswer:
          "Ask whether ties matter, then note the output is not unique so any minimal removal is fine. Pass one: walk left to right, tracking open depth; a ')' that arrives at depth zero is unmatched, mark it for removal, otherwise decrement. Pass two: any '(' still open at the end is surplus, so drop that many from the right. Build the result from the surviving indices. O(n) time, O(n) space. The two cases that catch people are 'a(b', where nothing is wrong left-to-right, and ')(', which is balanced by count but invalid by order — a counter alone is not enough, order has to be respected."
      },
      {
        id: "meta-q1c",
        kind: "coding",
        prompt:
          "Given points on a plane and a number k, return the k points closest to the origin. Return them sorted by distance, then by x, then by y, so the output is deterministic.",
        context: "Up to a few million points, k typically much smaller. Coordinates are integers and may be negative.",
        followUps: [
          "Why did you not sort the whole array?",
          "What if the points don't fit in memory on one machine?",
          "Could you do it in expected linear time?"
        ],
        coding: {
          language: "javascript",
          functionName: "kClosestPoints",
          weight: 6,
          starterCode: `/**
 * @param {Array<[number, number]>} points  (x, y) pairs
 * @param {number} k
 * @returns {Array<[number, number]>} k closest to origin, by distance then x then y
 */
function kClosestPoints(points, k) {
  // Approach first, then make the tests pass.
}
`,
          tests: [
            { name: "no points", args: [[], 3], expected: [] },
            { name: "k of zero", args: [[[1, 1]], 0], expected: [] },
            {
              name: "k larger than the input returns everything, still sorted",
              args: [[[3, 0], [1, 0]], 9],
              expected: [[1, 0], [3, 0]]
            },
            {
              name: "orders by distance",
              args: [[[5, 0], [1, 0], [3, 0]], 2],
              expected: [[1, 0], [3, 0]]
            },
            {
              name: "negative coordinates use magnitude, not sign",
              args: [[[-1, 0], [2, 0]], 1],
              expected: [[-1, 0]]
            },
            {
              name: "equal distances broken by x then y",
              args: [[[0, 1], [1, 0], [-1, 0]], 3],
              expected: [[-1, 0], [0, 1], [1, 0]]
            }
          ]
        },
        minutes: 20,
        signals: [
          {
            id: "meta-q1c-s1",
            label: "Compared distances without taking square roots",
            weight: 3,
            hint: "Compare x*x + y*y. The square root is monotonic, so it changes nothing about the ordering and only costs precision and time."
          },
          {
            id: "meta-q1c-s2",
            label: "Chose a size-k heap or quickselect over sorting everything, and justified it",
            weight: 3,
            hint: "Say 'O(n log k) with a max-heap of size k, versus O(n log n) to sort all of them; k is small so the heap wins'. The comparison is what is scored."
          },
          {
            id: "meta-q1c-s3",
            label: "Made the tie-break explicit so the output is deterministic",
            weight: 3,
            hint: "Distance, then x, then y. Without a total order your function returns different answers on different engines, and the tests will catch it."
          },
          {
            id: "meta-q1c-s4",
            label: "Handled k = 0 and k greater than the point count",
            weight: 2,
            hint: "Clamp k into range at the top. Both boundaries are one line and both are commonly missed."
          },
          {
            id: "meta-q1c-s5",
            label: "Named quickselect for expected O(n) when pressed",
            weight: 2,
            hint: "Partition around a pivot on squared distance for expected linear time, then sort only the surviving k. Say the worst case is still quadratic."
          }
        ],
        strongAnswer:
          "Compare squared distance, never the square root — the ordering is identical and you avoid the cost and the floating point. Keep a max-heap of size k keyed on squared distance: push, and pop when the heap exceeds k, giving O(n log k) against O(n log n) for a full sort, which matters because k is small. Clamp k to [0, points.length] first so both boundary cases are handled. Sort the surviving k by distance, then x, then y so the result is a total order and deterministic. If pressed for linear time, quickselect partitions on squared distance in expected O(n), worst case quadratic. Out of core, compute a per-shard top k and merge the shard results."
      },
      {
        id: "meta-q1d",
        kind: "coding",
        prompt:
          "You're given time ranges when a room was booked, possibly overlapping and in any order. Merge them into the smallest set of non-overlapping ranges and return it sorted by start.",
        context: "Ranges are half-open: [start, end). Touching ranges like [1,2) and [2,3) should merge into [1,3).",
        followUps: [
          "What's the complexity, and what dominates it?",
          "Now return the gaps between bookings instead.",
          "Ranges stream in one at a time and you must answer after each. What structure do you reach for?"
        ],
        coding: {
          language: "javascript",
          functionName: "mergeBookings",
          weight: 6,
          starterCode: `/**
 * @param {Array<[number, number]>} ranges  half-open [start, end)
 * @returns {Array<[number, number]>} merged, sorted by start
 */
function mergeBookings(ranges) {
  // Approach first, then make the tests pass.
}
`,
          tests: [
            { name: "no ranges", args: [[]], expected: [] },
            { name: "a single range is returned as-is", args: [[[1, 4]]], expected: [[1, 4]] },
            {
              name: "unsorted input is sorted before merging",
              args: [[[5, 6], [1, 2]]],
              expected: [[1, 2], [5, 6]]
            },
            {
              name: "overlapping ranges merge",
              args: [[[1, 4], [2, 6]]],
              expected: [[1, 6]]
            },
            {
              name: "touching ranges merge because the interval is half-open",
              args: [[[1, 2], [2, 3]]],
              expected: [[1, 3]]
            },
            {
              name: "a range fully inside another is absorbed",
              args: [[[1, 10], [3, 4]]],
              expected: [[1, 10]]
            },
            {
              name: "disjoint ranges stay separate",
              args: [[[1, 2], [5, 6], [3, 4]]],
              expected: [[1, 2], [3, 4], [5, 6]]
            }
          ]
        },
        minutes: 20,
        signals: [
          {
            id: "meta-q1d-s1",
            label: "Asked whether intervals are open or closed at the end before coding",
            weight: 3,
            hint: "Half-open versus closed decides whether [1,2) and [2,3) merge. Ask, because getting it wrong silently changes every answer."
          },
          {
            id: "meta-q1d-s2",
            label: "Sorted by start, then swept with a single running interval",
            weight: 3,
            hint: "Sort by start, keep a current interval, extend its end while the next start is <= current end, otherwise emit and restart."
          },
          {
            id: "meta-q1d-s3",
            label: "Extended the end with a max rather than overwriting it",
            weight: 3,
            hint: "current[1] = Math.max(current[1], next[1]). Overwriting loses a fully-contained range like [1,10] then [3,4] — the classic bug in this problem."
          },
          {
            id: "meta-q1d-s4",
            label: "Said the sort dominates: O(n log n) time, O(n) output",
            weight: 2,
            hint: "The sweep is linear; the sort is the cost. Say so unprompted."
          },
          {
            id: "meta-q1d-s5",
            label: "Did not mutate the caller's array without saying so",
            weight: 2,
            hint: "Sorting in place mutates the input. Copy first, or say out loud that you are mutating deliberately — quiet mutation is a real review comment."
          }
        ],
        strongAnswer:
          "First ask whether the ranges are half-open, because that decides whether touching ranges merge. Copy and sort by start — sorting the caller's array in place is a side effect you should not introduce silently. Sweep once with a running interval: if the next start is at or before the current end, extend with current[1] = max(current[1], next[1]); the max is essential or a fully-contained range like [3,4] inside [1,10] shrinks the result. Otherwise emit the current interval and start a new one. O(n log n) dominated by the sort, O(n) output. For gaps, walk the merged list and emit the space between consecutive intervals. For a streaming version, hold the merged set in a balanced tree keyed by start so each insertion is O(log n)."
      }
    ]
  },

  // ────────────────────────────────────────────────────────────────
  // GOOGLE
  // ────────────────────────────────────────────────────────────────
  "goog-r1": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "goog-q1b",
        kind: "coding",
        prompt:
          "You have a day's worth of CDN access records, each a (path, bytesServed) pair. Return the k paths that served the most total bytes, heaviest first, breaking ties by path ascending. Talk me through the approach before you type.",
        context:
          "Assume tens of millions of records and that k is small — single digits to low hundreds. A path appears many times.",
        followUps: [
          "What's your complexity, and why did you not just sort everything?",
          "k is now 1 million. Does your answer change?",
          "The records arrive as a stream and you can't store every path. What would you give up?"
        ],
        coding: {
          language: "javascript",
          functionName: "topPathsByBytes",
          weight: 6,
          starterCode: `/**
 * @param {Array<[string, number]>} records  (path, bytesServed)
 * @param {number} k                         how many paths to return
 * @returns {string[]} paths, most bytes first; ties broken by path ascending
 */
function topPathsByBytes(records, k) {
  // Say your approach out loud first, then make the tests pass.
}
`,
          tests: [
            { name: "no records", args: [[], 3], expected: [] },
            {
              name: "sums repeated paths before ranking",
              args: [
                [
                  ["/a", 10],
                  ["/b", 5],
                  ["/a", 1]
                ],
                2
              ],
              expected: ["/a", "/b"]
            },
            {
              name: "k larger than the number of distinct paths",
              args: [[["/a", 1]], 5],
              expected: ["/a"]
            },
            {
              name: "k of zero returns nothing",
              args: [[["/a", 1]], 0],
              expected: []
            },
            {
              name: "ties broken by path ascending",
              args: [
                [
                  ["/z", 5],
                  ["/a", 5],
                  ["/m", 5]
                ],
                3
              ],
              expected: ["/a", "/m", "/z"]
            },
            {
              name: "ranks by total, not by number of hits",
              args: [
                [
                  ["/small", 1],
                  ["/small", 1],
                  ["/small", 1],
                  ["/big", 100]
                ],
                1
              ],
              expected: ["/big"]
            }
          ]
        },
        minutes: 25,
        signals: [
          {
            id: "goog-q1b-s1",
            label: "Confirmed the tie-break rule and what k means before coding",
            weight: 3,
            hint: "Ask 'what happens on a tie, and can k exceed the number of distinct paths?' Unstated tie-breaks are where these solutions actually fail."
          },
          {
            id: "goog-q1b-s2",
            label: "Aggregated first, then selected — rather than sorting the raw records",
            weight: 3,
            hint: "Sum into a Map keyed by path, then rank the distinct paths. Sorting tens of millions of raw records when there are far fewer distinct paths is the trap."
          },
          {
            id: "goog-q1b-s3",
            label: "Named the heap option and compared it to a full sort with k in mind",
            weight: 3,
            hint: "Say 'O(d log d) to sort d distinct paths, or O(d log k) with a size-k min-heap; the heap wins while k is small'. The comparison is the signal, not the choice."
          },
          {
            id: "goog-q1b-s4",
            label: "Stated complexity in terms of records AND distinct paths, not just n",
            weight: 2,
            hint: "There are two sizes here: n records and d distinct paths. Saying 'O(n) to aggregate plus O(d log k) to select' shows you noticed."
          },
          {
            id: "goog-q1b-s5",
            label: "Dry-ran a tie and a k-larger-than-input case out loud",
            weight: 2,
            hint: "Walk three equal-byte paths through your comparator by hand. Ties are the case interviewers deliberately plant."
          },
          {
            id: "goog-q1b-s6",
            label: "Answered the streaming follow-up with a named approximation",
            weight: 2,
            hint: "Say 'count-min sketch plus a heap of heavy hitters, trading exactness for bounded memory' — and say what error that admits."
          }
        ],
        strongAnswer:
          "Clarify the tie-break and whether k can exceed the distinct path count. Aggregate bytes into a Map keyed by path in one O(n) pass — there are far fewer distinct paths than records, which is the whole point. Then select: sort the d distinct entries O(d log d), or keep a size-k min-heap for O(d log k) while k stays small. Comparator is bytes descending, then path ascending, so ties are deterministic. Edge cases: empty input, k = 0, k > d, a single path. For a stream with unbounded cardinality you cannot keep every path, so use a count-min sketch to estimate totals plus a bounded heap of heavy hitters, and state plainly that you have traded exactness for bounded memory."
      },
      {
        id: "goog-q1c",
        kind: "coding",
        prompt:
          "Given a sequence of resource ids representing what one client fetched in order, find the length of the longest stretch in which no resource was fetched twice. Think out loud first.",
        context: "The sequence can be very long. Ids are opaque strings, not bounded integers.",
        followUps: [
          "Why is your solution linear and not quadratic?",
          "Now return the stretch itself, not just the length. What changes?",
          "What if we allow up to one repeat inside the stretch?"
        ],
        coding: {
          language: "javascript",
          functionName: "longestUniqueRun",
          weight: 6,
          starterCode: `/**
 * @param {string[]} ids  resources fetched, in order
 * @returns {number} length of the longest stretch with no repeated id
 */
function longestUniqueRun(ids) {
  // Approach out loud, then make the tests pass.
}
`,
          tests: [
            { name: "empty sequence", args: [[]], expected: 0 },
            { name: "single item", args: [["a"]], expected: 1 },
            { name: "all identical", args: [["a", "a", "a"]], expected: 1 },
            { name: "all distinct", args: [["a", "b", "c", "d"]], expected: 4 },
            {
              name: "window must jump past the earlier duplicate",
              args: [["a", "b", "c", "a", "d", "e"]],
              expected: 5
            },
            {
              name: "left pointer must never move backwards",
              args: [["a", "b", "b", "a", "c"]],
              expected: 3
            }
          ]
        },
        minutes: 25,
        signals: [
          {
            id: "goog-q1c-s1",
            label: "Restated the problem with an example before writing anything",
            weight: 3,
            hint: "Give one concrete input and its answer out loud. It takes fifteen seconds and it catches misunderstandings before they cost you the round."
          },
          {
            id: "goog-q1c-s2",
            label: "Reached a sliding window with a last-seen map, not a nested scan",
            weight: 3,
            hint: "Keep a map from id to its most recent index; when you meet a repeat, jump the left edge to lastSeen + 1. That is the whole algorithm."
          },
          {
            id: "goog-q1c-s3",
            label: "Handled the case where the duplicate sits behind the window's left edge",
            weight: 3,
            hint: "Guard with left = Math.max(left, lastSeen + 1). Without the max, the window walks backwards and the answer comes out too large — this is the single most common bug here."
          },
          {
            id: "goog-q1c-s4",
            label: "Stated O(n) time and O(k) space for k distinct ids",
            weight: 2,
            hint: "Say it before being asked, and say what k is bounded by. Volunteering complexity reads as senior."
          },
          {
            id: "goog-q1c-s5",
            label: "Dry-ran the backwards-pointer case by hand",
            weight: 2,
            hint: "Trace ['a','b','b','a','c'] manually. If your left pointer jumps back to index 1 on the second 'a', you have found the bug the interviewer was waiting for."
          },
          {
            id: "goog-q1c-s6",
            label: "Extended cleanly to returning the stretch, or to allowing one repeat",
            weight: 2,
            hint: "For the stretch, record the start index when you update the best length. For one repeat, the window condition becomes a count, not a set."
          }
        ],
        strongAnswer:
          "Restate with an example. Slide a window with a Map from id to last-seen index. For each right index, if the id was seen at position p, move left to max(left, p + 1) — the max matters, because a duplicate can sit behind the current window and moving left backwards inflates the answer. Update best = max(best, right - left + 1) and record lastSeen[id] = right. O(n) time, O(k) space in the number of distinct ids. Edge cases: empty input returns 0, a single element returns 1, all-identical returns 1. To return the stretch itself, remember the left index whenever best improves. To allow one repeat, track a duplicate count in the window and shrink only while that count exceeds one."
      }
    ]
  },
  "oai-r2": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "oai-q2b",
        kind: "coding",
        prompt:
          "Here's a service that has started returning stale data for about one request in fifty, only in production. You have the code, the logs and a staging environment where it never reproduces. Where do you start?",
        context:
          "You did not write this service and the person who did has left. There is a cache in front of it and three replicas behind a load balancer.",
        followUps: [
          "What is the first measurement you take, before forming a theory?",
          "How would you get it to reproduce outside production?",
          "If you had to mitigate within the hour without understanding it, what would you do?"
        ],
        minutes: 45,
        signals: [
          {
            id: "oai-q2b-s1",
            label: "Started by characterising the failure rather than reading code",
            weight: 3,
            hint: "One in fifty and only in production is data. Is it one replica? One cache shard? One customer? Narrow before you theorise."
          },
          {
            id: "oai-q2b-s2",
            label: "Suspected the difference between staging and production explicitly",
            weight: 3,
            hint: "It reproduces in one place and not the other — that gap is the bug's address. Replica count, cache size, real traffic, real concurrency."
          },
          {
            id: "oai-q2b-s3",
            label: "Separated mitigation from diagnosis and did both",
            weight: 3,
            hint: "Say what you would ship in the hour to stop the bleeding, and that it is not the fix. Conflating the two is how incidents get long."
          },
          {
            id: "oai-q2b-s4",
            label: "Named a concrete instrumentation step, not just 'add logging'",
            weight: 3,
            hint: "Tag responses with the replica id and cache key, then check whether the stale ones cluster. Say what you would learn from each outcome."
          },
          {
            id: "oai-q2b-s5",
            label: "Reasoned about cache invalidation as the likely class",
            weight: 2,
            hint: "Stale data behind a cache in a replicated service is nearly always invalidation racing a write, or one replica missing an invalidation. Say the hypothesis and how you would test it."
          },
          {
            id: "oai-q2b-s6",
            label: "Said what you would do if the theory was wrong",
            weight: 2,
            hint: "Name the next hypothesis. Interviewers push here to see whether you have one path or several."
          }
        ],
        strongAnswer:
          "Do not open the source first. Characterise the failure: is it one replica, one cache shard, one customer, one endpoint, one time of day? One in fifty with three replicas is a suspicious ratio and worth checking immediately. The fact that staging never reproduces is the most useful fact you have — the bug lives in whatever differs, which usually means concurrency, cache size, or real invalidation traffic. Instrument specifically rather than 'adding logging': tag every response with the serving replica and the cache key it hit, then see whether stale responses cluster; say what each outcome would tell you. The likely class, given a cache in front of a replicated service, is an invalidation racing a write or one replica missing invalidations — state that as a hypothesis and how you would confirm it. In parallel, mitigate: shorten the TTL or bypass the cache for the affected path, and say clearly that this is bleeding control, not a fix. Have a second hypothesis ready for when the first is wrong."
      },
      {
        id: "oai-q2c",
        kind: "coding",
        prompt:
          "You've inherited a data pipeline you didn't write. It runs nightly, takes six hours, and last night it silently produced half the usual number of rows. Nobody noticed for two days. What do you do?",
        context:
          "The pipeline has no tests and light logging. Downstream teams have already used the bad output.",
        followUps: [
          "What do you do first — fix the pipeline or deal with the bad data downstream?",
          "How would you find out whether this has happened before?",
          "What would you put in place so a two-day gap cannot happen again?"
        ],
        minutes: 45,
        signals: [
          {
            id: "oai-q2c-s1",
            label: "Dealt with the already-consumed bad data before fixing the cause",
            weight: 3,
            hint: "Two days of downstream use is the real damage. Say who you tell and how you scope the blast radius before you go debugging."
          },
          {
            id: "oai-q2c-s2",
            label: "Checked history rather than assuming this was the first time",
            weight: 3,
            hint: "Row counts per night are probably recoverable. If it has happened before, it changes both the urgency and the diagnosis."
          },
          {
            id: "oai-q2c-s3",
            label: "Treated 'silently' as the primary bug",
            weight: 3,
            hint: "Halving output with no alarm is a worse defect than the halving. Say that out loud — a volume check would have caught it the same night."
          },
          {
            id: "oai-q2c-s4",
            label: "Proposed a concrete data-quality gate with a threshold",
            weight: 3,
            hint: "Row count within a band of the trailing median, failing the run rather than publishing. Give the rule, not the aspiration."
          },
          {
            id: "oai-q2c-s5",
            label: "Considered a partial-failure mode in the pipeline itself",
            weight: 2,
            hint: "A source that returned early, a silent exception swallowed per shard, an expired credential on one partition. Name plausible mechanisms."
          },
          {
            id: "oai-q2c-s6",
            label: "Made the output atomic so half a result cannot be published",
            weight: 2,
            hint: "Write to a staging location and swap on success. Publishing partial output is what turned a failure into an incident."
          }
        ],
        strongAnswer:
          "Handle the consumed data first: two downstream teams have used bad output for two days, so scope who is affected and tell them before you start debugging, because that damage is still spreading while you investigate. Then check whether this has happened before — nightly row counts are usually recoverable, and a repeat changes both the urgency and the likely cause. Say clearly that the worst defect is not the halving but the silence: a volume check comparing against the trailing median would have caught it the same night, and that gate is the highest-value thing to add. For the mechanism, look for partial failure rather than total failure — a source that returned early, a swallowed per-shard exception, a credential that expired on one partition — since a clean crash would have been noticed. Two structural fixes follow: fail the run instead of publishing when the volume gate trips, and make publication atomic by writing to a staging location and swapping on success, so a half-finished result can never become the live dataset."
      }
    ]
  },
  "oai-r3": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "oai-q3b",
        kind: "behavioral",
        prompt:
          "Tell me about a time you shipped something and later concluded it shouldn't have gone out the way it did. What happened?",
        context:
          "The round is about judgement on impact, not about process compliance.",
        followUps: [
          "What would you have needed to see beforehand to make the call differently?",
          "Who raised the concern, and what did you do with it?",
          "Did you change what you ship, or only how you ship it?"
        ],
        minutes: 20,
        signals: [
          {
            id: "oai-q3b-s1",
            label: "Picked a real call with real consequences rather than a process slip",
            weight: 3,
            hint: "'We skipped a code review' is procedural. The question is about something that reached people and had an effect you did not want."
          },
          {
            id: "oai-q3b-s2",
            label: "Explained what you knew at the time, fairly",
            weight: 3,
            hint: "Judge the decision on the information you had, not with hindsight. Interviewers listen for whether you can separate those."
          },
          {
            id: "oai-q3b-s3",
            label: "Described how the problem surfaced and how quickly you acted",
            weight: 3,
            hint: "Time to response matters more than time to perfection. Say what you did in the first hour."
          },
          {
            id: "oai-q3b-s4",
            label: "Took a position rather than staying neutral",
            weight: 3,
            hint: "This round rewards having a view. 'There were arguments on both sides' with no conclusion is the weakest possible answer."
          },
          {
            id: "oai-q3b-s5",
            label: "Distinguished what you would ship differently from how",
            weight: 2,
            hint: "Sometimes the thing was right and the rollout was wrong. Saying which shows you thought about it rather than absorbing blame generally."
          },
          {
            id: "oai-q3b-s6",
            label: "Avoided both defensiveness and self-flagellation",
            weight: 2,
            hint: "State the facts and the conclusion. Both extremes read as an inability to assess your own work."
          }
        ],
        strongAnswer:
          "Pick something that actually reached users and had an effect you did not want, not a process slip like a skipped review — the question is about judgement, not compliance. Lay out what you knew at the time and why the call was reasonable on that information, then say what you missed, keeping hindsight clearly separated from what was knowable. Cover how it surfaced and what you did in the first hour, since response time is the part you controlled. Take an actual position on what should have happened; this round rewards a view, and 'there were arguments on both sides' with no conclusion is the weakest available answer. Distinguish whether you would change what you shipped or only how you shipped it — that distinction shows you analysed it rather than absorbing blame in general. Deliver it evenly, without defensiveness and without performing regret."
      },
      {
        id: "oai-q3c",
        kind: "behavioral",
        prompt:
          "You find a capability in a system you're building that is more powerful than the product needs, and could be misused. The launch is in two weeks. What do you do?",
        context:
          "There is no obviously correct answer and the interviewer is not looking for one. They are watching how you reason about it.",
        followUps: [
          "Who do you involve, and when?",
          "What would make you willing to ship it anyway?",
          "What would make you stop the launch outright?"
        ],
        minutes: 20,
        signals: [
          {
            id: "oai-q3c-s1",
            label: "Tried to characterise the actual risk before deciding anything",
            weight: 3,
            hint: "Who could misuse it, how easily, and what is the worst realistic outcome. Deciding before scoping is the failure mode here in both directions."
          },
          {
            id: "oai-q3c-s2",
            label: "Looked for a middle path rather than ship-or-block",
            weight: 3,
            hint: "Gate it, rate-limit it, log it, restrict it to a smaller surface. Treating it as binary is what the question is testing."
          },
          {
            id: "oai-q3c-s3",
            label: "Raised it early and in writing, to people who can decide",
            weight: 3,
            hint: "Say who you tell and when. Sitting on a risk until after launch is the answer that fails this question."
          },
          {
            id: "oai-q3c-s4",
            label: "Named a threshold that would make you block the launch",
            weight: 3,
            hint: "Have a line. 'It depends' with no line means you have not thought about it."
          },
          {
            id: "oai-q3c-s5",
            label: "Weighed the cost of delay honestly rather than dismissing it",
            weight: 2,
            hint: "Delay has real cost and pretending otherwise reads as naive. Acknowledge it, then say why the risk does or does not outweigh it."
          },
          {
            id: "oai-q3c-s6",
            label: "Said how you would monitor it after shipping",
            weight: 2,
            hint: "If you ship with mitigations, say what you watch and what would make you pull it. A decision without a feedback loop is a guess."
          }
        ],
        strongAnswer:
          "Scope the risk before taking a position: who could misuse it, how much effort that takes, and what the worst realistic outcome is — deciding before scoping fails this question whether you decide to ship or to block. Then reject the binary. The useful answers are usually in between: put the capability behind a permission, rate-limit it, log its use, narrow the surface to the cases the product actually needs, or ship it dark. Raise it early and in writing to whoever can actually make the call, because quietly carrying a risk to launch is the answer that ends this round badly. Have a threshold you would stop the launch for, and say it — 'it depends' with no line means the thinking has not been done. Acknowledge that delay has a genuine cost rather than waving it away, and if you do ship with mitigations, say what you would monitor and what signal would make you pull it."
      }
    ]
  },
  "ant-r2": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "ant-q2b",
        kind: "system-design",
        prompt:
          "Design the serving stack for a large language model behind a public API. Requests vary from a few hundred tokens to very long contexts, and traffic is bursty.",
        context:
          "Assume a fixed pool of accelerators. Latency matters, but so does keeping the hardware busy. Some customers pay for lower latency than others.",
        followUps: [
          "What is your batching strategy, and what does it cost the slowest request?",
          "How do you stop one very long request starving everyone behind it?",
          "How do you handle a burst that exceeds capacity?"
        ],
        minutes: 45,
        signals: [
          {
            id: "ant-q2b-s1",
            label: "Named continuous batching rather than static batching",
            weight: 3,
            hint: "Static batches idle while waiting for the slowest sequence. Continuous batching admits and retires sequences per step, which is the whole reason throughput is acceptable."
          },
          {
            id: "ant-q2b-s2",
            label: "Separated the prefill and decode phases",
            weight: 3,
            hint: "Prefill is compute-bound and decode is memory-bandwidth-bound. Treating them identically is the single biggest structural mistake in this design."
          },
          {
            id: "ant-q2b-s3",
            label: "Made KV cache memory the explicit capacity limit",
            weight: 3,
            hint: "Admission is bounded by KV cache, not by request count. Say it, because it is what actually decides how many sequences fit."
          },
          {
            id: "ant-q2b-s4",
            label: "Protected short requests from long ones",
            weight: 3,
            hint: "Separate queues or a length-aware scheduler. One 200k-token request must not put a queue of short ones behind it."
          },
          {
            id: "ant-q2b-s5",
            label: "Gave a concrete overload behaviour",
            weight: 2,
            hint: "Shed with a clear status and a retry hint, and prioritise by tier. Queueing without bound turns a burst into a total outage."
          },
          {
            id: "ant-q2b-s6",
            label: "Named the metrics that matter for this workload",
            weight: 2,
            hint: "Time to first token and inter-token latency, separately, plus accelerator utilisation. A single average latency number hides everything important here."
          }
        ],
        strongAnswer:
          "Start from the two phases, because they behave differently: prefill is compute-bound and processes the whole prompt at once, decode is memory-bandwidth-bound and produces one token at a time. Use continuous batching rather than static batching so sequences join and leave the batch every step — a static batch idles until its slowest member finishes, which wastes most of the hardware. State the real capacity limit: KV cache memory, not request count, is what bounds how many sequences can be in flight, so admission control is a memory calculation. Isolate long requests, either with separate queues by prompt length or a scheduler that reserves capacity for short ones, otherwise a single very long context blocks everything behind it. For bursts, shed load explicitly with a clear status and retry guidance and prioritise by paid tier; unbounded queueing turns a short burst into a full outage. Measure time to first token and inter-token latency separately, plus utilisation — an average latency number hides both failure modes."
      },
      {
        id: "ant-q2c",
        kind: "system-design",
        prompt:
          "Design the system that evaluates a model before it ships: running a large suite of tests against candidate models and telling you whether the new one is better.",
        context:
          "Thousands of evaluations, some automatic and some requiring human judgement. Results have to be trustworthy enough to block a release.",
        followUps: [
          "How do you make a run reproducible six months later?",
          "How do you stop the evaluation set leaking into training?",
          "What do you do when two evaluations disagree?"
        ],
        minutes: 45,
        signals: [
          {
            id: "ant-q2c-s1",
            label: "Treated reproducibility as a versioning problem across every input",
            weight: 3,
            hint: "Model version, eval set version, prompt template, decoding parameters, grader version. Any one of those drifting invalidates a comparison, and this is the core of the question."
          },
          {
            id: "ant-q2c-s2",
            label: "Separated deterministic scoring from judgement-based scoring",
            weight: 3,
            hint: "Exact-match and unit-test style graders behave nothing like human or model judges. They need different pipelines, different latency and different trust."
          },
          {
            id: "ant-q2c-s3",
            label: "Raised contamination unprompted",
            weight: 3,
            hint: "An eval that leaked into training measures memorisation. Say how you would detect it — held-out sets, canaries, n-gram overlap checks."
          },
          {
            id: "ant-q2c-s4",
            label: "Reported uncertainty rather than a single number",
            weight: 3,
            hint: "With a few hundred items, a two-point difference is usually noise. Confidence intervals are what make this trustworthy enough to block a release."
          },
          {
            id: "ant-q2c-s5",
            label: "Designed for human grading as a first-class, slow path",
            weight: 2,
            hint: "Queues, rater agreement, adjudication for disagreements. Bolting humans onto an automated pipeline afterwards does not work."
          },
          {
            id: "ant-q2c-s6",
            label: "Made results immutable and comparable over time",
            weight: 2,
            hint: "Append-only results keyed by the full input version tuple, so a historical comparison stays valid and nobody can quietly re-score an old run."
          }
        ],
        strongAnswer:
          "Reproducibility is the backbone: a result is only meaningful as a tuple of model version, eval set version, prompt template, decoding parameters and grader version, and any one of those drifting silently makes two numbers incomparable. Store results append-only keyed by that whole tuple so a six-month-old comparison still holds and no one can quietly re-score history. Split the pipeline by grader type — deterministic graders like exact match or unit tests are fast and cheap, model-judged and human-judged evaluations are slow, noisy and need rater agreement and an adjudication path, so treat human grading as a first-class slow lane rather than something bolted on later. Raise contamination without being asked, because an eval that has leaked into training measures memorisation: keep held-out sets, plant canaries, and run overlap checks. Report every comparison with uncertainty, since on a few hundred items a two-point difference is usually noise, and a release gate built on point estimates will block good models and pass bad ones."
      }
    ]
  },
  "ant-r3": {
    questionsPerAttempt: 1,
    extra: [
      {
        id: "ant-q3b",
        kind: "behavioral",
        prompt:
          "Tell me about a time you changed your mind about something you'd argued for publicly.",
        context:
          "They are looking for whether you update on evidence, and whether you can do it without it costing you credibility.",
        followUps: [
          "What specifically changed your mind?",
          "How did you tell the people you had convinced of the first position?",
          "How long did it take you to update after the evidence arrived?"
        ],
        minutes: 20,
        signals: [
          {
            id: "ant-q3b-s1",
            label: "Named the specific evidence that moved you",
            weight: 3,
            hint: "'New data' is not an answer. Say what the data was and why it was decisive — the mechanism of the update is the whole question."
          },
          {
            id: "ant-q3b-s2",
            label: "Was public about the reversal, having been public about the position",
            weight: 3,
            hint: "Quietly changing course after arguing loudly leaves people acting on the old position. Say how you told them."
          },
          {
            id: "ant-q3b-s3",
            label: "Held the position honestly in the first place rather than pre-hedging",
            weight: 3,
            hint: "Advocating properly and then updating is the signal. A story where you always had doubts is a story about not committing."
          },
          {
            id: "ant-q3b-s4",
            label: "Was honest about the lag between evidence and update",
            weight: 2,
            hint: "Nobody updates instantly. Naming the delay, and what caused it, is more credible than claiming you turned immediately."
          },
          {
            id: "ant-q3b-s5",
            label: "Described the cost of the change and who absorbed it",
            weight: 2,
            hint: "Reversals cost time and credibility. Acknowledging that shows you understand the real weight of changing direction."
          },
          {
            id: "ant-q3b-s6",
            label: "Avoided framing it as a win",
            weight: 2,
            hint: "Updating is not a triumph, it is maintenance. Presenting it as a personal victory undercuts the point."
          }
        ],
        strongAnswer:
          "Choose something you genuinely argued for, not something you privately doubted the whole time — the signal is committing properly and then updating, and a story where you always had reservations is a story about not committing. Say precisely what changed your mind: the measurement, the incident, the counter-example, and why it was decisive rather than merely inconvenient. Then the part that matters most: how you told the people you had persuaded, since a quiet reversal leaves colleagues still acting on your old position. Be honest about the lag — nobody updates the moment evidence lands, so naming the delay and what caused it is more credible than claiming an instant turn. Acknowledge the cost, in time and in credibility, and who absorbed it. Deliver it plainly rather than as a triumph; changing your mind is maintenance, not a victory."
      },
      {
        id: "ant-q3c",
        kind: "behavioral",
        prompt:
          "Describe a situation where doing the careful thing meant being slower than everyone wanted. How did you handle the pressure?",
        context:
          "They want to see whether caution is a considered position or a reflex, and whether you can hold it without being obstructive.",
        followUps: [
          "How did you make the case for the extra time?",
          "What did you do to reduce the delay rather than just absorbing it?",
          "When have you decided the careful thing was not worth it?"
        ],
        minutes: 20,
        signals: [
          {
            id: "ant-q3c-s1",
            label: "Made the risk concrete rather than appealing to caution in general",
            weight: 3,
            hint: "Name the specific failure and its cost. 'We should be careful' is not an argument anyone can act on."
          },
          {
            id: "ant-q3c-s2",
            label: "Offered a way to go faster safely instead of only saying no",
            weight: 3,
            hint: "A narrower rollout, a stronger monitor, a smaller first step. Being the person who only blocks is not the signal here."
          },
          {
            id: "ant-q3c-s3",
            label: "Named who carried the risk if it went wrong",
            weight: 3,
            hint: "Users, a customer, a colleague on call. Locating the consequence outside yourself is what separates this from personal risk aversion."
          },
          {
            id: "ant-q3c-s4",
            label: "Set a decision point rather than an open-ended delay",
            weight: 2,
            hint: "'Two more days, and here is what we will know at the end of them.' Indefinite caution reads as obstruction."
          },
          {
            id: "ant-q3c-s5",
            label: "Gave an example of choosing speed instead",
            weight: 2,
            hint: "If you are careful about everything you are not exercising judgement. Have a counter-example ready."
          },
          {
            id: "ant-q3c-s6",
            label: "Kept the disagreement about the decision, not the people",
            weight: 2,
            hint: "Describe how you kept it collaborative under time pressure. Being right and unbearable is not a pass."
          }
        ],
        strongAnswer:
          "Make the risk concrete before anything else: the specific failure, how likely it is, what it costs and who absorbs it. 'We should be careful' cannot be acted on, and locating the consequence outside yourself — users, a customer, whoever is on call — is what distinguishes this from personal risk aversion. Then do not simply block: propose the version that is both faster and safe enough, a narrower first rollout, a stronger monitor, a smaller reversible step, because the person who only ever says no gets routed around. Bound the delay with a decision point rather than leaving it open — two days, and here is exactly what we will know at the end of them. Have a counter-example ready of a time you chose speed, since caution about everything is not judgement. And say how you kept it about the decision rather than the people, because being right and unbearable does not pass this round."
      }
    ]
  },
};
