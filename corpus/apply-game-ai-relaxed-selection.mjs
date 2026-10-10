#!/usr/bin/env node
// Rebuild the active 500-project game-AI popularity cohort with the user's
// expanded allowance for game-AI courses and game-specific agent configs.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const manifestPath = 'corpus/manifest.json';
const priorPath = 'corpus/selection-game-ai-popularity-500-2026-10-10.json';
const discoveryPath = 'corpus/popularity-search-2026-10-10-extended-game-ai-500.json';
const revisedPath = 'corpus/selection-game-ai-popularity-500-2026-10-10-relaxed.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const prior = JSON.parse(readFileSync(priorPath, 'utf8'));
const discovery = JSON.parse(readFileSync(discoveryPath, 'utf8'));
const discoveredBySlug = new Map(discovery.candidates.map((entry) => [entry.canonicalSlug, entry]));
const accepted = prior.selectionChecks.exclusions
  .filter((entry) => /course-only|instructional skill|README describes an instructional/i.test(entry.reason))
  .filter((entry) => entry.observedStars > prior.minimumObservedStars)
  .filter((entry) => entry.canonicalSlug !== 'AIPMAndy/CEOskill')
  .map((entry) => {
    const discovered = discoveredBySlug.get(entry.canonicalSlug);
    if (!discovered) throw new Error(`Missing discovery record: ${entry.canonicalSlug}`);
    const remote = execFileSync('git', ['ls-remote', '--symref', discovered.repoUrl, 'HEAD'], {
      encoding: 'utf8',
    });
    const commit = remote.trim().split(/\r?\n/).at(-1)?.split(/\s+/)[0];
    if (!/^[a-f0-9]{40}$/.test(commit ?? ''))
      throw new Error(`Could not resolve a full HEAD SHA for ${entry.canonicalSlug}`);
    return {
      ...discovered,
      commit,
      rankWithinSearchUnion: entry.rankWithinSearchUnion,
      priorExclusionReason: entry.reason,
      observedStarsCapture: entry.sourceQueries.map((query) => ({
        ...query,
        capturedAt: discovery.capturedAt,
      })),
    };
  });

const previousEntries = manifest.entries.filter((entry) => entry.selection?.cohort === 'game-ai-popularity');
const oldSelectedById = new Map(prior.selected.map((entry) => [entry.githubRepositoryId, entry]));
const combined = [
  ...previousEntries.map((entry) => {
    const old = oldSelectedById.get(entry.selection.githubRepositoryId);
    if (!old) throw new Error(`Prior selection ledger missing ${entry.name}`);
    return {
      kind: 'existing',
      entry,
      old,
      selectionBefore: structuredClone(entry.selection),
      stars: entry.selection.githubStars,
      rank: old.popularityRank,
    };
  }),
  ...accepted.map((candidate) => ({
    kind: 'new',
    candidate,
    stars: candidate.observedStars,
    rank: candidate.rankWithinSearchUnion,
  })),
];
combined.sort(
  (a, b) =>
    b.stars - a.stars ||
    a.rank - b.rank ||
    (a.entry?.name ?? a.candidate.canonicalSlug).localeCompare(b.entry?.name ?? b.candidate.canonicalSlug),
);
const winnerIds = new Set(
  combined
    .slice(0, prior.targetCount)
    .map((item) => (item.kind === 'existing' ? item.entry.name : `new:${item.candidate.githubRepositoryId}`)),
);
const winners = combined.slice(0, prior.targetCount);
const displaced = combined.filter((item) => item.kind === 'existing' && !winnerIds.has(item.entry.name));
if (winners.filter((item) => item.kind === 'new').length !== accepted.length) {
  throw new Error('At least one explicitly approved repository did not enter the revised top-500 cohort.');
}

const existingById = new Map(
  manifest.entries.map((entry) => [entry.selection?.githubRepositoryId, entry]).filter(([id]) => id),
);
const duplicateIds = accepted.filter((item) => existingById.has(item.githubRepositoryId));
if (duplicateIds.length)
  throw new Error(
    `Canonical IDs already exist in manifest: ${duplicateIds.map((item) => item.canonicalSlug).join(', ')}`,
  );
const existingNames = new Set(manifest.entries.map((entry) => entry.name));
const newEntries = [];

