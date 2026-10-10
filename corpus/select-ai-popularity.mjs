import fs from 'node:fs/promises';
import path from 'node:path';

const token = process.env.CODEX_AI_RESEARCH_GH_TOKEN;
if (!token) throw new Error('Set CODEX_AI_RESEARCH_GH_TOKEN to an authenticated GitHub token.');

const root = 'https://api.github.com';
const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
};
const manifest = JSON.parse(await fs.readFile('corpus/manifest.json', 'utf8'));
const search = JSON.parse(await fs.readFile('corpus/popularity-search-2026-10-09-ai-500.json', 'utf8'));
const target = 500;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const priorRound = await fs
  .readFile('corpus/selection-2026-10-09-ai-500.json', 'utf8')
  .then(JSON.parse)
  .catch(() => null);

async function get(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers });
    if (response.ok) return response.json();
    const body = await response.text();
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
      throw new Error(`GitHub API quota exhausted until ${new Date(reset).toISOString()}.`);
    }
    if (response.status < 500 && response.status !== 429)
      throw new Error(`${response.status} ${url}: ${body.slice(0, 300)}`);
    await pause(1000 * (attempt + 1));
  }
  throw new Error(`Retries exhausted for ${url}`);
}

function slugFromUrl(value) {
  try {
    return new URL(value).pathname
      .replace(/^\//, '')
      .replace(/\.git$/, '')
      .toLowerCase();
  } catch {
    return '';
  }
}

const priorIds = new Set();
const priorSlugs = new Set(manifest.entries.map((entry) => slugFromUrl(entry.repoUrl)).filter(Boolean));
for (const file of await fs.readdir('corpus')) {
  if (!/^selection-.*\.json$/.test(file)) continue;
  if (file === 'selection-2026-10-09-ai-500.json' || file === 'selection-2026-10-09-ai-500.partial.json')
    continue;
  const content = JSON.parse(await fs.readFile(path.join('corpus', file), 'utf8'));
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.githubRepositoryId) priorIds.add(Number(value.githubRepositoryId));
    if (typeof value.repoUrl === 'string') priorSlugs.add(slugFromUrl(value.repoUrl));
    if (typeof value.canonicalSlug === 'string') priorSlugs.add(value.canonicalSlug.toLowerCase());
    for (const child of Object.values(value)) if (typeof child === 'object') visit(child);
  };
  visit(content);
}

const showcaseNames = new Set();
const showcaseUrl =
  'https://raw.githubusercontent.com/paladini/harness-maturity-showcase/main/data/projects.json';
