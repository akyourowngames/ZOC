# SYSTEM — ZCO × IOI Hunter Tracker

> This is the manual for the local progress tracker. For the curriculum and how
> to study, start with [README.md](./README.md).

A local-first, Solo Leveling–style preparation tracker for ZCO and IOI. It turns the C++ workspace into a hunter status window: gates, dungeons, ranks, stats, quests, achievements, streaks, and an evidence-aware view of the files already on disk.

No server, build step, or account is required. Open [`index.html`](./index.html) in a modern browser.

## Quick start

1. Open `index.html` directly from disk.
2. Start with **Status** to see your hunter, level, rank, stats, quests, and next gates.
3. Use **Gates** to clear roadmap topics, **Dungeons** for problems, and **Training log** for focused sessions.
4. Use **Analytics** for XP sources and pace, and **System** for profile, imports, backups, and evidence.
5. Press `Ctrl/Cmd + K` for the command palette, `N` for a new session, and `/` to focus the current search.

Progress is stored in `localStorage` under `sl-system-tracker-v3`. The older `zco-ioi-prep-tracker-v1` and `sl-system-tracker-v2` keys are migrated automatically.

## What is tracked

- **Gates** — 55 roadmap topics across 7 chapters, each with its own XP reward.
- **Dungeons** — 23 built-in problems plus unlimited custom dungeons. Each cycles through open → attempted → cleared, with a separate review flag.
- **Training log** — sessions with minutes, focus, tags, notes, track, and an optional linked dungeon.
- **Quests** — 5 daily and 5 weekly directives with claimable XP.
- **Achievements** — 29 automatic unlocks based on sessions, clears, gates, streaks, evidence, quests, and level.
- **Ranks and titles** — E through Monarch, plus a class derived from your strongest stat.
- **Stats** — STR, INT, AGI, VIT, and PER are recalculated from real activity.
- **Evidence** — a read-only snapshot of `.cpp` and `.md` files, shown as badges and workspace XP.

## XP model

XP is intentionally itemized, so the Analytics ledger always explains the total.

| Source | XP |
| --- | --- |
| Focus session | 1 XP per minute, capped at 180, plus 10 for a note |
| Gate | Per-topic XP from the roadmap |
| Dungeon clear | 60 / 90 / 120 / 250 / 300 by difficulty |
| Workspace evidence | 20 per code file, 5 per doc/note |
| Quest | Per-quest reward when claimed |
| Achievement | Per-achievement reward when unlocked |

Levels use `80 × (level − 1)²` total XP, so early levels move quickly and later levels require sustained work. Ranks are based on level.

File existence is **evidence**, not proof of mastery. Evidence badges and workspace XP update automatically, but clearing a gate or dungeon remains an explicit user action. The System view offers one-click **Apply evidenced gates** and **Clear evidenced dungeons** actions when you want to convert evidence into progress.

## Importing data

Open **System → Import** for all import paths:

- **JSON backup** — merge a full backup, or use **Replace from JSON** to overwrite local progress after confirmation.
- **Sessions CSV** — columns: `date`, `topic`, `track`, `minutes`, `note`, `tags`. Dates may be `YYYY-MM-DD` or ISO. Tags with commas must be quoted.
- **Markdown checklist** — reads `- [x]` items and completes matching gates; unchecked items are ignored. [`ROADMAP.md`](./ROADMAP.md) is a ready-to-import checklist with the five covered foundation gates pre-checked.
- **Workspace folder** — select the workspace root; the browser reads filenames, sizes, and modified dates for `.cpp` and `.md` files. This replaces the evidence snapshot so it reflects the selected folder exactly. Nothing is uploaded.
- **Workspace files** — select individual source/note files when a full folder picker is inconvenient; these are merged into the current snapshot.
- **Paste** — paste JSON, sessions CSV, or a Markdown checklist directly into the text box.

Backup merges and session imports are idempotent: duplicate sessions with the same date, topic, and minutes are skipped. **Replace from JSON** is destructive and asks for confirmation first. Export a JSON backup before replacing.

## Workspace evidence snapshot

A browser page opened from disk cannot inspect future filesystem changes. The shipped snapshot lives in [`js/workspace.js`](./js/workspace.js) and is mirrored in [`data/workspace-snapshot.json`](./data/workspace-snapshot.json).

Regenerate it after adding or editing files:

```bash
node scripts/build-workspace-snapshot.mjs
# or, if you prefer npm scripts:
npm run snapshot
```

The snapshot records file paths, kinds, sizes, modified dates, problem folders, and active days. `99-build-artifacts/`, hidden folders, `node_modules/`, and the tracker's own code are excluded. To refresh evidence without regenerating the snapshot, import the workspace folder from the System view at runtime.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Open or close the command palette |
| `N` | Log a new session |
| `/` | Focus the search field for the current view |
| `↑` / `↓` | Move through palette results |
| `Enter` | Run the selected palette action |
| `Esc` | Close a modal, palette, or the mobile sidebar |

## Views

- **Status** — hunter card, radar, stat cards, daily/weekly quests, next gates, readiness, heatmap, recent sessions, achievements, workspace activity.
- **Gates** — searchable, filterable, collapsible chapters with evidence badges.
- **Dungeons** — summary counters, filters, compact mode, review queue, custom dungeons, and evidence badges.
- **Training log** — session summary, filters, sorting, edit, delete with undo, CSV export.
- **Analytics** — 8-week XP momentum, XP sources, track split, difficulty coverage, insights, and a full XP ledger.
- **System** — profile and goals, theme, evidence snapshot, imports, exports, health check, reset controls.

## Folder map

- `01-foundations/` — lessons, notes, and small C++ experiments
- `02-problem-solving/` — reusable problem-solving practice
- `03-contests/zco/` — ZCO-specific practice and solutions
- `03-contests/ioi/` — IOI-specific practice and solutions
- `04-reference/` — algorithms, STL, complexity, and templates
- `99-build-artifacts/` — generated `.exe`, `.obj`, `.pdb`, and similar files
- `js/` — tracker data, store, charts, UI, and generated workspace snapshot
- `scripts/` — snapshot generator
- `data/` — human-readable snapshot copy
- `app.js` — legacy v1 tracker kept for reference; it is not loaded by the current app

## Naming convention

- Notes: `NN-topic.md`
- C++ practice: `NN-short-description.cpp`
- Contest solutions: `year-contest-problem.cpp`

Keep source code and notes in the numbered learning folders. Build artifacts belong only in `99-build-artifacts/`.

## Suggested study order

1. Variables, data types, input/output, and type conversion
2. Conditions, loops, functions, and debugging
3. Arrays, strings, vectors, pairs, and sorting
4. Prefix sums, two pointers, binary search, and greedy methods
5. Recursion, backtracking, graphs, dynamic programming, and number theory
6. Timed ZCO practice, then IOI-style problems and editorials

## Data safety

- Everything is local to the browser profile.
- Clearing site data erases progress; download a JSON backup regularly.
- **Reset progress** keeps your profile, settings, custom dungeons, and workspace evidence.
- **Erase all data** deletes local tracker data and restores the shipped workspace snapshot.
