#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const topics = [
  'agriculture',
  'agriculture-technology',
  'agtech',
  'precision-agriculture',
  'precision-farming',
  'farm-management',
  'farm-management-software',
  'smart-farming',
  'digital-agriculture',
  'agricultural-machinery',
  'farm-automation',
  'agricultural-robotics',
  'agriculture-robotics',
  'livestock-management',
  'farm-data',
  'crop-management',
  'crop-monitoring',
  'crop-yield',
  'irrigation-management',
  'irrigation',
  'greenhouse-management',
  'greenhouse-automation',
  'hydroponics',
  'farm-planning',
  'farm-records',
  'agricultural-iot',
  'soil-monitoring',
  'plant-disease-detection',
  'weed-detection',
  'farm-erp',
];
const date = '2026-10-13';
const path = new URL(`./popularity-search-${date}-agriculture-software.json`, import.meta.url);
const prior = (() => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
})();
const capturedAt = prior?.capturedAt ?? new Date().toISOString();
const searches = prior?.searches ?? [];
const candidates = new Map((prior?.candidates ?? []).map((candidate) => [candidate.id, candidate]));

function graphql(query) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const output = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
        encoding: 'utf8',
        maxBuffer: 12 * 1024 * 1024,
        timeout: 90_000,
      });
      return JSON.parse(output).data;
    } catch (error) {
      lastError = error;
      const status = error.stderr?.toString() ?? '';
      if (!/HTTP 5\d\d|timeout|timed out/i.test(status)) throw error;
      const wait = 1500 * (attempt + 1);
      console.log(`Transient GitHub error; retrying after ${wait}ms (${attempt + 1}/5).`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait);
    }
  }
  throw lastError;
}
function snapshot() {
  const value = {
    schemaVersion: 1,
    cohort: 'agriculture-software-random-500',
    capturedAt,
    endpoint: 'GitHub GraphQL Search API via gh',
    queryMode: 'public repository topics, stars descending, first 100; bounded at two pages per topic',
    queryLimit: 1000,
    topics,
    searches,
    rawReturnedRecords: searches.reduce((sum, search) => sum + search.returned, 0),
    uniqueCanonicalIds: candidates.size,
    candidates: [...candidates.values()],
  };
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return value;
}

for (const topic of topics) {
  let cursor = null;
  for (let page = 1; page <= 2; page++) {
    if (searches.some((search) => search.topic === topic && search.page === page)) {
      cursor = searches.find((search) => search.topic === topic && search.page === page)?.endCursor ?? null;
      continue;
    }
    console.log(`Searching topic:${topic}, page ${page}`);
    const after = cursor ? `, after: "${cursor}"` : '';
    const query = `query { search(query: "topic:${topic} is:public sort:stars", type: REPOSITORY, first: 100${after}) { repositoryCount pageInfo { hasNextPage endCursor } edges { node { ... on Repository { databaseId nameWithOwner url description stargazerCount isFork isArchived createdAt pushedAt diskUsage defaultBranchRef { name target { ... on Commit { oid } } } primaryLanguage { name } licenseInfo { spdxId } } } } } }`;
    const result = graphql(query).search;
    const repos = result.edges.map((edge) => edge.node).filter((repo) => repo?.databaseId);
    searches.push({
      topic,
      page,
      query: `topic:${topic} is:public sort:stars`,
      totalCount: result.repositoryCount,
      returned: repos.length,
      incompleteResults: false,
      capped: result.pageInfo.hasNextPage && page === 2,
      hasNextPage: result.pageInfo.hasNextPage,
      endCursor: result.pageInfo.endCursor,
      sort: 'stars descending',
      observedAt: new Date().toISOString(),
    });
    cursor = result.pageInfo.endCursor;
    for (const repo of repos) {
      const previous = candidates.get(repo.databaseId);
      if (previous) previous.queries.push(topic);
      else
        candidates.set(repo.databaseId, {
          id: repo.databaseId,
          fullName: repo.nameWithOwner,
          htmlUrl: repo.url,
          cloneUrl: `https://github.com/${repo.nameWithOwner}.git`,
          description: repo.description,
          stars: repo.stargazerCount,
          isFork: repo.isFork,
          archived: repo.isArchived,
          defaultBranch: repo.defaultBranchRef?.name ?? null,
          searchCommit: repo.defaultBranchRef?.target?.oid ?? null,
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
mkdirSync(new URL('.', import.meta.url), { recursive: true });
const final = snapshot();
console.log(
  JSON.stringify(
    {
      candidates: final.uniqueCanonicalIds,
      rawReturned: final.rawReturnedRecords,
      searches: searches.length,
      capped: searches.filter((item) => item.capped).length,
      output: path.pathname,
    },
    null,
    2,
  ),
);
