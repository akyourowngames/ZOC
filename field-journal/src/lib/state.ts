import { APP } from './data';
import { toIso, uid } from './dates';
import type { Problem, ProblemRecord, Session, Snapshot, SystemState, TrackKey } from './types';
import { PROBLEM_INDEX, TOPIC_INDEX, TRACKS, DIFFICULTIES } from './data';
import { EMPTY_SNAPSHOT } from './selectors';

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {};

const asString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

const asNumber = (value: unknown, fallback = 0): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export function createDefaultState(nowIso: string = new Date().toISOString()): SystemState {
  const now = nowIso;
  return {
    version: APP.version,
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
      snapshot: { ...EMPTY_SNAPSHOT },
      importedAt: null,
      source: 'workspace-snapshot'
    },
    settings: { theme: 'paper', reduceMotion: false, weekStart: 1, sound: true },
    meta: { lastKnownLevel: null, lastKnownXp: 0, lastVisit: now, updatedAt: now, initialized: false, seeded: false, seedVersion: 0, soundMigrated: true }
  };
}

export function normalizeSnapshot(raw: unknown): Snapshot {
  const record = asRecord(raw);
  const totals = asRecord(record.totals);
  const files = Array.isArray(record.files)
    ? (record.files as unknown[]).map((item) => asRecord(item)).filter((item) => typeof item.path === 'string').map((item) => ({
        path: asString(item.path),
        name: asString(item.name, asString(item.path).split('/').pop() || ''),
        kind: item.kind === 'code' ? ('code' as const) : ('doc' as const),
        size: asNumber(item.size),
        date: asString(item.date, new Date().toISOString()),
        dateKey: asString(item.dateKey),
        category: asString(item.category, 'workspace'),
        problemId: typeof item.problemId === 'string' ? item.problemId : null,
        solution: Boolean(item.solution),
        role: asString(item.role, 'code'),
        root: typeof item.root === 'string' ? item.root : undefined,
        topics: Array.isArray(item.topics) ? item.topics.map(String).slice(0, 10) : undefined
      }))
    : [];
  const days = Array.isArray(record.days)
    ? (record.days as unknown[]).map((item) => asRecord(item)).filter((item) => typeof item.date === 'string').map((item) => ({
        date: asString(item.date),
        dateKey: asString(item.dateKey),
        files: asNumber(item.files),
        code: asNumber(item.code),
        docs: asNumber(item.docs),
        problems: Array.isArray(item.problems) ? item.problems.map(String) : [],
        label: asString(item.label)
      }))
    : [];
  const problemMetaRecord = asRecord(record.problemMeta);
  const problemMeta = Object.fromEntries(
    Object.entries(problemMetaRecord)
      .map(([key, value]) => {
        const meta = asRecord(value);
        return [
          key,
          {
            title: typeof meta.title === 'string' ? meta.title : undefined,
            difficulty: typeof meta.difficulty === 'string' ? meta.difficulty : undefined,
            tags: Array.isArray(meta.tags) ? meta.tags.map(String).slice(0, 8) : undefined
          }
        ] as const;
      })
      .filter(([, meta]) => meta.title || meta.difficulty || meta.tags?.length)
  ) as Snapshot['problemMeta'];
  return {
    generatedAt: record.generatedAt ? asString(record.generatedAt) : null,
    source: asString(record.source, 'none'),
    note: asString(record.note),
    totals: {
      files: asNumber(totals.files, files.length),
      code: asNumber(totals.code, files.filter((file) => file.kind === 'code').length),
      docs: asNumber(totals.docs, files.filter((file) => file.kind === 'doc').length),
      problems: asNumber(totals.problems),
      days: asNumber(totals.days, days.length)
    },
    days,
    files,
    ...(problemMeta && Object.keys(problemMeta).length ? { problemMeta } : {})
  };
}

function normalizeSession(raw: unknown): Session | null {
  const record = asRecord(raw);
  const topic = asString(record.topic).trim();
  if (!topic) return null;
  const track = asString(record.track) as TrackKey;
  return {
    id: asString(record.id, uid()),
    date: toIso(asString(record.date) || new Date()),
    topic: topic.slice(0, 140),
    track: TRACKS[track] ? track : 'foundations',
    minutes: Math.max(1, Math.min(1440, asNumber(record.minutes, 1))),
    note: asString(record.note).slice(0, 2000),
    tags: Array.isArray(record.tags) ? record.tags.slice(0, 8).map(String) : [],
    focus: Math.max(1, Math.min(5, asNumber(record.focus, 3))),
    problemId: typeof record.problemId === 'string' ? record.problemId : null,
    createdAt: asString(record.createdAt, new Date().toISOString()),
    source: record.source === 'watcher' ? 'watcher' : 'manual'
  };
}

function normalizeProblem(raw: unknown): Problem | null {
  const record = asRecord(raw);
  const id = asString(record.id);
  const title = asString(record.title);
  if (!id || !title) return null;
  const track = asString(record.track) as TrackKey;
  const difficulty = asString(record.difficulty);
  return {
    id,
    number: asNumber(record.number, 99),
    title: title.slice(0, 120),
    folder: null,
    track: TRACKS[track] ? track : 'problem-solving',
    difficulty: DIFFICULTIES[difficulty as keyof typeof DIFFICULTIES] ? (difficulty as Problem['difficulty']) : 'Practice',
    tags: Array.isArray(record.tags) ? record.tags.slice(0, 8).map(String) : [],
    desc: asString(record.desc, 'Custom dungeon.'),
    custom: true
  };
}

