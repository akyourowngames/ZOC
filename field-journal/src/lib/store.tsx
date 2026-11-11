'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { APP, DAILY_QUESTS, TRACKS, WEEKLY_QUESTS, difficultyXp, rankForLevel } from './data';
import { dateKey, toIso, uid } from './dates';
import {
  allProblems,
  applyEvidence as applyEvidenceSelector,
  evaluateAchievements,
  levelForXp,
  problemRecord,
  questProgress,
  questsForToday,
  sessionXp,
  setProblemStatus,
  totalXp
} from './selectors';
import { createDefaultState, normalizeSnapshot, normalizeState } from './state';
import { applyWorkspaceSeed, deriveWorkspaceProgress } from './seed';
import type { DaemonSession } from './daemonTypes';
import { playSfx, type SfxName } from './sfx';
import {
  buildSession,
  exportBackup,
  importBackup,
  importMarkdownChecklist,
  importSessionsCSV,
  importWorkspaceFiles,
  problemsToCSV,
  sessionsToCSV,
  type ImportResult,
  type SessionInput
} from './importExport';
import type {
  LevelUpInfo,
  Problem,
  ProblemStatus,
  Session,
  Settings,
  Snapshot,
  SystemState,
  TrackKey
} from './types';

export type ToastType = 'info' | 'success' | 'error' | 'achievement' | 'level';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface CommitOptions<T = unknown> {
  message?: string | ((result: T) => string);
  toastType?: ToastType;
  sound?: SfxName;
  silent?: boolean;
}

interface Actions {
  addSession: (data: SessionInput) => Session;
  updateSession: (id: string, patch: SessionInput) => void;
  deleteSessionWithUndo: (id: string) => void;
  restoreSession: (session: Session) => void;
  toggleTopic: (id: string) => boolean;
  cycleProblemStatus: (id: string) => ProblemStatus;
  toggleReview: (id: string) => boolean;
  addProblem: (data: { title: string; track: string; difficulty: string; tags: string; desc: string }) => Problem;
  updateProblem: (id: string, data: { title: string; track: string; difficulty: string; tags: string; desc: string }) => void;
  removeProblem: (id: string) => void;
  claimQuest: (scope: 'daily' | 'weekly', questId: string) => { ok: boolean; reason?: string; xp?: number };
  claimAllQuests: () => { count: number; xp: number };
  applyEvidence: (kind: 'topics' | 'problems') => { topicCount: number; problemCount: number };
  updateProfile: (patch: Partial<SystemState['profile']>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setSound: (value: boolean) => void;
  saveProfile: (profile: Partial<SystemState['profile']>, settings: Partial<Settings>) => void;
  resetProgress: () => void;
  resetAll: () => void;
  importBackupText: (text: string, mode: 'merge' | 'replace') => ImportResult;
  importSessionsText: (text: string) => { added: number; skipped: number; errors: string[] };
  importMarkdownText: (text: string) => { applied: number; skipped: number };
  importWorkspace: (files: FileList | File[], merge: boolean) => { incoming: number; files: number; days: number };
  exportBackupJSON: () => ReturnType<typeof exportBackup>;
  exportSessionsCSV: () => string;
  exportProblemsCSV: () => string;
  syncWorkspace: (payload: { snapshot?: Snapshot; sessions?: DaemonSession[] }) => {
    sessions: number;
    topics: number;
    problems: number;
    reviews: number;
    quests: number;
    snapshot: boolean;
  };
  pushToast: (message: string, type?: ToastType, action?: ToastAction) => void;
  dismissToast: (id: string) => void;
  clearLevelUp: () => void;
}

interface StoreValue {
  state: SystemState;
  ready: boolean;
  toasts: ToastItem[];
  levelUp: LevelUpInfo | null;
  actions: Actions;
}

const StoreContext = createContext<StoreValue | null>(null);

function saveState(state: SystemState) {
  try {
    window.localStorage.setItem(APP.storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Field journal could not persist to localStorage.', error);
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SystemState>(() => createDefaultState('2000-01-01T00:00:00.000Z'));
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUp, setLevelUp] = useState<LevelUpInfo | null>(null);
  const stateRef = useRef<SystemState>(state);
  const timers = useRef<number[]>([]);
  const booted = useRef(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message: string, type: ToastType = 'info', action?: ToastAction) => {
    if (type === 'error') playSfx('error');
    const id = uid();
    setToasts((current) => [...current.slice(-3), { id, message, type, action }]);
    const timer = window.setTimeout(() => dismissToast(id), action ? 7000 : 4600);
    timers.current.push(timer);
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    let loaded = createDefaultState();
    try {
      const raw = window.localStorage.getItem(APP.storageKey);
      if (raw) loaded = normalizeState(JSON.parse(raw));
    } catch (error) {
      console.error('Saved journal could not be read.', error);
    }
    const seedResult = applyWorkspaceSeed(loaded);
    const unlocked = evaluateAchievements(loaded);
    const xp = totalXp(loaded);
    if (loaded.meta.lastKnownLevel === null) loaded.meta.lastKnownLevel = levelForXp(xp);
    loaded.meta.lastKnownXp = xp;
    loaded.meta.lastVisit = new Date().toISOString();
    loaded.meta.initialized = true;
    stateRef.current = loaded;
    setState(loaded);
    setReady(true);
    saveState(loaded);
    if (seedResult.applied) {
      pushToast(
        `Workspace baseline restored · ${seedResult.topics} gates, ${seedResult.problems} dungeons, ${seedResult.files} files.`,
        'success'
      );
      if (unlocked.length) pushToast(`${unlocked.length} achievements recorded in the ledger.`, 'achievement');
    } else if (unlocked.length) {
      pushToast(`${unlocked.length} achievement${unlocked.length === 1 ? '' : 's'} recorded from your archive.`, 'achievement');
    }
  }, [pushToast]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.classList.toggle('reduce-motion', state.settings.reduceMotion);
  }, [ready, state.settings.theme, state.settings.reduceMotion]);

