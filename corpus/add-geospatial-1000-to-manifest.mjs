#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'corpus', 'manifest.json');
const selectionPath = path.join(
  root,
  'corpus',
  'selection-2026-10-14-geospatial-mapping-popularity-1000.json',
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
if (
  manifest.entries.length !== 5002 ||
  manifest.toolVersion !== 'harness-score@1.8.1' ||
  selection.selected.length !== 1000
) {
  throw new Error(
    'Unexpected baseline, scanner version, or selection size; refusing to update the manifest.',
  );
}
if (selection.analysisIssueNumber !== 27 || selection.runId !== 'geospatial-mapping-popularity-1000') {
  throw new Error('Selection issue or run identity does not match the preregistration.');
}
const existingNames = new Set(manifest.entries.map((entry) => entry.name));
const existingRepoUrls = new Set(manifest.entries.map((entry) => entry.repoUrl.toLowerCase()));
const selectedIds = new Set(selection.selected.map((entry) => String(entry.githubRepositoryId)));
if (selectedIds.size !== 1000) throw new Error('Duplicate canonical GitHub IDs in selection.');
const additions = selection.selected.map((candidate) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.name) || existingNames.has(candidate.name)) {
    throw new Error(`Invalid or duplicate manifest name: ${candidate.name}`);
  }
  if (existingRepoUrls.has(candidate.repoUrl.toLowerCase())) {
    throw new Error(`Repository URL already exists in manifest: ${candidate.repoUrl}`);
  }
  if (!/^[a-f0-9]{40}$/.test(candidate.commit) || candidate.category !== 'geospatial') {
    throw new Error(`Invalid pin or category: ${candidate.canonicalSlug}`);
  }
  return {
    name: candidate.name,
    category: 'geospatial',
    repoUrl: candidate.repoUrl,
    commit: candidate.commit,
    scanSubpath: null,
    isStressCase: false,
    notes: `Geospatial and mapping software popularity cohort ${selection.cohort}; canonical GitHub ID=${candidate.githubRepositoryId}; observed stars=${candidate.stars}; selection is popularity metadata, not Harness Score maturity. Pinned README and implementation evidence are recorded in ${selectionPath.replace(`${root}${path.sep}`, '').replaceAll('\\', '/')}.`,
    selection: {
      cohort: selection.cohort,
      date: selection.selectionDate,
      githubRepositoryId: candidate.githubRepositoryId,
      githubStars: candidate.stars,
      popularityRank: candidate.popularityRank,
      focusCategory: candidate.category,
      selectionMode: 'popular',
    },
  };
});
manifest.runDate = selection.selectionDate;
manifest.toolVersion = selection.scanner;
manifest.runId = selection.runId;
manifest.entries.push(...additions);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    {
      previousRows: manifest.entries.length - additions.length,
      added: additions.length,
      resultingRows: manifest.entries.length,
      runDate: manifest.runDate,
      toolVersion: manifest.toolVersion,
      runId: manifest.runId,
    },
    null,
    2,
  ),
);
