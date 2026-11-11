'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { playSfx } from '@/lib/sfx';

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Ctrl', 'K'], label: 'Open the card catalogue' },
  { keys: ['N'], label: 'Log a training session' },
  { keys: ['/'], label: 'Focus the current search' },
  { keys: ['?'], label: 'Open this shortcuts sheet' },
  { keys: ['Esc'], label: 'Close overlays or navigation' },
  { keys: ['Auto'], label: 'Watcher logs file saves automatically' }
];

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    playSfx('tick');
  }, []);

  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-modal shortcuts-sheet" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={15} />
        </button>
        <span className="eyebrow">Field manual</span>
        <h2 id="shortcuts-title">Keys &amp; moves</h2>
        <p className="modal-subtitle hand">“Work the page like a ledger, not a dashboard.”</p>
        <div className="shortcut-list">
          {SHORTCUTS.map((shortcut) => (
            <div className="shortcut-row" key={shortcut.label}>
              <span className="shortcut-keys">
                {shortcut.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </span>
              <span>{shortcut.label}</span>
            </div>
          ))}
        </div>
        <p className="fine-print">
          The watcher records file saves in your chosen folders, groups them into blocks, and updates evidence
          automatically. Sound effects can be muted from the topbar speaker.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
