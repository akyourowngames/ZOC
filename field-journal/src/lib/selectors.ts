import {
  ACHIEVEMENTS,
  ALL_TOPICS,
  CHAPTERS,
  DAILY_QUESTS,
  DIFFICULTIES,
  DIFFICULTY_KEYS,
  EVIDENCE_TOPIC_RULES,
  PROBLEM_INDEX,
  PROBLEMS,
  STATS,
  TOPIC_INDEX,
  TRACKS,
  WEEKLY_QUESTS,
  classForStats,
  difficultyXp,
  rankForLevel
} from './data';
import {
  addDays,
  dateKey,
  humanDate,
  parseDate,
  startOfDay,
  startOfWeek,
  weekKey
} from './dates';
import type {
  Achievement,
  Chapter,
  Difficulty,
  EvidenceDay,
  EvidenceFile,
  Player,
  Problem,
  ProblemRecord,
  ProblemStatus,
  Quest,
  QuestProgress,
  Snapshot,
  StatKey,
  SystemState,
  TrackKey,
  XpItem
} from './types';

const QUEST_INDEX = new Map<string, Quest>([...DAILY_QUESTS, ...WEEKLY_QUESTS].map((quest) => [quest.id, quest]));

export const EMPTY_SNAPSHOT: Snapshot = {
  generatedAt: null,
  source: 'none',
  note: '',
  totals: { files: 0, code: 0, docs: 0, problems: 0, days: 0 },
  days: [],
  files: []
};

export function snapshot(state: SystemState): Snapshot {
  return state.evidence?.snapshot ?? EMPTY_SNAPSHOT;
}

export function allProblems(state: SystemState): Problem[] {
  return [...PROBLEMS, ...state.customProblems];
}

export function problemById(state: SystemState, id: string): Problem | null {
  return PROBLEM_INDEX.get(id) ?? state.customProblems.find((problem) => problem.id === id) ?? null;
}

export function normalizeProblemRecord(record?: Partial<ProblemRecord> | null): ProblemRecord {
  if (!record || typeof record !== 'object') return { status: 'todo', review: false, attempts: 0, solvedAt: null, attemptedAt: null, notes: '' };
  return {
    status: ['todo', 'attempted', 'solved'].includes(record.status as string) ? (record.status as ProblemStatus) : 'todo',
    review: Boolean(record.review),
    attempts: Number(record.attempts) || 0,
    solvedAt: record.solvedAt ?? null,
    attemptedAt: record.attemptedAt ?? null,
    notes: typeof record.notes === 'string' ? record.notes : ''
  };
}

export function problemRecord(state: SystemState, id: string): ProblemRecord {
  return normalizeProblemRecord(state.problems[id]);
}

