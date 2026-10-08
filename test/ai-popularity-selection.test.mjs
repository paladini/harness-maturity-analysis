import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AI_SEARCH_QUERIES } from '../corpus/discover-ai.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const manifest = json('corpus/manifest.json');
const selection = json('corpus/selection-2026-10-08-ai-popularity.json');
const search = json('corpus/popularity-search-2026-10-08.json');

describe('Phase 1C AI software popularity cohort', () => {
  it('selects exactly 30 new canonical IDs and preserves all 71 previous pins', () => {
    expect(selection.candidates).toHaveLength(30);
    expect(manifest.entries.length).toBeGreaterThanOrEqual(101);
    const existingIds = new Set(search.existingCorpus.map((entry) => entry.id));
    expect(existingIds.size).toBe(71);
    expect(new Set(selection.candidates.map((candidate) => candidate.githubRepositoryId)).size).toBe(30);
    for (const candidate of selection.candidates)
      expect(existingIds.has(candidate.githubRepositoryId)).toBe(false);
    for (const original of json('corpus/history/2026-10-07-harness-score-1.8.1.json').entries) {
      const current = manifest.entries.find((entry) => entry.name === original.name);
      expect(current.repoUrl).toBe(original.repoUrl);
      expect(current.commit).toBe(original.commit);
    }
  });

  it('admits the top eligible new results with complete higher-ranked exclusions and sufficient search boundaries', () => {
    expect(search.queries.map((query) => query.query)).toEqual(AI_SEARCH_QUERIES);
    const sorted = [...selection.candidates].sort(
      (a, b) => b.githubStars - a.githubStars || a.canonicalSlug.localeCompare(b.canonicalSlug, 'en'),
    );
    expect(selection.candidates).toEqual(sorted);
    expect(selection.cutoffStars).toBe(selection.candidates.at(-1).githubStars);
    const admitted = new Set(selection.candidates.map((candidate) => candidate.githubRepositoryId));
    const excluded = new Map(selection.exclusions.map((candidate) => [candidate.id, candidate]));
    for (const candidate of search.candidates.filter((entry) => entry.stars >= selection.cutoffStars)) {
      if (!admitted.has(candidate.id)) expect(excluded.get(candidate.id)?.reason).toBeTruthy();
    }
    for (const query of search.queries) {
      expect(query.incompleteResults).toBe(false);
      if (query.returnedCount < query.totalCount)
        expect(query.minRecordedStars).toBeLessThan(selection.cutoffStars);
    }
  });

  it('keeps implementation evidence, star provenance and complete roots attached to each pin', () => {
    for (const [index, candidate] of selection.candidates.entries()) {
      expect(candidate.popularityRank).toBe(index + 1);
      expect(candidate.codeEvidence.blobSha).toMatch(/^[a-f0-9]{40}$/);
      expect(candidate.codeEvidence.size).toBeGreaterThanOrEqual(200);
      expect(candidate.readmeEvidence).toContain(`/blob/${candidate.commit}/`);
      const entry = manifest.entries.find((item) => item.name === candidate.name);
      expect(entry.commit).toBe(candidate.commit);
      expect(entry.scanSubpath).toBeNull();
      expect(entry.checkoutExcludes).toBeUndefined();
      expect(entry.selection.githubRepositoryId).toBe(candidate.githubRepositoryId);
      expect(entry.selection.githubStars).toBe(candidate.githubStars);
      expect(entry.selection.popularityRank).toBe(candidate.popularityRank);
      expect(entry.selection.date).toBe(selection.selectionDate);
    }
  });

  it('has checkout verification of the exact implementation blobs for all 30 candidates', () => {
    const audit = json('corpus/checkout-audit-2026-10-08.json');
    expect(audit.entries).toHaveLength(30);
    for (const candidate of selection.candidates) {
      const entry = audit.entries.find((item) => item.name === candidate.name);
      expect(entry.commit).toBe(candidate.commit);
      expect(entry.checkoutStatus).toBe('complete');
      expect(entry.codeEvidence).toEqual({ ...candidate.codeEvidence, status: 'verified' });
    }
  });
});
