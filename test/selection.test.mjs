import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'corpus/manifest.json'), 'utf8'));
const selection = JSON.parse(readFileSync(path.join(root, 'corpus/selection-2026-10-07.json'), 'utf8'));

describe('Phase 1B preregistered selection', () => {
  it('contains five complete waves with 50 unique repository identities', () => {
    expect(selection.candidates).toHaveLength(50);
    expect(manifest.entries.length).toBeGreaterThanOrEqual(71);
    for (let wave = 1; wave <= 5; wave++) {
      expect(selection.candidates.filter((candidate) => candidate.wave === wave)).toHaveLength(10);
    }
    expect(new Set(selection.candidates.map((candidate) => candidate.name)).size).toBe(50);
    expect(new Set(selection.candidates.map((candidate) => candidate.repoUrl.toLowerCase())).size).toBe(50);
  });

  it('matches the pinned manifest without changing the original 21 identities', () => {
    const originals = JSON.parse(
      readFileSync(path.join(root, 'corpus/history/2026-07-25-harness-score-1.5.0.json'), 'utf8'),
    );
    for (const old of originals.entries) {
      const current = manifest.entries.find((entry) => entry.name === old.name);
      expect(current.repoUrl).toBe(old.repoUrl);
      expect(current.commit).toBe(old.commit);
    }
    for (const candidate of selection.candidates) {
      const entry = manifest.entries.find((item) => item.name === candidate.name);
      expect(entry.repoUrl).toBe(candidate.repoUrl);
      expect(entry.commit).toBe(candidate.commit);
      expect(entry.scanSubpath).toBeNull();
      expect(entry.checkoutExcludes).toBeUndefined();
      expect(candidate.defaultBranch).toBeTruthy();
      expect(candidate.licenseName).toBeTruthy();
      expect(candidate.githubProvenance).toMatch(/^https:\/\/github\.com\//);
    }
  });

  it('has complete checkout evidence for every selected commit', () => {
    const audit = JSON.parse(readFileSync(path.join(root, 'corpus/checkout-audit-2026-10-07.json'), 'utf8'));
    expect(audit.entries).toHaveLength(selection.candidates.length);
    for (const candidate of selection.candidates) {
      const checkout = audit.entries.find((entry) => entry.name === candidate.name);
      expect(checkout.commit).toBe(candidate.commit);
      expect(checkout.checkoutStatus).toBe('complete');
      expect(checkout.trackedTreeEntries).toBeGreaterThan(0);
    }
  });
});