export function manualSessions(state: SystemState) {
  return state.sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function sessionXp(session: { minutes: number; note: string; source?: 'manual' | 'watcher' }): number {
  const minutes = Math.min(180, Number(session.minutes) || 0);
  const noteBonus = session.source !== 'watcher' && session.note && session.note.trim() ? 10 : 0;
  return minutes + noteBonus;
}

export function totalMinutes(state: SystemState): number {
  return manualSessions(state).reduce((sum, session) => sum + Number(session.minutes || 0), 0);
}

export function chapterProgress(state: SystemState, chapterId: string) {
  const chapter = CHAPTERS.find((item) => item.id === chapterId);
  if (!chapter) return { done: 0, total: 0, percent: 0 };
  const done = chapter.topics.filter((topic) => state.completedTopics.includes(topic.id)).length;
  return { done, total: chapter.topics.length, percent: chapter.topics.length ? done / chapter.topics.length : 0 };
}

export function nextTopics(state: SystemState, limit = 4) {
  const result: (Chapter['topics'][number] & { chapterId: string; chapterTitle: string; chapterRank: string; color: string })[] = [];
  for (const chapter of CHAPTERS) {
    for (const topic of chapter.topics) {
      if (!state.completedTopics.includes(topic.id)) {
        result.push({ ...topic, chapterId: chapter.id, chapterTitle: chapter.title, chapterRank: chapter.rank, color: chapter.color });
        if (result.length >= limit) return result;
      }
    }
  }
  return result;
}

export function evidenceForProblem(state: SystemState, problem: Problem) {
  const empty = { files: [] as EvidenceFile[], code: 0, docs: 0, total: 0, implemented: false, documented: false, latest: null as string | null };
  if (!problem?.folder) return empty;
  const files = (snapshot(state).files || []).filter((file) => file.problemId === problem.folder);
  const code = files.filter((file) => file.kind === 'code').length;
  const docs = files.filter((file) => file.kind === 'doc').length;
  const latest = files.reduce<string | null>((latestDate, file) => {
    if (!latestDate) return file.date;
    return new Date(file.date).getTime() > new Date(latestDate).getTime() ? file.date : latestDate;
  }, null);
  return { files, code, docs, total: files.length, implemented: code > 0, documented: docs >= 2, latest };
}

export function evidenceTopicIds(state: SystemState): Map<string, string> {
  const found = new Map<string, string>();
  const note = (id: string, date: string) => {
    if (!TOPIC_INDEX.has(id)) return;
    const current = found.get(id);
    if (!current || new Date(date).getTime() > new Date(current).getTime()) found.set(id, date);
  };
  (snapshot(state).files || []).forEach((file) => {
    if (file.kind !== 'code' && file.kind !== 'doc') return;
    (file.topics || []).forEach((id) => note(id, file.date));
    EVIDENCE_TOPIC_RULES.forEach((rule) => {
      if (rule.match.test(file.path)) note(rule.topicId, file.date);
    });
  });
  return found;
}

export function applyEvidence(state: SystemState, options: { topics?: boolean; problems?: boolean } = {}) {
  const { topics = true, problems = false } = options;
  let topicCount = 0;
  let problemCount = 0;
  if (topics) {
    evidenceTopicIds(state).forEach((date, id) => {
      if (!state.completedTopics.includes(id)) {
        state.completedTopics.push(id);
        state.topicCompletedAt[id] = date;
        topicCount++;
      }
    });
  }
  if (problems) {
    allProblems(state).forEach((problem) => {
      const evidence = evidenceForProblem(state, problem);
      if (evidence.implemented && problemRecord(state, problem.id).status !== 'solved') {
        setProblemStatus(state, problem.id, 'solved', { solvedAt: evidence.latest });
        problemCount++;
      }
    });
  }
  return { topicCount, problemCount };
}

export function setProblemStatus(
  state: SystemState,
  id: string,
  status: ProblemStatus,
  extra: Partial<ProblemRecord> = {}
): ProblemRecord {
  const previous = problemRecord(state, id);
  const now = new Date().toISOString();
  const next: ProblemRecord = { ...previous, ...extra, status };
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

export function activeDaySet(state: SystemState): Set<string> {
  const days = new Set<string>();
  manualSessions(state).forEach((session) => days.add(dateKey(session.date)));
  (snapshot(state).days || []).forEach((day) => days.add(day.dateKey));
  Object.values(state.topicCompletedAt || {}).forEach((date) => {
    if (date) days.add(dateKey(date));
  });
  Object.values(state.problems || {}).forEach((record) => {
    if (record?.solvedAt) days.add(dateKey(record.solvedAt));
  });
  return days;
}

export function currentStreak(state: SystemState): number {
  const days = activeDaySet(state);
  let cursor = startOfDay(new Date());
  if (!days.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(state: SystemState): number {
  const sorted = [...activeDaySet(state)].sort();
  let best = 0;
  let run = 0;
  let previous: Date | null = null;
  sorted.forEach((key) => {
    const date = startOfDay(key);
    if (previous && Math.round((date.getTime() - previous.getTime()) / 86400000) === 1) run++;
    else run = 1;
    previous = date;
    best = Math.max(best, run);
  });
  return best;
}

export function activeToday(state: SystemState): boolean {
  return activeDaySet(state).has(dateKey(new Date()));
}

export function minutesOn(state: SystemState, key: string): number {
  return manualSessions(state)
    .filter((session) => dateKey(session.date) === key)
    .reduce((sum, session) => sum + Number(session.minutes || 0), 0);
}

export function solvedOn(state: SystemState, key: string): number {
  return allProblems(state).filter((problem) => {
    const record = problemRecord(state, problem.id);
    return record.status === 'solved' && record.solvedAt && dateKey(record.solvedAt) === key;
  }).length;
}

export function topicsOn(state: SystemState, key: string): number {
  return Object.entries(state.topicCompletedAt || {}).filter(([, date]) => date && dateKey(date) === key).length;
}

export function todayMetrics(state: SystemState) {
  const key = dateKey(new Date());
  const sessions = manualSessions(state).filter((session) => dateKey(session.date) === key);
  return {
    todayMinutes: sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0),
    todaySessions: sessions.length,
    todayNotes: sessions.filter((session) => session.note && session.note.trim()).length,
    todaySolved: solvedOn(state, key),
    todayTopics: topicsOn(state, key),
    streak: activeToday(state) ? currentStreak(state) : 0,
    activeToday: activeToday(state)
  };
}

export function weekMetrics(state: SystemState) {
  const start = startOfWeek(new Date(), state.settings.weekStart);
  const end = addDays(start, 7);
  const inWeek = (value: Date | string) => {
    const date = parseDate(value);
    return date >= start && date < end;
  };
  const sessions = manualSessions(state).filter((session) => inWeek(session.date));
  const activeDays = [...activeDaySet(state)].filter((key) => inWeek(startOfDay(key))).length;
  return {
    weekSessions: sessions.length,
    weekMinutes: sessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0),
    weekSolved: allProblems(state).filter((problem) => {
      const record = problemRecord(state, problem.id);
      return record.status === 'solved' && record.solvedAt && inWeek(record.solvedAt);
    }).length,
    weekTopics: Object.values(state.topicCompletedAt || {}).filter((date) => date && inWeek(date)).length,
    weekActiveDays: activeDays
  };
}

export function solvedCount(state: SystemState): number {
  return allProblems(state).filter((problem) => problemRecord(state, problem.id).status === 'solved').length;
}

export function reviewCount(state: SystemState): number {
  return allProblems(state).filter((problem) => problemRecord(state, problem.id).review).length;
}

export function timedMinutes(state: SystemState): number {
  return manualSessions(state)
    .filter((session) => session.track === 'zco' || session.track === 'ioi' || (session.tags || []).some((tag) => /timed|contest|mock/i.test(tag)))
    .reduce((sum, session) => sum + Number(session.minutes || 0), 0);
}

export function xpAtLevel(level: number): number {
  return 80 * (level - 1) ** 2;
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 80)) + 1;
}

