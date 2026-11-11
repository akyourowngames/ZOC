import type {
  Achievement,
  Chapter,
  Difficulty,
  HunterClass,
  IconName,
  Problem,
  Quest,
  Rank,
  StatDef,
  Topic,
  TrackKey
} from './types';

export const APP = {
  name: 'SYSTEM',
  tagline: 'ZCO × IOI Field Journal',
  volume: 'Vol. III',
  version: 4,
  storageKey: 'field-journal-tracker-v1'
} as const;

export const RANKS: Rank[] = [
  { min: 50, letter: 'M', name: 'Monarch', title: 'Shadow Monarch', color: '#9a7b5a' },
  { min: 40, letter: 'N', name: 'National Level', title: 'National Level Hunter', color: '#b5523b' },
  { min: 30, letter: 'S', name: 'S-Rank', title: 'S-Rank Hunter', color: '#96322c' },
  { min: 20, letter: 'A', name: 'A-Rank', title: 'Ace Hunter', color: '#ac7a26' },
  { min: 15, letter: 'B', name: 'B-Rank', title: 'Elite Hunter', color: '#7a6593' },
  { min: 10, letter: 'C', name: 'C-Rank', title: 'Gate Raider', color: '#4f7188' },
  { min: 5, letter: 'D', name: 'D-Rank', title: 'Dungeon Runner', color: '#6f7c52' },
  { min: 1, letter: 'E', name: 'E-Rank', title: 'Awakened', color: '#8c816f' }
];

export const CLASSES: HunterClass[] = [
  { id: 'strategist', stat: 'int', name: 'Strategist', desc: 'Knowledge and pattern recognition lead your build.' },
  { id: 'berserker', stat: 'str', name: 'Berserker', desc: 'Raw problem volume and hard clears define you.' },
  { id: 'assassin', stat: 'agi', name: 'Assassin', desc: 'Timed pressure and contest speed are your weapons.' },
  { id: 'guardian', stat: 'vit', name: 'Guardian', desc: 'Consistency and streaks are your armour.' },
  { id: 'archivist', stat: 'per', name: 'Archivist', desc: 'Notes, docs, and review keep your archive sharp.' }
];

export const STATS: StatDef[] = [
  { id: 'str', short: 'STR', name: 'Strength', desc: 'Weighted problem clears' },
  { id: 'int', short: 'INT', name: 'Intelligence', desc: 'Gates and concepts completed' },
  { id: 'agi', short: 'AGI', name: 'Agility', desc: 'Timed and contest practice' },
  { id: 'vit', short: 'VIT', name: 'Vitality', desc: 'Streaks and active days' },
  { id: 'per', short: 'PER', name: 'Perception', desc: 'Documentation and review' }
];

export const STAT_COLORS: Record<StatDef['id'], string> = {
  str: '#96322c',
  int: '#4f7188',
  agi: '#6f7c52',
  vit: '#ac7a26',
  per: '#7a6593'
};

export const DIFFICULTIES: Record<Difficulty, { xp: number; color: string; order: number }> = {
  'Warm-up': { xp: 60, color: '#6f7c52', order: 1 },
  Easy: { xp: 90, color: '#4f7188', order: 2 },
  Practice: { xp: 120, color: '#7a6593', order: 3 },
  'Timed Set': { xp: 250, color: '#ac7a26', order: 4 },
  'Deep Dive': { xp: 300, color: '#96322c', order: 5 }
};

export const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES) as Difficulty[];

export const TRACKS: Record<TrackKey, { name: string; color: string; icon: IconName }> = {
  foundations: { name: 'Foundations', color: '#4f7188', icon: 'diamond' },
  'problem-solving': { name: 'Problem Solving', color: '#7a6593', icon: 'sword' },
  zco: { name: 'ZCO', color: '#ac7a26', icon: 'spark' },
  ioi: { name: 'IOI', color: '#96322c', icon: 'crown' }
};

export const TRACK_KEYS = Object.keys(TRACKS) as TrackKey[];

