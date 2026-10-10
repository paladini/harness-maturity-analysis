#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportMatchesToolVersion } from './lib/history.mjs';
import { worktreeMatchesHead } from './lib/scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const selection = JSON.parse(readFileSync(path.join(here, 'selection-2026-10-09-ai-500.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(here, 'manifest.json'), 'utf8'));
const receiptPath = path.join(here, 'scan-receipt-2026-10-09-ai-popularity-500.json');
const auditPath = path.join(here, 'checkout-audit-2026-10-09-ai-popularity-500.json');
const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
const recoveredName = 'aidlearning-framework';
const recoveredCandidate = selection.candidates.find((item) => item.name === recoveredName);
const run = (file, args, cwd) =>
  execFileSync(file, args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
const sha256File = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

function makeBatches() {
  const batches = [];
  let entries = [];
  let size = 0;
  for (const item of [...selection.candidates].sort((a, b) => a.popularityRank - b.popularityRank)) {
    const itemSize = Number(item.sizeKiB) || 0;
    if (entries.length && size + itemSize > 8_000_000) {
      batches.push({ entries, estimateKiB: size });
      entries = [];
      size = 0;
    }
    entries.push(item);
    size += itemSize;
  }
  if (entries.length) batches.push({ entries, estimateKiB: size });
  return batches;
}

function treeRows(raw) {
  return raw
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((record) => {
      const separator = record.indexOf('\t');
      const [mode, type, sha] = record.slice(0, separator).split(' ');
      return { mode, type, sha, path: record.slice(separator + 1) };
    });
}

function makeAudit(candidate, cwd) {
  const head = run('git', ['rev-parse', 'HEAD'], cwd).trim();
  if (head !== candidate.commit || !worktreeMatchesHead(cwd))
    throw new Error(`${candidate.name}: Windows cache is incomplete or modified.`);
  const rows = treeRows(Buffer.from(run('git', ['ls-tree', '-r', '-z', 'HEAD'], cwd), 'utf8'));
  const lfsAttributeFiles = [];
  for (const item of rows.filter((row) => row.path.split('/').at(-1) === '.gitattributes')) {
    if (/filter\s*=\s*lfs/i.test(run('git', ['show', `HEAD:${item.path}`], cwd)))
      lfsAttributeFiles.push(item.path);
  }
  const sourceSha = run('git', ['rev-parse', `HEAD:${candidate.codeEvidence.path}`], cwd).trim();
  const sourceSize = Number(run('git', ['cat-file', '-s', sourceSha], cwd).trim());
  if (sourceSha !== candidate.codeEvidence.blobSha || sourceSize !== candidate.codeEvidence.size)
    throw new Error(`${candidate.name}: source evidence differs from the frozen selection.`);
  return auditShape(candidate, rows, lfsAttributeFiles, cwd, null);
}

function auditShape(candidate, rows, lfsAttributeFiles, checkoutPath, checkoutEnvironment) {
  const source = rows.find((row) => row.path === candidate.codeEvidence.path);
  if (!source || source.sha !== candidate.codeEvidence.blobSha)
    throw new Error(`${candidate.name}: code evidence blob mismatch.`);
  const ntfsInvalidPaths = rows
    .filter((item) =>
      item.path
        .split('/')
        .some(
          (segment) =>
            /[<>:"|?*]/.test(segment) ||
            /[. ]$/.test(segment) ||
            /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(segment),
        ),
    )
    .map((item) => item.path);
  return {
    name: candidate.name,
    canonicalSlug: candidate.canonicalSlug,
    commit: candidate.commit,
    checkoutStatus: 'complete',
    trackedTreeEntries: rows.length,
    longPathCount: rows.filter((item) => path.join(checkoutPath, item.path).length >= 260).length,
    ntfsInvalidPaths,
    lfsAttributeFiles,
    submodulePaths: rows.filter((item) => item.mode === '160000').map((item) => item.path),
    symlinkCount: rows.filter((item) => item.mode === '120000').length,
    rootHarnessArtifacts: rows
      .filter(
        (item) =>
          !item.path.includes('/') &&
          /^(AGENTS\.md|CLAUDE\.md|GEMINI\.md|\.cursorrules|\.windsurfrules|\.github)$/i.test(item.path),
      )
      .map((item) => item.path),
    codeEvidence: {
      path: candidate.codeEvidence.path,
      blobSha: source.sha,
      size: candidate.codeEvidence.size,
      status: 'verified',
    },
    ...(checkoutEnvironment ? { checkoutEnvironment } : {}),
  };
}

const batches = makeBatches();
const batchIndex = 14;
const batch = batches[batchIndex];
if (receipt.completedCount !== 421 || receipt.batches.some((part) => part.batch === batchIndex + 1))
  throw new Error('Unexpected receipt state; refusing duplicate batch integration.');
if (
  batch?.entries.length !== 60 ||
  !recoveredCandidate ||
  !existsSync(path.join(here, 'reports', `${recoveredName}.json`))
)
  throw new Error('Recovered batch or Linux report is incomplete.');
const audited = new Set(audit.entries.map((entry) => entry.name));
const names = batch.entries.map((item) => item.name);
if (
  names.some((name) => receipt.batches.some((part) => part.names.includes(name))) ||
  names.some((name) => audited.has(name))
)
  throw new Error('Recovered batch overlaps existing run evidence.');

const recoveredRows = treeRows(readFileSync(path.join(here, 'aidlearning-framework-tree.bin')));
const source = recoveredRows.find((row) => row.path === recoveredCandidate.codeEvidence.path);
if (!source || source.sha !== recoveredCandidate.codeEvidence.blobSha)
  throw new Error('Linux checkout source evidence mismatch.');
const lfsAttributeFiles = readFileSync(path.join(here, 'aidlearning-framework-lfs.txt'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((item) => item.replace(/^HEAD:/, ''));
const invalidPaths = recoveredRows
  .filter((item) =>
    item.path
      .split('/')
      .some(
        (segment) =>
          /[<>:"|?*]/.test(segment) ||
          /[. ]$/.test(segment) ||
          /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(segment),
      ),
  )
  .map((item) => item.path);
const aidLearningAudit = auditShape(
  recoveredCandidate,
  recoveredRows,
  lfsAttributeFiles,
  '/tmp/codex-ai500-aidlearning-framework/repo',
  {
    platform: 'WSL2 Ubuntu 24.04 on Linux filesystem',
    node: 'v24.15.0',
    git: readFileSync(path.join(here, 'aidlearning-framework-git-version.txt'), 'utf8').trim(),
    nativeSymlinks: true,
    reason:
      'Windows checkout changed two tracked image blobs despite the pinned Git tree; Linux checkout at the same commit is clean, complete, and preserves all scan signals.',
    windowsModifiedPaths: ['image/AidLearning-1.png', 'image/AidLearning.png'],
    windowsModifiedPathCount: 2,
  },
);
if (invalidPaths.length !== 0 || aidLearningAudit.checkoutStatus !== 'complete')
  throw new Error('Linux checkout inventory is not complete.');

const auditEntries = batch.entries.map((candidate) =>
  candidate.name === recoveredName
    ? aidLearningAudit
    : makeAudit(candidate, path.join(root, '.cache', 'repos', candidate.name)),
);
const reportRows = batch.entries.map((candidate) => {
  const file = path.join(here, 'reports', `${candidate.name}.json`);
  const report = JSON.parse(readFileSync(file, 'utf8'));
  if (!reportMatchesToolVersion(report, manifest.toolVersion) || report.truncated)
    throw new Error(`${candidate.name}: report is mismatched or truncated.`);
  return {
    name: candidate.name,
    reportSha256: sha256File(file),
    reportBytes: Buffer.byteLength(readFileSync(file)),
    scorePercent: report.score.percent,
    level: report.level.index,
    truncated: report.truncated,
  };
});

audit.entries.push(...auditEntries);
audit.entries.sort(
  (a, b) =>
    selection.candidates.findIndex((item) => item.name === a.name) -
    selection.candidates.findIndex((item) => item.name === b.name),
);
receipt.batches.push({
  batch: batchIndex + 1,
  batchRunId: `ai-popularity-500-recovered-batch-${batchIndex + 1}`,
  names,
  estimateKiB: batch.estimateKiB,
  elapsedMs: null,
  reports: reportRows,
  checkoutAuditEntries: auditEntries.length,
  recoveredAfterWindowsFailure: true,
});
receipt.batches.sort((a, b) => a.batch - b.batch);
receipt.completedCount = receipt.batches.reduce((total, part) => total + part.names.length, 0);
receipt.updatedAt = new Date().toISOString();
audit.date = '2026-10-09';
audit.runId = selection.runId;
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(
  `Recovered batch ${batchIndex + 1}: completed=${receipt.completedCount}, audited=${audit.entries.length}, Linux fallback=${recoveredName}.`,
);
