#!/usr/bin/env node
/**
 * Regenerates the read-only workspace evidence snapshot used by the tracker.
 *
 * Usage:
 *   node scripts/build-workspace-snapshot.mjs
 *
 * The browser cannot inspect the local filesystem when index.html is opened from
 * disk, so this script writes a versioned snapshot to js/workspace.js. The app can
 * also import a folder directly from the System view at runtime.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CODE_EXT = new Set(['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp', '.js', '.ts', '.py', '.java']);
const DOC_EXT = new Set(['.md', '.txt']);
const IGNORED_DIRS = new Set(['.git', '.qoder', '.commandcode', '.vscode', '99-build-artifacts', 'node_modules', 'js', 'data', 'scripts', 'field-journal']);
const IGNORED_ROOT_FILES = new Set(['app.js', 'index.html', 'styles.css', 'package.json', 'package-lock.json']);

const labels = {
  '2026-11-02': 'Foundations, notes, and reference scaffolding',
  '2026-11-03': 'First arithmetic dungeon cleared',
  '2026-11-04': 'Conditionals and problems 01–07 documented',
  '2026-11-05': 'Problems 08–11 implemented',
  '2026-11-06': 'Problems 08–14 documented; 12–14 implemented',
  '2026-11-07': 'Loops, digits 15–21, and tracker docs'
};

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoWithOffset(date) {
  const pad = (n, width = 2) => String(n).padStart(width, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const oh = pad(Math.floor(Math.abs(offset) / 60));
  const om = pad(Math.abs(offset) % 60);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${oh}:${om}`;
}

function problemIdFromPath(rel) {
  const match = rel.match(/(?:^|\/)problems\/(\d+)-([^/]+)\//i);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function categoryFor(rel) {
  if (rel.startsWith('01-foundations/')) return 'foundations';
  if (rel.startsWith('02-problem-solving/')) return 'problem-solving';
  if (rel.startsWith('03-contests/')) return 'contests';
  if (rel.startsWith('04-reference/')) return 'reference';
  return 'workspace';
}

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
      continue;
    }
    if (dir === ROOT && IGNORED_ROOT_FILES.has(entry.name)) continue;
    const ext = path.extname(entry.name).toLowerCase();
    const kind = CODE_EXT.has(ext) ? 'code' : DOC_EXT.has(ext) ? 'doc' : null;
    if (!kind) continue;
    const stat = await fs.stat(full);
    if (stat.size === 0) continue;
    const rel = path.relative(ROOT, full).split(path.sep).join('/');
    const problemId = problemIdFromPath(rel);
    out.push({
      path: rel,
      name: entry.name,
      kind,
      size: stat.size,
      date: isoWithOffset(stat.mtime),
      dateKey: localDateKey(stat.mtime),
      category: categoryFor(rel),
      problemId,
      solution: kind === 'code' && /solution|\.cpp$/i.test(entry.name),
      role: /(^|\/)(README|idea|notes)\.md$/i.test(rel) ? 'notes' : kind === 'doc' ? 'doc' : 'code'
    });
  }
  return out;
}

const files = (await walk(ROOT)).sort((a, b) => a.date.localeCompare(b.date));
const byDate = new Map();
for (const file of files) {
  if (!byDate.has(file.dateKey)) byDate.set(file.dateKey, []);
  byDate.get(file.dateKey).push(file);
}

const days = [...byDate.entries()].map(([dateKey, items]) => {
  const code = items.filter((item) => item.kind === 'code').length;
  const docs = items.filter((item) => item.kind === 'doc').length;
  const problems = [...new Set(items.map((item) => item.problemId).filter(Boolean))];
  return {
    date: `${dateKey}T23:59:00${isoWithOffset(new Date(`${dateKey}T12:00:00`)).slice(19)}`,
    dateKey,
    files: items.length,
    code,
    docs,
    problems,
    label: labels[dateKey] || `${items.length} source and note files updated`
  };
});

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'scripts/build-workspace-snapshot.mjs',
  note: 'Read-only evidence snapshot of .cpp/.md files. File existence is evidence of work, not proof of mastery.',
  totals: {
    files: files.length,
    code: files.filter((file) => file.kind === 'code').length,
    docs: files.filter((file) => file.kind === 'doc').length,
    problems: new Set(files.map((file) => file.problemId).filter(Boolean)).size,
    days: days.length
  },
  days,
  files
};

await fs.mkdir(path.join(ROOT, 'js'), { recursive: true });
await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
await fs.writeFile(
  path.join(ROOT, 'js', 'workspace.js'),
  `/* Auto-generated by scripts/build-workspace-snapshot.mjs. Do not edit by hand. */\nwindow.WORKSPACE_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};\n`,
  'utf8'
);
await fs.writeFile(path.join(ROOT, 'data', 'workspace-snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

console.log(`Snapshot written: ${snapshot.totals.files} files, ${snapshot.totals.code} code, ${snapshot.totals.docs} docs, ${snapshot.totals.problems} problem folders, ${snapshot.totals.days} active days.`);
