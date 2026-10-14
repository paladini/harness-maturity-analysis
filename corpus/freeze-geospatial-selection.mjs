#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const discoveryPath = path.join(root, 'corpus', 'popularity-search-2026-10-14-geospatial-mapping.json');
const identityPath = path.join(root, 'corpus', 'canonical-identity-inventory-2026-10-14.json');
const auditPath = path.join(root, 'corpus', 'content-audit-2026-10-14-geospatial-mapping.json');
const pinsPath = path.join(root, 'corpus', 'pin-audit-2026-10-14-geospatial-mapping.json');
const implementationPath = path.join(root, 'corpus', 'implementation-audit-2026-10-14-geospatial-mapping.json');
const outputPath = path.join(root, 'corpus', 'selection-2026-10-14-geospatial-mapping-popularity-1000.json');
const discovery = JSON.parse(readFileSync(discoveryPath, 'utf8'));
const identity = JSON.parse(readFileSync(identityPath, 'utf8'));
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
const pins = JSON.parse(readFileSync(pinsPath, 'utf8'));
const implementation = JSON.parse(readFileSync(implementationPath, 'utf8'));
const scrubTokens = (value) => value?.replace(/\b(?:pk|sk)\.[A-Za-z0-9_-]{20,}\b/g, '[redacted-mapbox-token]') ?? value;
const inventoryIds = new Set(identity.repositories.map((repo) => String(repo.databaseId)).filter((id) => id !== 'null'));
const pinById = new Map(pins.results.map((repo) => [String(repo.databaseId), repo]));
const contentById = new Map(audit.audited.map((repo) => [String(repo.databaseId), repo]));
const implById = new Map(implementation.results.map((repo) => [String(repo.databaseId), repo]));
const rawCandidatesById = new Map(discovery.candidates.map((repo) => [String(repo.id), repo]));
const uniqueSorted = implementation.results.filter((repo) => repo.complete)
  .sort((a, b) => b.stars - a.stars || a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase()));

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(uniqueSorted.length >= 1000, `Only ${uniqueSorted.length} candidates have pinned implementation blobs`);
const selected = uniqueSorted.slice(0, 1000).map((resolved, i) => {
  const id = String(resolved.databaseId);
  const reviewed = contentById.get(id);
  const pin = pinById.get(id);
  const raw = rawCandidatesById.get(id);
  const code = implById.get(id);
  assert(reviewed?.approved && pin?.commit && !pin.error && code?.complete, `Incomplete evidence for ${resolved.fullName}`);
  assert(!inventoryIds.has(id), `Canonical identity already exists: ${id} ${resolved.fullName}`);
  assert(/^[a-f0-9]{40}$/.test(pin.commit), `Invalid pin for ${resolved.fullName}`);
  assert(pin.commit === code.commit && pin.commit === reviewed.commit, `Mismatched evidence pins for ${resolved.fullName}`);
  assert(/^[a-f0-9]{40}$/.test(reviewed.readme?.blobSha ?? ''), `Missing README blob for ${resolved.fullName}`);
  assert(/^[a-f0-9]{40}$/.test(code.blobSha ?? ''), `Missing implementation blob for ${resolved.fullName}`);
  const canonicalSlug = reviewed.fullName;
  const entryName = `geospatial-${slug(canonicalSlug)}`;
  const repoUrl = `https://github.com/${canonicalSlug}.git`;
  const implementationUrl = `https://github.com/${canonicalSlug}/blob/${pin.commit}/${code.path}`;
  const queries = raw.queries.map((topic) => `topic:${topic} fork:false is:public stars:>0 sort:stars`);
  return {
    cohortRank: i + 1,
    popularityRank: i + 1,
    category: 'geospatial',
    canonicalId: String(id),
    githubRepositoryId: Number(id),
    canonicalSlug,
    name: entryName,
    repoUrl,
    defaultBranch: pin.branch,
    commit: pin.commit,
    stars: reviewed.stars,
    starsObservedAt: discovery.capturedAt,
    selectionMode: 'popular',
    searchRank: discovery.candidates
      .slice().sort((a, b) => b.stars - a.stars || a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase()))
      .findIndex((candidate) => String(candidate.id) === id) + 1,
    searchQueries: queries,
    archived: false,
    license: reviewed.license,
    language: reviewed.language,
    pushedAt: reviewed.pushedAt,
    purpose: scrubTokens(reviewed.description || reviewed.readme.excerpt.slice(0, 500).replace(/\s+/g, ' ').trim()),
    readme: {
      path: reviewed.readme.path,
      blobSha: reviewed.readme.blobSha,
      url: reviewed.readme.url,
    },
    implementation: {
      path: code.path,
      blobSha: code.blobSha,
      url: implementationUrl,
    },
    evidenceAudit: {
      githubCanonicalId: Number(id),
      currentDefaultBranchResolvedByLsRemote: true,
      samePinnedCommitForReadmeAndImplementation: true,
      geospatialPurposeVerifiedInDescriptionOrReadmeIntroduction: true,
      implementationBlobVerifiedInPinnedGitTree: true,
      thirdPartyCodeExecuted: false,
    },
  };
});