export const CHAPTERS: Chapter[] = [
  {
    id: 'awakening',
    title: 'Awakening',
    subtitle: 'C++ Foundations',
    rank: 'E',
    icon: 'diamond',
    color: '#4f7188',
    description: 'The first gate. Build syntax, control flow, and the confidence to compile without fear.',
    topics: [
      { id: 'environment', name: 'Environment & first program', xp: 60, desc: 'Compiler, build tasks, and your first working binary.' },
      { id: 'variables-output', name: 'Variables and output', xp: 80, desc: 'Types, declarations, and clean competitive output.' },
      { id: 'input-arithmetic', name: 'Input and arithmetic', xp: 80, desc: 'Read values, compute, and avoid overflow traps.' },
      { id: 'type-conversion', name: 'Type conversion', xp: 90, desc: 'Implicit and explicit casts, integer division, precision.' },
      { id: 'conditions', name: 'Conditions', xp: 100, desc: 'Branching, comparison chains, and edge cases.' },
      { id: 'operators', name: 'Logical and bitwise operators', xp: 120, desc: 'Short-circuit logic, masks, and bit tricks.' },
      { id: 'loops', name: 'Loops', xp: 140, desc: 'for, while, nested loops, and loop invariants.' },
      { id: 'functions', name: 'Functions', xp: 140, desc: 'Parameters, return values, references, and scope.' },
      { id: 'arrays-strings', name: 'Arrays and strings', xp: 160, desc: 'Indexing, traversal, char handling, and boundaries.' },
      { id: 'debugging', name: 'Debugging & complexity', xp: 180, desc: 'Read errors, trace logic, and estimate Big-O.' }
    ]
  },
  {
    id: 'problem-solving',
    title: 'First Dungeon',
    subtitle: 'Problem-Solving Toolkit',
    rank: 'D',
    icon: 'sword',
    color: '#6f7c52',
    description: 'Stop brute-forcing everything. Learn the reusable weapons that clear most gates.',
    topics: [
      { id: 'stl-essentials', name: 'STL essentials', xp: 200, desc: 'vector, pair, map, set, queue, stack, priority_queue.' },
      { id: 'sorting-searching', name: 'Sorting and searching', xp: 220, desc: 'Comparator design, binary search, and bounds.' },
      { id: 'prefix-sums', name: 'Prefix sums and difference arrays', xp: 240, desc: 'Range queries and range updates in O(1).' },
      { id: 'two-pointers', name: 'Two pointers and sliding window', xp: 240, desc: 'Monotonic windows, subarray counts, and invariants.' },
      { id: 'greedy', name: 'Greedy algorithms', xp: 260, desc: 'Exchange arguments and when greedy actually works.' },
      { id: 'recursion-backtracking', name: 'Recursion and backtracking', xp: 280, desc: 'Search trees, pruning, and state restoration.' },
      { id: 'binary-search-answer', name: 'Binary search on answer', xp: 280, desc: 'Monotone predicates and feasibility checks.' },
      { id: 'number-theory', name: 'Number theory basics', xp: 300, desc: 'Primes, gcd/lcm, modular arithmetic, and sieves.' }
    ]
  },
  {
    id: 'graphs',
    title: 'Blue Gate',
    subtitle: 'Graphs & Trees',
    rank: 'C',
    icon: 'gate',
    color: '#557487',
    description: 'The map opens up. Traverse, connect, and find the shortest route through any dungeon.',
    topics: [
      { id: 'graph-representation', name: 'Graph representation', xp: 320, desc: 'Adjacency lists, edges, directed vs undirected.' },
      { id: 'bfs-dfs', name: 'BFS and DFS', xp: 340, desc: 'Traversal order, layers, and recursion depth.' },
      { id: 'connected-components', name: 'Connected components', xp: 320, desc: 'Flood fill, component counting, and grids.' },
      { id: 'topological-sort', name: 'Topological sort', xp: 340, desc: 'DAG ordering, Kahn\'s algorithm, and cycles.' },
      { id: 'shortest-paths', name: 'Shortest paths', xp: 380, desc: 'Dijkstra, 0-1 BFS, Bellman-Ford, and Floyd-Warshall.' },
      { id: 'dsu', name: 'Disjoint set union', xp: 340, desc: 'Union by size, path compression, and offline queries.' },
      { id: 'trees-lca', name: 'Trees and LCA', xp: 380, desc: 'Rooting, Euler tours, binary lifting, and LCA.' },
      { id: 'mst', name: 'Minimum spanning tree', xp: 340, desc: 'Kruskal, Prim, and cut/cycle properties.' }
    ]
  },
  {
    id: 'dp',
    title: 'Red Gate',
    subtitle: 'Dynamic Programming',
    rank: 'B',
    icon: 'diamond',
    color: '#7a6593',
    description: 'Break the dungeon into states. The hardest gate rewards patience and clean transitions.',
    topics: [
      { id: 'dp-fundamentals', name: 'DP fundamentals', xp: 400, desc: 'State, transition, base cases, and memoisation.' },
      { id: 'knapsack', name: 'Knapsack', xp: 400, desc: '0/1, unbounded, and subset-sum variants.' },
      { id: 'lis', name: 'Longest increasing subsequence', xp: 380, desc: 'O(n²) DP and O(n log n) patience sorting.' },
      { id: 'interval-dp', name: 'Interval DP', xp: 440, desc: 'Range states, merging, and optimal splits.' },
      { id: 'bitmask-dp', name: 'Bitmask DP', xp: 460, desc: 'Subsets, assignment problems, and TSP-style states.' },
      { id: 'tree-dp', name: 'Tree DP', xp: 460, desc: 'Subtree states, rerooting, and independence.' },
      { id: 'digit-dp', name: 'Digit DP', xp: 440, desc: 'Digit constraints, tight flags, and counting.' },
      { id: 'dp-optimization', name: 'DP optimization', xp: 500, desc: 'Prefix sums, divide & conquer, and monotone queues.' }
    ]
  },
  {
    id: 'zco',
    title: 'Red Gate: ZCO',
    subtitle: 'Contest Arena',
    rank: 'A',
    icon: 'spark',
    color: '#ac7a26',
    description: 'Timed implementation under pressure. Accuracy first, then speed.',
    topics: [
      { id: 'zco-implementation', name: 'ZCO pattern: implementation', xp: 480, desc: 'Read constraints, design data, and write bug-free code.' },
      { id: 'zco-greedy', name: 'ZCO pattern: greedy', xp: 480, desc: 'Sorting arguments, scheduling, and exchange proofs.' },
      { id: 'zco-binary-search', name: 'ZCO pattern: binary search', xp: 500, desc: 'Feasibility functions and answer-space search.' },
      { id: 'zco-graphs', name: 'ZCO pattern: graphs', xp: 520, desc: 'Grid BFS, components, and shortest paths.' },
      { id: 'zco-dp', name: 'ZCO pattern: DP', xp: 540, desc: 'Recognise overlapping subproblems quickly.' },
      { id: 'zco-timed-1', name: 'Timed ZCO set 01', xp: 600, desc: 'Full paper under exam conditions.' },
      { id: 'zco-timed-2', name: 'Timed ZCO set 02', xp: 600, desc: 'Second paper; compare accuracy and pacing.' },
      { id: 'zco-editorial', name: 'ZCO editorial review', xp: 420, desc: 'Extract patterns from every mistake.' }
    ]
  },
  {
    id: 'ioi',
    title: 'Monarch\'s Gate',
    subtitle: 'IOI Depth',
    rank: 'S',
    icon: 'crown',
    color: '#96322c',
    description: 'The final gate. Subtasks, advanced structures, and proof-level thinking.',
    topics: [
      { id: 'ioi-subtasks', name: 'IOI subtask strategy', xp: 560, desc: 'Partial scoring, constraints, and safe baselines.' },
      { id: 'ioi-interactive', name: 'Interactive problems', xp: 640, desc: 'Adaptive queries, flushing, and query budgets.' },
      { id: 'segment-tree', name: 'Segment tree & Fenwick', xp: 600, desc: 'Range queries, lazy propagation, and BIT tricks.' },
      { id: 'hld', name: 'Heavy-light decomposition', xp: 660, desc: 'Path queries and subtree updates.' },
      { id: 'convex-hull-trick', name: 'Convex hull trick', xp: 680, desc: 'Line containers and monotone optimisation.' },
      { id: 'flow-matching', name: 'Flow & matching', xp: 700, desc: 'Max-flow models, bipartite matching, and cuts.' },
      { id: 'ioi-full-problem', name: 'IOI-style full problem', xp: 800, desc: 'One complete problem with all subtasks.' }
    ]
  },
  {
    id: 'mastery',
    title: 'Shadow Army',
    subtitle: 'Review & Mastery',
    rank: 'S',
    icon: 'skull',
    color: '#7d6b52',
    description: 'Your cleared dungeons become soldiers. Review, re-solve, and teach to make it permanent.',
    topics: [
      { id: 'mistake-log', name: 'Mistake log review', xp: 300, desc: 'Re-read every trap and edge case you recorded.' },
      { id: 're-solve', name: 'Re-solve 3 old problems', xp: 400, desc: 'No hints. Compare against your first solution.' },
      { id: 'write-editorial', name: 'Write an editorial', xp: 380, desc: 'Explain the idea, proof, complexity, and traps.' },
      { id: 'teach-concept', name: 'Teach a concept', xp: 360, desc: 'Explain a gate out loud or in a note.' },
      { id: 'mock-contest', name: 'Mock contest', xp: 600, desc: 'Two hours, no interruptions, real scoring.' },
      { id: 'weak-topic-audit', name: 'Weak-topic audit', xp: 320, desc: 'Rank every gate by confidence and attack the worst.' }
    ]
  }
];

