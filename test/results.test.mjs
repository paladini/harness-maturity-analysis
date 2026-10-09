import { describe, expect, it } from 'vitest';
import {
  rankReports,
  renderHeatmapMarkdown,
  renderLeaderboardCsv,
  renderLeaderboardMarkdown,
} from '../corpus/lib/results.mjs';

function fakeReport({ percent, level = 0, truncated = false, detectedHarnesses = [], dims = {} }) {
  return {
    level: { index: level, name: `Level${level}` },
    score: { earned: percent, max: 100, percent },
    truncated,
    detectedHarnesses,
    dimensions: Object.entries(dims).map(([id, pct]) => ({ id, title: id, percent: pct })),
  };
}

function fakeEntry(name, overrides = {}) {
  return {
    name,
    category: 'test',
    repoUrl: `https://example.test/${name}.git`,
    commit: '0'.repeat(40),
    scanSubpath: null,
    isStressCase: false,
    notes: '',
    ...overrides,
  };
}

describe('rankReports', () => {
  it('sorts by score percent, descending', () => {
    const a = fakeEntry('a');
    const b = fakeEntry('b');
    const reportsByName = new Map([
      ['a', fakeReport({ percent: 40 })],
      ['b', fakeReport({ percent: 90 })],
    ]);
    const { rows } = rankReports([a, b], reportsByName);
    expect(rows.map((r) => r.entry.name)).toEqual(['b', 'a']);
  });

  it('breaks percent ties by level index, descending', () => {
    const a = fakeEntry('a');
    const b = fakeEntry('b');
    const reportsByName = new Map([
      ['a', fakeReport({ percent: 70, level: 1 })],
      ['b', fakeReport({ percent: 70, level: 3 })],
    ]);
    const { rows } = rankReports([a, b], reportsByName);
    expect(rows.map((r) => r.entry.name)).toEqual(['b', 'a']);
  });

  it('reports entries with no report yet as skipped, not dropped silently', () => {
    const scanned = fakeEntry('scanned');
    const pending = fakeEntry('pending');
    const reportsByName = new Map([['scanned', fakeReport({ percent: 50 })]]);
    const { rows, skipped } = rankReports([scanned, pending], reportsByName);
    expect(rows).toHaveLength(1);
    expect(skipped).toEqual(['pending']);
  });
});

describe('renderLeaderboardCsv', () => {
  it('emits a header plus one row per entry, semicolon-joining detected harnesses inside quotes', () => {
    const rows = [
      {
        entry: fakeEntry('solo'),
        report: fakeReport({ percent: 55, detectedHarnesses: ['cursor', 'claude-code'] }),
      },
    ];
    const csv = renderLeaderboardCsv(rows);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      'rank,name,category,repoUrl,commit,level,levelName,earned,max,percent,truncated,isStressCase,detectedHarnesses,selectionCohort,selectionDate,githubStars,popularityRank',
    );
    expect(lines[1]).toContain('"cursor;claude-code"');
    expect(lines[1]).toMatch(/,,,,\s*$/);
  });

  it('keeps popularity rank and observed stars separate from the harness rank and score', () => {
    const entry = fakeEntry('popular', {
      selection: { cohort: 'ai-popularity', date: '2026-10-08', githubStars: 92063, popularityRank: 30 },
    });
    const lines = renderLeaderboardCsv([{ entry, report: fakeReport({ percent: 70, level: 1 }) }])
      .trim()
      .split('\n');
    expect(lines[1]).toMatch(/^1,popular,/);
    expect(lines[1]).toContain(',70,100,70,');
    expect(lines[1]).toMatch(/,ai-popularity,2026-10-08,92063,30$/);
  });
  it('labels the media editing cohort without inventing a cross-query popularity rank', () => {
    const entry = fakeEntry('lossless-cut', {
      selection: { cohort: 'media-editing-popularity', date: '2026-10-09', githubStars: 44406 },
    });
    const md = renderLeaderboardMarkdown(
      [{ entry, report: fakeReport({ percent: 70, level: 1 }) }],
      { toolVersion: 'harness-score@1.8.1', entries: [entry] },
      [],
    );
    expect(md).toContain('Media editing cohort');
    expect(md).not.toContain('Media editing cohort #');
  });
});

describe('renderLeaderboardMarkdown', () => {
  it('names not-yet-scanned entries when skipped is non-empty', () => {
    const rows = [{ entry: fakeEntry('done'), report: fakeReport({ percent: 80 }) }];
    const manifest = {
      toolVersion: 'harness-score@1.0.0',
      entries: [fakeEntry('done'), fakeEntry('pending')],
    };
    const md = renderLeaderboardMarkdown(rows, manifest, ['pending']);
    expect(md).toContain('Not yet scanned: pending');
  });

  it('omits the not-yet-scanned note when nothing was skipped', () => {
    const rows = [{ entry: fakeEntry('done'), report: fakeReport({ percent: 80 }) }];
    const manifest = { toolVersion: 'harness-score@1.0.0', entries: [fakeEntry('done')] };
    const md = renderLeaderboardMarkdown(rows, manifest, []);
    expect(md).not.toContain('Not yet scanned');
  });
});

describe('renderHeatmapMarkdown', () => {
  it('emits one column per dimension found on the first row, one row per repo', () => {
    const rows = [
      { entry: fakeEntry('a'), report: fakeReport({ percent: 60, dims: { context: 80, hooks: 40 } }) },
      { entry: fakeEntry('b'), report: fakeReport({ percent: 30, dims: { context: 20, hooks: 0 } }) },
    ];
    const manifest = { toolVersion: 'harness-score@1.0.0', entries: [] };
    const md = renderHeatmapMarkdown(rows, manifest);
    const lines = md.trim().split('\n');
    expect(lines.find((l) => l.startsWith('| Repository'))).toBe('| Repository | context | hooks |');
    expect(lines).toContain('| a | 80% | 40% |');
    expect(lines).toContain('| b | 20% | 0% |');
  });
});