const names = new Set(selected.map((entry) => entry.name));
const ids = new Set(selected.map((entry) => entry.canonicalId));
const slugs = new Set(selected.map((entry) => entry.canonicalSlug.toLowerCase()));
assert(names.size === 1000 && ids.size === 1000 && slugs.size === 1000, 'Selection contains duplicate names or canonical identities');
const cutoffStars = selected.at(-1).stars;
const selectedIds = new Set(selected.map((entry) => String(entry.githubRepositoryId)));
const rankMap = new Map(uniqueSorted.map((repo, i) => [String(repo.databaseId), i + 1]));
const eligibleNotSelected = uniqueSorted.slice(1000).map((repo) => ({
  canonicalId: String(repo.databaseId), canonicalSlug: repo.fullName, stars: repo.stars,
  eligibilityRank: rankMap.get(String(repo.databaseId)), reason: 'target-count-reached',
}));
const rejectedAboveCutoff = audit.audited.filter((candidate) => candidate.stars >= cutoffStars && !candidate.approved)
  .map((candidate) => ({
    canonicalId: String(candidate.databaseId), canonicalSlug: candidate.fullName,
    stars: candidate.stars, description: candidate.description,
    reason: candidate.rejectionReasons,
  }));
const implementationRejectedAboveCutoff = implementation.results.filter((candidate) =>
  candidate.stars >= cutoffStars && !candidate.complete,
).map((candidate) => ({
  canonicalId: String(candidate.databaseId), canonicalSlug: candidate.fullName,
  stars: candidate.stars, reason: 'no implementation-file blob found within the audited source tree',
}));
const languages = {};
for (const entry of selected) languages[entry.language || 'unknown'] = (languages[entry.language || 'unknown'] ?? 0) + 1;
const searchTimes = discovery.searches.map((search) => search.observedAt).sort();
const selectionDate = '2026-10-14';
const output = {
  schemaVersion: 1,
  cohort: 'geospatial-mapping-popularity-1000',
  runId: 'geospatial-mapping-popularity-1000',
  selectionDate,
  selectedAt: new Date().toISOString(),
  selectedDate: selectionDate,
  targetCount: 1000,
  achievedCount: selected.length,
  niche: 'geospatial-mapping-software',
  category: 'geospatial',
  categoryDescription: 'Open-source software that creates, renders, analyzes, indexes, converts, or routes over geographic and spatial data, including GIS, web maps, map engines, routing tools, remote sensing, and robotic mapping/SLAM software.',
  targetAudience: 'GIS analysts, cartographers, geospatial data engineers, mapping and navigation developers, remote-sensing teams, and robotics engineers building mapping systems.',
  categoryAliases: discovery.topics,
  priorHistoryConsulted: [
    'corpus/manifest.json',
    'corpus/selection-2026-10-07.json',
    'corpus/selection-2026-10-08-ai-popularity.json',
    'corpus/selection-2026-10-08-crypto-popularity.json',
    'corpus/selection-2026-10-09-ai-500.json',
    'corpus/selection-2026-10-09-media-editing-popularity.json',
    'corpus/selection-2026-10-10-agent-ecosystem-500.json',
    'corpus/selection-2026-10-10-github-top-software-1000.json',
    'corpus/selection-2026-10-11-ai-ide-adoption-500.json',
    'corpus/selection-2026-10-11-scientific-software-random-500.json',
    'corpus/selection-game-ai-popularity-500-2026-10-10.json',
    'corpus/selection-game-ai-popularity-500-2026-10-10-relaxed.json',
    'corpus/selection-2026-10-13-agriculture-software-popularity-500.json',
    'corpus/selection-2026-10-13-developer-infrastructure-popularity-816.json',
    'data/projects.json (Showcase baseline)',
  ],
  categoryShortlist: [
    'geospatial-mapping', 'embedded-systems', 'climate-energy-software',
    'digital-accessibility', 'digital-humanities',
  ],
  categoryDraw: {
    seed: 2937455085,
    algorithm: 'unsigned 32-bit random seed modulo shortlist length',
    index: 0,
    selected: 'geospatial-mapping',
  },
  baseline: {
    analysisCommit: identity.sources.analysisCommit,
    analysisManifestRows: identity.sources.analysisManifestRows,
    analysisCanonicalIds: new Set(identity.repositories.filter((repo) => repo.sources.includes('analysis')).map((repo) => repo.databaseId).filter(Boolean)).size,
    showcaseCommit: identity.sources.showcaseCommit,
    showcaseRecords: identity.sources.showcaseRecords,
    showcaseAliases: identity.repositories.filter((repo) => repo.sources.includes('showcase')).length,
    showcaseCanonicalIds: new Set(identity.repositories.filter((repo) => repo.sources.includes('showcase')).map((repo) => repo.databaseId).filter(Boolean)).size,
    resolvedAliases: identity.repositories.length,
    unresolvedIdentities: identity.repositories.filter((repo) => !repo.databaseId).length,
  },
  scanner: 'harness-score@1.8.2',
  scannerMigration: {
    from: 'harness-score@1.8.1',
    reason: 'Stable v1.8.2 changes CI signal detection to inspect executed commands instead of workflow labels; all current pinned reports must be regenerated consistently.',
    priorHistoryPreserved: true,
    existingEntriesToRescan: 5002,
    totalEntriesAfterAddition: 6002,
  },
  search: {
    source: 'GitHub GraphQL Search API via gh',
    discoveryPath: 'corpus/popularity-search-2026-10-14-geospatial-mapping.json',
    identityInventoryPath: 'corpus/canonical-identity-inventory-2026-10-14.json',
    queries: discovery.searchCoverageByTopic,
    rawReturnedRecords: discovery.rawReturnedRecords,
    uniqueCanonicalIds: discovery.uniqueCanonicalIds,
    excludedExistingCanonicalIds: audit.candidatesExcludedByIdentity.length,
    uniqueCandidateIdsAfterPriorAnalysisAndShowcaseExclusions: discovery.uniqueCanonicalIds - audit.candidatesExcludedByIdentity.length,
    capturedWindow: { from: searchTimes[0], to: searchTimes.at(-1) },
    resultLimitations: discovery.limitations,
    contentAudit: {
      candidatePrefixAudited: audit.auditedSearchUnionPrefix,
      descriptionOrReadmeApproved: audit.audited.filter((candidate) => candidate.approved).length,
      pinnedImplementationBlobsFound: implementation.results.filter((candidate) => candidate.complete).length,
      rejectedHigherRankedByContent: rejectedAboveCutoff.length,
      rejectedHigherRankedForMissingImplementationBlob: implementationRejectedAboveCutoff.length,
    },
    starsAreSelectionMetadataNotMaturity: true,
    selectedStarsCutoff: cutoffStars,
  },
  scanScope: {
    ratingMode: 'scanner-only; no blind ratings or Q1 external-validity claim',
    sourceRepositoryExecution: false,
    selectedCommitsPinnedFromDefaultBranchByLsRemote: true,
    exactRepositoryCount: selected.length,
    categoryTaxonomyAdded: 'geospatial',
  },
  contentAuditPath: 'corpus/content-audit-2026-10-14-geospatial-mapping.json',
  canonicalIdentityAuditPath: 'corpus/canonical-identity-inventory-2026-10-14.json',
  pinAuditPath: 'corpus/pin-audit-2026-10-14-geospatial-mapping.json',
  implementationAuditPath: 'corpus/implementation-audit-2026-10-14-geospatial-mapping.json',
  discoveryPath: 'corpus/popularity-search-2026-10-14-geospatial-mapping.json',
  contentExclusions: rejectedAboveCutoff,
  implementationEvidenceExclusions: implementationRejectedAboveCutoff,
  eligibleNotSelected,
  selected,
  analysisIssueNumber: null,
  analysisIssueUrl: null,
  analysisPrUrl: null,
  showcaseIssueUrl: null,
  showcasePrUrl: null,
  publicVerification: null,
};

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  achieved: selected.length,
  cutoffStars,
  tieAtCutoff: uniqueSorted[1000]?.stars === cutoffStars,
  first: selected.slice(0, 5).map((entry) => ({ name: entry.name, stars: entry.stars, commit: entry.commit })),
  last: selected.at(-1),
  eligibleNotSelected: eligibleNotSelected.length,
  output: outputPath,
}, null, 2));
