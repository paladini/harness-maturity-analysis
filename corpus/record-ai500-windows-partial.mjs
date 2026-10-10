import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const corpus = path.join(root, 'corpus');
const selection = JSON.parse(readFileSync(path.join(corpus, 'selection-2026-10-09-ai-500.json'), 'utf8'));
const cache = path.join(root, '.cache', 'repos');
const reportDir = path.join(corpus, 'reports');
const completed = readdirSync(cache).filter(
  (name) => name !== 'llm-action' && readdirSync(reportDir).includes(`${name}.json`),
);
const byName = new Map(selection.candidates.map((item) => [item.name, item]));
const candidates = completed.map((name) => byName.get(name));
if (completed.length !== 31 || candidates.some((item) => !item))
  throw new Error(`Unexpected Windows partial batch size: ${completed.length}`);

const batchSelectionPath = path.join(corpus, 'selection-ai500-batch-07-windows.json');
const batchSelection = {
  selectionDate: selection.selectionDate,
  runId: 'ai-popularity-500-batch-07-windows',
  candidates,
};
writeFileSync(batchSelectionPath, `${JSON.stringify(batchSelection, null, 2)}\n`);
execFileSync(process.execPath, ['corpus/audit-checkouts.mjs', batchSelectionPath], {
  cwd: root,
  stdio: 'inherit',
});
const batchAuditPath = path.join(corpus, 'checkout-audit-2026-10-09-ai-popularity-500-batch-07-windows.json');
const batchAudit = JSON.parse(readFileSync(batchAuditPath, 'utf8'));
const auditPath = path.join(corpus, 'checkout-audit-2026-10-09-ai-popularity-500.json');
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
audit.entries.push(...batchAudit.entries);
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

const receiptPath = path.join(corpus, 'scan-receipt-2026-10-09-ai-popularity-500.json');
const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
const reportRows = completed.map((name) => {
  const file = path.join(reportDir, `${name}.json`);
  const report = JSON.parse(readFileSync(file, 'utf8'));
  if (report.truncated) throw new Error(`${name} unexpectedly has a truncated report`);
  return {
    name,
    reportSha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    reportBytes: readFileSync(file).length,
    scorePercent: report.score.percent,
    level: report.level.index,
    truncated: report.truncated,
  };
});
receipt.batches.push({
  batch: 7,
  batchRunId: 'ai-popularity-500-batch-07',
  names: completed,
  estimateKiB: candidates.reduce((sum, item) => sum + (Number(item.sizeKiB) || 0), 0),
  reports: reportRows,
  checkoutAuditEntries: batchAudit.entries.length,
  status: 'partial; Windows rejected one tracked path with a trailing space; Linux WSL verification pending',
  windowsFailure: {
    name: 'llm-action',
    repo: 'liguodongiot/llm-action',
    path: 'llm-algo/transformer/README.md ',
    reason: 'NTFS cannot represent this tracked path; no checkout exclusion was applied.',
  },
});
receipt.completedCount = receipt.batches.reduce((total, batch) => total + batch.names.length, 0);
receipt.updatedAt = new Date().toISOString();
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

for (const name of completed) {
  const checkout = path.resolve(cache, name);
  if (!checkout.startsWith(`${path.resolve(cache)}${path.sep}`))
    throw new Error(`Unsafe cleanup target: ${checkout}`);
  rmSync(checkout, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
}
rmSync(batchSelectionPath, { force: true });
rmSync(batchAuditPath, { force: true });
console.log(
  `Recorded ${completed.length} audited Windows checkouts; preserved failed llm-action checkout; cumulative reports=${receipt.completedCount}.`,
);
