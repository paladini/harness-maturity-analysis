import { describe, expect, it } from 'vitest';
import { renderSite } from '../corpus/lib/site.mjs';

function fakeReport({ percent, level = 0, dims = {} }) {
  const dimList = ['context', 'skills', 'hooks', 'sensors', 'ci', 'hygiene'].map((id) => ({
    id,
    title: id,
    percent: dims[id] ?? 0,
    earned: dims[id] ?? 0,
    max: 100,
  }));
  return {
    level: { index: level, name: `Level${level}` },
    score: { earned: percent, max: 100, percent },
    truncated: false,
    detectedHarnesses: [],
    dimensions: dimList,
  };
}

function fakeEntry(name, overrides = {}) {
  return {
    name,
    category: 'ai-lab',
    repoUrl: `https://github.com/example/${name}.git`,
    commit: '0'.repeat(40),
    scanSubpath: null,
    isStressCase: false,
    notes: '',
    ...overrides,
  };
}

describe('renderSite', () => {
  it('labels crypto popularity independently of maturity and the AI cohort', () => {
    const entry = fakeEntry('crypto', {
      category: 'crypto-protocols',
      selection: { cohort: 'crypto-popularity', date: '2026-10-08', githubStars: 90328, popularityRank: 1 },
    });
    const html = renderSite([{ entry, report: fakeReport({ percent: 25, level: 0 }) }], {
      toolVersion: 'harness-score@1.8.1',
      entries: [entry],
    });
    expect(html).toContain('Crypto software cohort: popularity #1');
    expect(html).toContain('90,328 GitHub stars');
    expect(html).toContain('25/100');
    expect(html).not.toContain('AI software cohort');
  });
  it('labels the media editing cohort with observed stars without implying a global rank', () => {
    const entry = fakeEntry('lossless-cut', {
      category: 'media-editing',
      selection: {
        cohort: 'media-editing-popularity',
        date: '2026-10-09',
        githubStars: 44406,
        selectionMode: 'popular',
      },
    });
    const html = renderSite([{ entry, report: fakeReport({ percent: 44, level: 1 }) }], {
      toolVersion: 'harness-score@1.8.1',
      entries: [entry],
    });
    expect(html).toContain('Media editing software cohort: 44,406 GitHub stars on 2026-10-09');
    expect(html).toContain(
      'Media editing cohort selection: 1 projects from a recorded bounded GitHub search union',
    );
    expect(html).toContain('issues/7');
    expect(html).toContain('media editing');
    expect(html).not.toContain('popularity #');
  });
  it('produces a well-formed document with a matching title and repo count', () => {
    const entries = [fakeEntry('one'), fakeEntry('two')];
    const rows = [
      { entry: entries[0], report: fakeReport({ percent: 80, level: 3 }) },
      { entry: entries[1], report: fakeReport({ percent: 20, level: 0 }) },
    ];
    const manifest = { toolVersion: 'harness-score@1.0.0', entries };
    const html = renderSite(rows, manifest);
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<title>Harness Maturity Analysis — 2 repositories scored</title>');
    expect((html.match(/class="board-row"/g) ?? []).length).toBe(2);
  });

  it('HTML-escapes repository names and categories', () => {
    const entries = [fakeEntry('<script>alert(1)</script>', { category: 'ai-lab' })];
    const rows = [{ entry: entries[0], report: fakeReport({ percent: 50 }) }];
    const manifest = { toolVersion: 'harness-score@1.0.0', entries };
    const html = renderSite(rows, manifest);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('sizes the bar fill and dimension heatmap cells from real percentages', () => {
    const entries = [fakeEntry('solo')];
    const rows = [{ entry: entries[0], report: fakeReport({ percent: 42, dims: { context: 77 } }) }];
    const manifest = { toolVersion: 'harness-score@1.0.0', entries };
    const html = renderSite(rows, manifest);
    expect(html).toContain('width:42%');
    expect(html).toContain('--v:77%');
  });

  it('renders the latest before-and-after comparison from recorded runs', () => {
    const entries = [fakeEntry('sample')];
    const rows = [{ entry: entries[0], report: fakeReport({ percent: 55, level: 2 }) }];
    const historyRuns = [
      {
        date: '2026-07-16',
        toolVersion: 'harness-score@1.0.0',
        entries: [
          {
            name: 'sample',
            status: 'scored',
            level: { index: 1, name: 'Guided' },
            score: { earned: 40, max: 100, percent: 40 },
          },
        ],
      },
      {
        date: '2026-07-25',
        toolVersion: 'harness-score@1.5.0',
        entries: [
          {
            name: 'sample',
            status: 'scored',
            level: { index: 2, name: 'Repeatable' },
            score: { earned: 55, max: 100, percent: 55 },
          },
        ],
      },
    ];
    const manifest = { toolVersion: 'harness-score@1.5.0', entries };
    const html = renderSite(rows, manifest, historyRuns);
    expect(html).toContain('Same commits, new scoring model');
    expect(html).toContain('+15 pp');
    expect(html).toContain('harness-score@1.5.0');
  });

  it('identifies a same-version coverage expansion and labels popularity as source metadata', () => {
    const entry = fakeEntry('new-ai', {
      selection: { cohort: 'ai-popularity', date: '2026-10-08', githubStars: 92063, popularityRank: 30 },
    });
    const report = fakeReport({ percent: 70, level: 1 });
    const runs = [
      { date: '2026-10-07', toolVersion: 'harness-score@1.8.1', entries: [] },
      {
        date: '2026-10-08',
        toolVersion: 'harness-score@1.8.1',
        entries: [{ name: entry.name, status: 'scored', ...report }],
      },
    ];
    const html = renderSite(
      [{ entry, report }],
      { toolVersion: 'harness-score@1.8.1', entries: [entry] },
      runs,
    );
    expect(html).toContain('Corpus coverage over time');
    expect(html).not.toContain('Same commits, new scoring model');
    expect(html).toContain('not recorded');
    expect(html).toContain('popularity #30');
    expect(html).toContain('92,063 GitHub stars on 2026-10-08');
    expect(html).toContain('70/100');
  });
});
