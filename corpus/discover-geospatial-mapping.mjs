#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const topics = ['geospatial', 'gis', 'map', 'mapping', 'cartography', 'qgis'];
const date = '2026-10-14';
const scrubTokens = (value) =>
  value?.replace(/\b(?:pk|sk)\.[A-Za-z0-9_-]{20,}\b/g, '[redacted-mapbox-token]') ?? value;
const output = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  `popularity-search-${date}-geospatial-mapping.json`,
);
const prior = (() => {
  try {
    return JSON.parse(readFileSync(output, 'utf8'));
  } catch {
    return null;
  }
})();
const capturedAt = prior?.capturedAt ?? new Date().toISOString();
const searches = prior?.searches ?? [];
const candidates = new Map((prior?.candidates ?? []).map((c) => [c.id, c]));

function graphql(query) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const output = execFileSync('rtk', ['gh', 'api', 'graphql', '-f', `query=${query}`], {
        encoding: 'utf8',
        maxBuffer: 24 * 1024 * 1024,
        timeout: 90_000,
      });
      const result = JSON.parse(output);
      if (result.errors?.length) throw new Error(JSON.stringify(result.errors));
      return result.data;
    } catch (error) {
      lastError = error;
      const detail = `${error.stderr ?? ''} ${error.message ?? ''}`;
      if (!/HTTP 5\d\d|timeout|timed out|unexpected end of JSON|JSON input/i.test(detail) || attempt === 5)
        throw error;
      const waitMs = 2000 * (attempt + 1);
      console.log(`Transient GitHub failure; retrying after ${waitMs}ms.`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
    }
  }
  throw lastError;
}

function save() {
  const data = {
    schemaVersion: 1,
    roundId: 'geospatial-mapping-popularity-1000',
    capturedAt,
    endpoint: 'GitHub GraphQL Search API via rtk gh',
    queryMode:
      'public repository topics, stars descending, first 100 per page, at most ten pages per topic; GraphQL Search does not expose incompleteResults',
    perTopicResultCap: 1000,
    topics,
    searches,
    rawReturnedRecords: searches.reduce((sum, search) => sum + search.returned, 0),
    uniqueCanonicalIds: candidates.size,
    searchCoverageByTopic: topics.map((topic) => {
      const pages = searches.filter((search) => search.topic === topic);
      const returned = pages.reduce((sum, search) => sum + search.returned, 0);
      const totalCount = pages[0]?.totalCount ?? 0;
      return {
        topic,
        query: `topic:${topic} fork:false is:public stars:>0 sort:stars`,
        pagesFetched: pages.length,
        returned,
        totalCount,
        resultLimit: 1000,
        capReached: returned >= 1000 && totalCount > returned,
        incompleteResults: null,
        firstObservedAt: pages[0]?.observedAt ?? null,
        lastObservedAt: pages.at(-1)?.observedAt ?? null,
      };
    }),
    limitations: [
      'This is a bounded topic-search union, not a global ranking of GitHub.',
      'GitHub GraphQL Search returns at most 1,000 results for a query; cap status is recorded per topic.',
      'The GraphQL Search response does not expose the REST incompleteResults flag.',
      'Star counts are cumulative observations during the recorded search window, not historical peak popularity.',
    ],
    candidates: [...candidates.values()],
  };
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return data;
}

for (const topic of topics) {
  let cursor = null;
  for (let page = 1; page <= 10; page++) {
    const previous = searches.find((s) => s.topic === topic && s.page === page);
    if (previous) {
      cursor = previous.endCursor;
      if (!previous.hasNextPage) break;
      continue;
    }
    const searchText = `topic:${topic} fork:false is:public stars:>0 sort:stars`;
    const after = cursor ? `, after: "${cursor}"` : '';
    const query = `query { search(query: "${searchText}", type: REPOSITORY, first: 100${after}) { repositoryCount pageInfo { hasNextPage endCursor } edges { node { ... on Repository { databaseId nameWithOwner url description stargazerCount isFork isArchived createdAt pushedAt diskUsage defaultBranchRef { name target { ... on Commit { oid } } } primaryLanguage { name } licenseInfo { spdxId } } } } } }`;
    console.log(`Searching topic:${topic}, page ${page}`);
    const result = graphql(query).search;
    const repos = result.edges.map((edge) => edge.node).filter((repo) => repo?.databaseId);
    const observedAt = new Date().toISOString();
    searches.push({
      topic,
      page,
      query: searchText,
      totalCount: result.repositoryCount,
      returned: repos.length,
      incompleteResults: null,
      capped: result.pageInfo.hasNextPage && page === 10,
      hasNextPage: result.pageInfo.hasNextPage,
      endCursor: result.pageInfo.endCursor,
      sort: 'stars descending',
      observedAt,
    });
    cursor = result.pageInfo.endCursor;
    for (const repo of repos) {
      const existing = candidates.get(repo.databaseId);
      if (existing) {
        if (!existing.queries.includes(topic)) existing.queries.push(topic);
      } else {
        candidates.set(repo.databaseId, {
          id: repo.databaseId,
          fullName: repo.nameWithOwner,
          htmlUrl: repo.url,
          cloneUrl: `https://github.com/${repo.nameWithOwner}.git`,
          description: scrubTokens(repo.description),
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
    }
    save();
    if (!result.pageInfo.hasNextPage) break;
  }
}

const final = save();
console.log(
  JSON.stringify(
    {
      candidates: final.uniqueCanonicalIds,
      rawReturned: final.rawReturnedRecords,
      searches: searches.length,
      capped: searches.filter((item) => item.capped).length,
      output,
    },
    null,
    2,
  ),
);
