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
});
