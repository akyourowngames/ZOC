#!/usr/bin/env node
/**
 * Local workspace watcher for the field journal.
 *
 * Watches one or more workspace folders, groups file saves into practice
 * sessions, infers topic/problem metadata from names and text, and writes a
 * small heartbeat/session feed (state.json) plus a read-only evidence snapshot
 * (snapshot.json) into .daemon/. File contents are read locally only to infer
 * topics, titles, tags, and difficulty. Nothing leaves the machine.
 *
 * Usage:
 *   node scripts/workspace-daemon.mjs --workspace "C:/path/one" --workspace "C:/path/two" --idle 10
 *   npm run daemon
 */
import { promises as fs, watch, existsSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};
const argList = (name) => {
  const values = [];
  argv.forEach((value, index) => {
    if (value === `--${name}` && argv[index + 1]) values.push(argv[index + 1]);
  });
  return values;
};

const ROOT = process.cwd();
const idleMinutes = Math.max(0.02, Number(arg('idle', '10')) || 10);
const idleMs = idleMinutes * 60 * 1000;
const daemonDir = path.resolve(arg('dir', path.join(ROOT, '.daemon')));
const statePath = path.join(daemonDir, 'state.json');
const snapshotPath = path.join(daemonDir, 'snapshot.json');
const stopPath = path.join(daemonDir, 'stop');
const logPath = path.join(daemonDir, 'daemon.log');

const CODE_EXT = new Set([
  '.cpp', '.cc', '.cxx', '.c', '.h', '.hpp', '.hh', '.hxx',
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.java', '.kt', '.kts',
  '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.scala', '.lua', '.r', '.m', '.mm',
  '.sh', '.bash', '.zsh', '.ps1', '.sql', '.html', '.css', '.scss', '.less',
  '.vue', '.svelte', '.ipynb'
]);
const DOC_EXT = new Set(['.md', '.markdown', '.txt', '.rst', '.org', '.tex']);
const BUILD_EXT = new Set(['.exe', '.out', '.class']);
const IGNORED = /(^|\/)(\.git|\.qoder|\.commandcode|\.vscode|\.next|node_modules|99-build-artifacts|field-journal|\.daemon|js|data|scripts)(\/|$)/i;
const IGNORED_ROOT_FILES = new Set(['app.js', 'index.html', 'styles.css', 'package.json', 'package-lock.json']);
const CONTENT_LIMIT = 48 * 1024;
const MAX_SESSIONS = 400;
const MAX_ACTIVE_MS = 4 * 60 * 60 * 1000;

const TOPIC_PATTERNS = [
  ['environment', /\b(environment|compiler|toolchain|setup|first program)\b/i],
  ['variables-output', /\b(variables?|data types?|output)\b/i],
  ['input-arithmetic', /\b(input|arithmetic|sum)\b/i],
  ['type-conversion', /\b(type ?conversion|typecast|casting|casts?)\b/i],
  ['conditions', /\b(conditions?|if[- ]?else|branching)\b/i],
  ['operators', /\b(operators?|bitwise|logical)\b/i],
  ['loops', /\b(loops?|for[- ]?loops?|while)\b/i],
  ['functions', /\b(functions?|parameters?|scope)\b/i],
  ['arrays-strings', /\b(arrays?|strings?)\b/i],
  ['debugging', /\b(debug(ging)?|complexity|big[- ]?o)\b/i]
];

const TAG_PATTERNS = [
  ['arrays', /\barrays?\b/i],
  ['strings', /\bstrings?\b/i],
  ['loops', /\bloops?\b/i],
  ['conditions', /\bconditions?|if[- ]?else\b/i],
  ['dp', /\b(dp|dynamic programming|memoisation|memoization)\b/i],
  ['graphs', /\b(graphs?|bfs|dfs|dijkstra|shortest path)\b/i],
  ['greedy', /\bgreedy\b/i],
  ['binary search', /\bbinary search\b/i],
  ['sorting', /\bsort(ing)?\b/i],
  ['math', /\bmath(ematics)?\b/i],
  ['digits', /\bdigits?\b/i],
  ['recursion', /\brecursion|backtracking\b/i],
  ['prefix sums', /\bprefix sums?\b/i],
  ['two pointers', /\btwo pointers?\b/i],
  ['number theory', /\bnumber theory|primes?|modular\b/i],
  ['trees', /\btrees?\b/i],
  ['implementation', /\bimplementation\b/i],
  ['subtasks', /\bsubtasks?\b/i],
  ['segment tree', /\bsegment tree|fenwick\b/i],
  ['dsu', /\b(disjoint set|union[- ]find|dsu)\b/i]
];

