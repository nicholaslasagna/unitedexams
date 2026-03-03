// ═══════════════════════════════════════════════════════════
//  United Exams — localStorage Storage API
// ═══════════════════════════════════════════════════════════

window.UE = window.UE || {};

(function() {
  var THEME_KEY = "ue-theme";
  var STREAK_KEY = "ue-streak";
  var PROGRESS_KEY = "ue-progress";

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  window.UE.storage = {
    // ── Theme ──
    getTheme: function() { return read(THEME_KEY, "dark"); },
    setTheme: function(theme) { write(THEME_KEY, theme); },

    // ── Streak ──
    getStreak: function() {
      return read(STREAK_KEY, { current: 0, best: 0, lastDate: null });
    },
    recordActivity: function() {
      var s = this.getStreak();
      var today = todayStr();
      if (s.lastDate === today) return s;

      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      var yStr = yesterday.toISOString().slice(0, 10);

      if (s.lastDate === yStr) {
        s.current += 1;
      } else {
        s.current = 1;
      }
      if (s.current > s.best) s.best = s.current;
      s.lastDate = today;
      write(STREAK_KEY, s);
      return s;
    },

    // ── Progress ──
    getProgress: function(quizId) {
      var all = read(PROGRESS_KEY, {});
      return all[quizId] || null;
    },
    getAllProgress: function() {
      return read(PROGRESS_KEY, {});
    },
    recordAttempt: function(quizId, score, raw) {
      var all = read(PROGRESS_KEY, {});
      var p = all[quizId] || { bestScore: 0, bestRaw: "", attempts: 0, lastAttempt: null, history: [] };
      p.attempts += 1;
      p.lastAttempt = new Date().toISOString();
      if (score > p.bestScore) { p.bestScore = score; p.bestRaw = raw; }
      p.history.push({ score: score, date: p.lastAttempt });
      if (p.history.length > 10) p.history = p.history.slice(-10);
      all[quizId] = p;
      write(PROGRESS_KEY, all);
      this.recordActivity();
      return p;
    },

    // ── Reset ──
    clearAll: function() {
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(STREAK_KEY);
      localStorage.removeItem(PROGRESS_KEY);
    }
  };
})();
