#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statfsSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportMatchesToolVersion } from './lib/history.mjs';
import { worktreeMatchesHead } from './lib/scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const manifest = JSON.parse(readFileSync(path.join(here, 'manifest.json'), 'utf8'));
const selection = JSON.parse(readFileSync(path.join(here, 'selection-2026-10-09-ai-500.json'), 'utf8'));
const batchBudgetKiB = 8_000_000;
const cacheRoot = path.join(projectRoot, '.cache', 'repos');
const receiptPath = path.join(here, 'scan-receipt-2026-10-09-ai-popularity-500.json');
const auditPath = path.join(here, 'checkout-audit-2026-10-09-ai-popularity-500.json');
const inventory = new Map(selection.candidates.map((item) => [item.name, item]));

if (
  manifest.entries.length !== 651 ||
  manifest.runId !== selection.runId ||
  manifest.toolVersion !== selection.toolVersion
) {
  throw new Error('Manifest does not match the frozen AI-500 run identity.');
}
if (selection.candidates.length !== 500)
  throw new Error(`Expected 500 frozen candidates, found ${selection.candidates.length}.`);
if (!existsSync(cacheRoot)) mkdirSync(cacheRoot, { recursive: true });
for (const name of readdirSync(cacheRoot))
  if (!inventory.has(name))
    throw new Error(`Refusing to touch unknown cache path: ${path.join(cacheRoot, name)}`);

function run(file, args, cwd = projectRoot) {
  return execFileSync(file, args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
}

function sha256File(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function availableBytes() {
  const { bsize, bavail } = statfsSync(projectRoot);
  return Number(bsize) * Number(bavail);
}

function makeBatches() {
  const sorted = [...selection.candidates].sort((a, b) => a.popularityRank - b.popularityRank);
  const batches = [];
  let batch = [];
  let size = 0;
  for (const item of sorted) {
    const estimated = Number(item.sizeKiB) || 0;
    if (batch.length && size + estimated > batchBudgetKiB) {
      batches.push({ entries: batch, estimateKiB: size });
      batch = [];
      size = 0;
    }
    batch.push(item);
    size += estimated;
  }
  if (batch.length) batches.push({ entries: batch, estimateKiB: size });
  return batches;
}

function auditEntry(candidate) {
  const cwd = path.join(cacheRoot, candidate.name);
  const head = run('git', ['rev-parse', 'HEAD'], cwd).trim();
  if (head !== candidate.commit)
    throw new Error(`${candidate.name}: checked out ${head}, expected ${candidate.commit}`);
  if (!worktreeMatchesHead(cwd)) throw new Error(`${candidate.name}: incomplete or modified checkout`);
  const rows = run('git', ['ls-tree', '-r', '-z', 'HEAD'], cwd)
    .split('\0')
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('\t');
      const [mode, type, sha] = line.slice(0, separator).split(' ');
      return { mode, type, sha, path: line.slice(separator + 1) };
    });
  const lfsAttributeFiles = [];
  for (const item of rows.filter((row) => row.path.split('/').at(-1) === '.gitattributes')) {
    const content = run('git', ['show', `HEAD:${item.path}`], cwd);
    if (/filter\s*=\s*lfs/i.test(content)) lfsAttributeFiles.push(item.path);
  }
  const sourceSha = run('git', ['rev-parse', `HEAD:${candidate.codeEvidence.path}`], cwd).trim();
  const sourceSize = Number(run('git', ['cat-file', '-s', sourceSha], cwd).trim());
  if (sourceSha !== candidate.codeEvidence.blobSha || sourceSize !== candidate.codeEvidence.size) {
    throw new Error(`${candidate.name}: source evidence mismatch at ${candidate.codeEvidence.path}`);
  }
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
  const rootHarnessArtifacts = rows
    .filter(
      (item) =>
        !item.path.includes('/') &&
        /^(AGENTS\.md|CLAUDE\.md|GEMINI\.md|\.cursorrules|\.windsurfrules|\.github)$/i.test(item.path),
    )
    .map((item) => item.path);
  return {
    name: candidate.name,
    canonicalSlug: candidate.canonicalSlug,
    commit: head,
    checkoutStatus: 'complete',
    trackedTreeEntries: rows.length,
    longPathCount: rows.filter((item) => path.join(cwd, item.path).length >= 260).length,
    ntfsInvalidPaths,
    lfsAttributeFiles,
    submodulePaths: rows.filter((item) => item.mode === '160000').map((item) => item.path),
    symlinkCount: rows.filter((item) => item.mode === '120000').length,
    rootHarnessArtifacts,
    codeEvidence: {
      path: candidate.codeEvidence.path,
      blobSha: sourceSha,
      size: sourceSize,
      status: 'verified',
    },
  };
}

