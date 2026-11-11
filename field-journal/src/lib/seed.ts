import snapshotJson from './workspace-snapshot.json';
import { DIFFICULTIES, PROBLEMS, TOPIC_INDEX } from './data';
import { evidenceTopicIds } from './selectors';
import type { Problem, Snapshot, SystemState } from './types';

export const WORKSPACE_SEED_VERSION = 1;

export const WORKSPACE_SNAPSHOT = snapshotJson as unknown as Snapshot;

const EXTRA_TITLES: Record<string, string> = {
  '22-sum-of-odd-numbers': 'Sum of Odd Numbers',
  '23-sum-of-multiples': 'Sum of Multiples',
  '24-number-triangle': 'Number Triangle'
};

export interface SeedResult {
  applied: boolean;
  topics: number;
  problems: number;
  files: number;
  days: number;
}

export interface ProgressResult {
  topics: number;
  problems: number;
  reviews: number;
}

function titleFromFolder(folder: string): string {
  return folder
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function deriveWorkspaceProgress(state: SystemState): ProgressResult {
  let topics = 0;
  evidenceTopicIds(state).forEach((date, id) => {
    if (!TOPIC_INDEX.has(id)) return;
    if (!state.completedTopics.includes(id)) {
      state.completedTopics.push(id);
      topics += 1;
    }
    if (!state.topicCompletedAt[id]) state.topicCompletedAt[id] = date;
  });

  const latestCodeByProblem = new Map<string, string>();
  state.evidence.snapshot.files.forEach((file) => {
    if (file.kind !== 'code' || !file.problemId) return;
    const current = latestCodeByProblem.get(file.problemId);
    if (!current || new Date(file.date).getTime() > new Date(current).getTime()) latestCodeByProblem.set(file.problemId, file.date);
  });

  let problems = 0;
  let reviews = 0;
  const solve = (id: string, date: string) => {
    const current = state.problems[id];
    if (current?.status === 'solved') {
      if (
        current.solvedAt &&
        new Date(date).getTime() > new Date(current.solvedAt).getTime() + 1000 &&
        !current.review
      ) {
        current.review = true;
        reviews += 1;
      }
      return;
    }
    state.problems[id] = {
      status: 'solved',
      review: current?.review ?? false,
      attempts: Math.max(1, current?.attempts ?? 0),
      solvedAt: current?.solvedAt || date,
      attemptedAt: current?.attemptedAt || date,
      notes: current?.notes ?? ''
    };
    problems += 1;
  };

  PROBLEMS.forEach((problem) => {
    if (!problem.folder) return;
    const date = latestCodeByProblem.get(problem.folder);
    if (date) solve(problem.id, date);
  });

  const builtInFolders = new Set(PROBLEMS.map((problem) => problem.folder).filter(Boolean));
  let nextNumber =
    Math.max(23, ...PROBLEMS.map((problem) => problem.number), ...state.customProblems.map((problem) => problem.number)) + 1;

  latestCodeByProblem.forEach((date, folder) => {
    if (builtInFolders.has(folder)) return;
    const id = `workspace-${folder}`;
    const meta = state.evidence.snapshot.problemMeta?.[folder];
    const fallbackTitle = EXTRA_TITLES[folder] || titleFromFolder(folder);
    const existing = state.customProblems.find((problem) => problem.id === id);
    if (!existing) {
      const inferredDifficulty = meta?.difficulty;
      const difficulty: Problem['difficulty'] =
        inferredDifficulty && DIFFICULTIES[inferredDifficulty as keyof typeof DIFFICULTIES]
          ? (inferredDifficulty as Problem['difficulty'])
          : 'Practice';
      state.customProblems.push({
        id,
        number: nextNumber,
        title: meta?.title?.trim() || fallbackTitle,
        folder: null,
        track: 'problem-solving',
        difficulty,
        tags: meta?.tags?.length ? meta.tags.slice(0, 8) : ['workspace', 'auto-detected'],
        desc: `Detected from workspace folder ${folder}.`,
        custom: true
      });
      nextNumber += 1;
    } else if (meta) {
      if (existing.title === fallbackTitle && meta.title?.trim()) existing.title = meta.title.trim().slice(0, 120);
      if (existing.difficulty === 'Practice' && meta.difficulty && DIFFICULTIES[meta.difficulty as keyof typeof DIFFICULTIES]) {
        existing.difficulty = meta.difficulty as Problem['difficulty'];
      }
      const autoTags = existing.tags.every((tag) => ['workspace', 'auto-detected', 'extra practice'].includes(tag));
      if (autoTags && meta.tags?.length) existing.tags = meta.tags.slice(0, 8);
    }
    solve(id, date);
  });

  return { topics, problems, reviews };
}

export function applyWorkspaceSeed(state: SystemState): SeedResult {
  if (state.meta.seedVersion >= WORKSPACE_SEED_VERSION) {
    return {
      applied: false,
      topics: 0,
      problems: 0,
      files: state.evidence.snapshot.totals.files,
      days: state.evidence.snapshot.totals.days
    };
  }

  if (!state.evidence.snapshot.files.length) {
    state.evidence = {
      snapshot: { ...WORKSPACE_SNAPSHOT, source: 'baseline workspace' },
      importedAt: WORKSPACE_SNAPSHOT.generatedAt,
      source: 'baseline-workspace'
    };
  }

  const progress = deriveWorkspaceProgress(state);
  state.meta.seeded = true;
  state.meta.seedVersion = WORKSPACE_SEED_VERSION;

  return {
    applied: true,
    topics: progress.topics,
    problems: progress.problems,
    files: state.evidence.snapshot.totals.files,
    days: state.evidence.snapshot.totals.days
  };
}