function normalizeRecord(raw: unknown): ProblemRecord {
  const record = asRecord(raw);
  const status = asString(record.status);
  return {
    status: status === 'attempted' || status === 'solved' ? status : 'todo',
    review: Boolean(record.review),
    attempts: asNumber(record.attempts),
    solvedAt: typeof record.solvedAt === 'string' ? record.solvedAt : null,
    attemptedAt: typeof record.attemptedAt === 'string' ? record.attemptedAt : null,
    notes: asString(record.notes)
  };
}

export function normalizeState(raw: unknown): SystemState {
  const base = createDefaultState();
  if (!raw || typeof raw !== 'object') return base;
  const record = asRecord(raw);
  const profile = asRecord(record.profile);
  const settings = asRecord(record.settings);
  const meta = asRecord(record.meta);
  const evidence = asRecord(record.evidence);

  const state: SystemState = {
    ...base,
    createdAt: asString(record.createdAt, base.createdAt),
    profile: {
      name: asString(profile.name, base.profile.name).trim().slice(0, 40) || 'Hunter',
      goalMinutesPerWeek: Math.max(30, Math.min(5000, asNumber(profile.goalMinutesPerWeek, 300))),
      dailyXpGoal: Math.max(10, Math.min(5000, asNumber(profile.dailyXpGoal, 150)))
    },
    settings: {
      theme: settings.theme === 'night' ? 'night' : 'paper',
      reduceMotion: Boolean(settings.reduceMotion),
      weekStart: asNumber(settings.weekStart) === 0 ? 0 : 1,
      sound: Boolean(settings.sound)
    },
    meta: {
      lastKnownLevel: meta.lastKnownLevel === null || meta.lastKnownLevel === undefined ? null : asNumber(meta.lastKnownLevel),
      lastKnownXp: asNumber(meta.lastKnownXp),
      lastVisit: asString(meta.lastVisit, base.meta.lastVisit),
      updatedAt: asString(meta.updatedAt, base.meta.updatedAt),
      initialized: Boolean(meta.initialized),
      seeded: Boolean(meta.seeded),
      seedVersion: asNumber(meta.seedVersion),
      soundMigrated: Boolean(meta.soundMigrated),
      daemonCursor: typeof meta.daemonCursor === 'string' ? meta.daemonCursor : undefined,
      workspaceVersion: typeof meta.workspaceVersion === 'string' ? meta.workspaceVersion : undefined,
      migratedFrom: typeof meta.migratedFrom === 'string' ? meta.migratedFrom : undefined
    }
  };

  const completed = Array.isArray(record.completedTopics) ? record.completedTopics.map(String) : [];
  state.completedTopics = [...new Set(completed)].filter((id) => TOPIC_INDEX.has(id));
  const topicDates = asRecord(record.topicCompletedAt);
  state.topicCompletedAt = Object.fromEntries(Object.entries(topicDates).filter(([, value]) => typeof value === 'string').map(([key, value]) => [key, value as string]));

  state.customProblems = Array.isArray(record.customProblems)
    ? record.customProblems.map(normalizeProblem).filter((problem): problem is Problem => Boolean(problem))
    : [];

  const customIds = new Set(state.customProblems.map((problem) => problem.id));
  const problems = asRecord(record.problems);
  state.problems = {};
  Object.entries(problems).forEach(([id, value]) => {
    if (PROBLEM_INDEX.has(id) || customIds.has(id)) state.problems[id] = normalizeRecord(value);
  });

  state.sessions = Array.isArray(record.sessions)
    ? record.sessions.map(normalizeSession).filter((session): session is Session => Boolean(session))
    : [];
  state.sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  state.achievements = {};
  if (Array.isArray(record.achievements)) {
    record.achievements.forEach((id) => {
      if (typeof id === 'string') state.achievements[id] = new Date().toISOString();
    });
  } else {
    const achievements = asRecord(record.achievements);
    Object.entries(achievements).forEach(([id, date]) => {
      state.achievements[id] = typeof date === 'string' ? date : new Date().toISOString();
    });
  }

  state.quests = {};
  Object.entries(asRecord(record.quests)).forEach(([key, bucket]) => {
    const bucketRecord = asRecord(bucket);
    state.quests[key] = {
      daily: Array.isArray(bucketRecord.daily) ? bucketRecord.daily.map(String) : [],
      weekly: Array.isArray(bucketRecord.weekly) ? bucketRecord.weekly.map(String) : []
    };
  });

  state.evidence = {
    snapshot: evidence.snapshot ? normalizeSnapshot(evidence.snapshot) : { ...EMPTY_SNAPSHOT },
    importedAt: typeof evidence.importedAt === 'string' ? evidence.importedAt : null,
    source: asString(evidence.source, 'workspace-snapshot')
  };
  if (!state.meta.soundMigrated) {
    state.settings.sound = true;
    state.meta.soundMigrated = true;
  }
  return state;
}