  const commit = useCallback(
    <T,>(mutator: (draft: SystemState) => T, options: CommitOptions<T> = {}): T => {
      const previous = stateRef.current;
      const draft = structuredClone(previous);
      const result = mutator(draft);
      const unlocked = evaluateAchievements(draft);
      const xp = totalXp(draft);
      const level = levelForXp(xp);
      const previousLevel = previous.meta.lastKnownLevel;
      let nextLevelUp: LevelUpInfo | null = null;
      if (!options.silent && previousLevel !== null && level > previousLevel) {
        nextLevelUp = {
          from: previousLevel,
          to: level,
          rank: rankForLevel(level),
          previousRank: rankForLevel(previousLevel)
        };
      }
      draft.meta.lastKnownLevel = Math.max(previousLevel ?? 1, level);
      draft.meta.lastKnownXp = xp;
      draft.meta.lastVisit = new Date().toISOString();
      draft.meta.updatedAt = new Date().toISOString();
      draft.meta.initialized = true;
      stateRef.current = draft;
      setState(draft);
      saveState(draft);
      if (!options.silent) {
        if (nextLevelUp) playSfx('fanfare');
        else if (unlocked.length) playSfx('chime');
        else if (options.sound) playSfx(options.sound);
        if (options.message) {
          const message = typeof options.message === 'function' ? options.message(result) : options.message;
          pushToast(message, options.toastType ?? 'success');
        }
        unlocked.forEach((achievement) => pushToast(`Achievement — ${achievement.title} (+${achievement.xp} XP)`, 'achievement'));
        if (nextLevelUp) setLevelUp(nextLevelUp);
      }
      return result;
    },
    [pushToast]
  );

