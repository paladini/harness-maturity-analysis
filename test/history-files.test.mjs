import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { historyFileName, reportMatchesToolVersion } from '../corpus/lib/history.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corpusDir = path.join(__dirname, '..', 'corpus');
const manifest = JSON.parse(readFileSync(path.join(corpusDir, 'manifest.json'), 'utf8'));
const historyDir = path.join(corpusDir, 'history');
const historyRuns = readdirSync(historyDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(path.join(historyDir, name), 'utf8')));

describe('committed corpus history', () => {
  it('gives every run a unique identity and valid entry records', () => {
    const identities = historyRuns.map((run) => `${run.date}:${run.toolVersion}`);
    expect(new Set(identities).size).toBe(identities.length);

    for (const run of historyRuns) {
      expect(run.schemaVersion).toBe(1);
      expect(run.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(run.toolVersion).toMatch(/^harness-score@\d+\.\d+\.\d+$/);
      expect(new Set(run.entries.map((entry) => entry.name)).size).toBe(run.entries.length);
      for (const entry of run.entries) {
        expect(entry.commit).toMatch(/^[0-9a-f]{40}$/);
        expect(['scored', 'failed', 'not-scanned']).toContain(entry.status);
        if (entry.status === 'scored') {
          expect(entry.score.percent).toBeGreaterThanOrEqual(0);
          expect(entry.score.percent).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('has a complete snapshot for the current manifest run', () => {
    const currentPath = path.join(historyDir, historyFileName(manifest.runDate, manifest.toolVersion));
    expect(existsSync(currentPath)).toBe(true);
    const current = JSON.parse(readFileSync(currentPath, 'utf8'));
    expect(current.entries.map((entry) => entry.name)).toEqual(manifest.entries.map((entry) => entry.name));
    expect(current.entries.every((entry) => entry.status === 'scored')).toBe(true);
  });

  it('keeps every current raw report on the pinned scanner version', () => {
    for (const entry of manifest.entries) {
      const report = JSON.parse(readFileSync(path.join(corpusDir, 'reports', `${entry.name}.json`), 'utf8'));
      expect(reportMatchesToolVersion(report, manifest.toolVersion), entry.name).toBe(true);
    }
  });
});
