#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';

const topics = [
  'bioinformatics',
  'computational-biology',
  'genomics',
  'proteomics',
  'single-cell',
  'scientific-computing',
  'numerical-methods',
  'astronomy',
  'astrophysics',
  'physics',
  'chemistry',
  'computational-chemistry',
  'climate',
  'earth-science',
  'geophysics',
  'ecology',
  'neuroscience',
  'microscopy',
  'medical-imaging',
  'materials-science',
  'oceanography',
  'meteorology',
  'geospatial-science',
  'scientific-visualization',
];
const capturedAt = new Date().toISOString();
const responses = [];
const byId = new Map();
const { execFileSync } = await import('node:child_process');
function graphql(query) {
  const output = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
    encoding: 'utf8',
    maxBuffer: 12 * 1024 * 1024,
  });
  return JSON.parse(output).data;
}
function snapshot() {
  const output = {
    schemaVersion: 1,
    cohort: 'scientific-software-popularity-500',
    capturedAt,
    endpoint: 'GitHub GraphQL Search API via gh',
    queryMode: 'public repositories; topic search; stars descending; up to two 100-result pages per topic',
    queryLimit: 1000,
    topics,
    searches: responses,
    rawReturnedRecords: responses.reduce((sum, row) => sum + row.returned, 0),
    uniqueCanonicalIds: byId.size,
    candidates: [...byId.values()],
  };
  writeFileSync(
    new URL('./popularity-search-2026-10-11-scientific-software.json', import.meta.url),
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  );
  return output;
}

for (const topic of topics) {
  let cursor = null;
  for (let page = 1; page <= 2; page++) {
    console.log(`Searching ${topic}, page ${page}...`);
    const after = cursor ? `, after: "${cursor}"` : '';
    const query = `query { search(query: "topic:${topic} is:public sort:stars", type: REPOSITORY, first: 100${after}) { repositoryCount pageInfo { hasNextPage endCursor } edges { node { ... on Repository { databaseId nameWithOwner url description stargazerCount isFork isArchived createdAt pushedAt diskUsage defaultBranchRef { name } primaryLanguage { name } licenseInfo { spdxId } } } } } }`;
    const result = graphql(query).search;
    cursor = result.pageInfo.endCursor;
    const repositories = result.edges.map((edge) => edge.node).filter(Boolean);
    responses.push({
      topic,
      page,
      totalCount: result.repositoryCount,
      incompleteResults: false,
      returned: repositories.length,
      query: `topic:${topic} is:public sort:stars`,
      sort: 'stars descending',
      endCursor: cursor,
      hasNextPage: result.pageInfo.hasNextPage,
      observedAt: new Date().toISOString(),
    });
    for (const repo of repositories) {
      const previous = byId.get(repo.databaseId);
      if (previous) previous.queries.push(topic);
      else
        byId.set(repo.databaseId, {
          id: repo.databaseId,
          nodeId: repo.id,
          fullName: repo.nameWithOwner,
          htmlUrl: repo.url,
          cloneUrl: `https://github.com/${repo.nameWithOwner}.git`,
          description: repo.description,
          stars: repo.stargazerCount,
          isFork: repo.isFork,
          archived: repo.isArchived,
          defaultBranch: repo.defaultBranchRef?.name ?? null,
          pushedAt: repo.pushedAt,
          createdAt: repo.createdAt,
          language: repo.primaryLanguage?.name ?? null,
          license: repo.licenseInfo?.spdxId ?? null,
          sizeKb: repo.diskUsage,
          queries: [topic],
        });
    }
    snapshot();
    if (!result.pageInfo.hasNextPage) break;
  }
}

const output = snapshot();
mkdirSync(new URL('.', import.meta.url), { recursive: true });
console.log(
  JSON.stringify(
    {
      rawReturnedRecords: output.rawReturnedRecords,
      uniqueCanonicalIds: output.uniqueCanonicalIds,
      searches: responses.length,
      incomplete: responses.filter((row) => row.incompleteResults).length,
      out: 'corpus/popularity-search-2026-10-11-scientific-software.json',
    },
    null,
    2,
  ),
);