export const PROBLEMS: Problem[] = [
  { id: 'basic-input', number: 1, title: 'Basic Input and Arithmetic', folder: '01-basic-input-and-arithmetic', track: 'foundations', difficulty: 'Warm-up', tags: ['I/O', 'arithmetic', 'overflow'], desc: 'Read values, compute with correct types, and print judge-ready output.' },
  { id: 'mid-arithmetic', number: 2, title: 'Last Digits and Remainders', folder: '02-mid-input-and-arithmetic', track: 'foundations', difficulty: 'Warm-up', tags: ['modulo', 'arithmetic'], desc: 'Use remainders and last digits without overflow surprises.' },
  { id: 'even-odd', number: 3, title: 'Even or Odd', folder: '03-even-odd-if-else', track: 'foundations', difficulty: 'Warm-up', tags: ['conditions'], desc: 'Branch on parity and handle negative inputs correctly.' },
  { id: 'greater-number', number: 4, title: 'Greater of Two Numbers', folder: '04-greater-number', track: 'foundations', difficulty: 'Warm-up', tags: ['conditions'], desc: 'Compare two values and print the larger one.' },
  { id: 'divisibility', number: 5, title: 'Divisibility Test', folder: '05-divisibility-test', track: 'foundations', difficulty: 'Warm-up', tags: ['conditions', 'modulo'], desc: 'Check divisibility without floating point.' },
  { id: 'maximum-three', number: 6, title: 'Maximum of Three Numbers', folder: '06-Maximum-of-three', track: 'foundations', difficulty: 'Warm-up', tags: ['conditions'], desc: 'Find the maximum with nested or combined comparisons.' },
  { id: 'middle-number', number: 7, title: 'The Middle Number', folder: '07-the-middle-number', track: 'foundations', difficulty: 'Warm-up', tags: ['conditions', 'sorting'], desc: 'Identify the median of three values.' },
  { id: 'swapping-values', number: 8, title: 'Swapping Two Values', folder: '08-swapping-values', track: 'foundations', difficulty: 'Easy', tags: ['variables', 'references'], desc: 'Swap with a temporary variable and with std::swap.' },
  { id: 'digit-extractor', number: 9, title: 'Extract the Last Digits', folder: '09-Digit-Extractor', track: 'problem-solving', difficulty: 'Easy', tags: ['digits', 'modulo'], desc: 'Peel digits with % 10 and / 10.' },
  { id: 'sum-challenge', number: 10, title: 'Sum from Zero to N', folder: '10-sum-challenge', track: 'problem-solving', difficulty: 'Easy', tags: ['loops', 'formula'], desc: 'Compare a loop with the closed-form sum.' },
  { id: 'factorial', number: 11, title: 'Factorial', folder: '11-factorial', track: 'problem-solving', difficulty: 'Easy', tags: ['loops', 'overflow'], desc: 'Compute factorials and understand when they explode.' },
  { id: 'sum-of-n-factorials', number: 12, title: 'Sum of the First N Factorials', folder: '12-Sum-of-n-factorials', track: 'problem-solving', difficulty: 'Practice', tags: ['loops', 'accumulation'], desc: 'Accumulate factorials without recomputing from scratch.' },
  { id: 'sum-of-even-numbers', number: 13, title: 'Sum of Even Numbers up to N', folder: '13-sum-of-even-numbers', track: 'problem-solving', difficulty: 'Practice', tags: ['loops', 'arithmetic'], desc: 'Filter, accumulate, and verify with a formula.' },
  { id: 'number-of-even-numbers', number: 14, title: 'Count Even Numbers up to N', folder: '14-number-of-even-numbers', track: 'problem-solving', difficulty: 'Practice', tags: ['loops', 'counting'], desc: 'Count with a loop and with integer division.' },
  { id: 'total-digits', number: 15, title: 'Count the Digits', folder: '15-total-digits-in-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'loops'], desc: 'Count digits with division and handle zero.' },
  { id: 'sum-of-digits', number: 16, title: 'Sum of Digits', folder: '16-sum-of-digits-of-a-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'loops'], desc: 'Accumulate digit sums and handle negatives.' },
  { id: 'product-of-digits', number: 17, title: 'Product of Digits', folder: '17-product-of-digit-of-a-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'loops'], desc: 'Multiply digits and watch for zeros.' },
  { id: 'reverse-number', number: 18, title: 'Number Palindrome Check', folder: '18-reverse-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'palindrome'], desc: 'Reverse a number and compare it to the original.' },
  { id: 'largest-digit', number: 19, title: 'Largest Digit', folder: '19-largest-digit-in-a-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'max'], desc: 'Track the maximum while scanning digits.' },
  { id: 'smallest-digit', number: 20, title: 'Smallest Digit', folder: '20-smallest-digit-in-a-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'min'], desc: 'Track the minimum while scanning digits.' },
  { id: 'digit-occurrence', number: 21, title: 'Check Whether a Number Contains Zero', folder: '21-occurence-of-digits-in-a-number', track: 'problem-solving', difficulty: 'Practice', tags: ['digits', 'flag'], desc: 'Use a flag for existence; use a counter for occurrences.' },
  { id: 'zco-simulation', number: 22, title: 'ZCO Timed Simulation', folder: null, track: 'zco', difficulty: 'Timed Set', tags: ['contest', 'timed', 'implementation'], desc: 'A full ZCO paper under exam conditions. Score it honestly.' },
  { id: 'ioi-subtasks', number: 23, title: 'IOI Subtask Drill', folder: null, track: 'ioi', difficulty: 'Deep Dive', tags: ['subtasks', 'contest'], desc: 'Take one IOI task and harvest every subtask you can.' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-session', title: 'First Entry', desc: 'Log your first study session.', icon: 'clock', xp: 100, type: 'sessions', target: 1 },
  { id: 'first-clear', title: 'First Blood', desc: 'Clear your first dungeon.', icon: 'sword', xp: 150, type: 'solved', target: 1 },
  { id: 'ten-clears', title: 'Dungeon Breaker', desc: 'Clear 10 dungeons.', icon: 'skull', xp: 300, type: 'solved', target: 10 },
  { id: 'problem-solver', title: 'Problem Solver', desc: 'Clear 5 problem-bank dungeons.', icon: 'spark', xp: 250, type: 'problemSolved', target: 5 },
  { id: 'foundation-builder', title: 'Foundation Builder', desc: 'Complete 5 gates.', icon: 'diamond', xp: 150, type: 'topics', target: 5 },
  { id: 'awakened', title: 'Awakened', desc: 'Complete the Awakening chapter.', icon: 'circle', xp: 400, type: 'chapter', target: 'awakening' },
  { id: 'gatekeeper', title: 'Gatekeeper', desc: 'Complete 3 chapters.', icon: 'gate', xp: 600, type: 'chapters', target: 3 },
  { id: 'zco-ready', title: 'ZCO Ready', desc: 'Complete the ZCO contest chapter.', icon: 'spark', xp: 800, type: 'chapter', target: 'zco' },
  { id: 'ioi-contender', title: 'IOI Contender', desc: 'Complete the IOI chapter.', icon: 'crown', xp: 1200, type: 'chapter', target: 'ioi' },
  { id: 'consistent-3', title: 'On a Roll', desc: 'Keep a 3-day streak.', icon: 'flame', xp: 150, type: 'streak', target: 3 },
  { id: 'consistent-7', title: 'One Week Chain', desc: 'Keep a 7-day streak.', icon: 'flame', xp: 300, type: 'streak', target: 7 },
  { id: 'consistent-30', title: 'Unbroken', desc: 'Keep a 30-day streak.', icon: 'shield', xp: 1000, type: 'streak', target: 30 },
  { id: 'minutes-300', title: 'Five Hours In', desc: 'Log 300 focused minutes.', icon: 'hourglass', xp: 200, type: 'minutes', target: 300 },
  { id: 'minutes-1000', title: 'Deep Work', desc: 'Log 1,000 focused minutes.', icon: 'hourglass', xp: 400, type: 'minutes', target: 1000 },
  { id: 'timed-120', title: 'Clockwork', desc: 'Log 120 minutes of ZCO/IOI timed practice.', icon: 'clock', xp: 250, type: 'timedMinutes', target: 120 },
  { id: 'level-5', title: 'D-Rank', desc: 'Reach level 5.', icon: 'star', xp: 200, type: 'level', target: 5 },
  { id: 'level-10', title: 'C-Rank', desc: 'Reach level 10.', icon: 'star', xp: 400, type: 'level', target: 10 },
  { id: 'level-20', title: 'A-Rank', desc: 'Reach level 20.', icon: 'star', xp: 800, type: 'level', target: 20 },
  { id: 'level-30', title: 'S-Rank', desc: 'Reach level 30.', icon: 'crown', xp: 1500, type: 'level', target: 30 },
  { id: 'evidence-25', title: 'File Builder', desc: 'Track 25 source files.', icon: 'folder', xp: 200, type: 'evidenceCode', target: 25 },
  { id: 'evidence-50', title: 'Code Arsenal', desc: 'Track 50 source files.', icon: 'folder', xp: 300, type: 'evidenceCode', target: 50 },
  { id: 'documented-10', title: 'Chronicler', desc: 'Track 10 notes/docs.', icon: 'book', xp: 200, type: 'evidenceDocs', target: 10 },
  { id: 'documented-50', title: 'Living Library', desc: 'Track 50 notes/docs.', icon: 'book', xp: 400, type: 'evidenceDocs', target: 50 },
  { id: 'reviewer', title: 'Reviewer', desc: 'Flag 3 dungeons for review.', icon: 'refresh', xp: 150, type: 'review', target: 3 },
  { id: 'quest-10', title: 'Quest Hunter', desc: 'Claim 10 daily or weekly quests.', icon: 'check', xp: 300, type: 'questsClaimed', target: 10 },
  { id: 'xp-5000', title: 'XP Hunter', desc: 'Earn 5,000 total XP.', icon: 'star', xp: 500, type: 'xp', target: 5000 },
  { id: 'xp-20000', title: 'Monarch\'s Candidate', desc: 'Earn 20,000 total XP.', icon: 'crown', xp: 1000, type: 'xp', target: 20000 },
  { id: 'night-owl', title: 'Night Owl', desc: 'Log a session after 10 PM.', icon: 'moon', xp: 100, type: 'nightOwl', target: 1 },
  { id: 'early-bird', title: 'Early Bird', desc: 'Log a session before 7 AM.', icon: 'sun', xp: 100, type: 'earlyBird', target: 1 }
];

export const DAILY_QUESTS: Quest[] = [
  { id: 'train-45', label: 'Train for 45 minutes', desc: 'Log at least 45 focused minutes today.', metric: 'todayMinutes', target: 45, xp: 80, icon: 'clock' },
  { id: 'clear-one', label: 'Clear one dungeon', desc: 'Mark one problem cleared today.', metric: 'todaySolved', target: 1, xp: 100, icon: 'sword' },
  { id: 'learn-one', label: 'Complete one gate', desc: 'Finish one roadmap topic today.', metric: 'todayTopics', target: 1, xp: 90, icon: 'gate' },
  { id: 'write-note', label: 'Write a session note', desc: 'Log a session with a useful note.', metric: 'todayNotes', target: 1, xp: 60, icon: 'quill' },
  { id: 'keep-chain', label: 'Keep the chain alive', desc: 'Stay active today to protect your streak.', metric: 'streak', target: 1, xp: 40, icon: 'flame' }
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: 'week-sessions', label: 'Five training sessions', desc: 'Log 5 sessions this week.', metric: 'weekSessions', target: 5, xp: 250, icon: 'log' },
  { id: 'week-minutes', label: 'Four hours of focus', desc: 'Log 240 focused minutes this week.', metric: 'weekMinutes', target: 240, xp: 300, icon: 'hourglass' },
  { id: 'week-clears', label: 'Clear three dungeons', desc: 'Mark 3 problems cleared this week.', metric: 'weekSolved', target: 3, xp: 350, icon: 'sword' },
  { id: 'week-gates', label: 'Complete four gates', desc: 'Finish 4 roadmap topics this week.', metric: 'weekTopics', target: 4, xp: 300, icon: 'gate' },
  { id: 'week-days', label: 'Train on five days', desc: 'Be active on 5 different days.', metric: 'weekActiveDays', target: 5, xp: 400, icon: 'flame' }
];

export const EVIDENCE_TOPIC_RULES: { match: RegExp; topicId: string }[] = [
  { match: /01-variables-and-output/i, topicId: 'variables-output' },
  { match: /02-input-and-sum/i, topicId: 'input-arithmetic' },
  { match: /03-typecasting/i, topicId: 'type-conversion' },
  { match: /04-if-else/i, topicId: 'conditions' },
  { match: /05-bitwise-operators|06-logical-operators/i, topicId: 'operators' },
  { match: /07-for-loops/i, topicId: 'loops' },
  { match: /01-data-types-and-basics/i, topicId: 'variables-output' },
  { match: /01-data-types-and-basics/i, topicId: 'type-conversion' },
  { match: /02-operators/i, topicId: 'operators' }
];

export const LEGACY_TOPIC_MAP: Record<string, string> = {
  'Variables and output': 'variables-output',
  'Input and arithmetic': 'input-arithmetic',
  'Type conversion': 'type-conversion',
  Conditions: 'conditions',
  'Logical and bitwise operators': 'operators',
  Loops: 'loops',
  Functions: 'functions',
  'Arrays and strings': 'arrays-strings',
  'STL essentials': 'stl-essentials',
  'Sorting and searching': 'sorting-searching',
  'Prefix sums and difference arrays': 'prefix-sums',
  'Two pointers and sliding window': 'two-pointers',
  'Greedy algorithms': 'greedy',
  'Recursion and backtracking': 'recursion-backtracking',
  'Graph traversal': 'bfs-dfs',
  'Dynamic programming': 'dp-fundamentals',
  'Number theory': 'number-theory'
};

export const QUOTES = [
  'The System does not reward excuses.',
  'A hunter grows fastest at the edge of failure.',
  'Clear one gate. Then clear the next.',
  'Your notes are the shadow army you leave behind.',
  'Weakness is a quest, not a verdict.',
  'The dungeon is the same size for everyone. Prepare better.',
  'Small sessions, repeated, become monstrous.',
  'Arise.'
];

export const TOPIC_INDEX = (() => {
  const index = new Map<string, Topic & { chapterId: string; chapterTitle: string; rank: string; color: string }>();
  CHAPTERS.forEach((chapter) => {
    chapter.topics.forEach((topic) => {
      index.set(topic.id, {
        ...topic,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        rank: chapter.rank,
        color: chapter.color
      });
    });
  });
  return index;
})();

export const PROBLEM_INDEX = new Map<string, Problem>(PROBLEMS.map((problem) => [problem.id, problem]));

export const ALL_TOPICS = [...TOPIC_INDEX.values()];

export const TOPIC_XP_TOTAL = ALL_TOPICS.reduce((sum, topic) => sum + topic.xp, 0);

export function difficultyXp(difficulty: Difficulty): number {
  return DIFFICULTIES[difficulty]?.xp ?? 100;
}

export function rankForLevel(level: number): Rank {
  return RANKS.find((rank) => level >= rank.min) ?? RANKS[RANKS.length - 1];
}

export function classForStats(stats: Record<string, number>): HunterClass {
  let best = CLASSES[0];
  CLASSES.forEach((entry) => {
    if ((stats[entry.stat] || 0) > (stats[best.stat] || 0)) best = entry;
  });
  return best;
}
