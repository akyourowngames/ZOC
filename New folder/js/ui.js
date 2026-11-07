/* ==========================================================================
   SYSTEM UI — views, interactions, imports, and the level-up experience
   ========================================================================== */
(function () {
  'use strict';

  const D = window.SYSTEM_DATA;
  const S = window.SYSTEM_STORE;
  const C = window.SYSTEM_CHARTS;
  const esc = C.esc;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const VIEW_TITLES = {
    status: 'Status',
    gates: 'Gates',
    dungeons: 'Dungeons',
    log: 'Training log',
    analytics: 'Analytics',
    system: 'System'
  };

  const STAT_COLORS = { str: '#fb7185', int: '#4fd1ff', agi: '#34d399', vit: '#fbbf24', per: '#a78bfa' };
  const STATUS_META = {
    todo: { label: 'Open', icon: '○' },
    attempted: { label: 'Attempted', icon: '◐' },
    solved: { label: 'Cleared', icon: '✓' }
  };

  const ui = {
    view: 'status',
    gateSearch: '',
    gateFilter: 'all',
    openChapters: {},
    gatesCollapsed: false,
    dungeonSearch: '',
    dungeonTrack: 'all',
    dungeonDifficulty: 'all',
    dungeonStatus: 'all',
    compactDungeons: false,
    logSearch: '',
    logTrack: 'all',
    logRange: 'all',
    logSort: 'newest',
    paletteItems: [],
    paletteIndex: 0,
    confirmAction: null,
    sessionEditId: null,
    problemEditId: null
  };

  /* ---------------------------------------------------------------- helpers */
  const pad = (value) => String(value).padStart(2, '0');

  function state() {
    return S.getState();
  }

  function rankInfo(letter) {
    return D.RANKS.find((rank) => rank.letter === letter) || D.RANKS[D.RANKS.length - 1];
  }

  function rankBadge(rank, extra = '') {
    return `<span class="rank-badge ${extra}" style="--rank:${rank.color};--rank-glow:${rank.glow}" title="${esc(rank.name)}">${rank.letter}</span>`;
  }

  function trackTag(key) {
    const track = D.TRACKS[key] || D.TRACKS.foundations;
    return `<span class="tag tag-${key}"><span aria-hidden="true">${track.icon}</span>${esc(track.name)}</span>`;
  }

  function difficultyTag(difficulty) {
    const info = D.DIFFICULTIES[difficulty] || D.DIFFICULTIES.Practice;
    return `<span class="tag difficulty-tag" style="--tag:${info.color}">${esc(difficulty)}</span>`;
  }

  function statusMeta(status) {
    return STATUS_META[status] || STATUS_META.todo;
  }

  function evidenceBadge(problem) {
    const evidence = S.evidenceForProblem(problem);
    if (!evidence.total) return '<span class="evidence-badge muted" title="No matching source files in the current snapshot">No files</span>';
    const parts = [];
    if (evidence.code) parts.push(`${evidence.code} code`);
    if (evidence.docs) parts.push(`${evidence.docs} notes`);
    return `<span class="evidence-badge" title="${esc(evidence.files.map((file) => file.path).join('\n'))}">${parts.join(' · ')}</span>`;
  }

  function focusDots(focus) {
    const value = Math.max(1, Math.min(5, Number(focus) || 3));
    return `<span class="focus-dots" title="Focus ${value}/5"><span>${'●'.repeat(value)}</span><span>${'○'.repeat(5 - value)}</span></span>`;
  }

  function dayBlock(value) {
    const date = S.parseDate(value);
    return `<div class="date-block"><strong>${pad(date.getDate())}</strong><span>${date.toLocaleString('en-IN', { month: 'short' }).toUpperCase()}</span></div>`;
  }

  function timeOf(value) {
    return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(S.parseDate(value));
  }

  function toLocalInput(value = new Date()) {
    const date = S.parseDate(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function panelHead(eyebrow, title, right = '') {
    return `<div class="panel-heading"><div><span class="eyebrow">${eyebrow}</span><h3>${title}</h3></div>${right}</div>`;
  }

  function emptyState(title, text, action = '') {
    return `<div class="empty-state"><span class="empty-glyph" aria-hidden="true">◇</span><strong>${esc(title)}</strong><p>${esc(text)}</p>${action}</div>`;
  }

  function sectionLink(label, view) {
    return `<button class="text-button" data-view-target="${view}">${label} <span aria-hidden="true">→</span></button>`;
  }

  function dayOfYear(date = new Date()) {
    return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  }

  /* ----------------------------------------------------------------- toasts */
  function toast(message, type = 'info', action = null) {
    const stack = $('#toastStack');
    if (!stack) return;
    const icons = { info: '◈', success: '✓', error: '!', achievement: '★', level: '↑' };
    const element = document.createElement('div');
    element.className = `toast toast-${type}`;
    element.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</span><span class="toast-message">${esc(message)}</span>`;
    if (action) {
      const actionButton = document.createElement('button');
      actionButton.type = 'button';
      actionButton.className = 'toast-action';
      actionButton.textContent = action.label;
      actionButton.addEventListener('click', () => { action.onClick(); element.remove(); });
      element.appendChild(actionButton);
    }
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'toast-close';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => element.remove());
    element.appendChild(closeButton);
    stack.appendChild(element);
    while (stack.children.length > 4) stack.firstElementChild.remove();
    window.setTimeout(() => {
      element.classList.add('leaving');
      window.setTimeout(() => element.remove(), 260);
    }, action ? 6500 : 4200);
  }

  function afterAction(message, type = 'success') {
    const outcome = S.commit();
    applyTheme();
    renderAll();
    if (message) toast(message, type);
    if (outcome.levelUp) showLevelUp(outcome.levelUp);
    (outcome.unlocked || []).forEach((achievement) => {
      toast(`Achievement unlocked — ${achievement.title} (+${achievement.xp} XP)`, 'achievement');
    });
  }

  /* -------------------------------------------------------------- level up */
  function showLevelUp(info) {
    const player = S.player();
    $('#levelUpText').textContent = `Level ${info.from} → ${info.to}. ${info.rank.title}. Your stats have been recalculated.`;
    $('#levelUpStats').innerHTML = D.STATS.map((stat) => `
      <div class="levelup-stat">
        <span>${stat.short}</span>
        <strong>${player.stats[stat.id]}</strong>
      </div>`).join('');
    const overlay = $('#levelUpOverlay');
    overlay.hidden = false;
    document.body.classList.add('modal-open');
    window.setTimeout(() => $('#levelUpClose').focus(), 60);
  }

  /* --------------------------------------------------------------- modals */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const focusable = modal.querySelector('input:not([type="hidden"]), textarea, select, button');
    if (focusable) window.setTimeout(() => focusable.focus(), 40);
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    if (!$$('.modal-backdrop:not([hidden])').length && $('#levelUpOverlay').hidden) document.body.classList.remove('modal-open');
  }

  function closeAllModals() {
    $$('.modal-backdrop').forEach((modal) => { modal.hidden = true; });
    $('#levelUpOverlay').hidden = true;
    document.body.classList.remove('modal-open');
  }

  function askConfirm({ title, message, label = 'Confirm', onAccept }) {
    $('#confirmTitle').textContent = title;
    $('#confirmMessage').textContent = message;
    $('#confirmAccept').textContent = label;
    ui.confirmAction = onAccept;
    openModal('confirmModal');
  }

  /* ---------------------------------------------------------------- theme */
  function applyTheme() {
    const settings = state().settings;
    document.documentElement.dataset.theme = settings.theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('reduce-motion', Boolean(settings.reduceMotion));
  }

  /* --------------------------------------------------------------- chrome */
  function renderChrome(player) {
    const st = state();
    const quote = D.QUOTES[dayOfYear() % D.QUOTES.length];
    $('#todayLabel').textContent = S.longDate(new Date());
    $('#pageTitle').textContent = VIEW_TITLES[ui.view] || 'Status';
    document.title = `${VIEW_TITLES[ui.view] || 'Status'} — SYSTEM`;
    $('#sidebarQuote').textContent = quote;

    $('#playerMini').innerHTML = `
      <button class="player-mini-card" data-view-target="status" aria-label="Open status window">
        ${rankBadge(player.rank, 'mini-rank')}
        <span class="mini-copy"><strong>${esc(st.profile.name)}</strong><span>LVL ${player.level} · ${player.rank.name}</span></span>
        <span class="mini-level">${Math.round(player.percent)}%</span>
        <span class="mini-xp"><span style="width:${player.percent}%;background:${player.rank.color}"></span></span>
      </button>`;

    $('#streakChip').innerHTML = `<span class="chip-icon" aria-hidden="true">🔥</span><strong>${S.currentStreak()}</strong><span>day streak</span>`;
    $('#levelChip').innerHTML = `<span class="chip-icon" aria-hidden="true">◈</span><strong>LVL ${player.level}</strong><span>${esc(player.rank.name)}</span>`;
    $('#navGatesBadge').textContent = `${st.completedTopics.length}/${D.allTopics().length}`;
    $('#navDungeonsBadge').textContent = `${S.solvedCount()}/${S.allProblems().length}`;
    $('#navLogBadge').textContent = `${st.sessions.length}`;
    $('#navStatusBadge').textContent = `${Math.round(player.percent)}%`;
    $('#footerXp').textContent = `${player.xp} XP`;
    $('#storageLabel').textContent = `Local-first · ${formatBytes(S.storageBytes())}`;

    $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === ui.view));
    $$('.view').forEach((view) => view.classList.toggle('active-view', view.id === `${ui.view}View`));
  }

  /* ---------------------------------------------------------------- status */
  function renderStatus(player) {
    const st = state();
    const snapshot = S.snapshot();
    const ascendingRanks = [...D.RANKS].sort((a, b) => a.min - b.min);
    const nextRank = ascendingRanks.find((rank) => rank.min > player.level);
    const xpToNextRank = nextRank ? Math.max(0, S.xpAtLevel(nextRank.min) - player.xp) : 0;
    const chapterDone = D.CHAPTERS.filter((chapter) => S.chapterProgress(chapter.id).percent === 1).length;

    $('#playerPanel').innerHTML = `
      <div class="status-window">
        <div class="status-window-bar">
          <span class="system-label"><span class="system-dot"></span> STATUS WINDOW</span>
          <span class="system-label">${esc(st.profile.name)} · ${player.rank.name}</span>
        </div>
        <div class="player-hero">
          <div class="player-identity">
            <div class="player-rank-line">${rankBadge(player.rank)}<span class="eyebrow">${esc(player.rank.name)} · ${esc(player.cls.name)}</span></div>
            <h2>${esc(player.title)}</h2>
            <p>${esc(player.cls.desc)}</p>
            <div class="player-chips">
              <span class="pill">POWER ${player.power.toLocaleString('en-IN')}</span>
              <span class="pill">${chapterDone}/${D.CHAPTERS.length} chapters</span>
              <span class="pill">${S.solvedCount()} clears</span>
            </div>
            <div class="player-actions">
              <button class="primary-button" data-open-session>＋ Log session</button>
              <button class="ghost-button" data-view-target="gates">Open gates</button>
            </div>
          </div>
          <div class="level-orb">
            <div class="level-ring-wrap">
              ${C.ring(player.percent, { size: 156, stroke: 8, color: player.rank.color, label: `${player.level} level` })}
              <div class="level-ring-label"><strong>${player.level}</strong><span>LEVEL</span></div>
            </div>
            <div class="level-caption">${player.xp.toLocaleString('en-IN')} XP</div>
          </div>
        </div>
        <div class="xp-block">
          <div class="xp-meta-row"><span>LEVEL ${player.level}</span><span>${Math.max(0, player.next - player.xp).toLocaleString('en-IN')} XP to level ${player.level + 1}</span></div>
          <div class="xp-track"><span style="width:${player.percent}%;background:linear-gradient(90deg,${player.rank.color},#a78bfa)"></span></div>
          <div class="xp-meta-row muted">
            <span>${nextRank ? `Next rank: ${nextRank.name} in ${xpToNextRank.toLocaleString('en-IN')} XP` : 'Maximum rank reached'}</span>
            <span>${player.into.toLocaleString('en-IN')} / ${player.needed.toLocaleString('en-IN')} this level</span>
          </div>
        </div>
        <div class="status-window-foot">
          <span>${esc(snapshot.note || 'Workspace evidence is read-only.')}</span>
          <span>Updated ${st.meta.updatedAt ? S.relativeDate(st.meta.updatedAt) : 'now'}</span>
        </div>
      </div>`;

    $('#radarPanel').innerHTML = `
      ${panelHead('Combat profile', 'Hunter stats', '<span class="completion">POWER ' + player.power.toLocaleString('en-IN') + '</span>')}
      <div class="radar-layout">
        <div class="radar-chart">${C.radar(player.stats, { labels: D.STATS.map((stat) => stat.short), keys: D.STATS.map((stat) => stat.id), size: 270 })}</div>
        <div class="radar-legend">
          ${D.STATS.map((stat) => `
            <div class="radar-row">
              <span class="radar-code" style="color:${STAT_COLORS[stat.id]}">${stat.short}</span>
              <div class="radar-main"><strong>${esc(stat.name)}</strong><span>${esc(stat.desc)}</span></div>
              <b>${player.stats[stat.id]}</b>
            </div>`).join('')}
        </div>
      </div>`;

    $('#statGrid').innerHTML = D.STATS.map((stat) => {
      const value = player.stats[stat.id];
      return `<article class="stat-card" style="--stat:${STAT_COLORS[stat.id]}">
        <div class="stat-card-top"><span class="stat-code">${stat.short}</span><strong>${value}</strong></div>
        <span class="stat-name">${esc(stat.name)}</span>
        <p>${esc(stat.desc)}</p>
        ${C.statBar(value)}
      </article>`;
    }).join('');

    const weeklyReset = state().settings.weekStart === 0 ? 'Resets Sunday' : 'Resets Monday';
    $('#dailyQuestPanel').innerHTML = renderQuestPanel('daily', 'Daily quests', 'Resets at midnight', D.DAILY_QUESTS, S.todayMetrics());
    $('#weeklyQuestPanel').innerHTML = renderQuestPanel('weekly', 'Weekly quests', weeklyReset, D.WEEKLY_QUESTS, S.weekMetrics());

    $('#nextGatesPanel').innerHTML = `
      ${panelHead('Keep moving', 'Next gates', sectionLink('View all', 'gates'))}
      <div class="topic-list">${renderNextGateRows()}</div>`;

    $('#readinessPanel').innerHTML = renderReadiness();

    $('#heatmapPanel').innerHTML = renderHeatmap();

    $('#recentPanel').innerHTML = `
      ${panelHead('Consistency compounds', 'Recent training', sectionLink('Open log', 'log'))}
      <div class="session-list">${renderRecentSessions()}</div>`;

    $('#achievementPanel').innerHTML = renderAchievements();

    $('#evidencePanel').innerHTML = renderEvidencePanel();
  }

  function renderQuestPanel(scope, title, subtitle, quests, metrics) {
    const resolved = quests.map((quest) => ({ ...quest, progress: S.questProgress(scope, quest) }));
    const claimed = resolved.filter((quest) => quest.progress.claimed).length;
    return `${panelHead(scope === 'daily' ? 'System quests' : 'Weekly directive', title, `<span class="completion">${claimed}/${quests.length} claimed</span>`)}
      <p class="panel-subtitle">${esc(subtitle)} · ${scope === 'daily' ? 'complete them before midnight' : 'complete them before the week ends'}.</p>
      <div class="quest-list">${resolved.map((quest) => {
        const progress = quest.progress;
        const buttonLabel = progress.claimed ? 'Claimed' : progress.complete ? 'Claim' : 'In progress';
        const shownValue = Math.min(progress.value, quest.target);
        return `<div class="quest ${progress.complete ? 'complete' : ''} ${progress.claimed ? 'claimed' : ''}">
          <span class="quest-icon" aria-hidden="true">${quest.icon}</span>
          <div class="quest-main">
            <strong>${esc(quest.label)}</strong>
            <span>${esc(quest.desc)}</span>
            <div class="quest-track"><span style="width:${progress.percent}%"></span></div>
            <small>${shownValue} / ${quest.target} · +${quest.xp} XP</small>
          </div>
          <button class="quest-claim" data-claim-scope="${scope}" data-claim-id="${quest.id}" ${progress.complete && !progress.claimed ? '' : 'disabled'}>${buttonLabel}</button>
        </div>`;
      }).join('')}</div>`;
  }

  function renderNextGateRows() {
    const topics = S.nextTopics(4);
    if (!topics.length) return emptyState('Roadmap cleared', 'Every gate is complete. Move into timed contest sets.', '<button class="primary-button" data-view-target="dungeons">Open dungeons</button>');
    const evidence = S.evidenceTopicIds();
    return topics.map((topic, index) => `
      <div class="topic-row">
        ${rankBadge(rankInfo(topic.chapterRank), 'tiny-rank')}
        <div class="topic-main">
          <strong>${esc(topic.name)}</strong>
          <span>${esc(topic.chapterTitle)} · ${esc(topic.desc)}</span>
        </div>
        ${evidence.has(topic.id) ? '<span class="evidence-badge">Evidence</span>' : ''}
        <span class="topic-xp">+${topic.xp} XP</span>
        <button class="gate-clear" data-topic-id="${topic.id}" title="Mark gate complete">Clear</button>
      </div>`).join('');
  }

  function renderReadiness() {
    const foundation = (S.chapterProgress('awakening').percent + S.chapterProgress('problem-solving').percent) / 2;
    const zcoSolved = S.allProblems().filter((problem) => problem.track === 'zco' && S.problemRecord(problem.id).status === 'solved').length;
    const ioiSolved = S.allProblems().filter((problem) => problem.track === 'ioi' && S.problemRecord(problem.id).status === 'solved').length;
    const zco = S.chapterProgress('zco').percent * 0.45 + Math.min(1, S.timedMinutes() / 300) * 0.3 + Math.min(1, zcoSolved / 2) * 0.25;
    const ioi = S.chapterProgress('ioi').percent * 0.4 + ((S.chapterProgress('graphs').percent + S.chapterProgress('dp').percent) / 2) * 0.35 + Math.min(1, ioiSolved / 2) * 0.25;
    const overall = (foundation + zco + ioi) / 3;
    const label = overall < 0.25 ? 'E-Rank preparation' : overall < 0.5 ? 'D-Rank momentum' : overall < 0.75 ? 'C/B-Rank readiness' : 'A/S-Rank territory';
    const text = overall < 0.25
      ? 'Build the base first: syntax, conditions, loops, and one problem per session.'
      : overall < 0.5
        ? 'You have a base. Start mixing timed sets with new concepts.'
        : overall < 0.75
          ? 'Add contest pressure. Accuracy first, then speed.'
          : 'Contest mode. Protect sleep, review mistakes, and simulate full papers.';
    const targets = [
      { label: 'Foundations', value: foundation, note: 'Awakening + toolkit' },
      { label: 'ZCO', value: zco, note: 'Contest patterns + timed minutes' },
      { label: 'IOI', value: ioi, note: 'Graphs + DP + subtasks' }
    ];
    return `${panelHead('Your targets', 'Competition readiness', `<span class="completion">${Math.round(overall * 100)}% overall</span>`)}
      <div class="readiness-overall">
        <div class="readiness-copy"><strong>${label}</strong><p>${esc(text)}</p></div>
        <div class="readiness-ring">${C.ring(overall * 100, { size: 82, stroke: 6, color: 'var(--cyan)', label: `${Math.round(overall * 100)}% readiness` })}</div>
      </div>
      <div class="readiness-list">
        ${targets.map((target) => `<div class="readiness-row"><div class="readiness-row-head"><strong>${target.label}</strong><span>${Math.round(target.value * 100)}%</span></div><div class="progress-track"><span style="width:${Math.round(target.value * 100)}%"></span></div><small>${esc(target.note)}</small></div>`).join('')}
      </div>`;
  }

  function renderHeatmap() {
    const weeks = S.heatmapData(16);
    const activeDays = S.activeDaySet().size;
    const weekMinutes = S.weekMetrics().weekMinutes;
    const goal = state().profile.goalMinutesPerWeek || 300;
    const goalPercent = Math.min(100, Math.round((weekMinutes / goal) * 100));
    return `${panelHead('Last 16 weeks', 'Activity heatmap', `<span class="completion">${activeDays} active days · longest ${S.longestStreak()} days</span>`)}
      <div class="heatmap-wrap">
        <div class="heatmap-grid" role="img" aria-label="Activity heatmap for the last 16 weeks">
          ${weeks.map((week) => `<div class="heatmap-week">${week.map((day) => `<span class="heat-cell level-${day.level} ${day.future ? 'future' : ''}" title="${esc(day.label)}"></span>`).join('')}</div>`).join('')}
        </div>
      </div>
      <div class="heatmap-foot">
        <div class="heat-legend"><span>Less</span><i class="heat-cell level-0"></i><i class="heat-cell level-1"></i><i class="heat-cell level-2"></i><i class="heat-cell level-3"></i><i class="heat-cell level-4"></i><span>More</span></div>
        <div class="week-goal"><span>This week</span><strong>${weekMinutes} / ${goal} min</strong><div class="progress-track"><span style="width:${goalPercent}%"></span></div></div>
      </div>`;
  }

  function renderRecentSessions() {
    const sessions = S.manualSessions().slice(0, 5);
    if (!sessions.length) return emptyState('No sessions yet', 'Log your first focus block and the System will start tracking XP.', '<button class="primary-button" data-open-session>Log a session</button>');
    return sessions.map((session) => `
      <div class="session-item">
        ${dayBlock(session.date)}
        <div class="session-main">
          <strong>${esc(session.topic)}</strong>
          <span>${trackTag(session.track)} <span class="muted">${timeOf(session.date)} · ${session.minutes} min</span></span>
        </div>
        <span class="session-xp">+${S.sessionXp(session)} XP</span>
      </div>`).join('');
  }

  function achievementProgress(achievement) {
    const value = S.achievementValue(achievement.type, achievement.target);
    const target = typeof achievement.target === 'number' ? achievement.target : 1;
    return Math.min(100, Math.round((value / target) * 100));
  }

  function renderAchievements() {
    const st = state();
    const items = D.ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: Boolean(st.achievements[achievement.id]),
      progress: achievementProgress(achievement)
    })).sort((a, b) => (b.unlocked - a.unlocked) || (b.progress - a.progress));
    const unlocked = items.filter((item) => item.unlocked).length;
    return `${panelHead('Trophy case', 'Achievements', `<span class="completion">${unlocked}/${D.ACHIEVEMENTS.length} unlocked</span>`)}
      <div class="achievement-grid dashboard-achievements">
        ${items.slice(0, 8).map((achievement) => `
          <div class="achievement ${achievement.unlocked ? 'unlocked' : ''}">
            <span class="achievement-icon" aria-hidden="true">${achievement.unlocked ? achievement.icon : '☆'}</span>
            <div class="achievement-copy"><strong>${esc(achievement.title)}</strong><small>${achievement.unlocked ? 'Unlocked' : esc(achievement.desc)}</small>
              ${achievement.unlocked ? '' : `<div class="achievement-track"><span style="width:${achievement.progress}%"></span></div>`}
            </div>
            <b class="achievement-xp">+${achievement.xp}</b>
          </div>`).join('')}
      </div>`;
  }

  function renderEvidencePanel() {
    const snapshot = S.snapshot();
    const totals = snapshot.totals || { files: 0, code: 0, docs: 0, problems: 0, days: 0 };
    const recentDays = (snapshot.days || []).slice(-3).reverse();
    return `${panelHead('Repository evidence', 'Workspace activity', '<span class="completion">Read-only snapshot</span>')}
      <div class="activity-summary">
        <div><strong>${totals.days}</strong><span>active days</span></div>
        <div><strong>${totals.code}</strong><span>code files</span></div>
        <div><strong>${totals.docs}</strong><span>docs & notes</span></div>
        <div><strong>${totals.problems}</strong><span>problem folders</span></div>
      </div>
      <div class="activity-list">
        ${recentDays.length ? recentDays.map((day) => `<div class="activity-row"><span class="activity-date">${S.humanDate(day.date)}</span><div class="activity-main"><strong>${esc(day.label)}</strong><span>${day.code} code · ${day.docs} docs · ${day.files} files</span></div><b>+${day.code * 20 + day.docs * 5} XP</b></div>`).join('') : '<p class="muted">No evidence snapshot loaded.</p>'}
      </div>
      <div class="panel-foot-actions">
        <button class="ghost-button" data-apply-evidence="topics">Apply evidenced gates</button>
        <button class="ghost-button" data-apply-evidence="problems">Clear evidenced dungeons</button>
        <button class="text-button" data-view-target="system">Manage evidence <span aria-hidden="true">→</span></button>
      </div>`;
  }

  /* ----------------------------------------------------------------- gates */
  function renderGates() {
    const query = ui.gateSearch.trim().toLowerCase();
    const evidence = S.evidenceTopicIds();
    let totalVisible = 0;
    let doneVisible = 0;
    const chapters = D.CHAPTERS.map((chapter, chapterIndex) => {
      const chapterMatches = !query || `${chapter.title} ${chapter.subtitle} ${chapter.description}`.toLowerCase().includes(query);
      let topics = chapter.topics.filter((topic) => {
        const matches = !query || chapterMatches || `${topic.name} ${topic.desc}`.toLowerCase().includes(query);
        if (!matches) return false;
        const done = state().completedTopics.includes(topic.id);
        if (ui.gateFilter === 'open') return !done;
        if (ui.gateFilter === 'done') return done;
        return true;
      });
      const done = chapter.topics.filter((topic) => state().completedTopics.includes(topic.id)).length;
      totalVisible += topics.length;
      doneVisible += topics.filter((topic) => state().completedTopics.includes(topic.id)).length;
      if (!topics.length && (query || ui.gateFilter !== 'all')) return '';
      const percent = chapter.topics.length ? Math.round((done / chapter.topics.length) * 100) : 0;
      const open = query ? true : ui.openChapters[chapter.id] !== false;
      return `<section class="chapter-card ${percent === 100 ? 'complete' : ''}" style="--chapter:${chapter.color}">
        <button class="chapter-head" data-chapter-toggle="${chapter.id}" aria-expanded="${open}">
          <span class="chapter-index">${pad(chapterIndex + 1)}</span>
          ${rankBadge(rankInfo(chapter.rank), 'chapter-rank')}
          <span class="chapter-title"><span class="eyebrow">Chapter ${chapterIndex + 1} · ${chapter.rank}-Rank</span><strong>${esc(chapter.title)}</strong><span>${esc(chapter.subtitle)}</span></span>
          <span class="chapter-progress"><span class="chapter-percent">${percent}%</span><span class="completion">${done}/${chapter.topics.length} gates</span><span class="chapter-bar"><span style="width:${percent}%"></span></span></span>
          <span class="chapter-chevron" aria-hidden="true">${open ? '−' : '+'}</span>
        </button>
        <div class="chapter-body ${open ? '' : 'hidden'}">
          <p class="chapter-desc">${esc(chapter.description)}</p>
          <div class="gate-list">
            ${topics.map((topic) => {
              const complete = state().completedTopics.includes(topic.id);
              return `<div class="gate-row ${complete ? 'done' : ''}">
                <button class="gate-check" data-topic-id="${topic.id}" aria-pressed="${complete}" aria-label="${complete ? 'Reopen' : 'Complete'} ${esc(topic.name)}">${complete ? '✓' : ''}</button>
                <div class="gate-main"><strong>${esc(topic.name)}</strong><span>${esc(topic.desc)}</span></div>
                ${evidence.has(topic.id) ? '<span class="evidence-badge" title="A matching source file exists in the snapshot">Evidence</span>' : ''}
                <span class="gate-xp">+${topic.xp} XP</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </section>`;
    }).filter(Boolean).join('');

    $('#gatesDone').textContent = state().completedTopics.length;
    $('#gatesPercent').textContent = `${Math.round((state().completedTopics.length / D.allTopics().length) * 100)}%`;
    $('#gatesList').innerHTML = chapters || emptyState('No gates match', 'Try a different search or filter.', '<button class="ghost-button" data-clear-gate-filters>Clear filters</button>');
    const allCollapsed = D.CHAPTERS.every((chapter) => ui.openChapters[chapter.id] === false);
    $('#collapseGates').textContent = allCollapsed ? 'Expand all' : 'Collapse all';
    ui.gatesCollapsed = allCollapsed;
  }

  /* -------------------------------------------------------------- dungeons */
  function renderDungeons() {
    const problems = S.allProblems();
    const solved = problems.filter((problem) => S.problemRecord(problem.id).status === 'solved').length;
    const attempted = problems.filter((problem) => S.problemRecord(problem.id).status === 'attempted').length;
    const review = problems.filter((problem) => S.problemRecord(problem.id).review).length;
    const evidenced = problems.filter((problem) => S.evidenceForProblem(problem).implemented).length;
    const open = problems.length - solved - attempted;
    $('#dungeonSummary').innerHTML = [
      ['Total', problems.length],
      ['Cleared', solved],
      ['Attempted', attempted],
      ['Open', open],
      ['With code evidence', evidenced],
      ['Needs review', review]
    ].map(([label, value]) => `<div class="summary-item"><strong>${value}</strong><span>${label}</span></div>`).join('');

    const query = ui.dungeonSearch.trim().toLowerCase();
    const filtered = problems.filter((problem) => {
      const record = S.problemRecord(problem.id);
      if (ui.dungeonTrack !== 'all' && problem.track !== ui.dungeonTrack) return false;
      if (ui.dungeonDifficulty !== 'all' && problem.difficulty !== ui.dungeonDifficulty) return false;
      if (ui.dungeonStatus === 'review' && !record.review) return false;
      if (['todo', 'attempted', 'solved'].includes(ui.dungeonStatus) && record.status !== ui.dungeonStatus) return false;
      if (!query) return true;
      return `${problem.title} ${problem.desc} ${problem.track} ${problem.difficulty} ${(problem.tags || []).join(' ')}`.toLowerCase().includes(query);
    }).sort((a, b) => a.number - b.number);

    $('#dungeonList').innerHTML = filtered.length ? filtered.map((problem) => {
      const record = S.problemRecord(problem.id);
      const meta = statusMeta(record.status);
      const xp = D.difficultyXp(problem.difficulty);
      return `<article class="dungeon-card ${ui.compactDungeons ? 'compact' : ''} status-${record.status}">
        <button class="status-toggle status-${record.status}" data-problem-action="cycle" data-problem-id="${problem.id}" title="Cycle status: open → attempted → cleared">
          <span class="status-icon" aria-hidden="true">${meta.icon}</span><span>${meta.label}</span>
        </button>
        <div class="dungeon-body">
          <div class="dungeon-head">
            <span class="dungeon-number">#${pad(problem.number)}</span>
            <h3>${esc(problem.title)}</h3>
            ${trackTag(problem.track)}
            ${difficultyTag(problem.difficulty)}
            ${record.review ? '<span class="review-flag">Review</span>' : ''}
          </div>
          <p class="dungeon-desc">${esc(problem.desc)}</p>
          <div class="dungeon-tags">
            ${(problem.tags || []).map((tag) => `<span class="tag ghost-tag">${esc(tag)}</span>`).join('')}
            ${evidenceBadge(problem)}
            ${record.solvedAt ? `<span class="solved-date">Cleared ${S.relativeDate(record.solvedAt)}</span>` : ''}
          </div>
        </div>
        <div class="dungeon-side">
          <strong class="dungeon-xp">+${xp} XP</strong>
          <span class="dungeon-side-label">${record.status === 'solved' ? 'Mastery earned' : record.status === 'attempted' ? 'In progress' : 'Available'}</span>
          <div class="dungeon-actions">
            <button class="mini-button ${record.review ? 'active' : ''}" data-problem-action="review" data-problem-id="${problem.id}" title="Toggle review flag">${record.review ? 'Reviewing' : 'Review'}</button>
            <button class="mini-button" data-open-session data-problem-id="${problem.id}" data-topic="${esc(problem.title)}">Log</button>
            ${problem.custom ? `<button class="mini-button" data-problem-action="edit" data-problem-id="${problem.id}">Edit</button><button class="mini-button danger" data-problem-action="delete" data-problem-id="${problem.id}">Delete</button>` : ''}
          </div>
        </div>
      </article>`;
    }).join('') : emptyState('No dungeons match', 'Clear the filters or add a custom dungeon for a contest problem.', '<button class="ghost-button" data-clear-dungeon-filters>Clear filters</button>');
  }

  /* ------------------------------------------------------------------- log */
  function renderLog() {
    const sessions = S.manualSessions();
    const minutes = S.totalMinutes();
    const week = S.weekMetrics();
    const goal = state().profile.goalMinutesPerWeek || 300;
    const avg = sessions.length ? Math.round(minutes / sessions.length) : 0;
    const xp = sessions.reduce((sum, session) => sum + S.sessionXp(session), 0);
    $('#logSummary').innerHTML = [
      ['Sessions', sessions.length],
      ['Total minutes', minutes],
      ['Average', `${avg} min`],
      ['This week', `${week.weekMinutes}/${goal} min`],
      ['Session XP', xp]
    ].map(([label, value]) => `<div class="summary-item"><strong>${value}</strong><span>${label}</span></div>`).join('');

    const query = ui.logSearch.trim().toLowerCase();
    let filtered = sessions.filter((session) => {
      if (ui.logTrack !== 'all' && session.track !== ui.logTrack) return false;
      if (ui.logRange !== 'all') {
        const cutoff = S.addDays(new Date(), -Number(ui.logRange));
        if (S.parseDate(session.date) < cutoff) return false;
      }
      if (!query) return true;
      return `${session.topic} ${session.note} ${session.track} ${(session.tags || []).join(' ')}`.toLowerCase().includes(query);
    });
    if (ui.logSort === 'oldest') filtered = filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (ui.logSort === 'longest') filtered = filtered.slice().sort((a, b) => b.minutes - a.minutes);
    else filtered = filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    $('#sessionList').innerHTML = filtered.length ? filtered.map((session) => {
      const linkedProblem = session.problemId ? S.problemById(session.problemId) : null;
      return `
      <div class="session-row">
        ${dayBlock(session.date)}
        <div class="session-main">
          <div class="session-title"><strong>${esc(session.topic)}</strong>${trackTag(session.track)}</div>
          <div class="session-sub"><span>${timeOf(session.date)}</span><span>${session.minutes} min</span>${focusDots(session.focus)}</div>
          ${(session.tags || []).length || linkedProblem ? `<div class="session-tags">${linkedProblem ? `<span class="tag linked-tag" title="Linked dungeon">⚔ ${esc(linkedProblem.title)}</span>` : ''}${(session.tags || []).map((tag) => `<span class="tag ghost-tag">${esc(tag)}</span>`).join('')}</div>` : ''}
          ${session.note ? `<p class="session-note">${esc(session.note)}</p>` : ''}
        </div>
        <div class="session-side"><strong>+${S.sessionXp(session)} XP</strong><span>${session.minutes}m</span></div>
        <div class="session-actions">
          <button class="mini-button" data-session-action="edit" data-session-id="${session.id}">Edit</button>
          <button class="mini-button danger" data-session-action="delete" data-session-id="${session.id}">Delete</button>
        </div>
      </div>`}).join('') : emptyState('No sessions match', 'Adjust the filters or log a new focused block.', '<button class="primary-button" data-open-session>Log a session</button>');
  }

  /* ------------------------------------------------------------- analytics */
  function renderAnalytics(player) {
    const breakdown = S.xpBreakdown();
    const insights = S.insights();
    const weekly = S.weeklyXpSeries(8);
    const split = S.trackSplit();
    const difficulty = S.difficultyBreakdown();
    const maxSource = Math.max(1, ...breakdown.items.map((item) => item.xp));

    $('#analyticsXp').textContent = player.xp.toLocaleString('en-IN');
    $('#analyticsRate').textContent = insights.dailyRate;

    $('#xpChartPanel').innerHTML = `${panelHead('Last 8 weeks', 'XP momentum', `<span class="completion">${weekly.reduce((sum, week) => sum + week.xp, 0)} XP in window</span>`)}
      <div class="chart-wrap">${C.bars(weekly, { width: 760, height: 250 })}</div>
      <p class="panel-note">XP from sessions, workspace evidence, gates, dungeons, and dated achievements. Quest rewards are in the ledger.</p>`;

    $('#xpSourcePanel').innerHTML = `${panelHead('Transparent math', 'XP sources', `<span class="completion">${breakdown.total.toLocaleString('en-IN')} total</span>`)}
      <div class="xp-source-list">${breakdown.items.map((item) => `
        <div class="xp-source-row">
          <div class="xp-source-main"><strong>${esc(item.label)}</strong><span>${esc(item.detail)}</span></div>
          <div class="xp-source-bar"><span style="width:${Math.round((item.xp / maxSource) * 100)}%"></span></div>
          <b>${item.xp}</b>
        </div>`).join('')}</div>`;

    $('#trackSplitPanel').innerHTML = `${panelHead('Where time goes', 'Track split', `<span class="completion">${split.length ? split[0].name : 'No data'}</span>`)}
      <div class="split-layout">
        <div class="donut-wrap">${C.donut(split.length ? split : [{ name: 'No practice yet', value: 0, color: 'var(--line)', unit: 'min' }], { size: 190 })}</div>
        <div class="split-legend">${split.length ? split.map((entry) => `<div class="split-row"><span class="split-dot" style="background:${entry.color}"></span><div><strong>${esc(entry.name)}</strong><span>${entry.value} ${entry.unit}</span></div></div>`).join('') : '<p class="muted">Log a session to see your track split.</p>'}</div>
      </div>`;

    $('#difficultyPanel').innerHTML = `${panelHead('Coverage', 'Difficulty breakdown', `<span class="completion">${S.solvedCount()} cleared</span>`)}
      <div class="difficulty-list">${difficulty.map((entry) => `<div class="difficulty-row"><div class="difficulty-head"><strong>${esc(entry.difficulty)}</strong><span>${entry.solved}/${entry.total}</span></div><div class="progress-track"><span style="width:${Math.round(entry.percent * 100)}%;background:${entry.color}"></span></div><small>+${entry.xp} XP per clear</small></div>`).join('')}</div>`;

    $('#insightsPanel').innerHTML = `${panelHead('Next best move', 'Insights', `<span class="completion">${insights.reviewQueue.length} in review</span>`)}
      <div class="insight-list">
        <div class="insight"><span class="insight-icon">⏱</span><div><strong>Average session</strong><p>${insights.avgSession} minutes across ${S.manualSessions().length} sessions.</p></div></div>
        <div class="insight"><span class="insight-icon">◈</span><div><strong>Best day</strong><p>${insights.bestDay ? `${S.humanDate(insights.bestDay.key)} with ${insights.bestDay.minutes} focused minutes.` : 'No sessions logged yet.'}</p></div></div>
        <div class="insight"><span class="insight-icon">⛩</span><div><strong>Weakest chapter</strong><p>${insights.weakestChapter ? `${esc(insights.weakestChapter.title)} at ${Math.round(insights.weakestChapter.percent * 100)}% completion.` : 'Every chapter is complete.'}</p></div></div>
        <div class="insight"><span class="insight-icon">↗</span><div><strong>Next level</strong><p>${insights.daysToNext ? `At ${insights.dailyRate} XP/day, level ${insights.level + 1} is about ${insights.daysToNext} days away.` : 'Log sessions to build a pace forecast.'}</p></div></div>
        <div class="insight"><span class="insight-icon">↻</span><div><strong>Review queue</strong><p>${insights.reviewQueue.length ? insights.reviewQueue.map((problem) => esc(problem.title)).join(', ') : 'No dungeons flagged for review.'}</p></div></div>
      </div>`;

    $('#ledgerPanel').innerHTML = `${panelHead('Audit trail', 'XP ledger', `<span class="completion">${breakdown.items.length} sources · ${S.questsClaimedCount()} quests claimed</span>`)}
      <div class="ledger-layout">
        <div class="ledger-table">
          ${breakdown.items.map((item) => `<div class="ledger-row"><span>${esc(item.label)}</span><small>${esc(item.detail)}</small><b>+${item.xp}</b></div>`).join('')}
          <div class="ledger-row total"><span>Total XP</span><small>Current build</small><b>${breakdown.total}</b></div>
        </div>
        <div class="event-list">
          <h4>Recent XP events</h4>
          ${renderXpEvents()}
        </div>
      </div>`;
  }

  function renderXpEvents() {
    const events = [];
    S.manualSessions().forEach((session) => events.push({ date: session.date, label: session.topic, type: 'Session', xp: S.sessionXp(session) }));
    Object.entries(state().topicCompletedAt || {}).forEach(([id, date]) => {
      const topic = D.topicIndex.get(id);
      if (topic && date) events.push({ date, label: topic.name, type: 'Gate', xp: topic.xp });
    });
    S.allProblems().forEach((problem) => {
      const record = S.problemRecord(problem.id);
      if (record.status === 'solved' && record.solvedAt) events.push({ date: record.solvedAt, label: problem.title, type: 'Dungeon', xp: D.difficultyXp(problem.difficulty) });
    });
    Object.entries(state().achievements || {}).forEach(([id, date]) => {
      const achievement = D.ACHIEVEMENTS.find((item) => item.id === id);
      if (achievement) events.push({ date, label: achievement.title, type: 'Achievement', xp: achievement.xp });
    });
    Object.entries(state().quests || {}).forEach(([key, bucket]) => {
      const date = key.startsWith('week-') ? key.slice(5) : key;
      ['daily', 'weekly'].forEach((scope) => {
        (bucket?.[scope] || []).forEach((id) => {
          const quest = [...D.DAILY_QUESTS, ...D.WEEKLY_QUESTS].find((item) => item.id === id);
          if (quest) events.push({ date: `${date}T12:00:00`, label: quest.label, type: scope === 'daily' ? 'Daily quest' : 'Weekly quest', xp: quest.xp });
        });
      });
    });
    (S.snapshot().days || []).forEach((day) => {
      const xp = day.code * 20 + day.docs * 5;
      if (xp) events.push({ date: day.date, label: day.label, type: 'Evidence', xp });
    });
    const recent = events.filter((event) => event.date).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    if (!recent.length) return '<p class="muted">No XP events yet.</p>';
    return recent.map((event) => `<div class="event-row"><span class="event-date">${S.humanDate(event.date)}</span><div><strong>${esc(event.label)}</strong><span>${event.type}</span></div><b>+${event.xp}</b></div>`).join('');
  }

  /* ---------------------------------------------------------------- system */
  function renderSystem() {
    const st = state();
    const snapshot = S.snapshot();
    const totals = snapshot.totals || { files: 0, code: 0, docs: 0, problems: 0, days: 0 };
    const form = $('#profileForm');
    form.elements.name.value = st.profile.name;
    form.elements.goalMinutesPerWeek.value = st.profile.goalMinutesPerWeek;
    form.elements.dailyXpGoal.value = st.profile.dailyXpGoal;
    form.elements.weekStart.value = String(st.settings.weekStart);
    form.elements.theme.value = st.settings.theme;
    form.elements.reduceMotion.checked = Boolean(st.settings.reduceMotion);

    $('#storageSize').textContent = formatBytes(S.storageBytes());
    $('#evidenceFiles').textContent = totals.files;
    $('#snapshotSource').textContent = snapshot.source || 'snapshot';
    $('#snapshotStats').innerHTML = [
      ['Files', totals.files],
      ['Code', totals.code],
      ['Docs', totals.docs],
      ['Problems', totals.problems],
      ['Days', totals.days]
    ].map(([label, value]) => `<div class="snapshot-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    $('#snapshotNote').textContent = snapshot.note || 'No workspace snapshot loaded.';
    $('#integrityGrid').innerHTML = [
      ['Schema', `v${st.version}`],
      ['Sessions', st.sessions.length],
      ['Gates cleared', `${st.completedTopics.length}/${D.allTopics().length}`],
      ['Dungeons cleared', `${S.solvedCount()}/${S.allProblems().length}`],
      ['Achievements', `${Object.keys(st.achievements).length}/${D.ACHIEVEMENTS.length}`],
      ['Quests claimed', S.questsClaimedCount()],
      ['Evidence files', totals.files],
      ['Snapshot generated', snapshot.generatedAt ? S.relativeDate(snapshot.generatedAt) : 'Unknown'],
      ['Last save', st.meta.updatedAt ? S.relativeDate(st.meta.updatedAt) : 'Not yet'],
      ['Legacy migration', st.meta.migratedFrom ? `Imported from ${st.meta.migratedFrom}` : 'Not needed'],
      ['Storage used', formatBytes(S.storageBytes())],
      ['Backup size', formatBytes(JSON.stringify(S.exportBackup()).length)]
    ].map(([label, value]) => `<div class="integrity-item"><span>${label}</span><strong>${value}</strong></div>`).join('');
  }

  /* --------------------------------------------------------------- session */
  function populateProblemOptions(selected = '') {
    const select = $('#sessionForm').elements.problemId;
    select.innerHTML = `<option value="">None</option>${S.allProblems().map((problem) => `<option value="${problem.id}">${esc(problem.title)}</option>`).join('')}`;
    select.value = selected || '';
  }

  function openSessionModal(prefill = {}) {
    const form = $('#sessionForm');
    form.reset();
    form.elements.id.value = '';
    form.elements.minutes.value = 45;
    form.elements.focus.value = '3';
    form.elements.date.value = toLocalInput(new Date());
    populateProblemOptions(prefill.problemId || '');
    if (prefill.topic) form.elements.topic.value = prefill.topic;
    if (prefill.track) form.elements.track.value = prefill.track;
    if (prefill.problemId) {
      const problem = S.problemById(prefill.problemId);
      if (problem) {
        form.elements.track.value = problem.track;
        if (!prefill.topic) form.elements.topic.value = problem.title;
      }
    }
    ui.sessionEditId = null;
    $('#sessionModalEyebrow').textContent = 'Add to your log';
    $('#sessionModalTitle').textContent = 'Log a training session';
    $('#sessionSubmitButton').textContent = 'Save session';
    openModal('sessionModal');
  }

  function editSession(id) {
    const session = state().sessions.find((item) => item.id === id);
    if (!session) return;
    const form = $('#sessionForm');
    form.reset();
    form.elements.id.value = session.id;
    form.elements.topic.value = session.topic;
    form.elements.track.value = session.track;
    form.elements.minutes.value = session.minutes;
    form.elements.date.value = toLocalInput(session.date);
    form.elements.focus.value = String(session.focus || 3);
    form.elements.tags.value = (session.tags || []).join(', ');
    form.elements.note.value = session.note || '';
    populateProblemOptions(session.problemId || '');
    ui.sessionEditId = session.id;
    $('#sessionModalEyebrow').textContent = 'Edit training log';
    $('#sessionModalTitle').textContent = 'Update session';
    $('#sessionSubmitButton').textContent = 'Update session';
    openModal('sessionModal');
  }

  function submitSession(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const topic = String(data.get('topic') || '').trim();
    const minutes = Number(data.get('minutes'));
    if (!topic) { toast('Give the session a topic.', 'error'); form.elements.topic.focus(); return; }
    if (!Number.isFinite(minutes) || minutes < 1) { toast('Minutes must be at least 1.', 'error'); form.elements.minutes.focus(); return; }
    const id = String(data.get('id') || '');
    const payload = {
      topic,
      track: data.get('track'),
      minutes,
      date: new Date(String(data.get('date'))).toISOString(),
      focus: Number(data.get('focus')),
      tags: data.get('tags'),
      note: data.get('note'),
      problemId: data.get('problemId') || null
    };
    if (id) {
      S.updateSession(id, payload);
      afterAction('Session updated.');
    } else {
      S.addSession(payload);
      afterAction(`Session logged · +${S.sessionXp(payload)} XP`);
    }
    closeModal('sessionModal');
    form.reset();
    ui.sessionEditId = null;
  }

  /* --------------------------------------------------------------- problem */
  function openProblemModal(problem = null) {
    const form = $('#problemForm');
    form.reset();
    form.elements.id.value = problem?.id || '';
    form.elements.title.value = problem?.title || '';
    form.elements.track.value = problem?.track || 'problem-solving';
    form.elements.difficulty.value = problem?.difficulty || 'Practice';
    form.elements.tags.value = (problem?.tags || []).join(', ');
    form.elements.desc.value = problem?.desc || '';
    ui.problemEditId = problem?.id || null;
    $('.modal .eyebrow', $('#problemModal')).textContent = problem ? 'Edit dungeon' : 'Custom dungeon';
    $('#problemModal h2').textContent = problem ? 'Edit dungeon' : 'Add a dungeon';
    openModal('problemModal');
  }

  function submitProblem(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    if (!title) { toast('Give the dungeon a title.', 'error'); form.elements.title.focus(); return; }
    const payload = {
      title,
      track: data.get('track'),
      difficulty: data.get('difficulty'),
      tags: data.get('tags'),
      desc: data.get('desc')
    };
    const id = String(data.get('id') || '');
    if (id) {
      S.updateProblem(id, payload);
      afterAction('Dungeon updated.');
    } else {
      S.addProblem(payload);
      afterAction('Custom dungeon added.');
    }
    closeModal('problemModal');
    form.reset();
    ui.problemEditId = null;
  }

  /* ---------------------------------------------------------------- palette */
  function paletteActions() {
    return [
      { icon: '◈', title: 'Go to Status', hint: 'Hunter dashboard', run: () => showView('status') },
      { icon: '⛩', title: 'Go to Gates', hint: 'Roadmap and chapters', run: () => showView('gates') },
      { icon: '⚔', title: 'Go to Dungeons', hint: 'Problem bank', run: () => showView('dungeons') },
      { icon: '▤', title: 'Go to Training log', hint: 'Sessions and notes', run: () => showView('log') },
      { icon: '▥', title: 'Go to Analytics', hint: 'Charts and XP ledger', run: () => showView('analytics') },
      { icon: '⚙', title: 'Go to System', hint: 'Profile, imports, exports', run: () => showView('system') },
      { icon: '＋', title: 'Log a training session', hint: 'Keyboard: N', run: () => openSessionModal() },
      { icon: '◇', title: 'Add a custom dungeon', hint: 'Contest problem or IOI task', run: () => openProblemModal() },
      { icon: '↓', title: 'Export JSON backup', hint: 'Full local backup', run: exportBackup },
      { icon: '▤', title: 'Import workspace folder', hint: 'Refresh evidence from files', run: () => $('#workspaceFolderInput').click() },
      { icon: '☾', title: 'Toggle theme', hint: 'Dark / light', run: toggleTheme },
      { icon: '✓', title: 'Claim all completed quests', hint: 'Collect ready rewards', run: claimAllQuests },
      { icon: '⛩', title: 'Apply evidenced gates', hint: 'Complete gates with source evidence', run: () => applyEvidence('topics') },
      { icon: '⚔', title: 'Clear evidenced dungeons', hint: 'Mark implemented problems cleared', run: () => applyEvidence('problems') }
    ];
  }

  function buildPaletteItems(query = '') {
    const normalized = query.trim().toLowerCase();
    const items = paletteActions();
    if (normalized) {
      D.CHAPTERS.forEach((chapter) => {
        chapter.topics.forEach((topic) => {
          if (`${topic.name} ${topic.desc} ${chapter.title}`.toLowerCase().includes(normalized)) {
            items.push({
              icon: '⛩',
              title: topic.name,
              hint: `${chapter.title} · +${topic.xp} XP`,
              run: () => { showView('gates'); ui.gateSearch = topic.name; $('#gateSearch').value = topic.name; renderGates(); }
            });
          }
        });
      });
      S.allProblems().forEach((problem) => {
        if (`${problem.title} ${problem.desc} ${(problem.tags || []).join(' ')}`.toLowerCase().includes(normalized)) {
          items.push({
            icon: '⚔',
            title: problem.title,
            hint: `${D.TRACKS[problem.track].name} · ${problem.difficulty}`,
            run: () => { showView('dungeons'); ui.dungeonSearch = problem.title; $('#dungeonSearch').value = problem.title; renderDungeons(); }
          });
        }
      });
    }
    return items.filter((item) => !normalized || `${item.title} ${item.hint}`.toLowerCase().includes(normalized)).slice(0, 40);
  }

  function renderPaletteResults() {
    const container = $('#paletteResults');
    if (!ui.paletteItems.length) {
      container.innerHTML = '<div class="palette-empty">No matching commands. Try “log”, “gates”, or a problem name.</div>';
      return;
    }
    ui.paletteIndex = Math.max(0, Math.min(ui.paletteItems.length - 1, ui.paletteIndex));
    container.innerHTML = ui.paletteItems.map((item, index) => `
      <button class="palette-item ${index === ui.paletteIndex ? 'active' : ''}" data-palette-index="${index}" role="option" aria-selected="${index === ui.paletteIndex}">
        <span class="palette-icon" aria-hidden="true">${item.icon}</span>
        <span class="palette-copy"><strong>${esc(item.title)}</strong><span>${esc(item.hint)}</span></span>
        <kbd>↵</kbd>
      </button>`).join('');
  }

  function openPalette() {
    ui.paletteIndex = 0;
    ui.paletteItems = buildPaletteItems('');
    $('#paletteInput').value = '';
    renderPaletteResults();
    openModal('paletteModal');
    window.setTimeout(() => $('#paletteInput').focus(), 40);
  }

  function togglePalette() {
    if ($('#paletteModal').hidden) openPalette();
    else closeModal('paletteModal');
  }

  function runPaletteItem(index) {
    const item = ui.paletteItems[index];
    if (!item) return;
    closeModal('paletteModal');
    item.run();
  }

  /* ---------------------------------------------------------------- actions */
  function showView(view) {
    if (!VIEW_TITLES[view]) return;
    ui.view = view;
    closeSidebar();
    $$('.view').forEach((section) => section.classList.toggle('active-view', section.id === `${view}View`));
    $$('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
    $('#pageTitle').textContent = VIEW_TITLES[view];
    document.title = `${VIEW_TITLES[view]} — SYSTEM`;
    window.scrollTo({ top: 0, behavior: state().settings.reduceMotion ? 'auto' : 'smooth' });
  }

  function toggleTheme() {
    S.updateSettings({ theme: state().settings.theme === 'dark' ? 'light' : 'dark' });
    S.save();
    applyTheme();
    renderAll();
    toast(`Theme: ${state().settings.theme}.`, 'info');
  }

  function claimAllQuests() {
    let claimed = 0;
    let xp = 0;
    const { daily, weekly } = S.questsForToday();
    [...daily.map((quest) => ['daily', quest]), ...weekly.map((quest) => ['weekly', quest])].forEach(([scope, quest]) => {
      if (quest.progress.complete && !quest.progress.claimed) {
        const result = S.claimQuest(scope, quest.id);
        if (result.ok) { claimed++; xp += result.xp; }
      }
    });
    if (!claimed) { toast('No completed quests are ready to claim.', 'info'); return; }
    afterAction(`${claimed} quest${claimed === 1 ? '' : 's'} claimed · +${xp} XP`);
  }

  function applyEvidence(kind) {
    if (kind === 'problems') {
      const count = S.allProblems().filter((problem) => S.evidenceForProblem(problem).implemented && S.problemRecord(problem.id).status !== 'solved').length;
      if (!count) { toast('No implemented dungeons are waiting for a clear.', 'info'); return; }
      askConfirm({
        title: 'Clear evidenced dungeons?',
        message: `${count} dungeons have source files in the workspace snapshot. Mark them cleared? File evidence is not proof of acceptance — you can reopen any of them later.`,
        label: `Clear ${count}`,
        onAccept: () => {
          const result = S.applyEvidence({ problems: true });
          afterAction(`${result.problemCount} evidenced dungeons cleared.`);
        }
      });
      return;
    }
    const result = S.applyEvidence({ topics: true });
    afterAction(result.topicCount ? `${result.topicCount} evidenced gates completed.` : 'No new evidenced gates found.', result.topicCount ? 'success' : 'info');
  }

  function exportBackup() {
    download(`system-backup-${S.dateKey(new Date())}.json`, JSON.stringify(S.exportBackup(), null, 2), 'application/json');
    toast('JSON backup downloaded.', 'success');
  }

  function download(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportSessions() {
    download(`system-sessions-${S.dateKey(new Date())}.csv`, S.sessionsToCSV(), 'text/csv');
    toast('Sessions CSV downloaded.', 'success');
  }

  function exportProblems() {
    download(`system-dungeons-${S.dateKey(new Date())}.csv`, S.problemsToCSV(), 'text/csv');
    toast('Dungeon CSV downloaded.', 'success');
  }

  function deleteSessionWithUndo(id) {
    const removed = S.deleteSession(id);
    if (!removed) return;
    S.commit();
    renderAll();
    toast('Session deleted.', 'info', {
      label: 'Undo',
      onClick: () => { S.restoreSession(removed); afterAction('Session restored.'); }
    });
  }

  /* ---------------------------------------------------------------- imports */
  async function readFile(file) {
    return await file.text();
  }

  function handleImportResult(result, successMessage) {
    if (!result.ok) { toast(result.reason || 'Import failed.', 'error'); return false; }
    afterAction(successMessage);
    return true;
  }

  async function importBackupFile(file, mode) {
    const text = await readFile(file);
    const result = S.importBackup(text, mode);
    handleImportResult(result, mode === 'replace' ? 'Backup replaced local data.' : `Backup merged · ${result.sessions} new session${result.sessions === 1 ? '' : 's'}.`);
  }

  async function importSessionsFile(file) {
    const text = await readFile(file);
    const result = S.importSessionsCSV(text);
    if (!result.sessions.length) {
      toast(result.errors[0] || 'No valid sessions found.', 'error');
      return;
    }
    const added = S.addSessions(result.sessions);
    if (!added.length) {
      toast('Those sessions are already in your log.', 'info');
      return;
    }
    const duplicates = result.sessions.length - added.length;
    afterAction(`${added.length} session${added.length === 1 ? '' : 's'} imported${duplicates ? ` · ${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped` : ''}${result.skipped ? ` · ${result.skipped} skipped` : ''}.`);
    if (result.errors.length) toast(`${result.errors.length} rows were skipped. Check the CSV columns.`, 'error');
  }

  async function importMarkdownFile(file) {
    const text = await readFile(file);
    const result = S.importMarkdownChecklist(text);
    afterAction(result.applied.length ? `${result.applied.length} gates completed from checklist.` : 'No new checked gates found.', result.applied.length ? 'success' : 'info');
    if (result.skipped.length) toast(`${result.skipped.length} checklist items did not match a gate.`, 'info');
  }

  async function importWorkspace(fileList, options = {}) {
    const result = S.importWorkspaceFiles(fileList, { merge: options.merge !== false });
    if (!result.incoming) { toast('No .cpp or .md files found in that selection.', 'error'); return; }
    afterAction(`Workspace evidence updated · ${result.totals.files} files · ${result.totals.days} active days.`);
  }

  function importPasted() {
    const text = $('#pasteInput').value.trim();
    if (!text) { toast('Paste a backup, CSV, or Markdown checklist first.', 'error'); return; }
    if (text.startsWith('{') || text.startsWith('[')) {
      const result = S.importBackup(text, 'merge');
      if (handleImportResult(result, `Pasted backup merged · ${result.sessions} new sessions.`)) $('#pasteInput').value = '';
      return;
    }
    if (/^\s*[-*]\s*\[[ xX]\]/m.test(text)) {
      const result = S.importMarkdownChecklist(text);
      afterAction(result.applied.length ? `${result.applied.length} gates completed from pasted checklist.` : 'No new checked gates found.', result.applied.length ? 'success' : 'info');
      $('#pasteInput').value = '';
      return;
    }
    const result = S.importSessionsCSV(text);
    if (!result.sessions.length) { toast(result.errors[0] || 'Could not recognise pasted data.', 'error'); return; }
    const added = S.addSessions(result.sessions);
    if (!added.length) { toast('Those sessions are already in your log.', 'info'); return; }
    const duplicates = result.sessions.length - added.length;
    afterAction(`${added.length} session${added.length === 1 ? '' : 's'} imported from pasted CSV${duplicates ? ` · ${duplicates} duplicate${duplicates === 1 ? '' : 's'} skipped` : ''}.`);
    $('#pasteInput').value = '';
  }

  /* --------------------------------------------------------------- render */
  function renderAll() {
    const player = S.player();
    renderChrome(player);
    renderStatus(player);
    renderGates();
    renderDungeons();
    renderLog();
    renderAnalytics(player);
    renderSystem();
  }

  /* --------------------------------------------------------------- events */
  function handleClick(event) {
    const nav = event.target.closest('[data-view]');
    if (nav) { showView(nav.dataset.view); return; }
    const viewTarget = event.target.closest('[data-view-target]');
    if (viewTarget) { showView(viewTarget.dataset.viewTarget); return; }
    const openSession = event.target.closest('[data-open-session]');
    if (openSession) {
      openSessionModal({ problemId: openSession.dataset.problemId || '', topic: openSession.dataset.topic || '' });
      return;
    }
    const openProblem = event.target.closest('[data-open-problem]');
    if (openProblem) { openProblemModal(); return; }
    const claim = event.target.closest('[data-claim-id]');
    if (claim) {
      const result = S.claimQuest(claim.dataset.claimScope, claim.dataset.claimId);
      if (!result.ok) { toast(result.reason, 'error'); return; }
      afterAction(`Quest claimed · +${result.xp} XP`);
      return;
    }
    const topic = event.target.closest('[data-topic-id]');
    if (topic) {
      const done = S.toggleTopic(topic.dataset.topicId);
      afterAction(done ? 'Gate cleared.' : 'Gate reopened.', done ? 'success' : 'info');
      return;
    }
    const chapter = event.target.closest('[data-chapter-toggle]');
    if (chapter) {
      const id = chapter.dataset.chapterToggle;
      ui.openChapters[id] = ui.openChapters[id] === false;
      renderGates();
      return;
    }
    const problemAction = event.target.closest('[data-problem-action]');
    if (problemAction) {
      const id = problemAction.dataset.problemId;
      const action = problemAction.dataset.problemAction;
      const problem = S.problemById(id);
      if (!problem) return;
      if (action === 'cycle') {
        S.cycleProblemStatus(id);
        const record = S.problemRecord(id);
        afterAction(record.status === 'solved' ? `Dungeon cleared · +${D.difficultyXp(problem.difficulty)} XP` : `Status: ${statusMeta(record.status).label}.`, record.status === 'solved' ? 'success' : 'info');
      } else if (action === 'review') {
        S.toggleReview(id);
        afterAction(S.problemRecord(id).review ? 'Added to review queue.' : 'Removed from review queue.', 'info');
      } else if (action === 'edit') {
        openProblemModal(problem);
      } else if (action === 'delete') {
        askConfirm({
          title: 'Delete custom dungeon?',
          message: `“${problem.title}” and its progress will be removed. Built-in dungeons cannot be deleted.`,
          label: 'Delete dungeon',
          onAccept: () => { S.removeProblem(id); afterAction('Custom dungeon deleted.', 'info'); }
        });
      }
      return;
    }
    const sessionAction = event.target.closest('[data-session-action]');
    if (sessionAction) {
      const id = sessionAction.dataset.sessionId;
      if (sessionAction.dataset.sessionAction === 'edit') editSession(id);
      else if (sessionAction.dataset.sessionAction === 'delete') deleteSessionWithUndo(id);
      return;
    }
    const exportAction = event.target.closest('[data-export]');
    if (exportAction) {
      if (exportAction.dataset.export === 'backup') exportBackup();
      else if (exportAction.dataset.export === 'sessions') exportSessions();
      else if (exportAction.dataset.export === 'problems') exportProblems();
      return;
    }
    const apply = event.target.closest('[data-apply-evidence]');
    if (apply) { applyEvidence(apply.dataset.applyEvidence); return; }
    const clearGates = event.target.closest('[data-clear-gate-filters]');
    if (clearGates) { ui.gateSearch = ''; ui.gateFilter = 'all'; $('#gateSearch').value = ''; $$('#gateFilter .segment').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all')); renderGates(); return; }
    const clearDungeons = event.target.closest('[data-clear-dungeon-filters]');
    if (clearDungeons) { ui.dungeonSearch = ''; ui.dungeonTrack = 'all'; ui.dungeonDifficulty = 'all'; ui.dungeonStatus = 'all'; $('#dungeonSearch').value = ''; $('#dungeonTrack').value = 'all'; $('#dungeonDifficulty').value = 'all'; $('#dungeonStatus').value = 'all'; renderDungeons(); return; }
    const close = event.target.closest('[data-close-modal]');
    if (close) { const modal = close.closest('.modal-backdrop'); if (modal) closeModal(modal.id); return; }
    const paletteItem = event.target.closest('[data-palette-index]');
    if (paletteItem) { runPaletteItem(Number(paletteItem.dataset.paletteIndex)); return; }
  }

  function wireEvents() {
    document.addEventListener('click', handleClick);

    $$('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(backdrop.id); });
    });

    $('#sessionForm').addEventListener('submit', submitSession);
    $('#problemForm').addEventListener('submit', submitProblem);

    $('#profileForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      S.updateProfile({
        name: data.get('name'),
        goalMinutesPerWeek: data.get('goalMinutesPerWeek'),
        dailyXpGoal: data.get('dailyXpGoal')
      });
      S.updateSettings({
        weekStart: data.get('weekStart'),
        theme: data.get('theme'),
        reduceMotion: Boolean(data.get('reduceMotion'))
      });
      afterAction('Profile saved.');
    });

    $('#confirmAccept').addEventListener('click', () => {
      const action = ui.confirmAction;
      ui.confirmAction = null;
      closeModal('confirmModal');
      if (action) action();
    });
    $('#confirmCancel').addEventListener('click', () => { ui.confirmAction = null; closeModal('confirmModal'); });

    $('#searchButton').addEventListener('click', openPalette);
    $('#paletteInput').addEventListener('input', (event) => {
      ui.paletteItems = buildPaletteItems(event.target.value);
      ui.paletteIndex = 0;
      renderPaletteResults();
    });
    $('#paletteInput').addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') { event.preventDefault(); ui.paletteIndex = Math.min(ui.paletteItems.length - 1, ui.paletteIndex + 1); renderPaletteResults(); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); ui.paletteIndex = Math.max(0, ui.paletteIndex - 1); renderPaletteResults(); }
      else if (event.key === 'Enter') { event.preventDefault(); runPaletteItem(ui.paletteIndex); }
    });

    $('#gateSearch').addEventListener('input', (event) => { ui.gateSearch = event.target.value; renderGates(); });
    $$('#gateFilter .segment').forEach((button) => button.addEventListener('click', () => {
      ui.gateFilter = button.dataset.filter;
      $$('#gateFilter .segment').forEach((item) => item.classList.toggle('active', item === button));
      renderGates();
    }));
    $('#collapseGates').addEventListener('click', () => {
      const collapse = !ui.gatesCollapsed;
      D.CHAPTERS.forEach((chapter) => { ui.openChapters[chapter.id] = !collapse; });
      renderGates();
    });

    $('#dungeonSearch').addEventListener('input', (event) => { ui.dungeonSearch = event.target.value; renderDungeons(); });
    $('#dungeonTrack').addEventListener('change', (event) => { ui.dungeonTrack = event.target.value; renderDungeons(); });
    $('#dungeonDifficulty').addEventListener('change', (event) => { ui.dungeonDifficulty = event.target.value; renderDungeons(); });
    $('#dungeonStatus').addEventListener('change', (event) => { ui.dungeonStatus = event.target.value; renderDungeons(); });
    $('#toggleDungeonView').addEventListener('click', () => {
      ui.compactDungeons = !ui.compactDungeons;
      $('#toggleDungeonView').textContent = ui.compactDungeons ? 'Comfortable' : 'Compact';
      $('#toggleDungeonView').setAttribute('aria-pressed', String(ui.compactDungeons));
      renderDungeons();
    });
    $('#addProblemButton').addEventListener('click', () => openProblemModal());
    $('#clearEvidencedButton').addEventListener('click', () => applyEvidence('problems'));

    $('#logSearch').addEventListener('input', (event) => { ui.logSearch = event.target.value; renderLog(); });
    $('#logTrack').addEventListener('change', (event) => { ui.logTrack = event.target.value; renderLog(); });
    $('#logRange').addEventListener('change', (event) => { ui.logRange = event.target.value; renderLog(); });
    $('#logSort').addEventListener('change', (event) => { ui.logSort = event.target.value; renderLog(); });

    $('#logSessionButton').addEventListener('click', () => openSessionModal());
    $('#logSessionButtonSecondary').addEventListener('click', () => openSessionModal());
    $('#focusButton').addEventListener('click', () => openSessionModal());

    $('#exportSessionsButton').addEventListener('click', exportSessions);
    $('#exportSessionsButton2').addEventListener('click', exportSessions);
    $('#exportProblemsButton').addEventListener('click', exportProblems);
    $('#exportBackupButton').addEventListener('click', exportBackup);

    $('#backupInput').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (file) await importBackupFile(file, 'merge');
      event.target.value = '';
    });
    $('#replaceBackupInput').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      askConfirm({
        title: 'Replace local data?',
        message: 'This overwrites your current sessions, gates, dungeons, quests, and achievements with the selected backup. Export a backup first if you are unsure.',
        label: 'Replace data',
        onAccept: () => importBackupFile(file, 'replace')
      });
    });
    $('#sessionsCsvInput').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (file) await importSessionsFile(file);
      event.target.value = '';
    });
    $('#markdownInput').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (file) await importMarkdownFile(file);
      event.target.value = '';
    });
    $('#workspaceFolderInput').addEventListener('change', async (event) => {
      if (event.target.files?.length) await importWorkspace(event.target.files, { merge: false });
      event.target.value = '';
    });
    $('#workspaceFilesInput').addEventListener('change', async (event) => {
      if (event.target.files?.length) await importWorkspace(event.target.files, { merge: true });
      event.target.value = '';
    });
    $('#pasteImportButton').addEventListener('click', importPasted);
    $('#applyEvidenceTopics').addEventListener('click', () => applyEvidence('topics'));
    $('#applyEvidenceProblems').addEventListener('click', () => applyEvidence('problems'));

    $('#resetProgressButton').addEventListener('click', () => {
      askConfirm({
        title: 'Reset progress?',
        message: 'Sessions, gates, dungeons, quests, and achievements will be cleared. Profile, settings, custom dungeons, and workspace evidence stay.',
        label: 'Reset progress',
        onAccept: () => { S.resetProgress(); S.commit({ silent: true }); renderAll(); toast('Progress reset. Workspace evidence kept.', 'info'); }
      });
    });
    $('#resetAllButton').addEventListener('click', () => {
      askConfirm({
        title: 'Erase all local data?',
        message: 'Everything in this browser will be deleted and the shipped workspace snapshot restored. Export a backup first.',
        label: 'Erase everything',
        onAccept: () => { S.resetAll(); S.initializeMeta(); S.commit({ silent: true }); renderAll(); toast('All local data erased.', 'error'); }
      });
    });

    $('#mobileMenu').addEventListener('click', openSidebar);
    $('#sidebarClose').addEventListener('click', closeSidebar);
    $('#sidebarScrim').addEventListener('click', closeSidebar);
    $('#levelUpClose').addEventListener('click', () => {
      $('#levelUpOverlay').hidden = true;
      if (!$$('.modal-backdrop:not([hidden])').length) document.body.classList.remove('modal-open');
    });

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        togglePalette();
        return;
      }
      if (event.key === 'Escape') {
        if (!$('#paletteModal').hidden) closeModal('paletteModal');
        else if (!$('#levelUpOverlay').hidden) {
          $('#levelUpOverlay').hidden = true;
          if (!$$('.modal-backdrop:not([hidden])').length) document.body.classList.remove('modal-open');
        }
        else if ($('.modal-backdrop:not([hidden])')) closeAllModals();
        else closeSidebar();
        return;
      }
      const target = document.activeElement;
      const typing = target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable);
      if (typing) return;
      if (event.key.toLowerCase() === 'n') { event.preventDefault(); openSessionModal(); }
      if (event.key === '/') { event.preventDefault(); focusCurrentSearch(); }
    });
  }

  function openSidebar() {
    document.body.classList.add('sidebar-open');
    $('#sidebarScrim').hidden = false;
    $('#mobileMenu').setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    $('#sidebarScrim').hidden = true;
    $('#mobileMenu').setAttribute('aria-expanded', 'false');
  }

  function focusCurrentSearch() {
    const map = { gates: '#gateSearch', dungeons: '#dungeonSearch', log: '#logSearch' };
    const selector = map[ui.view];
    if (selector) $(selector)?.focus();
    else openPalette();
  }

  /* ----------------------------------------------------------------- boot */
  function boot() {
    applyTheme();
    S.initializeMeta();
    const outcome = S.commit({ silent: true });
    renderAll();
    wireEvents();
    if (outcome.unlocked.length) {
      toast(`${outcome.unlocked.length} achievements unlocked from workspace evidence.`, 'achievement');
    }
    if (state().meta.migratedFrom) {
      toast(`Legacy tracker data imported from ${state().meta.migratedFrom}.`, 'success');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
