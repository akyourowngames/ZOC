/* ==========================================================================
   SYSTEM STORE — state, XP engine, quests, stats, imports, exports
   Depends on: data.js, workspace.js
   ========================================================================== */
(function () {
  'use strict';

  const D = window.SYSTEM_DATA;
  const STORAGE_KEY = D.STORAGE_KEY;
  const QUEST_INDEX = new Map([...D.DAILY_QUESTS, ...D.WEEKLY_QUESTS].map((quest) => [quest.id, quest]));
  const CODE_EXT = new Set(['cpp', 'cc', 'cxx', 'c', 'h', 'hpp', 'js', 'ts', 'py', 'java']);
  const DOC_EXT = new Set(['md', 'txt']);
  const IGNORED_PATH = /(^|\/)(\.git|\.qoder|\.commandcode|\.vscode|99-build-artifacts|node_modules|js|data|scripts)(\/|$)/i;
  const IGNORED_ROOT_FILE = /^(app\.js|index\.html|styles\.css|package(-lock)?\.json)$/i;

  /* --------------------------------------------------------------- storage */
  const memory = new Map();
  const storage = {
    get(key) {
      try {
        if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      } catch (error) {
        /* fall through to memory */
      }
      return memory.has(key) ? memory.get(key) : null;
    },
    set(key, value) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
          return;
        }
      } catch (error) {
        /* fall through to memory */
      }
      memory.set(key, value);
    },
    remove(key) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      } catch (error) {
        /* ignore */
      }
      memory.delete(key);
    }
  };

  /* ----------------------------------------------------------------- dates */
  const pad = (value) => String(value).padStart(2, '0');

  function dateKey(value = new Date()) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return dateKey(new Date());
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T12:00:00`);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function toIso(value = new Date()) {
    return parseDate(value).toISOString();
  }

  function startOfDay(value = new Date()) {
    const date = parseDate(value);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function addDays(value, amount) {
    const date = parseDate(value);
    date.setDate(date.getDate() + amount);
    return date;
  }

  function startOfWeek(value = new Date(), weekStart = 1) {
    const date = startOfDay(value);
    const diff = (date.getDay() - weekStart + 7) % 7;
    date.setDate(date.getDate() - diff);
    return date;
  }

  function weekKey(value = new Date()) {
    return `week-${dateKey(startOfWeek(value, state?.settings?.weekStart ?? 1))}`;
  }

  function humanDate(value, options = {}) {
    const date = parseDate(value);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      ...options
    }).format(date);
  }

  function longDate(value) {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(parseDate(value));
  }

  function relativeDate(value) {
    const then = startOfDay(value);
    const today = startOfDay(new Date());
    const diff = Math.round((today - then) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return `${diff} days ago`;
    return humanDate(value, { year: diff > 330 ? 'numeric' : undefined });
  }

  function uid() {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    } catch (error) {
      /* ignore */
    }
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /* ----------------------------------------------------------------- state */
  function emptySnapshot() {
    return { generatedAt: null, source: 'none', note: '', totals: { files: 0, code: 0, docs: 0, problems: 0, days: 0 }, days: [], files: [] };
  }

  function createDefaultState() {
    const now = new Date().toISOString();
    return {
      version: D.VERSION,
      createdAt: now,
      profile: { name: 'Hunter', goalMinutesPerWeek: 300, dailyXpGoal: 150 },
      completedTopics: [],
      topicCompletedAt: {},
      problems: {},
      customProblems: [],
      sessions: [],
      achievements: {},
      quests: {},
      evidence: {
        snapshot: window.WORKSPACE_SNAPSHOT || emptySnapshot(),
        importedAt: null,
        source: 'workspace-snapshot'
      },
      settings: { theme: 'dark', reduceMotion: false, weekStart: 1, sound: false },
      meta: { lastKnownLevel: null, lastKnownXp: 0, lastVisit: now, updatedAt: now, initialized: false }
    };
  }

  function normalizeProblemRecord(record) {
    if (!record || typeof record !== 'object') return { status: 'todo', review: false, attempts: 0 };
    return {
      status: ['todo', 'attempted', 'solved'].includes(record.status) ? record.status : 'todo',
      review: Boolean(record.review),
      attempts: Number(record.attempts) || 0,
      solvedAt: record.solvedAt || null,
      attemptedAt: record.attemptedAt || null,
      notes: typeof record.notes === 'string' ? record.notes : ''
    };
  }

  function normalizeState(raw) {
    const base = createDefaultState();
    if (!raw || typeof raw !== 'object') return base;
    const state = {
      ...base,
      ...raw,
      version: D.VERSION,
      profile: { ...base.profile, ...(raw.profile || {}) },
      settings: { ...base.settings, ...(raw.settings || {}) },
      meta: { ...base.meta, ...(raw.meta || {}) },
      evidence: {
        ...base.evidence,
        ...(raw.evidence || {}),
        snapshot: raw.evidence?.snapshot || window.WORKSPACE_SNAPSHOT || emptySnapshot()
      }
    };
    state.completedTopics = [...new Set((raw.completedTopics || []).filter((id) => D.topicIndex.has(id)))];
    state.topicCompletedAt = raw.topicCompletedAt && typeof raw.topicCompletedAt === 'object' ? raw.topicCompletedAt : {};
    state.problems = {};
    Object.entries(raw.problems || {}).forEach(([id, record]) => {
      if (D.problemIndex.has(id) || (raw.customProblems || []).some((problem) => problem.id === id)) {
        state.problems[id] = normalizeProblemRecord(record);
      }
    });
    state.customProblems = (raw.customProblems || []).filter((problem) => problem && problem.id && problem.title).map((problem) => ({
      id: String(problem.id),
      number: Number(problem.number) || 99,
      title: String(problem.title),
      folder: null,
      track: D.TRACKS[problem.track] ? problem.track : 'problem-solving',
      difficulty: D.DIFFICULTIES[problem.difficulty] ? problem.difficulty : 'Practice',
      tags: Array.isArray(problem.tags) ? problem.tags.slice(0, 8).map(String) : [],
      desc: String(problem.desc || 'Custom dungeon.'),
      custom: true
    }));
    state.sessions = (raw.sessions || [])
      .filter((session) => session && session.topic)
      .map((session) => ({
        id: session.id || uid(),
        date: toIso(session.date || new Date()),
        topic: String(session.topic),
        track: D.TRACKS[session.track] ? session.track : 'foundations',
        minutes: Math.max(1, Math.min(1440, Number(session.minutes) || 0)),
        note: typeof session.note === 'string' ? session.note : '',
        tags: Array.isArray(session.tags) ? session.tags.slice(0, 8).map(String) : [],
        focus: Math.max(1, Math.min(5, Number(session.focus) || 3)),
        problemId: session.problemId || null,
        createdAt: session.createdAt || session.date || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    state.achievements = {};
    if (Array.isArray(raw.achievements)) {
      raw.achievements.forEach((id) => { if (D.ACHIEVEMENTS.some((item) => item.id === id)) state.achievements[id] = new Date().toISOString(); });
    } else {
      Object.entries(raw.achievements || {}).forEach(([id, at]) => {
        if (D.ACHIEVEMENTS.some((item) => item.id === id)) state.achievements[id] = at || new Date().toISOString();
      });
    }
    state.quests = raw.quests && typeof raw.quests === 'object' ? raw.quests : {};
    return state;
  }

  function migrateLegacy(legacy) {
    const state = createDefaultState();
    state.meta.migratedFrom = 'v1';
    state.meta.migratedAt = new Date().toISOString();
    (legacy.completedTopics || []).forEach((name) => {
      const id = D.LEGACY_TOPIC_MAP[name];
      if (id && !state.completedTopics.includes(id)) {
        state.completedTopics.push(id);
        state.topicCompletedAt[id] = new Date().toISOString();
      }
    });
    const solved = new Set(legacy.solvedProblems || []);
    const attempted = new Set(legacy.attemptedProblems || []);
    solved.forEach((id) => {
      if (D.problemIndex.has(id)) state.problems[id] = { status: 'solved', review: false, attempts: 1, solvedAt: new Date().toISOString(), attemptedAt: new Date().toISOString(), notes: '' };
    });
    attempted.forEach((id) => {
      if (D.problemIndex.has(id) && !solved.has(id)) state.problems[id] = { status: 'attempted', review: false, attempts: 1, solvedAt: null, attemptedAt: new Date().toISOString(), notes: '' };
    });
    (legacy.sessions || []).filter((session) => session && session.source !== 'workspace' && session.topic).forEach((session) => {
      state.sessions.push({
        id: uid(),
        date: toIso(session.date || new Date()),
        topic: String(session.topic),
        track: D.TRACKS[session.track] ? session.track : 'foundations',
        minutes: Math.max(1, Math.min(1440, Number(session.minutes) || 1)),
        note: typeof session.note === 'string' ? session.note : '',
        tags: [],
        focus: 3,
        problemId: null,
        createdAt: toIso(session.date || new Date())
      });
    });
    state.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    (legacy.achievements || []).forEach((id) => {
      const mapped = D.LEGACY_ACHIEVEMENT_MAP[id];
      if (mapped) state.achievements[mapped] = new Date().toISOString();
    });
    return state;
  }

  function load() {
    const saved = storage.get(STORAGE_KEY);
    if (saved) {
      try {
        return normalizeState(JSON.parse(saved));
      } catch (error) {
        console.error('SYSTEM: saved state is corrupt. Trying legacy data.', error);
      }
    }
    for (const key of D.LEGACY_KEYS) {
      const legacyRaw = storage.get(key);
      if (!legacyRaw) continue;
      try {
        const legacy = JSON.parse(legacyRaw);
        const migrated = normalizeState(migrateLegacy(legacy));
        storage.set(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch (error) {
        console.error(`SYSTEM: could not migrate ${key}.`, error);
      }
    }
    return createDefaultState();
  }

  let state = load();

  function save() {
    state.meta.updatedAt = new Date().toISOString();
    state.meta.lastVisit = new Date().toISOString();
    try {
      storage.set(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('SYSTEM: could not save state.', error);
      return false;
    }
  }

  function storageBytes() {
    try {
      return new Blob([JSON.stringify(state)]).size;
    } catch (error) {
      return JSON.stringify(state).length;
    }
  }

  /* --------------------------------------------------------------- problems */
  function allProblems() {
    return [...D.PROBLEMS, ...state.customProblems];
  }

  function problemById(id) {
    return D.problemIndex.get(id) || state.customProblems.find((problem) => problem.id === id) || null;
  }

  function problemRecord(id) {
    return normalizeProblemRecord(state.problems[id]);
  }

  function setProblemStatus(id, status, extra = {}) {
    if (!['todo', 'attempted', 'solved'].includes(status)) return;
    const previous = problemRecord(id);
    const now = new Date().toISOString();
    const next = { ...previous, ...extra, status };
    if (status === 'attempted' && !next.attemptedAt) next.attemptedAt = now;
    if (status === 'solved') {
      next.attemptedAt = next.attemptedAt || now;
      next.solvedAt = next.solvedAt || now;
    }
    if (status === 'todo') {
      next.solvedAt = null;
      next.attemptedAt = null;
    }
    state.problems[id] = next;
    return next;
  }

  function cycleProblemStatus(id) {
    const order = ['todo', 'attempted', 'solved'];
    const current = problemRecord(id).status;
    return setProblemStatus(id, order[(order.indexOf(current) + 1) % order.length]);
  }

  function toggleReview(id) {
    const record = problemRecord(id);
    record.review = !record.review;
    state.problems[id] = record;
    return record.review;
  }

  function addProblem(data) {
    const id = `custom-${uid()}`;
    const problem = {
      id,
      number: allProblems().length + 1,
      title: String(data.title || 'Untitled dungeon').trim().slice(0, 120),
      folder: null,
      track: D.TRACKS[data.track] ? data.track : 'problem-solving',
      difficulty: D.DIFFICULTIES[data.difficulty] ? data.difficulty : 'Practice',
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 8) : String(data.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
      desc: String(data.desc || 'Custom dungeon.').slice(0, 400),
      custom: true
    };
    state.customProblems.push(problem);
    return problem;
  }

  function updateProblem(id, patch) {
    const problem = state.customProblems.find((item) => item.id === id);
    if (!problem) return null;
    if (patch.title !== undefined) problem.title = String(patch.title).trim().slice(0, 120) || problem.title;
    if (patch.track !== undefined && D.TRACKS[patch.track]) problem.track = patch.track;
    if (patch.difficulty !== undefined && D.DIFFICULTIES[patch.difficulty]) problem.difficulty = patch.difficulty;
    if (patch.tags !== undefined) problem.tags = String(patch.tags).split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
    if (patch.desc !== undefined) problem.desc = String(patch.desc).slice(0, 400);
    return problem;
  }

  function removeProblem(id) {
    state.customProblems = state.customProblems.filter((problem) => problem.id !== id);
    delete state.problems[id];
  }

  /* ---------------------------------------------------------------- evidence */
  function snapshot() {
    return state.evidence?.snapshot || emptySnapshot();
  }

  function evidenceForProblem(problem) {
    if (!problem || !problem.folder) return { files: [], code: 0, docs: 0, total: 0, implemented: false, documented: false, latest: null };
    const files = (snapshot().files || []).filter((file) => file.problemId === problem.folder);
    const code = files.filter((file) => file.kind === 'code').length;
    const docs = files.filter((file) => file.kind === 'doc').length;
    const latest = files.reduce((latestDate, file) => (!latestDate || file.date > latestDate ? file.date : latestDate), null);
    return { files, code, docs, total: files.length, implemented: code > 0, documented: docs >= 2, latest };
  }

  function evidenceTopicIds() {
    const found = new Map();
    (snapshot().files || []).forEach((file) => {
      if (file.kind !== 'code') return;
      D.EVIDENCE_TOPIC_RULES.forEach((rule) => {
        if (rule.match.test(file.path)) {
          const current = found.get(rule.topicId);
          if (!current || file.date > current) found.set(rule.topicId, file.date);
        }
      });
    });
    return found;
  }

  function applyEvidence(options = {}) {
    const { topics = true, problems = false } = options;
    let topicCount = 0;
    let problemCount = 0;
    if (topics) {
      evidenceTopicIds().forEach((date, id) => {
        if (!state.completedTopics.includes(id)) {
          state.completedTopics.push(id);
          state.topicCompletedAt[id] = date;
          topicCount++;
        }
      });
    }
    if (problems) {
      allProblems().forEach((problem) => {
        const evidence = evidenceForProblem(problem);
        if (evidence.implemented && problemRecord(problem.id).status !== 'solved') {
          setProblemStatus(problem.id, 'solved', { solvedAt: evidence.latest });
          problemCount++;
        }
      });
    }
    return { topicCount, problemCount };
  }

  /* ---------------------------------------------------------------- sessions */
  function manualSessions() {
    return state.sessions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function sessionXp(session) {
    return Math.min(180, Number(session.minutes) || 0) + (session.note && session.note.trim() ? 10 : 0);
  }

  function totalMinutes() {
    return manualSessions().reduce((sum, session) => sum + Number(session.minutes || 0), 0);
  }

  function buildSession(data) {
    return {
      id: uid(),
      date: toIso(data.date || new Date()),
      topic: String(data.topic || 'Focused practice').trim().slice(0, 140),
      track: D.TRACKS[data.track] ? data.track : 'foundations',
      minutes: Math.max(1, Math.min(1440, Number(data.minutes) || 1)),
      note: String(data.note || '').trim().slice(0, 2000),
      tags: String(data.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
      focus: Math.max(1, Math.min(5, Number(data.focus) || 3)),
      problemId: data.problemId || null,
      createdAt: new Date().toISOString()
    };
  }

  function sessionKey(session) {
    return `${session.date}|${session.topic}|${session.minutes}`;
  }

  function addSession(data) {
    const session = buildSession(data);
    state.sessions.unshift(session);
    return session;
  }

  function addSessions(list) {
    const seen = new Set(state.sessions.map(sessionKey));
    const added = [];
    list.forEach((data) => {
      const session = buildSession(data);
      const key = sessionKey(session);
      if (seen.has(key)) return;
      seen.add(key);
      state.sessions.unshift(session);
      added.push(session);
    });
    return added;
  }

  function updateSession(id, patch) {
    const session = state.sessions.find((item) => item.id === id);
    if (!session) return null;
    if (patch.date !== undefined) session.date = toIso(patch.date);
    if (patch.topic !== undefined) session.topic = String(patch.topic).trim().slice(0, 140);
    if (patch.track !== undefined && D.TRACKS[patch.track]) session.track = patch.track;
    if (patch.minutes !== undefined) session.minutes = Math.max(1, Math.min(1440, Number(patch.minutes) || 1));
    if (patch.note !== undefined) session.note = String(patch.note).trim().slice(0, 2000);
    if (patch.tags !== undefined) session.tags = String(patch.tags).split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
    if (patch.focus !== undefined) session.focus = Math.max(1, Math.min(5, Number(patch.focus) || 3));
    if (patch.problemId !== undefined) session.problemId = patch.problemId || null;
    state.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return session;
  }

  function deleteSession(id) {
    const index = state.sessions.findIndex((session) => session.id === id);
    if (index < 0) return null;
    return state.sessions.splice(index, 1)[0];
  }

  function restoreSession(session) {
    if (session) {
      state.sessions.push(session);
      state.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }

  /* ------------------------------------------------------------------ topics */
  function toggleTopic(id, done) {
    if (!D.topicIndex.has(id)) return false;
    const shouldComplete = done === undefined ? !state.completedTopics.includes(id) : Boolean(done);
    if (shouldComplete) {
      if (!state.completedTopics.includes(id)) state.completedTopics.push(id);
      state.topicCompletedAt[id] = state.topicCompletedAt[id] || new Date().toISOString();
    } else {
      state.completedTopics = state.completedTopics.filter((topic) => topic !== id);
      delete state.topicCompletedAt[id];
    }
    return shouldComplete;
  }

  function chapterProgress(chapterId) {
    const chapter = D.CHAPTERS.find((item) => item.id === chapterId);
    if (!chapter) return { done: 0, total: 0, percent: 0 };
    const done = chapter.topics.filter((topic) => state.completedTopics.includes(topic.id)).length;
    return { done, total: chapter.topics.length, percent: chapter.topics.length ? done / chapter.topics.length : 0 };
  }

  function nextTopics(limit = 4) {
    const result = [];
    for (const chapter of D.CHAPTERS) {
      for (const topic of chapter.topics) {
        if (!state.completedTopics.includes(topic.id)) {
          result.push({ ...topic, chapterId: chapter.id, chapterTitle: chapter.title, chapterRank: chapter.rank, color: chapter.color });
          if (result.length >= limit) return result;
        }
      }
    }
    return result;
  }

  /* ----------------------------------------------------------------- metrics */
  function activeDaySet() {
    const days = new Set();
    manualSessions().forEach((session) => days.add(dateKey(session.date)));
    (snapshot().days || []).forEach((day) => days.add(day.dateKey));
    Object.values(state.topicCompletedAt || {}).forEach((date) => { if (date) days.add(dateKey(date)); });
    Object.values(state.problems || {}).forEach((record) => { if (record?.solvedAt) days.add(dateKey(record.solvedAt)); });
    return days;
  }

  function currentStreak() {
    const days = activeDaySet();
    let cursor = startOfDay(new Date());
    if (!days.has(dateKey(cursor))) cursor = addDays(cursor, -1);
    let streak = 0;
    while (days.has(dateKey(cursor))) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function longestStreak() {
    const sorted = [...activeDaySet()].sort();
    let best = 0;
    let run = 0;
    let previous = null;
    sorted.forEach((key) => {
      const date = startOfDay(key);
      if (previous && Math.round((date - previous) / 86400000) === 1) run++;
      else run = 1;
      previous = date;
      best = Math.max(best, run);
    });
    return best;
  }

  function activeToday() {
    return activeDaySet().has(dateKey(new Date()));
  }

  function minutesOn(key) {
    return manualSessions().filter((session) => dateKey(session.date) === key).reduce((sum, session) => sum + Number(session.minutes || 0), 0);
  }

  function solvedOn(key) {
    return allProblems().filter((problem) => problemRecord(problem.id).status === 'solved' && problemRecord(problem.id).solvedAt && dateKey(problemRecord(problem.id).solvedAt) === key).length;
  }

  function topicsOn(key) {
    return Object.entries(state.topicCompletedAt || {}).filter(([, date]) => date && dateKey(date) === key).length;
  }

  function todayMetrics() {
    const key = dateKey(new Date());
    const sessions = manualSessions().filter((session) => dateKey(session.date) === key);
    return {
      todayMinutes: sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0),
      todaySessions: sessions.length,
      todayNotes: sessions.filter((session) => session.note && session.note.trim()).length,
      todaySolved: solvedOn(key),
      todayTopics: topicsOn(key),
      streak: activeToday() ? currentStreak() : 0,
      activeToday: activeToday()
    };
  }

  function weekMetrics() {
    const start = startOfWeek(new Date(), state.settings.weekStart);
    const end = addDays(start, 7);
    const inWeek = (value) => {
      const date = parseDate(value);
      return date >= start && date < end;
    };
    const sessions = manualSessions().filter((session) => inWeek(session.date));
    const activeDays = [...activeDaySet()].filter((key) => inWeek(startOfDay(key))).length;
    return {
      weekSessions: sessions.length,
      weekMinutes: sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0),
      weekSolved: allProblems().filter((problem) => problemRecord(problem.id).status === 'solved' && problemRecord(problem.id).solvedAt && inWeek(problemRecord(problem.id).solvedAt)).length,
      weekTopics: Object.values(state.topicCompletedAt || {}).filter((date) => date && inWeek(date)).length,
      weekActiveDays: activeDays
    };
  }

  function solvedCount() {
    return allProblems().filter((problem) => problemRecord(problem.id).status === 'solved').length;
  }

  function reviewCount() {
    return allProblems().filter((problem) => problemRecord(problem.id).review).length;
  }

  function timedMinutes() {
    return manualSessions().filter((session) => session.track === 'zco' || session.track === 'ioi' || (session.tags || []).some((tag) => /timed|contest|mock/i.test(tag))).reduce((sum, session) => sum + Number(session.minutes || 0), 0);
  }

  /* --------------------------------------------------------------------- XP */
  function xpAtLevel(level) {
    return 80 * (level - 1) ** 2;
  }

  function levelForXp(xp) {
    return Math.floor(Math.sqrt(Math.max(0, xp) / 80)) + 1;
  }

  function levelProgress(xp) {
    const level = levelForXp(xp);
    const current = xpAtLevel(level);
    const next = xpAtLevel(level + 1);
    return { level, current, next, into: Math.max(0, xp - current), needed: next - current, percent: Math.min(100, Math.max(0, ((xp - current) / (next - current)) * 100)) };
  }

  function topicXp() {
    return state.completedTopics.reduce((sum, id) => sum + (D.topicIndex.get(id)?.xp || 0), 0);
  }

  function problemXp() {
    return allProblems().reduce((sum, problem) => {
      if (problemRecord(problem.id).status !== 'solved') return sum;
      return sum + D.difficultyXp(problem.difficulty);
    }, 0);
  }

  function evidenceXp() {
    const files = snapshot().files || [];
    const code = files.filter((file) => file.kind === 'code').length;
    const docs = files.filter((file) => file.kind === 'doc').length;
    return code * 20 + docs * 5;
  }

  function sessionXpTotal() {
    return manualSessions().reduce((sum, session) => sum + sessionXp(session), 0);
  }

  function achievementXp() {
    return Object.keys(state.achievements || {}).reduce((sum, id) => sum + (D.ACHIEVEMENTS.find((item) => item.id === id)?.xp || 0), 0);
  }

  function questXp() {
    let total = 0;
    Object.values(state.quests || {}).forEach((bucket) => {
      ['daily', 'weekly'].forEach((scope) => {
        (bucket?.[scope] || []).forEach((id) => { total += QUEST_INDEX.get(id)?.xp || 0; });
      });
    });
    return total;
  }

  function xpBreakdown() {
    const items = [
      { key: 'sessions', label: 'Focus sessions', xp: sessionXpTotal(), detail: `${manualSessions().length} sessions` },
      { key: 'topics', label: 'Completed gates', xp: topicXp(), detail: `${state.completedTopics.length} topics` },
      { key: 'problems', label: 'Dungeon clears', xp: problemXp(), detail: `${solvedCount()} solved` },
      { key: 'evidence', label: 'Workspace evidence', xp: evidenceXp(), detail: `${snapshot().totals?.code || 0} code · ${snapshot().totals?.docs || 0} docs` },
      { key: 'quests', label: 'Quest rewards', xp: questXp(), detail: `${questsClaimedCount()} claimed` },
      { key: 'achievements', label: 'Achievements', xp: achievementXp(), detail: `${Object.keys(state.achievements || {}).length} unlocked` }
    ];
    const total = items.reduce((sum, item) => sum + item.xp, 0);
    return { items, total };
  }

  function totalXp() {
    return xpBreakdown().total;
  }

  function player() {
    const xp = totalXp();
    const progress = levelProgress(xp);
    const stats = computeStats();
    const rank = D.rankForLevel(progress.level);
    const cls = D.classForStats(stats);
    return {
      xp,
      ...progress,
      rank,
      cls,
      stats,
      power: progress.level * 100 + Object.values(stats).reduce((sum, value) => sum + value, 0) * 10,
      title: rank.title,
      subtitle: `${rank.name} ${cls.name}`
    };
  }

  function computeStats() {
    const topics = D.allTopics();
    const topicRatio = topics.length ? state.completedTopics.length / topics.length : 0;
    const problems = allProblems();
    const totalWeight = problems.reduce((sum, problem) => sum + (D.DIFFICULTIES[problem.difficulty]?.order || 1), 0) || 1;
    const solvedWeight = problems.reduce((sum, problem) => sum + (problemRecord(problem.id).status === 'solved' ? (D.DIFFICULTIES[problem.difficulty]?.order || 1) : 0), 0);
    const problemRatio = solvedWeight / totalWeight;
    const problemCountRatio = problems.length ? solvedCount() / problems.length : 0;
    const chaptersDone = D.CHAPTERS.filter((chapter) => chapterProgress(chapter.id).percent === 1).length;
    const chapterRatio = chaptersDone / D.CHAPTERS.length;
    const timedRatio = Math.min(1, timedMinutes() / 300);
    const sessionRatio = Math.min(1, manualSessions().length / 30);
    const contestSolved = allProblems().filter((problem) => (problem.track === 'zco' || problem.track === 'ioi') && problemRecord(problem.id).status === 'solved').length;
    const contestRatio = Math.min(1, contestSolved / 4);
    const streakRatio = Math.min(1, longestStreak() / 21);
    const activeRatio = Math.min(1, activeDaySet().size / 30);
    const documentedProblems = allProblems().filter((problem) => evidenceForProblem(problem).documented).length;
    const documentedRatio = problems.length ? documentedProblems / problems.length : 0;
    const noteSessions = manualSessions().filter((session) => session.note && session.note.trim()).length;
    const noteRatio = Math.min(1, noteSessions / 15);
    const docsRatio = Math.min(1, (snapshot().totals?.docs || 0) / 75);
    return {
      str: Math.round(10 + 90 * (0.7 * problemRatio + 0.3 * problemCountRatio)),
      int: Math.round(10 + 90 * (0.6 * topicRatio + 0.25 * problemRatio + 0.15 * chapterRatio)),
      agi: Math.round(10 + 90 * (0.6 * timedRatio + 0.25 * sessionRatio + 0.15 * contestRatio)),
      vit: Math.round(10 + 90 * (0.5 * streakRatio + 0.5 * activeRatio)),
      per: Math.round(10 + 90 * (0.4 * documentedRatio + 0.3 * noteRatio + 0.3 * docsRatio))
    };
  }

  /* ------------------------------------------------------------- achievements */
  function achievementValue(type, target) {
    switch (type) {
      case 'sessions': return manualSessions().length;
      case 'solved': return solvedCount();
      case 'problemSolved': return allProblems().filter((problem) => problemRecord(problem.id).status === 'solved' && !problem.custom).length;
      case 'topics': return state.completedTopics.length;
      case 'chapter': return chapterProgress(target).percent === 1 ? 1 : 0;
      case 'chapters': return D.CHAPTERS.filter((chapter) => chapterProgress(chapter.id).percent === 1).length;
      case 'streak': return longestStreak();
      case 'minutes': return totalMinutes();
      case 'timedMinutes': return timedMinutes();
      case 'level': return levelForXp(totalXp());
      case 'evidenceCode': return snapshot().totals?.code || 0;
      case 'evidenceDocs': return snapshot().totals?.docs || 0;
      case 'review': return reviewCount();
      case 'questsClaimed': return questsClaimedCount();
      case 'xp': return totalXp();
      case 'nightOwl': return manualSessions().some((session) => parseDate(session.date).getHours() >= 22) ? 1 : 0;
      case 'earlyBird': return manualSessions().some((session) => parseDate(session.date).getHours() < 7) ? 1 : 0;
      default: return 0;
    }
  }

  function evaluateAchievements() {
    const unlocked = [];
    for (let pass = 0; pass < 6; pass++) {
      let changed = false;
      D.ACHIEVEMENTS.forEach((achievement) => {
        if (state.achievements[achievement.id]) return;
        if (achievementValue(achievement.type, achievement.target) >= achievement.target) {
          state.achievements[achievement.id] = new Date().toISOString();
          unlocked.push(achievement);
          changed = true;
        }
      });
      if (!changed) break;
    }
    return unlocked;
  }

  function commit(options = {}) {
    const unlocked = evaluateAchievements();
    const xp = totalXp();
    const level = levelForXp(xp);
    const previousLevel = state.meta.lastKnownLevel;
    let levelUp = null;
    if (previousLevel !== null && previousLevel !== undefined && level > previousLevel) {
      levelUp = {
        from: previousLevel,
        to: level,
        rank: D.rankForLevel(level),
        previousRank: D.rankForLevel(previousLevel)
      };
    }
    state.meta.lastKnownLevel = Math.max(previousLevel || 1, level);
    state.meta.lastKnownXp = xp;
    state.meta.lastVisit = new Date().toISOString();
    state.meta.initialized = true;
    save();
    return { levelUp: options.silent ? null : levelUp, unlocked: options.silent ? [] : unlocked, xp, level };
  }

  /* ------------------------------------------------------------------ quests */
  function questProgress(scope, quest, date = new Date()) {
    const metrics = scope === 'daily' ? todayMetrics() : weekMetrics();
    const key = scope === 'daily' ? dateKey(date) : weekKey(date);
    const bucket = state.quests[key] || {};
    const claimed = bucket[scope] || [];
    const value = Number(metrics[quest.metric] || 0);
    return {
      value,
      target: quest.target,
      percent: Math.min(100, Math.round((value / quest.target) * 100)),
      complete: value >= quest.target,
      claimed: claimed.includes(quest.id),
      key
    };
  }

  function claimQuest(scope, questId, date = new Date()) {
    const quest = QUEST_INDEX.get(questId);
    if (!quest) return { ok: false, reason: 'Unknown quest.' };
    const progress = questProgress(scope, quest, date);
    if (!progress.complete) return { ok: false, reason: 'Quest is not complete yet.' };
    if (progress.claimed) return { ok: false, reason: 'Reward already claimed.' };
    const key = progress.key;
    state.quests[key] = state.quests[key] || {};
    state.quests[key][scope] = [...(state.quests[key][scope] || []), questId];
    return { ok: true, xp: quest.xp, quest };
  }

  function questsClaimedCount() {
    return Object.values(state.quests || {}).reduce((sum, bucket) => sum + (bucket?.daily?.length || 0) + (bucket?.weekly?.length || 0), 0);
  }

  function questsForToday() {
    return {
      daily: D.DAILY_QUESTS.map((quest) => ({ ...quest, progress: questProgress('daily', quest) })),
      weekly: D.WEEKLY_QUESTS.map((quest) => ({ ...quest, progress: questProgress('weekly', quest) }))
    };
  }

  /* ------------------------------------------------------------------ charts */
  function heatmapData(weeks = 16) {
    const today = startOfDay(new Date());
    const start = addDays(startOfWeek(today, state.settings.weekStart), -(weeks - 1) * 7);
    const evidenceByDay = new Map((snapshot().days || []).map((day) => [day.dateKey, day]));
    const result = [];
    for (let week = 0; week < weeks; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = addDays(start, week * 7 + day);
        const key = dateKey(date);
        const evidence = evidenceByDay.get(key);
        const minutes = minutesOn(key);
        const solved = solvedOn(key);
        const topics = topicsOn(key);
        const files = evidence?.files || 0;
        const score = minutes / 30 + files / 4 + solved * 2 + topics;
        const level = date > today ? -1 : score === 0 ? 0 : score < 1 ? 1 : score < 2.5 ? 2 : score < 5 ? 3 : 4;
        days.push({
          key,
          date,
          level,
          minutes,
          solved,
          topics,
          files,
          future: date > today,
          label: `${humanDate(date)} · ${minutes}m · ${files} files · ${solved} clears · ${topics} gates`
        });
      }
      result.push(days);
    }
    return result;
  }

  function weeklyXpSeries(weeks = 8) {
    const currentStart = startOfWeek(new Date(), state.settings.weekStart);
    const start = addDays(currentStart, -(weeks - 1) * 7);
    const series = [];
    for (let index = 0; index < weeks; index++) {
      const weekStartDate = addDays(start, index * 7);
      const weekEnd = addDays(weekStartDate, 7);
      const inWeek = (value) => {
        const date = parseDate(value);
        return date >= weekStartDate && date < weekEnd;
      };
      const sessionXpValue = manualSessions().filter((session) => inWeek(session.date)).reduce((sum, session) => sum + sessionXp(session), 0);
      const evidenceXpValue = (snapshot().files || []).filter((file) => inWeek(file.date)).reduce((sum, file) => sum + (file.kind === 'code' ? 20 : 5), 0);
      const topicXpValue = Object.entries(state.topicCompletedAt || {}).filter(([, date]) => date && inWeek(date)).reduce((sum, [id]) => sum + (D.topicIndex.get(id)?.xp || 0), 0);
      const problemXpValue = allProblems().filter((problem) => {
        const record = problemRecord(problem.id);
        return record.status === 'solved' && record.solvedAt && inWeek(record.solvedAt);
      }).reduce((sum, problem) => sum + D.difficultyXp(problem.difficulty), 0);
      const achievementXpValue = Object.entries(state.achievements || {})
        .filter(([, date]) => inWeek(date))
        .reduce((sum, [id]) => sum + (D.ACHIEVEMENTS.find((item) => item.id === id)?.xp || 0), 0);
      const minutes = manualSessions().filter((session) => inWeek(session.date)).reduce((sum, session) => sum + Number(session.minutes || 0), 0);
      series.push({
        key: dateKey(weekStartDate),
        label: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(weekStartDate),
        xp: sessionXpValue + evidenceXpValue + topicXpValue + problemXpValue + achievementXpValue,
        minutes,
        current: index === weeks - 1
      });
    }
    return series;
  }

  function trackSplit() {
    const totals = {};
    manualSessions().forEach((session) => {
      totals[session.track] = (totals[session.track] || 0) + Number(session.minutes || 0);
    });
    let entries = Object.entries(totals).filter(([, value]) => value > 0);
    if (!entries.length) {
      allProblems().forEach((problem) => {
        if (problemRecord(problem.id).status === 'solved') totals[problem.track] = (totals[problem.track] || 0) + 1;
      });
      entries = Object.entries(totals).filter(([, value]) => value > 0);
    }
    return entries.map(([key, value]) => ({
      key,
      name: D.TRACKS[key]?.name || key,
      color: D.TRACKS[key]?.color || '#4fd1ff',
      value,
      unit: manualSessions().length ? 'min' : 'clears'
    })).sort((a, b) => b.value - a.value);
  }

  function difficultyBreakdown() {
    return Object.keys(D.DIFFICULTIES).map((difficulty) => {
      const problems = allProblems().filter((problem) => problem.difficulty === difficulty);
      const solved = problems.filter((problem) => problemRecord(problem.id).status === 'solved').length;
      return { difficulty, total: problems.length, solved, percent: problems.length ? solved / problems.length : 0, ...D.DIFFICULTIES[difficulty] };
    });
  }

  function insights() {
    const sessions = manualSessions();
    const total = totalMinutes();
    const avg = sessions.length ? Math.round(total / sessions.length) : 0;
    const byDay = new Map();
    sessions.forEach((session) => {
      const key = dateKey(session.date);
      byDay.set(key, (byDay.get(key) || 0) + Number(session.minutes || 0));
    });
    const best = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    const weakest = D.CHAPTERS.map((chapter) => ({ chapter, progress: chapterProgress(chapter.id) }))
      .filter((entry) => entry.progress.percent < 1)
      .sort((a, b) => a.progress.percent - b.progress.percent)[0];
    const xp = totalXp();
    const level = levelForXp(xp);
    const nextLevel = xpAtLevel(level + 1);
    const recent = sessions.filter((session) => new Date(session.date) >= addDays(new Date(), -14));
    const dailyRate = recent.length ? recent.reduce((sum, session) => sum + sessionXp(session), 0) / 14 : 0;
    const daysToNext = dailyRate > 0 ? Math.ceil((nextLevel - xp) / dailyRate) : null;
    return {
      totalMinutes: total,
      avgSession: avg,
      bestDay: best ? { key: best[0], minutes: best[1] } : null,
      weakestChapter: weakest ? { id: weakest.chapter.id, title: weakest.chapter.title, percent: weakest.progress.percent } : null,
      daysToNext,
      dailyRate: Math.round(dailyRate),
      reviewQueue: allProblems().filter((problem) => problemRecord(problem.id).review),
      nextLevel,
      level
    };
  }

  /* ---------------------------------------------------------------- imports */
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = '';
    let quoted = false;
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (quoted) {
        if (char === '"' && text[index + 1] === '"') { value += '"'; index++; }
        else if (char === '"') quoted = false;
        else value += char;
      } else if (char === '"') quoted = true;
      else if (char === ',') { row.push(value); value = ''; }
      else if (char === '\n') { row.push(value); rows.push(row); row = []; value = ''; }
      else if (char !== '\r') value += char;
    }
    row.push(value);
    if (row.some((cell) => cell.trim())) rows.push(row);
    return rows;
  }

  function importSessionsCSV(text) {
    const rows = parseCSV(text).filter((row) => row.some((cell) => String(cell).trim()));
    if (!rows.length) return { sessions: [], errors: ['The CSV file is empty.'], skipped: 0 };
    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const hasHeader = header.some((cell) => ['date', 'topic', 'minutes', 'track', 'note'].includes(cell));
    const columns = hasHeader ? header : ['date', 'topic', 'track', 'minutes', 'note', 'tags'];
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const sessions = [];
    const errors = [];
    let skipped = 0;
    dataRows.forEach((row, index) => {
      const record = {};
      columns.forEach((column, columnIndex) => { record[column] = (row[columnIndex] || '').trim(); });
      const minutes = Number(record.minutes);
      const trackValue = String(record.track || '').trim().toLowerCase();
      if (!record.topic) { errors.push(`Row ${index + (hasHeader ? 2 : 1)}: missing topic.`); skipped++; return; }
      if (!Number.isFinite(minutes) || minutes <= 0) { errors.push(`Row ${index + (hasHeader ? 2 : 1)}: invalid minutes.`); skipped++; return; }
      const date = record.date
        ? (/^\d{4}-\d{2}-\d{2}$/.test(record.date) ? parseDate(record.date) : new Date(record.date))
        : new Date();
      if (Number.isNaN(date.getTime())) { errors.push(`Row ${index + (hasHeader ? 2 : 1)}: invalid date.`); skipped++; return; }
      const track = Object.keys(D.TRACKS).find((key) => key === trackValue || D.TRACKS[key].name.toLowerCase() === trackValue) || 'foundations';
      sessions.push({
        date: date.toISOString(),
        topic: record.topic,
        track,
        minutes,
        note: record.note || '',
        tags: record.tags || ''
      });
    });
    return { sessions, errors, skipped };
  }

  function sessionsToCSV() {
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = ['date', 'topic', 'track', 'minutes', 'note', 'tags', 'focus', 'problemId'];
    const rows = manualSessions().map((session) => [
      session.date, session.topic, session.track, session.minutes, session.note, (session.tags || []).join(', '), session.focus, session.problemId || ''
    ].map(escape).join(','));
    return [header.join(','), ...rows].join('\n');
  }

  function problemsToCSV() {
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = ['id', 'number', 'title', 'track', 'difficulty', 'status', 'review', 'solvedAt', 'tags', 'evidenceFiles'];
    const rows = allProblems().map((problem) => {
      const record = problemRecord(problem.id);
      const evidence = evidenceForProblem(problem);
      return [
        problem.id, problem.number, problem.title, problem.track, problem.difficulty, record.status,
        record.review ? 'yes' : 'no', record.solvedAt || '', (problem.tags || []).join(' '), evidence.total
      ].map(escape).join(',');
    });
    return [header.join(','), ...rows].join('\n');
  }

  function exportBackup() {
    return {
      app: 'sl-system-tracker',
      version: D.VERSION,
      exportedAt: new Date().toISOString(),
      state
    };
  }

  function importBackup(text, mode = 'merge') {
    let parsed;
    try {
      parsed = typeof text === 'string' ? JSON.parse(text) : text;
    } catch (error) {
      return { ok: false, reason: 'That file is not valid JSON.' };
    }
    const incoming = parsed?.state || parsed?.data || parsed;
    if (!incoming || typeof incoming !== 'object' || (!incoming.sessions && !incoming.completedTopics && !incoming.problems)) {
      return { ok: false, reason: 'This does not look like a tracker backup.' };
    }
    if (mode === 'replace') {
      state = normalizeState(incoming);
      save();
      return { ok: true, mode, sessions: state.sessions.length, topics: state.completedTopics.length, problems: Object.keys(state.problems).length };
    }
    const next = normalizeState(incoming);
    state.completedTopics = [...new Set([...state.completedTopics, ...next.completedTopics])];
    state.topicCompletedAt = { ...next.topicCompletedAt, ...state.topicCompletedAt };
    state.customProblems = [...state.customProblems];
    next.customProblems.forEach((problem) => { if (!state.customProblems.some((item) => item.id === problem.id)) state.customProblems.push(problem); });
    const existingSessions = new Set(state.sessions.map((session) => `${session.date}|${session.topic}|${session.minutes}`));
    let addedSessions = 0;
    next.sessions.forEach((session) => {
      const key = `${session.date}|${session.topic}|${session.minutes}`;
      if (!existingSessions.has(key)) { state.sessions.push(session); existingSessions.add(key); addedSessions++; }
    });
    state.sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    Object.entries(next.problems).forEach(([id, record]) => {
      const current = state.problems[id];
      if (!current || (current.status !== 'solved' && record.status === 'solved')) state.problems[id] = record;
    });
    state.achievements = { ...next.achievements, ...state.achievements };
    Object.entries(next.quests).forEach(([key, bucket]) => {
      state.quests[key] = state.quests[key] || { daily: [], weekly: [] };
      state.quests[key].daily = [...new Set([...(state.quests[key].daily || []), ...(bucket.daily || [])])];
      state.quests[key].weekly = [...new Set([...(state.quests[key].weekly || []), ...(bucket.weekly || [])])];
    });
    if (!state.evidence?.snapshot?.files?.length && next.evidence?.snapshot?.files?.length) state.evidence = next.evidence;
    save();
    return { ok: true, mode, sessions: addedSessions, topics: next.completedTopics.length, problems: Object.keys(next.problems).length };
  }

  function importMarkdownChecklist(text) {
    const lines = String(text || '').split(/\r?\n/);
    const checked = [];
    const unchecked = [];
    lines.forEach((line) => {
      const match = line.match(/^\s*[-*]\s*\[([ xX])\]\s+(.+?)\s*$/);
      if (!match) return;
      const name = match[2].replace(/`/g, '').trim();
      (match[1].toLowerCase() === 'x' ? checked : unchecked).push(name);
    });
    const resolve = (name) => {
      const normalized = name.toLowerCase();
      const byLegacy = Object.entries(D.LEGACY_TOPIC_MAP).find(([legacy]) => legacy.toLowerCase() === normalized);
      if (byLegacy) return byLegacy[1];
      const byName = D.allTopics().find((topic) => topic.name.toLowerCase() === normalized);
      if (byName) return byName.id;
      const fuzzy = D.allTopics().find((topic) => normalized.includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(normalized));
      return fuzzy?.id || null;
    };
    const applied = [];
    const skipped = [];
    checked.forEach((name) => {
      const id = resolve(name);
      if (id) {
        if (!state.completedTopics.includes(id)) {
          state.completedTopics.push(id);
          state.topicCompletedAt[id] = state.topicCompletedAt[id] || new Date().toISOString();
          applied.push(id);
        }
      } else skipped.push(name);
    });
    return { checked: checked.length, unchecked: unchecked.length, applied, skipped };
  }

  function importWorkspaceFiles(fileList, options = {}) {
    const incoming = [];
    Array.from(fileList || []).forEach((file) => {
      const path = String(file.webkitRelativePath || file.relativePath || file.name || '').replace(/\\/g, '/');
      if (!path || IGNORED_PATH.test(path) || IGNORED_ROOT_FILE.test(path)) return;
      if (Number(file.size) === 0) return;
      const extension = path.split('.').pop().toLowerCase();
      const kind = CODE_EXT.has(extension) ? 'code' : DOC_EXT.has(extension) ? 'doc' : null;
      if (!kind) return;
      const modified = new Date(Number(file.lastModified) || Date.now());
      const match = path.match(/(?:^|\/)problems\/(\d+)-([^/]+)\//i);
      incoming.push({
        path,
        name: path.split('/').pop(),
        kind,
        size: Number(file.size) || 0,
        date: modified.toISOString(),
        dateKey: dateKey(modified),
        category: path.startsWith('01-foundations/') ? 'foundations' : path.startsWith('02-problem-solving/') ? 'problem-solving' : path.startsWith('03-contests/') ? 'contests' : path.startsWith('04-reference/') ? 'reference' : 'workspace',
        problemId: match ? `${match[1]}-${match[2]}` : null,
        solution: kind === 'code',
        role: /(^|\/)(README|idea|notes)\.md$/i.test(path) ? 'notes' : kind === 'doc' ? 'doc' : 'code'
      });
    });
    if (!incoming.length) {
      return { totals: snapshot().totals || { files: 0, code: 0, docs: 0, problems: 0, days: 0 }, days: (snapshot().days || []).length, incoming: 0 };
    }
    const merged = new Map();
    if (options.merge !== false) {
      (snapshot().files || []).forEach((file) => merged.set(file.path, file));
    }
    incoming.forEach((file) => {
      const existing = merged.get(file.path);
      if (!existing || file.date >= existing.date) merged.set(file.path, file);
    });
    const files = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
    const byDate = new Map();
    files.forEach((file) => {
      if (!byDate.has(file.dateKey)) byDate.set(file.dateKey, []);
      byDate.get(file.dateKey).push(file);
    });
    const days = [...byDate.entries()].map(([key, items]) => ({
      date: `${key}T23:59:00.000Z`,
      dateKey: key,
      files: items.length,
      code: items.filter((item) => item.kind === 'code').length,
      docs: items.filter((item) => item.kind === 'doc').length,
      problems: [...new Set(items.map((item) => item.problemId).filter(Boolean))],
      label: `${items.length} source and note files updated`
    })).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    const totals = {
      files: files.length,
      code: files.filter((file) => file.kind === 'code').length,
      docs: files.filter((file) => file.kind === 'doc').length,
      problems: new Set(files.map((file) => file.problemId).filter(Boolean)).size,
      days: days.length
    };
    state.evidence = {
      snapshot: {
        generatedAt: new Date().toISOString(),
        source: 'folder-import',
        note: 'Imported from a selected workspace folder. File existence is evidence, not mastery.',
        totals,
        days,
        files
      },
      importedAt: new Date().toISOString(),
      source: 'folder-import'
    };
    save();
    return { totals, days: days.length, incoming: incoming.length };
  }

  /* -------------------------------------------------------------- maintenance */
  function updateProfile(patch) {
    state.profile = { ...state.profile, ...patch };
    if (state.profile.goalMinutesPerWeek !== undefined) state.profile.goalMinutesPerWeek = Math.max(30, Math.min(5000, Number(state.profile.goalMinutesPerWeek) || 300));
    if (state.profile.dailyXpGoal !== undefined) state.profile.dailyXpGoal = Math.max(10, Math.min(5000, Number(state.profile.dailyXpGoal) || 150));
    if (typeof state.profile.name === 'string') state.profile.name = state.profile.name.trim().slice(0, 40) || 'Hunter';
  }

  function updateSettings(patch) {
    state.settings = { ...state.settings, ...patch };
    state.settings.theme = state.settings.theme === 'light' ? 'light' : 'dark';
    state.settings.weekStart = Number(state.settings.weekStart) === 0 ? 0 : 1;
  }

  function resetProgress() {
    state.completedTopics = [];
    state.topicCompletedAt = {};
    state.problems = {};
    state.sessions = [];
    state.achievements = {};
    state.quests = {};
    state.meta.lastKnownLevel = null;
    state.meta.lastKnownXp = 0;
    save();
  }

  function resetAll() {
    state = createDefaultState();
    state.evidence.snapshot = window.WORKSPACE_SNAPSHOT || emptySnapshot();
    save();
  }

  function replaceEvidenceSnapshot(snapshotValue) {
    if (!snapshotValue || !Array.isArray(snapshotValue.files)) return false;
    state.evidence = { snapshot: snapshotValue, importedAt: new Date().toISOString(), source: snapshotValue.source || 'manual' };
    save();
    return true;
  }

  function getState() {
    return state;
  }

  function initializeMeta() {
    const xp = totalXp();
    if (state.meta.lastKnownLevel === null || state.meta.lastKnownLevel === undefined) {
      state.meta.lastKnownLevel = levelForXp(xp);
      state.meta.lastKnownXp = xp;
      save();
    }
  }

  window.SYSTEM_STORE = {
    // lifecycle
    getState,
    save,
    commit,
    initializeMeta,
    storageBytes,
    // dates
    dateKey,
    parseDate,
    humanDate,
    longDate,
    relativeDate,
    startOfWeek,
    weekKey,
    addDays,
    // data access
    allProblems,
    problemById,
    problemRecord,
    setProblemStatus,
    cycleProblemStatus,
    toggleReview,
    addProblem,
    updateProblem,
    removeProblem,
    evidenceForProblem,
    evidenceTopicIds,
    applyEvidence,
    // topics
    toggleTopic,
    chapterProgress,
    nextTopics,
    // sessions
    manualSessions,
    sessionXp,
    totalMinutes,
    addSession,
    addSessions,
    updateSession,
    deleteSession,
    restoreSession,
    // metrics
    activeDaySet,
    currentStreak,
    longestStreak,
    activeToday,
    minutesOn,
    solvedOn,
    topicsOn,
    todayMetrics,
    weekMetrics,
    solvedCount,
    reviewCount,
    timedMinutes,
    // xp + player
    xpAtLevel,
    levelForXp,
    levelProgress,
    xpBreakdown,
    totalXp,
    player,
    computeStats,
    achievementValue,
    // quests
    questProgress,
    claimQuest,
    questsClaimedCount,
    questsForToday,
    // analytics
    heatmapData,
    weeklyXpSeries,
    trackSplit,
    difficultyBreakdown,
    insights,
    // imports / exports
    importSessionsCSV,
    sessionsToCSV,
    problemsToCSV,
    exportBackup,
    importBackup,
    importMarkdownChecklist,
    importWorkspaceFiles,
    replaceEvidenceSnapshot,
    // settings
    updateProfile,
    updateSettings,
    resetProgress,
    resetAll,
    snapshot,
    emptySnapshot,
    storage
  };
})();
