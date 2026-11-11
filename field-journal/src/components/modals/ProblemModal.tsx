'use client';

import { useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { DIFFICULTY_KEYS, TRACK_KEYS, TRACKS } from '@/lib/data';
import { useTracker } from '@/lib/store';
import type { Difficulty, Problem, TrackKey } from '@/lib/types';

export function ProblemModal({
  initial = null,
  onClose
}: {
  initial?: Problem | null;
  onClose: () => void;
}) {
  const { actions } = useTracker();
  const [form, setForm] = useState({
    title: initial?.title || '',
    track: (initial?.track || 'problem-solving') as TrackKey,
    difficulty: (initial?.difficulty || 'Practice') as Difficulty,
    tags: (initial?.tags || []).join(', '),
    desc: initial?.desc || ''
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      actions.pushToast('Give the dungeon a title.', 'error');
      return;
    }
    if (initial) actions.updateProblem(initial.id, form);
    else actions.addProblem(form);
    onClose();
  };

  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="sheet-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="problem-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={15} />
        </button>
        <span className="eyebrow">{initial ? 'Amend index card' : 'New index card'}</span>
        <h2 id="problem-title">{initial ? 'Edit the dungeon' : 'Add a dungeon'}</h2>
        <p className="modal-subtitle hand">For contest problems, IOI tasks, or anything outside the printed bank.</p>

        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            maxLength={120}
            placeholder="e.g. ZCO 2024 — Railway"
            autoFocus
            required
          />
        </label>

        <div className="field-row">
          <label>
            Track
            <select name="track" value={form.track} onChange={(event) => update('track', event.target.value as TrackKey)}>
              {TRACK_KEYS.map((key) => (
                <option key={key} value={key}>
                  {TRACKS[key].name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={(event) => update('difficulty', event.target.value as Difficulty)}
            >
              {DIFFICULTY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Tags
          <input
            name="tags"
            value={form.tags}
            onChange={(event) => update('tags', event.target.value)}
            placeholder="graphs, binary search"
          />
        </label>

        <label>
          Description
          <textarea
            name="desc"
            rows={3}
            maxLength={400}
            value={form.desc}
            onChange={(event) => update('desc', event.target.value)}
            placeholder="What is the core idea?"
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            <Icon name="check" size={14} />
            {initial ? 'Save dungeon' : 'Add dungeon'}
          </button>
        </div>
      </form>
    </div>
  );
}
