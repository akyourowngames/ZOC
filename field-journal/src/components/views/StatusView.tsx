'use client';

import type { CSSProperties } from 'react';
import { Icon } from '@/components/Icon';
import { Heatmap, Radar, Ring } from '@/components/charts/Charts';
import { useAppUI } from '@/components/ui/app-ui';
import { DateStamp, EmptyState, Progress, RankSeal, Sheet, SheetHead, TrackTag } from '@/components/ui/Bits';
import {
  ACHIEVEMENTS,
  CHAPTERS,
  RANKS,
  STATS,
  STAT_COLORS
} from '@/lib/data';
import { dayOfYear, relativeDate, timeOf } from '@/lib/dates';
import {
  achievementValue,
  activeDaySet,
  allProblems,
  chapterProgress,
  heatmapData,
  longestStreak,
  manualSessions,
  nextTopics,
  player,
  problemRecord,
  questsForToday,
  sessionXp,
  snapshot,
  timedMinutes,
  weekMetrics,
  xpAtLevel
} from '@/lib/selectors';
import { useTracker } from '@/lib/store';
import type { Quest, QuestProgress, SystemState } from '@/lib/types';

function readinessData(state: SystemState) {
  const foundation = (chapterProgress(state, 'awakening').percent + chapterProgress(state, 'problem-solving').percent) / 2;
  const zcoSolved = allProblems(state).filter(
    (problem) => problem.track === 'zco' && problemRecord(state, problem.id).status === 'solved'
  ).length;
  const ioiSolved = allProblems(state).filter(
    (problem) => problem.track === 'ioi' && problemRecord(state, problem.id).status === 'solved'
  ).length;
  const zco =
    chapterProgress(state, 'zco').percent * 0.45 +
    Math.min(1, timedMinutes(state) / 300) * 0.3 +
    Math.min(1, zcoSolved / 2) * 0.25;
  const ioi =
    chapterProgress(state, 'ioi').percent * 0.4 +
    ((chapterProgress(state, 'graphs').percent + chapterProgress(state, 'dp').percent) / 2) * 0.35 +
    Math.min(1, ioiSolved / 2) * 0.25;
  const overall = (foundation + zco + ioi) / 3;
  const label =
    overall < 0.25
      ? 'E-Rank preparation'
      : overall < 0.5
        ? 'D-Rank momentum'
        : overall < 0.75
          ? 'C/B-Rank readiness'
          : 'A/S-Rank territory';
  const text =
    overall < 0.25
      ? 'Build the base first: syntax, conditions, loops, and one problem per session.'
      : overall < 0.5
        ? 'You have a base. Start mixing timed sets with new concepts.'
        : overall < 0.75
          ? 'Add contest pressure. Accuracy first, then speed.'
          : 'Contest mode. Protect sleep, review mistakes, and simulate full papers.';
  return {
    foundation,
    zco,
    ioi,
    overall,
    label,
    text,
    targets: [
      { label: 'Foundations', value: foundation, note: 'Awakening + toolkit' },
      { label: 'ZCO', value: zco, note: 'Contest patterns and timed minutes' },
      { label: 'IOI', value: ioi, note: 'Graphs, DP and subtasks' }
    ]
  };
}

