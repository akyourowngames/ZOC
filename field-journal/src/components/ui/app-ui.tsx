'use client';

import { createContext, useContext } from 'react';
import type { Problem, Session, TrackKey } from '@/lib/types';

export type ViewKey = 'status' | 'gates' | 'dungeons' | 'log' | 'analytics' | 'system';

export interface SessionPrefill {
  problemId?: string;
  topic?: string;
  track?: TrackKey;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  label: string;
  tone?: 'default' | 'danger';
  onAccept: () => void;
}

export interface AppUI {
  navigate: (view: ViewKey) => void;
  openSession: (prefill?: SessionPrefill) => void;
  editSession: (session: Session) => void;
  openProblem: (problem?: Problem) => void;
  confirm: (options: ConfirmOptions) => void;
}

export const AppUIContext = createContext<AppUI | null>(null);

export function useAppUI(): AppUI {
  const context = useContext(AppUIContext);
  if (!context) throw new Error('useAppUI must be used inside AppUIContext.');
  return context;
}
