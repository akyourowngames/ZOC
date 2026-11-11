/* ==========================================================================
   SYSTEM CHARTS — tiny dependency-free SVG builders
   ========================================================================== */
(function () {
  'use strict';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function ring(percent, options = {}) {
    const size = options.size || 132;
    const stroke = options.stroke || 9;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    const offset = circumference * (1 - value / 100);
    return `<svg class="ring-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(options.label || `${value}%`)}">
      <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${stroke}" fill="none"></circle>
      <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${stroke}" fill="none"
        stroke="${esc(options.color || 'var(--cyan)')}" stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})"></circle>
    </svg>`;
  }

  function bars(series, options = {}) {
    const width = options.width || 680;
    const height = options.height || 230;
    const padding = { top: 22, right: 14, bottom: 34, left: 40 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;
    const values = series.map((item) => Number(item.xp) || 0);
    const max = Math.max(100, ...values);
    const niceMax = Math.ceil(max / 100) * 100;
    const slot = plotW / Math.max(1, series.length);
    const barW = Math.min(46, slot * 0.56);
    const grid = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const y = padding.top + plotH - plotH * ratio;
      return `<line class="chart-grid" x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}"></line>
        <text class="chart-axis" x="${padding.left - 8}" y="${(y + 3).toFixed(1)}" text-anchor="end">${Math.round(niceMax * ratio)}</text>`;
    }).join('');
    const barsMarkup = series.map((item, index) => {
      const value = Number(item.xp) || 0;
      const barH = Math.max(value > 0 ? 3 : 0, (value / niceMax) * plotH);
      const x = padding.left + slot * index + (slot - barW) / 2;
      const y = padding.top + plotH - barH;
      return `<g class="chart-bar ${item.current ? 'is-current' : ''}">
        <title>${esc(item.label)}: ${value} XP · ${Number(item.minutes) || 0} min</title>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="4"></rect>
        <text class="chart-value" x="${(x + barW / 2).toFixed(1)}" y="${(y - 7).toFixed(1)}" text-anchor="middle">${value > 0 ? value : ''}</text>
        <text class="chart-label" x="${(x + barW / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle">${esc(item.label)}</text>
      </g>`;
    }).join('');
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="XP by week">
      ${grid}${barsMarkup}
    </svg>`;
  }

  function donut(entries, options = {}) {
    const size = options.size || 190;
    const stroke = options.stroke || 22;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = entries.reduce((sum, entry) => sum + Number(entry.value || 0), 0);
    let offset = 0;
    const segments = entries.map((entry) => {
      const value = Number(entry.value) || 0;
      const length = total ? (value / total) * circumference : 0;
      const markup = `<circle class="donut-segment" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none"
        stroke="${esc(entry.color)}" stroke-width="${stroke}" stroke-linecap="butt"
        stroke-dasharray="${length.toFixed(2)} ${(circumference - length).toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})">
        <title>${esc(entry.name)}: ${value} ${esc(entry.unit || '')}</title>
      </circle>`;
      offset += length;
      return markup;
    }).join('');
    return `<svg class="chart-svg donut-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Practice split">
      <circle class="donut-track" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke-width="${stroke}"></circle>
      ${segments}
      <text class="donut-total" x="${size / 2}" y="${size / 2 - 2}" text-anchor="middle">${total}</text>
      <text class="donut-unit" x="${size / 2}" y="${size / 2 + 16}" text-anchor="middle">${esc(entries[0]?.unit || 'total')}</text>
    </svg>`;
  }

  function radar(stats, options = {}) {
    const size = options.size || 260;
    const center = size / 2;
    const radius = size * 0.34;
    const labels = options.labels || [];
    const keys = options.keys || [];
    const count = Math.max(3, keys.length);
    const angle = (index) => (-Math.PI / 2) + (index * 2 * Math.PI) / count;
    const point = (index, ratio) => {
      const r = radius * ratio;
      return [center + Math.cos(angle(index)) * r, center + Math.sin(angle(index)) * r];
    };
    const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
      const points = keys.map((_, index) => point(index, ratio).map((value) => value.toFixed(1)).join(',')).join(' ');
      return `<polygon class="radar-grid" points="${points}"></polygon>`;
    }).join('');
    const axes = keys.map((_, index) => {
      const [x, y] = point(index, 1);
      return `<line class="radar-axis" x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"></line>`;
    }).join('');
    const shape = keys.map((key, index) => {
      const [x, y] = point(index, Math.max(0.08, Math.min(1, (Number(stats[key]) || 0) / 100)));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const labelMarkup = keys.map((key, index) => {
      const [x, y] = point(index, 1.24);
      return `<text class="radar-label" x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle">${esc(labels[index] || key)}</text>
        <text class="radar-value" x="${x.toFixed(1)}" y="${(y + 15).toFixed(1)}" text-anchor="middle">${Number(stats[key]) || 0}</text>`;
    }).join('');
    return `<svg class="chart-svg radar-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Hunter stats">
      ${rings}${axes}
      <polygon class="radar-shape" points="${shape}"></polygon>
      ${keys.map((key, index) => {
        const [x, y] = point(index, Math.max(0.08, Math.min(1, (Number(stats[key]) || 0) / 100)));
        return `<circle class="radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6"></circle>`;
      }).join('')}
      ${labelMarkup}
    </svg>`;
  }

  function sparkline(values, options = {}) {
    const width = options.width || 240;
    const height = options.height || 54;
    const valuesArray = values.map((value) => Number(value) || 0);
    const max = Math.max(1, ...valuesArray);
    const step = valuesArray.length > 1 ? width / (valuesArray.length - 1) : width;
    const points = valuesArray.map((value, index) => `${(index * step).toFixed(1)},${(height - 5 - (value / max) * (height - 10)).toFixed(1)}`);
    return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Trend">
      <polyline points="${points.join(' ')}" fill="none" stroke="${esc(options.color || 'var(--cyan)')}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>
    </svg>`;
  }

  function statBar(value, options = {}) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    return `<div class="stat-bar ${options.className || ''}" role="img" aria-label="${safe}%">
      <span style="width:${safe}%"></span>
    </div>`;
  }

  window.SYSTEM_CHARTS = { ring, bars, donut, radar, sparkline, statBar, esc };
})();
