const STORAGE_KEY = 'zco-ioi-prep-tracker-v1';
const FILE_ACTIVITY_VERSION = 4;

const roadmap = [
  { title: 'C++ foundations', topics: ['Variables and output', 'Input and arithmetic', 'Type conversion', 'Conditions', 'Logical and bitwise operators', 'Loops', 'Functions', 'Arrays and strings'] },
  { title: 'Problem solving', topics: ['STL essentials', 'Sorting and searching', 'Prefix sums and difference arrays', 'Two pointers and sliding window', 'Greedy algorithms', 'Recursion and backtracking', 'Graph traversal', 'Dynamic programming', 'Number theory'] }
];

const problems = [
  { id: 'basic-input', title: 'Basic input and arithmetic', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'mid-arithmetic', title: 'Mid-level input and arithmetic', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'even-odd', title: 'Even or odd', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'greater-number', title: 'Greater number', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'divisibility', title: 'Divisibility test', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'maximum-three', title: 'Maximum of three', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'middle-number', title: 'The middle number', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'swapping-values', title: 'Swapping values', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'digit-extractor', title: 'Digit extractor', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'sum-challenge', title: 'Sum challenge', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'factorial', title: 'Factorial', track: 'foundations', difficulty: 'Warm-up' },
  { id: 'sum-of-n-factorials', title: 'Sum of n factorials', track: 'foundations', difficulty: 'Practice' },
  { id: 'sum-of-even-numbers', title: 'Sum of even numbers', track: 'foundations', difficulty: 'Practice' },
  { id: 'number-of-even-numbers', title: 'Number of even numbers', track: 'foundations', difficulty: 'Practice' },
  { id: 'total-digits', title: 'Total digits in a number', track: 'foundations', difficulty: 'Practice' },
  { id: 'sum-of-digits', title: 'Sum of digits of a number', track: 'foundations', difficulty: 'Practice' },
  { id: 'product-of-digits', title: 'Product of digits', track: 'foundations', difficulty: 'Practice' },
  { id: 'reverse-number', title: 'Reverse number', track: 'foundations', difficulty: 'Practice' },
  { id: 'largest-digit', title: 'Largest digit in a number', track: 'foundations', difficulty: 'Practice' },
  { id: 'smallest-digit', title: 'Smallest digit in a number', track: 'foundations', difficulty: 'Practice' },
  { id: 'digit-occurrence', title: 'Occurrence of digits in a number', track: 'foundations', difficulty: 'Practice' },
  { id: 'zco-simulation', title: 'ZCO simulation set', track: 'zco', difficulty: 'Timed set' },
  { id: 'ioi-subtasks', title: 'IOI subtask drill', track: 'ioi', difficulty: 'Deep dive' }
];

// Exact snapshot of .cpp/.md files by LastWriteTime through 7 Nov 2026. A static site cannot inspect
// the local filesystem, so this is versioned and shown transparently as workspace activity.
const workspaceActivity = [
  { date: '2026-11-02T23:59:00+05:30', files: 7, code: 2, docs: 5, label: 'Foundations and reference notes updated' },
  { date: '2026-11-03T23:59:00+05:30', files: 5, code: 3, docs: 2, label: 'Problem-solving sets started' },
  { date: '2026-11-04T23:59:00+05:30', files: 29, code: 8, docs: 21, label: 'Conditionals and problems 03–07 documented' },
  { date: '2026-11-05T23:59:00+05:30', files: 4, code: 4, docs: 0, label: 'Problems 08–11 implemented' },
  { date: '2026-11-06T23:59:00+05:30', files: 24, code: 3, docs: 21, label: 'Problems 08–14 documented; 12–14 implemented' },
  { date: '2026-11-07T20:30:03+05:30', files: 30, code: 8, docs: 22, label: 'For loops and problems 15–21 completed' }
];
const workspaceSolvedProblems = ['basic-input', 'mid-arithmetic', 'even-odd', 'greater-number', 'divisibility', 'maximum-three', 'middle-number', 'swapping-values', 'digit-extractor', 'sum-challenge', 'factorial', 'sum-of-n-factorials', 'sum-of-even-numbers', 'number-of-even-numbers'];
const workspaceAttemptedProblems = [...workspaceSolvedProblems, 'total-digits', 'sum-of-digits', 'product-of-digits', 'reverse-number', 'largest-digit', 'smallest-digit', 'digit-occurrence'];

