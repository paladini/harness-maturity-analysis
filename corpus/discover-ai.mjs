#!/usr/bin/env node
// GitHub popularity discovery only. Admission remains a source review step.
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOPICS = [
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'llm',
  'generative-ai',
  'chatgpt',
  'ai',
  'stable-diffusion',
  'large-language-models',
  'computer-vision',
  'ai-agent',
  'ai-agents',
  'agentic-ai',
  'coding-agent',
  'speech-recognition',
  'text-to-speech',
  'nlp',
  'llm-inference',
  'mcp',
];
export const AI_SEARCH_QUERIES = [
  ...TOPICS.map((topic) => `topic:${topic}`),
  '"artificial intelligence" in:name,description',
  '"machine learning" in:name,description',
  'LLM in:name,description',
  'AI in:name,description',
  'org:openai',
  'org:anthropics',
].map((query) => `${query} stars:>=20000 fork:false archived:false is:public`);

export function buildPopularitySnapshot(existingCorpus, results, selectionDate, collectedAt) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(selectionDate)) throw new Error('Use a YYYY-MM-DD selection date');
  if (results.some((result) => result.incomplete_results))
    throw new Error('GitHub returned incomplete search results');
  const byId = new Map();
  for (const result of results) {
    for (const item of result.items) {
      if (!byId.has(item.id))
        byId.set(item.id, {
          id: item.id,
          slug: item.full_name,
          githubUrl: item.html_url,
          repoUrl: item.clone_url,
          stars: item.stargazers_count,
          description: item.description,
          topics: item.topics,
          language: item.language,
          defaultBranch: item.default_branch,
          sizeKiB: item.size,
          license: item.license?.spdx_id ?? null,
          licenseName: item.license?.name ?? null,
          archived: item.archived,
          fork: item.fork,
          pushedAt: item.pushed_at,
          queries: [],
        });
      byId.get(item.id).queries.push(result.query);
    }
  }
  const ids = new Set(existingCorpus.map((entry) => entry.id));
  const candidates = [...byId.values()]
    .sort((a, b) => b.stars - a.stars || a.slug.localeCompare(b.slug, 'en'))
    .map((item, index) => ({ ...item, poolRank: index + 1, alreadyInCorpus: ids.has(item.id) }));
  return {
    schemaVersion: 1,
    selectionDate,
    collectedAt,
    metric: 'GitHub stargazers_count',
    minimumStars: 20000,
    perQueryLimit: 100,
    queries: results.map((result) => ({
      query: result.query,
      totalCount: result.total_count,
      incompleteResults: result.incomplete_results,
      returnedCount: result.items.length,
      minRecordedStars: result.items.length
        ? Math.min(...result.items.map((item) => byId.get(item.id).stars))
        : null,
    })),
    existingCorpus,
    candidates,
  };
}

const gh = (args) =>
  new Promise((resolve, reject) => {
    execFile('gh', args, { windowsHide: true, maxBuffer: 24 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message));
      else resolve(JSON.parse(stdout));
    });
  });
async function pool(items, count, fn) {
  let next = 0;
  const out = Array(items.length);
  await Promise.all(
    Array.from({ length: count }, async () => {
      while (next < items.length) {
        const index = next++;
        out[index] = await fn(items[index]);
      }
    }),
  );
  return out;
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '');
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    process.stdout.write(
      'Usage: node corpus/discover-ai.mjs --date YYYY-MM-DD [--out <new-path>]\nRequires authenticated GitHub CLI. Existing snapshots are never overwritten.\n',
    );
  } else {
    const selectionDate = args[args.indexOf('--date') + 1];
    if (!args.includes('--date') || !/^\d{4}-\d{2}-\d{2}$/.test(selectionDate ?? '')) {
      throw new Error('--date YYYY-MM-DD is required');
    }
    const outputPath = args.includes('--out')
      ? args[args.indexOf('--out') + 1]
      : `corpus/popularity-search-${selectionDate}.json`;
    if (!outputPath) throw new Error('--out needs a path');
    if (existsSync(outputPath)) throw new Error(`Refusing to overwrite frozen evidence: ${outputPath}`);
    const manifest = JSON.parse(readFileSync('corpus/manifest.json', 'utf8'));
    const existingCorpus = await pool(manifest.entries, 4, async (entry) => {
      const slug = entry.repoUrl.replace('https://github.com/', '').replace(/\.git$/, '');
      const meta = await gh(['api', `repos/${slug}`]);
      return { name: entry.name, repoUrl: entry.repoUrl, id: meta.id, canonicalSlug: meta.full_name };
    });
    const results = await pool(AI_SEARCH_QUERIES, 2, async (query) => {
      const result = await gh([
        'api',
        '--method',
        'GET',
        'search/repositories',
        '-f',
        `q=${query}`,
        '-f',
        'sort=stars',
        '-f',
        'order=desc',
        '-f',
        'per_page=100',
      ]);
      process.stdout.write(`${result.items.length}/${result.total_count} results: ${query}\n`);
      return { ...result, query };
    });
    const snapshot = buildPopularitySnapshot(
      existingCorpus,
      results,
      selectionDate,
      new Date().toISOString(),
    );
    writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    process.stdout.write(`Wrote ${snapshot.candidates.length} unique discoveries to ${outputPath}\n`);
  }
}
