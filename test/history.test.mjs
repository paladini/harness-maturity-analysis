import { describe, expect, it } from 'vitest';
import {
  createHistorySnapshot,
  historyFileName,
  renderScoreHistoryMarkdown,
  reportMatchesToolVersion,
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

  it('matches reports only to the exact configured scanner version', () => {
    expect(reportMatchesToolVersion(report(50), 'harness-score@1.5.0')).toBe(true);
    expect(reportMatchesToolVersion(report(50, '1.0.0'), 'harness-score@1.5.0')).toBe(false);
  });
});

describe('createHistorySnapshot', () => {
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

describe('renderScoreHistoryMarkdown', () => {
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