const nowIso = () => new Date().toISOString();
const pad = (value) => String(value).padStart(2, '0');
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatBytes = (bytes) => {
  const value = Math.abs(Number(bytes) || 0);
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
};
const titleFromFolder = (folder) =>
  folder
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
const problemIdFromPath = (rel) => {
  const match = rel.match(/(?:^|\/)problems\/(\d+)-([^/]+)\//i);
  return match ? `${match[1]}-${match[2]}` : null;
};
const categoryFor = (rel) => {
  if (rel.startsWith('01-foundations/')) return 'foundations';
  if (rel.startsWith('02-problem-solving/')) return 'problem-solving';
  if (rel.startsWith('03-contests/')) return 'contests';
  if (rel.startsWith('04-reference/')) return 'reference';
  return 'workspace';
};
const trackFor = (rel) => {
  if (rel.startsWith('01-foundations/')) return 'foundations';
  if (rel.startsWith('03-contests/')) return 'zco';
  if (rel.startsWith('02-problem-solving/')) return 'problem-solving';
  return 'foundations';
};

function normalizeWorkspaces(values) {
  const resolved = [];
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) continue;
    const candidate = path.resolve(value.trim());
    try {
      if (!existsSync(candidate)) continue;
    } catch {
      continue;
    }
    if (!resolved.includes(candidate)) resolved.push(candidate);
  }
  resolved.sort((a, b) => a.length - b.length);
  const kept = [];
  for (const candidate of resolved) {
    if (kept.some((root) => candidate === root || candidate.startsWith(`${root}${path.sep}`))) continue;
    kept.push(candidate);
  }
  return kept;
}

const requestedRoots = argList('workspace');
const workspaces = normalizeWorkspaces(requestedRoots.length ? requestedRoots : [path.resolve(ROOT, '..')]);
if (!workspaces.length) {
  console.error('No valid workspace folders found.');
  process.exit(1);
}
const rootLabel = (root) => path.basename(root) || root;

let state = null;
let watchers = [];
let saveTimer = null;
let snapshotTimer = null;
let batchTimer = null;
let pending = new Map();
let problemMeta = {};
let fileSizes = new Map();
let pendingBuilds = 0;
let lastBuildEvents = new Map();
let shuttingDown = false;

async function log(message) {
  try {
    await fs.appendFile(logPath, `[${nowIso()}] ${message}\n`, 'utf8');
  } catch {
    /* logging must never break the watcher */
  }
}

async function writeJsonAtomic(file, value) {
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(temp, file);
}

function createState() {
  return {
    version: 2,
    pid: process.pid,
    startedAt: nowIso(),
    heartbeatAt: nowIso(),
    workspaces,
    idleMinutes,
    active: null,
    sessions: [],
    lastEventAt: null,
    snapshotVersion: null,
    stoppedAt: null
  };
}

async function saveState() {
  if (!state) return;
  state.heartbeatAt = nowIso();
  if (state.active) {
    state.active.minutes = Math.max(
      1,
      Math.round((new Date(state.active.lastEvent).getTime() - new Date(state.active.start).getTime()) / 60000)
    );
  }
  try {
    await writeJsonAtomic(statePath, state);
  } catch (error) {
    await log(`state write failed: ${error.message}`);
  }
}

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void saveState();
  }, 350);
}

