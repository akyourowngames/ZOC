'use client';

import { APP } from '@/lib/data';
import { player } from '@/lib/selectors';
import { useTracker } from '@/lib/store';

export function Footer() {
  const { state } = useTracker();
  const currentPlayer = player(state);
  return (
    <footer className="app-footer">
      <span>
        {APP.name} {APP.volume} · local-first · {currentPlayer.xp.toLocaleString('en-IN')} XP
      </span>
      <span>{APP.tagline}</span>
    </footer>
  );
}
