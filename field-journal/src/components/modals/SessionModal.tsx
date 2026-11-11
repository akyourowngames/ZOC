'use client';

import { useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { TRACK_KEYS, TRACKS } from '@/lib/data';
import { toLocalInput } from '@/lib/dates';
import { allProblems, problemById } from '@/lib/selectors';
import { useTracker } from '@/lib/store';
import type { SessionPrefill } from '@/components/ui/app-ui';
import type { Session, TrackKey } from '@/lib/types';

interface SessionFormState {
  id: string;
  topic: string;
  track: TrackKey;
  minutes: string;
  date: string;
  focus: string;
  tags: string;
  note: string;
  problemId: string;
}

const FOCUS_LABELS = ['scattered', 'light', 'solid', 'deep', 'flow'];

export function SessionModal({
  initial = null,
  prefill = null,
  onClose
}: {
  initial?: Session | null;
  prefill?: SessionPrefill | null;
  onClose: () => void;
}) {
  const { state, actions } = useTracker();
  const problems = allProblems(state);
  const presetProblem = prefill?.problemId ? problemById(state, prefill.problemId) : null;
  const [form, setForm] = useState<SessionFormState>({
    id: initial?.id || '',
    topic: initial?.topic || prefill?.topic || '',
    track: initial?.track || presetProblem?.track || prefill?.track || 'foundations',
    minutes: String(initial?.minutes ?? 45),
    date: toLocalInput(initial?.date || new Date()),
    focus: String(initial?.focus ?? 3),
    tags: (initial?.tags || []).join(', '),
    note: initial?.note || '',
    problemId: initial?.problemId || prefill?.problemId || ''
  });

  const update = <K extends keyof SessionFormState>(key: K, value: SessionFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseProblem = (id: string) => {
    const problem = id ? problemById(state, id) : null;
    setForm((current) => ({
      ...current,
      problemId: id,
      track: problem ? problem.track : current.track,
      topic: current.topic || (problem ? problem.title : '')
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const topic = form.topic.trim();
    const minutes = Number(form.minutes);
    const date = new Date(form.date);
    if (!topic) {
      actions.pushToast('Give the entry a topic.', 'error');
      return;
    }
    if (!Number.isFinite(minutes) || minutes < 1) {
      actions.pushToast('Minutes must be at least 1.', 'error');
      return;
    }
    if (Number.isNaN(date.getTime())) {
      actions.pushToast('Choose a valid date and time.', 'error');
      return;
    }
    const payload = {
      topic,
      track: form.track,
      minutes,
      date: date.toISOString(),
      focus: Number(form.focus),
      tags: form.tags,
      note: form.note,
      problemId: form.problemId || null
    };
    if (form.id) actions.updateSession(form.id, payload);
    else actions.addSession(payload);
    onClose();
  };

  return (
    <div
      className="backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="sheet-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="session-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={15} />
        </button>
        <span className="eyebrow">{form.id ? 'Amend journal entry' : 'New journal entry'}</span>
        <h2 id="session-title">{form.id ? 'Update the entry' : 'Log a training session'}</h2>
        <p className="modal-subtitle hand">Focused minutes become XP. A written note adds a small bonus.</p>

        <label>
          What did you work on?
          <input
            name="topic"
            value={form.topic}
            onChange={(event) => update('topic', event.target.value)}
            maxLength={140}
            placeholder="e.g. Prefix sums — range queries"
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
            Minutes
            <input
              name="minutes"
              type="number"
              min={1}
              max={1440}
              value={form.minutes}
              onChange={(event) => update('minutes', event.target.value)}
              required
            />
          </label>
        </div>

        <div className="field-row">
          <label>
            When
            <input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={(event) => update('date', event.target.value)}
              required
            />
          </label>
          <label>
            Focus
            <select name="focus" value={form.focus} onChange={(event) => update('focus', event.target.value)}>
              {FOCUS_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {index + 1} · {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label>
            Tags
            <input
              name="tags"
              value={form.tags}
              onChange={(event) => update('tags', event.target.value)}
              placeholder="dp, graphs, timed"
            />
          </label>
          <label>
            Linked dungeon
            <select name="problemId" value={form.problemId} onChange={(event) => chooseProblem(event.target.value)}>
              <option value="">None</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Note (optional)
          <textarea
            name="note"
            rows={3}
            maxLength={2000}
            value={form.note}
            onChange={(event) => update('note', event.target.value)}
            placeholder="What clicked? What needs another pass?"
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            <Icon name="check" size={14} />
            {form.id ? 'Update entry' : 'Record entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
