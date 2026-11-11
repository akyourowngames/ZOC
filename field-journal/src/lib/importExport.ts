import { EVIDENCE_TOPIC_RULES, LEGACY_TOPIC_MAP, ALL_TOPICS, TOPIC_INDEX, TRACKS } from './data';
import { dateKey, parseDate, toIso, uid } from './dates';
import { normalizeState } from './state';
import { allProblems, problemRecord, snapshot } from './selectors';
import type { EvidenceFile, Session, SystemState, TrackKey } from './types';

const CODE_EXT = new Set([
  'cpp', 'cc', 'cxx', 'c', 'h', 'hpp', 'hh', 'hxx',
  'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'py', 'java', 'kt', 'kts',
  'go', 'rs', 'rb', 'php', 'cs', 'swift', 'scala', 'lua', 'r', 'm', 'mm',
  'sh', 'bash', 'zsh', 'ps1', 'sql', 'html', 'css', 'scss', 'less',
  'vue', 'svelte', 'ipynb'
]);
const DOC_EXT = new Set(['md', 'markdown', 'txt', 'rst', 'org', 'tex']);
const IGNORED_PATH = /(^|\/)(\.git|\.qoder|\.commandcode|\.vscode|\.next|\.daemon|99-build-artifacts|node_modules|field-journal|js|data|scripts)(\/|$)/i;
const IGNORED_ROOT_FILE = /^(app\.js|index\.html|styles\.css|package(-lock)?\.json)$/i;

export interface SessionInput {
  date?: string;
  topic: string;
  track: TrackKey | string;
  minutes: number;
  note?: string;
  tags?: string | string[];
  focus?: number;
  problemId?: string | null;
}

export interface ImportResult {
  ok: boolean;
  reason?: string;
  mode?: 'merge' | 'replace';
  sessions?: number;
  topics?: number;
  problems?: number;
}

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

