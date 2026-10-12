#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const manifestPath = new URL('./manifest.json', import.meta.url);
const selectionPath = new URL('./selection-2026-10-11-scientific-software-random-500.json', import.meta.url);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
const expectedBaseline = 3186;
if (
  manifest.entries.length !== expectedBaseline ||
  manifest.toolVersion !== selection.scanner ||
  selection.targetCount !== 500 ||
  selection.achievedCount !== 500 ||
  selection.selected.length !== 500 ||
  selection.analysisIssueNumber !== 22 ||
  !/^\d{4}-\d{2}-\d{2}$/.test(selection.selectionDate)
) {
  throw new Error('Analysis baseline or preregistered selection does not match the expected state.');
}

const existingNames = new Set(manifest.entries.map((entry) => entry.name.toLowerCase()));
const existingUrls = new Set(manifest.entries.map((entry) => entry.repoUrl.toLowerCase()));
const selectedIds = new Set();
const selectedUrls = new Set();
const additions = selection.selected.map((candidate) => {
  if (
    selectedIds.has(candidate.canonicalId) ||
    existingNames.has(candidate.name.toLowerCase()) ||
    existingUrls.has(candidate.repoUrl.toLowerCase()) ||
    selectedUrls.has(candidate.repoUrl.toLowerCase()) ||
    !/^[a-f0-9]{40}$/.test(candidate.commit) ||
    !Number.isInteger(candidate.githubRepositoryId) ||
    candidate.githubRepositoryId !== Number(candidate.canonicalId) ||
    !candidate.readme?.blobSha ||
    !candidate.implementation?.blobSha ||
    !candidate.evidenceAudit?.implementationBlobVerified
  ) {
    throw new Error(`Invalid or duplicate frozen candidate: ${candidate.canonicalSlug}`);
  }
  selectedIds.add(candidate.canonicalId);
  selectedUrls.add(candidate.repoUrl.toLowerCase());
  existingNames.add(candidate.name.toLowerCase());
  return {
    name: candidate.name,
    category: candidate.category,
    repoUrl: candidate.repoUrl,
    commit: candidate.commit,
    scanSubpath: null,
    isStressCase: false,
    notes: `Randomly sampled scientific-software cohort ${selection.cohort}; subcategory=${candidate.focusCategory}; canonical GitHub ID=${candidate.canonicalId}; observed stars=${candidate.stars} at ${selection.search.capturedAt}; pinned implementation=${candidate.implementation.path}.`,
  };
});

if (selectedIds.size !== 500 || selectedUrls.size !== 500)
  throw new Error('Selection identity audit failed.');
manifest.runDate = selection.selectionDate;
manifest.runId = selection.runId;
manifest.toolVersion = selection.scanner;
manifest.entries.push(...additions);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    {
      baseline: expectedBaseline,
      added: additions.length,
      total: manifest.entries.length,
      runDate: manifest.runDate,
      runId: manifest.runId,
      toolVersion: manifest.toolVersion,
    },
    null,
    2,
  ),
);
