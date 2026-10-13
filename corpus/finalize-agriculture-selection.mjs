#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const dirUrl = new URL('./', import.meta.url);
const selectionPath = new URL('./selection-2026-10-13-agriculture-software-popularity-500.json', dirUrl);
const discoveryPath = new URL('./popularity-search-2026-10-13-agriculture-software.json', dirUrl);
const checkpointPath = new URL('./checkpoint-2026-10-13-agriculture-popularity-500.json', dirUrl);
const tempPath = new URL('./checkpoint-2026-10-13-agriculture-popularity-500.tmp', dirUrl);
const outputPath = selectionPath;
const selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
const discovery = JSON.parse(readFileSync(discoveryPath, 'utf8'));
const checkpoint = existsSync(checkpointPath) ? JSON.parse(readFileSync(checkpointPath, 'utf8')) : null;
const TARGET = 500;
const agricultureSignal = /agricultur|agtech|agro|farm|farmer|farming|crop|livestock|ranch|irrigat|greenhouse|hydropon|precision.ag|soil|plant disease|weed detect|farm management|agricultural machinery/i;
const badReadme = /awesome list|curated list of|collection of links|course materials|lecture notes|textbook/i;
const manualReject = new Map([
  ['jldbc/coffee-quality-database', 'coffee quality data app, not software for agricultural operations'],
]);
const candidatesById = new Map(discovery.candidates.map((candidate) => [String(candidate.id), candidate]));
const seenIds = new Set(selection.selected.map((row) => row.canonicalId));
const kept = [];
const rejections = [...selection.postPinRejections];
const rejectionsByRank = new Map(rejections.map((row) => [row.sampleRank, row]));
const invalidPath = (path) => {
  const lower = path.toLowerCase();
  const parts = lower.split('/');
  const base = parts.at(-1);
  return (
    parts.some((part) => ['tests', 'test', 'spec', 'specs', 'docs', 'examples', 'debug', 'node_modules', 'vendor', 'dist', 'build'].includes(part)) ||
    /^(test|tests|demo|example|setup|install|configure|deploy|release|beta-deploy)([-_.]|$)/.test(base) ||
    /(^|[-_.])(test|tests|spec|specs)([-_.]|[0-9]|$)/.test(base) ||
    /(^|[-_.])(release|deploy)([-_.]|$)/.test(base) ||
    /(^|\/)(build|deploy|release)[-_a-z0-9]*\.(gradle|sh|ps1|bat|cmd|ya?ml|json)$/.test(lower) ||
    /\.min\.[a-z0-9]+$/.test(base) ||
    /(^|\/)(android|ios|linux|macos|windows|web)\/runner\//.test(lower)
  );
};
for (const row of selection.selected) {
  const rejection = manualReject.get(row.canonicalSlug.toLowerCase()) ||
    (invalidPath(row.implementation.path) ? 'implementation evidence points to test, build, generated or release content' : null);
  if (!rejection) kept.push(row);
  else rejections.push({
    sampleRank: row.sampleRank,
    canonicalId: row.canonicalId,
    canonicalSlug: row.canonicalSlug,
    reason: rejection,
  });
}
const completedRanks = new Set([
  ...selection.selected.map((row) => row.sampleRank),
  ...selection.postPinRejections.map((row) => row.sampleRank),
  ...(checkpoint?.completedRanks ?? []),
]);
const auditedByRank = new Map(kept.map((row) => [row.sampleRank, row]));
const rejectionsAtRank = new Map(rejections.map((row) => [row.sampleRank, row]));
for (const row of checkpoint?.selected ?? []) {
  if (!invalidPath(row.implementation.path)) auditedByRank.set(row.sampleRank, row);
}
for (const row of checkpoint?.rejections ?? []) rejectionsAtRank.set(row.sampleRank, row);
const repositories = [...selection.candidatePool.eligibleCanonicalIdsInOrder]
  .map((id, index) => ({ id: String(id), sampleRank: index + 1, candidate: candidatesById.get(String(id)) }))
  .filter((item) => item.candidate && !completedRanks.has(item.sampleRank));
let next = 0;
let newlyAudited = 0;

