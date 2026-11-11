import { STATS } from '@/lib/data';
import type { StatKey } from '@/lib/types';

export function Ring({
  percent,
  size = 140,
  stroke = 8,
  color = 'var(--red)',
  label
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const offset = circumference * (1 - value / 100);
  return (
    <svg
      className="ring"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={label || `${Math.round(value)}%`}
    >
      <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
      <circle
        className="ring-value"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeDasharray={circumference.toFixed(2)}
        strokeDashoffset={offset.toFixed(2)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function Radar({ stats, size = 280 }: { stats: Record<StatKey, number>; size?: number }) {
  const center = size / 2;
  const radius = size * 0.32;
  const keys = STATS.map((stat) => stat.id);
  const labels = STATS.map((stat) => stat.short);
  const count = keys.length;
  const angle = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / count;
  const point = (index: number, ratio: number) => {
    const distance = radius * ratio;
    return [center + Math.cos(angle(index)) * distance, center + Math.sin(angle(index)) * distance];
  };
  const rings = [0.25, 0.5, 0.75, 1].map((ratio) => (
    <polygon
      key={ratio}
      className="radar-grid"
      points={keys.map((_, index) => point(index, ratio).map((value) => value.toFixed(1)).join(',')).join(' ')}
    />
  ));
  const axes = keys.map((_, index) => {
    const [x, y] = point(index, 1);
    return <line key={index} className="radar-axis" x1={center} y1={center} x2={x.toFixed(1)} y2={y.toFixed(1)} />;
  });
  const shape = keys
    .map((key, index) => {
      const [x, y] = point(index, Math.max(0.08, Math.min(1, (Number(stats[key]) || 0) / 100)));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      className="radar"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Attribute profile"
    >
      {rings}
      {axes}
      <polygon className="radar-shape" points={shape} />
      {keys.map((key, index) => {
        const [x, y] = point(index, Math.max(0.08, Math.min(1, (Number(stats[key]) || 0) / 100)));
        return <circle key={key} className="radar-dot" cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.8" />;
      })}
      {keys.map((key, index) => {
        const [x, y] = point(index, 1.26);
        return (
          <g key={`label-${key}`}>
            <text className="radar-label" x={x.toFixed(1)} y={(y + 3).toFixed(1)} textAnchor="middle">
              {labels[index]}
            </text>
            <text className="radar-value" x={x.toFixed(1)} y={(y + 15).toFixed(1)} textAnchor="middle">
              {Number(stats[key]) || 0}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Bars({
  series,
  width = 760,
  height = 260
}: {
  series: { label: string; xp: number; minutes: number; current: boolean }[];
  width?: number;
  height?: number;
}) {
  const padding = { top: 26, right: 16, bottom: 36, left: 44 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const values = series.map((item) => Number(item.xp) || 0);
  const max = Math.max(100, ...values);
  const niceMax = Math.ceil(max / 100) * 100;
  const slot = plotW / Math.max(1, series.length);
  const barW = Math.min(46, slot * 0.52);
  const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = padding.top + plotH - plotH * ratio;
    return (
      <g key={ratio}>
        <line className="chart-grid" x1={padding.left} y1={y.toFixed(1)} x2={width - padding.right} y2={y.toFixed(1)} />
        <text className="chart-axis" x={padding.left - 8} y={(y + 3).toFixed(1)} textAnchor="end">
          {Math.round(niceMax * ratio)}
        </text>
      </g>
    );
  });
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="XP by week">
      <defs>
        <pattern id="bar-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--blue)" strokeWidth="2.4" opacity="0.5" />
        </pattern>
      </defs>
      {grid}
      {series.map((item, index) => {
        const value = Number(item.xp) || 0;
        const barH = Math.max(value > 0 ? 3 : 0, (value / niceMax) * plotH);
        const x = padding.left + slot * index + (slot - barW) / 2;
        const y = padding.top + plotH - barH;
        return (
          <g key={`${item.label}-${index}`} className={`chart-bar ${item.current ? 'current' : ''}`}>
            <title>{`${item.label}: ${value} XP · ${item.minutes} min`}</title>
            <rect
              x={x.toFixed(1)}
              y={y.toFixed(1)}
              width={barW.toFixed(1)}
              height={barH.toFixed(1)}
              rx="1"
              fill={item.current ? 'var(--red)' : 'url(#bar-hatch)'}
              stroke="var(--ink-2)"
              strokeWidth="1"
            />
            <text className="chart-value" x={(x + barW / 2).toFixed(1)} y={(y - 7).toFixed(1)} textAnchor="middle">
              {value > 0 ? value : ''}
            </text>
            <text className="chart-label" x={(x + barW / 2).toFixed(1)} y={height - 12} textAnchor="middle">
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({
  entries,
  size = 190,
  stroke = 20
}: {
  entries: { name: string; value: number; color: string; unit?: string }[];
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = entries.reduce((sum, entry) => sum + Number(entry.value || 0), 0);
  const lengths = entries.map((entry) => (total ? ((Number(entry.value) || 0) / total) * circumference : 0));
  const offsets = entries.map((_, index) => lengths.slice(0, index).reduce((sum, length) => sum + length, 0));
  return (
    <svg className="donut" viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Practice split">
      <circle className="donut-track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
      {entries.map((entry, index) => {
        const value = Number(entry.value) || 0;
        const length = lengths[index];
        const offset = offsets[index];
        const gap = Math.min(3, length * 0.3);
        return (
          <circle
            key={entry.name}
            className="donut-segment"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={entry.color}
            strokeWidth={stroke}
            strokeDasharray={`${Math.max(0, length - gap).toFixed(2)} ${(circumference - length + gap).toFixed(2)}`}
            strokeDashoffset={(-offset).toFixed(2)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          >
            <title>{`${entry.name}: ${value} ${entry.unit || ''}`}</title>
          </circle>
        );
      })}
      <text className="donut-total" x={size / 2} y={size / 2 - 1} textAnchor="middle">
        {total}
      </text>
      <text className="donut-unit" x={size / 2} y={size / 2 + 17} textAnchor="middle">
        {entries[0]?.unit || 'total'}
      </text>
    </svg>
  );
}

export function Heatmap({
  weeks
}: {
  weeks: { key: string; level: number; future: boolean; label: string }[][];
}) {
  return (
    <div className="heatmap-grid" role="img" aria-label="Activity heatmap for the last 16 weeks">
      {weeks.map((week, index) => (
        <div className="heatmap-week" key={index}>
          {week.map((day) => (
            <span
              key={day.key}
              className={`heat-cell level-${Math.max(0, day.level)} ${day.future ? 'future' : ''}`}
              title={day.label}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
