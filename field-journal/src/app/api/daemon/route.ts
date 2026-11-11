import { spawn } from 'node:child_process';
import { existsSync, promises as fs, statSync } from 'node:fs';
import path from 'node:path';
import { connection, NextResponse } from 'next/server';
import type { DaemonConfig, DaemonStateFile, DaemonStatus } from '@/lib/daemonTypes';

const ROOT = process.cwd();
const DAEMON_DIR = path.join(ROOT, '.daemon');
const STATE_PATH = path.join(DAEMON_DIR, 'state.json');
const CONFIG_PATH = path.join(DAEMON_DIR, 'config.json');
const STOP_PATH = path.join(DAEMON_DIR, 'stop');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'workspace-daemon.mjs');
const DEFAULT_CANDIDATE = path.resolve(ROOT, '..');

function validDirectory(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const resolved = path.resolve(value.trim());
  try {
    return statSync(resolved).isDirectory() ? resolved : null;
  } catch {
    return null;
  }
}

function normalizeWorkspaces(values: unknown[]): string[] {
  const resolved: string[] = [];
  values.forEach((value) => {
    const directory = validDirectory(value);
    if (directory && !resolved.includes(directory)) resolved.push(directory);
  });
  resolved.sort((a, b) => a.length - b.length);
  const kept: string[] = [];
  resolved.forEach((candidate) => {
    if (kept.some((root) => candidate === root || candidate.startsWith(`${root}${path.sep}`))) return;
    kept.push(candidate);
  });
  return kept;
}

function defaultConfig(): DaemonConfig {
  const fallback = existsSync(DEFAULT_CANDIDATE) && statSync(DEFAULT_CANDIDATE).isDirectory() ? DEFAULT_CANDIDATE : ROOT;
  return { workspaces: [fallback], idleMinutes: 10 };
}

