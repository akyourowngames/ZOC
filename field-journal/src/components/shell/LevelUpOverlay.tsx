'use client';

import { Icon } from '@/components/Icon';
import { STATS } from '@/lib/data';
import { player } from '@/lib/selectors';
import { useTracker } from '@/lib/store';

export function LevelUpOverlay() {
  const { state, levelUp, actions } = useTracker();
  if (!levelUp) return null;
  const currentPlayer = player(state);
  return (
    <div
      className="levelup-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) actions.clearLevelUp();
      }}
    >
      <div className="levelup-sheet" role="dialog" aria-modal="true" aria-labelledby="levelup-title">
        <div className="levelup-seal" aria-hidden="true">
          {levelUp.rank.letter}
        </div>
        <span className="eyebrow">System notification · promotion</span>
        <div className="levelup-stamp" id="levelup-title">
          Level up
        </div>
        <h2>
          {levelUp.from} → {levelUp.to}
        </h2>
        <p className="hand">“{levelUp.rank.title}. Your attributes have been recalculated in the ledger.”</p>
        <div className="levelup-stats">
          {STATS.map((stat) => (
            <div className="levelup-stat" key={stat.id}>
              <span>{stat.short}</span>
              <strong>{currentPlayer.stats[stat.id]}</strong>
            </div>
          ))}
        </div>
        <button type="button" className="btn primary" onClick={actions.clearLevelUp} autoFocus>
          <Icon name="check" size={14} />
          Continue
        </button>
      </div>
    </div>
  );
}
