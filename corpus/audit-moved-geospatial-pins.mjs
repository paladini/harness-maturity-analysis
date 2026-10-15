#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scrubTokens = (value) =>
  value?.replace(/\b(?:pk|sk)\.[A-Za-z0-9_-]{20,}\b/g, '[redacted-mapbox-token]') ?? value;
const auditPath = path.join(root, 'corpus', 'content-audit-2026-10-14-geospatial-mapping.json');
const pinsPath = path.join(root, 'corpus', 'pin-audit-2026-10-14-geospatial-mapping.json');
const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
const pins = JSON.parse(readFileSync(pinsPath, 'utf8'));
const moved = pins.results.filter((repo) => repo.movedSinceDiscovery);
const geoPattern =
  /\b(geospatial|geograph(?:ic|y)|\bgis\b|cartograph\w*|openstreetmap|\bosm\b|geojson|raster|vector tiles|map tiles|mapbox|leaflet|openlayers|qgis|gdal|geocod\w*|routing|remote sensing|satellite imagery|terrain|location-based|slippy maps?|spatial data|spatial database|coordinates?|\bslam\b|lidar|odometry|locali[sz]ation|navigation)\b/i;
const codePattern =
  /\.(?:c|cc|cpp|cxx|h|hpp|cs|go|java|js|jsx|mjs|cjs|py|rs|rb|php|ts|tsx|swift|kt|kts|vue|svelte|dart|ex|exs|scala|clj|cljs|r|jl|lua|pl|pm|sql|sol|zig|elm|hs|ml|fs|fsx|vb|pas|m|mm)$/i;
const badRootFile =
  /^(setup|configure|compose|docker|eslint|prettier|babel|webpack|rollup|vite|jest|vitest|tsconfig|postcss|tailwind|stylelint|commitlint|lint-staged|release|publish|deploy|install|uninstall)(\.|$)/i;

function graphql(query) {
  const raw = execFileSync('rtk', ['gh', 'api', 'graphql', '-f', `query=${query}`], {
    encoding: 'utf8',
    maxBuffer: 6 * 1024 * 1024,
    timeout: 90_000,
  });
  const response = JSON.parse(raw);
  if (response.errors?.length) throw new Error(JSON.stringify(response.errors));
  return response.data;
}

const query = `query { ${moved
  .map((candidate, i) => {
    const [owner, name] = candidate.fullName.split('/');
    return `r${i}: repository(owner:"${owner}",name:"${name}") { databaseId nameWithOwner isFork isArchived readme: object(expression:"${candidate.commit}:README.md") { ... on Blob { oid text isTruncated } } root: object(expression:"${candidate.commit}:") { ... on Tree { entries { name type oid } } } }`;
  })
  .join(' ')} }`;
const data = graphql(query);
const results = [];
for (const [i, pin] of moved.entries()) {
  const repo = data[`r${i}`];
  const entry = audit.audited.find((candidate) => Number(candidate.databaseId) === Number(pin.databaseId));
  const readme = repo?.readme;
  const text = readme?.text ?? '';
  const entries = repo?.root?.entries ?? [];
  const file = entries.find(
    (item) =>
      item.type?.toLowerCase() === 'blob' &&
      !item.name.startsWith('.') &&
      item.name.toLowerCase() !== '__init__.py' &&
      !item.name.toLowerCase().endsWith('.d.ts') &&
      !badRootFile.test(item.name) &&
      codePattern.test(item.name),
  );
  const dir = entries.find(
    (item) =>
      item.type?.toLowerCase() === 'tree' &&
      /^(src|lib|app|apps|cmd|pkg|packages|client|server|core|Sources|source|web|frontend|backend|modules|PathPlanning|SLAM|AerialNavigation|Mapping|Navigation|Routing|Geospatial)$/i.test(
        item.name,
      ),
  );
  const impl = file
    ? { path: file.name, blobSha: file.oid, kind: 'root-file' }
    : dir
      ? { path: dir.name, treeSha: dir.oid, kind: 'source-directory' }
      : null;
  const reasons = [];
  if (!repo || Number(repo.databaseId) !== Number(pin.databaseId))
    reasons.push('canonical-repository-unavailable-at-refreshed-pin');
  if (repo?.isFork) reasons.push('fork');
  if (repo?.isArchived) reasons.push('archived');
  if (!readme?.oid || readme.isTruncated || text.trim().length < 250)
    reasons.push('missing-or-truncated-pinned-readme');
  if (!geoPattern.test(`${entry?.description ?? ''}\n${text.slice(0, 2400)}`))
    reasons.push('refreshed-readme-no-longer-establishes-geospatial-purpose');
  if (!impl) reasons.push('no-implementation-file-or-recognized-source-directory-at-refreshed-pin');
  if (!entry) throw new Error(`No content audit for ${pin.fullName}`);
  entry.commit = pin.commit;
  entry.defaultBranch = pin.branch;
  entry.archived = Boolean(repo?.isArchived);
  entry.readme = readme?.oid
    ? {
        path: 'README.md',
        blobSha: readme.oid,
        url: `https://github.com/${pin.fullName}/blob/${pin.commit}/README.md`,
        excerpt: scrubTokens(text.slice(0, 4000)),
      }
    : null;
  entry.implementation = impl;
  entry.approved = reasons.length === 0;
  entry.rejectionReasons = reasons;
  results.push({
    databaseId: pin.databaseId,
    fullName: pin.fullName,
    commit: pin.commit,
    approved: entry.approved,
    rejectionReasons: reasons,
  });
}
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    { refreshedPins: results.length, rejected: results.filter((entry) => !entry.approved), results },
    null,
    2,
  ),
);
