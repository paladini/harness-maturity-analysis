#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const selectionPath = 'corpus/selection-2026-10-09-ai-500.json';
const manifestPath = 'corpus/manifest.json';
const receiptPath = 'corpus/scan-receipt-2026-10-09-ai-popularity-500.json';
const auditPath = 'corpus/checkout-audit-2026-10-09-ai-popularity-500.json';
const reviewPath = 'corpus/ai500-replacement-review.json';
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
const oldByName = new Map(selection.candidates.map((item) => [item.name, item]));
if (
  manifest.entries.length !== 651 ||
  selection.candidates.length !== 500 ||
  receipt.completedCount !== 500 ||
  audit.entries.length !== 500
) {
  throw new Error('Unexpected complete-run state; refusing to apply replacements.');
}
if (review.removed.length !== 18 || review.replacements.length !== 18)
  throw new Error('Expected 18 reviewed replacements.');
if (review.removed.some((item) => !oldByName.has(item.name)))
  throw new Error('A reviewed exclusion is absent from the frozen selection.');
const removeNames = new Set(review.removed.map((item) => item.name));
const replacementsById = new Set(review.replacements.map((item) => item.githubRepositoryId));
if (replacementsById.size !== review.replacements.length)
  throw new Error('Replacement GitHub IDs are not unique.');
const currentSelectionIds = new Set(selection.candidates.map((item) => item.githubRepositoryId));
for (const item of review.replacements)
  if (currentSelectionIds.has(item.githubRepositoryId))
    throw new Error(`Replacement is already selected: ${item.canonicalSlug}`);

const reportRoot = 'corpus/reports';
const supersededReports = [];
for (const name of removeNames) {
  const file = `${reportRoot}/${name}.json`;
  if (!existsSync(file)) throw new Error(`Missing superseded report: ${file}`);
  const bytes = readFileSync(file);
  const report = JSON.parse(bytes.toString('utf8'));
  supersededReports.push({
    name,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    scorePercent: report.score.percent,
    level: report.level.index,
    reason: review.removed.find((item) => item.name === name).reason,
  });
}

selection.candidates = selection.candidates
  .filter((item) => !removeNames.has(item.name))
  .concat(review.replacements);
selection.candidates.sort(
  (a, b) => b.githubStars - a.githubStars || a.canonicalSlug.localeCompare(b.canonicalSlug),
);
selection.candidates.forEach((item, index) => {
  item.popularityRank = index + 1;
});
selection.exclusions.push(
  ...review.removed.map((item) => ({
    id: oldByName.get(item.name).githubRepositoryId,
    slug: item.canonicalSlug,
    stars: item.stars,
    reason: item.reason,
  })),
);
selection.exclusionsSummary = {};
for (const item of selection.exclusions) {
  selection.exclusionsSummary[item.reason] = (selection.exclusionsSummary[item.reason] || 0) + 1;
}
selection.cutoffStars = selection.candidates.at(-1).githubStars;
selection.validation = {
  exactTarget: selection.candidates.length === selection.targetCount,
  uniqueCanonicalIds:
    new Set(selection.candidates.map((item) => item.githubRepositoryId)).size === selection.targetCount,
  uniqueSourcePins: new Set(selection.candidates.map((item) => item.commit)).size === selection.targetCount,
  allPinsAre40CharacterSHAs: selection.candidates.every((item) => /^[0-9a-f]{40}$/.test(item.commit)),
  allSourceEvidencePresent: selection.candidates.every(
    (item) => /^[0-9a-f]{40}$/.test(item.codeEvidence?.blobSha) && Boolean(item.readmeEvidence),
  ),
};
if (Object.values(selection.validation).some((value) => value !== true))
  throw new Error(`Updated selection invalid: ${JSON.stringify(selection.validation)}`);
selection.qualityReview = {
  completedAt: new Date().toISOString(),
  exclusions: review.removed,
  replacements: review.replacements.map((item) => ({
    name: item.name,
    canonicalSlug: item.canonicalSlug,
    githubRepositoryId: item.githubRepositoryId,
    stars: item.githubStars,
    commit: item.commit,
    codeEvidence: item.codeEvidence,
    readmeEvidence: item.readmeEvidence,
  })),
  rule: 'Removed learning-only books, surveys, interview notes, guides, tutorial collections, generic examples and skill-pack repositories. Replacements are pinned AI software with readable README and implementation evidence.',
  sourceSnapshot: selection.searchSnapshot,
};

const baselineEntries = manifest.entries.filter(
  (entry) => !entry.notes?.startsWith('Phase 1F AI popularity rank '),
);
if (baselineEntries.length !== selection.baselineCount)
  throw new Error(
    `Expected ${selection.baselineCount} untouched baseline entries, found ${baselineEntries.length}.`,
  );
const names = new Set(baselineEntries.map((entry) => entry.name.toLowerCase()));
const urls = new Set(baselineEntries.map((entry) => entry.repoUrl.toLowerCase().replace(/\.git$/, '')));
const additions = [];
for (const item of selection.candidates) {
  const lower = item.name.toLowerCase();
  const url = item.repoUrl.toLowerCase().replace(/\.git$/, '');
  if (names.has(lower) || urls.has(url))
    throw new Error(`Manifest collision for replacement selection: ${item.canonicalSlug}`);
  names.add(lower);
  urls.add(url);
  const purpose = (item.purpose || '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 420);
  const archiveNote = item.archived ? ' Archived at selection; stars indicate lifetime popularity.' : '';
  additions.push({
    name: item.name,
    category: item.category,
    repoUrl: item.repoUrl,
    commit: item.commit,
    scanSubpath: null,
    isStressCase: false,
    notes: `Phase 1F AI popularity rank ${item.popularityRank}; observed GitHub stars ${item.githubStars}.${archiveNote} Purpose: ${purpose}`,
  });
}
manifest.entries = [...baselineEntries, ...additions];
manifest.runId = selection.runId;

for (const batch of receipt.batches) {
  batch.names = batch.names.filter((name) => !removeNames.has(name));
  batch.reports = batch.reports.filter((row) => !removeNames.has(row.name));
  batch.checkoutAuditEntries = batch.names.length;
}
receipt.batches = receipt.batches.filter((batch) => batch.names.length > 0);
receipt.completedCount = 482;
receipt.supersededReports = supersededReports;
receipt.replacementScanPending = review.replacements.map((item) => item.name);
delete receipt.completedAt;
delete receipt.reportCount;
delete receipt.checkoutAuditPath;
audit.entries = audit.entries.filter((item) => !removeNames.has(item.name));
if (audit.entries.length !== 482)
  throw new Error(`Expected 482 retained checkout audits, found ${audit.entries.length}.`);

for (const name of removeNames) unlinkSync(`${reportRoot}/${name}.json`);
writeFileSync(selectionPath, `${JSON.stringify(selection, null, 2)}\n`);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(
  `Replaced 18 reference-only entries. Active selection, manifest and receipts temporarily contain 482 complete candidates while replacements scan.`,
);