export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const current = xpAtLevel(level);
  const next = xpAtLevel(level + 1);
  return {
    level,
    current,
    next,
    into: Math.max(0, xp - current),
    needed: next - current,
    percent: Math.min(100, Math.max(0, ((xp - current) / (next - current)) * 100))
  };
}

export function topicXp(state: SystemState): number {
  return state.completedTopics.reduce((sum, id) => sum + (TOPIC_INDEX.get(id)?.xp || 0), 0);
}

export function problemXp(state: SystemState): number {
  return allProblems(state).reduce((sum, problem) => {
    if (problemRecord(state, problem.id).status !== 'solved') return sum;
    return sum + difficultyXp(problem.difficulty);
  }, 0);
}

export function evidenceXp(state: SystemState): number {
  const files = snapshot(state).files || [];
  const code = files.filter((file) => file.kind === 'code').length;
  const docs = files.filter((file) => file.kind === 'doc').length;
  return code * 20 + docs * 5;
}

export function sessionXpTotal(state: SystemState): number {
  return manualSessions(state).reduce((sum, session) => sum + sessionXp(session), 0);
}

export function achievementXp(state: SystemState): number {
  return Object.keys(state.achievements || {}).reduce((sum, id) => sum + (ACHIEVEMENTS.find((item) => item.id === id)?.xp || 0), 0);
}

export function questXp(state: SystemState): number {
  let total = 0;
  Object.values(state.quests || {}).forEach((bucket) => {
    (['daily', 'weekly'] as const).forEach((scope) => {
      (bucket?.[scope] || []).forEach((id) => {
        total += QUEST_INDEX.get(id)?.xp || 0;
      });
    });
  });
  return total;
}

export function xpBreakdown(state: SystemState): { items: XpItem[]; total: number } {
  const items: XpItem[] = [
    { key: 'sessions', label: 'Focus sessions', xp: sessionXpTotal(state), detail: `${manualSessions(state).length} sessions` },
    { key: 'topics', label: 'Completed gates', xp: topicXp(state), detail: `${state.completedTopics.length} topics` },
    { key: 'problems', label: 'Dungeon clears', xp: problemXp(state), detail: `${solvedCount(state)} solved` },
    { key: 'evidence', label: 'Workspace evidence', xp: evidenceXp(state), detail: `${snapshot(state).totals?.code || 0} code · ${snapshot(state).totals?.docs || 0} docs` },
    { key: 'quests', label: 'Quest rewards', xp: questXp(state), detail: `${questsClaimedCount(state)} claimed` },
    { key: 'achievements', label: 'Achievements', xp: achievementXp(state), detail: `${Object.keys(state.achievements || {}).length} unlocked` }
  ];
  return { items, total: items.reduce((sum, item) => sum + item.xp, 0) };
}

