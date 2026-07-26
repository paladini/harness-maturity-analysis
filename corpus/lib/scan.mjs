// Shared clone + scan engine. corpus/run.mjs (strict, SHA-pinned, corpus-only)
// and corpus/score-adhoc.mjs (loose, any ref, any repo) both build on
// cloneAtRef() so the tricky cross-platform bits — the Windows npx .cmd
// EINVAL fix, the shallow-fetch-then-full-clone fallback — exist exactly
// once.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { reportMatchesToolVersion } from './history.mjs';

const GIT_HTTP_OPTIONS = [
  '-c',
  'http.version=HTTP/1.1',
  '-c',
  'http.lowSpeedLimit=1',
  '-c',
  'http.lowSpeedTime=30',
];

export function sh(file, args, cwd, { env = {} } = {}) {
  return execFileSync(file, args, {
    cwd,
    env: { ...process.env, ...env },
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
export function sparseCheckoutPatterns(excludes = []) {
  const patterns = excludes.map((excludedPath) => {
    const normalized = excludedPath.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
    if (!normalized || normalized.split('/').includes('..')) {
      throw new Error(`invalid checkout exclusion: ${excludedPath}`);
    }
    return `!/${normalized}/**`;
  });
  return ['/*', ...patterns];
}

function checkoutMatches(ref, dest, checkoutExcludes) {
  if (currentHead(dest) !== ref) return false;

  const sparseCheckoutPath = path.join(dest, '.git', 'info', 'sparse-checkout');
  if (checkoutExcludes.length > 0) {
    if (!existsSync(sparseCheckoutPath)) return false;
    const expected = `${sparseCheckoutPatterns(checkoutExcludes).join('\n')}\n`;
    if (readFileSync(sparseCheckoutPath, 'utf8') !== expected) return false;
  } else if (existsSync(sparseCheckoutPath)) {
    return false;
  }

  try {
    sh('git', ['diff-index', '--quiet', 'HEAD', '--'], dest);
    return true;
  } catch {
    return false;
  }
}

export function cloneAtRef(repoUrl, ref, dest, { checkoutExcludes = [] } = {}) {
  if (existsSync(dest)) {
    if (checkoutMatches(ref, dest, checkoutExcludes)) return { reused: true, headSha: ref };
    rmSync(dest, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
  }
  mkdirSync(dest, { recursive: true });
  sh('git', ['init', '-q'], dest);
  sh('git', ['remote', 'add', 'origin', repoUrl], dest);
  if (checkoutExcludes.length > 0) {
    sh('git', ['config', 'core.sparseCheckout', 'true'], dest);
    sh('git', ['config', 'core.protectNTFS', 'false'], dest);
    const sparseCheckoutPath = path.join(dest, '.git', 'info', 'sparse-checkout');
    writeFileSync(sparseCheckoutPath, `${sparseCheckoutPatterns(checkoutExcludes).join('\n')}\n`, 'utf8');
  }
  let checkoutTarget = 'FETCH_HEAD';
  const objectFilter = checkoutExcludes.length > 0 ? ['--filter=blob:none'] : [];
  try {
    sh('git', [...GIT_HTTP_OPTIONS, 'fetch', ...objectFilter, '--depth', '1', 'origin', ref], dest);
  } catch {
    sh(
      'git',
      [
        ...GIT_HTTP_OPTIONS,
        'fetch',
        ...objectFilter,
        'origin',
        '+refs/heads/*:refs/remotes/origin/*',
        '+refs/tags/*:refs/tags/*',
      ],
      dest,
    );
    checkoutTarget = ref;
  }
  sh('git', ['checkout', '-q', checkoutTarget], dest, {
    env: { GIT_LFS_SKIP_SMUDGE: '1' },
  });
  return { reused: false, headSha: currentHead(dest) };
}

/** Strict: throws unless the checked-out HEAD is exactly `commit`. Corpus pipeline only. */
export function pinnedClone(repoUrl, commit, dest, options) {
  const { reused, headSha } = cloneAtRef(repoUrl, commit, dest, options);
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
  const out = sh('git', [...GIT_HTTP_OPTIONS, 'ls-remote', '--symref', repoUrl, 'HEAD'], process.cwd());
  const { branch, sha } = parseLsRemoteSymref(out);
  if (!sha) {
    throw new Error(`could not resolve HEAD for ${repoUrl} (private repo, wrong URL, or no network?)`);
  }
  return { branch, sha };
}

export function runHarnessScore(toolVersion, targetDir, extraArgs = []) {
  const out = shViaShim('npx', ['--yes', toolVersion, targetDir, '--json', ...extraArgs], process.cwd());
  const report = JSON.parse(out);
  if (!reportMatchesToolVersion(report, toolVersion)) {
    throw new Error(
      `scanner returned ${report?.tool?.name ?? 'unknown'}@${report?.tool?.version ?? 'unknown'}, expected ${toolVersion}`,
    );
  }
  return report;
}
