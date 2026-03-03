// ═══════════════════════════════════════════════════════════
//  United Exams — Quiz Engine Utilities
//  Plain JS (no JSX) — loaded before app.js
// ═══════════════════════════════════════════════════════════

window.UE = window.UE || {};

(function() {

  /* ═══ Fisher-Yates Shuffle ═══ */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ═══ Grade Fill-in-the-Blank ═══ */
  function gradeFill(q, input) {
    if (!input || !input.trim()) return false;
    var val = input.trim().toLowerCase();
    if (q.acceptableAnswers) {
      return q.acceptableAnswers.some(function(acc) {
        return acc.length === 1
          ? val.includes(acc[0].toLowerCase())
          : acc.every(function(w) { return val.includes(w.toLowerCase()); });
      });
    }
    return q.answer.some(function(a) { return val.includes(a.toLowerCase()); });
  }

  /* ═══ Option Shuffler ═══ */
  function shuffleOptions(q) {
    if (q.type === "fill" || q.type === "free") return Object.assign({}, q);
    if (q.options.length === 2 && q.options[0] === "True" && q.options[1] === "False") return Object.assign({}, q);
    var indexed = q.options.map(function(text, i) { return { orig: i, text: text }; });
    for (var i = indexed.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = indexed[i]; indexed[i] = indexed[j]; indexed[j] = tmp;
    }
    var origToNew = {};
    indexed.forEach(function(item, newIdx) { origToNew[item.orig] = newIdx; });
    var newAnswer = q.answer.map(function(a) { return origToNew[a]; });
    return Object.assign({}, q, { options: indexed.map(function(item) { return item.text; }), answer: newAnswer });
  }

  /* ═══ Generalized Exam Builder ═══ */
  function buildExam(bank, config) {
    config = config || {};
    var chapters = config.chapters || [1, 2, 3, 4];
    var chapterTargets = config.chapterTargets || {};
    var maxQuestions = config.maxQuestions || 29;
    var includeProfessor = config.professorQuestions !== false;
    var includeFree = config.freeResponseIncluded !== false;

    var profQs = includeProfessor ? bank.filter(function(q) { return q.fromProfessor; }) : [];
    var freeQs = includeFree ? bank.filter(function(q) { return q.type === "free"; }) : [];
    var pool = bank.filter(function(q) { return !q.fromProfessor && q.type !== "free"; });

    var byChapter = {};
    chapters.forEach(function(ch) { byChapter[ch] = []; });
    pool.forEach(function(q) { if (byChapter[q.chapter]) byChapter[q.chapter].push(q); });
    Object.keys(byChapter).forEach(function(k) { byChapter[k] = shuffle(byChapter[k]); });

    // If no targets specified, distribute evenly
    if (Object.keys(chapterTargets).length === 0) {
      var perCh = Math.floor(maxQuestions / chapters.length);
      chapters.forEach(function(ch) { chapterTargets[ch] = perCh; });
    }

    var selected = [];
    Object.keys(chapterTargets).forEach(function(ch) {
      var count = chapterTargets[ch];
      var avail = byChapter[ch] || [];
      var fills = avail.filter(function(q) { return q.type === "fill"; });
      var others = avail.filter(function(q) { return q.type !== "fill"; });
      var fc = Math.min(fills.length, Math.floor(count * 0.25) + 1);
      selected = selected.concat(fills.slice(0, fc), others.slice(0, count - fc));
    });
    selected = selected.slice(0, maxQuestions);

    var all = shuffle(profQs).concat(shuffle(selected), freeQs);
    return all.map(function(q) { return shuffleOptions(q); });
  }

  /* ═══ Reinforcement Builder ═══ */
  function buildReinforcement(wrongQuestions, mainBank, reinforceBank) {
    var weakTopics = {};
    var wrongIds = {};
    wrongQuestions.forEach(function(q) {
      wrongIds[q.id] = true;
      if (q.topics) q.topics.forEach(function(t) { weakTopics[t] = true; });
    });

    var retryQs = wrongQuestions.slice();

    var relatedReinforce = (reinforceBank || []).filter(function(q) {
      return !wrongIds[q.id] && q.topics && q.topics.some(function(t) { return weakTopics[t]; });
    });

    var relatedMain = mainBank.filter(function(q) {
      return !wrongIds[q.id] && q.type !== "free" && q.topics && q.topics.some(function(t) { return weakTopics[t]; });
    });

    var combined = shuffle(retryQs).concat(shuffle(relatedReinforce), shuffle(relatedMain));

    var seen = {};
    var deduped = combined.filter(function(q) {
      if (seen[q.id]) return false;
      seen[q.id] = true;
      return true;
    });

    return {
      questions: deduped.slice(0, 20).map(function(q) { return shuffleOptions(q); }),
      topics: Object.keys(weakTopics)
    };
  }

  // Export
  window.UE.shuffle = shuffle;
  window.UE.gradeFill = gradeFill;
  window.UE.shuffleOptions = shuffleOptions;
  window.UE.buildExam = buildExam;
  window.UE.buildReinforcement = buildReinforcement;

})();