export function totalXp(state: SystemState): number {
  return xpBreakdown(state).total;
}

export function computeStats(state: SystemState): Record<StatKey, number> {
  const topicRatio = ALL_TOPICS.length ? state.completedTopics.length / ALL_TOPICS.length : 0;
  const problems = allProblems(state);
  const totalWeight = problems.reduce((sum, problem) => sum + (DIFFICULTIES[problem.difficulty]?.order || 1), 0) || 1;
  const solvedWeight = problems.reduce(
    (sum, problem) => sum + (problemRecord(state, problem.id).status === 'solved' ? (DIFFICULTIES[problem.difficulty]?.order || 1) : 0),
    0
  );
  const problemRatio = solvedWeight / totalWeight;
  const problemCountRatio = problems.length ? solvedCount(state) / problems.length : 0;
  const chaptersDone = CHAPTERS.filter((chapter) => chapterProgress(state, chapter.id).percent === 1).length;
  const chapterRatio = chaptersDone / CHAPTERS.length;
  const timedRatio = Math.min(1, timedMinutes(state) / 300);
  const sessionRatio = Math.min(1, manualSessions(state).length / 30);
  const contestSolved = allProblems(state).filter(
    (problem) => (problem.track === 'zco' || problem.track === 'ioi') && problemRecord(state, problem.id).status === 'solved'
  ).length;
  const contestRatio = Math.min(1, contestSolved / 4);
  const streakRatio = Math.min(1, longestStreak(state) / 21);
  const activeRatio = Math.min(1, activeDaySet(state).size / 30);
  const documentedProblems = allProblems(state).filter((problem) => evidenceForProblem(state, problem).documented).length;
  const documentedRatio = problems.length ? documentedProblems / problems.length : 0;
  const noteSessions = manualSessions(state).filter((session) => session.note && session.note.trim()).length;
  const noteRatio = Math.min(1, noteSessions / 15);
  const docsRatio = Math.min(1, (snapshot(state).totals?.docs || 0) / 75);
  return {
    str: Math.round(10 + 90 * (0.7 * problemRatio + 0.3 * problemCountRatio)),
    int: Math.round(10 + 90 * (0.6 * topicRatio + 0.25 * problemRatio + 0.15 * chapterRatio)),
    agi: Math.round(10 + 90 * (0.6 * timedRatio + 0.25 * sessionRatio + 0.15 * contestRatio)),
    vit: Math.round(10 + 90 * (0.5 * streakRatio + 0.5 * activeRatio)),
    per: Math.round(10 + 90 * (0.4 * documentedRatio + 0.3 * noteRatio + 0.3 * docsRatio))
  };
}

export function player(state: SystemState): Player {
  const xp = totalXp(state);
  const progress = levelProgress(xp);
  const stats = computeStats(state);
  const rank = rankForLevel(progress.level);
  const cls = classForStats(stats);
  return {
    xp,
    ...progress,
    rank,
    cls,
    stats,
    power: progress.level * 100 + STATS.reduce((sum, stat) => sum + stats[stat.id], 0) * 10,
    title: rank.title,
    subtitle: `${rank.name} ${cls.name}`
  };
}

export function achievementValue(state: SystemState, type: Achievement['type'], target: number | string): number {
  switch (type) {
    case 'sessions': return manualSessions(state).length;
    case 'solved': return solvedCount(state);
    case 'problemSolved': return allProblems(state).filter((problem) => problemRecord(state, problem.id).status === 'solved' && !problem.custom).length;
    case 'topics': return state.completedTopics.length;
    case 'chapter': return chapterProgress(state, String(target)).percent === 1 ? 1 : 0;
    case 'chapters': return CHAPTERS.filter((chapter) => chapterProgress(state, chapter.id).percent === 1).length;
    case 'streak': return longestStreak(state);
    case 'minutes': return totalMinutes(state);
    case 'timedMinutes': return timedMinutes(state);
    case 'level': return levelForXp(totalXp(state));
    case 'evidenceCode': return snapshot(state).totals?.code || 0;
    case 'evidenceDocs': return snapshot(state).totals?.docs || 0;
    case 'review': return reviewCount(state);
    case 'questsClaimed': return questsClaimedCount(state);
    case 'xp': return totalXp(state);
    case 'nightOwl': return manualSessions(state).some((session) => parseDate(session.date).getHours() >= 22) ? 1 : 0;
    case 'earlyBird': return manualSessions(state).some((session) => parseDate(session.date).getHours() < 7) ? 1 : 0;
    default: return 0;
  }
}

