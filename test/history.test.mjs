import { mkdtempSync, readFileSync, rmdirSync, statSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createHistorySnapshot,
  historyFileName,
  renderScoreHistoryMarkdown,
  reportMatchesToolVersion,
  sortHistoryRuns,
  writeHistorySnapshot,
} from '../corpus/lib/history.mjs';

function entry(name) {
  return {
    name,
    repoUrl: `https://github.com/example/${name}.git`,
    commit: '0'.repeat(40),
  };
}

function report(percent, version = '1.5.0') {
  return {
    tool: { name: 'harness-score', version },
    level: { index: 2, name: 'Repeatable' },
    score: { earned: percent, max: 100, percent },
    truncated: false,
  };
}

describe('history identity', () => {
  it('builds a deterministic filename from the run date and pinned tool', () => {
    expect(historyFileName('2026-07-25', 'harness-score@1.5.0')).toBe('2026-07-25-harness-score-1.5.0.json');
  });

  it('rejects invalid dates and unpinned tool versions', () => {
    expect(() => historyFileName('July 25', 'harness-score@1.5.0')).toThrow();
    expect(() => historyFileName('2026-07-25', 'harness-score@latest')).toThrow();
  });

  it('separates same-day runs and rejects unsafe run identifiers', () => {
    expect(historyFileName('2026-10-08', 'harness-score@1.8.1', 'crypto-popularity')).toBe(
      '2026-10-08-harness-score-1.8.1-crypto-popularity.json',
    );
    for (const runId of ['', '../old', 'Crypto', 'a/b', null, 'a'.repeat(65)]) {
      expect(() => historyFileName('2026-10-08', 'harness-score@1.8.1', runId)).toThrow();
    }
  });

  it('matches reports only to the exact configured scanner version', () => {
    expect(reportMatchesToolVersion(report(50), 'harness-score@1.5.0')).toBe(true);
    expect(reportMatchesToolVersion(report(50, '1.0.0'), 'harness-score@1.5.0')).toBe(false);
  });
});

describe('createHistorySnapshot', () => {
  it('retains legacy identity and records the optional run identifier', () => {
    const manifest = { runDate: '2026-10-08', toolVersion: 'harness-score@1.8.1', entries: [] };
    expect(createHistorySnapshot(manifest, new Map())).not.toHaveProperty('runId');
    expect(createHistorySnapshot({ ...manifest, runId: 'crypto-popularity' }, new Map())).toHaveProperty(
      'runId',
      'crypto-popularity',
    );
    expect(() => createHistorySnapshot({ ...manifest, runId: '../old' }, new Map())).toThrow();
  });
  it('records scores and retains missing runs without borrowing stale data', () => {
    const manifest = {
      runDate: '2026-07-25',
      toolVersion: 'harness-score@1.5.0',
      entries: [entry('scored'), entry('missing')],
    };
    const snapshot = createHistorySnapshot(
      manifest,
      new Map([['scored', { status: 'scored', report: report(80) }]]),
    );
    expect(snapshot.entries[0]).toMatchObject({
      name: 'scored',
      status: 'scored',
      score: { percent: 80 },
    });
    expect(snapshot.entries[1]).toMatchObject({
      name: 'missing',
      status: 'not-scanned',
    });
  });
});

describe('append-only history files', () => {
  it('preserves bytes and modification time across reruns and conflicting writes', () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'harness-history-'));
    const outputs = [];
    try {
      const legacy = createHistorySnapshot(
        { runDate: '2026-10-08', toolVersion: 'harness-score@1.8.1', entries: [entry('existing')] },
        new Map(),
      );
      const legacyPath = writeHistorySnapshot(directory, legacy);
      outputs.push(legacyPath);
      const original = readFileSync(legacyPath, 'utf8');
      const originalMtime = statSync(legacyPath).mtimeMs;
      expect(writeHistorySnapshot(directory, legacy)).toBe(legacyPath);
      expect(() => writeHistorySnapshot(directory, { ...legacy, entries: [] })).toThrow(/different content/);
      expect(readFileSync(legacyPath, 'utf8')).toBe(original);
      expect(statSync(legacyPath).mtimeMs).toBe(originalMtime);
      const expanded = { ...legacy, runId: 'crypto-popularity', entries: [...legacy.entries, entry('new')] };
      const expandedPath = writeHistorySnapshot(directory, expanded);
      outputs.push(expandedPath);
      expect(expandedPath).not.toBe(legacyPath);
      expect(readFileSync(legacyPath, 'utf8')).toBe(original);
      expect(sortHistoryRuns([expanded, legacy])).toEqual([legacy, expanded]);
      expect(sortHistoryRuns([legacy, expanded])).toEqual([legacy, expanded]);
    } finally {
      for (const output of outputs) unlinkSync(output);
      rmdirSync(directory);
    }
  });
});

describe('renderScoreHistoryMarkdown', () => {
  it('distinguishes same-version expansions and does not describe them as model changes', () => {
    const repository = entry('new');
    const base = { date: '2026-10-08', toolVersion: 'harness-score@1.8.1', entries: [] };
    const expanded = createHistorySnapshot(
      {
        runDate: base.date,
        toolVersion: base.toolVersion,
        runId: 'crypto-popularity',
        entries: [repository],
      },
      new Map([['new', { report: report(50, '1.8.1') }]]),
    );
    const markdown = renderScoreHistoryMarkdown([expanded, base], [repository]);
    expect(markdown).toContain('<br>`crypto-popularity`');
    expect(markdown).toContain('Same-version runs record corpus coverage');
    expect(markdown).toContain('not recorded | L2');
  });
  it('shows every recorded run and computes the latest percentage-point change', () => {
    const repository = entry('sample');
    const runs = [
      createHistorySnapshot(
        {
          runDate: '2026-07-16',
          toolVersion: 'harness-score@1.0.0',
          entries: [repository],
        },
        new Map([['sample', { status: 'scored', report: report(40, '1.0.0') }]]),
      ),
      createHistorySnapshot(
        {
          runDate: '2026-07-25',
          toolVersion: 'harness-score@1.5.0',
          entries: [repository],
        },
        new Map([['sample', { status: 'scored', report: report(55) }]]),
      ),
    ];
    const markdown = renderScoreHistoryMarkdown(runs, [repository]);
    expect(markdown).toContain('harness-score@1.0.0');
    expect(markdown).toContain('harness-score@1.5.0');
    expect(markdown).toContain('| [sample]');
    expect(markdown).toContain('| +15 pp |');
  });
});
