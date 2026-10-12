#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
if (!token) throw new Error('Set GH_TOKEN from `gh auth token` before running.');
const discoveryPath = new URL('./popularity-search-2026-10-11-scientific-software.json', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'));
const showcasePath = process.argv[2];
if (!showcasePath) throw new Error('Pass the current Showcase data/projects.json path.');
const showcase = JSON.parse(readFileSync(showcasePath, 'utf8'));
const discovery = JSON.parse(readFileSync(discoveryPath, 'utf8'));
const selectedAt = new Date().toISOString();
const selectionDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const TARGET = 500;
const resumeSelection = process.env.RESUME_SELECTION === '1';
const SEED = 1760233997;
const runId = 'scientific-software-random-500';
const relevanceExclusions = new Map([
  ['nicufarmache/lovelace-big-slider-card', 'Home Assistant UI card, not scientific software'],
  ['cambridgeengineering/partia-computing-michaelmas', 'university course exercises'],
  ['artem-sedykh/mini-climate-card', 'Home Assistant UI card, not scientific software'],
  ['kartoffeltoby/better-thermostat', 'Home Assistant thermostat integration'],
  ['neonscience/neon-data-skills', 'self-paced data literacy tutorials'],
  ['lo-th/phy', 'physics game engine, not research software'],
  ['thewand3rer/universe', 'space-themed game development library'],
  ['anyayayplus/chemistry-note', 'high-school chemistry notes'],
  ['rickyfont94/climate-cluster-card', 'Home Assistant HVAC UI card'],
  ['tidyomics/tidyomicsblog-archive', 'blog archive'],
  ['tidyomics/tidyomicsblog-archive', 'blog archive'],
  ['make-all/tuya-local', 'Home Assistant smart-home integrations'],
  ['geoscixyz/computation', 'geophysics course tutorials and notebooks'],
  [
    'zencefilefendi/diyanet-offline-namaz-vakitleri-hesaplama',
    'prayer-time calculator, not scientific software',
  ],
  ['coskuncay/flutter-weather-forecast', 'consumer weather forecast widget'],
  ['costrouc/mse-machinelearning-notebooks', 'introductory course notebooks'],
  ['mmarquez76/astrologyclock', 'astrology display application'],
  ['gh-x-st/aeronautical-engineering-imperial', 'university study materials'],
  ['raghurama123/numqm-basic', 'undergraduate physics mini-course'],
  ['stuntrally/stuntrally3', 'racing game'],
  ['leouieda/python-hawaii-2017', 'Python workshop materials'],
  ['geoscixyz/geosci-labs', 'applied geophysics teaching labs'],
  ['h4de5/home-assistant-toshiba-ac', 'Home Assistant appliance integration'],
  ['bm1549/home-assistant-frigidaire', 'Home Assistant appliance integration'],
  ['enzod86/tuya-smart-ir-ac', 'Home Assistant appliance integration'],
  ['tailuge/billiards', 'browser billiards game'],
  ['kroitor/gjk.c', 'generic collision-detection algorithm for games'],
  ['harfang3d/harfang3d', 'general-purpose 3D game engine'],
  ['jaechang-hits/sciagent-skills', 'AI agent prompt and skill collection'],
  ['ialbert/biostar-central', 'community Q&A website, not scientific analysis software'],
  ['nishant-pathak/mathview', 'general-purpose formula rendering app'],
]);
const baselineCommit = 'ce37e4151bb9ea7349da5afa17b4d393dfbc8fd1';
const showcaseBaselineCommit = '686edb4345d20f296b839a0e5789bd71d41847d5';
const shortlist = [
  'geospatial-software',
  'cybersecurity-products',
  'iot-and-embedded-software',
  'scientific-computing-and-bioinformatics',
  'education-and-learning-software',
];

const alias = (value) =>
  String(value ?? '')
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^git@github\.com:/i, '')
    .replace(/\.git$/i, '')
    .replace(/\/$/, '')
    .toLowerCase();
