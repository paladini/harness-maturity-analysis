import fs from 'node:fs/promises';

const selectionPath = 'corpus/selection-2026-10-09-ai-500.json';
const manifest = JSON.parse(await fs.readFile('corpus/manifest.json', 'utf8'));
const search = JSON.parse(await fs.readFile('corpus/popularity-search-2026-10-09-ai-500.json', 'utf8'));
const selection = JSON.parse(await fs.readFile(selectionPath, 'utf8'));
const previousNames = new Set(manifest.entries.map((entry) => entry.name.toLowerCase()));
for (const candidate of selection.candidates) {
  if (previousNames.has(candidate.name.toLowerCase()))
    candidate.name = `${candidate.canonicalSlug.split('/')[0]}-${candidate.name}`
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-');
  previousNames.add(candidate.name.toLowerCase());
}
const historyPaths = (await fs.readdir('corpus/history'))
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map((file) => `corpus/history/${file}`);
const previousSelections = (await fs.readdir('corpus'))
  .filter((file) => /^selection-.*\.json$/.test(file) && file !== 'selection-2026-10-09-ai-500.json')
  .sort()
  .map((file) => `corpus/${file}`);
const canonicalIds = selection.candidates.map((item) => item.githubRepositoryId);
const uniqueIds = new Set(canonicalIds);
const rawCount = search.queries.reduce(
  (sum, query) => sum + query.pages.reduce((n, page) => n + page.items.length, 0),
  0,
);
const uniqueDiscovered = new Set(
  search.queries.flatMap((query) => query.pages.flatMap((page) => page.items.map((item) => item.id))),
).size;
selection.issue = 'https://github.com/paladini/harness-maturity-analysis/issues/9';
selection.baselineCommit = 'c3eee241e04da6eaa1ebf700b3a715779a013b55';
selection.expectedTotal = selection.baselineCount + selection.targetCount;
selection.runId = 'ai-popularity-500';
selection.toolVersion = 'harness-score@1.8.1';
selection.cutoffStars = selection.candidates.at(-1).githubStars;
selection.selectionSource = {
  discoverySnapshot: selection.searchSnapshot,
  collectionTime: search.collectedAt,
  observedRepositoryRecords: rawCount,
  uniqueDiscoveredCanonicalIds: uniqueDiscovered,
  searchQueries: selection.queries,
  boundedUniverse: selection.universeLimit,
  showcaseSnapshot:
    'https://raw.githubusercontent.com/paladini/harness-maturity-showcase/main/data/projects.json',
  priorHistoryPathsConsulted: historyPaths,
  priorSelectionLedgersConsulted: previousSelections,
};
selection.eligibility =
  'Public, non-fork AI software; exact default-branch commit; readable root README and implementation source blob verified at that commit. Excludes prior corpus and Showcase identities, guides, courses, reference-only lists, skill packs, documentation-only repositories, and general-purpose projects where AI is incidental.';
selection.cohortNote =
  'Scanner-only coverage expansion; no blind ratings and no external-validity claim. Popularity is selection metadata, not a harness-score input.';
selection.validation = {
  exactTarget: selection.candidates.length === selection.targetCount,
  uniqueCanonicalIds: uniqueIds.size === selection.targetCount,
  uniqueSourcePins: new Set(selection.candidates.map((item) => item.commit)).size === selection.targetCount,
  allPinsAre40CharacterSHAs: selection.candidates.every((item) => /^[0-9a-f]{40}$/.test(item.commit)),
  allSourceEvidencePresent: selection.candidates.every(
    (item) => /^[0-9a-f]{40}$/.test(item.codeEvidence?.blobSha) && Boolean(item.readmeEvidence),
  ),
};
if (Object.values(selection.validation).some((value) => value !== true))
  throw new Error(`Selection validation failed: ${JSON.stringify(selection.validation)}`);
await fs.writeFile(selectionPath, `${JSON.stringify(selection, null, 2)}\n`);
console.log(
  `finalized=${selection.candidates.length}; discovered=${uniqueDiscovered}; cutoff=${selection.cutoffStars}; validations=ok`,
);
