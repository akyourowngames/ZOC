# SYSTEM — ZCO × IOI Field Journal

A local-first preparation tracker for ZCO and IOI, rebuilt from scratch in Next.js. It keeps the gates, dungeons, quests, XP, and evidence model of the original tracker, but presents it as a vintage field journal: aged paper, ink and stamp marks, handwritten margin notes, ruled entry pages, and letterpress controls.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run lint
npm run build
npm start
```

## What is in it

- **Status** — field report with rank seal, level ledger, attribute radar, stat cards, daily and weekly quests, readiness, 16-week heatmap, recent entries, achievements, and workspace evidence.
- **Gates** — seven chapters of checklist gates with search, filters, evidence badges, and chapter progress.
- **Dungeons** — the problem bank with open → attempted → cleared cycling, review flags, custom index cards, and evidence badges.
- **Training log** — ruled journal entries with notes, tags, focus rating, filters, sorting, edit/delete with undo, and CSV export.
- **Live watcher** — a local background daemon watches your workspace for saves, groups them into practice blocks, auto-logs sessions, auto-clears evidenced gates/dungeons, and auto-creates custom dungeons for new problem folders.
- **Analytics** — weekly XP bars, XP source ledger, track donut, difficulty coverage, insights, and the full audit trail.
- **System** — profile and goals, workspace folder/file evidence import, JSON backup, sessions/dungeons CSV, Markdown checklist import, paste import, health check, and reset controls.

The command palette opens with `Ctrl K`; `N` starts a new entry; `/` focuses the current search.

## Live watcher

Start it from **System → Automatic tracking**: add one or more workspace folders (one per line), set the idle window, then press **Start watcher**. The default workspace is the repository root (`..`), which contains the study material. The watcher is a detached Node process, so it keeps running when the tab closes.

You can also start it directly:

```bash
npm run daemon -- --workspace "C:/path/one" --workspace "C:/path/two" --idle 10
```

How it behaves:

- Watches multiple workspace roots and a wide range of code/notes extensions: C/C++, Java/Kotlin, Python, Go, Rust, JS/TS, C#, Swift, Scala, Lua, R, shells, SQL, HTML/CSS, Vue/Svelte, notebooks, Markdown, text, RST, Org, and TeX.
- Files in `.git`, `node_modules`, `js`, `data`, `scripts`, `.next`, and `.daemon` are ignored.
- Reads local file text (capped at 48 KB) only to infer topics, problem titles, tags, and difficulty. The snapshot stores names, paths, sizes, timestamps, and inferred metadata — never file contents, and nothing leaves the machine.
- Groups saves into a block. A new save after the idle window starts a new block. Blocks are logged to the Training log with an **Auto** tag, save counts, and per-file detail.
- Refreshes the evidence snapshot after saves, then automatically clears gates and dungeons with code evidence, enriches or creates custom dungeons, and flags a cleared dungeon for review when its solution is edited again.
- Automatically claims daily and weekly quests once they are complete.
- Writes only to `.daemon/` (git-ignored). If you start the watcher outside the app, use **Link & sync** in System to connect those workspaces to the journal.
- The watcher requires a local Node server (`npm run dev` or `npm start`); it is not available on a static host.

Sessions are logged when the idle window passes, not on every keystroke. Active tracking is visible in the topbar chip and the System watcher panel. Since this watches saves, enable autosave or save regularly while you work. Stop and start the watcher once after upgrading to load the latest daemon code.

## Structure

```
src/
  app/                 App Router entry, fonts, design-system CSS
    api/daemon/        Local watcher status/start/stop and snapshot endpoints
  components/
    charts/            SVG ring, radar, bars, donut, heatmap
    daemon/            Watcher polling, linking, and auto-sync provider
    modals/            Session, problem, and confirm sheets
    shell/             Sidebar, topbar, catalogue, toasts, level-up
    ui/                Shared paper primitives and app UI context
    views/             The six tracker views
  lib/
    data.ts            Static roadmap, problem bank, achievements, quests
    selectors.ts       Pure XP, stats, quests, streaks, evidence, analytics
    state.ts           State shape, defaults, and import normalisation
    store.tsx          Local-first React store and actions
    importExport.ts    CSV, JSON, Markdown, and workspace import/export
    seed.ts            One-time baseline from the old workspace
    daemonTypes.ts     Shared watcher status/session types
scripts/
  workspace-daemon.mjs Detached filesystem watcher and session grouper
```

## Design notes

- Two themes: **Aged paper** (default) and **Archive night**, toggled in System or from the command palette.
- Type: Cormorant Garamond for display, Karla for UI, Caveat for margin notes, Courier Prime for ledger data.
- The paper grain, grids, red margin rules, tape strips, rubber stamps, and scribble underlines are all CSS; no image assets are required.
- Motion is restrained and respects `prefers-reduced-motion` and the profile setting.

## Data

The first load seeds the journal from `src/lib/workspace-snapshot.json`, a read-only baseline snapshot of the study workspace (104 files, 31 code files, 73 notes, 24 problem folders, 2–7 November 2026). Gates and dungeon clears are derived from dated source and note evidence; no study sessions are invented. The seed runs once, merges with any existing progress, and never re-applies after reload. “Reset progress” keeps the evidence but clears derived progress; “Erase everything” restores this baseline.

Everything stays in this browser under the `field-journal-tracker-v1` localStorage key. There is no account and no network request for tracker data. Workspace evidence imports read filenames and modified dates only. Export a JSON backup before clearing site data.