export function importSessionsCSV(text: string): { sessions: SessionInput[]; errors: string[]; skipped: number } {
  const rows = parseCSV(text).filter((row) => row.some((cell) => String(cell).trim()));
  if (!rows.length) return { sessions: [], errors: ['The CSV file is empty.'], skipped: 0 };
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const hasHeader = header.some((cell) => ['date', 'topic', 'minutes', 'track', 'note'].includes(cell));
  const columns = hasHeader ? header : ['date', 'topic', 'track', 'minutes', 'note', 'tags'];
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const sessions: SessionInput[] = [];
  const errors: string[] = [];
  let skipped = 0;
  dataRows.forEach((row, index) => {
    const record: Record<string, string> = {};
    columns.forEach((column, columnIndex) => {
      record[column] = (row[columnIndex] || '').trim();
    });
    const minutes = Number(record.minutes);
    const trackValue = String(record.track || '').trim().toLowerCase();
    if (!record.topic) {
      errors.push(`Row ${index + (hasHeader ? 2 : 1)}: missing topic.`);
      skipped++;
      return;
    }
    if (!Number.isFinite(minutes) || minutes <= 0) {
      errors.push(`Row ${index + (hasHeader ? 2 : 1)}: invalid minutes.`);
      skipped++;
      return;
    }
    const date = record.date ? (/^\d{4}-\d{2}-\d{2}$/.test(record.date) ? parseDate(record.date) : new Date(record.date)) : new Date();
    if (Number.isNaN(date.getTime())) {
      errors.push(`Row ${index + (hasHeader ? 2 : 1)}: invalid date.`);
      skipped++;
      return;
    }
    const track = (Object.keys(TRACKS) as TrackKey[]).find(
      (key) => key === trackValue || TRACKS[key].name.toLowerCase() === trackValue
    ) || 'foundations';
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

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function sessionsToCSV(state: SystemState): string {
  const header = ['date', 'topic', 'track', 'minutes', 'note', 'tags', 'focus', 'problemId'];
  const rows = state.sessions.map((session) =>
    [
      session.date,
      session.topic,
      session.track,
      session.minutes,
      session.note,
      (session.tags || []).join(', '),
      session.focus,
      session.problemId || ''
    ].map(csvEscape).join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

export function problemsToCSV(state: SystemState): string {
  const header = ['id', 'number', 'title', 'track', 'difficulty', 'status', 'review', 'solvedAt', 'tags', 'evidenceFiles'];
  const rows = allProblems(state).map((problem) => {
    const record = problemRecord(state, problem.id);
    const evidence = (snapshot(state).files || []).filter((file) => file.problemId === problem.folder);
    return [
      problem.id,
      problem.number,
      problem.title,
      problem.track,
      problem.difficulty,
      record.status,
      record.review ? 'yes' : 'no',
      record.solvedAt || '',
      (problem.tags || []).join(' '),
      evidence.length
    ].map(csvEscape).join(',');
  });
  return [header.join(','), ...rows].join('\n');
}

export function exportBackup(state: SystemState) {
  return {
    app: 'field-journal',
    version: state.version,
    exportedAt: new Date().toISOString(),
    state
  };
}

export function importBackup(state: SystemState, text: string, mode: 'merge' | 'replace' = 'merge'): ImportResult {
  let parsed: unknown;
  try {
    parsed = typeof text === 'string' ? JSON.parse(text) : text;
  } catch {
    return { ok: false, reason: 'That file is not valid JSON.' };
  }
  const root = parsed as Record<string, unknown> | null;
  const incomingRaw = (root?.state ?? root?.data ?? root) as unknown;
  const check = incomingRaw as Record<string, unknown> | null;
  if (!check || typeof check !== 'object' || (!check.sessions && !check.completedTopics && !check.problems)) {
    return { ok: false, reason: 'This does not look like a tracker backup.' };
  }
  const next = normalizeState(incomingRaw);
  if (mode === 'replace') {
    Object.assign(state, next);
    return {
      ok: true,
      mode,
      sessions: state.sessions.length,
      topics: state.completedTopics.length,
      problems: Object.keys(state.problems).length
    };
  }
  state.completedTopics = [...new Set([...state.completedTopics, ...next.completedTopics])];
  state.topicCompletedAt = { ...next.topicCompletedAt, ...state.topicCompletedAt };
  next.customProblems.forEach((problem) => {
    if (!state.customProblems.some((item) => item.id === problem.id)) state.customProblems.push(problem);
  });
  const existingSessions = new Set(state.sessions.map((session) => `${session.date}|${session.topic}|${session.minutes}`));
  let addedSessions = 0;
  next.sessions.forEach((session) => {
    const key = `${session.date}|${session.topic}|${session.minutes}`;
    if (!existingSessions.has(key)) {
      state.sessions.push(session);
      existingSessions.add(key);
      addedSessions++;
    }
  });
  state.sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  return { ok: true, mode, sessions: addedSessions, topics: next.completedTopics.length, problems: Object.keys(next.problems).length };
}

export function importMarkdownChecklist(state: SystemState, text: string) {
  const lines = String(text || '').split(/\r?\n/);
  const checked: string[] = [];
  const unchecked: string[] = [];
  lines.forEach((line) => {
    const match = line.match(/^\s*[-*]\s*\[([ xX])\]\s+(.+?)\s*$/);
    if (!match) return;
    const name = match[2].replace(/`/g, '').trim();
    (match[1].toLowerCase() === 'x' ? checked : unchecked).push(name);
  });
  const resolve = (name: string) => {
    const normalized = name.toLowerCase();
    const byLegacy = Object.entries(LEGACY_TOPIC_MAP).find(([legacy]) => legacy.toLowerCase() === normalized);
    if (byLegacy) return byLegacy[1];
    const byName = ALL_TOPICS.find((topic) => topic.name.toLowerCase() === normalized);
    if (byName) return byName.id;
    const fuzzy = ALL_TOPICS.find((topic) => normalized.includes(topic.name.toLowerCase()) || topic.name.toLowerCase().includes(normalized));
    return fuzzy?.id || null;
  };
  const applied: string[] = [];
  const skipped: string[] = [];
  checked.forEach((name) => {
    const id = resolve(name);
    if (id) {
      if (!state.completedTopics.includes(id)) {
        state.completedTopics.push(id);
        state.topicCompletedAt[id] = state.topicCompletedAt[id] || new Date().toISOString();
        applied.push(id);
      }
    } else {
      skipped.push(name);
    }
  });
  return { checked: checked.length, unchecked: unchecked.length, applied, skipped };
}

export function importWorkspaceFiles(state: SystemState, fileList: FileList | File[], options: { merge?: boolean } = {}) {
  const incoming: EvidenceFile[] = [];
  Array.from(fileList || []).forEach((rawFile) => {
    const file = rawFile as File & { webkitRelativePath?: string; relativePath?: string };
    const path = String(file.webkitRelativePath || file.relativePath || file.name || '').replace(/\\/g, '/');
    if (!path || IGNORED_PATH.test(path) || IGNORED_ROOT_FILE.test(path)) return;
    if (Number(file.size) === 0) return;
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const kind = CODE_EXT.has(extension) ? 'code' : DOC_EXT.has(extension) ? 'doc' : null;
    if (!kind) return;
    const modified = new Date(Number(file.lastModified) || Date.now());
    const match = path.match(/(?:^|\/)problems\/(\d+)-([^/]+)\//i);
    incoming.push({
      path,
      name: path.split('/').pop() || path,
      kind,
      size: Number(file.size) || 0,
      date: modified.toISOString(),
      dateKey: dateKey(modified),
      category: path.startsWith('01-foundations/')
        ? 'foundations'
        : path.startsWith('02-problem-solving/')
          ? 'problem-solving'
          : path.startsWith('03-contests/')
            ? 'contests'
            : path.startsWith('04-reference/')
              ? 'reference'
              : 'workspace',
      problemId: match ? `${match[1]}-${match[2]}` : null,
      solution: kind === 'code',
      role: /(^|\/)(README|idea|notes)\.md$/i.test(path) ? 'notes' : kind === 'doc' ? 'doc' : 'code'
    });
  });
  if (!incoming.length) {
    return { totals: snapshot(state).totals, days: (snapshot(state).days || []).length, incoming: 0 };
  }
  const merged = new Map<string, EvidenceFile>();
  if (options.merge !== false) {
    (snapshot(state).files || []).forEach((file) => merged.set(file.path, file));
  }
  incoming.forEach((file) => {
    const existing = merged.get(file.path);
    if (!existing || file.date >= existing.date) merged.set(file.path, file);
  });
  const files = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map<string, EvidenceFile[]>();
  files.forEach((file) => {
    if (!byDate.has(file.dateKey)) byDate.set(file.dateKey, []);
    byDate.get(file.dateKey)!.push(file);
  });
  const days = [...byDate.entries()]
    .map(([key, items]) => ({
      date: `${key}T23:59:00.000Z`,
      dateKey: key,
      files: items.length,
      code: items.filter((item) => item.kind === 'code').length,
      docs: items.filter((item) => item.kind === 'doc').length,
      problems: [...new Set(items.map((item) => item.problemId).filter((value): value is string => Boolean(value)))],
      label: `${items.length} source and note files updated`
    }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
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
  return { totals, days: days.length, incoming: incoming.length };
}

export function applyEvidenceTopicRules(state: SystemState) {
  const found = new Map<string, string>();
  (snapshot(state).files || []).forEach((file) => {
    if (file.kind !== 'code') return;
    EVIDENCE_TOPIC_RULES.forEach((rule) => {
      if (rule.match.test(file.path)) {
        const current = found.get(rule.topicId);
        if (!current || file.date > current) found.set(rule.topicId, file.date);
      }
    });
  });
  let count = 0;
  found.forEach((date, id) => {
    if (TOPIC_INDEX.has(id) && !state.completedTopics.includes(id)) {
      state.completedTopics.push(id);
      state.topicCompletedAt[id] = date;
      count++;
    }
  });
  return count;
}

export function buildSession(data: SessionInput): Session {
  return {
    id: uid(),
    date: toIso(data.date || new Date()),
    topic: String(data.topic || 'Focused practice').trim().slice(0, 140),
    track: TRACKS[data.track as TrackKey] ? (data.track as TrackKey) : 'foundations',
    minutes: Math.max(1, Math.min(1440, Number(data.minutes) || 1)),
    note: String(data.note || '').trim().slice(0, 2000),
    tags: Array.isArray(data.tags)
      ? data.tags.slice(0, 8)
      : String(data.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 8),
    focus: Math.max(1, Math.min(5, Number(data.focus) || 3)),
    problemId: data.problemId || null,
    createdAt: new Date().toISOString(),
    source: 'manual'
  };
}

export function downloadFile(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
