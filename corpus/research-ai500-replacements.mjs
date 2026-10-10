#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const token = process.env.CODEX_AI_RESEARCH_GH_TOKEN;
if (!token) throw new Error('GitHub research token is not configured.');
const selection = JSON.parse(readFileSync('corpus/selection-2026-10-09-ai-500.json', 'utf8'));
const search = JSON.parse(readFileSync('corpus/popularity-search-2026-10-09-ai-500.json', 'utf8'));

import { execFileSync } from 'node:child_process';

const baseline = JSON.parse(
  execFileSync('git', ['show', `${selection.baselineCommit}:corpus/manifest.json`], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }),
);
const currentIds = new Set(selection.candidates.map((item) => Number(item.githubRepositoryId)));
const baselineSlugs = new Set(baseline.entries.map((entry) => slug(entry.repoUrl)));
const removedNames = new Set([
  'ai-engineering-from-scratch',
  'ai-agent-book',
  'ai-engineering-hub',
  'd2l-en',
  'cs249r-book',
  'ml-engineering',
  'ml-nlp',
  'python-machine-learning-book',
  'llmsurvey',
  'all-in-rag',
  'reinforcement-learning-with-tensorflow',
  'machine-learning-examples',
  'machine-learning-collection',
  'python-small-examples',
  'deeplearning',
  'claude-code-book',
  'genai-agents',
  'hands-on-ai-engineering',
]);
const approvedSlugs = new Set([
  'koala73/worldmonitor',
  'calesthio/OpenMontage',
  'OtterMind/Chat2DB',
  'Kilo-Org/kilocode',
  'browserbase/stagehand',
  'UFund-Me/Qbot',
  'Unstructured-IO/unstructured',
  'InsForge/InsForge',
  'tadata-org/fastapi_mcp',
  'humanlayer/humanlayer',
  'holaboss-ai/holaOS',
  'bigscience-workshop/petals',
  'apple/turicreate',
  'dotnet/machinelearning',
  'genspark-ai/genoffice',
  'Nixtla/nixtla',
  'interpretml/interpret',
  'Swift-AI/Swift-AI',
  'aipotheosis-labs/aci',
  'CommandCodeAI/command-code',
  'polyaxon/polyaxon',
  'codexu/note-gen',
  'MemTensor/MemOS',
]);
if (approvedSlugs.size < removedNames.size)
  throw new Error('Replacement allowlist is smaller than the reviewed exclusion set.');
const removed = selection.candidates.filter((item) => removedNames.has(item.name));
if (removed.length !== removedNames.size)
  throw new Error(`Expected ${removedNames.size} reviewed exclusions, found ${removed.length}.`);
const invalidReasons = new Map([
  ['ai-engineering-from-scratch', 'tutorial-first educational repository; not an AI software product'],
  ['ai-agent-book', 'book and chapter examples; excluded by the reference-only rule'],
  ['ai-engineering-hub', 'tutorial collection rather than a software product'],
  ['d2l-en', 'interactive textbook/course repository'],
  ['cs249r-book', 'textbook/reference repository'],
  ['ml-engineering', 'open book and reference materials'],
  ['ml-nlp', 'interview preparation/reference notes'],
  ['python-machine-learning-book', 'book companion and code reference'],
  ['llmsurvey', 'survey paper repository'],
  ['all-in-rag', 'guide/course content rather than a standalone software product'],
  ['reinforcement-learning-with-tensorflow', 'tutorial and course repository'],
  ['machine-learning-examples', 'tutorial and example collection'],
  ['machine-learning-collection', 'learning resource collection'],
  ['python-small-examples', 'general-purpose Python examples; AI is incidental'],
  ['deeplearning', 'textbook companion and reference examples'],
  ['claude-code-book', 'book/reference repository'],
  ['genai-agents', 'tutorial collection rather than a software product'],
  ['hands-on-ai-engineering', 'curated learning project collection'],
]);

function slug(value) {
  try {
    return new URL(value).pathname
      .slice(1)
      .replace(/\.git$/i, '')
      .toLowerCase();
  } catch {
    return '';
  }
}
function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function get(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (response.ok) return response.json();
    const body = await response.text();
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')
      throw new Error(`GitHub API quota exhausted until ${response.headers.get('x-ratelimit-reset')}.`);
    if (response.status < 500 && response.status !== 429)
      throw new Error(`${response.status} ${url}: ${body.slice(0, 200)}`);
    await pause(1000 * (attempt + 1));
  }
  throw new Error(`Retries exhausted for ${url}`);
}

