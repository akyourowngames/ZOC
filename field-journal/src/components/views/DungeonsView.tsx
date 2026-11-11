'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { useAppUI } from '@/components/ui/app-ui';
import { DifficultyTag, EmptyState, PageIntro, TrackTag } from '@/components/ui/Bits';
import { DIFFICULTY_KEYS, TRACKS, TRACK_KEYS, difficultyXp } from '@/lib/data';
import { relativeDate } from '@/lib/dates';
import { allProblems, evidenceForProblem, problemRecord, solvedCount } from '@/lib/selectors';
import { useTracker } from '@/lib/store';
import type { Difficulty, Problem, ProblemStatus, TrackKey } from '@/lib/types';

type StatusFilter = 'all' | ProblemStatus | 'review';

const STATUS_LABEL: Record<ProblemStatus, string> = {
  todo: 'Open',
  attempted: 'Attempted',
  solved: 'Cleared'
};

const STATUS_STAMP: Record<ProblemStatus, string> = {
  todo: 'stamp muted',
  attempted: 'stamp blue',
  solved: 'stamp filled'
};

export function DungeonsView() {
  const { state, actions } = useTracker();
  const ui = useAppUI();
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<'all' | TrackKey>('all');
  const [difficulty, setDifficulty] = useState<'all' | Difficulty>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [compact, setCompact] = useState(false);

  const problems = allProblems(state);
  const solved = solvedCount(state);
  const attempted = problems.filter((problem) => problemRecord(state, problem.id).status === 'attempted').length;
  const review = problems.filter((problem) => problemRecord(state, problem.id).review).length;
  const evidenced = problems.filter((problem) => evidenceForProblem(state, problem).implemented).length;
  const open = problems.length - solved - attempted;
  const normalized = query.trim().toLowerCase();

  const filtered = problems
    .filter((problem) => {
      const record = problemRecord(state, problem.id);
      if (track !== 'all' && problem.track !== track) return false;
      if (difficulty !== 'all' && problem.difficulty !== difficulty) return false;
      if (status === 'review' && !record.review) return false;
      if (status !== 'all' && status !== 'review' && record.status !== status) return false;
      if (!normalized) return true;
      return `${problem.title} ${problem.desc} ${problem.track} ${problem.difficulty} ${problem.tags.join(' ')}`
        .toLowerCase()
        .includes(normalized);
    })
    .sort((a, b) => a.number - b.number);

  const clearFilters = () => {
    setQuery('');
    setTrack('all');
    setDifficulty('all');
    setStatus('all');
  };

  const clearEvidenced = () => {
    const pending = problems.filter(
      (problem) => evidenceForProblem(state, problem).implemented && problemRecord(state, problem.id).status !== 'solved'
    ).length;
    if (!pending) {
      actions.pushToast('No implemented dungeons are waiting for a clear.', 'info');
      return;
    }
    ui.confirm({
      title: 'Clear evidenced dungeons?',
      message: `${pending} dungeons have source files in the workspace snapshot. Mark them cleared? File evidence is not proof of acceptance — you can reopen any of them later.`,
      label: `Clear ${pending}`,
      onAccept: () => actions.applyEvidence('problems')
    });
  };

  return (
    <div>
      <PageIntro
        eyebrow="Problem bank · evidence-aware"
        title="Dungeons"
        description="Cycle a dungeon through open → attempted → cleared. Evidence badges show what exists in your workspace, not what you have mastered."
        actions={
          <>
            <button type="button" className="btn ghost" onClick={() => ui.openProblem()}>
              <Icon name="plus" size={13} />
              Custom dungeon
            </button>
            <button type="button" className="btn primary" onClick={clearEvidenced}>
              <Icon name="checkCircle" size={14} />
              Clear evidenced
            </button>
          </>
        }
      />

      <div className="summary-strip">
        {[
          ['Total', problems.length],
          ['Cleared', solved],
          ['Attempted', attempted],
          ['Open', open],
          ['With code evidence', evidenced],
          ['Needs review', review]
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
            id="dungeonSearch"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dungeons, tags, tracks…"
            autoComplete="off"
            aria-label="Search dungeons"
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
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as 'all' | Difficulty)}
          aria-label="Filter by difficulty"
        >
          <option value="all">All difficulties</option>
          {DIFFICULTY_KEYS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="todo">Open</option>
          <option value="attempted">Attempted</option>
          <option value="solved">Cleared</option>
          <option value="review">Needs review</option>
        </select>
        <button
          type="button"
          className="btn ghost small"
          onClick={() => setCompact((value) => !value)}
          aria-pressed={compact}
        >
          {compact ? 'Comfortable' : 'Compact'}
        </button>
      </div>

      <div className="dungeon-list">
        {filtered.length ? (
          filtered.map((problem) => (
            <DungeonCard
              key={problem.id}
              problem={problem}
              compact={compact}
              onCycle={() => actions.cycleProblemStatus(problem.id)}
              onReview={() => actions.toggleReview(problem.id)}
              onLog={() => ui.openSession({ problemId: problem.id, topic: problem.title, track: problem.track })}
              onEdit={() => ui.openProblem(problem)}
              onDelete={() =>
                ui.confirm({
                  title: 'Delete custom dungeon?',
                  message: `“${problem.title}” and its progress will be removed. Built-in dungeons cannot be deleted.`,
                  label: 'Delete dungeon',
                  tone: 'danger',
                  onAccept: () => actions.removeProblem(problem.id)
                })
              }
            />
          ))
        ) : (
          <div className="sheet">
            <EmptyState
              title="No dungeons match"
              text="Clear the filters or add a custom dungeon for a contest problem."
              icon="sword"
              action={
                <button type="button" className="btn ghost small" onClick={clearFilters}>
                  Clear filters
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DungeonCard({
  problem,
  compact,
  onCycle,
  onReview,
  onLog,
  onEdit,
  onDelete
}: {
  problem: Problem;
  compact: boolean;
  onCycle: () => void;
  onReview: () => void;
  onLog: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { state } = useTracker();
  const record = problemRecord(state, problem.id);
  const evidence = evidenceForProblem(state, problem);
  const xp = difficultyXp(problem.difficulty);
  return (
    <article className={`dungeon ${record.status} ${compact ? 'compact' : ''}`}>
      <div className="dungeon-status">
        <button
          type="button"
          className={STATUS_STAMP[record.status]}
          onClick={onCycle}
          title="Cycle status: open → attempted → cleared"
        >
          {STATUS_LABEL[record.status]}
        </button>
        <span className="dungeon-num">#{String(problem.number).padStart(2, '0')}</span>
      </div>
      <div className="dungeon-main">
        <div className="dungeon-head">
          <h3>{problem.title}</h3>
          <TrackTag track={problem.track} />
          <DifficultyTag difficulty={problem.difficulty} />
          {record.review ? <span className="review-flag">Review</span> : null}
        </div>
        <p className="dungeon-desc">{problem.desc}</p>
        <div className="tag-row">
          {problem.tags.map((tag) => (
            <span className="tag ghost-tag" key={tag}>
              {tag}
            </span>
          ))}
          {evidence.total ? (
            <span
              className="evidence-badge"
              title={evidence.files.map((file) => file.path).join('\n')}
            >
              {evidence.code} code · {evidence.docs} notes
            </span>
          ) : null}
          {record.solvedAt ? <span className="solved-date">Cleared {relativeDate(record.solvedAt)}</span> : null}
        </div>
      </div>
      <div className="dungeon-side">
        <strong className="dungeon-xp">+{xp} XP</strong>
        <span className="dungeon-label">
          {record.status === 'solved' ? 'Mastery earned' : record.status === 'attempted' ? 'In progress' : 'Available'}
        </span>
        <div className="dungeon-actions">
          <button type="button" className={`mini-btn ${record.review ? 'active' : ''}`} onClick={onReview} title="Toggle review flag">
            {record.review ? 'Reviewing' : 'Review'}
          </button>
          <button type="button" className="mini-btn" onClick={onLog}>
            Log
          </button>
          {problem.custom ? (
            <>
              <button type="button" className="mini-btn" onClick={onEdit}>
                Edit
              </button>
              <button type="button" className="mini-btn danger" onClick={onDelete}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
