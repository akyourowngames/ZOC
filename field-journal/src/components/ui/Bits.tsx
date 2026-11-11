import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { DIFFICULTIES, STAT_COLORS, TRACKS } from '@/lib/data';
import { parseDate } from '@/lib/dates';
import type { Difficulty, IconName, Rank, StatKey, TrackKey } from '@/lib/types';

export function Sheet({
  children,
  className = '',
  id
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={`sheet ${className}`} id={id}>
      {children}
    </section>
  );
}

export function SheetHead({
  eyebrow,
  title,
  right
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="sheet-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      {right}
    </header>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="sr-only">{title}</h2>
        <p className="lead">{description}</p>
      </div>
      {actions ? <div className="intro-actions">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
  icon = 'card'
}: {
  title: string;
  text: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty-state">
      <span className="empty-mark">
        <Icon name={icon} size={22} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Progress({
  value,
  className = '',
  color
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`bar ${className}`} role="img" aria-label={`${Math.round(safe)}%`}>
      <span style={{ width: `${safe}%`, background: color }} />
    </div>
  );
}

export function TrackTag({ track }: { track: TrackKey }) {
  const info = TRACKS[track] || TRACKS.foundations;
  return (
    <span className={`tag tag-${track}`}>
      <Icon name={info.icon} size={10} />
      {info.name}
    </span>
  );
}

export function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  const info = DIFFICULTIES[difficulty] || DIFFICULTIES.Practice;
  return (
    <span className="tag difficulty-tag" style={{ '--tag': info.color } as CSSProperties}>
      {difficulty}
    </span>
  );
}

export function FocusDots({ focus }: { focus: number }) {
  const value = Math.max(1, Math.min(5, Number(focus) || 3));
  return (
    <span className="focus-dots" title={`Focus ${value}/5`}>
      {'●'.repeat(value)}
      <span className="off">{'○'.repeat(5 - value)}</span>
    </span>
  );
}

export function DateStamp({ value }: { value: string }) {
  const date = parseDate(value);
  return (
    <div className="date-stamp">
      <strong>{String(date.getDate()).padStart(2, '0')}</strong>
      <span>{date.toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</span>
    </div>
  );
}

export function RankSeal({ rank, size = 'sm' }: { rank: Rank; size?: 'sm' | 'xs' | 'md' }) {
  return (
    <span
      className={`seal ${size === 'md' ? '' : size}`}
      style={{ '--seal': rank.color } as CSSProperties}
      title={rank.name}
    >
      {rank.letter}
    </span>
  );
}

export function StatDot({ stat }: { stat: StatKey }) {
  return <span className="split-dot" style={{ background: STAT_COLORS[stat] }} />;
}