const showcaseSlugs = new Set();
try {
  const response = await fetch(
    'https://raw.githubusercontent.com/paladini/harness-maturity-showcase/main/data/projects.json',
  );
  if (response.ok) {
    const content = await response.json();
    const rows = Array.isArray(content)
      ? content
      : Object.values(content).flatMap((value) => (Array.isArray(value) ? value : []));
    for (const row of rows)
      for (const key of ['repo', 'repository', 'repoUrl', 'url', 'fullName', 'canonicalSlug']) {
        if (typeof row?.[key] === 'string')
          showcaseSlugs.add(
            row[key]
              .replace(/^https?:\/\/github\.com\//i, '')
              .replace(/\.git$/i, '')
              .toLowerCase(),
          );
      }
  }
} catch {}

const pool = new Map();
for (const query of search.queries)
  for (const page of query.pages)
    for (const repo of page.items) {
      const existing = pool.get(Number(repo.id));
      if (existing) existing.matchedQueries.push(query.query);
      else pool.set(Number(repo.id), { ...repo, matchedQueries: [query.query] });
    }
const aiProduct =
  /\b(ai|llm|large language|machine learning|deep learning|generative|agent|transformer|diffusion|neural|chatgpt|openai|anthropic|gemini|claude|codex|copilot|gpt|llama|vision|speech|inference|embedding|ocr|voice|prompt|rag|model|ml ops)\b/i;
const weakMention =
  /\bAI[- ]ready\b|\bAI applications?\b|\bAI[- ]enabled (?:platform|workflow|database|monitoring|observability|infrastructure)\b/i;
const nonSoftware =
  /\b(book|survey paper|tutorials?|lessons?|curriculum|course|textbook|cookbook|roadmap|cheatsheet|reference only|interview notes|job notes|study plan|learning resource|resource collection|curated list|awesome list|system prompts?|skill packs?|skills repository|notebook collection|practice problems)\b/i;
const rows = [...pool.values()]
  .filter((repo) => {
    const name = `${repo.name} ${repo.description || ''}`;
    const slugText = repo.full_name.toLowerCase();
    return (
      approvedSlugs.has(repo.full_name) &&
      !currentIds.has(Number(repo.id)) &&
      !baselineSlugs.has(slugText) &&
      !showcaseSlugs.has(slugText) &&
      !repo.fork &&
      !repo.disabled &&
      repo.default_branch &&
      aiProduct.test(name) &&
      !nonSoftware.test(name) &&
      !(
        weakMention.test(name) &&
        !/\b(agent|llm|model|gpt|openai|anthropic|gemini|claude|copilot|transformer|diffusion|embedding|rag)\b/i.test(
          name,
        )
      )
    );
  })
  .sort((a, b) => b.stargazers_count - a.stargazers_count || a.full_name.localeCompare(b.full_name));

const codeExt =
  /\.(py|pyi|js|jsx|mjs|cjs|ts|tsx|mts|cts|go|rs|java|kt|kts|scala|sc|cpp|cc|cxx|c|h|hpp|cs|rb|php|swift|sh|bash|lua|ex|exs|erl|hrl|clj|cljs|cljc|dart|vue|svelte)$/i;
const ignored =
  /(^|\/)(docs?|documentation|examples?|tutorials?|courses?|tests?|__tests__|fixtures?|assets?|images?|data|datasets?|benchmarks?|vendor|third.party|node_modules|dist|build|target|\.github)(\/|$)/i;
const admitted = [];
const failures = [];
for (const repo of rows) {
  if (admitted.length >= removed.length) break;
  const encodedSlug = repo.full_name.split('/').map(encodeURIComponent).join('/');
  try {
    const commitResponse = await get(
      `https://api.github.com/repos/${encodedSlug}/commits/${encodeURIComponent(repo.default_branch)}`,
    );
    const sha = commitResponse.sha;
    const tree = await get(`https://api.github.com/repos/${encodedSlug}/git/trees/${sha}?recursive=1`);
    if (tree.truncated) {
      failures.push(`${repo.full_name}: truncated tree`);
      continue;
    }
    const readme = tree.tree.find(
      (item) =>
        item.type === 'blob' &&
        !item.path.includes('/') &&
        /^readme(?:\.(?:md|markdown|rst|txt))?$/i.test(item.path),
    );
    const code = tree.tree.find(
      (item) => item.type === 'blob' && item.size > 80 && codeExt.test(item.path) && !ignored.test(item.path),
    );
    if (!readme || !code) {
      failures.push(`${repo.full_name}: missing root README or implementation source`);
      continue;
    }
    const raw = `https://raw.githubusercontent.com/${repo.full_name}/${sha}/`;
    const [readmeResponse, codeResponse] = await Promise.all([
      fetch(raw + readme.path.split('/').map(encodeURIComponent).join('/')),
      fetch(raw + code.path.split('/').map(encodeURIComponent).join('/')),
    ]);
    if (!readmeResponse.ok || !codeResponse.ok) {
      failures.push(`${repo.full_name}: unreadable README/source`);
      continue;
    }
    const [readmeText, codeText] = await Promise.all([readmeResponse.text(), codeResponse.text()]);
    if (!aiProduct.test(`${repo.name} ${repo.description || ''} ${readmeText.slice(0, 12000)}`)) {
      failures.push(`${repo.full_name}: README did not confirm AI purpose`);
      continue;
    }
    if (
      !/\b(install|installation|usage|quick ?start|run|launch|cli|command line|sdk|library|framework|application|app|server|api|web ui|desktop|extension|plugin|editor|ide|inference|training|fine.?tun|model|agent|workflow|docker|pip install|npm install|cargo add)\b/i.test(
        `${repo.description || ''} ${readmeText.slice(0, 30000)}`,
      )
    ) {
      failures.push(`${repo.full_name}: README did not confirm software product`);
      continue;
    }
    if (codeText.length < 80 || codeText.startsWith('version https://git-lfs.github.com/spec/v1')) {
      failures.push(`${repo.full_name}: source is short or LFS pointer`);
      continue;
    }
    const categoryText =
      `${repo.name} ${repo.description || ''} ${repo.matchedQueries.join(' ')}`.toLowerCase();
    const category = /\b(ide|editor|coding|code assistant|copilot)\b/.test(categoryText)
      ? 'ai-coding-tools'
      : /\b(agent|agentic|multi-agent|orchestration)\b/.test(categoryText)
        ? 'ai-agent-frameworks'
        : /\b(inference|serving|model|llm|transformer|diffusion|training|fine.?tun)\b/.test(categoryText)
          ? 'ai-model-inference'
          : /\b(prompt|eval|benchmark|evaluation)\b/.test(categoryText)
            ? 'prompt-eval-engineering'
            : /\b(memory|retrieval|rag|vector)\b/.test(categoryText)
              ? 'ai-memory-retrieval'
              : /\b(vision|image|video|audio|speech|voice)\b/.test(categoryText)
                ? 'ai-vision-media'
                : 'ai-applications';
    admitted.push({
      name: repo.name
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60),
      category,
      repoUrl: `${repo.html_url}.git`,
      commit: sha,
      defaultBranch: repo.default_branch,
      githubRepositoryId: Number(repo.id),
      canonicalSlug: repo.full_name,
      githubProvenance: repo.html_url,
      githubStars: repo.stargazers_count,
      popularityRank: 0,
      selectionMode: 'popular',
      license: repo.license?.spdx_id || 'NOASSERTION',
      sizeKiB: repo.size,
      archived: repo.archived,
      purpose: (
        repo.description ||
        readmeText.split(/\r?\n/).find((line) => line.trim() && !line.startsWith('#')) ||
        repo.full_name
      )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 400),
      codeEvidence: { path: code.path, blobSha: code.sha, size: code.size },
      readmeEvidence: `${repo.html_url}/blob/${sha}/${readme.path.split('/').map(encodeURIComponent).join('/')}`,
      checkoutPlan:
        'Full repository root; LFS smudging disabled; submodules uninitialized; preserve native symlinks.',
      matchedQueries: [...new Set(repo.matchedQueries)],
    });
    await pause(100);
  } catch (error) {
    if (String(error).includes('quota exhausted')) throw error;
    failures.push(`${repo.full_name}: ${String(error).slice(0, 200)}`);
  }
}
writeFileSync(
  'corpus/ai500-replacement-attempt.json',
  `${JSON.stringify({ approvedSlugs: [...approvedSlugs], selectedSlugs: admitted.map((item) => item.canonicalSlug), failures }, null, 2)}\n`,
);
if (admitted.length !== removed.length)
  throw new Error(
    `Found only ${admitted.length}/${removed.length} pinned software replacements in the bounded search snapshot; see corpus/ai500-replacement-attempt.json.`,
  );

const output = {
  removed: removed.map((item) => ({
    name: item.name,
    canonicalSlug: item.canonicalSlug,
    stars: item.githubStars,
    reason: invalidReasons.get(item.name),
  })),
  replacements: admitted,
};
writeFileSync('corpus/ai500-replacement-review.json', `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `verified replacement candidates=${admitted.length}; output=corpus/ai500-replacement-review.json`,
);