export function evaluateAchievements(state: SystemState): Achievement[] {
  const unlocked: Achievement[] = [];
  for (let pass = 0; pass < 6; pass++) {
    let changed = false;
    ACHIEVEMENTS.forEach((achievement) => {
      if (state.achievements[achievement.id]) return;
      if (achievementValue(state, achievement.type, achievement.target) >= Number(achievement.target)) {
        state.achievements[achievement.id] = new Date().toISOString();
        unlocked.push(achievement);
        changed = true;
      }
    });
    if (!changed) break;
  }
  return unlocked;
}

export function questProgress(state: SystemState, scope: 'daily' | 'weekly', quest: Quest, date: Date = new Date()): QuestProgress {
  const metrics = (scope === 'daily' ? todayMetrics(state) : weekMetrics(state)) as unknown as Record<string, number>;
  const key = scope === 'daily' ? dateKey(date) : weekKey(date, state.settings.weekStart);
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

export function questsClaimedCount(state: SystemState): number {
  return Object.values(state.quests || {}).reduce((sum, bucket) => sum + (bucket?.daily?.length || 0) + (bucket?.weekly?.length || 0), 0);
}

export function questsForToday(state: SystemState) {
  return {
    daily: DAILY_QUESTS.map((quest) => ({ ...quest, progress: questProgress(state, 'daily', quest) })),
    weekly: WEEKLY_QUESTS.map((quest) => ({ ...quest, progress: questProgress(state, 'weekly', quest) }))
  };
}

export function heatmapData(state: SystemState, weeks = 16) {
  const today = startOfDay(new Date());
  const start = addDays(startOfWeek(today, state.settings.weekStart), -(weeks - 1) * 7);
  const evidenceByDay = new Map((snapshot(state).days || []).map((day) => [day.dateKey, day]));
  const result: {
    key: string;
    date: Date;
    level: number;
    minutes: number;
    solved: number;
    topics: number;
    files: number;
    future: boolean;
    label: string;
  }[][] = [];
  for (let week = 0; week < weeks; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = addDays(start, week * 7 + day);
      const key = dateKey(date);
      const evidence = evidenceByDay.get(key);
      const minutes = minutesOn(state, key);
      const solved = solvedOn(state, key);
      const topics = topicsOn(state, key);
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

export function weeklyXpSeries(state: SystemState, weeks = 8) {
  const currentStart = startOfWeek(new Date(), state.settings.weekStart);
  const start = addDays(currentStart, -(weeks - 1) * 7);
  const series = [];
  for (let index = 0; index < weeks; index++) {
    const weekStartDate = addDays(start, index * 7);
    const weekEnd = addDays(weekStartDate, 7);
    const inWeek = (value: Date | string) => {
      const date = parseDate(value);
      return date >= weekStartDate && date < weekEnd;
    };
    const sessionXpValue = manualSessions(state).filter((session) => inWeek(session.date)).reduce((sum, session) => sum + sessionXp(session), 0);
    const evidenceXpValue = (snapshot(state).files || []).filter((file) => inWeek(file.date)).reduce((sum, file) => sum + (file.kind === 'code' ? 20 : 5), 0);
    const topicXpValue = Object.entries(state.topicCompletedAt || {})
      .filter(([, date]) => date && inWeek(date))
      .reduce((sum, [id]) => sum + (TOPIC_INDEX.get(id)?.xp || 0), 0);
    const problemXpValue = allProblems(state)
      .filter((problem) => {
        const record = problemRecord(state, problem.id);
        return record.status === 'solved' && record.solvedAt && inWeek(record.solvedAt);
      })
      .reduce((sum, problem) => sum + difficultyXp(problem.difficulty), 0);
    const achievementXpValue = Object.entries(state.achievements || {})
      .filter(([, date]) => inWeek(date))
      .reduce((sum, [id]) => sum + (ACHIEVEMENTS.find((item) => item.id === id)?.xp || 0), 0);
    const minutes = manualSessions(state).filter((session) => inWeek(session.date)).reduce((sum, session) => sum + Number(session.minutes || 0), 0);
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

export function trackSplit(state: SystemState) {
  const totals: Partial<Record<TrackKey, number>> = {};
  manualSessions(state).forEach((session) => {
    totals[session.track] = (totals[session.track] || 0) + Number(session.minutes || 0);
  });
  let entries = Object.entries(totals).filter(([, value]) => (value || 0) > 0) as [TrackKey, number][];
  if (!entries.length) {
    allProblems(state).forEach((problem) => {
      if (problemRecord(state, problem.id).status === 'solved') totals[problem.track] = (totals[problem.track] || 0) + 1;
    });
    entries = Object.entries(totals).filter(([, value]) => (value || 0) > 0) as [TrackKey, number][];
  }
  return entries
    .map(([key, value]) => ({
      key,
      name: TRACKS[key]?.name || key,
      color: TRACKS[key]?.color || '#4f7188',
      value,
      unit: manualSessions(state).length ? 'min' : 'clears'
    }))
    .sort((a, b) => b.value - a.value);
}

export function difficultyBreakdown(state: SystemState) {
  return DIFFICULTY_KEYS.map((difficulty: Difficulty) => {
    const problems = allProblems(state).filter((problem) => problem.difficulty === difficulty);
    const solved = problems.filter((problem) => problemRecord(state, problem.id).status === 'solved').length;
    return {
      difficulty,
      total: problems.length,
      solved,
      percent: problems.length ? solved / problems.length : 0,
      ...DIFFICULTIES[difficulty]
    };
  });
}

export function insights(state: SystemState) {
  const sessions = manualSessions(state);
  const total = totalMinutes(state);
  const avg = sessions.length ? Math.round(total / sessions.length) : 0;
  const byDay = new Map<string, number>();
  sessions.forEach((session) => {
    const key = dateKey(session.date);
    byDay.set(key, (byDay.get(key) || 0) + Number(session.minutes || 0));
  });
  const best = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
  const weakest = CHAPTERS.map((chapter) => ({ chapter, progress: chapterProgress(state, chapter.id) }))
    .filter((entry) => entry.progress.percent < 1)
    .sort((a, b) => a.progress.percent - b.progress.percent)[0];
  const xp = totalXp(state);
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
    reviewQueue: allProblems(state).filter((problem) => problemRecord(state, problem.id).review),
    nextLevel,
    level
  };
}

export function xpEvents(state: SystemState) {
  const events: { date: string; label: string; type: string; xp: number }[] = [];
  manualSessions(state).forEach((session) => events.push({ date: session.date, label: session.topic, type: 'Session', xp: sessionXp(session) }));
  Object.entries(state.topicCompletedAt || {}).forEach(([id, date]) => {
    const topic = TOPIC_INDEX.get(id);
    if (topic && date) events.push({ date, label: topic.name, type: 'Gate', xp: topic.xp });
  });
  allProblems(state).forEach((problem) => {
    const record = problemRecord(state, problem.id);
    if (record.status === 'solved' && record.solvedAt) events.push({ date: record.solvedAt, label: problem.title, type: 'Dungeon', xp: difficultyXp(problem.difficulty) });
  });
  const achievementBuckets = new Map<string, { count: number; xp: number }>();
  Object.entries(state.achievements || {}).forEach(([id, date]) => {
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;
    const key = dateKey(date);
    const bucket = achievementBuckets.get(key) || { count: 0, xp: 0 };
    bucket.count += 1;
    bucket.xp += achievement.xp;
    achievementBuckets.set(key, bucket);
  });
  achievementBuckets.forEach((bucket, key) => {
    events.push({
      date: `${key}T12:00:00`,
      label: `${bucket.count} achievement${bucket.count === 1 ? '' : 's'} recorded`,
      type: 'Achievements',
      xp: bucket.xp
    });
  });
  Object.entries(state.quests || {}).forEach(([key, bucket]) => {
    const date = key.startsWith('week-') ? key.slice(5) : key;
    (['daily', 'weekly'] as const).forEach((scope) => {
      (bucket?.[scope] || []).forEach((id) => {
        const quest = QUEST_INDEX.get(id);
        if (quest) events.push({ date: `${date}T12:00:00`, label: quest.label, type: scope === 'daily' ? 'Daily quest' : 'Weekly quest', xp: quest.xp });
      });
    });
  });
  (snapshot(state).days || []).forEach((day: EvidenceDay) => {
    const xp = day.code * 20 + day.docs * 5;
    if (xp) events.push({ date: day.date, label: day.label, type: 'Evidence', xp });
  });
  return events
    .filter((event) => event.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

export function storageBytes(state: SystemState): number {
  try {
    return new Blob([JSON.stringify(state)]).size;
  } catch {
    return JSON.stringify(state).length;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
