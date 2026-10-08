import { describe, expect, it } from 'vitest';
import { buildPopularitySnapshot } from '../corpus/discover-ai.mjs';

describe('popularity discovery', () => {
  it('deduplicates by GitHub ID across searches and renames, retaining first-observed stars', () => {
    const item = (id, fullName, stars) => ({ id, full_name: fullName, stargazers_count: stars });
    const results = [
      {
        query: 'q1',
        total_count: 2,
        incomplete_results: false,
        items: [item(1, 'new-owner/renamed', 90), item(2, 'new/project', 80)],
      },
      {
        query: 'q2',
        total_count: 2,
        incomplete_results: false,
        items: [item(1, 'new-owner/renamed', 92), item(3, 'other/project', 100)],
      },
    ];
    const snapshot = buildPopularitySnapshot(
      [{ id: 1, canonicalSlug: 'old-owner/old-name' }],
      results,
      '2026-10-08',
      'snapshot',
    );
    expect(snapshot.candidates.map((candidate) => candidate.id)).toEqual([3, 1, 2]);
    expect(snapshot.candidates[1].alreadyInCorpus).toBe(true);
    expect(snapshot.candidates[1].stars).toBe(90);
    expect(snapshot.candidates[1].queries).toEqual(['q1', 'q2']);
    expect(snapshot.queries[0].returnedCount).toBe(2);
    expect(snapshot.queries[0].minRecordedStars).toBe(80);
  });

  it('rejects incomplete search evidence before it can be used as a ranking universe', () => {
    expect(() =>
      buildPopularitySnapshot([], [{ incomplete_results: true, items: [] }], '2026-10-08', 'snapshot'),
    ).toThrow(/incomplete/);
  });
});
