import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const corpus = path.join(root, 'corpus');
const selection = JSON.parse(readFileSync(path.join(corpus, 'selection-2026-10-09-ai-500.json'), 'utf8'));
const candidate = selection.candidates.find((item) => item.name === 'llm-action');
if (!candidate) throw new Error('llm-action is missing from the frozen selection.');
const rawTree = readFileSync(path.join(corpus, 'llm-action-tree.bin'));
const entries = rawTree
  .toString('utf8')
  .split('\0')
  .filter(Boolean)
  .map((record) => {
    const separator = record.indexOf('\t');
    const [mode, type, sha] = record.slice(0, separator).split(' ');
    return { mode, type, sha, path: record.slice(separator + 1) };
  });
const source = entries.find((item) => item.path === candidate.codeEvidence.path);
if (!source || source.sha !== candidate.codeEvidence.blobSha)
  throw new Error('Linux tree source blob does not match the frozen evidence.');
const invalidNtfsPaths = entries
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
if (!invalidNtfsPaths.includes('llm-algo/transformer/README.md '))
  throw new Error('Expected Windows-incompatible tracked path was not verified.');
const lfsPaths = readFileSync(path.join(corpus, 'llm-action-lfs.txt'), 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((item) => item.replace(/^HEAD:/, ''));
const auditEntry = {
  name: candidate.name,
  canonicalSlug: candidate.canonicalSlug,
  commit: candidate.commit,
  checkoutStatus: 'complete',
  trackedTreeEntries: entries.length,
  longPathCount: entries.filter(
    (item) => path.join('/tmp/codex-ai500-llm-action/repo', item.path).length >= 260,
  ).length,
  ntfsInvalidPaths: invalidNtfsPaths,
  lfsAttributeFiles: lfsPaths,
  submodulePaths: entries.filter((item) => item.mode === '160000').map((item) => item.path),
  symlinkCount: entries.filter((item) => item.mode === '120000').length,
  rootHarnessArtifacts: entries
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
  checkoutEnvironment: {
    platform: 'WSL2 Ubuntu 24.04 on Linux filesystem',
    node: 'v24.15.0',
    git: readFileSync(path.join(corpus, 'llm-action-git-version.txt'), 'utf8').trim(),
    nativeSymlinks: true,
    reason:
      'Windows NTFS rejects the pinned tracked path llm-algo/transformer/README.md with a trailing space. The full pinned tree, including that path, was checked out and scanned intact on Linux.',
  },
};

const auditPath = path.join(corpus, 'checkout-audit-2026-10-09-ai-popularity-500.json');
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
if (audit.entries.some((item) => item.name === candidate.name))
  throw new Error('Duplicate llm-action checkout audit entry.');
audit.entries.push(auditEntry);
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

const reportPath = path.join(corpus, 'reports', `${candidate.name}.json`);
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
if (report.tool?.name !== 'harness-score' || report.tool.version !== '1.8.1' || report.truncated)
  throw new Error('WSL scan report failed version or completeness verification.');
const batchRow = {
  name: candidate.name,
  reportSha256: createHash('sha256').update(readFileSync(reportPath)).digest('hex'),
  reportBytes: readFileSync(reportPath).length,
  scorePercent: report.score.percent,
  level: report.level.index,
  truncated: report.truncated,
};
const receiptPath = path.join(corpus, 'scan-receipt-2026-10-09-ai-popularity-500.json');
const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
const partialBatch = receipt.batches.find((item) => item.batch === 7);
if (!partialBatch || partialBatch.names.includes(candidate.name))
  throw new Error('Unexpected batch 7 receipt state.');
partialBatch.names.push(candidate.name);
partialBatch.names.sort(
  (a, b) =>
    selection.candidates.findIndex((item) => item.name === a) -
    selection.candidates.findIndex((item) => item.name === b),
);
partialBatch.reports.push(batchRow);
partialBatch.checkoutAuditEntries = 32;
partialBatch.status = 'complete; one NTFS-incompatible tracked path was scanned intact on WSL2 Ubuntu 24.04';
partialBatch.linuxFallback = {
  name: candidate.name,
  platform: auditEntry.checkoutEnvironment.platform,
  path: 'llm-algo/transformer/README.md ',
  reason: 'Windows invalid trailing-space path; no checkout exclusion or signal loss.',
};
receipt.completedCount = receipt.batches.reduce((total, batch) => total + batch.names.length, 0);
receipt.updatedAt = new Date().toISOString();
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(
  `WSL fallback recorded; reports=${receipt.completedCount}; audited checkouts=${audit.entries.length}; source/tree=${entries.length} entries.`,
);
