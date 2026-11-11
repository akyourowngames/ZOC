'use client';

import type { CSSProperties } from 'react';
import { Icon } from '@/components/Icon';
import { APP, QUOTES, ALL_TOPICS } from '@/lib/data';
import { dayOfYear } from '@/lib/dates';
import { allProblems, formatBytes, player, solvedCount, storageBytes } from '@/lib/selectors';
import { useTracker } from '@/lib/store';
import type { ViewKey } from '@/components/ui/app-ui';
import type { IconName } from '@/lib/types';

const NAV: { view: ViewKey; label: string; icon: IconName }[] = [
  { view: 'status', label: 'Status', icon: 'status' },
  { view: 'gates', label: 'Gates', icon: 'gate' },
  { view: 'dungeons', label: 'Dungeons', icon: 'sword' },
  { view: 'log', label: 'Training log', icon: 'log' },
  { view: 'analytics', label: 'Analytics', icon: 'analytics' },
  { view: 'system', label: 'System', icon: 'system' }
];

export function Sidebar({
  view,
  open,
  onNavigate,
  onClose,
  onFocus
}: {
  view: ViewKey;
  open: boolean;
  onNavigate: (view: ViewKey) => void;
  onClose: () => void;
  onFocus: () => void;
}) {
  const { state } = useTracker();
  const currentPlayer = player(state);
  const problems = allProblems(state);
  const counts: Record<ViewKey, string> = {
    status: `${Math.round(currentPlayer.percent)}%`,
    gates: `${state.completedTopics.length}/${ALL_TOPICS.length}`,
    dungeons: `${solvedCount(state)}/${problems.length}`,
    log: String(state.sessions.length),
    analytics: '',
    system: ''
  };
  const quote = QUOTES[dayOfYear() % QUOTES.length];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
      <div className="binding" aria-hidden="true" />
      <div className="brand">
        <span className="brand-seal" aria-hidden="true">
          S
        </span>
        <span className="brand-copy">
          <strong>{APP.name}</strong>
          <span>{APP.tagline}</span>
        </span>
        <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close navigation">
          <Icon name="close" size={16} />
        </button>
      </div>

      <button type="button" className="player-card" onClick={() => onNavigate('status')} aria-label="Open status report">
        <span className="seal sm" style={{ '--seal': currentPlayer.rank.color } as CSSProperties}>
          {currentPlayer.rank.letter}
        </span>
        <span className="player-card-main">
          <strong>{state.profile.name}</strong>
          <span>
            LVL {currentPlayer.level} · {currentPlayer.rank.name}
          </span>
        </span>
        <span className="player-card-pct">{Math.round(currentPlayer.percent)}%</span>
        <span className="player-card-bar">
          <span style={{ width: `${currentPlayer.percent}%`, background: currentPlayer.rank.color }} />
        </span>
      </button>

      <span className="nav-caption hand" aria-hidden="true">
        Index
      </span>
      <nav className="nav">
        {NAV.map((item, index) => (
          <button
            key={item.view}
            type="button"
            className={`nav-item ${view === item.view ? 'active' : ''}`}
            onClick={() => onNavigate(item.view)}
            aria-current={view === item.view ? 'page' : undefined}
          >
            <span className="nav-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="nav-icon">
              <Icon name={item.icon} size={16} />
            </span>
            <span className="nav-label">{item.label}</span>
            {counts[item.view] ? <span className="nav-count">{counts[item.view]}</span> : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-note">
        <span className="eyebrow">Margin note</span>
        <p className="quote hand">“{quote}”</p>
        <button type="button" className="link-btn" onClick={onFocus}>
          Start a focus block →
        </button>
      </div>
      <div className="sidebar-foot">
        <span>Local-first · {formatBytes(storageBytes(state))}</span>
        <span className="mono">{APP.volume}</span>
      </div>
    </aside>
  );
}