async function graphql(query) {
  const { stdout } = await exec('gh', ['api', 'graphql', '-f', `query=${query}`], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 90_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  const result = JSON.parse(stdout);
  if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join('; '));
  return result.data;
}

async function gitHead(cloneUrl) {
  const { stdout } = await exec('git', ['ls-remote', '--symref', cloneUrl, 'HEAD'], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 90_000,
  });
  const ref = stdout.match(/^ref:\s+refs\/heads\/(\S+)\s+HEAD$/m)?.[1] ?? null;
  const sha = stdout.match(/^([0-9a-f]{40})\s+HEAD$/m)?.[1] ?? null;
  if (!ref || !sha) throw new Error('git ls-remote did not return a symbolic default branch and full SHA');
  return { ref, sha };
}

function treeExpression(alias, expression) {
  return `${alias}: object(expression: ${JSON.stringify(expression)}) { ... on Tree { entries { name type oid object { ... on Blob { byteSize } } } } }`;
}
function blobExpression(alias, expression) {
  return `${alias}: object(expression: ${JSON.stringify(expression)}) { ... on Blob { oid byteSize text } }`;
}
function rank(path) {
  const lower = path.toLowerCase();
  const base = lower.split('/').at(-1);
  if (invalidPath(lower)) return 99;
  if (/^(setup|conftest|test|tests|spec|demo|build|install|configure|deploy|release)([-_.]|$)/.test(base)) return 99;
  const rootRank = /(^|\/)(src|lib|pkg|package|packages|r|python|app|core|modules?|backend|frontend|server|client|webapp|api)\//.test(lower) ? 0 : 10;
  const extRank = /\.(py|r|jl|f90|f95|f|for|c|h|hh|hpp|hxx|cpp|cc|cxx|rs|go|js|jsx|ts|tsx|dart|java|scala|ipynb|rmd|cu|rb|cs|lua|m)$/.test(lower) ? 0 : 20;
  return rootRank + extRank;
}
function saveCheckpoint() {
  const value = {
    candidatePoolDigest: selection.candidatePool.sha256OfPopularityOrderedCanonicalIdOrder,
    selected: [...auditedByRank.values()],
    rejections: [...rejectionsAtRank.values()],
    completedRanks: [...completedRanks].sort((a, b) => a - b),
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(tempPath, `${JSON.stringify(value)}\n`, 'utf8');
  renameSync(tempPath, checkpointPath);
}

async function worker() {
  while (next < repositories.length && auditedByRank.size < TARGET) {
    const item = repositories[next++];
    const { candidate, sampleRank } = item;
    try {
      const knownRejection = manualReject.get(candidate.fullName.toLowerCase());
      if (knownRejection) throw new Error(knownRejection);
      const pin = await gitHead(candidate.cloneUrl);
      if (!/^[a-f0-9]{40}$/.test(pin.sha)) throw new Error('invalid full pin');
      const [owner, name] = candidate.fullName.split('/');
      const directories = ['src', 'lib', 'app', 'core', 'backend', 'frontend', 'server', 'client', 'webapp', 'api', 'python', 'pkg', 'packages'];
      const branchField = `branch: defaultBranchRef { name target { ... on Commit { oid root: tree { oid entries { name type oid object { ... on Blob { byteSize } } } } } } }`;
      const treeFields = [branchField, ...directories.map((directory, index) => treeExpression(`dir${index}`, `${pin.sha}:${directory}`))];
      const readmeNames = ['README.md', 'README.rst', 'README', 'Readme.md', 'readme.md', 'README.txt', 'README.MD'];
      const readmeFields = readmeNames.map((path, index) => blobExpression(`readme${index}`, `${pin.sha}:${path}`));
      const query = `query { repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { databaseId ${treeFields.join('\n')} ${readmeFields.join('\n')} } }`;
      const repo = (await graphql(query)).repository;
      if (!repo || String(repo.databaseId) !== String(candidate.id)) throw new Error('canonical repository identity changed');
      if (repo.branch?.target?.oid !== pin.sha) throw new Error('GitHub GraphQL default-branch pin differs from git ls-remote');
      const rootTree = repo.branch.target.root;
      const rootEntries = rootTree?.entries ?? [];
      const readmeEntry = rootEntries.find((entry) => entry.type === 'blob' && /^readme(?:\.[^/]*)?$/i.test(entry.name));
      if (!readmeEntry) throw new Error('no root README at pinned commit');
      const readmeIndex = readmeNames.findIndex((path) => path === readmeEntry.name);
      const readme = repo[`readme${readmeIndex}`];
      if (!readme?.text || readme.text.length < 300) throw new Error('pinned README is too short or unavailable');
      if (badReadme.test(readme.text.slice(0, 8000))) throw new Error('pinned README identifies reference-only/course material');
      if (!agricultureSignal.test(`${candidate.fullName} ${candidate.description ?? ''} ${readme.text.slice(0, 12000)}`))
        throw new Error('pinned README does not establish agricultural software purpose');
      const files = [];
      for (const entry of rootEntries) {
        if (entry.type === 'blob') files.push({ path: entry.name, sha: entry.oid, size: entry.object?.byteSize ?? 0 });
      }
      directories.forEach((directory, index) => {
        for (const entry of repo[`dir${index}`]?.entries ?? []) {
          if (entry.type === 'blob') files.push({ path: `${directory}/${entry.name}`, sha: entry.oid, size: entry.object?.byteSize ?? 0 });
        }
      });
      const plausible = files
        .filter((file) => file.size > 80 && file.size < 1_000_000 && rank(file.path) < 30)
        .sort((a, b) => rank(a.path) - rank(b.path) || a.path.length - b.path.length || a.path.localeCompare(b.path));
      if (!plausible.length) throw new Error('no plausible source implementation file in pinned tree');
      const implementation = plausible[0];
      const contentQuery = `query { repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { source: object(expression: ${JSON.stringify(`${pin.sha}:${implementation.path}`)}) { ... on Blob { oid byteSize text } } } }`;
      const source = (await graphql(contentQuery)).repository?.source;
      if (!source?.text || source.oid !== implementation.sha || source.text.trim().length < 80)
        throw new Error('pinned implementation blob is missing, mismatched, or empty');
      const purpose = candidate.description || readme.text.split(/\r?\n/).map((line) => line.replace(/^#+\s*/, '').trim()).find((line) => line.length > 30) || candidate.fullName;
      const slug = candidate.fullName.toLowerCase();
      auditedByRank.set(sampleRank, {
        cohortRank: null,
        sampleRank,
        focusCategory: candidate.queries[0] ?? 'agriculture',
        name: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: 'agriculture',
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
        selectionMode: 'popular',
        searchTopics: candidate.queries,
        archived: candidate.archived,
        license: candidate.license,
        language: candidate.language,
        pushedAt: candidate.pushedAt,
        purpose: purpose.slice(0, 700),
        readme: { path: readmeEntry.name, blobSha: readme.oid, url: `${candidate.htmlUrl}/blob/${pin.sha}/${readmeEntry.name}` },
        implementation: { path: implementation.path, blobSha: source.oid, url: `${candidate.htmlUrl}/blob/${pin.sha}/${implementation.path}` },
        evidenceAudit: {
          treeSha: rootTree.oid,
          treeTruncated: false,
          relevanceCheckedAt: new Date().toISOString(),
          readmeBlobVerified: true,
          readmeBytes: readme.byteSize,
          readmeExcerpt: readme.text.slice(0, 1000),
          implementationBlobVerified: true,
          implementationBytes: source.byteSize,
          implementationExcerpt: source.text.slice(0, 500),
        },
        manifestName: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      });
    } catch (error) {
      rejectionsAtRank.set(sampleRank, { sampleRank, canonicalId: String(candidate.id), canonicalSlug: candidate.fullName, reason: String(error.message ?? error) });
    } finally {
      completedRanks.add(sampleRank);
      newlyAudited++;
      if (newlyAudited % 5 === 0) saveCheckpoint();
      if (newlyAudited % 5 === 0) console.log(`Replacement evidence ${newlyAudited}; selected ${auditedByRank.size}/${TARGET}.`);
    }
  }
}

await Promise.all(Array.from({ length: 3 }, () => worker()));
const chosen = [...auditedByRank.values()].sort((a, b) => a.sampleRank - b.sampleRank).slice(0, TARGET);
if (chosen.length !== TARGET) throw new Error(`Only ${chosen.length}/${TARGET} projects passed pinned evidence audit.`);
chosen.forEach((row, index) => { row.cohortRank = index + 1; });
const allNames = new Set(JSON.parse(readFileSync(new URL('./manifest.json', dirUrl), 'utf8')).entries.map((entry) => entry.name.toLowerCase()));
const allIds = new Set();
for (const row of chosen) {
  if (allNames.has(row.manifestName) || allIds.has(row.canonicalId)) throw new Error(`Duplicate selected identity or manifest name: ${row.canonicalSlug}`);
  allNames.add(row.manifestName);
  allIds.add(row.canonicalId);
}
selection.selected = chosen;
selection.achievedCount = chosen.length;
selection.postPinRejections = [...rejectionsAtRank.values()].sort((a, b) => a.sampleRank - b.sampleRank);
selection.selectedAt = new Date().toISOString();
selection.analysisIssueNumber = null;
selection.analysisIssueUrl = null;
writeFileSync(outputPath, `${JSON.stringify(selection, null, 2)}\n`, 'utf8');
const table = chosen.map((row) => `|${row.canonicalSlug}|${row.canonicalId}|${row.stars}|${row.commit}|${row.readme.path}>${row.implementation.path}|`).join('\n');
const body = `## Objective\n\nAdd exactly 500 new agriculture-software repositories, selected by observed GitHub stars within a bounded search union. Scanner evidence only; no blind ratings or external-validity claims. Requested by Fernando Paladini.\n\n## Selection and baseline\n\n- Analysis baseline: \`${selection.baseline.analysisCommit}\`, ${selection.baseline.analysisEntries} entries; Showcase baseline: \`${selection.baseline.showcaseCommit}\`, ${selection.baseline.showcaseRecords} repository-version records across ${selection.baseline.showcaseUniqueRepos} repositories.\n- Scanner: \`${selection.scanner}\`.\n- Category draw: seed 20261013, shortlist ${selection.categoryShortlist.join(', ')}, selected agriculture and farming software.\n- Discovery: ${selection.search.searches.length} bounded GraphQL topic searches across ${discovery.topics.length} agriculture topics; ${selection.search.rawReturnedRecords} returned records and ${selection.search.candidateIds} unique canonical IDs. This is a bounded search union, not a global ranking. Music/audio discovery is retained as an explored alternative and excluded from this cohort.\n- Selection order: observed stars descending, canonical name ascending on ties; stars describe selection popularity and do not affect Harness Score.\n- The 500 projects are public, non-fork software. Exact pins, pinned README blobs, implementation blob paths, and evidence excerpts are in the committed selection ledger. Target repository code was never executed.\n- Full ledger: [selection](https://github.com/paladini/harness-maturity-analysis/blob/codex/agriculture-software-popularity-500-2026-10-13/corpus/selection-2026-10-13-agriculture-software-popularity-500.json); [discovery snapshot](https://github.com/paladini/harness-maturity-analysis/blob/codex/agriculture-software-popularity-500-2026-10-13/corpus/popularity-search-2026-10-13-agriculture-software.json).\n\n## Selected projects\n\n|Repository|GitHub ID|Stars|Exact commit|Pinned README>implementation|\n|---|---:|---:|---|---|\n${table}\n\n## Acceptance\n\n- [ ] Freeze exactly 500 new canonical identities and pins before scanning.\n- [ ] Add 500 matching \`${selection.scanner}\` reports and one append-only full-corpus history snapshot.\n- [ ] Regenerate results and site; preserve baseline pins, reports, and history.\n- [ ] Review the complete diff and green CI on the final PR head; merge after review.\n- [ ] Import from the immutable merged Analysis commit; preserve Showcase community records and old snapshots.\n- [ ] Merge the Showcase PR and verify public data and deployment.\n`;
writeFileSync(new URL('./issue-agriculture-software-popularity-500.md', dirUrl), body, 'utf8');
console.log(JSON.stringify({ selected: chosen.length, replacements: chosen.filter((row) => !seenIds.has(row.canonicalId)).length, newEvidenceAudits: newlyAudited, bodyChars: body.length, ledger: 'corpus/selection-2026-10-13-agriculture-software-popularity-500.json' }, null, 2));
