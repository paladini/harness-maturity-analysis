#!/usr/bin/env node
// Score any repository — not just the curated corpus — with the exact same
// pinned harness-score version this study uses. Local paths are scanned
// directly (no clone); URLs are shallow-cloned into a gitignored scratch
// dir and deleted afterward unless --keep is passed. Never runs code from
// the scanned repository, same invariant as corpus/run.mjs.
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rankReports } from './lib/results.mjs';
import { looseClone, resolveDefaultRef, runHarnessScore } from './lib/scan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ADHOC_CACHE_DIR = path.join(ROOT, '.cache', 'adhoc');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const REPORTS_DIR = path.join(__dirname, 'reports');

const HELP = `score-adhoc — score any repository with this study's pinned harness-score version

Usage:
  node corpus/score-adhoc.mjs <repo-url-or-local-path> [options]

Options:
  --ref <branch-or-sha>   Check out this ref (default: the repo's default branch tip).
                          Ignored for local-path targets.
  --subpath <path>        Scan only a subdirectory (for monorepos).
  --json                  Print the raw harness-score JSON report instead of a summary.
  --md <file>             Also write a markdown report (harness-score's own renderer) to <file>.
  --keep                  Keep the clone under .cache/adhoc/<name> instead of deleting it.
  --no-compare            Skip the "how would this rank in the corpus" line.
  --help                  Show this help.

This is for a quick, one-off reading. To add a repository to the formal
corpus permanently (pinned commit, versioned report, entry in
results/leaderboard.md), use the add-corpus-entry skill instead — it's the
same underlying scan, plus the bookkeeping that makes a result citable.
`;

export function parseArgs(argv) {
  const args = {
    target: null,
    ref: null,
    subpath: null,
    json: false,
    md: null,
    keep: false,
    compare: true,
    help: false,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--ref') args.ref = argv[++i] ?? null;
    else if (a === '--subpath') args.subpath = argv[++i] ?? null;
    else if (a === '--json') args.json = true;
    else if (a === '--md') args.md = argv[++i] ?? null;
    else if (a === '--keep') args.keep = true;
    else if (a === '--no-compare') args.compare = false;
    else if (a.startsWith('-')) throw new Error(`unknown option: ${a}`);
    else positional.push(a);
  }
  args.target = positional[0] ?? null;
  return args;
}

function isLocalDir(target) {
  try {
    return statSync(target).isDirectory();
  } catch {
    return false;
  }
}

export function slugFromUrl(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\.git$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function compareToCorpus(name, report) {
  if (!existsSync(MANIFEST_PATH)) return null;
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const reportsByName = new Map();
  for (const entry of manifest.entries) {
    const p = path.join(REPORTS_DIR, `${entry.name}.json`);
    if (existsSync(p)) reportsByName.set(entry.name, JSON.parse(readFileSync(p, 'utf8')));
  }
  const adhocKey = `\0adhoc:${name}`; // NUL-prefixed: can't collide with a real manifest entry name
  reportsByName.set(adhocKey, report);
  const { rows } = rankReports([...manifest.entries, { name: adhocKey }], reportsByName);
  const idx = rows.findIndex((r) => r.entry.name === adhocKey);
  if (idx === -1) return null;
  return { corpusSize: rows.length - 1, above: rows[idx - 1]?.entry.name, below: rows[idx + 1]?.entry.name };
}

function printSummary(label, report, compare) {
  const { level, score, dimensions, truncated, detectedHarnesses } = report;
  process.stdout.write(`\n${label}\n\n`);
  process.stdout.write(
    `  L${level.index} · ${level.name} — ${score.earned}/${score.max} (${score.percent}%)`,
  );
  process.stdout.write(truncated ? '  [TRUNCATED — hit the file-count cap]\n' : '\n');
  process.stdout.write(
    `  ${dimensions.map((d) => `${d.title.replace(/ & /, '/')} ${d.percent}%`).join('  ·  ')}\n`,
  );
  if (detectedHarnesses.length) process.stdout.write(`  Detected: ${detectedHarnesses.join(', ')}\n`);
  if (level.nextLevelGaps.length) {
    process.stdout.write(`\n  To reach L${level.index + 1}: ${level.nextLevelGaps.join('; ')}\n`);
  }

  const gaps = report.checks
    .filter((c) => !c.passed)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);
  if (gaps.length) {
    process.stdout.write('\n  Biggest wins available:\n');
    for (const g of gaps) {
      process.stdout.write(`   ✗ ${g.id} ${g.title} (+${g.points} pts)\n`);
    }
  }

  if (compare?.corpusSize) {
    const between = [compare.above && `below ${compare.above}`, compare.below && `above ${compare.below}`]
      .filter(Boolean)
      .join(', ');
    process.stdout.write(
      `\n  Among the ${compare.corpusSize} corpus repositories, this would land ${between}.\n`,
    );
  }
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');

if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.target) {
    process.stdout.write(HELP);
    process.exit(args.help ? 0 : 2);
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  let scanTarget;
  let label;
  let cleanupDir = null;

  try {
    if (isLocalDir(args.target)) {
      scanTarget = path.resolve(args.target, args.subpath ?? '.');
      label = `${path.resolve(args.target)} (local)`;
    } else {
      const ref = args.ref ?? resolveDefaultRef(args.target).sha;
      const dest = path.join(ADHOC_CACHE_DIR, args.keep ? slugFromUrl(args.target) : `tmp-${Date.now()}`);
      mkdirSync(ADHOC_CACHE_DIR, { recursive: true });
      process.stderr.write(`Cloning ${args.target} @ ${ref.slice(0, 12)}...\n`);
      const { reused, headSha } = looseClone(args.target, ref, dest);
      process.stderr.write(`${reused ? 'Reused cached clone' : 'Fetched'} @ ${headSha.slice(0, 12)}\n`);
      scanTarget = args.subpath ? path.join(dest, args.subpath) : dest;
      label = `${args.target} @ ${headSha.slice(0, 12)}`;
      cleanupDir = args.keep ? null : dest;
    }

    const mdArgs = args.md ? ['--md', args.md] : [];
    const report = runHarnessScore(manifest.toolVersion, scanTarget, mdArgs);

    if (args.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      const compare = args.compare ? compareToCorpus(slugFromUrl(args.target ?? 'local'), report) : null;
      printSummary(label, report, compare);
    }
  } catch (error) {
    process.stderr.write(`\nscore-adhoc: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    if (cleanupDir && existsSync(cleanupDir)) {
      rmSync(cleanupDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    }
  }
}
