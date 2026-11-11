export type Theme = 'paper' | 'night';

export type TrackKey = 'foundations' | 'problem-solving' | 'zco' | 'ioi';

export type Difficulty = 'Warm-up' | 'Easy' | 'Practice' | 'Timed Set' | 'Deep Dive';

export type ProblemStatus = 'todo' | 'attempted' | 'solved';

export type StatKey = 'str' | 'int' | 'agi' | 'vit' | 'per';

export type IconName =
  | 'status'
  | 'gate'
  | 'sword'
  | 'log'
  | 'analytics'
  | 'system'
  | 'plus'
  | 'search'
  | 'close'
  | 'arrow'
  | 'check'
  | 'chevron'
  | 'menu'
  | 'edit'
  | 'trash'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'spark'
  | 'target'
  | 'clock'
  | 'flame'
  | 'star'
  | 'hourglass'
  | 'book'
  | 'crown'
  | 'sun'
  | 'moon'
  | 'scroll'
  | 'quill'
  | 'shield'
  | 'skull'
  | 'diamond'
  | 'circle'
  | 'half'
  | 'checkCircle'
  | 'folder'
  | 'list'
  | 'card'
  | 'stamp'
  | 'sound'
  | 'mute'
  | 'help';

export type AchievementType =
  | 'sessions'
  | 'solved'
  | 'problemSolved'
  | 'topics'
  | 'chapter'
  | 'chapters'
  | 'streak'
  | 'minutes'
  | 'timedMinutes'
  | 'level'
  | 'evidenceCode'
  | 'evidenceDocs'
  | 'review'
  | 'questsClaimed'
  | 'xp'
  | 'nightOwl'
  | 'earlyBird';

export type MetricKey =
  | 'todayMinutes'
  | 'todaySessions'
  | 'todayNotes'
  | 'todaySolved'
  | 'todayTopics'
  | 'streak'
  | 'weekSessions'
  | 'weekMinutes'
  | 'weekSolved'
  | 'weekTopics'
  | 'weekActiveDays';

export interface Rank {
  min: number;
  letter: string;
  name: string;
  title: string;
  color: string;
}

export interface HunterClass {
  id: string;
  stat: StatKey;
  name: string;
  desc: string;
}

export interface StatDef {
  id: StatKey;
  short: string;
  name: string;
  desc: string;
}

export interface Topic {
  id: string;
  name: string;
  xp: number;
  desc: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  rank: string;
  icon: IconName;
  color: string;
  description: string;
  topics: Topic[];
}

export interface Problem {
  id: string;
  number: number;
  title: string;
  folder: string | null;
  track: TrackKey;
  difficulty: Difficulty;
  tags: string[];
  desc: string;
  custom?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  xp: number;
  type: AchievementType;
  target: number | string;
}

export interface Quest {
  id: string;
  label: string;
  desc: string;
  metric: MetricKey;
  target: number;
  xp: number;
  icon: IconName;
}

export interface Session {
  id: string;
  date: string;
  topic: string;
  track: TrackKey;
  minutes: number;
  note: string;
  tags: string[];
  focus: number;
  problemId: string | null;
  createdAt: string;
  source?: 'manual' | 'watcher';
}

export interface ProblemRecord {
  status: ProblemStatus;
  review: boolean;
  attempts: number;
  solvedAt: string | null;
  attemptedAt: string | null;
  notes: string;
}

export interface EvidenceFile {
  path: string;
  name: string;
  kind: 'code' | 'doc';
  size: number;
  date: string;
  dateKey: string;
  category: string;
  problemId: string | null;
  solution: boolean;
  role: string;
  root?: string;
  topics?: string[];
}

export interface EvidenceDay {
  date: string;
  dateKey: string;
  files: number;
  code: number;
  docs: number;
  problems: string[];
  label: string;
}

export interface Snapshot {
  generatedAt: string | null;
  source: string;
  note: string;
  totals: {
    files: number;
    code: number;
    docs: number;
    problems: number;
    days: number;
  };
  days: EvidenceDay[];
  files: EvidenceFile[];
  problemMeta?: Record<string, { title?: string; difficulty?: string; tags?: string[] }>;
}

export interface Settings {
  theme: Theme;
  reduceMotion: boolean;
  weekStart: 0 | 1;
  sound: boolean;
}

export interface SystemState {
  version: number;
  createdAt: string;
  profile: {
    name: string;
    goalMinutesPerWeek: number;
    dailyXpGoal: number;
  };
  completedTopics: string[];
  topicCompletedAt: Record<string, string>;
  problems: Record<string, ProblemRecord>;
  customProblems: Problem[];
  sessions: Session[];
  achievements: Record<string, string>;
  quests: Record<string, { daily?: string[]; weekly?: string[] }>;
  evidence: {
    snapshot: Snapshot;
    importedAt: string | null;
    source: string;
  };
  settings: Settings;
  meta: {
    lastKnownLevel: number | null;
    lastKnownXp: number;
    lastVisit: string;
    updatedAt: string;
    initialized: boolean;
    seeded: boolean;
    seedVersion: number;
    soundMigrated?: boolean;
    daemonCursor?: string;
    workspaceVersion?: string;
    migratedFrom?: string;
  };
}

export interface Player {
  xp: number;
  level: number;
  current: number;
  next: number;
  into: number;
  needed: number;
  percent: number;
  rank: Rank;
  cls: HunterClass;
  stats: Record<StatKey, number>;
  power: number;
  title: string;
  subtitle: string;
}

export interface QuestProgress {
  value: number;
  target: number;
  percent: number;
  complete: boolean;
  claimed: boolean;
  key: string;
}

export interface XpItem {
  key: string;
  label: string;
  xp: number;
  detail: string;
}

export interface LevelUpInfo {
  from: number;
  to: number;
  rank: Rank;
  previousRank: Rank;
}