try {
  const response = await fetch(showcaseUrl);
  if (response.ok) {
    const data = await response.json();
    const rows = Array.isArray(data)
      ? data
      : Object.values(data).flatMap((value) => (Array.isArray(value) ? value : []));
    for (const row of rows) {
      for (const key of ['repo', 'repository', 'repoUrl', 'url', 'fullName', 'canonicalSlug']) {
        const value = row?.[key];
        if (typeof value === 'string')
          showcaseNames.add(
            value
              .replace(/^https?:\/\/github\.com\//, '')
              .replace(/\.git$/, '')
              .toLowerCase(),
          );
      }
    }
  }
} catch {}

for (const slug of showcaseNames) priorSlugs.add(slug);
const identitySlugs = new Set(
  [...priorSlugs, ...showcaseNames].filter((slug) => /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(slug)),
);
for (const slug of identitySlugs) {
  try {
    const repo = await get(`${root}/repos/${slug.split('/').map(encodeURIComponent).join('/')}`);
    priorIds.add(Number(repo.id));
    priorSlugs.add(repo.full_name.toLowerCase());
  } catch {}
}

const repositories = new Map();
for (const query of search.queries)
  for (const page of query.pages)
    for (const repo of page.items) {
      const id = Number(repo.id);
      const found = repositories.get(id);
      if (found) found.queries.push(query.query);
      else repositories.set(id, { ...repo, queries: [query.query] });
    }

const rows = [...repositories.values()].sort(
  (a, b) => b.stargazers_count - a.stargazers_count || a.full_name.localeCompare(b.full_name),
);
const exclusions = [];
const candidates = [];
const nonSoftware =
  /(^|[\s/_-])(awesome|course|tutorial|lesson|curriculum|beginner|beginners|guide|textbook|cookbook|roadmap|cheatsheet|papers|resources|system[_ -]prompts|prompt[- ]collection|interview[- ]notes|checklist|best[-_ ]?practice|skills?|skillhub|notebooks?|interviews?|paper[-_]implementations?|specialization[-_]coursera|figures4papers)([\s/_-]|$)|guide$|^learn[-_]/i;
const aiProduct =
  /\b(ai|llm|large language|machine learning|deep learning|generative|agent|transformer|diffusion|neural|chatgpt|openai|anthropic|gemini|claude|codex|copilot|gpt|llama|vision|speech|inference|embedding|ocr|text.to.speech|voice|prompt|rag|model|ml ops)\b/i;
const weakAiMention =
  /\bAI[- ]ready\b|\bAI applications?\b|\bAI[- ]enabled (?:platform|workflow|database|monitoring|observability|infrastructure)\b/i;
const oldProcessed = new Set(
  [...(priorRound?.candidates || []), ...(priorRound?.exclusions || [])]
    .map((item) => Number(item.githubRepositoryId ?? item.id))
    .filter(Number.isFinite),
);
const oldCandidateById = new Map(
  (priorRound?.candidates || []).map((item) => [Number(item.githubRepositoryId), item]),
);
for (const repo of rows) {
  const slug = repo.full_name.toLowerCase();
  const description = repo.description || '';
  const firstSentence = description.split(/[.!?\n]/, 1)[0];
  const reason = repo.fork
    ? 'fork'
    : repo.disabled
      ? 'disabled'
      : !repo.default_branch
        ? 'no default branch'
        : priorIds.has(Number(repo.id))
          ? 'previously selected'
          : priorSlugs.has(slug)
            ? 'already in analysis corpus or Showcase'
            : nonSoftware.test(repo.name) ||
                nonSoftware.test(repo.full_name) ||
                /\b(lessons?|weeks?, \d+ lessons?|curriculum|interactive book|course|tutorial|educational|reference only|curated list|collection of prompts|papers and resources)\b/i.test(
                  description,
                )
              ? 'guide, course, reference collection or learning-only repository'
              : !aiProduct.test(`${repo.name} ${firstSentence}`) ||
                  (weakAiMention.test(firstSentence) &&
                    !/\b(agent|llm|model|gpt|openai|anthropic|gemini|claude|copilot|transformer|diffusion|embedding|rag)\b/i.test(
                      `${repo.name} ${firstSentence}`,
                    ))
                ? 'AI appears incidental or the project is general-purpose'
                : null;
  if (reason) {
    exclusions.push({ id: repo.id, slug: repo.full_name, stars: repo.stargazers_count, reason });
    continue;
  }
  if (repo.stargazers_count < 100) {
    exclusions.push({
      id: repo.id,
      slug: repo.full_name,
      stars: repo.stargazers_count,
      reason: 'below search floor',
    });
    continue;
  }
  if (oldCandidateById.has(Number(repo.id)))
    candidates.push({ ...repo, cached: oldCandidateById.get(Number(repo.id)) });
  else if (!oldProcessed.has(Number(repo.id))) candidates.push(repo);
}

let checkpoint;
try {
  checkpoint = JSON.parse(await fs.readFile('corpus/selection-2026-10-09-ai-500.partial.json', 'utf8'));
} catch {}
const admitted =
  checkpoint?.admitted ||
  candidates
    .map((repo) => repo.cached)
    .filter(Boolean)
    .filter(
      (item) =>
        !nonSoftware.test(item.canonicalSlug.split('/').at(-1)) &&
        !nonSoftware.test(item.purpose || '') &&
        aiProduct.test(`${item.canonicalSlug} ${(item.purpose || '').split(/[.!?\n]/, 1)[0]}`) &&
        !(
          weakAiMention.test((item.purpose || '').split(/[.!?\n]/, 1)[0]) &&
          !/\b(agent|llm|model|gpt|openai|anthropic|gemini|claude|copilot|transformer|diffusion|embedding|rag)\b/i.test(
            `${item.canonicalSlug} ${item.purpose}`,
          )
        ),
    );
for (const item of priorRound?.candidates || [])
  if (!admitted.some((entry) => entry.githubRepositoryId === item.githubRepositoryId))
    exclusions.push({
      id: item.githubRepositoryId,
      slug: item.canonicalSlug,
      stars: item.githubStars,
      reason: 'removed by stricter AI-software and reference-only eligibility review',
    });
const pendingCandidates = candidates.filter((repo) => !repo.cached);
const resumedExclusions = checkpoint?.exclusions || [];
if (checkpoint)
  exclusions.push(
    ...resumedExclusions.filter(
      (item) => !exclusions.some((existing) => existing.id === item.id && existing.reason === item.reason),
    ),
  );
const codeExt =
  /\.(py|pyi|js|jsx|mjs|cjs|ts|tsx|mts|cts|go|rs|java|kt|kts|scala|sc|cpp|cc|cxx|c|h|hpp|cs|rb|php|swift|sh|bash|lua|ex|exs|erl|hrl|clj|cljs|cljc|dart|vue|svelte)$/i;
const ignored =
  /(^|\/)(docs?|documentation|examples?|tutorials?|courses?|tests?|__tests__|fixtures?|assets?|images?|data|datasets?|benchmarks?|vendor|third.party|node_modules|dist|build|target|\.github)(\/|$)/i;
const readme = /^readme(?:\.(?:md|markdown|rst|txt))?$/i;
const softwareSignal =
  /\b(install|installation|usage|quick ?start|run|launch|cli|command line|sdk|library|framework|application|app|server|api|web ui|desktop|extension|plugin|editor|ide|inference|training|fine.?tun|model|agent|workflow|docker|pip install|npm install|cargo add)\b/i;
const aiSignal =
  /\b(ai|artificial intelligence|machine learning|deep learning|large language model|\bllm\b|generative|neural|transformer|diffusion|chatgpt|claude|openai|anthropic|gemini|copilot|agent|embedding|inference|multimodal)\b/i;
let examined = checkpoint?.examined || 0;
let cursor = examined;
let stop = false;
let checkpointQueue = Promise.resolve();
async function examine(repo) {
  const encodeSlug = repo.full_name.split('/').map(encodeURIComponent).join('/');
  try {
    const commit = await get(
      `${root}/repos/${encodeSlug}/commits/${encodeURIComponent(repo.default_branch)}`,
    );
    const sha = commit.sha;
    const tree = await get(`${root}/repos/${encodeSlug}/git/trees/${sha}?recursive=1`);
    if (tree.truncated) {
      exclusions.push({
        id: repo.id,
        slug: repo.full_name,
        stars: repo.stargazers_count,
        reason: 'truncated Git tree; implementation evidence not verifiable',
      });
      return;
    }
    const readmeEntry = tree.tree.find(
      (item) => item.type === 'blob' && item.path.includes('/') === false && readme.test(item.path),
    );
    const codeEntry = tree.tree.find(
      (item) => item.type === 'blob' && item.size > 80 && codeExt.test(item.path) && !ignored.test(item.path),
    );
    if (!readmeEntry || !codeEntry) {
      exclusions.push({
        id: repo.id,
        slug: repo.full_name,
        stars: repo.stargazers_count,
        reason: !readmeEntry
          ? 'no root README at pinned HEAD'
          : 'no implementation source file at pinned HEAD',
      });
      return;
    }
    const rawBase = `https://raw.githubusercontent.com/${repo.full_name}/${sha}/`;
    const readmeResponse = await fetch(
      rawBase + readmeEntry.path.split('/').map(encodeURIComponent).join('/'),
    );
    const codeResponse = await fetch(rawBase + codeEntry.path.split('/').map(encodeURIComponent).join('/'));
    if (!readmeResponse.ok || !codeResponse.ok) {
      exclusions.push({
        id: repo.id,
        slug: repo.full_name,
        stars: repo.stargazers_count,
        reason: 'pinned README or implementation blob was not publicly readable',
      });
      return;
    }
    const readmeText = await readmeResponse.text();
    const codeText = await codeResponse.text();
    const purpose = (
      repo.description ||
      readmeText.split(/\r?\n/).find((line) => line.trim() && !line.startsWith('#')) ||
      repo.full_name
    )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 400);
    if (
      !aiSignal.test(`${repo.name} ${repo.description || ''} ${readmeText.slice(0, 12000)}`) ||
      !softwareSignal.test(`${repo.description || ''} ${readmeText.slice(0, 30000)}`)
    ) {
      exclusions.push({
        id: repo.id,
        slug: repo.full_name,
        stars: repo.stargazers_count,
        reason: 'README evidence did not confirm AI software purpose',
      });
      return;
    }
    if (codeText.length < 80 || codeText.startsWith('version https://git-lfs.github.com/spec/v1')) {
      exclusions.push({
        id: repo.id,
        slug: repo.full_name,
        stars: repo.stargazers_count,
        reason: 'implementation source empty or LFS pointer',
      });
      return;
    }
    const categoryText = `${repo.name} ${repo.description || ''} ${repo.queries.join(' ')}`.toLowerCase();
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
      purpose,
      codeEvidence: { path: codeEntry.path, blobSha: codeEntry.sha, size: codeEntry.size },
      readmeEvidence: `${repo.html_url}/blob/${sha}/${readmeEntry.path.split('/').map(encodeURIComponent).join('/')}`,
      checkoutPlan:
        'Full repository root; LFS smudging disabled; submodules uninitialized; preserve native symlinks.',
      matchedQueries: [...new Set(repo.queries)],
    });
    if (admitted.length % 50 === 0) {
      console.log(
        `verified ${admitted.length}/${target}; examined ${examined}; API remaining ${commit.headers?.['x-ratelimit-remaining'] ?? 'unknown'}`,
      );
      checkpointQueue = checkpointQueue.then(() =>
        fs.writeFile(
          'corpus/selection-2026-10-09-ai-500.partial.json',
          JSON.stringify({ admitted, exclusions, examined }, null, 2),
        ),
      );
    }
  } catch (error) {
    exclusions.push({
      id: repo.id,
      slug: repo.full_name,
      stars: repo.stargazers_count,
      reason: `verification error: ${String(error).slice(0, 250)}`,
    });
    if (String(error).includes('quota exhausted')) stop = true;
  }
}

