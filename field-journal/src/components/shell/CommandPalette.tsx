'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { useAppUI } from '@/components/ui/app-ui';
import { CHAPTERS, PROBLEMS } from '@/lib/data';
import { dateKey } from '@/lib/dates';
import { downloadFile } from '@/lib/importExport';
import { useTracker } from '@/lib/store';
import type { IconName } from '@/lib/types';

interface PaletteItem {
  icon: IconName;
  title: string;
  hint: string;
  run: () => void;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { state, actions } = useTracker();
  const ui = useAppUI();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const items = useMemo<PaletteItem[]>(() => {
    const base: PaletteItem[] = [
      { icon: 'status', title: 'Go to Status', hint: 'Hunter report', run: () => ui.navigate('status') },
      { icon: 'gate', title: 'Go to Gates', hint: 'Roadmap and chapters', run: () => ui.navigate('gates') },
      { icon: 'sword', title: 'Go to Dungeons', hint: 'Problem bank', run: () => ui.navigate('dungeons') },
      { icon: 'log', title: 'Go to Training log', hint: 'Entries and notes', run: () => ui.navigate('log') },
      { icon: 'analytics', title: 'Go to Analytics', hint: 'Charts and XP ledger', run: () => ui.navigate('analytics') },
      { icon: 'system', title: 'Go to System', hint: 'Profile, imports, exports', run: () => ui.navigate('system') },
      { icon: 'plus', title: 'Log a training session', hint: 'Keyboard: N', run: () => ui.openSession() },
      { icon: 'card', title: 'Add a custom dungeon', hint: 'Contest problem or IOI task', run: () => ui.openProblem() },
      {
        icon: 'download',
        title: 'Export JSON backup',
        hint: 'Full local backup',
        run: () => {
          const backup = actions.exportBackupJSON();
          downloadFile(`field-journal-${dateKey(new Date())}.json`, JSON.stringify(backup, null, 2), 'application/json');
          actions.pushToast('JSON backup downloaded.', 'success');
        }
      },
      {
        icon: state.settings.theme === 'night' ? 'sun' : 'moon',
        title: `Switch to ${state.settings.theme === 'night' ? 'paper' : 'archive night'} theme`,
        hint: 'Paper / archive night',
        run: () => actions.updateSettings({ theme: state.settings.theme === 'night' ? 'paper' : 'night' })
      },
      { icon: 'check', title: 'Claim completed quests', hint: 'Collect ready rewards', run: () => actions.claimAllQuests() },
      {
        icon: 'gate',
        title: 'Apply evidenced gates',
        hint: 'Complete gates with source evidence',
        run: () => actions.applyEvidence('topics')
      },
      {
        icon: 'sword',
        title: 'Clear evidenced dungeons',
        hint: 'Mark implemented problems cleared',
        run: () => actions.applyEvidence('problems')
      }
    ];

    const normalized = query.trim().toLowerCase();
    if (normalized) {
      CHAPTERS.forEach((chapter) => {
        chapter.topics.forEach((topic) => {
          if (`${topic.name} ${topic.desc} ${chapter.title}`.toLowerCase().includes(normalized)) {
            base.push({
              icon: 'gate',
              title: topic.name,
              hint: `${chapter.title} · +${topic.xp} XP`,
              run: () => ui.navigate('gates')
            });
          }
        });
      });
      PROBLEMS.forEach((problem) => {
        if (`${problem.title} ${problem.desc} ${problem.tags.join(' ')}`.toLowerCase().includes(normalized)) {
          base.push({
            icon: 'sword',
            title: problem.title,
            hint: `${problem.difficulty} · +${problem.tags.slice(0, 2).join(', ')}`,
            run: () => ui.navigate('dungeons')
          });
        }
      });
    }

    return base
      .filter((item) => !normalized || `${item.title} ${item.hint}`.toLowerCase().includes(normalized))
      .slice(0, 40);
  }, [actions, query, state.settings.theme, ui]);

  const activeIndex = Math.min(index, Math.max(0, items.length - 1));

  const runItem = (position: number) => {
    const item = items[position];
    if (!item) return;
    onClose();
    item.run();
  };

  return (
    <div
      className="backdrop catalogue-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="catalogue" role="dialog" aria-modal="true" aria-labelledby="catalogue-title">
        <div className="catalogue-search">
          <Icon name="search" size={16} />
          <input
            id="catalogue-title"
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setIndex((current) => Math.min(items.length - 1, current + 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setIndex((current) => Math.max(0, current - 1));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                runItem(activeIndex);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
              }
            }}
            placeholder="Search the card catalogue — actions, gates, dungeons…"
            autoComplete="off"
            aria-label="Search actions, gates and dungeons"
          />
          <kbd>Esc</kbd>
        </div>
        <div className="catalogue-list" role="listbox">
          {items.length ? (
            items.map((item, position) => (
              <button
                key={`${item.title}-${position}`}
                type="button"
                className={`catalogue-item ${position === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setIndex(position)}
                onClick={() => runItem(position)}
                role="option"
                aria-selected={position === activeIndex}
              >
                <span className="catalogue-index">{String(position + 1).padStart(2, '0')}</span>
                <span className="catalogue-icon">
                  <Icon name={item.icon} size={13} />
                </span>
                <span className="catalogue-copy">
                  <strong>{item.title}</strong>
                  <span>{item.hint}</span>
                </span>
                <kbd>↵</kbd>
              </button>
            ))
          ) : (
            <div className="catalogue-empty">No cards match. Try “log”, “gates”, or a problem name.</div>
          )}
        </div>
        <div className="catalogue-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> browse
          </span>
          <span>
            <kbd>Enter</kbd> run
          </span>
          <span>
            <kbd>Ctrl K</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  );
}
