import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Validates the real corpus/manifest.json, not a fixture — a malformed
// entry here would otherwise only surface partway through a long
// `npm run corpus` run against the full ~20-repository corpus.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, '..', 'corpus', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const SHA_RE = /^[0-9a-f]{40}$/;
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('corpus/manifest.json', () => {
  it('declares a schema version and a pinned tool version', () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.toolVersion).toMatch(/^harness-score@\d+\.\d+\.\d+$/);
  });

  it('has at least one entry', () => {
    expect(Array.isArray(manifest.entries)).toBe(true);
    expect(manifest.entries.length).toBeGreaterThan(0);
  });

  it('gives every entry a unique, kebab-case name', () => {
    const names = manifest.entries.map((e) => e.name);
    for (const name of names) expect(name).toMatch(NAME_RE);
    expect(new Set(names).size).toBe(names.length);
  });

  it('pins every entry to a full 40-character commit SHA, not a branch', () => {
    for (const entry of manifest.entries) {
      expect(entry.commit, `${entry.name}: commit`).toMatch(SHA_RE);
    }
  });

  it('gives every entry a cloneable https repoUrl and a non-empty category/notes', () => {
    for (const entry of manifest.entries) {
      expect(entry.repoUrl, `${entry.name}: repoUrl`).toMatch(/^https:\/\/.+\.git$/);
      expect(entry.category, `${entry.name}: category`).toBeTruthy();
      expect(entry.notes, `${entry.name}: notes`).toBeTruthy();
      expect(typeof entry.isStressCase).toBe('boolean');
      expect(entry.scanSubpath === null || typeof entry.scanSubpath === 'string').toBe(true);
    }
  });
});