  const actions = useMemo<Actions>(() => {
    const restoreSession = (session: Session) => {
      commit(
        (draft) => {
          draft.sessions.push(session);
          draft.sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },
        { message: 'Entry restored to the journal.' }
      );
    };

    return {
      addSession(data) {
        const session = buildSession(data);
        commit(
          (draft) => {
            draft.sessions.unshift(session);
          },
          { message: `Entry recorded · +${sessionXp(session)} XP`, sound: 'scribe' }
        );
        return session;
      },
      updateSession(id, patch) {
        commit((draft) => {
          const session = draft.sessions.find((item) => item.id === id);
          if (!session) return;
          if (patch.date !== undefined) session.date = toIso(patch.date);
          if (patch.topic !== undefined) session.topic = String(patch.topic).trim().slice(0, 140);
          if (patch.track !== undefined && TRACKS[patch.track as TrackKey]) session.track = patch.track as TrackKey;
          if (patch.minutes !== undefined) session.minutes = Math.max(1, Math.min(1440, Number(patch.minutes) || 1));
          if (patch.note !== undefined) session.note = String(patch.note).trim().slice(0, 2000);
          if (patch.tags !== undefined) {
            session.tags = Array.isArray(patch.tags)
              ? patch.tags
              : String(patch.tags).split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
          }
          if (patch.focus !== undefined) session.focus = Math.max(1, Math.min(5, Number(patch.focus) || 3));
          if (patch.problemId !== undefined) session.problemId = patch.problemId || null;
          draft.sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, { message: 'Entry updated.', sound: 'scribe' });
      },
      deleteSessionWithUndo(id) {
        const removed = stateRef.current.sessions.find((session) => session.id === id);
        if (!removed) return;
        commit(
          (draft) => {
            draft.sessions = draft.sessions.filter((session) => session.id !== id);
          },
          { silent: true }
        );
        playSfx('tick');
        pushToast('Entry removed from the journal.', 'info', { label: 'Undo', onClick: () => restoreSession(removed) });
      },
      restoreSession,
      toggleTopic(id) {
        const shouldComplete = !stateRef.current.completedTopics.includes(id);
        commit(
          (draft) => {
            if (shouldComplete) {
              if (!draft.completedTopics.includes(id)) draft.completedTopics.push(id);
              draft.topicCompletedAt[id] = draft.topicCompletedAt[id] || new Date().toISOString();
            } else {
              draft.completedTopics = draft.completedTopics.filter((topic) => topic !== id);
              delete draft.topicCompletedAt[id];
            }
          },
          { message: shouldComplete ? 'Gate sealed. Marked complete.' : 'Gate reopened.', toastType: shouldComplete ? 'success' : 'info', sound: shouldComplete ? 'stamp' : 'tick' }
        );
        return shouldComplete;
      },
      cycleProblemStatus(id) {
        const order: ProblemStatus[] = ['todo', 'attempted', 'solved'];
        const current = problemRecord(stateRef.current, id).status;
        const next = order[(order.indexOf(current) + 1) % order.length];
        const problem = allProblems(stateRef.current).find((item) => item.id === id);
        const xp = problem ? difficultyXp(problem.difficulty) : 0;
        commit(
          (draft) => {
            setProblemStatus(draft, id, next);
          },
          {
            message:
              next === 'solved'
                ? `Dungeon cleared · +${xp} XP`
                : next === 'attempted'
                  ? 'Marked as attempted.'
                  : 'Dungeon reset to open.',
            toastType: next === 'solved' ? 'success' : 'info',
            sound: next === 'solved' ? 'stamp' : 'tick'
          }
        );
        return next;
      },
      toggleReview(id) {
        const next = !problemRecord(stateRef.current, id).review;
        commit(
          (draft) => {
            const record = problemRecord(draft, id);
            record.review = next;
            draft.problems[id] = record;
          },
          { message: next ? 'Flagged for review.' : 'Review flag removed.', toastType: 'info', sound: 'tick' }
        );
        return next;
      },
      addProblem(data) {
        const problem: Problem = {
          id: `custom-${uid()}`,
          number: allProblems(stateRef.current).length + 1,
          title: String(data.title || 'Untitled dungeon').trim().slice(0, 120),
          folder: null,
          track: TRACKS[data.track as TrackKey] ? (data.track as TrackKey) : 'problem-solving',
          difficulty: ['Warm-up', 'Easy', 'Practice', 'Timed Set', 'Deep Dive'].includes(data.difficulty)
            ? (data.difficulty as Problem['difficulty'])
            : 'Practice',
          tags: String(data.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
          desc: String(data.desc || 'Custom dungeon.').slice(0, 400),
          custom: true
        };
        commit(
          (draft) => {
            draft.customProblems.push(problem);
          },
          { message: 'Custom dungeon added.', sound: 'scribe' }
        );
        return problem;
      },
      updateProblem(id, data) {
        commit(
          (draft) => {
            const problem = draft.customProblems.find((item) => item.id === id);
            if (!problem) return;
            if (data.title !== undefined) problem.title = String(data.title).trim().slice(0, 120) || problem.title;
            if (data.track !== undefined && TRACKS[data.track as TrackKey]) problem.track = data.track as TrackKey;
            if (['Warm-up', 'Easy', 'Practice', 'Timed Set', 'Deep Dive'].includes(data.difficulty)) {
              problem.difficulty = data.difficulty as Problem['difficulty'];
            }
            if (data.tags !== undefined) problem.tags = String(data.tags).split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 8);
            if (data.desc !== undefined) problem.desc = String(data.desc).slice(0, 400);
          },
          { message: 'Dungeon updated.', sound: 'tick' }
        );
      },
      removeProblem(id) {
        commit(
          (draft) => {
            draft.customProblems = draft.customProblems.filter((problem) => problem.id !== id);
            delete draft.problems[id];
          },
          { message: 'Custom dungeon deleted.', toastType: 'info', sound: 'tick' }
        );
      },
      claimQuest(scope, questId) {
        const stateNow = stateRef.current;
        const questList = scope === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;
        const found = questList.find((item) => item.id === questId);
        if (!found) return { ok: false, reason: 'Unknown quest.' };
        const progress = questProgress(stateNow, scope, found);
        if (!progress.complete) return { ok: false, reason: 'Quest is not complete yet.' };
        if (progress.claimed) return { ok: false, reason: 'Reward already claimed.' };
        commit(
          (draft) => {
            const key = scope === 'daily' ? dateKey(new Date()) : progress.key;
            draft.quests[key] = draft.quests[key] || {};
            draft.quests[key][scope] = [...(draft.quests[key][scope] || []), questId];
          },
          { message: `Quest reward claimed · +${found.xp} XP`, sound: 'coin' }
        );
        return { ok: true, xp: found.xp };
      },
      claimAllQuests() {
        const { daily, weekly } = questsForToday(stateRef.current);
        let count = 0;
        let xp = 0;
        commit(
          (draft) => {
            (
              [
                ['daily', daily],
                ['weekly', weekly]
              ] as const
            ).forEach(([scope, list]) => {
              list.forEach((quest) => {
                if (!quest.progress.complete || quest.progress.claimed) return;
                const key = quest.progress.key;
                draft.quests[key] = draft.quests[key] || {};
                draft.quests[key][scope] = [...(draft.quests[key][scope] || []), quest.id];
                count++;
                xp += quest.xp;
              });
            });
          },
          {
            message: count ? `${count} quest${count === 1 ? '' : 's'} claimed · +${xp} XP` : 'No completed quests are ready to claim.',
            toastType: count ? 'success' : 'info',
            sound: count ? 'coin' : 'tick'
          }
        );
        return { count, xp };
      },
      applyEvidence(kind) {
        return commit((draft) => applyEvidenceSelector(draft, kind === 'problems' ? { topics: false, problems: true } : { topics: true, problems: false }), {
          message: kind === 'problems' ? 'Evidenced dungeons cleared.' : 'Evidenced gates completed.',
          sound: 'stamp'
        });
      },
      updateProfile(patch) {
        commit((draft) => {
          draft.profile = { ...draft.profile, ...patch };
          draft.profile.goalMinutesPerWeek = Math.max(30, Math.min(5000, Number(draft.profile.goalMinutesPerWeek) || 300));
          draft.profile.dailyXpGoal = Math.max(10, Math.min(5000, Number(draft.profile.dailyXpGoal) || 150));
          draft.profile.name = String(draft.profile.name || 'Hunter').trim().slice(0, 40) || 'Hunter';
        }, { message: 'Profile saved.', sound: 'tick' });
      },
      updateSettings(patch) {
        commit((draft) => {
          draft.settings = { ...draft.settings, ...patch };
          draft.settings.theme = draft.settings.theme === 'night' ? 'night' : 'paper';
          draft.settings.weekStart = Number(draft.settings.weekStart) === 0 ? 0 : 1;
        }, { message: 'Preferences saved.', sound: 'tick' });
      },
      setSound(value) {
        commit((draft) => {
          draft.settings.sound = Boolean(value);
        }, { silent: true });
      },
      saveProfile(profilePatch, settingsPatch) {
        commit((draft) => {
          draft.profile = { ...draft.profile, ...profilePatch };
          draft.profile.goalMinutesPerWeek = Math.max(30, Math.min(5000, Number(draft.profile.goalMinutesPerWeek) || 300));
          draft.profile.dailyXpGoal = Math.max(10, Math.min(5000, Number(draft.profile.dailyXpGoal) || 150));
          draft.profile.name = String(draft.profile.name || 'Hunter').trim().slice(0, 40) || 'Hunter';
          draft.settings = { ...draft.settings, ...settingsPatch };
          draft.settings.theme = draft.settings.theme === 'night' ? 'night' : 'paper';
          draft.settings.weekStart = Number(draft.settings.weekStart) === 0 ? 0 : 1;
        }, { message: 'Profile saved.', sound: 'stamp' });
      },
      resetProgress() {
        commit((draft) => {
          draft.completedTopics = [];
          draft.topicCompletedAt = {};
          draft.problems = {};
          draft.sessions = [];
          draft.achievements = {};
          draft.quests = {};
          draft.meta.lastKnownLevel = null;
          draft.meta.lastKnownXp = 0;
        }, { message: 'Progress reset. Workspace evidence kept.', toastType: 'info', sound: 'tick' });
      },
      resetAll() {
        commit(
          (draft) => {
            const cursor = draft.meta.daemonCursor;
            const fresh = createDefaultState();
            Object.assign(draft, fresh);
            if (cursor) draft.meta.daemonCursor = cursor;
            applyWorkspaceSeed(draft);
          },
          { message: 'All local data erased. Workspace baseline restored.', toastType: 'info', sound: 'error' }
        );
      },
      importBackupText(text, mode) {
        const result = commit((draft) => importBackup(draft, text, mode), { silent: true });
        if (!result.ok) {
          pushToast(result.reason || 'Import failed.', 'error');
          return result;
        }
        pushToast(
          mode === 'replace' ? 'Backup replaced the journal.' : `Backup merged · ${result.sessions ?? 0} new entries.`,
          'success'
        );
        playSfx('chime');
        return result;
      },
      importSessionsText(text) {
        const parsed = importSessionsCSV(text);
        if (!parsed.sessions.length) {
          pushToast(parsed.errors[0] || 'No valid sessions found.', 'error');
          return { added: 0, skipped: parsed.skipped, errors: parsed.errors };
        }
        const added = commit(
          (draft) => {
            const seen = new Set(draft.sessions.map((session) => `${session.date}|${session.topic}|${session.minutes}`));
            const inserted: Session[] = [];
            parsed.sessions.forEach((input) => {
              const session = buildSession(input);
              const key = `${session.date}|${session.topic}|${session.minutes}`;
              if (seen.has(key)) return;
              seen.add(key);
              draft.sessions.unshift(session);
              inserted.push(session);
            });
            return inserted;
          },
          { silent: true }
        );
        if (!added.length) {
          pushToast('Those entries are already in the journal.', 'info');
          return { added: 0, skipped: parsed.skipped, errors: parsed.errors };
        }
        const duplicates = parsed.sessions.length - added.length;
        pushToast(`Imported ${added.length} ${added.length === 1 ? 'entry' : 'entries'}${duplicates ? ` · ${duplicates} duplicate skipped` : ''}.`, 'success');
        playSfx('chime');
        if (parsed.errors.length) pushToast(`${parsed.errors.length} rows were skipped. Check the CSV columns.`, 'error');
        return { added: added.length, skipped: parsed.skipped, errors: parsed.errors };
      },
      importMarkdownText(text) {
        const result = commit((draft) => importMarkdownChecklist(draft, text), { silent: true });
        pushToast(
          result.applied.length ? `${result.applied.length} gates completed from the checklist.` : 'No new checked gates found.',
          result.applied.length ? 'success' : 'info'
        );
        playSfx(result.applied.length ? 'chime' : 'tick');
        if (result.skipped.length) pushToast(`${result.skipped.length} checklist items did not match a gate.`, 'info');
        return { applied: result.applied.length, skipped: result.skipped.length };
      },
      importWorkspace(files, merge) {
        const result = commit((draft) => importWorkspaceFiles(draft, files, { merge }), { silent: true });
        if (!result.incoming) {
          pushToast('No .cpp or .md files found in that selection.', 'error');
          return { incoming: 0, files: result.totals.files, days: result.days };
        }
        pushToast(`Workspace evidence updated · ${result.totals.files} files · ${result.days} active days.`, 'success');
        playSfx('sync');
        return { incoming: result.incoming, files: result.totals.files, days: result.days };
      },
      exportBackupJSON() {
        return exportBackup(stateRef.current);
      },
      exportSessionsCSV() {
        return sessionsToCSV(stateRef.current);
      },
      exportProblemsCSV() {
        return problemsToCSV(stateRef.current);
      },
      syncWorkspace(payload) {
        const current = stateRef.current;
        const cursorMs = current.meta.daemonCursor ? new Date(current.meta.daemonCursor).getTime() : 0;
        const incoming = (payload.sessions || []).filter((session) => {
          if (!session?.id || !session.start || !session.end) return false;
          const end = new Date(session.end).getTime();
          if (!Number.isFinite(end) || end <= cursorMs) return false;
          return !current.sessions.some((existing) => existing.id === session.id);
        });
        const snapshotChanged = Boolean(
          payload.snapshot?.generatedAt && payload.snapshot.generatedAt !== current.evidence.snapshot.generatedAt
        );
        if (!snapshotChanged && !incoming.length) {
          return { sessions: 0, topics: 0, problems: 0, reviews: 0, quests: 0, snapshot: false };
        }
        return commit(
          (draft) => {
            if (payload.snapshot) {
              const normalized = normalizeSnapshot(payload.snapshot);
              draft.evidence = {
                snapshot: { ...normalized, source: 'local watcher' },
                importedAt: new Date().toISOString(),
                source: 'local-watcher'
              };
            }
            const progress = deriveWorkspaceProgress(draft);
            const added: Session[] = incoming.map((session) => ({
              id: session.id,
              date: toIso(session.start),
              topic: String(session.title || 'Workspace practice').trim().slice(0, 140) || 'Workspace practice',
              track: TRACKS[session.track] ? session.track : 'foundations',
              minutes: Math.max(1, Math.min(1440, Number(session.minutes) || 1)),
              note: String(session.note || '').slice(0, 2000),
              tags: [...new Set(['auto-tracked', ...(session.tags || [])])].slice(0, 8),
              focus: Math.max(1, Math.min(5, Number(session.focus) || 3)),
              problemId: session.problemId || null,
              createdAt: toIso(session.end),
              source: 'watcher' as const
            }));
            added.forEach((session) => draft.sessions.push(session));
            if (added.length) {
              draft.sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
            const ends = incoming.map((session) => new Date(session.end).getTime()).filter(Number.isFinite);
            const latestEnd = ends.length ? Math.max(cursorMs, ...ends) : cursorMs;
            if (latestEnd > 0) draft.meta.daemonCursor = new Date(latestEnd).toISOString();
            if (payload.snapshot?.generatedAt) draft.meta.workspaceVersion = payload.snapshot.generatedAt;
            let quests = 0;
            const packs = questsForToday(draft);
            (['daily', 'weekly'] as const).forEach((scope) => {
              packs[scope].forEach((quest) => {
                if (!quest.progress.complete || quest.progress.claimed) return;
                const key = quest.progress.key;
                draft.quests[key] = draft.quests[key] || {};
                draft.quests[key][scope] = [...(draft.quests[key][scope] || []), quest.id];
                quests += 1;
              });
            });
            return {
              sessions: added.length,
              topics: progress.topics,
              problems: progress.problems,
              reviews: progress.reviews,
              quests,
              snapshot: snapshotChanged
            };
          },
          {
            message: (result) => {
              const parts: string[] = [];
              if (result.sessions) parts.push(`${result.sessions} auto-${result.sessions === 1 ? 'entry' : 'entries'}`);
              if (result.topics) parts.push(`${result.topics} gate${result.topics === 1 ? '' : 's'} cleared`);
              if (result.problems) parts.push(`${result.problems} dungeon${result.problems === 1 ? '' : 's'} cleared`);
              if (result.reviews) parts.push(`${result.reviews} flagged for review`);
              if (result.quests) parts.push(`${result.quests} quest${result.quests === 1 ? '' : 's'} claimed`);
              return parts.length ? `Watcher · ${parts.join(' · ')}` : 'Watcher synced workspace evidence.';
            },
            sound: 'sync'
          }
        );
      },
      pushToast,
      dismissToast,
      clearLevelUp() {
        setLevelUp(null);
      }
    };
  }, [commit, dismissToast, pushToast]);

  const value = useMemo<StoreValue>(
    () => ({ state, ready, toasts, levelUp, actions }),
    [state, ready, toasts, levelUp, actions]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTracker(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useTracker must be used inside StoreProvider.');
  return context;
}
