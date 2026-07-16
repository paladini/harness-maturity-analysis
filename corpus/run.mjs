#!/usr/bin/env node
// Pinned-clone + harness-score scan runner. Zero dependencies, same invariant
// as harness-score itself: given the same manifest, this produces the same
// reports, byte for byte (module the machine-local `root` path).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinnedClone, runHarnessScore } from './lib/scan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache', 'repos');
const REPORTS_DIR = path.join(__dirname, 'reports');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

export function parseArgs(argv) {
  const onlyIdx = argv.indexOf('--only');
  const only = onlyIdx >= 0 && argv[onlyIdx + 1] ? new Set(argv[onlyIdx + 1].split(',')) : null;
  return { only };
}

// Guards the script body so vitest can import parseArgs (and, in principle,
// the other exports) without cloning repositories or shelling out to npx.
const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');

if (isMain) {
  const { only } = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const entries = only ? manifest.entries.filter((e) => only.has(e.name)) : manifest.entries;

  if (entries.length === 0) {
    process.stderr.write('No matching manifest entries — check --only against corpus/manifest.json names.\n');
    process.exit(2);
  }

  mkdirSync(CACHE_DIR, { recursive: true });
  mkdirSync(REPORTS_DIR, { recursive: true });

  const summary = [];
  for (const entry of entries) {
    const dest = path.join(CACHE_DIR, entry.name);
    process.stdout.write(`\n▶ ${entry.name}  (${entry.category})\n`);
    try {
      const { reused } = pinnedClone(entry.repoUrl, entry.commit, dest);
      process.stdout.write(`  ${reused ? 'cache hit' : 'fetched'} @ ${entry.commit.slice(0, 12)}\n`);

      const scanTarget = entry.scanSubpath ? path.join(dest, entry.scanSubpath) : dest;
      const report = runHarnessScore(manifest.toolVersion, scanTarget);

      writeFileSync(
        path.join(REPORTS_DIR, `${entry.name}.json`),
        `${JSON.stringify(report, null, 2)}\n`,
        'utf8',
      );

      const { level, score, truncated, detectedHarnesses } = report;
      const flags = [truncated ? 'TRUNCATED' : null].filter(Boolean).join(', ');
      process.stdout.write(
        `  L${level.index} · ${level.name} — ${score.earned}/${score.max} (${score.percent}%)` +
          `${flags ? ` [${flags}]` : ''}` +
          `${detectedHarnesses.length ? ` — detected: ${detectedHarnesses.join(', ')}` : ''}\n`,
      );
      summary.push({ name: entry.name, ok: true, level: level.index, percent: score.percent });
    } catch (error) {
      process.stdout.write(`  FAILED: ${error.message}\n`);
      summary.push({ name: entry.name, ok: false, error: String(error.message ?? error) });
    }
  }

  const failed = summary.filter((s) => !s.ok);
  process.stdout.write(`\n${summary.length - failed.length}/${summary.length} scanned successfully.\n`);
  if (failed.length > 0) {
    process.stdout.write(`Failed: ${failed.map((f) => f.name).join(', ')}\n`);
    process.exitCode = 1;
  }
}
