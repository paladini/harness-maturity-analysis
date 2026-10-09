import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const json = (file) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const selection = json('corpus/selection-2026-10-08-crypto-popularity.json');
const search = json('corpus/popularity-search-2026-10-08-crypto.json');
const manifest = json('corpus/manifest.json');

describe('Phase 1D cryptocurrency software cohort', () => {
  it('records an authoritative complete Linux CCXT read without dropping the quarantined fixture', () => {
    const receipt = json('corpus/scan-environment-2026-10-08-ccxt.json');
    const candidate = selection.candidates.find((entry) => entry.name === 'ccxt');
    const supplemental = json('corpus/checkout-audit-2026-10-08-crypto-popularity-ccxt-linux.json');
    expect(receipt.platform).toBe('linux');
    expect(receipt.commit).toBe(candidate.commit);
    expect(receipt.checkoutExcludes).toEqual([]);
    expect(receipt.codeExecutedFromTarget).toBe(false);
    expect(receipt.maturityStatus).toBe('complete');
    expect(receipt.truncated).toBe(false);
    expect(supplemental.entries[0].codeEvidence).toEqual({ ...candidate.codeEvidence, status: 'verified' });
    expect(json('corpus/reports/ccxt.json').root).toBe(receipt.root);
  });
  it('adds exactly25 new canonical identities without changing101 earlier pins', () => {
    expect(selection.candidates).toHaveLength(25);
    expect(manifest.entries.length).toBeGreaterThanOrEqual(126);
    const existing = new Set(search.existingRepositories.map((entry) => entry.githubRepositoryId));
    expect(existing.size).toBe(101);
    const admitted = new Set(selection.candidates.map((entry) => entry.githubRepositoryId));
    expect(admitted.size).toBe(25);
    for (const id of admitted) expect(existing.has(id)).toBe(false);
    const baseline = json('corpus/history/2026-10-08-harness-score-1.8.1.json');
    expect(baseline.entries).toHaveLength(101);
    for (const entry of baseline.entries) {
      const current = manifest.entries.find((item) => item.name === entry.name);
      expect(current.repoUrl).toBe(entry.repoUrl);
      expect(current.commit).toBe(entry.commit);
    }
  });

  it('accounts for all higher-star exclusions and sufficiently deep complete query boundaries', () => {
    const sorted = [...selection.candidates].sort(
      (a, b) => b.githubStars - a.githubStars || a.canonicalSlug.localeCompare(b.canonicalSlug, 'en'),
    );
    expect(selection.candidates).toEqual(sorted);
    expect(selection.cutoffStars).toBe(sorted.at(-1).githubStars);
    const admitted = new Set(sorted.map((entry) => entry.githubRepositoryId));
    const excluded = new Map(selection.exclusions.map((entry) => [entry.id, entry]));
    for (const entry of search.repositories.filter((item) => item.githubStars >= selection.cutoffStars)) {
      if (!admitted.has(entry.githubRepositoryId)) {
        expect(excluded.get(entry.githubRepositoryId)?.reason).toBeTruthy();
        expect(excluded.get(entry.githubRepositoryId)?.evidence).toMatch(/\/blob\/[a-f0-9]{40}\//);
      }
    }
    for (const query of search.queries) {
      expect(query.incompleteResults).toBe(false);
      if (query.totalCount > query.returnedCount)
        expect(query.minRecordedStars).toBeLessThan(selection.cutoffStars);
    }
  });

  it('preserves implementation evidence and declares archived software rather than hiding it', () => {
    expect(selection.candidates.filter((entry) => entry.archived)).toHaveLength(3);
    for (const [index, candidate] of selection.candidates.entries()) {
      const entry = manifest.entries.find((item) => item.name === candidate.name);
      expect(entry.commit).toBe(candidate.commit);
      expect(entry.scanSubpath).toBeNull();
      expect(entry.checkoutExcludes).toBeUndefined();
      expect(candidate.popularityRank).toBe(index + 1);
      expect(candidate.codeEvidence.blobSha).toMatch(/^[a-f0-9]{40}$/);
      expect(candidate.codeEvidence.size).toBeGreaterThanOrEqual(200);
      expect(candidate.readmeEvidence).toContain(`/blob/${candidate.commit}/`);
      expect(entry.selection.archived).toBe(candidate.archived);
      expect(entry.selection.cohort).toBe('crypto-popularity');
      expect(entry.selection.githubStars).toBe(candidate.githubStars);
    }
  });

  it('matches all25 implementation blobs and the complete named126-report history', () => {
    const audit = json('corpus/checkout-audit-2026-10-08-crypto-popularity.json');
    const history = json('corpus/history/2026-10-08-harness-score-1.8.1-crypto-popularity.json');
    expect(audit.entries).toHaveLength(25);
    expect(history.entries).toHaveLength(126);
    expect(history.runId).toBe('crypto-popularity');
    expect(history.entries.every((entry) => entry.status === 'scored')).toBe(true);
    for (const candidate of selection.candidates) {
      const entry = audit.entries.find((item) => item.name === candidate.name);
      expect(entry.commit).toBe(candidate.commit);
      expect(entry.checkoutStatus).toBe('complete');
      expect(entry.codeEvidence).toEqual({ ...candidate.codeEvidence, status: 'verified' });
      const report = json(`corpus/reports/${candidate.name}.json`);
      const historical = history.entries.find((item) => item.name === candidate.name);
      expect(report.tool.version).toBe('1.8.1');
      expect(historical.score).toEqual(report.score);
      expect(historical.level.index).toBe(report.level.index);
    }
  });
});
