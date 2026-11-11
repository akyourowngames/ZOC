'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { Footer } from '@/components/shell/Footer';
import { LevelUpOverlay } from '@/components/shell/LevelUpOverlay';
import { Sidebar } from '@/components/shell/Sidebar';
import { ShortcutsModal } from '@/components/shell/ShortcutsModal';
import { ToastStack } from '@/components/shell/ToastStack';
import { Topbar } from '@/components/shell/Topbar';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ProblemModal } from '@/components/modals/ProblemModal';
import { SessionModal } from '@/components/modals/SessionModal';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { DungeonsView } from '@/components/views/DungeonsView';
import { GatesView } from '@/components/views/GatesView';
import { LogView } from '@/components/views/LogView';
import { StatusView } from '@/components/views/StatusView';
import { SystemView } from '@/components/views/SystemView';
import {
  AppUIContext,
  type ConfirmOptions,
  type SessionPrefill,
  type ViewKey
} from '@/components/ui/app-ui';
import { useTracker } from '@/lib/store';
import { setSoundEnabled } from '@/lib/sfx';
import type { Problem, Session } from '@/lib/types';

interface SessionModalState {
  key: number;
  initial?: Session;
  prefill?: SessionPrefill;
}

interface ProblemModalState {
  key: number;
  initial?: Problem;
}

export function TrackerApp() {
  const { state, ready } = useTracker();
  const [view, setView] = useState<ViewKey>('status');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sessionModal, setSessionModal] = useState<SessionModalState | null>(null);
  const [problemModal, setProblemModal] = useState<ProblemModalState | null>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const navigate = useCallback((next: ViewKey) => {
    setView(next);
    setSidebarOpen(false);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, []);

  const openSession = useCallback((prefill?: SessionPrefill) => {
    setSessionModal({ key: Date.now(), prefill });
  }, []);

  const editSession = useCallback((session: Session) => {
    setSessionModal({ key: Date.now(), initial: session });
  }, []);

  const openProblem = useCallback((problem?: Problem) => {
    setProblemModal({ key: Date.now(), initial: problem });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmOptions(options);
  }, []);

  const ui = useMemo(
    () => ({ navigate, openSession, editSession, openProblem, confirm }),
    [confirm, editSession, navigate, openProblem, openSession]
  );

  const modalOpen = Boolean(sessionModal || problemModal || confirmOptions || paletteOpen || shortcutsOpen);

  useEffect(() => {
    if (!ready) return;
    setSoundEnabled(Boolean(state.settings.sound));
  }, [ready, state.settings.sound]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', modalOpen);
    return () => document.body.classList.remove('modal-open');
  }, [modalOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.key === 'Escape') {
        if (paletteOpen) {
          setPaletteOpen(false);
          return;
        }
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (sessionModal || problemModal || confirmOptions) {
          setSessionModal(null);
          setProblemModal(null);
          setConfirmOptions(null);
          return;
        }
        if (sidebarOpen) setSidebarOpen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = Boolean(
        target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable)
      );
      if (typing || paletteOpen || sessionModal || problemModal || confirmOptions || shortcutsOpen) return;
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openSession();
      } else if (event.key === '/') {
        event.preventDefault();
        const map: Partial<Record<ViewKey, string>> = {
          gates: '#gateSearch',
          dungeons: '#dungeonSearch',
          log: '#logSearch'
        };
        const selector = map[view];
        if (selector) document.querySelector<HTMLInputElement>(selector)?.focus();
        else setPaletteOpen(true);
      } else if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmOptions, openSession, paletteOpen, problemModal, sessionModal, shortcutsOpen, sidebarOpen, view]);

  if (!ready) {
    return (
      <div className="boot-sheet">
        <div>
          <div className="boot-stamp">Opening the journal</div>
          <p className="boot-hand">Dusting off the ledger…</p>
        </div>
      </div>
    );
  }

  return (
    <AppUIContext.Provider value={ui}>
      <a className="skip-link" href="#mainContent">
        Skip to content
      </a>
      <div className="app-shell">
        <Sidebar
          view={view}
          open={sidebarOpen}
          onNavigate={navigate}
          onClose={() => setSidebarOpen(false)}
          onFocus={() => openSession()}
        />
        <div
          className={`scrim ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <main className="main" id="mainContent">
          <Topbar
            view={view}
            onMenu={() => setSidebarOpen(true)}
            onSearch={() => setPaletteOpen(true)}
            onLog={() => openSession()}
            onHelp={() => setShortcutsOpen(true)}
          />
          <div className="view active-view" key={view}>
            {view === 'status' ? <StatusView /> : null}
            {view === 'gates' ? <GatesView /> : null}
            {view === 'dungeons' ? <DungeonsView /> : null}
            {view === 'log' ? <LogView /> : null}
            {view === 'analytics' ? <AnalyticsView /> : null}
            {view === 'system' ? <SystemView /> : null}
          </div>
          <Footer />
        </main>
      </div>

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
      {sessionModal ? (
        <SessionModal
          key={sessionModal.key}
          initial={sessionModal.initial}
          prefill={sessionModal.prefill}
          onClose={() => setSessionModal(null)}
        />
      ) : null}
      {problemModal ? (
        <ProblemModal key={problemModal.key} initial={problemModal.initial} onClose={() => setProblemModal(null)} />
      ) : null}
      <ConfirmModal options={confirmOptions} onClose={() => setConfirmOptions(null)} />
      {shortcutsOpen ? <ShortcutsModal onClose={() => setShortcutsOpen(false)} /> : null}
      <ToastStack />
      <LevelUpOverlay />
    </AppUIContext.Provider>
  );
}