async function worker() {
  while (!stop && admitted.length < target) {
    const index = cursor++;
    if (index >= pendingCandidates.length) return;
    const repo = pendingCandidates[index];
    examined += 1;
    await examine(repo);
  }
}
await Promise.all(Array.from({ length: 12 }, () => worker()));
await checkpointQueue;
admitted.sort((a, b) => b.githubStars - a.githubStars || a.canonicalSlug.localeCompare(b.canonicalSlug));
admitted.length = Math.min(admitted.length, target);
admitted.forEach((item, index) => {
  item.popularityRank = index + 1;
});
const exclusionsSummary = {};
for (const item of exclusions) {
  exclusionsSummary[item.reason] = (exclusionsSummary[item.reason] || 0) + 1;
}

const result = {
  schemaVersion: 1,
  selectionDate: '2026-10-09',
  cohort: 'ai-popularity-500',
  category: 'AI software, AI-first developer tools, AI companies and startups, and AI-native IDEs',
  audience: 'Users and builders of AI products, models, applications, agents, developer tools, and IDEs',
  explicitUserOverride:
    'User requested a 500-repository AI cohort; AI/LLM/agents has prior history and is an intentional category expansion.',
  baselineCount: manifest.entries.length,
  targetCount: target,
  achievedCount: admitted.length,
  baselineToolVersion: manifest.toolVersion,
  metric:
    'GitHub stargazers_count observed in GitHub Search API on 2026-10-09, descending within the recorded bounded query union',
  searchSnapshot: 'popularity-search-2026-10-09-ai-500.json',
  queries: search.queries.map(({ query, totalCount, fetchedPages, pages }) => ({
    query,
    totalCount,
    fetchedPages,
    incompleteResults: pages.some((page) => page.incompleteResults),
  })),
  universeLimit:
    'Eight GitHub search queries, up to the first 300 stars-sorted results per query, with GitHub Search API query semantics and caps. This is a bounded candidate universe, not the global top 500 across all AI software.',
  exclusionsSummary,
  candidates: admitted,
  exclusions,
};
const output = `corpus/selection-2026-10-09-ai-500.json`;
await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
await fs.rm('corpus/selection-2026-10-09-ai-500.partial.json', { force: true });
console.log(
  `selection=${admitted.length}/${target}; examined=${examined}; excluded=${exclusions.length}; output=${output}`,
);
