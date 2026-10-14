#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const discoveryPath = path.join(root, 'corpus', 'popularity-search-2026-10-14-geospatial-mapping.json');
const identityPath = path.join(root, 'corpus', 'canonical-identity-inventory-2026-10-14.json');
const outputPath = path.join(root, 'corpus', 'content-audit-2026-10-14-geospatial-mapping.json');
const scrubTokens = (value) => value?.replace(/\b(?:pk|sk)\.[A-Za-z0-9_-]{20,}\b/g, '[redacted-mapbox-token]') ?? value;
const discovery = JSON.parse(readFileSync(discoveryPath, 'utf8'));
const identity = JSON.parse(readFileSync(identityPath, 'utf8'));
const baselineIds = new Set(identity.repositories.map((repo) => String(repo.databaseId)).filter((id) => id !== 'null'));
const baselineAliases = new Set(identity.repositories.map((repo) => repo.slug.toLowerCase()));
const excludedByIdentity = discovery.candidates.filter((repo) =>
  baselineIds.has(String(repo.id)) || baselineAliases.has(repo.fullName.toLowerCase()),
);
const shortlist = discovery.candidates
  .filter((repo) => !baselineIds.has(String(repo.id)) && !baselineAliases.has(repo.fullName.toLowerCase()))
  .sort((a, b) => b.stars - a.stars)
  .slice(0, 3800);
const prior = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, 'utf8')) : null;
const auditedById = new Map((prior?.auditPolicyVersion === 3 ? prior.audited : []).map((repo) => [String(repo.databaseId), repo]));

function save() {
  const result = {
    schemaVersion: 1,
    auditPolicyVersion: 3,
    roundId: 'geospatial-mapping-popularity-1000',
    capturedAt: prior?.capturedAt ?? new Date().toISOString(),
    sourceDiscovery: 'corpus/popularity-search-2026-10-14-geospatial-mapping.json',
    sourceIdentityInventory: 'corpus/canonical-identity-inventory-2026-10-14.json',
    baseline: { canonicalIds: baselineIds.size, aliases: baselineAliases.size },
    candidatePool: discovery.candidates.length,
    candidatesExcludedByIdentity: excludedByIdentity.map((repo) => ({ id: repo.id, fullName: repo.fullName })),
    auditedSearchUnionPrefix: shortlist.length,
    audited: [...auditedById.values()].sort((a, b) => b.stars - a.stars),
  };
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return result;
}

function graphql(query) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const raw = execFileSync('rtk', ['gh', 'api', 'graphql', '-f', `query=${query}`], {
        encoding: 'utf8', maxBuffer: 24 * 1024 * 1024, timeout: 90_000,
      });
      const response = JSON.parse(raw);
      if (response.errors?.length) throw new Error(JSON.stringify(response.errors));
      return response.data;
    } catch (error) {
      lastError = error;
      if (!/HTTP 5\d\d|timeout|timed out|unexpected end of JSON|JSON input/i.test(`${error.stderr ?? ''} ${error.message ?? ''}`) || attempt === 5) throw error;
      const delay = 2000 * (attempt + 1);
      console.log(`Transient GitHub failure; retrying after ${delay}ms.`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
    }
  }
  throw lastError;
}