const defaultState = {
  completedTopics: ['Variables and output', 'Input and arithmetic', 'Type conversion', 'Conditions', 'Logical and bitwise operators'],
  solvedProblems: [],
  attemptedProblems: [],
  sessions: [],
  achievements: [],
  fileActivityVersion: 0
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const next = { ...defaultState, ...saved };
    if (next.fileActivityVersion !== FILE_ACTIVITY_VERSION) {
      next.fileActivityVersion = FILE_ACTIVITY_VERSION;
      next.solvedProblems = [...new Set([...next.solvedProblems, ...workspaceSolvedProblems])];
      next.attemptedProblems = [...new Set([...(next.attemptedProblems || []), ...workspaceAttemptedProblems])];
      next.sessions = [...workspaceActivity.map(activity => ({
        topic: activity.label, track: 'workspace', minutes: 0,
        note: `${activity.code || activity.files} code · ${activity.docs || 0} notes/docs`,
        date: activity.date, source: 'workspace'
      })), ...next.sessions.filter(session => session.source !== 'workspace')];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
  } catch (error) {
    console.error('Could not read saved tracker data. Starting with defaults.', error);
    return { ...defaultState, fileActivityVersion: FILE_ACTIVITY_VERSION, attemptedProblems: workspaceAttemptedProblems, sessions: workspaceActivity.map(activity => ({ ...activity, track: 'workspace', minutes: 0, source: 'workspace' })) };
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function allTopics() { return roadmap.flatMap(section => section.topics); }
function completedCount() { return allTopics().filter(topic => state.completedTopics.includes(topic)).length; }
function formatDate(date) { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(date)); }
function formatFullDate(date) { return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(date)); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char])); }
function manualSessions() { return state.sessions.filter(session => session.source !== 'workspace'); }
function totalMinutes() { return manualSessions().reduce((sum, session) => sum + Number(session.minutes || 0), 0); }
function activityXp(activity) { return activity.code * 25 + activity.docs * 5; }
function xpForSession(session) { return session.source === 'workspace' ? activityXp(workspaceActivity.find(activity => activity.date === session.date) || { code: 0, docs: 0 }) : Math.min(Number(session.minutes || 0), 120); }
function totalXp() { return workspaceActivity.reduce((sum, activity) => sum + activityXp(activity), 0) + totalMinutes() + state.completedTopics.length * 50 + state.solvedProblems.length * 100; }
function levelForXp(xp) { return Math.floor(Math.sqrt(xp / 100)) + 1; }
function xpAtLevel(level) { return (level - 1) ** 2 * 100; }
function titleForLevel(level) {
  return level >= 10 ? 'IOI Contender' : level >= 7 ? 'Algorithm Architect' : level >= 5 ? 'Contest Climber' : level >= 3 ? 'Pattern Hunter' : 'Curious Coder';
}
function nextLevelXp(level) { return xpAtLevel(level + 1); }

function calculateStreak() {
  const days = new Set([...workspaceActivity.map(activity => new Date(activity.date).toDateString()), ...manualSessions().map(session => new Date(session.date).toDateString())]);
  let date = new Date(); let streak = 0;
  while (days.has(date.toDateString())) { streak++; date.setDate(date.getDate() - 1); }
  return streak;
}

function updateAchievements() {
  const unlocked = new Set(state.achievements);
  const checks = [
    ['first-session', manualSessions().length >= 1],
    ['file-builder', workspaceActivity.reduce((sum, item) => sum + item.files, 0) >= 10],
    ['foundation-builder', completedCount() >= 5],
    ['problem-solver', state.solvedProblems.length >= 1],
    ['consistent', calculateStreak() >= 3],
    ['hundred-xp', totalXp() >= 1000]
  ];
  checks.forEach(([id, passed]) => { if (passed) unlocked.add(id); });
  state.achievements = [...unlocked];
}