export function StatusView() {
  const { state, actions } = useTracker();
  const ui = useAppUI();
  const current = player(state);
  const quests = questsForToday(state);
  const weeks = heatmapData(state);
  const recent = manualSessions(state).slice(0, 5);
  const evidence = snapshot(state);
  const totals = evidence.totals || { files: 0, code: 0, docs: 0, problems: 0, days: 0 };
  const recentDays = (evidence.days || []).slice(-3).reverse();
  const activeDays = activeDaySet(state).size;
  const week = weekMetrics(state);
  const goal = state.profile.goalMinutesPerWeek || 300;
  const goalPercent = Math.min(100, Math.round((week.weekMinutes / goal) * 100));
  const ascending = [...RANKS].sort((a, b) => a.min - b.min);
  const nextRank = ascending.find((rank) => rank.min > current.level);
  const xpToNextRank = nextRank ? Math.max(0, xpAtLevel(nextRank.min) - current.xp) : 0;
  const chaptersDone = CHAPTERS.filter((chapter) => chapterProgress(state, chapter.id).percent === 1).length;
  const next = nextTopics(state, 4);
  const readiness = readinessData(state);

  const unlockedAchievements = ACHIEVEMENTS.map((achievement) => {
    const unlocked = Boolean(state.achievements[achievement.id]);
    const target = typeof achievement.target === 'number' ? achievement.target : 1;
    const value = achievementValue(state, achievement.type, achievement.target);
    return { ...achievement, unlocked, progress: Math.min(100, Math.round((value / target) * 100)) };
  }).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.progress - a.progress);
  const unlockedCount = unlockedAchievements.filter((item) => item.unlocked).length;

  return (
    <div>
      <div className="status-grid">
        <article className="report">
          <div className="report-top">
            <span className="eyebrow">Field report · No. {String(dayOfYear()).padStart(3, '0')}</span>
            <span className="stamp">Status window</span>
          </div>
          <div className="report-hero">
            <div className="report-identity">
              <div className="report-rank">
                <RankSeal rank={current.rank} size="md" />
                <span className="eyebrow">
                  {current.rank.name} · {current.cls.name}
                </span>
              </div>
              <h2>{current.title}</h2>
              <p>{current.cls.desc}</p>
              <div className="chips">
                <span className="pill">Power {current.power.toLocaleString('en-IN')}</span>
                <span className="pill">
                  {chaptersDone}/{CHAPTERS.length} chapters
                </span>
                <span className="pill">{state.sessions.length} entries</span>
              </div>
              <div className="report-actions">
                <button type="button" className="btn primary" onClick={() => ui.openSession()}>
                  <Icon name="plus" size={14} />
                  Log session
                </button>
                <button type="button" className="btn ghost" onClick={() => ui.navigate('gates')}>
                  <Icon name="gate" size={14} />
                  Open gates
                </button>
              </div>
            </div>
            <div className="level-orb">
              <div className="level-disc">
                <div>
                  <strong>{current.level}</strong>
                  <span>LEVEL</span>
                </div>
              </div>
              <div className="level-caption">{current.xp.toLocaleString('en-IN')} XP recorded</div>
            </div>
          </div>
          <div className="xp-block">
            <div className="xp-meta">
              <span>Level {current.level}</span>
              <span>{Math.max(0, current.next - current.xp).toLocaleString('en-IN')} XP to level {current.level + 1}</span>
            </div>
            <Progress value={current.percent} className="tall" color={current.rank.color} />
            <div className="xp-meta small">
              <span>
                {nextRank
                  ? `Next rank: ${nextRank.name} in ${xpToNextRank.toLocaleString('en-IN')} XP`
                  : 'Maximum rank reached'}
              </span>
              <span>
                {current.into.toLocaleString('en-IN')} / {current.needed.toLocaleString('en-IN')} this level
              </span>
            </div>
          </div>
          <div className="report-foot">
            <span>{evidence.note || 'Workspace evidence is read-only.'}</span>
            <span>Updated {relativeDate(state.meta.updatedAt)}</span>
          </div>
        </article>

        <Sheet className="radar-sheet">
          <SheetHead
            eyebrow="Combat profile"
            title="Attributes"
            right={<span className="completion">Power {current.power.toLocaleString('en-IN')}</span>}
          />
          <div className="radar-layout">
            <div className="radar-chart">
              <Radar stats={current.stats} />
            </div>
            <div className="radar-rows">
              {STATS.map((stat) => (
                <div className="radar-row" key={stat.id}>
                  <span className="radar-code" style={{ color: STAT_COLORS[stat.id] }}>
                    {stat.short}
                  </span>
                  <div className="radar-main">
                    <strong>{stat.name}</strong>
                    <span>{stat.desc}</span>
                  </div>
                  <b>{current.stats[stat.id]}</b>
                </div>
              ))}
            </div>
          </div>
        </Sheet>
      </div>

      <div className="stat-grid">
        {STATS.map((stat) => (
          <article className="stat-card" key={stat.id} style={{ '--stat': STAT_COLORS[stat.id] } as CSSProperties}>
            <div className="stat-card-top">
              <span className="stat-code">{stat.short}</span>
              <strong>{current.stats[stat.id]}</strong>
            </div>
            <span className="stat-name">{stat.name}</span>
            <p>{stat.desc}</p>
            <Progress value={current.stats[stat.id]} color={STAT_COLORS[stat.id]} />
          </article>
        ))}
      </div>

      <div className="quest-grid">
        <QuestSheet
          scope="daily"
          title="Daily quests"
          subtitle="Resets at midnight"
          quests={quests.daily}
          onClaim={(quest) => {
            const result = actions.claimQuest('daily', quest.id);
            if (!result.ok) actions.pushToast(result.reason || 'Could not claim that quest.', 'error');
          }}
        />
        <QuestSheet
          scope="weekly"
          title="Weekly directives"
          subtitle={state.settings.weekStart === 0 ? 'Resets Sunday' : 'Resets Monday'}
          quests={quests.weekly}
          onClaim={(quest) => {
            const result = actions.claimQuest('weekly', quest.id);
            if (!result.ok) actions.pushToast(result.reason || 'Could not claim that quest.', 'error');
          }}
        />
      </div>

      <div className="content-grid">
        <Sheet>
          <SheetHead
            eyebrow="Keep moving"
            title="Next gates"
            right={
              <button type="button" className="link-btn" onClick={() => ui.navigate('gates')}>
                View all →
              </button>
            }
          />
          {next.length ? (
            <div className="topic-list">
              {next.map((topic) => (
                <div className="topic-row" key={topic.id}>
                  <RankSeal rank={{ min: 0, letter: topic.chapterRank, name: topic.chapterRank, title: '', color: topic.color }} size="xs" />
                  <div className="topic-main">
                    <strong>{topic.name}</strong>
                    <span>
                      {topic.chapterTitle} · {topic.desc}
                    </span>
                  </div>
                  <span className="topic-xp">+{topic.xp} XP</span>
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => actions.toggleTopic(topic.id)}
                    title="Mark gate complete"
                  >
                    Seal
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Roadmap cleared"
              text="Every gate is complete. Move into timed contest sets."
              icon="checkCircle"
              action={
                <button type="button" className="btn primary" onClick={() => ui.navigate('dungeons')}>
                  Open dungeons
                </button>
              }
            />
          )}
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Your targets"
            title="Competition readiness"
            right={<span className="completion">{Math.round(readiness.overall * 100)}% overall</span>}
          />
          <Readiness />
        </Sheet>
      </div>

      <Sheet className="heatmap-sheet">
        <SheetHead
          eyebrow="Last 16 weeks"
          title="Activity heatmap"
          right={
            <span className="completion">
              {activeDays} active days · longest {longestStreak(state)} days
            </span>
          }
        />
        <div className="heatmap-wrap">
          <Heatmap weeks={weeks} />
        </div>
        <div className="heatmap-foot">
          <div className="heat-legend">
            <span>Less</span>
            <i className="heat-cell level-0" />
            <i className="heat-cell level-1" />
            <i className="heat-cell level-2" />
            <i className="heat-cell level-3" />
            <i className="heat-cell level-4" />
            <span>More</span>
          </div>
          <div className="week-goal">
            <span>This week</span>
            <strong>
              {week.weekMinutes} / {goal} min
            </strong>
            <Progress value={goalPercent} />
          </div>
        </div>
      </Sheet>

      <div className="content-grid">
        <Sheet>
          <SheetHead
            eyebrow="Consistency compounds"
            title="Recent training"
            right={
              <button type="button" className="link-btn" onClick={() => ui.navigate('log')}>
                Open log →
              </button>
            }
          />
          {recent.length ? (
            <div className="session-mini-list">
              {recent.map((session) => (
                <div className="session-line" key={session.id}>
                  <DateStamp value={session.date} />
                  <div className="session-line-main">
                    <strong>{session.topic}</strong>
                    <span>
                      {timeOf(session.date)} · {session.minutes} min · <TrackTag track={session.track} />
                    </span>
                  </div>
                  <span className="session-line-xp">+{sessionXp(session)} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No sessions yet"
              text={
                evidence.totals.files
                  ? 'Workspace evidence is recorded below. Log a focus block to start the session ledger.'
                  : 'Record your first focus block and the ledger will begin.'
              }
              icon="log"
              action={
                <button type="button" className="btn primary" onClick={() => ui.openSession()}>
                  Log a session
                </button>
              }
            />
          )}
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Trophy case"
            title="Achievements"
            right={<span className="completion">{unlockedCount}/{ACHIEVEMENTS.length} recorded</span>}
          />
          <div className="achievement-grid">
            {unlockedAchievements.slice(0, 8).map((achievement) => (
              <div className={`achievement ${achievement.unlocked ? 'unlocked' : ''}`} key={achievement.id}>
                <span className="achievement-icon" aria-hidden="true">
                  <Icon name={achievement.icon} size={14} />
                </span>
                <div className="achievement-copy">
                  <strong>{achievement.title}</strong>
                  <small>{achievement.unlocked ? 'Recorded in the ledger' : achievement.desc}</small>
                  {achievement.unlocked ? null : (
                    <div className="achievement-track">
                      <span style={{ width: `${achievement.progress}%` }} />
                    </div>
                  )}
                </div>
                <b className="achievement-xp">+{achievement.xp}</b>
              </div>
            ))}
          </div>
        </Sheet>
      </div>

      <Sheet>
        <SheetHead
          eyebrow="Repository evidence"
          title="Workspace activity"
          right={<span className="completion">Read-only snapshot</span>}
        />
        <div className="evidence-summary">
          <div>
            <strong>{totals.days}</strong>
            <span>active days</span>
          </div>
          <div>
            <strong>{totals.code}</strong>
            <span>code files</span>
          </div>
          <div>
            <strong>{totals.docs}</strong>
            <span>docs & notes</span>
          </div>
          <div>
            <strong>{totals.problems}</strong>
            <span>problem folders</span>
          </div>
        </div>
        <div className="evidence-list">
          {recentDays.length ? (
            recentDays.map((day) => (
              <div className="evidence-row" key={day.date}>
                <span className="evidence-date">{relativeDate(day.date)}</span>
                <div className="evidence-main">
                  <strong>{day.label}</strong>
                  <span>
                    {day.code} code · {day.docs} docs · {day.files} files
                  </span>
                </div>
                <b>+{day.code * 20 + day.docs * 5}</b>
              </div>
            ))
          ) : (
            <p className="muted">
              No evidence snapshot loaded. Import your workspace from the System page.
            </p>
          )}
        </div>
        <div className="sheet-foot">
          <button type="button" className="btn ghost small" onClick={() => actions.applyEvidence('topics')}>
            <Icon name="gate" size={13} />
            Apply evidenced gates
          </button>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              const count = state.evidence.snapshot.files.filter((file) => file.kind === 'code').length;
              if (!count) {
                actions.pushToast('Import workspace evidence first.', 'info');
                return;
              }
              actions.applyEvidence('problems');
            }}
          >
            <Icon name="sword" size={13} />
            Clear evidenced dungeons
          </button>
          <button type="button" className="link-btn" onClick={() => ui.navigate('system')}>
            Manage evidence →
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function QuestSheet({
  scope,
  title,
  subtitle,
  quests,
  onClaim
}: {
  scope: 'daily' | 'weekly';
  title: string;
  subtitle: string;
  quests: (Quest & { progress: QuestProgress })[];
  onClaim: (quest: Quest) => void;
}) {
  const claimed = quests.filter((quest) => quest.progress.claimed).length;
  return (
    <Sheet>
      <SheetHead
        eyebrow={scope === 'daily' ? 'System quests' : 'Weekly directive'}
        title={title}
        right={<span className="completion">{claimed}/{quests.length} claimed</span>}
      />
      <p className="sheet-sub">
        {subtitle} · {scope === 'daily' ? 'complete them before midnight' : 'complete them before the week ends'}.
      </p>
      <div className="quest-list">
        {quests.map((quest) => {
          const progress = quest.progress;
          const label = progress.claimed ? 'Claimed' : progress.complete ? 'Claim' : 'In progress';
          return (
            <div className={`quest ${progress.complete ? 'done' : ''} ${progress.claimed ? 'claimed' : ''}`} key={quest.id}>
              <span className="quest-box" aria-hidden="true">
                {progress.complete || progress.claimed ? <Icon name="check" size={13} /> : null}
              </span>
              <div className="quest-body">
                <strong>{quest.label}</strong>
                <span>{quest.desc}</span>
                <Progress value={progress.percent} className="thin" />
                <span className="quest-meta">
                  {Math.min(progress.value, quest.target)} / {quest.target} · +{quest.xp} XP
                </span>
              </div>
              <button
                type="button"
                className={`mini-btn quest-claim ${progress.complete && !progress.claimed ? 'active' : ''}`}
                onClick={() => onClaim(quest)}
                disabled={!progress.complete || progress.claimed}
              >
                {label}
              </button>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

function Readiness() {
  const { state } = useTracker();
  const { label, text, overall, targets } = readinessData(state);
  return (
    <>
      <div className="readiness-hero">
        <div className="readiness-copy">
          <strong>{label}</strong>
          <p>{text}</p>
        </div>
        <Ring percent={overall * 100} size={82} stroke={6} color="var(--red)" label={`${Math.round(overall * 100)}% readiness`} />
      </div>
      <div className="readiness-rows">
        {targets.map((target) => (
          <div className="readiness-row" key={target.label}>
            <div className="readiness-row-head">
              <strong>{target.label}</strong>
              <span>{Math.round(target.value * 100)}%</span>
            </div>
            <Progress value={target.value * 100} />
            <small>{target.note}</small>
          </div>
        ))}
      </div>
    </>
  );
}
