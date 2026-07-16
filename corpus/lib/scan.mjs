// Shared clone + scan engine. corpus/run.mjs (strict, SHA-pinned, corpus-only)
// and corpus/score-adhoc.mjs (loose, any ref, any repo) both build on
// cloneAtRef() so the tricky cross-platform bits — the Windows npx .cmd
// EINVAL fix, the shallow-fetch-then-full-clone fallback — exist exactly
// once.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

export function sh(file, args, cwd) {
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
export function shViaShim(file, args, cwd) {
  if (process.platform === 'win32') {
    return sh('cmd.exe', ['/d', '/s', '/c', file, ...args], cwd);
  }
  return sh(file, args, cwd);
}

export function currentHead(dir) {
  try {
    return sh('git', ['rev-parse', 'HEAD'], dir).trim();
  } catch {
    return null;
  }
}

/**
 * Fetches `ref` (a full SHA, a branch, or a tag) into `dest`. Tries a
 * shallow fetch first (fast; GitHub/GitLab serve this for public repos even
 * for arbitrary SHAs, not just branch tips); falls back to a full clone for
 * hosts that reject it. Reuses an existing `dest` only when its current
 * HEAD already matches `ref` exactly (which in practice only ever happens
 * for full-SHA refs — a branch name never string-equals a HEAD SHA, so
 * branch/tag requests always re-fetch, which is correct: the branch may
 * have moved since last time).
 */
export function cloneAtRef(repoUrl, ref, dest) {
  if (existsSync(dest)) {
    if (currentHead(dest) === ref) return { reused: true, headSha: ref };
    rmSync(dest, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
  }
  mkdirSync(dest, { recursive: true });
  sh('git', ['init', '-q'], dest);
  sh('git', ['remote', 'add', 'origin', repoUrl], dest);
  try {
    sh('git', ['fetch', '--depth', '1', 'origin', ref], dest);
    sh('git', ['checkout', '-q', 'FETCH_HEAD'], dest);
  } catch {
    rmSync(dest, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    sh('git', ['clone', '-q', repoUrl, dest]);
    sh('git', ['checkout', '-q', ref], dest);
  }
  return { reused: false, headSha: currentHead(dest) };
}

/** Strict: throws unless the checked-out HEAD is exactly `commit`. Corpus pipeline only. */
export function pinnedClone(repoUrl, commit, dest) {
  const { reused, headSha } = cloneAtRef(repoUrl, commit, dest);
  if (headSha !== commit) {
    throw new Error(`checked out ${headSha}, expected pinned commit ${commit}`);
  }
  return { reused };
}

/** Loose: any ref, no equality check — just confirms *something* was checked out. Ad-hoc use only. */
export function looseClone(repoUrl, ref, dest) {
  const { reused, headSha } = cloneAtRef(repoUrl, ref, dest);
  if (!headSha) {
    throw new Error(`clone of ${repoUrl}@${ref} produced no resolvable HEAD`);
  }
  return { reused, headSha };
}

/**
 * Parses `git ls-remote --symref <url> HEAD` output into a branch name and
 * SHA. Pure — no I/O — so it's unit-testable without a network call. Both
 * the symref line and the SHA line end in "\tHEAD"; the symref line is the
 * one distinguished by also starting with "ref:".
 */
export function parseLsRemoteSymref(output) {
  const lines = output.trim().split('\n');
  const symrefLine = lines.find((l) => l.startsWith('ref:'));
  const shaLine = lines.find((l) => /\tHEAD$/.test(l) && !l.startsWith('ref:'));
  const sha = shaLine ? shaLine.split('\t')[0] : null;
  const branch = symrefLine ? symrefLine.replace(/^ref:\s*refs\/heads\//, '').replace(/\tHEAD$/, '') : null;
  return { branch, sha };
}

/** Resolves a repo's default branch name and current tip SHA via `git ls-remote`. */
export function resolveDefaultRef(repoUrl) {
  const out = sh('git', ['ls-remote', '--symref', repoUrl, 'HEAD'], process.cwd());
  const { branch, sha } = parseLsRemoteSymref(out);
  if (!sha) {
    throw new Error(`could not resolve HEAD for ${repoUrl} (private repo, wrong URL, or no network?)`);
  }
  return { branch, sha };
}

export function runHarnessScore(toolVersion, targetDir, extraArgs = []) {
  const out = shViaShim('npx', ['--yes', toolVersion, targetDir, '--json', ...extraArgs], process.cwd());
  return JSON.parse(out);
}