function firstHeading(text) {
  const match = text.match(/^#{1,3}\s+(.+)$/m);
  if (!match) return null;
  const heading = match[1].replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim();
  if (!heading || /^(readme|read me|notes?|idea|solution|problem|program|code)$/i.test(heading)) return null;
  return heading.slice(0, 120);
}

function inferTopics(rel, text, kind) {
  const topics = new Set();
  const name = path.basename(rel).toLowerCase();
  TOPIC_PATTERNS.forEach(([id, pattern]) => {
    if (pattern.test(name)) topics.add(id);
  });
  if (!topics.size) {
    const headings = text
      .split(/\r?\n/)
      .filter((line) => /^#{1,3}\s+/.test(line))
      .slice(0, 3)
      .join(' ');
    if (headings) {
      TOPIC_PATTERNS.forEach(([id, pattern]) => {
        if (pattern.test(headings)) topics.add(id);
      });
    }
  }
  if (!topics.size && kind === 'doc' && /01-foundations/i.test(rel)) {
    let best = null;
    let bestCount = 1;
    const sample = text.slice(0, 4000);
    TOPIC_PATTERNS.forEach(([id, pattern]) => {
      const matches = sample.match(new RegExp(pattern.source, 'gi'));
      const count = matches ? matches.length : 0;
      if (count > bestCount) {
        best = id;
        bestCount = count;
      }
    });
    if (best) topics.add(best);
  }
  return [...topics].slice(0, 3);
}

function inferTags(text) {
  const counts = new Map();
  TAG_PATTERNS.forEach(([tag, pattern]) => {
    const sample = text.slice(0, 12000);
    const matches = sample.match(new RegExp(pattern.source, 'gi'));
    if (matches) counts.set(tag, matches.length);
  });
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
}

function inferProblemMeta(folder, docs, code) {
  const ordered = [...docs].sort((a, b) => {
    const priority = (name) => (/readme/i.test(name) ? 0 : /idea/i.test(name) ? 1 : 2);
    return priority(a.name) - priority(b.name);
  });
  const text = `${ordered.map((doc) => doc.text).join('\n')}\n${code.join('\n')}`.slice(0, 24000);
  const title = ordered.map((doc) => firstHeading(doc.text)).find(Boolean) || firstHeading(code[0] || '') || titleFromFolder(folder);
  const difficultyMatch = text.match(/difficulty\s*[:\-]\s*(warm[- ]?up|easy|practice|timed(?: set)?|deep[- ]?dive)/i);
  let difficulty = 'Practice';
  const rawDifficulty = difficultyMatch ? difficultyMatch[1].toLowerCase().replace(/\s+/g, ' ') : '';
  if (/warm/.test(rawDifficulty)) difficulty = 'Warm-up';
  else if (/easy/.test(rawDifficulty)) difficulty = 'Easy';
  else if (/timed/.test(rawDifficulty)) difficulty = 'Timed Set';
  else if (/deep/.test(rawDifficulty)) difficulty = 'Deep Dive';
  else if (/practice/.test(rawDifficulty)) difficulty = 'Practice';
  else if (/\bdeep[- ]?dive|advanced\b/i.test(text)) difficulty = 'Deep Dive';
  else if (/\btimed|contest\b/i.test(text)) difficulty = 'Timed Set';
  else if (/\bwarm[- ]?up|beginner\b/i.test(text)) difficulty = 'Warm-up';
  else if (/\beasy\b/i.test(text)) difficulty = 'Easy';

  const explicitTags = text.match(/tags?\s*[:\-]\s*(.+)/i);
  let tags = explicitTags
    ? explicitTags[1].split(/[,;]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 5)
    : inferTags(text);
  tags = [...new Set(tags.map((tag) => tag.toLowerCase()))].slice(0, 5);

  return { title, difficulty, tags };
}

async function finalizeActive(endedAt, reason = 'idle') {
  if (!state?.active) return;
  const active = state.active;
  state.active = null;
  if (!active.files.length) {
    scheduleSave();
    return;
  }
  const id = `daemon-${new Date(active.start).toISOString()}`;
  if (state.sessions.some((session) => session.id === id)) return;
  const end = endedAt || active.lastEvent;
  const minutes = Math.max(1, Math.round((new Date(end).getTime() - new Date(active.start).getTime()) / 60000));
  const files = active.files.slice(0, 6);
  const saves = active.saves || active.files.length;
  const builds = active.builds || 0;
  const bytes = active.bytes || 0;
  const perMinute = saves / Math.max(1, minutes);
  let focus = 3;
  if (minutes >= 90 && perMinute >= 0.25) focus = 5;
  else if (minutes >= 45 && perMinute >= 0.12) focus = 4;
  else if (saves <= 1 && minutes < 5) focus = 2;
  const fileSaves = active.fileSaves || {};
  const detail =
    Object.entries(fileSaves)
      .slice(0, 4)
      .map(([name, count]) => `${path.basename(name)} ×${count}`)
      .join(', ') || files.join(', ');
  const metaTags = active.problemId ? problemMeta[active.problemId]?.tags || [] : [];
  const session = {
    id,
    start: active.start,
    end,
    minutes,
    saves,
    builds,
    bytes,
    focus,
    title: active.title,
    track: active.track,
    problemId: active.problemId,
    files: active.files.slice(0, 24),
    note: `Auto-tracked from ${saves} save${saves === 1 ? '' : 's'} across ${active.files.length} file${active.files.length === 1 ? '' : 's'}${bytes ? `, ~${formatBytes(bytes)} written` : ''}${builds ? `, ${builds} compile${builds === 1 ? '' : 's'}` : ''}: ${detail}${active.files.length > 4 ? '…' : ''}.`,
    tags: [...new Set(['auto-tracked', active.track, ...metaTags])].slice(0, 8)
  };
  state.sessions.push(session);
  if (state.sessions.length > MAX_SESSIONS) state.sessions = state.sessions.slice(-MAX_SESSIONS);
  state.lastEventAt = end;
  await log(`session finalized (${reason}) ${minutes}m · ${session.title} · ${saves} save(s)`);
  await saveState();
}

async function scanWorkspace() {
  const files = [];
  const seen = new Set();
  const folders = new Map();
  fileSizes = new Map();

  async function readText(full, size) {
    if (size > CONTENT_LIMIT) return '';
    try {
      return await fs.readFile(full, 'utf8');
    } catch {
      return '';
    }
  }

  async function walk(root, dir) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).split(path.sep).join('/');
      if (entry.isDirectory()) {
        if (IGNORED.test(`${rel}/`)) continue;
        await walk(root, full);
        continue;
      }
      if (dir === root && IGNORED_ROOT_FILES.has(entry.name)) continue;
      const extension = path.extname(entry.name).toLowerCase();
      const kind = CODE_EXT.has(extension) ? 'code' : DOC_EXT.has(extension) ? 'doc' : null;
      if (!kind) continue;
      const absolute = path.resolve(full);
      if (seen.has(absolute)) continue;
      let stat;
      try {
        stat = await fs.stat(full);
      } catch {
        continue;
      }
      if (!stat.isFile() || stat.size === 0) continue;
      seen.add(absolute);
      fileSizes.set(absolute, stat.size);
      const text = await readText(full, stat.size);
      const problemId = problemIdFromPath(rel);
      const topics = inferTopics(rel, text, kind);
      files.push({
        path: rel,
        name: entry.name,
        kind,
        size: stat.size,
        date: stat.mtime.toISOString(),
        dateKey: dateKey(stat.mtime),
        category: categoryFor(rel),
        problemId,
        solution: kind === 'code' && /solution|\.cpp$/i.test(entry.name),
        role: /(^|\/)(README|idea|notes)\.md$/i.test(rel) ? 'notes' : kind === 'doc' ? 'doc' : 'code',
        root,
        topics
      });
      if (problemId) {
        if (!folders.has(problemId)) folders.set(problemId, { docs: [], code: [] });
        const bucket = folders.get(problemId);
        if (kind === 'doc' && bucket.docs.length < 8) bucket.docs.push({ name: entry.name, text: text.slice(0, 12000) });
        if (kind === 'code' && bucket.code.length < 4) bucket.code.push(text.slice(0, 12000));
      }
    }
  }

  for (const root of workspaces) await walk(root, root);

  files.sort((a, b) => a.date.localeCompare(b.date));
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
  }));

  const meta = {};
  folders.forEach((bucket, folder) => {
    if (!bucket.code.length) return;
    meta[folder] = inferProblemMeta(folder, bucket.docs, bucket.code);
  });
  problemMeta = meta;

  const snapshot = {
    generatedAt: nowIso(),
    source: 'local watcher',
    note: 'Live read-only evidence from the local watcher. File existence is evidence of work, not proof of mastery.',
    totals: {
      files: files.length,
      code: files.filter((file) => file.kind === 'code').length,
      docs: files.filter((file) => file.kind === 'doc').length,
      problems: new Set(files.map((file) => file.problemId).filter(Boolean)).size,
      days: days.length
    },
    days,
    files,
    problemMeta: meta
  };
  await writeJsonAtomic(snapshotPath, snapshot);
  state.snapshotVersion = snapshot.generatedAt;
  await saveState();
  await log(
    `snapshot refreshed: ${snapshot.totals.files} files, ${snapshot.totals.code} code, ${snapshot.totals.problems} problem folders, ${workspaces.length} root(s)`
  );
}

