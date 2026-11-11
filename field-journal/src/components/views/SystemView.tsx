'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { useDaemon } from '@/components/daemon/DaemonProvider';
import { useAppUI } from '@/components/ui/app-ui';
import { PageIntro, Sheet, SheetHead } from '@/components/ui/Bits';
import { ACHIEVEMENTS, ALL_TOPICS } from '@/lib/data';
import { dateKey, relativeDate, timeOf } from '@/lib/dates';
import { downloadFile } from '@/lib/importExport';
import { playSfx } from '@/lib/sfx';
import {
  allProblems,
  evidenceForProblem,
  evidenceXp,
  formatBytes,
  problemRecord,
  snapshot,
  solvedCount,
  storageBytes,
  questsClaimedCount
} from '@/lib/selectors';
import { useTracker } from '@/lib/store';

export function SystemView() {
  const { state, actions } = useTracker();
  const ui = useAppUI();
  const daemon = useDaemon();
  const snapshotValue = snapshot(state);
  const totals = snapshotValue.totals || { files: 0, code: 0, docs: 0, problems: 0, days: 0 };
  const folderRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState('');

  useEffect(() => {
    folderRef.current?.setAttribute('webkitdirectory', '');
  }, []);

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    actions.saveProfile(
      {
        name: String(data.get('name') || ''),
        goalMinutesPerWeek: Number(data.get('goalMinutesPerWeek')),
        dailyXpGoal: Number(data.get('dailyXpGoal'))
      },
      {
        weekStart: Number(data.get('weekStart')) === 0 ? 0 : 1,
        theme: data.get('theme') === 'night' ? 'night' : 'paper',
        reduceMotion: data.get('reduceMotion') !== null,
        sound: data.get('sound') !== null
      }
    );
  };

  const startWatcher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const workspaces = String(data.get('workspaces') || '')
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
    const idleMinutes = Number(data.get('idleMinutes')) || 10;
    if (!workspaces.length) {
      actions.pushToast('Add at least one workspace folder.', 'error');
      return;
    }
    const result = await daemon.start(workspaces, idleMinutes);
    if (result.ok) {
      playSfx('sync');
      actions.pushToast('Watcher started. Coding activity will log automatically.', 'success');
    } else actions.pushToast(result.error || 'The watcher could not start.', 'error');
  };

  const stopWatcher = async () => {
    const result = await daemon.stop();
    if (result.ok) playSfx('sync');
    actions.pushToast(result.ok ? 'Watcher stopped.' : result.error || 'The watcher could not stop.', result.ok ? 'info' : 'error');
  };

  const importWorkspaceFiles = async (fileList: FileList | null, merge: boolean) => {
    if (!fileList?.length) return;
    actions.importWorkspace(fileList, merge);
  };

  const importBackupFile = async (file: File, mode: 'merge' | 'replace') => {
    const text = await file.text();
    actions.importBackupText(text, mode);
  };

  const importSessionsFile = async (file: File) => {
    const text = await file.text();
    actions.importSessionsText(text);
  };

  const importMarkdownFile = async (file: File) => {
    const text = await file.text();
    actions.importMarkdownText(text);
  };

  const exportJson = () => {
    const backup = actions.exportBackupJSON();
    downloadFile(`field-journal-backup-${dateKey(new Date())}.json`, JSON.stringify(backup, null, 2), 'application/json');
    playSfx('tick');
    actions.pushToast('JSON backup downloaded.', 'success');
  };

  const exportSessions = () => {
    downloadFile(`field-journal-sessions-${dateKey(new Date())}.csv`, actions.exportSessionsCSV(), 'text/csv');
    playSfx('tick');
    actions.pushToast('Sessions CSV downloaded.', 'success');
  };

  const exportProblems = () => {
    downloadFile(`field-journal-dungeons-${dateKey(new Date())}.csv`, actions.exportProblemsCSV(), 'text/csv');
    playSfx('tick');
    actions.pushToast('Dungeons CSV downloaded.', 'success');
  };

  const importPasted = () => {
    const text = paste.trim();
    if (!text) {
      actions.pushToast('Paste a backup, CSV, or Markdown checklist first.', 'error');
      return;
    }
    if (text.startsWith('{') || text.startsWith('[')) {
      const result = actions.importBackupText(text, 'merge');
      if (result.ok) setPaste('');
      return;
    }
    if (/^\s*[-*]\s*\[[ xX]\]/m.test(text)) {
      actions.importMarkdownText(text);
      setPaste('');
      return;
    }
    const result = actions.importSessionsText(text);
    if (result.added) setPaste('');
  };

  const clearEvidenced = () => {
    const pending = allProblems(state).filter(
      (problem) =>
        evidenceForProblem(state, problem).implemented && problemRecord(state, problem.id).status !== 'solved'
    ).length;
    if (!pending) {
      actions.pushToast('No implemented dungeons are waiting for a clear.', 'info');
      return;
    }
    ui.confirm({
      title: 'Clear evidenced dungeons?',
      message: `${pending} dungeons have source files in the workspace snapshot. Mark them cleared? Evidence is not proof of acceptance.`,
      label: `Clear ${pending}`,
      onAccept: () => actions.applyEvidence('problems')
    });
  };

  const integrity = [
    ['Schema', `v${state.version}`],
    ['Sessions', state.sessions.length],
    ['Gates cleared', `${state.completedTopics.length}/${ALL_TOPICS.length}`],
    ['Dungeons cleared', `${solvedCount(state)}/${allProblems(state).length}`],
    ['Achievements', `${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}`],
    ['Quests claimed', questsClaimedCount(state)],
    ['Evidence files', totals.files],
    ['Evidence XP', evidenceXp(state)],
    ['Snapshot generated', snapshotValue.generatedAt ? relativeDate(snapshotValue.generatedAt) : 'Unknown'],
    ['Last save', state.meta.updatedAt ? relativeDate(state.meta.updatedAt) : 'Not yet'],
    ['Storage used', formatBytes(storageBytes(state))],
    ['Backup size', formatBytes(JSON.stringify(actions.exportBackupJSON()).length)]
  ];

  return (
    <div>
      <PageIntro
        eyebrow="Configuration · data · safety"
        title="System"
        description="Your data lives in this browser. Export a backup, import your workspace folder, or move the journal between devices."
        actions={
          <>
            <div className="mini-stat">
              <strong>{formatBytes(storageBytes(state))}</strong>
              <span>local data</span>
            </div>
            <div className="mini-stat">
              <strong>{totals.files}</strong>
              <span>evidence files</span>
            </div>
          </>
        }
      />

      <div className="system-grid">
        <Sheet className="wide watcher-sheet">
          <SheetHead
            eyebrow="Live watcher"
            title="Automatic tracking"
            right={
              daemon.status?.online ? (
                <span className="status-pill">watching</span>
              ) : (
                <span className="stamp muted">offline</span>
              )
            }
          />
          {!daemon.status ? (
            <p className="sheet-note">Checking the local watcher…</p>
          ) : daemon.status.online ? (
            <>
              <div className="watcher-status-line">
                <span className="watcher-dot on" />
                <span>
                  Watching {daemon.status.workspaces.length} folder{daemon.status.workspaces.length === 1 ? '' : 's'}{' '}
                  <code>{daemon.status.workspaces.join(' · ')}</code>
                </span>
                <span className="completion">{daemon.status.sessions} auto entries</span>
              </div>
              <div className="watcher-meta">
                <div>
                  <span>Active block</span>
                  <strong>{daemon.status.active ? `${daemon.status.active.minutes} min` : 'Waiting for a save'}</strong>
                </div>
                <div>
                  <span>Latest file</span>
                  <strong>{daemon.status.active?.files.at(-1) || '—'}</strong>
                </div>
                <div>
                  <span>Idle window</span>
                  <strong>{daemon.status.idleMinutes} min</strong>
                </div>
                <div>
                  <span>Evidence refreshed</span>
                  <strong>{daemon.status.snapshotVersion ? timeOf(daemon.status.snapshotVersion) : '—'}</strong>
                </div>
              </div>
              {daemon.status.active ? (
                <p className="watcher-active-line">
                  <span className="watcher-dot on" />
                  {daemon.status.active.title} · {daemon.status.active.files.length} file
                  {daemon.status.active.files.length === 1 ? '' : 's'} · {daemon.status.active.saves || 0} save
                  {(daemon.status.active.saves || 0) === 1 ? '' : 's'}
                  {daemon.status.active.builds ? ` · ${daemon.status.active.builds} compile${daemon.status.active.builds === 1 ? '' : 's'}` : ''}
                  {daemon.status.active.bytes ? ` · ~${formatBytes(daemon.status.active.bytes)} written` : ''} · since{' '}
                  {timeOf(daemon.status.active.start)}
                </p>
              ) : (
                <p className="sheet-note">Watching for the next file save…</p>
              )}
              <div className="button-row">
                {daemon.bound ? (
                  <>
                    <button
                      type="button"
                      className="btn primary small"
                      onClick={() => {
                        void daemon.syncNow();
                        actions.pushToast('Watcher feed checked.', 'info');
                      }}
                    >
                      <Icon name="refresh" size={13} />
                      Sync now
                    </button>
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => {
                        void stopWatcher();
                      }}
                      disabled={daemon.loading}
                    >
                      Stop watcher
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn primary small"
                      onClick={() => {
                        void daemon.bind();
                        actions.pushToast('Workspace linked to this journal.', 'success');
                      }}
                    >
                      <Icon name="checkCircle" size={13} />
                      Link &amp; sync
                    </button>
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => {
                        void stopWatcher();
                      }}
                      disabled={daemon.loading}
                    >
                      Stop watcher
                    </button>
                  </>
                )}
              </div>
              {!daemon.bound ? (
                <p className="watcher-error">This watcher is running outside this journal. Link it to import its feed.</p>
              ) : null}
              {daemon.status.lastEventAt ? (
                <p className="fine-print">
                  Last activity {relativeDate(daemon.status.lastEventAt)} at {timeOf(daemon.status.lastEventAt)}.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="sheet-note">
                Start a background watcher to auto-log coding sessions and update evidence, gates, and dungeons as you
                save files.
              </p>
              <form
                className="watcher-form"
                onSubmit={startWatcher}
                key={`${daemon.status.config.workspaces.join('|')}-${daemon.status.config.idleMinutes}`}
              >
                <label className="watcher-roots">
                  Workspace folders (one per line)
                  <textarea
                    name="workspaces"
                    rows={3}
                    defaultValue={daemon.status.config.workspaces.join('\n')}
                    placeholder={'C:\\path\\to\\workspace\nC:\\path\\to\\another'}
                  />
                </label>
                <div className="watcher-controls">
                  <label>
                    Idle window (min)
                    <input name="idleMinutes" type="number" min={1} max={120} defaultValue={daemon.status.config.idleMinutes} />
                  </label>
                  <button className="btn primary" type="submit" disabled={daemon.loading}>
                    <Icon name="system" size={14} />
                    {daemon.loading ? 'Starting…' : 'Start watcher'}
                  </button>
                </div>
              </form>
            </>
          )}
          {daemon.error ? <p className="watcher-error">{daemon.error}</p> : null}
          <div className="watcher-note">
            <p className="hand">“It watches file saves, not your screen.”</p>
            <p className="fine-print">
              A detached Node process groups saves into practice blocks, auto-claims completed quests, and flags
              re-edited cleared dungeons for review. It reads local file text only to infer topics, titles, tags, and
              difficulty; the stored snapshot keeps names, paths, sizes, timestamps, and inferred metadata — not the
              file contents. Nothing leaves this machine.
            </p>
          </div>
        </Sheet>

        <Sheet>
          <SheetHead eyebrow="Hunter profile" title="Identity & goals" />
          <form
            className="stack-form"
            onSubmit={submitProfile}
            key={`${state.profile.name}-${state.profile.goalMinutesPerWeek}-${state.profile.dailyXpGoal}-${state.settings.theme}-${state.settings.weekStart}-${state.settings.reduceMotion}-${state.settings.sound}`}
          >
            <label>
              Hunter name
              <input
                name="name"
                maxLength={40}
                defaultValue={state.profile.name}
                placeholder="Hunter"
                autoComplete="nickname"
              />
            </label>
            <div className="field-row">
              <label>
                Weekly minutes goal
                <input
                  name="goalMinutesPerWeek"
                  type="number"
                  min={30}
                  max={5000}
                  step={30}
                  defaultValue={state.profile.goalMinutesPerWeek}
                />
              </label>
              <label>
                Daily XP goal
                <input
                  name="dailyXpGoal"
                  type="number"
                  min={10}
                  max={5000}
                  step={10}
                  defaultValue={state.profile.dailyXpGoal}
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                Week starts
                <select name="weekStart" defaultValue={String(state.settings.weekStart)}>
                  <option value="1">Monday</option>
                  <option value="0">Sunday</option>
                </select>
              </label>
              <label>
                Theme
                <select name="theme" defaultValue={state.settings.theme}>
                  <option value="paper">Aged paper</option>
                  <option value="night">Archive night</option>
                </select>
              </label>
            </div>
            <label className="check-line">
              <input name="reduceMotion" type="checkbox" defaultChecked={state.settings.reduceMotion} />
              Reduce animations
            </label>
            <label className="check-line">
              <input name="sound" type="checkbox" defaultChecked={state.settings.sound} />
              Sound effects
            </label>
            <div className="sound-check">
              <span className="eyebrow">Sound check</span>
              <button type="button" className="mini-btn" onClick={() => playSfx('stamp')}>
                Stamp
              </button>
              <button type="button" className="mini-btn" onClick={() => playSfx('scribe')}>
                Quill
              </button>
              <button type="button" className="mini-btn" onClick={() => playSfx('chime')}>
                Chime
              </button>
              <button type="button" className="mini-btn" onClick={() => playSfx('coin')}>
                Coin
              </button>
            </div>
            <button className="btn primary" type="submit">
              <Icon name="check" size={14} />
              Save profile
            </button>
          </form>
        </Sheet>

        <Sheet>
          <SheetHead
            eyebrow="Workspace evidence"
            title="Snapshot"
            right={<span className="status-pill">{snapshotValue.source || 'snapshot'}</span>}
          />
          <div className="snapshot-stats">
            {[
              ['Files', totals.files],
              ['Code', totals.code],
              ['Docs', totals.docs],
              ['Problems', totals.problems],
              ['Days', totals.days]
            ].map(([label, value]) => (
              <div className="snapshot-stat" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="sheet-note">{snapshotValue.note || 'No workspace snapshot loaded.'}</p>
          <div className="button-row">
            <label className="btn ghost small file-btn">
              Import folder
              <input
                ref={folderRef}
                type="file"
                multiple
                onChange={(event) => {
                  void importWorkspaceFiles(event.target.files, false);
                  event.target.value = '';
                }}
              />
            </label>
            <label className="btn ghost small file-btn">
              Import files
              <input
                ref={filesRef}
                type="file"
                multiple
                onChange={(event) => {
                  void importWorkspaceFiles(event.target.files, true);
                  event.target.value = '';
                }}
              />
            </label>
            <button type="button" className="btn ghost small" onClick={() => actions.applyEvidence('topics')}>
              Apply evidenced gates
            </button>
            <button type="button" className="btn ghost small" onClick={clearEvidenced}>
              Clear evidenced dungeons
            </button>
          </div>
          <p className="fine-print">
            Folder import replaces the snapshot with that folder; file import merges into it. Filenames and modified
            dates only — nothing leaves your device.
          </p>
        </Sheet>

        <Sheet>
          <SheetHead eyebrow="Backup" title="Export" />
          <p className="sheet-note">
            A JSON backup contains everything: sessions, gates, dungeons, quests, achievements, settings, and evidence.
          </p>
          <div className="button-row">
            <button type="button" className="btn primary small" onClick={exportJson}>
              <Icon name="download" size={13} />
              Download JSON backup
            </button>
            <button type="button" className="btn ghost small" onClick={exportSessions}>
              Sessions CSV
            </button>
            <button type="button" className="btn ghost small" onClick={exportProblems}>
              Dungeons CSV
            </button>
          </div>
          <p className="fine-print">Keep a copy outside this browser. Clearing site data erases local progress.</p>
        </Sheet>

        <Sheet>
          <SheetHead eyebrow="Restore or migrate" title="Import" />
          <div className="import-grid">
            <label className="import-card">
              JSON backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importBackupFile(file, 'merge');
                  event.target.value = '';
                }}
              />
              <span>Merge sessions, gates, dungeons, quests, and evidence.</span>
              <b>Choose file</b>
            </label>
            <label className="import-card">
              Sessions CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importSessionsFile(file);
                  event.target.value = '';
                }}
              />
              <span>Columns: date, topic, track, minutes, note, tags.</span>
              <b>Choose file</b>
            </label>
            <label className="import-card">
              Markdown checklist
              <input
                type="file"
                accept=".md,.txt,text/markdown"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importMarkdownFile(file);
                  event.target.value = '';
                }}
              />
              <span>Reads - [x] items and completes matching gates.</span>
              <b>Choose file</b>
            </label>
          </div>
          <label className="paste-box">
            Paste JSON, CSV, or Markdown
            <textarea
              rows={4}
              value={paste}
              onChange={(event) => setPaste(event.target.value)}
              placeholder="Paste a backup, session CSV, or roadmap checklist…"
            />
          </label>
          <div className="button-row">
            <button type="button" className="btn ghost small" onClick={importPasted}>
              Import pasted data
            </button>
            <label className="btn ghost small file-btn">
              Replace from JSON
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (!file) return;
                  ui.confirm({
                    title: 'Replace local data?',
                    message:
                      'This overwrites your current sessions, gates, dungeons, quests, and achievements with the selected backup. Export a backup first if you are unsure.',
                    label: 'Replace data',
                    tone: 'danger',
                    onAccept: () => {
                      void importBackupFile(file, 'replace');
                    }
                  });
                }}
              />
            </label>
          </div>
          <p className="fine-print">Merge is the default. “Replace” overwrites local progress after confirmation.</p>
        </Sheet>

        <Sheet className="wide">
          <SheetHead eyebrow="Data integrity" title="Health check" />
          <div className="integrity-grid">
            {integrity.map(([label, value]) => (
              <div className="integrity-item" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </Sheet>

        <Sheet className="wide danger-sheet">
          <SheetHead eyebrow="Danger zone" title="Reset" />
          <div className="danger-row">
            <div>
              <strong>Reset progress</strong>
              <p>Clears sessions, gates, dungeons, quests, and achievements. Keeps profile, settings, and evidence.</p>
            </div>
            <button
              type="button"
              className="btn danger small"
              onClick={() =>
                ui.confirm({
                  title: 'Reset progress?',
                  message:
                    'Sessions, gates, dungeons, quests, and achievements will be cleared. Profile, settings, custom dungeons, and workspace evidence stay.',
                  label: 'Reset progress',
                  tone: 'danger',
                  onAccept: () => actions.resetProgress()
                })
              }
            >
              Reset progress
            </button>
          </div>
          <div className="danger-row">
            <div>
              <strong>Erase everything</strong>
              <p>Deletes all local journal data and restores the shipped workspace snapshot.</p>
            </div>
            <button
              type="button"
              className="btn danger small"
              onClick={() =>
                ui.confirm({
                  title: 'Erase all local data?',
                  message:
                    'Everything in this browser will be deleted and the shipped workspace snapshot restored. Export a backup first.',
                  label: 'Erase everything',
                  tone: 'danger',
                  onAccept: () => actions.resetAll()
                })
              }
            >
              Erase all data
            </button>
          </div>
        </Sheet>
      </div>
    </div>
  );
}
