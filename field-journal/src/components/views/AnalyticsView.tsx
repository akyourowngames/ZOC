'use client';

import { Icon } from '@/components/Icon';
import { Bars, Donut } from '@/components/charts/Charts';
import { PageIntro, Progress, Sheet, SheetHead } from '@/components/ui/Bits';
import { humanDate } from '@/lib/dates';
import {
  difficultyBreakdown,
  insights,
  player,
  questsClaimedCount,
  trackSplit,
  weeklyXpSeries,
  xpBreakdown,
  xpEvents
} from '@/lib/selectors';
import { useTracker } from '@/lib/store';

const INSIGHT_ICONS = ['clock', 'spark', 'gate', 'arrow', 'refresh'] as const;

export function AnalyticsView() {
  const { state } = useTracker();
  const current = player(state);
  const stats = insights(state);
  const weekly = weeklyXpSeries(state, 8);
  const split = trackSplit(state);
  const difficulty = difficultyBreakdown(state);
  const breakdown = xpBreakdown(state);
  const events = xpEvents(state);
  const maxSource = Math.max(1, ...breakdown.items.map((item) => item.xp));
  const donutData = split.length
    ? split.map((entry) => ({ name: entry.name, value: entry.value, color: entry.color, unit: entry.unit }))
    : [{ name: 'No practice yet', value: 0, color: 'var(--rule)', unit: 'min' }];

  const insightRows = [
    {
      title: 'Average session',
      text: `${stats.avgSession} minutes across ${state.sessions.length} entries.`
    },
    {
      title: 'Best day',
      text: stats.bestDay
        ? `${humanDate(stats.bestDay.key)} with ${stats.bestDay.minutes} focused minutes.`
        : 'No sessions logged yet.'
    },
    {
      title: 'Weakest chapter',
      text: stats.weakestChapter
        ? `${stats.weakestChapter.title} at ${Math.round(stats.weakestChapter.percent * 100)}% completion.`
        : 'Every chapter is complete.'
    },
    {
      title: 'Next level',
      text: stats.daysToNext
        ? `At ${stats.dailyRate} XP/day, level ${stats.level + 1} is about ${stats.daysToNext} days away.`
        : 'Log sessions to build a pace forecast.'
    },
    {
      title: 'Review queue',
      text: stats.reviewQueue.length
        ? stats.reviewQueue.map((problem) => problem.title).join(', ')
        : 'No dungeons flagged for review.'
    }
  ];

  return (
    <div>
      <PageIntro
        eyebrow="Read the numbers"
        title="Analytics"
        description="XP sources, weekly pace, track split, difficulty coverage, and the next best move."
        actions={
          <>
            <div className="mini-stat">
              <strong>{current.xp.toLocaleString('en-IN')}</strong>
              <span>total XP</span>
            </div>
            <div className="mini-stat">
              <strong>{stats.dailyRate}</strong>
              <span>XP / day</span>
            </div>
          </>
        }
      />

      <div className="analytics-grid">
        <Sheet className="wide chart-sheet">
          <SheetHead
            eyebrow="Last 8 weeks"
            title="XP momentum"
            right={
              <span className="completion">
                {weekly.reduce((sum, week) => sum + week.xp, 0)} XP in window
              </span>
            }
          />
          <div className="chart-wrap">
            <Bars series={weekly} />
          </div>
          <p className="sheet-note">
            XP from sessions, workspace evidence, gates, dungeons, and dated achievements. Quest rewards are in the
            ledger.
          </p>
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Transparent math"
            title="XP sources"
            right={<span className="completion">{breakdown.total.toLocaleString('en-IN')} total</span>}
          />
          <div className="xp-source-list">
            {breakdown.items.map((item) => (
              <div className="xp-source-row" key={item.key}>
                <div className="xp-source-main">
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
                <div className="xp-source-bar">
                  <span style={{ width: `${Math.round((item.xp / maxSource) * 100)}%` }} />
                </div>
                <b>{item.xp}</b>
              </div>
            ))}
          </div>
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Where time goes"
            title="Track split"
            right={<span className="completion">{split.length ? split[0].name : 'No data'}</span>}
          />
          <div className="split-layout">
            <div className="donut-wrap">
              <Donut entries={donutData} />
            </div>
            <div className="split-legend">
              {split.length ? (
                split.map((entry) => (
                  <div className="split-row" key={entry.key}>
                    <span className="split-dot" style={{ background: entry.color }} />
                    <div>
                      <strong>{entry.name}</strong>
                      <span>
                        {entry.value} {entry.unit}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">Log a session to see your track split.</p>
              )}
            </div>
          </div>
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Coverage"
            title="Difficulty breakdown"
            right={<span className="completion">{difficulty.reduce((sum, item) => sum + item.solved, 0)} cleared</span>}
          />
          <div className="difficulty-list">
            {difficulty.map((entry) => (
              <div className="difficulty-row" key={entry.difficulty}>
                <div className="difficulty-head">
                  <strong>{entry.difficulty}</strong>
                  <span>
                    {entry.solved}/{entry.total}
                  </span>
                </div>
                <Progress value={entry.percent * 100} color={entry.color} />
                <small>+{entry.xp} XP per clear</small>
              </div>
            ))}
          </div>
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Next best move"
            title="Insights"
            right={<span className="completion">{stats.reviewQueue.length} in review</span>}
          />
          <div className="insight-list">
            {insightRows.map((row, index) => (
              <div className="insight" key={row.title}>
                <span className="insight-icon">
                  <Icon name={INSIGHT_ICONS[index] ?? 'spark'} size={13} />
                </span>
                <div>
                  <strong>{row.title}</strong>
                  <p>{row.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Sheet>

        <Sheet>
          <SheetHead eyebrow="Margin notes" title="This week" right={<span className="completion">Live ledger</span>} />
          <div className="readiness-rows">
            <div className="readiness-row">
              <div className="readiness-row-head">
                <strong>Weekly goal</strong>
                <span>{state.profile.goalMinutesPerWeek} min</span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  (weekly[weekly.length - 1]?.minutes || 0) / (state.profile.goalMinutesPerWeek || 300) * 100
                )}
              />
              <small>{weekly[weekly.length - 1]?.minutes || 0} focused minutes recorded this week.</small>
            </div>
            <div className="readiness-row">
              <div className="readiness-row-head">
                <strong>Quests claimed</strong>
                <span>{questsClaimedCount(state)}</span>
              </div>
              <small>Quest XP is recorded separately from sessions and gates.</small>
            </div>
            <div className="readiness-row">
              <div className="readiness-row-head">
                <strong>Power rating</strong>
                <span>{current.power.toLocaleString('en-IN')}</span>
              </div>
              <small>
                {current.rank.name} · {current.cls.name}
              </small>
            </div>
          </div>
        </Sheet>

        <Sheet className="wide">
          <SheetHead
            eyebrow="Audit trail"
            title="XP ledger"
            right={
              <span className="completion">
                {breakdown.items.length} sources · {questsClaimedCount(state)} quests claimed
              </span>
            }
          />
          <div className="ledger-layout">
            <div className="ledger-table">
              {breakdown.items.map((item) => (
                <div className="ledger-row" key={item.key}>
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                  <b>+{item.xp}</b>
                </div>
              ))}
              <div className="ledger-row total">
                <span>Total XP</span>
                <small>Current ledger</small>
                <b>{breakdown.total}</b>
              </div>
            </div>
            <div className="event-list">
              <h4>Recent XP events</h4>
              {events.length ? (
                events.map((event, index) => (
                  <div className="event-row" key={`${event.date}-${index}`}>
                    <span className="event-date">{humanDate(event.date)}</span>
                    <div>
                      <strong>{event.label}</strong>
                      <span>{event.type}</span>
                    </div>
                    <b>+{event.xp}</b>
                  </div>
                ))
              ) : (
                <p className="muted">No XP events yet.</p>
              )}
            </div>
          </div>
        </Sheet>
      </div>
    </div>
  );
}