for (const [index, item] of winners.entries()) {
  const popularityRank = index + 1;
  if (item.kind === 'existing') {
    item.entry.selection.popularityRank = popularityRank;
    item.entry.selection.date = prior.selectionDate;
    item.entry.notes = item.entry.notes.replace(
      /Pinned source evidence and exclusions in selection-game-ai-popularity-500-2026-10-10\.json\./,
      'Pinned selection and scope-amendment evidence in selection-game-ai-popularity-500-2026-10-10-relaxed.json.',
    );
    item.old.popularityRank = popularityRank;
    continue;
  }
  const candidate = item.candidate;
  const name = `game-ai-${candidate.canonicalSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(
    /-+$/,
    '',
  );
  if (existingNames.has(name)) throw new Error(`Manifest name collision: ${name}`);
  existingNames.add(name);
  const notes = `Phase 1G game-AI popularity rank ${popularityRank}; observed GitHub stars ${candidate.observedStars}. ${candidate.purposeHint} Pinned source and relaxed-scope evidence in ${revisedPath}.`;
  const entry = {
    name,
    category: 'video-game-ai',
    repoUrl: candidate.repoUrl,
    commit: candidate.commit,
    scanSubpath: null,
    isStressCase: false,
    notes,
    selection: {
      cohort: 'game-ai-popularity',
      date: prior.selectionDate,
      githubRepositoryId: candidate.githubRepositoryId,
      githubStars: candidate.observedStars,
      popularityRank,
      selectionMode: 'popular',
      archived: candidate.archived,
    },
  };
  newEntries.push(entry);
  item.candidate.name = name;
  item.candidate.popularityRank = popularityRank;
}

for (const item of displaced) {
  delete item.entry.selection;
}
manifest.entries.push(...newEntries);
manifest.runDate = prior.selectionDate;
manifest.runId = 'game-ai-popularity-500-relaxed';

const acceptedIds = new Set(accepted.map((entry) => entry.githubRepositoryId));
const revised = structuredClone(prior);
revised.runId = manifest.runId;
revised.cohort = 'game-ai-popularity-500';
revised.amendmentDate = prior.selectionDate;
revised.userScopeOverride =
  'Include AI-created videogames, AI in games, game-AI course projects, and game-specific agent configurations, skills, and tools when the pinned repository is demonstrably about creating or playing videogames. Keep general gaming references and unrelated agent packs out.';
revised.targetCount = prior.targetCount;
revised.achievedCount = winners.length;
revised.minimumObservedStars = winners.at(-1).stars;
revised.maximumObservedStars = winners[0].stars;
revised.selectionCriterion =
  'Among the captured GitHub search universe, select the 500 highest-star repositories that implement a videogame, game AI, AI-assisted game development, a game-AI course project, or a game-specific agent configuration/skill/tool; validate the pinned README and a game-related file before scanning.';
revised.selectionChecks.selectedCandidateCount = winners.length;
revised.selectionChecks.canonicalRepositoryIdsUnique =
  new Set(
    winners.map((item) =>
      item.kind === 'existing' ? item.entry.selection.githubRepositoryId : item.candidate.githubRepositoryId,
    ),
  ).size === winners.length;
revised.selectionChecks.exclusions = revised.selectionChecks.exclusions.filter(
  (entry) => !acceptedIds.has(entry.githubRepositoryId),
);
revised.selectionChecks.scopeAmendment = {
  supersedesSelectionFile: priorPath,
  explanation:
    'The user explicitly allowed Unreal course repositories and game-specific agent configurations. These project types now qualify when pinned README/source evidence ties them to video-game creation or game AI.',
  acceptedCandidateCount: accepted.length,
  acceptedCandidates: accepted.map((entry) => ({
    githubRepositoryId: entry.githubRepositoryId,
    canonicalSlug: entry.canonicalSlug,
    repoUrl: entry.repoUrl,
    commit: entry.commit,
    observedStars: entry.observedStars,
    popularityRank: entry.popularityRank,
    purpose: entry.purposeHint,
    previousExclusionReason: entry.priorExclusionReason,
  })),
  displacedCandidates: displaced.map((item) => ({
    name: item.entry.name,
    githubRepositoryId: item.selectionBefore.githubRepositoryId,
    observedStars: item.selectionBefore.githubStars,
    formerPopularityRank: item.old.popularityRank,
  })),
};
revised.selected = winners.map((item) => {
  if (item.kind === 'existing') return item.old;
  const candidate = item.candidate;
  return {
    name: candidate.name,
    canonicalSlug: candidate.canonicalSlug,
    githubRepositoryId: candidate.githubRepositoryId,
    repoUrl: candidate.repoUrl,
    selectionMode: 'popular',
    popularityRank: candidate.popularityRank,
    observedStars: candidate.observedStars,
    observedStarsCapture: candidate.observedStarsCapture,
    archived: candidate.archived,
    disabled: candidate.disabled,
    fork: candidate.fork,
    language: candidate.language,
    license: candidate.license,
    createdAt: candidate.createdAt,
    pushedAt: candidate.pushedAt,
    defaultBranch: candidate.defaultBranch,
    commit: candidate.commit,
    purpose: candidate.purposeHint,
    priorExclusionReason: candidate.priorExclusionReason,
    sourceQueries: candidate.sourceQueries,
  };
});
revised.scanPlan = {
  ...prior.scanPlan,
  runId: manifest.runId,
  scope:
    'Repository root; clone and read source only; do not install, build, test or execute third-party repository code. 35 newly admitted candidates; 500 active cohort members.',
};
revised.issueAndDelivery = {
  ...prior.issueAndDelivery,
  issueUrl: 'https://github.com/paladini/harness-maturity-analysis/issues/13',
  showcaseIssueUrl: 'https://github.com/paladini/harness-maturity-showcase/issues/21',
  pullRequestUrl: null,
  reviewedHead: null,
  mergeCommit: null,
  deploymentUrl: null,
  publicVerification: null,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
writeFileSync(revisedPath, `${JSON.stringify(revised, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    {
      accepted: accepted.length,
      displaced: displaced.length,
      manifestEntries: manifest.entries.length,
      cohortSize: winners.length,
      minStars: revised.minimumObservedStars,
      scanNames: newEntries.map((entry) => entry.name),
    },
    null,
    2,
  ),
);