const aliases = new Set();
for (const entry of manifest.entries) aliases.add(alias(entry.repoUrl));
for (const project of showcase) aliases.add(alias(project.repo));
const excludedIds = new Set();
const ledgers = readdirSync(new URL('./', import.meta.url)).filter(
  (name) =>
    name.startsWith('selection-') &&
    name.endsWith('.json') &&
    name !== 'selection-2026-10-11-scientific-software-random-500.json',
);
for (const file of ledgers) {
  try {
    const data = JSON.parse(readFileSync(new URL(`./${file}`, import.meta.url), 'utf8'));
    for (const item of data.selected ?? data.entries ?? []) {
      if (item.canonicalId != null) excludedIds.add(String(item.canonicalId));
      const name = item.canonicalSlug ?? item.fullName;
      if (name) aliases.add(alias(name));
    }
  } catch {}
}

const badName =
  /(^|[-_])(awesome|awesome-list|course|courses|tutorial|tutorials|textbook|book|lecture|lectures|slides|dataset|datasets|paper|papers|notes|guide|collection|catalog|list)([-_]|$)/i;
const scientificSignal =
  /bioinformatics|computational biology|genomics|proteomics|single.cell|scientific|astronom|astrophys|physics|chemistry|climate|earth science|geophys|ecolog|neuroscien|microscopy|medical imag|materials science|oceanograph|meteorolog|numerical|simulation|research software|science/i;