async function readJson(file: string): Promise<unknown> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function readState(): Promise<DaemonStateFile | null> {
  const raw = await readJson(STATE_PATH);
  if (!raw || typeof raw !== 'object') return null;
  return raw as DaemonStateFile;
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function loadConfig(): Promise<DaemonConfig> {
  const base = defaultConfig();
  const stored = await readJson(CONFIG_PATH);
  const record = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {};
  const storedWorkspaces = Array.isArray(record.workspaces)
    ? record.workspaces
    : typeof record.workspace === 'string'
      ? [record.workspace]
      : [];
  const workspaces = normalizeWorkspaces(storedWorkspaces);
  return {
    workspaces: workspaces.length ? workspaces : base.workspaces,
    idleMinutes:
      Number(record.idleMinutes) > 0 ? Math.max(0.02, Math.min(240, Number(record.idleMinutes))) : base.idleMinutes
  };
}

function isOnline(state: DaemonStateFile | null): boolean {
  if (!state?.heartbeatAt) return false;
  const age = Date.now() - new Date(state.heartbeatAt).getTime();
  return Number.isFinite(age) && age < 15000;
}

function stateWorkspaces(state: DaemonStateFile | null, config: DaemonConfig): string[] {
  if (state && Array.isArray(state.workspaces) && state.workspaces.length) return state.workspaces;
  const legacy = (state as unknown as { workspace?: string } | null)?.workspace;
  if (legacy) return normalizeWorkspaces([legacy]);
  return config.workspaces;
}

function buildStatus(state: DaemonStateFile | null, config: DaemonConfig): DaemonStatus {
  const online = isOnline(state);
  const workspaces = stateWorkspaces(state, config);
  return {
    online,
    pid: typeof state?.pid === 'number' ? state.pid : null,
    workspace: workspaces[0] || '',
    workspaces,
    idleMinutes: Number(state?.idleMinutes) || config.idleMinutes,
    active: online && state?.active ? state.active : null,
    sessions: Array.isArray(state?.sessions) ? state.sessions.length : 0,
    recentSessions: state && Array.isArray(state.sessions) ? state.sessions.slice(-50) : [],
    lastEventAt: state?.lastEventAt ?? null,
    snapshotVersion: state?.snapshotVersion ?? null,
    startedAt: state?.startedAt ?? null,
    heartbeatAt: state?.heartbeatAt ?? null,
    config
  };
}

async function waitForHeartbeat(timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const state = await readState();
    if (isOnline(state)) return state;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return readState();
}

function requestWorkspaces(body: Record<string, unknown>, fallback: string[]): string[] {
  if (Array.isArray(body.workspaces)) {
    const normalized = normalizeWorkspaces(body.workspaces);
    if (normalized.length) return normalized;
  }
  if (typeof body.workspace === 'string') {
    const normalized = normalizeWorkspaces([body.workspace]);
    if (normalized.length) return normalized;
  }
  return fallback;
}

function sameWorkspaces(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((root, index) => root === b[index]);
}

export async function GET() {
  await connection();
  const config = await loadConfig();
  const state = await readState();
  return NextResponse.json(buildStatus(state, config), {
    headers: { 'cache-control': 'no-store' }
  });
}

export async function POST(request: Request) {
  await connection();
  if (request.headers.get('x-field-journal') !== '1') {
    return NextResponse.json({ error: 'Missing local watcher header.' }, { status: 403 });
  }
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await request.json();
    body = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    body = {};
  }
  const action = String(body.action || '');

  if (action === 'config') {
    const stateNow = await readState();
    if (isOnline(stateNow)) {
      return NextResponse.json({ error: 'Stop the watcher before changing its config.' }, { status: 409 });
    }
    const config = await loadConfig();
    const workspaces = requestWorkspaces(body, config.workspaces);
    const idleMinutes = Math.max(0.02, Math.min(240, Number(body.idleMinutes) || config.idleMinutes));
    const next = { workspaces, idleMinutes };
    await writeJson(CONFIG_PATH, next);
    return NextResponse.json(buildStatus(stateNow, next), { headers: { 'cache-control': 'no-store' } });
  }

  if (action === 'start') {
    const current = await loadConfig();
    const workspaces = requestWorkspaces(body, current.workspaces);
    const idleMinutes = Math.max(0.02, Math.min(240, Number(body.idleMinutes) || current.idleMinutes));
    const config = { workspaces, idleMinutes };

    const existing = await readState();
    if (isOnline(existing)) {
      if (sameWorkspaces(stateWorkspaces(existing, current), workspaces)) {
        return NextResponse.json(buildStatus(existing, config), { headers: { 'cache-control': 'no-store' } });
      }
      return NextResponse.json(
        { error: 'Watcher is already running for different folders. Stop it first.' },
        { status: 409, headers: { 'cache-control': 'no-store' } }
      );
    }

    await writeJson(CONFIG_PATH, config);
    await fs.mkdir(DAEMON_DIR, { recursive: true });
    await fs.rm(STOP_PATH, { force: true });
    const args = [SCRIPT_PATH, '--dir', DAEMON_DIR, '--idle', String(idleMinutes)];
    workspaces.forEach((workspace) => {
      args.push('--workspace', workspace);
    });
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    child.unref();
    const state = await waitForHeartbeat(3600);
    if (!isOnline(state)) {
      return NextResponse.json(
        { error: 'The watcher did not start. Check .daemon/daemon.log.' },
        { status: 500, headers: { 'cache-control': 'no-store' } }
      );
    }
    return NextResponse.json(buildStatus(state, config), { headers: { 'cache-control': 'no-store' } });
  }

  if (action === 'stop') {
    const config = await loadConfig();
    await fs.mkdir(DAEMON_DIR, { recursive: true });
    await fs.writeFile(STOP_PATH, 'stop', 'utf8');
    await new Promise((resolve) => setTimeout(resolve, 900));
    let state = await readState();
    if (isOnline(state) && typeof state?.pid === 'number') {
      try {
        process.kill(state.pid);
      } catch {
        /* already gone */
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
      state = await readState();
    }
    if (state) {
      state.stoppedAt = new Date().toISOString();
      state.heartbeatAt = '2000-01-01T00:00:00.000Z';
      state.active = null;
      await writeJson(STATE_PATH, state);
    }
    await fs.rm(STOP_PATH, { force: true });
    return NextResponse.json(buildStatus(state, config), { headers: { 'cache-control': 'no-store' } });
  }

  return NextResponse.json({ error: 'Unknown watcher action.' }, { status: 400 });
}
