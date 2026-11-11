'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { useAppUI } from '@/components/ui/app-ui';
import { DateStamp, EmptyState, FocusDots, PageIntro, TrackTag } from '@/components/ui/Bits';
import { TRACKS, TRACK_KEYS } from '@/lib/data';
import { addDays, dateKey, timeOf } from '@/lib/dates';
import { downloadFile } from '@/lib/importExport';
import {
  manualSessions,
  problemById,
  sessionXp,
  totalMinutes,
  weekMetrics
} from '@/lib/selectors';
import { useTracker } from '@/lib/store';
import type { TrackKey } from '@/lib/types';

type RangeFilter = 'all' | '7' | '30' | '90';
type SortMode = 'newest' | 'oldest' | 'longest';

export function LogView() {
  const { state, actions } = useTracker();
  const ui = useAppUI();
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<'all' | TrackKey>('all');
  const [range, setRange] = useState<RangeFilter>('all');
  const [sort, setSort] = useState<SortMode>('newest');

  const sessions = manualSessions(state);
  const minutes = totalMinutes(state);
  const week = weekMetrics(state);
  const goal = state.profile.goalMinutesPerWeek || 300;
  const average = sessions.length ? Math.round(minutes / sessions.length) : 0;
  const xp = sessions.reduce((sum, session) => sum + sessionXp(session), 0);
  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const result = sessions.filter((session) => {
      if (track !== 'all' && session.track !== track) return false;
      if (range !== 'all') {
        const cutoff = addDays(new Date(), -Number(range));
        if (new Date(session.date) < cutoff) return false;
      }
      if (!normalized) return true;
      return `${session.topic} ${session.note} ${session.track} ${session.tags.join(' ')}`
        .toLowerCase()
        .includes(normalized);
    });
    if (sort === 'oldest') return result.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sort === 'longest') return result.slice().sort((a, b) => b.minutes - a.minutes);
    return result.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [normalized, range, sessions, sort, track]);

  const exportCsv = () => {
    downloadFile(`field-journal-sessions-${dateKey(new Date())}.csv`, actions.exportSessionsCSV(), 'text/csv');
    actions.pushToast('Sessions CSV downloaded.', 'success');
  };

  return (
    <div>
      <PageIntro
        eyebrow="Evidence of work"
        title="Training log"
        description="Every focused block is XP. Add a note and the ledger rewards the extra thinking."
        actions={
          <>
            <button type="button" className="btn ghost" onClick={exportCsv}>
              <Icon name="download" size={13} />
              Export CSV
            </button>
            <button type="button" className="btn primary" onClick={() => ui.openSession()}>
              <Icon name="plus" size={14} />
              Log session
            </button>
          </>
        }
      />

      <div className="log-summary">
        {[
          ['Sessions', sessions.length],
          ['Total minutes', minutes],
          ['Average', `${average} min`],
          ['This week', `${week.weekMinutes}/${goal} min`],
          ['Session XP', xp]
        ].map(([label, value]) => (
          <div className="summary-item" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="toolbar toolbar-wrap">
        <label className="search-box">
          <Icon name="search" size={14} />
          <input
            id="logSearch"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search entries, notes, tags…"
            autoComplete="off"
            aria-label="Search training log"
          />
        </label>
        <select
          className="select-input"
          value={track}
          onChange={(event) => setTrack(event.target.value as 'all' | TrackKey)}
          aria-label="Filter by track"
        >
          <option value="all">All tracks</option>
          {TRACK_KEYS.map((key) => (
            <option key={key} value={key}>
              {TRACKS[key].name}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={range}
          onChange={(event) => setRange(event.target.value as RangeFilter)}
          aria-label="Filter by time"
        >
          <option value="all">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <select
          className="select-input"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          aria-label="Sort entries"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="longest">Longest first</option>
        </select>
      </div>

      {filtered.length ? (
        <div className="log-sheet">
          {filtered.map((session) => {
            const linked = session.problemId ? problemById(state, session.problemId) : null;
            return (
              <div className="log-entry" key={session.id}>
                <DateStamp value={session.date} />
                <div className="log-main">
                  <div className="log-title">
                    <strong>{session.topic}</strong>
                    <TrackTag track={session.track} />
                    {session.source === 'watcher' ? <span className="tag watcher-tag">Auto</span> : null}
                  </div>
                  <div className="log-meta">
                    <span>{timeOf(session.date)}</span>
                    <span>{session.minutes} min</span>
                    <FocusDots focus={session.focus} />
                  </div>
                  {session.tags.length || linked ? (
                    <div className="log-tags">
                      {linked ? (
                        <span className="tag linked-tag" title="Linked dungeon">
                          <Icon name="sword" size={10} />
                          {linked.title}
                        </span>
                      ) : null}
                      {session.tags.map((tag) => (
                        <span className="tag ghost-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {session.note ? <p className="log-note">“{session.note}”</p> : null}
                </div>
                <div className="log-side">
                  <strong>+{sessionXp(session)} XP</strong>
                  <span>{session.minutes}m</span>
                </div>
                <div className="log-actions">
                  <button type="button" className="mini-btn" onClick={() => ui.editSession(session)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="mini-btn danger"
                    onClick={() => actions.deleteSessionWithUndo(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sheet">
          <EmptyState
            title={sessions.length ? 'No entries match' : 'No manual entries yet'}
            text={
              sessions.length
                ? 'Adjust the filters or record a new focused block.'
                : 'Your workspace evidence is already recorded in Status. Log your first focus block to start the session ledger.'
            }
            icon="log"
            action={
              <div className="button-row" style={{ marginTop: 0 }}>
                {sessions.length ? (
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => {
                      setQuery('');
                      setTrack('all');
                      setRange('all');
                      setSort('newest');
                    }}
                  >
                    Clear filters
                  </button>
                ) : null}
                <button type="button" className="btn primary small" onClick={() => ui.openSession()}>
                  Log a session
                </button>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
