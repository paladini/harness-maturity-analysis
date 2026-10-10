#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportMatchesToolVersion } from './lib/history.mjs';
import { worktreeMatchesHead } from './lib/scan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const cacheRoot = path.join(root, '.cache', 'repos');
const selection = JSON.parse(readFileSync(path.join(here, 'selection-2026-10-09-ai-500.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(here, 'manifest.json'), 'utf8'));
const receiptPath = path.join(here, 'scan-receipt-2026-10-09-ai-popularity-500.json');
const auditPath = path.join(here, 'checkout-audit-2026-10-09-ai-popularity-500.json');
const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
const replacementNames = selection.qualityReview.replacements.map((item) => item.name);
const replacements = selection.candidates.filter((item) => replacementNames.includes(item.name));
const run = (file, args, cwd) =>
  execFileSync(file, args, { cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
const sha256File = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const inventory = new Map(selection.candidates.map((item) => [item.name, item]));

if (
  manifest.entries.length !== 651 ||
  selection.candidates.length !== 500 ||
  receipt.completedCount !== 482 ||
  audit.entries.length !== 482 ||
  replacements.length !== 18
)
  throw new Error('Unexpected pre-replacement receipt state.');
if (receipt.batches.some((batch) => batch.batch === 17))
  throw new Error('Replacement batch is already recorded.');

function rowsFor(cwd) {
  return run('git', ['ls-tree', '-r', '-z', 'HEAD'], cwd)
    .split('\0')
    .filter(Boolean)
    .map((line) => {
      const tab = line.indexOf('\t');
      const [mode, type, sha] = line.slice(0, tab).split(' ');
      return { mode, type, sha, path: line.slice(tab + 1) };
    });
}
function auditEntry(candidate) {
  const cwd = path.join(cacheRoot, candidate.name);
  const head = run('git', ['rev-parse', 'HEAD'], cwd).trim();
  if (head !== candidate.commit || !worktreeMatchesHead(cwd))
    throw new Error(`${candidate.name}: checkout differs from its pinned clean tree.`);
  const rows = rowsFor(cwd);
  const lfsAttributeFiles = rows
    .filter((row) => row.path.split('/').at(-1) === '.gitattributes')
    .filter((row) => /filter\s*=\s*lfs/i.test(run('git', ['show', `HEAD:${row.path}`], cwd)))
    .map((row) => row.path);
  const sourceSha = run('git', ['rev-parse', `HEAD:${candidate.codeEvidence.path}`], cwd).trim();
  const sourceSize = Number(run('git', ['cat-file', '-s', sourceSha], cwd).trim());
  if (sourceSha !== candidate.codeEvidence.blobSha || sourceSize !== candidate.codeEvidence.size)
    throw new Error(`${candidate.name}: implementation evidence mismatch.`);
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
    commit: head,
    checkoutStatus: 'complete',
    trackedTreeEntries: rows.length,
    longPathCount: rows.filter((item) => path.join(cwd, item.path).length >= 260).length,
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
      blobSha: sourceSha,
      size: sourceSize,
      status: 'verified',
    },
  };
}

const audits = replacements.map(auditEntry);
const reports = replacements.map((candidate) => {
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

const priorNames = new Set(audit.entries.map((item) => item.name));
if (audits.some((item) => priorNames.has(item.name)))
  throw new Error('Replacement checkout audit overlaps existing entries.');
audit.entries.push(...audits);
const selectedOrder = new Map(selection.candidates.map((item, index) => [item.name, index]));
audit.entries.sort((a, b) => selectedOrder.get(a.name) - selectedOrder.get(b.name));
const names = replacements.map((item) => item.name);
receipt.batches.push({
  batch: 17,
  batchRunId: 'ai-popularity-500-quality-replacements',
  names,
  estimateKiB: replacements.reduce((sum, item) => sum + Number(item.sizeKiB || 0), 0),
  elapsedMs: null,
  reports,
  checkoutAuditEntries: audits.length,
  qualityReplacementBatch: true,
});
receipt.completedCount = receipt.batches.reduce((sum, batch) => sum + batch.names.length, 0);
if (receipt.completedCount !== 500 || audit.entries.length !== 500)
  throw new Error(
    `Replacement integration incomplete: reports=${receipt.completedCount}, audits=${audit.entries.length}.`,
  );

const manifestNames = new Set(manifest.entries.map((item) => item.name));
const reportNames = new Set(
  readdirSync(path.join(here, 'reports'))
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -5)),
);
for (const item of selection.candidates) {
  if (!manifestNames.has(item.name) || !reportNames.has(item.name))
    throw new Error(`Selected item is missing manifest/report evidence: ${item.name}`);
}
const reportsChecked = selection.candidates.map((item) => {
  const report = JSON.parse(readFileSync(path.join(here, 'reports', `${item.name}.json`), 'utf8'));
  if (!reportMatchesToolVersion(report, manifest.toolVersion) || report.truncated)
    throw new Error(`${item.name}: report is mismatched or truncated.`);
  return item.name;
});
if (reportsChecked.length !== 500 || new Set(reportsChecked).size !== 500)
  throw new Error('Final report identity set is not exactly 500.');

receipt.completedAt = new Date().toISOString();
receipt.reportCount = 500;
receipt.checkoutAuditPath = path.relative(root, auditPath).replaceAll(path.sep, '/');
receipt.updatedAt = receipt.completedAt;
audit.runId = selection.runId;
audit.note +=
  ' Quality review removed 18 reference-only learning repositories and replaced them with pinned AI software; all 500 final reports and checkouts have been reverified.';
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

const allowedCacheNames = new Set([...inventory.keys()]);
const auditedNames = new Set(audit.entries.map((item) => item.name));
for (const name of readdirSync(cacheRoot)) {
  const target = path.resolve(cacheRoot, name);
  if (
    !allowedCacheNames.has(name) ||
    !auditedNames.has(name) ||
    !target.startsWith(`${path.resolve(cacheRoot)}${path.sep}`)
  )
    throw new Error(`Refusing unverified cache cleanup: ${target}`);
  rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
}
console.log(
  `Final cohort verified: reports=500; audits=500; tool=${manifest.toolVersion}; temporary checkouts cleaned.`,
);
