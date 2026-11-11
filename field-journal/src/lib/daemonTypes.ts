import type { TrackKey } from './types';

export interface DaemonSession {
  id: string;
  start: string;
  end: string;
  minutes: number;
  title: string;
  track: TrackKey;
  problemId: string | null;
  files: string[];
  note: string;
  tags: string[];
  saves?: number;
  builds?: number;
  bytes?: number;
  focus?: number;
}

export interface DaemonActive {
  id: string;
  start: string;
  lastEvent: string;
  minutes: number;
  files: string[];
  problemId: string | null;
  track: TrackKey;
  title: string;
  saves?: number;
  builds?: number;
  bytes?: number;
}

export interface DaemonConfig {
  workspaces: string[];
  idleMinutes: number;
}

export interface DaemonStateFile extends DaemonConfig {
  version: number;
  pid: number;
  startedAt: string;
  heartbeatAt: string;
  active: DaemonActive | null;
  sessions: DaemonSession[];
  lastEventAt: string | null;
  snapshotVersion: string | null;
  stoppedAt: string | null;
}

export interface DaemonStatus {
  online: boolean;
  pid: number | null;
  workspace: string;
  workspaces: string[];
  idleMinutes: number;
  active: DaemonActive | null;
  sessions: number;
  recentSessions: DaemonSession[];
  lastEventAt: string | null;
  snapshotVersion: string | null;
  startedAt: string | null;
  heartbeatAt: string | null;
  config: DaemonConfig;
  error?: string;
}