function render() {
  updateAchievements();
  const completed = completedCount(); const total = allTopics().length; const solved = state.solvedProblems.length;
  const xp = totalXp(); const level = levelForXp(xp); const currentLevelXp = xpAtLevel(level);
  document.getElementById('todayLabel').textContent = formatFullDate(new Date());
  document.getElementById('roadmapProgress').textContent = `${Math.round(completed / total * 100)}%`;
  document.getElementById('roadmapBar').style.width = `${completed / total * 100}%`;
  document.getElementById('solvedCount').textContent = `${solved} / ${problems.length}`;
  document.getElementById('solvedBar').style.width = `${solved / problems.length * 100}%`;
  document.getElementById('heroMinutes').textContent = totalMinutes();
  document.getElementById('activityDays').textContent = new Set(state.sessions.map(session => new Date(session.date).toDateString())).size;
  document.getElementById('sourceFileCount').textContent = workspaceActivity.reduce((sum, item) => sum + item.code, 0);
  document.getElementById('documentedCount').textContent = workspaceActivity.reduce((sum, item) => sum + item.docs, 0);
  document.getElementById('streakCount').textContent = `${calculateStreak()} ${calculateStreak() === 1 ? 'day' : 'days'}`;
  document.getElementById('streakHint').textContent = calculateStreak() ? 'Keep the chain alive' : 'Log a session to start your streak';
  document.getElementById('levelNumber').textContent = `LVL ${level}`;
  document.getElementById('playerTitle').textContent = titleForLevel(level);
  document.getElementById('xpValue').textContent = `${xp} XP`;
  document.getElementById('xpNext').textContent = `${Math.max(0, nextLevelXp(level) - xp)} XP to level ${level + 1}`;
  document.getElementById('xpBar').style.width = `${Math.min(100, (xp - currentLevelXp) / (nextLevelXp(level) - currentLevelXp) * 100)}%`;
  renderNextTopics(); renderRecentSessions(); renderRoadmap(); renderProblems(); renderSessions(); renderAchievements(); renderWorkspaceActivity();
  const readiness = document.getElementById('readinessTitle'); const readinessText = document.getElementById('readinessText');
  if (completed / total >= .75) { readiness.textContent = 'Ready for harder sets'; readinessText.textContent = 'Your base is strong. Start mixing in timed ZCO and IOI drills.'; }
  else if (completed / total >= .4) { readiness.textContent = 'Momentum is building'; readinessText.textContent = 'Keep stacking fundamentals, then add timed practice.'; }
}

function renderNextTopics() {
  const next = allTopics().filter(topic => !state.completedTopics.includes(topic)).slice(0, 4);
  document.getElementById('nextTopics').innerHTML = next.length ? next.map((topic, index) => `<div class="topic-row"><i class="topic-marker ${index === 0 ? 'priority' : ''}"></i><div><strong>${escapeHtml(topic)}</strong><span>${index === 0 ? 'Up next' : 'Queued'}</span></div><span class="topic-arrow">→</span></div>`).join('') : '<p>You completed the roadmap. Time for contest sets.</p>';
}
function sessionTemplate(session) {
  const label = session.source === 'workspace' ? 'WORKSPACE' : escapeHtml(session.track.toUpperCase());
  return `<div class="session-item"><div class="session-date">${formatDate(session.date)}</div><div><strong>${escapeHtml(session.topic)}</strong><span>${label}${session.note ? ` · ${escapeHtml(session.note)}` : ''}</span></div><span class="session-minutes">${session.source === 'workspace' ? `+${xpForSession(session)} XP` : `${session.minutes}m`}</span></div>`;
}
function renderRecentSessions() { const sessions = state.sessions.slice(0, 5); document.getElementById('recentSessions').innerHTML = sessions.length ? sessions.map(sessionTemplate).join('') : '<p>No sessions yet. Log your first focused block.</p>'; }

