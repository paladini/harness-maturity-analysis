import fs from 'node:fs/promises';

const token = process.env.CODEX_AI_RESEARCH_GH_TOKEN;
if (!token) throw new Error('Set CODEX_AI_RESEARCH_GH_TOKEN to an authenticated GitHub token.');

const queries = [
  'topic:ai stars:>100',
  'topic:artificial-intelligence stars:>100',
  'topic:llm stars:>100',
  'topic:ai-agent stars:>100',
  'topic:generative-ai stars:>100',
  'topic:ai-coding-assistant stars:>50',
  'topic:machine-learning stars:>500',
  'AI IDE in:name,description stars:>100',
];
const date = new Date().toISOString();
const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
};

async function get(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers });
    if (response.ok) return response.json();
    const body = await response.text();
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
      const wait = Math.max(1000, reset - Date.now() + 1000);
      throw new Error(
        `GitHub API rate limited until ${new Date(reset).toISOString()} (${Math.ceil(wait / 1000)} seconds).`,
      );
    }
    if (response.status < 500 && response.status !== 429)
      throw new Error(`${response.status} ${url}: ${body.slice(0, 500)}`);
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  throw new Error(`Retries exhausted for ${url}`);
}

const searches = [];
for (const query of queries) {
  const pages = [];
  let totalCount = null;
  for (let page = 1; page <= 3; page += 1) {
    const params = new URLSearchParams({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: '100',
      page: String(page),
    });
    const data = await get(`https://api.github.com/search/repositories?${params}`);
    totalCount = data.total_count;
    pages.push({ page, incompleteResults: data.incomplete_results, items: data.items });
    if (data.items.length < 100) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  searches.push({ query, totalCount, fetchedPages: pages.length, pages });
  console.log(`${query}: ${pages.reduce((n, p) => n + p.items.length, 0)} fetched / ${totalCount} results`);
}

const snapshot = {
  schemaVersion: 1,
  collectedAt: date,
  searchEngine: 'GitHub REST Search API',
  sort: 'stars desc',
  queries: searches,
};
await fs.writeFile(
  'corpus/popularity-search-2026-10-09-ai-500.json',
  `${JSON.stringify(snapshot, null, 2)}\n`,
);
