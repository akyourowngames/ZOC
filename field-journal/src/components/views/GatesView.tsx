'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Icon } from '@/components/Icon';
import { EmptyState, PageIntro, Progress, RankSeal, Sheet } from '@/components/ui/Bits';
import { CHAPTERS, ALL_TOPICS } from '@/lib/data';
import { chapterProgress, evidenceTopicIds } from '@/lib/selectors';
import { useTracker } from '@/lib/store';
import type { Rank } from '@/lib/types';

type GateFilter = 'all' | 'open' | 'done';

function rankForChapter(letter: string, color: string): Rank {
  return { min: 0, letter, name: `${letter}-Rank`, title: '', color };
}

export function GatesView() {
  const { state, actions } = useTracker();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GateFilter>('all');
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const evidence = evidenceTopicIds(state);

  const normalized = query.trim().toLowerCase();
  const allCollapsed = CHAPTERS.every((chapter) => openChapters[chapter.id] === false);

  const visible = useMemo(() => {
    return CHAPTERS.map((chapter, index) => {
      const chapterMatches = !normalized || `${chapter.title} ${chapter.subtitle} ${chapter.description}`.toLowerCase().includes(normalized);
      const topics = chapter.topics.filter((topic) => {
        const matches = !normalized || chapterMatches || `${topic.name} ${topic.desc}`.toLowerCase().includes(normalized);
        if (!matches) return false;
        const done = state.completedTopics.includes(topic.id);
        if (filter === 'open') return !done;
        if (filter === 'done') return done;
        return true;
      });
      return { chapter, index, topics };
    }).filter((entry) => entry.topics.length || (!normalized && filter === 'all'));
  }, [filter, normalized, state.completedTopics]);

  const done = state.completedTopics.length;
  const percent = Math.round((done / ALL_TOPICS.length) * 100);

  return (
    <div>
      <PageIntro
        eyebrow="Your syllabus · 7 chapters · 55 gates"
        title="Gates"
        description="Clear gates to earn XP and raise INT. Workspace evidence is shown, but mastery stays in your hands."
        actions={
          <>
            <div className="mini-stat">
              <strong>{done}</strong>
              <span>gates cleared</span>
            </div>
            <div className="mini-stat">
              <strong>{percent}%</strong>
              <span>completion</span>
            </div>
          </>
        }
      />

      <div className="toolbar">
        <label className="search-box">
          <Icon name="search" size={14} />
          <input
            id="gateSearch"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search gates, chapters, concepts…"
            autoComplete="off"
            aria-label="Search gates"
          />
        </label>
        <div className="segmented" role="group" aria-label="Filter gates">
          {(['all', 'open', 'done'] as GateFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={`seg ${filter === value ? 'active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'All' : value === 'open' ? 'Open' : 'Cleared'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn ghost small"
          onClick={() => {
            const next = !allCollapsed;
            const map: Record<string, boolean> = {};
            CHAPTERS.forEach((chapter) => {
              map[chapter.id] = !next;
            });
            setOpenChapters(map);
          }}
        >
          {allCollapsed ? 'Expand all' : 'Collapse all'}
        </button>
      </div>

      <div className="gates-list">
        {visible.length ? (
          visible.map(({ chapter, index, topics }) => {
            const progress = chapterProgress(state, chapter.id);
            const chapterDone = Math.round(progress.percent * 100);
            const open = Boolean(normalized) || openChapters[chapter.id] !== false;
            return (
              <section className="chapter" key={chapter.id} style={{ '--chapter': chapter.color } as CSSProperties}>
                <button
                  type="button"
                  className="chapter-head"
                  onClick={() => setOpenChapters((current) => ({ ...current, [chapter.id]: !open }))}
                  aria-expanded={open}
                >
                  <span className="chapter-tab">{String(index + 1).padStart(2, '0')}</span>
                  <RankSeal rank={rankForChapter(chapter.rank, chapter.color)} size="sm" />
                  <span className="chapter-title">
                    <span className="eyebrow">
                      Chapter {index + 1} · {chapter.rank}-Rank
                    </span>
                    <strong>{chapter.title}</strong>
                    <span>{chapter.subtitle}</span>
                  </span>
                  <span className="chapter-progress">
                    <span className="chapter-percent">{chapterDone}%</span>
                    <span className="completion">
                      {progress.done}/{progress.total} gates
                    </span>
                    <Progress value={chapterDone} />
                  </span>
                  <span className="chapter-toggle" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
                    <Icon name="chevron" size={14} />
                  </span>
                </button>
                {open ? (
                  <div className="chapter-body">
                    <p className="chapter-desc hand">{chapter.description}</p>
                    <div className="gate-list">
                      {topics.map((topic) => {
                        const complete = state.completedTopics.includes(topic.id);
                        return (
                          <div className={`gate-row ${complete ? 'done' : ''}`} key={topic.id}>
                            <button
                              type="button"
                              className="gate-box"
                              onClick={() => actions.toggleTopic(topic.id)}
                              aria-pressed={complete}
                              aria-label={`${complete ? 'Reopen' : 'Complete'} ${topic.name}`}
                            >
                              {complete ? <Icon name="check" size={12} /> : null}
                            </button>
                            <div className="gate-main">
                              <strong>{topic.name}</strong>
                              <span>{topic.desc}</span>
                            </div>
                            {evidence.has(topic.id) ? (
                              <span className="evidence-badge" title="A matching source file exists in the snapshot">
                                Evidence
                              </span>
                            ) : null}
                            <span className="gate-xp">+{topic.xp} XP</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })
        ) : (
          <Sheet>
            <EmptyState
              title="No gates match"
              text="Try a different search or clear the filter."
              icon="search"
              action={
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                >
                  Clear filters
                </button>
              }
            />
          </Sheet>
        )}
      </div>
    </div>
  );
}