function renderRoadmap() {
  document.getElementById('roadmapList').innerHTML = roadmap.map(section => {
    const done = section.topics.filter(topic => state.completedTopics.includes(topic)).length;
    return `<section class="roadmap-section"><div class="roadmap-section-header"><strong>${section.title}</strong><span class="completion">${done}/${section.topics.length} complete</span></div>${section.topics.map(topic => `<div class="roadmap-topic"><button class="check ${state.completedTopics.includes(topic) ? 'done' : ''}" data-topic="${escapeHtml(topic)}">${state.completedTopics.includes(topic) ? '✓' : ''}</button><strong>${escapeHtml(topic)}</strong><small>${state.completedTopics.includes(topic) ? '+50 XP' : 'To learn'}</small></div>`).join('')}</section>`;
  }).join('');
  document.querySelectorAll('.check').forEach(button => button.addEventListener('click', () => toggleTopic(button.dataset.topic)));
}
function renderProblems() {
  const filter = document.getElementById('problemFilter').value;
  const visible = problems.filter(problem => filter === 'all' || problem.track === filter);
  document.getElementById('problemList').innerHTML = visible.map(problem => `<div class="problem-row"><span class="tag tag-${problem.track}">${problem.track}</span><div><strong>${problem.title}</strong><small>${problem.difficulty} · ${state.solvedProblems.includes(problem.id) ? '+100 XP earned' : state.attemptedProblems?.includes(problem.id) ? 'Attempted · review before marking solved' : '+100 XP'}</small></div><button class="problem-check ${state.solvedProblems.includes(problem.id) ? 'done' : ''}" data-problem="${problem.id}">${state.solvedProblems.includes(problem.id) ? 'Solved ✓' : state.attemptedProblems?.includes(problem.id) ? 'Review' : 'Mark solved'}</button></div>`).join('');
  document.querySelectorAll('.problem-check').forEach(button => button.addEventListener('click', () => toggleProblem(button.dataset.problem)));
}
function renderSessions() { document.getElementById('sessionList').innerHTML = state.sessions.length ? state.sessions.map(sessionTemplate).join('') : '<p>No sessions yet.</p>'; }
function renderWorkspaceActivity() {
  document.getElementById('workspaceActivity').innerHTML = workspaceActivity.slice().reverse().map(activity => `<div class="activity-row"><div class="activity-date">${formatDate(activity.date)}</div><div class="activity-main"><strong>${escapeHtml(activity.label)}</strong><span>${activity.code} code · ${activity.docs} docs · ${activity.files} tracked files</span></div><b>+${activityXp(activity)} XP</b></div>`).join('');
}
function renderAchievements() {
  const badges = [['first-session', 'First focus', 'Log a manual session'], ['file-builder', 'File builder', 'Create 10 workspace files'], ['foundation-builder', 'Foundation builder', 'Complete 5 topics'], ['problem-solver', 'Problem solver', 'Solve your first problem'], ['consistent', 'On a roll', 'Keep a 3-day streak'], ['hundred-xp', 'XP hunter', 'Earn 1,000 XP']];
  document.getElementById('achievementList').innerHTML = badges.map(([id, title, rule]) => `<div class="achievement ${state.achievements.includes(id) ? 'unlocked' : ''}"><span>${state.achievements.includes(id) ? '★' : '☆'}</span><div><strong>${title}</strong><small>${state.achievements.includes(id) ? 'Unlocked' : rule}</small></div></div>`).join('');
}
function toggleTopic(topic) { state.completedTopics = state.completedTopics.includes(topic) ? state.completedTopics.filter(item => item !== topic) : [...state.completedTopics, topic]; saveState(); render(); }
function toggleProblem(id) {
  state.solvedProblems = state.solvedProblems.includes(id) ? state.solvedProblems.filter(item => item !== id) : [...state.solvedProblems, id];
  state.attemptedProblems = [...new Set([...(state.attemptedProblems || []), id])];
  saveState(); render();
}
function showView(view) {
  document.querySelectorAll('.view').forEach(item => item.classList.toggle('active-view', item.id === `${view}View`));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  document.getElementById('pageTitle').textContent = view === 'overview' ? 'Good evening, coder.' : view === 'roadmap' ? 'Your path to competition.' : 'Practice makes patterns.';
}
function openModal() { document.getElementById('sessionModal').hidden = false; document.querySelector('#sessionForm input[name="topic"]').focus(); }
function closeModal() { document.getElementById('sessionModal').hidden = true; }

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('[data-view-target]').forEach(button => button.addEventListener('click', () => showView(button.dataset.viewTarget)));
document.getElementById('logSessionButton').addEventListener('click', openModal);
document.getElementById('logSessionButtonSecondary').addEventListener('click', openModal);
document.getElementById('focusButton').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('sessionModal').addEventListener('click', event => { if (event.target.id === 'sessionModal') closeModal(); });
document.getElementById('problemFilter').addEventListener('change', renderProblems);
document.getElementById('sessionForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.sessions.unshift({ topic: form.get('topic'), track: form.get('track'), minutes: Number(form.get('minutes')), note: form.get('note'), date: new Date().toISOString() });
  saveState(); event.currentTarget.reset(); closeModal(); render();
});

render();
