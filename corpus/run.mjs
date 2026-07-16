#!/usr/bin/env node
// Pinned-clone + harness-score scan runner. Zero dependencies, same invariant
// as harness-score itself: given the same manifest, this produces the same
// reports, byte for byte (module the machine-local `root` path).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache', 'repos');
const REPORTS_DIR = path.join(__dirname, 'reports');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

function sh(file, args, cwd) {
  return execFileSync(file, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
  });
}

/**
 * Runs a command that might resolve to a Windows .cmd/.bat shim (npx does).
 * CreateProcess can't launch those directly — Windows needs cmd.exe to
 * interpret them — but `shell: true` makes Node build a raw command-line
 * string and only concatenate args into it, not escape them (see Node's
 * DEP0190). Routing through `cmd.exe /d /s /c <file> <args...>` instead
 * keeps every argument in execFileSync's normal argv array, so Node's
 * standard per-argument Windows escaping still applies — cmd.exe is a real
 * executable, not a shell string target.
 */
function shViaShim(file, args, cwd) {
  if (process.platform === 'win32') {
    return sh('cmd.exe', ['/d', '/s', '/c', file, ...args], cwd);
  }
  return sh(file, args, cwd);
}

function currentHead(dir) {
  try {
    return sh('git', ['rev-parse', 'HEAD'], dir).trim();
  } catch {
    return null;
  }
}

/**
 * Fetches exactly `commit` into `dest` — never the branch tip. Tries a
 * shallow fetch-by-SHA first (fast; GitHub/GitLab serve this for public
 * repos); falls back to a full clone + checkout for hosts that reject
 * fetching an arbitrary SHA directly.
 */
function pinnedClone(repoUrl, commit, dest) {
  if (existsSync(dest)) {
    if (currentHead(dest) === commit) return { reused: true };
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dest, { recursive: true });
  sh('git', ['init', '-q'], dest);
  sh('git', ['remote', 'add', 'origin', repoUrl], dest);
  try {
    sh('git', ['fetch', '--depth', '1', 'origin', commit], dest);
    sh('git', ['checkout', '-q', 'FETCH_HEAD'], dest);
  } catch {
    rmSync(dest, { recursive: true, force: true });
    sh('git', ['clone', '-q', repoUrl, dest]);
    sh('git', ['checkout', '-q', commit], dest);
  }
  const head = currentHead(dest);
  if (head !== commit) {
    throw new Error(`checked out ${head}, expected pinned commit ${commit}`);
  }
  return { reused: false };
}

function runHarnessScore(toolVersion, targetDir) {
  const out = shViaShim('npx', ['--yes', toolVersion, targetDir, '--json'], ROOT);
  return JSON.parse(out);
}

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