function scheduleSnapshot() {
  if (snapshotTimer) return;
  snapshotTimer = setTimeout(() => {
    snapshotTimer = null;
    void scanWorkspace();
  }, 1400);
}

function sessionTitle(rel, problemId) {
  if (problemId) return problemMeta[problemId]?.title || titleFromFolder(problemId);
  const base = path.basename(rel, path.extname(rel)).replace(/^\d+-/, '');
  if (rel.startsWith('01-foundations/')) return `Foundations — ${base}`;
  if (rel.startsWith('03-contests/')) return `Contest prep — ${base}`;
  return `Workspace — ${base}`;
}

async function handleFile(root, rel) {
  const full = path.join(root, rel);
  const extension = path.extname(rel).toLowerCase();
  if (!CODE_EXT.has(extension) && !DOC_EXT.has(extension)) return;
  let stat;
  try {
    stat = await fs.stat(full);
  } catch {
    return;
  }
  if (!stat.isFile() || stat.size === 0) return;

  const now = nowIso();
  const absolute = path.resolve(full);
  const previousSize = fileSizes.get(absolute) ?? stat.size;
  const delta = Math.abs(stat.size - previousSize);
  fileSizes.set(absolute, stat.size);
  const problemId = problemIdFromPath(rel);
  if (state.active && new Date(now).getTime() - new Date(state.active.lastEvent).getTime() > idleMs) {
    await finalizeActive(state.active.lastEvent, 'gap');
  }
  if (!state.active) {
    state.active = {
      id: `daemon-${now}`,
      start: now,
      lastEvent: now,
      minutes: 0,
      saves: 0,
      builds: 0,
      bytes: 0,
      files: [],
      fileSaves: {},
      problemId,
      track: problemId ? 'problem-solving' : trackFor(rel),
      title: sessionTitle(rel, problemId)
    };
    await log(`session started · ${state.active.title}`);
  } else {
    state.active.lastEvent = now;
    if (problemId) {
      state.active.problemId = problemId;
      state.active.track = 'problem-solving';
      state.active.title = sessionTitle(rel, problemId);
    } else if (!state.active.problemId) {
      state.active.title = sessionTitle(rel, null);
      state.active.track = trackFor(rel);
    }
  }
  state.active.saves = (state.active.saves || 0) + 1;
  state.active.bytes = (state.active.bytes || 0) + delta;
  if (pendingBuilds) {
    state.active.builds = (state.active.builds || 0) + pendingBuilds;
    pendingBuilds = 0;
  }
  const label = `${rootLabel(root)}/${rel}`;
  state.active.fileSaves = state.active.fileSaves || {};
  state.active.fileSaves[label] = (state.active.fileSaves[label] || 0) + 1;
  if (!state.active.files.includes(label)) state.active.files.push(label);
  state.lastEventAt = now;
  scheduleSave();
  scheduleSnapshot();
}

