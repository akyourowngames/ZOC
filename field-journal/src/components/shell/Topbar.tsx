'use client';

import { Icon } from '@/components/Icon';
import { useDaemon } from '@/components/daemon/DaemonProvider';
import { useAppUI } from '@/components/ui/app-ui';
import { longDate } from '@/lib/dates';
import { currentStreak, player } from '@/lib/selectors';
import { playSfx, setSoundEnabled } from '@/lib/sfx';
import { useTracker } from '@/lib/store';
import type { ViewKey } from '@/components/ui/app-ui';

const TITLES: Record<ViewKey, string> = {
  status: 'Status',
  gates: 'Gates',
  dungeons: 'Dungeons',
  log: 'Training log',
  analytics: 'Analytics',
  system: 'System'
};

export function Topbar({
  view,
  onMenu,
  onSearch,
  onLog,
  onHelp
}: {
  view: ViewKey;
  onMenu: () => void;
  onSearch: () => void;
  onLog: () => void;
  onHelp: () => void;
}) {
  const { state, actions } = useTracker();
  const daemon = useDaemon();
  const ui = useAppUI();
  const currentPlayer = player(state);
  const streak = currentStreak(state);
  const soundOn = Boolean(state.settings.sound);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    actions.setSound(next);
    if (next) playSfx('chime');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-btn mobile-menu" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" size={17} />
        </button>
        <div>
          <p className="eyebrow">{longDate(new Date())}</p>
          <h1>
            <span className="scribble">{TITLES[view]}</span>
          </h1>
        </div>
      </div>
      <div className="topbar-actions">
        <button type="button" className="card-btn search-trigger" onClick={onSearch} aria-label="Open the card catalogue">
          <Icon name="search" size={13} />
          <span>Find</span>
          <kbd>Ctrl K</kbd>
        </button>
        {daemon.status ? (
          <button
            type="button"
            className={`chip watcher-chip ${daemon.status.online ? 'live' : ''}`}
            onClick={() => ui.navigate('system')}
            title={
              daemon.status.online
                ? `Watcher live · ${daemon.status.workspaces.join(' · ')}`
                : 'Open System to start the local watcher'
            }
          >
            <span className={`watcher-dot ${daemon.status.online ? 'on' : ''}`} aria-hidden="true" />
            <strong>{daemon.status.online ? 'Watching' : 'Watcher off'}</strong>
            {daemon.status.online && daemon.status.active ? <span>{daemon.status.active.minutes}m</span> : null}
          </button>
        ) : null}
        <button
          type="button"
          className="icon-btn sound-toggle"
          onClick={toggleSound}
          aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
          title={soundOn ? 'Sound on' : 'Sound off'}
        >
          <Icon name={soundOn ? 'sound' : 'mute'} size={15} />
        </button>
        <button type="button" className="icon-btn help-toggle" onClick={onHelp} aria-label="Keyboard shortcuts" title="Keys & moves">
          <Icon name="help" size={15} />
        </button>
        <span className="chip" title="Current streak">
          <Icon name="flame" size={13} />
          <strong>{streak}</strong>
          <span>day streak</span>
        </span>
        <span className="chip" title="Current level">
          <Icon name="stamp" size={13} />
          <strong>LVL {currentPlayer.level}</strong>
          <span>{currentPlayer.rank.name}</span>
        </span>
        <button type="button" className="btn primary" onClick={onLog}>
          <Icon name="plus" size={14} />
          Log session
        </button>
      </div>
    </header>
  );
}
