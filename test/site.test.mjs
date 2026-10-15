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
  it('labels the broad GitHub software cohort as popularity metadata', () => {
    const entry = fakeEntry('popular-software', {
      category: 'github-top-software',
      selection: {
        cohort: 'github-top-software-popularity',
        date: '2026-10-10',
        githubStars: 25503,
        popularityRank: 1000,
      },
    });
    const html = renderSite([{ entry, report: fakeReport({ percent: 42, level: 1 }) }], {
      toolVersion: 'harness-score@1.8.1',
      entries: [entry],
    });
    expect(html).toContain('GitHub software cohort: popularity #1000');
    expect(html).toContain('25,503 GitHub stars on 2026-10-10');
    expect(html).toContain('GitHub top software');
    expect(html).toContain('issues/15');
    expect(html).toContain('Popularity is selection metadata, not maturity');
  });
  it('labels developer infrastructure entries and cohort selection provenance', () => {
    const entry = fakeEntry('infrastructure-tool', {
      category: 'database-data-platforms',
      selection: {
        cohort: 'developer-infrastructure-popularity-816',
        focusCategory: 'database-data-platforms',
        date: '2026-10-11',
        githubStars: 159,
        popularityRank: 816,
      },
    });
    const html = renderSite([{ entry, report: fakeReport({ percent: 42, level: 1 }) }], {
      toolVersion: 'harness-score@1.8.1',
      entries: [entry],
    });
    expect(html).toContain('Developer infrastructure (database and data platforms) cohort: popularity #816');
    expect(html).toContain('159 GitHub stars on 2026-10-11');
    expect(html).toContain(
      'Includes 1 database, developer-tool, code-quality and software-delivery repositories',
    );
    expect(html).toContain('issues/19');
  });
  it('labels geospatial and mapping entries as a bounded popularity cohort', () => {
    const entry = fakeEntry('geospatial-tool', {
      category: 'geospatial',
      selection: {
        cohort: 'geospatial-mapping-popularity-1000',
        focusCategory: 'geospatial',
        date: '2026-10-14',
        githubStars: 240,
        popularityRank: 1000,
      },
    });
    const html = renderSite([{ entry, report: fakeReport({ percent: 61, level: 2 }) }], {
      toolVersion: 'harness-score@1.8.2',
      entries: [entry],
    });
    expect(html).toContain('Geospatial and mapping cohort: popularity #1000');
    expect(html).toContain('geospatial and mapping');
    expect(html).toContain('240 GitHub stars on 2026-10-14');
    expect(html).toContain('1 geospatial, mapping, GIS and routing repositories');
    expect(html).toContain('issues/27');
    expect(html).toContain('61/100');
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