function queueFile(root, filename) {
  if (!filename) return;
  const rel = String(filename).replace(/\\/g, '/');
  if (!rel || IGNORED.test(rel)) return;
  const extension = path.extname(rel).toLowerCase();
  if (BUILD_EXT.has(extension)) {
    const key = `${root}::${rel}`;
    const now = Date.now();
    if (now - (lastBuildEvents.get(key) || 0) < 5000) return;
    lastBuildEvents.set(key, now);
    if (state?.active) {
      state.active.builds = (state.active.builds || 0) + 1;
      scheduleSave();
    } else {
      pendingBuilds = Math.min(20, pendingBuilds + 1);
    }
    return;
  }
  if (!CODE_EXT.has(extension) && !DOC_EXT.has(extension)) return;
  pending.set(`${root}::${rel}`, { root, rel });
  scheduleSnapshot();
  if (batchTimer) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    const batch = [...pending.values()];
    pending = new Map();
    batch.forEach((entry) => {
      void handleFile(entry.root, entry.rel);
    });
  }, 450);
}

async function checkStop() {
  if (existsSync(stopPath)) await shutdown('stop requested');
}

async function tick() {
  try {
    await checkStop();
    if (!state.active) return;
    const now = Date.now();
    const last = new Date(state.active.lastEvent).getTime();
    const start = new Date(state.active.start).getTime();
    if (now - last > idleMs) {
      await finalizeActive(state.active.lastEvent, 'idle');
    } else if (now - start > MAX_ACTIVE_MS) {
      await finalizeActive(state.active.lastEvent, 'max length');
    }
  } catch (error) {
    await log(`tick error: ${error.message}`);
  }
}