function random32(state) {
  let value = state.value;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.value = value >>> 0;
  return state.value / 0x1_0000_0000;
}
async function api(path, attempts = 5) {
  const url = `https://api.github.com${path}`;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'harness-maturity-corpus-research',
      },
    });
    if (response.ok) return { data: await response.json(), response };
    const body = await response.text();
    if (response.status === 403 || response.status === 429) {
      const reset = Number(response.headers.get('x-ratelimit-reset'));
      const waitMs =
        response.headers.get('x-ratelimit-remaining') === '0' && reset
          ? Math.max(1000, reset * 1000 - Date.now() + 1000)
          : 65_000;
      await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 15 * 60_000)));
      continue;
    }
    if (response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 1_500 * (attempt + 1)));
      continue;
    }
    throw new Error(`${response.status} ${url}: ${body.slice(0, 300)}`);
  }
  throw new Error(`API retries exhausted: ${url}`);
}
const resolvedCommunity = [];
const communityRepos = [
  ...new Set(
    showcase
      .filter((project) => project.category === 'community')
      .map((project) => alias(project.repo))
      .filter((name) => name.includes('/')),
  ),
];
for (const fullName of communityRepos) {
  try {
    const repo = (await api(`/repos/${fullName}`)).data;
    excludedIds.add(String(repo.id));
    resolvedCommunity.push({ fullName, canonicalId: String(repo.id), resolved: true });
  } catch (error) {
    resolvedCommunity.push({
      fullName,
      canonicalId: null,
      resolved: false,
      reason: String(error.message ?? error),
    });
  }
}
const eligible = [];
const exclusions = [];
for (const candidate of discovery.candidates) {
  let reason = null;
  const fullName = alias(candidate.fullName);
  if (candidate.isFork) reason = 'fork';
  else if (!candidate.defaultBranch) reason = 'missing default branch';
  else if (excludedIds.has(String(candidate.id))) reason = 'canonical ID already selected';
  else if (aliases.has(fullName)) reason = 'owner/name alias already in Analysis or Showcase';
  else if (!candidate.language) reason = 'no primary programming language';
  else if (candidate.sizeKb < 2) reason = 'repository has no substantial files';
  else if (badName.test(fullName.split('/')[1]) || badName.test(candidate.description ?? ''))
    reason = 'likely list, guide, course, book, dataset or reference material';
  else if (
    !scientificSignal.test(`${fullName} ${candidate.description ?? ''} ${candidate.queries.join(' ')}`)
  )
    reason = 'weak scientific-software signal';
  if (reason)
    exclusions.push({
      id: String(candidate.id),
      fullName: candidate.fullName,
      reason,
      queries: candidate.queries,
    });
  else eligible.push(candidate);
}
const state = { value: SEED >>> 0 };
for (let i = eligible.length - 1; i > 0; i--) {
  const j = Math.floor(random32(state) * (i + 1));
  [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
}
async function gitHead(cloneUrl) {
  const { stdout } = await runFile('git', ['ls-remote', '--symref', cloneUrl, 'HEAD'], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 90_000,
  });
  const ref = stdout.match(/^ref:\s+refs\/heads\/(\S+)\s+HEAD$/m)?.[1] ?? null;
  const sha = stdout.match(/^([0-9a-f]{40})\s+HEAD$/m)?.[1] ?? null;
  if (!ref || !sha)
    throw new Error('git ls-remote did not return a symbolic default branch and full HEAD SHA');
  return { ref, sha };
}
function decodeContent(response) {
  return Buffer.from(response.content ?? '', 'base64').toString('utf8');
}
function rankImplementation(path) {
  const lower = path.toLowerCase();
  if (/(^|\/)(setup|conftest|test|demo|build|install|configure|versiontest)\.(py|r|jl|sh)$/i.test(lower))
    return 99;
  if (/^(test|tests|spec|specs|docs|doc|examples?|data|datasets|build|dist)\//.test(lower)) return 99;
  if (/\/(test|tests|spec|specs|docs|examples?|data|datasets)\//.test(lower)) return 90;
  const sourceRoot = /^(src|lib|pkg|package|r|python|app|core|modules?)\//.test(lower) ? 0 : 10;
  const extRank =
    /\.(py|r|jl|f90|f95|f|for|c|h|cpp|cc|cxx|rs|go|js|ts|java|scala|ipynb|rmd|cu|rb|cs|lua|m|sh)$/i.test(
      lower,
    )
      ? 0
      : 20;
  return sourceRoot + extRank;
}
const previousLedger = resumeSelection
  ? JSON.parse(
      readFileSync(
        new URL('./selection-2026-10-11-scientific-software-random-500.json', import.meta.url),
        'utf8',
      ),
    )
  : null;
const selectionReplacements = new Map([
  ['tailuge/billiards', 'browser billiards game'],
  ['kroitor/gjk.c', 'generic collision-detection algorithm for games'],
  ['harfang3d/harfang3d', 'general-purpose 3D game engine'],
  ['jaechang-hits/sciagent-skills', 'AI agent prompt and skill collection'],
  ['ialbert/biostar-central', 'community Q&A website, not scientific analysis software'],
  ['nishant-pathak/mathview', 'general-purpose formula rendering app'],
]);
const previousLastRank = previousLedger?.selected.at(-1)?.sampleRank ?? 0;
const retained = (previousLedger?.selected ?? []).filter(
  (row) => !selectionReplacements.has(row.canonicalSlug.toLowerCase().replaceAll('_', '-')),
);
const explicitRejections = (previousLedger?.selected ?? [])
  .filter((row) => selectionReplacements.has(row.canonicalSlug.toLowerCase().replaceAll('_', '-')))
  .map((row) => ({
    sampleRank: row.sampleRank,
    canonicalId: row.canonicalId,
    canonicalSlug: row.canonicalSlug,
    reason: selectionReplacements.get(row.canonicalSlug.toLowerCase().replaceAll('_', '-')),
  }));
const work = eligible
  .map((candidate, index) => ({ candidate, sampleRank: index + 1 }))
  .filter((item) => !resumeSelection || item.sampleRank > previousLastRank);
const audited = new Map(retained.map((row) => [row.sampleRank, row]));
const reasons = [...(previousLedger?.postPinRejections ?? []), ...explicitRejections];
let next = 0;
let completed = 0;
async function worker() {
  while (next < work.length && audited.size < TARGET) {
    const item = work[next++];
    try {
      const candidate = item.candidate;
      const relevanceExclusion = relevanceExclusions.get(
        candidate.fullName.toLowerCase().replaceAll('_', '-'),
      );
      if (relevanceExclusion) throw new Error(relevanceExclusion);
      if (candidate.fullName.toLowerCase() === 'gh-x-st/aeronautical-engineering-imperial') {
        throw new Error('pinned README identifies study materials rather than a software implementation');
      }
      const pin = await gitHead(candidate.cloneUrl);
      const slug = alias(candidate.fullName);
      const treeResult = await api(`/repos/${slug}/git/trees/${pin.sha}?recursive=1`);
      const tree = treeResult.data;
      if (tree.truncated) throw new Error('recursive Git tree is truncated');
      const readme = tree.tree.find(
        (entry) => entry.type === 'blob' && /^readme(?:\.[^/]+)?$/i.test(entry.path),
      );
      if (!readme) throw new Error('no root README at pinned commit');
      const readmeResult = await api(
        `/repos/${slug}/contents/${encodeURIComponent(readme.path)}?ref=${pin.sha}`,
      );
      const readmeText = decodeContent(readmeResult.data);
      if (readmeText.length < 300)
        throw new Error('pinned README is too short to establish software purpose');
      if (
        /awesome list|curated list of|collection of links|course materials|lecture notes|textbook/i.test(
          readmeText.slice(0, 8000),
        )
      )
        throw new Error('pinned README identifies reference-only/course material');
      const files = tree.tree
        .filter(
          (entry) =>
            entry.type === 'blob' &&
            entry.size > 80 &&
            entry.size < 1_000_000 &&
            rankImplementation(entry.path) < 30,
        )
        .sort(
          (a, b) =>
            rankImplementation(a.path) - rankImplementation(b.path) ||
            a.path.length - b.path.length ||
            a.path.localeCompare(b.path),
        );
      if (!files.length) throw new Error('no plausible source implementation file in pinned tree');
      let implementation = null;
      let implementationText = '';
      for (const file of files.slice(0, 5)) {
        const blob = await api(`/repos/${slug}/git/blobs/${file.sha}`);
        const source = decodeContent(blob.data);
        if (source.trim().length < 80 || /^(?:\s*(?:\/\/|#|\*|\*\/|<!--))+$/.test(source.slice(0, 300)))
          continue;
        implementation = file;
        implementationText = source;
        break;
      }
      if (!implementation) throw new Error('candidate source blobs were empty or unavailable');
      const selectionCategory = candidate.queries.some((q) =>
        /bioinformatics|biology|genomics|proteomics|single-cell/.test(q),
      )
        ? 'computational-biology'
        : candidate.queries.some((q) => /astronomy|astrophysics/.test(q))
          ? 'astronomy'
          : candidate.queries.some((q) => /chemistry|materials-science/.test(q))
            ? 'chemistry-materials'
            : candidate.queries.some((q) =>
                  /climate|earth-science|geophysics|oceanography|meteorology/.test(q),
                )
              ? 'earth-climate'
              : candidate.queries.some((q) => /ecology|neuroscience|microscopy|medical-imaging/.test(q))
                ? 'life-sciences'
                : candidate.queries.some((q) => /physics|numerical-methods/.test(q))
                  ? 'physics-numerics'
                  : 'scientific-computing';
      const purpose =
        candidate.description ||
        readmeText
          .split(/\r?\n/)
          .map((line) => line.replace(/^#+\s*/, '').trim())
          .find((line) => line.length > 30) ||
        candidate.fullName;
      audited.set(item.sampleRank, {
        cohortRank: null,
        sampleRank: item.sampleRank,
        focusCategory: selectionCategory,
        name: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: 'data-ml-science',
        canonicalId: String(candidate.id),
        githubRepositoryId: Number(candidate.id),
        canonicalSlug: candidate.fullName,
        repoUrl: candidate.cloneUrl,
        defaultBranch: pin.ref,
        commit: pin.sha,
        stars: candidate.stars,
        githubStars: candidate.stars,
        observedStars: candidate.stars,
        starsObservedAt: discovery.capturedAt,
        selectionMode: 'random',
        searchTopics: candidate.queries,
        archived: candidate.archived,
        license: candidate.license,
        language: candidate.language,
        pushedAt: candidate.pushedAt,
        purpose: purpose.slice(0, 700),
        readme: {
          path: readme.path,
          blobSha: readme.sha,
          url: `${candidate.htmlUrl}/blob/${pin.sha}/${readme.path}`,
        },
        implementation: {
          path: implementation.path,
          blobSha: implementation.sha,
          url: `${candidate.htmlUrl}/blob/${pin.sha}/${implementation.path}`,
        },
        evidenceAudit: {
          treeSha: tree.sha,
          treeTruncated: false,
          relevanceCheckedAt: new Date().toISOString(),
          readmeBlobVerified: Boolean(readmeResult.data.sha),
          readmeBytes: Buffer.byteLength(readmeText),
          implementationBlobVerified: Boolean(implementation.sha),
          implementationBytes: Buffer.byteLength(implementationText),
          implementationExcerpt: implementationText.slice(0, 500),
        },
        manifestName: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      });
    } catch (error) {
      reasons.push({
        sampleRank: item.sampleRank,
        canonicalId: String(item.candidate.id),
        canonicalSlug: item.candidate.fullName,
        reason: String(error.message ?? error),
      });
    } finally {
      completed++;
      if (completed % 25 === 0 || audited.size >= TARGET)
        console.log(`Pinned evidence audited ${completed}; accepted ${audited.size}/${TARGET}.`);
    }
  }
}
await Promise.all(Array.from({ length: 10 }, () => worker()));
const chosen = [...audited.values()].sort((a, b) => a.sampleRank - b.sampleRank).slice(0, TARGET);
if (chosen.length !== TARGET)
  throw new Error(
    `Only ${chosen.length}/${TARGET} pinned software projects passed evidence audit. Search more candidates before scanning.`,
  );
chosen.forEach((row, index) => {
  row.cohortRank = index + 1;
});
const names = new Set(manifest.entries.map((entry) => entry.name.toLowerCase()));
for (const row of chosen) {
  if (names.has(row.manifestName.toLowerCase()))
    throw new Error(`Manifest name collision for ${row.manifestName}`);
  names.add(row.manifestName.toLowerCase());
}
const selectedIds = new Set(chosen.map((row) => row.canonicalId));
if (selectedIds.size !== TARGET) throw new Error(`Canonical ID collision: ${selectedIds.size}/${TARGET}`);

const randomOrder = eligible.map((candidate) => String(candidate.id));
const candidatePoolDigest = createHash('sha256').update(randomOrder.join('\n')).digest('hex');
const lowestStarsRetrievedByTopic = Object.fromEntries(
  discovery.topics.map((topic) => [
    topic,
    Math.min(
      ...discovery.candidates
        .filter((candidate) => candidate.queries.includes(topic))
        .map((candidate) => candidate.stars),
    ),
  ]),
);
const ledger = {
  schemaVersion: 1,
  cohort: runId,
  runId,
  selectionDate,
  selectedAt,
  selectedDate: selectionDate,
  targetCount: TARGET,
  achievedCount: chosen.length,
  niche: 'scientific-software',
  category: 'data-ml-science',
  categoryDescription:
    'Open-source software implementing computational biology, astronomy, physics, chemistry, climate and earth science, ecology, microscopy, medical imaging, or scientific computation.',
  targetAudience:
    'Researchers and engineers using software to analyze scientific data, run simulations, and build scientific workflows.',
  categoryAliases: discovery.topics,
  priorHistoryConsulted: ledgers.map((name) => `corpus/${name}`),
  categoryShortlist: shortlist,
  categoryDraw: {
    seed: 20261011,
    algorithm: '.NET System.Random(seed).Next(0,5)',
    index: 3,
    selected: 'scientific-computing-and-bioinformatics',
  },
  baseline: {
    analysisCommit: baselineCommit,
    analysisEntries: manifest.entries.length,
    showcaseCommit: showcaseBaselineCommit,
    showcaseRecords: showcase.length,
    showcaseUniqueRepos: new Set(showcase.map((project) => alias(project.repo))).size,
  },
  scanner: manifest.toolVersion,
  search: {
    endpoint: discovery.endpoint,
    capturedAt: discovery.capturedAt,
    queryMode: discovery.queryMode,
    queryLimit: discovery.queryLimit,
    rawReturnedRecords: discovery.rawReturnedRecords,
    candidateIds: discovery.uniqueCanonicalIds,
    lowestStarsRetrievedByTopic,
    searches: discovery.searches,
  },
  candidatePool: {
    eligibleCount: eligible.length,
    sha256OfRandomizedCanonicalIdOrder: candidatePoolDigest,
    sampleSeed: SEED,
    sampleAlgorithm: 'xorshift32 Fisher-Yates shuffle over eligible IDs in discovery insertion order',
    randomizedCanonicalIds: randomOrder,
  },
  excludedCandidates: exclusions,
  resolvedCommunity,
  postPinRejections: reasons,
  selected: chosen,
  discoveryPath: 'corpus/popularity-search-2026-10-11-scientific-software.json',
  analysisIssueNumber: 22,
  analysisIssueUrl: 'https://github.com/paladini/harness-maturity-analysis/issues/22',
  analysisPrUrl: null,
  showcaseIssueUrl: null,
  showcasePrUrl: null,
};
writeFileSync(
  new URL('./selection-2026-10-11-scientific-software-random-500.json', import.meta.url),
  `${JSON.stringify(ledger, null, 2)}\n`,
  'utf8',
);
const table = chosen
  .map(
    (row) =>
      `| ${row.canonicalSlug} | ${row.canonicalId} | ${row.stars} | ${row.commit} | ${row.readme.path} → ${row.implementation.path} |`,
  )
  .join('\n');
const issue = `## Objective\n\nAdd exactly 500 new public scientific-software repositories selected by reproducible random sampling from a bounded GitHub search union. Scanner evidence only; no blind ratings or external-validity claims. Requested by Fernando Paladini.\n\n## Selection and baseline\n\n- Analysis baseline: \`${baselineCommit}\`, ${manifest.entries.length} entries; Showcase baseline: \`${showcaseBaselineCommit}\`, ${showcase.length} repository-version records across ${new Set(showcase.map((project) => alias(project.repo))).size} repositories.\n- Scanner: \`${manifest.toolVersion}\`.\n- Category draw: seed 20261011, shortlist ${shortlist.join(', ')}, selected scientific computing and bioinformatics.\n- Discovery: ${discovery.searches.length} bounded GraphQL topic searches across ${discovery.topics.length} scientific topics; ${discovery.rawReturnedRecords} returned records and ${discovery.uniqueCanonicalIds} unique canonical IDs. Results are a bounded search union, not a global ranking.\n- Random sample: xorshift32 Fisher-Yates seed ${SEED} over ${eligible.length} eligible new candidates; stars are recorded provenance and do not affect Harness Score or sample order.\n- Every selected project is public, non-fork software. Pins and README/implementation blob evidence were verified against the selected commit; no repository code is executed.\n- Full discovery, exclusions, reproducible candidate order, exact pins, README and implementation blob evidence: [selection ledger](https://github.com/paladini/harness-maturity-analysis/blob/BRANCH/corpus/selection-2026-10-11-scientific-software-random-500.json) and [discovery snapshot](https://github.com/paladini/harness-maturity-analysis/blob/BRANCH/corpus/popularity-search-2026-10-11-scientific-software.json).\n\n## Selected projects\n\n| Repository | GitHub ID | Stars | Exact commit | Pinned README → implementation |\n|---|---:|---:|---|---|\n${table}\n\n## Acceptance\n\n- [ ] Freeze exactly 500 new canonical identities and pins before scanning.\n- [ ] Add 500 matching \`${manifest.toolVersion}\` reports and one append-only complete history snapshot.\n- [ ] Regenerate results and site; validate preserved baseline pins/reports/history.\n- [ ] Review diff and CI on the exact PR head; merge after green checks.\n- [ ] Import from immutable merged Analysis commit; preserve Showcase community entries and prior snapshots.\n- [ ] Merge Showcase PR and verify public counts, entries, and deployment.\n\n## Progress log\n\n- ${selectionDate}: Category drawn and discovery snapshot captured. Selection is random within the documented eligible pool; not a popularity ranking. No scans have started.\n`;
writeFileSync(
  new URL('./issue-scientific-software-random-500.md', import.meta.url),
  issue.replaceAll('BRANCH', 'codex/scientific-software-random-500-2026-10-11'),
  'utf8',
);
console.log(
  JSON.stringify(
    {
      eligible: eligible.length,
      audited: reasons.length + chosen.length,
      selected: chosen.length,
      rejections: reasons.length,
      ledger: 'corpus/selection-2026-10-11-scientific-software-random-500.json',
      issueBodyChars: issue.length,
      candidatePoolDigest,
    },
    null,
    2,
  ),
);