const batches = makeBatches();
const receipt = existsSync(receiptPath)
  ? JSON.parse(readFileSync(receiptPath, 'utf8'))
  : {
      selectionIssue: selection.issue,
      baselineCommit: selection.baselineCommit,
      scanner: manifest.toolVersion,
      platform: `${os.platform()} ${os.release()} ${os.arch()}`,
      batchBudgetKiB,
      startedAt: new Date().toISOString(),
      batches: [],
    };
const audited = existsSync(auditPath) ? JSON.parse(readFileSync(auditPath, 'utf8')).entries : [];
const done = new Set(receipt.batches.flatMap((batch) => batch.names));

for (const [index, batch] of batches.entries()) {
  const pending = batch.entries.filter((item) => !done.has(item.name));
  if (pending.length === 0) continue;
  const required = batch.estimateKiB * 1024 * 3 + 2 * 1024 ** 3;
  if (availableBytes() < required)
    throw new Error(
      `Insufficient free space before batch ${index + 1}: need safety budget ${required} bytes.`,
    );
  const names = pending.map((item) => item.name);
  const start = Date.now();
  console.log(
    `Batch ${index + 1}/${batches.length}: ${names.length} repositories, estimated ${batch.estimateKiB} KiB, free ${Math.round(availableBytes() / 1024 ** 3)} GiB.`,
  );
  run(process.execPath, ['corpus/run.mjs', '--only', names.join(',')]);

  const reports = pending.map((item) => {
    const file = path.join(here, 'reports', `${item.name}.json`);
    const report = JSON.parse(readFileSync(file, 'utf8'));
    if (!reportMatchesToolVersion(report, manifest.toolVersion))
      throw new Error(`${item.name}: report scanner version mismatch.`);
    if (report.truncated)
      throw new Error(
        `${item.name}: scanner report is truncated; retain checkout and revise the frozen cohort before proceeding.`,
      );
    return {
      name: item.name,
      reportSha256: sha256File(file),
      reportBytes: Buffer.byteLength(readFileSync(file)),
      scorePercent: report.score.percent,
      level: report.level.index,
      truncated: report.truncated,
    };
  });
  const newAudit = pending.map(auditEntry);
  audited.push(...newAudit);
  const batchRunId = `ai-popularity-500-batch-${String(index + 1).padStart(2, '0')}`;
  const auditDocument = {
    date: selection.selectionDate,
    runId: selection.runId,
    note: 'Pinned Git trees and worktree completeness were audited before cache cleanup. LFS smudging was disabled, submodules were not initialized, native Windows symlink behavior is recorded, and no target repository code was executed.',
    entries: audited,
  };
  writeFileSync(auditPath, `${JSON.stringify(auditDocument, null, 2)}\n`, 'utf8');
  const row = {
    batch: index + 1,
    batchRunId,
    names,
    estimateKiB: batch.estimateKiB,
    elapsedMs: Date.now() - start,
    reports,
    checkoutAuditEntries: newAudit.length,
  };
  receipt.batches.push(row);
  receipt.completedCount = receipt.batches.reduce((total, part) => total + part.names.length, 0);
  receipt.updatedAt = new Date().toISOString();
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');

  for (const item of pending) {
    const checkout = path.resolve(cacheRoot, item.name);
    if (!checkout.startsWith(`${path.resolve(cacheRoot)}${path.sep}`))
      throw new Error(`Unsafe cache cleanup target: ${checkout}`);
    rmSync(checkout, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
  }
  console.log(
    `Completed ${receipt.completedCount}/500; reports verified, checkout audit saved, temporary clones cleaned.`,
  );
}

if (receipt.completedCount !== 500 || audited.length !== 500)
  throw new Error(`Incomplete AI-500 run: reports=${receipt.completedCount}, audits=${audited.length}.`);
receipt.completedAt = new Date().toISOString();
receipt.reportCount = 500;
receipt.checkoutAuditPath = path.relative(projectRoot, auditPath).replaceAll(path.sep, '/');
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(`Verified all 500 reports and checkouts. Receipts: ${receiptPath}; ${auditPath}.`);