async function shutdown(reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  await log(`shutting down: ${reason}`);
  if (state?.active) await finalizeActive(state.active.lastEvent, reason);
  if (state) {
    state.stoppedAt = nowIso();
    state.active = null;
    await saveState();
  }
  watchers.forEach((watcher) => {
    try {
      watcher.close();
    } catch {
      /* ignore */
    }
  });
  watchers = [];
  clearTimeout(batchTimer);
  clearTimeout(snapshotTimer);
  clearTimeout(saveTimer);
  try {
    await fs.rm(stopPath, { force: true });
  } catch {
    /* ignore */
  }
  process.exit(0);
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function attachWatcher(root) {
  if (shuttingDown) return;
  try {
    const watcher = watch(root, { recursive: true }, (_event, filename) => {
      if (filename) queueFile(root, String(filename));
    });
    watcher.on('error', (error) => {
      void log(`watch error (${root}): ${error.message}`);
      watchers = watchers.filter((item) => item !== watcher);
      try {
        watcher.close();
      } catch {
        /* ignore */
      }
      if (!shuttingDown) setTimeout(() => attachWatcher(root), 3000);
    });
    watchers.push(watcher);
  } catch (error) {
    void log(`could not watch ${root}: ${error.message}`);
    if (!shuttingDown) setTimeout(() => attachWatcher(root), 3000);
  }
}

async function main() {
  await fs.mkdir(daemonDir, { recursive: true });

  let restored = null;
  try {
    restored = JSON.parse(await fs.readFile(statePath, 'utf8'));
  } catch {
    restored = null;
  }
  if (restored) {
    const previousRoots = normalizeWorkspaces(
      Array.isArray(restored.workspaces) ? restored.workspaces : restored.workspace ? [restored.workspace] : []
    );
    const sameRoots =
      previousRoots.length === workspaces.length && previousRoots.every((root, index) => root === workspaces[index]);
    state = { ...createState(), ...restored, version: 2, workspaces, idleMinutes, pid: process.pid, heartbeatAt: nowIso(), stoppedAt: null };
    if (!sameRoots) state.active = null;
    if (state.active) {
      const stale = Date.now() - new Date(state.active.lastEvent).getTime() > idleMs;
      if (stale) await finalizeActive(state.active.lastEvent, 'restart');
      else await log(`resumed active session · ${state.active.title}`);
    }
  } else {
    state = createState();
  }
  if (!state.idleMinutes || state.idleMinutes !== idleMinutes) state.idleMinutes = idleMinutes;
  const previousBeat = restored?.heartbeatAt ? Date.now() - new Date(restored.heartbeatAt).getTime() : Infinity;
  if (
    restored &&
    typeof restored.pid === 'number' &&
    restored.pid !== process.pid &&
    previousBeat < 15000 &&
    isAlive(restored.pid)
  ) {
    console.error('Another watcher is already running.');
    process.exit(1);
  }
  await saveState();
  await log(`watcher online · pid ${process.pid} · ${workspaces.join(' | ')} · idle ${idleMinutes}m`);

  await scanWorkspace();

  workspaces.forEach(attachWatcher);
  if (!watchers.length) await log('no watchers started yet; retrying');
  await log(`watching ${workspaces.length} root(s): ${workspaces.join(' | ')}`);

  setInterval(() => {
    void tick();
  }, 2000);
  setInterval(() => {
    void saveState();
  }, 5000);
  setInterval(() => {
    void checkStop();
  }, 3000);

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('uncaughtException', (error) => {
    void log(`uncaught: ${error.message}`);
  });
  process.on('unhandledRejection', (error) => {
    void log(`unhandled: ${error instanceof Error ? error.message : String(error)}`);
  });
}

void main();