const codePattern = /\.(?:c|cc|cpp|cxx|h|hpp|cs|go|java|js|jsx|mjs|cjs|py|rs|rb|php|ts|tsx|swift|kt|kts|vue|svelte|dart|ex|exs|scala|clj|cljs|r|jl|lua|pl|pm|sh|sql|sol|zig|elm|hs|ml|fs|fsx|vb|pas|m|mm)$/i;
const geoPattern = /\b(geospatial|geograph(?:ic|y)|\bgis\b|cartograph\w*|openstreetmap|\bosm\b|geojson|raster|vector tiles|map tiles|mapbox|leaflet|openlayers|qgis|gdal|geocod\w*|routing|remote sensing|satellite imagery|terrain|location-based|slippy maps?|spatial data|spatial database|coordinates?|\bslam\b|lidar|odometry|locali[sz]ation|navigation)\b/i;
const listPattern = /(^|\n)\s{0,3}(?:#\s*)?(?:awesome|curated list|list of|collection of|resources for|awesome list)\b/i;
const educationPattern = /\b(?:course|tutorial|textbook|lecture notes|workshop materials|educational materials|learning path|study guide|thesis|dissertation|research paper|benchmark dataset|training dataset)\b/i;
const softwarePattern = /\b(?:library|framework|application|app|tool|platform|server|engine|cli|command.?line|sdk|api|plugin|extension|editor|visuali[sz](?:e|ation)|render(?:er|ing)?|process(?:ing)?|analy[sz](?:e|is)|convert(?:er)?|parse(?:r)?|query|build|create|generate|deploy|self.?hosted|open.?source)\b/i;

function rootImplementation(entries) {
  const files = entries.filter((entry) => entry.type?.toLowerCase() === 'blob'
    && !entry.name.startsWith('.') && entry.name.toLowerCase() !== '__init__.py'
    && !entry.name.toLowerCase().endsWith('.d.ts')
    && !/^(setup|configure|compose|docker|eslint|prettier|babel|webpack|rollup|vite|jest|vitest|tsconfig|postcss|tailwind|stylelint|commitlint|lint-staged|release|publish|deploy|install|uninstall)(\.|$)/i.test(entry.name));
  const file = files.find((entry) => codePattern.test(entry.name));
  if (file) return { path: file.name, blobSha: file.oid, kind: 'root-file' };
  const directory = entries.find((entry) => entry.type?.toLowerCase() === 'tree' &&
    /^(src|lib|app|apps|cmd|pkg|packages|client|server|core|Sources|source|web|frontend|backend|modules|PathPlanning|SLAM|AerialNavigation|Mapping|Navigation|Routing|Geospatial)$/i.test(entry.name));
  return directory ? { path: directory.name, treeSha: directory.oid, kind: 'source-directory' } : null;
}

function makeQuery(batch) {
  return `query { ${batch.map((candidate, i) => {
    const [owner, name] = candidate.fullName.split('/');
    if (!owner || !name || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) {
      throw new Error(`unexpected GitHub slug: ${candidate.fullName}`);
    }
    const commit = candidate.searchCommit;
    return `r${i}: repository(owner:"${owner}",name:"${name}") { databaseId nameWithOwner isFork isArchived readme: object(expression:"${commit}:README.md") { ... on Blob { oid text isTruncated } } root: object(expression:"${commit}:") { ... on Tree { entries { name type oid } } } }`;
  }).join(' ')} }`;
}

const batchSize = 20;
for (let offset = 0; offset < shortlist.length; offset += batchSize) {
  const batch = shortlist.slice(offset, offset + batchSize).filter((candidate) => !auditedById.has(String(candidate.id)));
  if (batch.length === 0) continue;
  console.log(`Auditing pinned README and root tree for candidates ${offset + 1}-${Math.min(offset + batchSize, shortlist.length)} of ${shortlist.length}`);
  const data = graphql(makeQuery(batch));
  batch.forEach((candidate, i) => {
    const repo = data[`r${i}`];
    const readme = repo?.readme;
    const entries = repo?.root?.entries ?? [];
    const text = readme?.text ?? '';
    const impl = rootImplementation(entries);
    const textTrimmed = text.slice(0, 4000);
    const introduction = text.slice(0, 2400);
    const description = scrubTokens(candidate.description ?? '');
    const reasons = [];
    if (!repo) reasons.push('repository-missing-at-search-captured-name');
    if (repo && Number(repo.databaseId) !== Number(candidate.id)) reasons.push('canonical-id-changed-since-discovery');
    if (repo?.isFork) reasons.push('fork');
    if (repo?.isArchived) reasons.push('archived');
    if (!readme?.oid || readme.isTruncated) reasons.push('missing-or-truncated-pinned-readme');
    if (text.trim().length < 250) reasons.push('readme-too-short-to-establish-purpose');
    if (!geoPattern.test(`${description}\n${introduction}`)) reasons.push('pinned-description-and-readme-introduction-do-not-establish-geospatial-purpose');
    if (listPattern.test(textTrimmed)) reasons.push('list-or-collection-only');
    if (educationPattern.test(textTrimmed) && !softwarePattern.test(textTrimmed)) reasons.push('education-or-data-only');
    if (!impl) reasons.push('no-root-implementation-file-or-recognized-source-directory');
    const approved = reasons.length === 0;
    auditedById.set(String(candidate.id), {
      databaseId: candidate.id,
      fullName: repo?.nameWithOwner ?? candidate.fullName,
      repoUrl: candidate.cloneUrl,
      htmlUrl: candidate.htmlUrl,
      stars: candidate.stars,
      description,
      selectionQueries: candidate.queries,
      defaultBranch: candidate.defaultBranch,
      commit: candidate.searchCommit,
      language: candidate.language,
      license: candidate.license,
      archived: Boolean(repo?.isArchived),
      readme: readme?.oid ? {
        path: 'README.md', blobSha: readme.oid,
        url: `https://github.com/${candidate.fullName}/blob/${candidate.searchCommit}/README.md`,
        excerpt: scrubTokens(textTrimmed),
      } : null,
      implementation: impl,
      approved,
      rejectionReasons: reasons,
    });
  });
  save();
}

const final = save();
const approved = final.audited.filter((repo) => repo.approved);
console.log(JSON.stringify({
  audited: final.audited.length,
  approvedCount: approved.length,
  activeApproved: approved.filter((repo) => !repo.archived).length,
  examples: approved.slice(0, 10).map((repo) => ({ fullName: repo.fullName, stars: repo.stars })),
  output: outputPath,
}, null, 2));
