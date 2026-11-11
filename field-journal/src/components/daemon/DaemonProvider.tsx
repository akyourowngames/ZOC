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
import { useTracker } from '@/lib/store';
import type { DaemonStatus } from '@/lib/daemonTypes';
import type { Snapshot } from '@/lib/types';

interface DaemonActionResult {
  ok: boolean;
  error?: string;
}

interface DaemonContextValue {
  status: DaemonStatus | null;
  loading: boolean;
  error: string | null;
  bound: boolean;
  start: (workspaces: string[], idleMinutes: number) => Promise<DaemonActionResult>;
  stop: () => Promise<DaemonActionResult>;
  bind: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const DaemonContext = createContext<DaemonContextValue | null>(null);
const BOUND_KEY = 'field-journal-watcher-workspace';
const workspaceKey = (status: DaemonStatus | null): string =>
  (status?.workspaces?.length ? status.workspaces : status?.workspace ? [status.workspace] : []).join('|');

export function DaemonProvider({ children }: { children: ReactNode }) {
  const { ready, actions } = useTracker();
  const [status, setStatus] = useState<DaemonStatus | null>(null);
  const [boundWorkspace, setBoundWorkspace] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(BOUND_KEY)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const snapshotVersion = useRef<string | null>(null);
  const disposed = useRef(false);
  const syncing = useRef(false);

  const pull = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const response = await fetch('/api/daemon', { cache: 'no-store' });
      if (!response.ok) throw new Error('Watcher API is unavailable.');
      const data = (await response.json()) as DaemonStatus;
      if (disposed.current) return;
      setStatus(data);
      setError(null);

      const linked = typeof window === 'undefined' ? null : window.localStorage.getItem(BOUND_KEY);
      if (!data.online || !linked || workspaceKey(data) !== linked) return;

      let snapshot: Snapshot | undefined;
      if (data.online && data.snapshotVersion && data.snapshotVersion !== snapshotVersion.current) {
        const snapshotResponse = await fetch('/api/daemon/snapshot', { cache: 'no-store' });
        if (snapshotResponse.ok) {
          const payload = (await snapshotResponse.json()) as { snapshot?: Snapshot };
          snapshot = payload.snapshot;
          snapshotVersion.current = data.snapshotVersion;
        }
      }
      if (data.online && (snapshot || data.recentSessions.length)) {
        actions.syncWorkspace({ snapshot, sessions: data.recentSessions });
      }
    } catch (caught) {
      if (!disposed.current) {
        setError(caught instanceof Error ? caught.message : 'Watcher API is unavailable.');
      }
    } finally {
      syncing.current = false;
    }
  }, [actions]);

  useEffect(() => {
    if (!ready) return;
    disposed.current = false;
    let timer = 0;
    const loop = async () => {
      await pull();
      if (!disposed.current) timer = window.setTimeout(loop, 4000);
    };
    void loop();
    return () => {
      disposed.current = true;
      window.clearTimeout(timer);
    };
  }, [pull, ready]);

  const post = useCallback(
    async (payload: Record<string, unknown>): Promise<DaemonActionResult> => {
      setLoading(true);
      try {
        const response = await fetch('/api/daemon', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-field-journal': '1' },
          body: JSON.stringify(payload)
        });
        const data = (await response.json()) as DaemonStatus & { error?: string };
        if (!response.ok) {
          setError(data.error || 'Watcher request failed.');
          return { ok: false, error: data.error || 'Watcher request failed.' };
        }
        setStatus(data);
        setError(null);
        if (payload.action === 'start') {
          const key = workspaceKey(data);
          if (key) {
            window.localStorage.setItem(BOUND_KEY, key);
            setBoundWorkspace(key);
          }
          snapshotVersion.current = null;
          window.setTimeout(() => void pull(), 900);
        }
        return { ok: true };
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Watcher request failed.';
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [pull]
  );

  const start = useCallback(
    (workspaces: string[], idleMinutes: number) => post({ action: 'start', workspaces, idleMinutes }),
    [post]
  );

  const stop = useCallback(() => post({ action: 'stop' }), [post]);

  const bind = useCallback(async () => {
    const key = workspaceKey(status);
    if (!key) return;
    window.localStorage.setItem(BOUND_KEY, key);
    setBoundWorkspace(key);
    snapshotVersion.current = null;
    await pull();
  }, [pull, status]);

  const syncNow = useCallback(async () => {
    await pull();
  }, [pull]);

  const value = useMemo<DaemonContextValue>(
    () => ({
      status,
      loading,
      error,
      bound: Boolean(status && boundWorkspace && boundWorkspace === workspaceKey(status)),
      start,
      stop,
      bind,
      syncNow
    }),
    [bind, boundWorkspace, error, loading, start, status, stop, syncNow]
  );

  return <DaemonContext.Provider value={value}>{children}</DaemonContext.Provider>;
}

export function useDaemon(): DaemonContextValue {
  const context = useContext(DaemonContext);
  if (!context) throw new Error('useDaemon must be used inside DaemonProvider.');
  return context;
}
